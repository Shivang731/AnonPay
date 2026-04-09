import assert from 'node:assert/strict';
import crypto from 'node:crypto';

const API_URL = process.env.API_URL || 'http://127.0.0.1:4000/api';

const merchantAddress = 'at1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqtestmerchant';

const bytesToHex = (bytes) =>
    Array.from(bytes).map((byte) => byte.toString(16).padStart(2, '0')).join('');

const hexToBytes = (hex) => {
    const clean = String(hex || '').replace(/^0x/, '');
    const bytes = new Uint8Array(clean.length / 2);
    for (let i = 0; i < clean.length; i += 2) {
        bytes[i / 2] = Number.parseInt(clean.slice(i, i + 2), 16);
    }
    return bytes;
};

const computeInvoiceHash = async (address, amountMicro, saltHex) => {
    const merchantBytes = new TextEncoder().encode(address);
    const amountBytes = new Uint8Array(8);
    new DataView(amountBytes.buffer).setBigUint64(0, BigInt(amountMicro), true);
    const saltBytes = hexToBytes(saltHex);

    const combined = new Uint8Array(merchantBytes.length + amountBytes.length + saltBytes.length);
    combined.set(merchantBytes, 0);
    combined.set(amountBytes, merchantBytes.length);
    combined.set(saltBytes, merchantBytes.length + amountBytes.length);

    const digest = await crypto.webcrypto.subtle.digest('SHA-256', combined);
    return bytesToHex(new Uint8Array(digest));
};

const randomSaltHex = () => bytesToHex(crypto.randomBytes(16));

const request = async (path, options = {}) => {
    const response = await fetch(`${API_URL}${path}`, options);
    const text = await response.text();
    const payload = text ? JSON.parse(text) : null;

    if (!response.ok) {
        throw new Error(`${options.method || 'GET'} ${path} failed (${response.status}): ${payload?.error || text}`);
    }

    return payload;
};

const createInvoice = async ({ invoiceId, invoiceType, amount, saltHex }) => {
    const amountMicro = invoiceType === 2 ? 0 : Math.round(amount * 1_000_000);
    const invoiceHash = await computeInvoiceHash(merchantAddress, amountMicro, saltHex);

    const payload = await request('/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            invoice_id: invoiceId,
            invoice_hash: invoiceHash,
            merchant_address: merchantAddress,
            designated_address: merchantAddress,
            amount,
            memo: `codex-test-${invoiceId}`,
            status: 'PENDING',
            salt: saltHex,
            invoice_type: invoiceType,
            token_type: 0,
        }),
    });

    return { ...payload, invoice_hash: invoiceHash };
};

const patchInvoice = async (hash, patch) =>
    request(`/invoices/${hash}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
    });

const lookup = async (value) =>
    request(`/invoices/lookup?q=${encodeURIComponent(value)}`);

const verify = async (hash) =>
    request(`/invoices/${hash}/verify`);

const run = async () => {
    const suffix = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;

    const standard = await createInvoice({
        invoiceId: `std-${suffix}`,
        invoiceType: 0,
        amount: 12.5,
        saltHex: randomSaltHex(),
    });

    await patchInvoice(standard.invoice_hash, {
        status: 'SETTLED',
        payment_tx_ids: ['tx-standard-1'],
        payment_receipts: [
            {
                receiptHash: 'rcpt-standard-1',
                txId: 'tx-standard-1',
                amount: 12_500_000,
                tokenType: 0,
                timestamp: Date.now(),
            },
        ],
        receipt_commitment: 'rcpt-standard-1',
    });

    const standardVerify = await verify(standard.invoice_hash);
    assert.equal(standardVerify.commitment_matches, true);
    assert.equal(standardVerify.status, 'SETTLED');
    assert.equal(standardVerify.payment_tx_count, 1);
    assert.equal(standardVerify.has_settlement_proof, true);

    const standardLookupByHash = await lookup(standard.invoice_hash);
    assert.equal(standardLookupByHash.match_type, 'invoice_hash');
    const standardLookupById = await lookup(`std-${suffix}`);
    assert.equal(standardLookupById.match_type, 'invoice_id');
    const standardLookupByTx = await lookup('tx-standard-1');
    assert.equal(standardLookupByTx.match_type, 'payment_tx_id');
    const standardLookupByReceipt = await lookup('rcpt-standard-1');
    assert.equal(standardLookupByReceipt.match_type, 'receipt_hash');

    const multipay = await createInvoice({
        invoiceId: `multi-${suffix}`,
        invoiceType: 1,
        amount: 5,
        saltHex: randomSaltHex(),
    });

    await patchInvoice(multipay.invoice_hash, {
        payment_tx_ids: ['tx-multi-1'],
        payment_receipts: [
            {
                receiptHash: 'rcpt-multi-1',
                txId: 'tx-multi-1',
                amount: 5_000_000,
                tokenType: 0,
                timestamp: Date.now(),
            },
        ],
    });

    await patchInvoice(multipay.invoice_hash, {
        payment_tx_ids: ['tx-multi-2'],
        payment_receipts: [
            {
                receiptHash: 'rcpt-multi-2',
                txId: 'tx-multi-2',
                amount: 5_000_000,
                tokenType: 0,
                timestamp: Date.now(),
            },
        ],
    });

    const multipayVerify = await verify(multipay.invoice_hash);
    assert.equal(multipayVerify.commitment_matches, true);
    assert.equal(multipayVerify.payment_tx_count, 2);
    assert.equal(multipayVerify.has_settlement_proof, true);

    const multipayLookupByTx = await lookup('tx-multi-2');
    assert.equal(multipayLookupByTx.invoice.invoice_hash, multipay.invoice_hash);
    const multipayLookupByReceipt = await lookup('rcpt-multi-2');
    assert.equal(multipayLookupByReceipt.invoice.invoice_hash, multipay.invoice_hash);

    const donation = await createInvoice({
        invoiceId: `donation-${suffix}`,
        invoiceType: 2,
        amount: 0,
        saltHex: randomSaltHex(),
    });

    await patchInvoice(donation.invoice_hash, {
        payment_tx_ids: ['tx-donation-1'],
        payment_receipts: [
            {
                receiptHash: 'rcpt-donation-1',
                txId: 'tx-donation-1',
                amount: 3_500_000,
                tokenType: 0,
                timestamp: Date.now(),
            },
        ],
    });

    await patchInvoice(donation.invoice_hash, {
        payment_tx_ids: ['tx-donation-2'],
        payment_receipts: [
            {
                receiptHash: 'rcpt-donation-2',
                txId: 'tx-donation-2',
                amount: 7_250_000,
                tokenType: 0,
                timestamp: Date.now(),
            },
        ],
    });

    const donationVerify = await verify(donation.invoice_hash);
    assert.equal(donationVerify.commitment_matches, true);
    assert.equal(donationVerify.payment_tx_count, 2);
    assert.equal(donationVerify.has_settlement_proof, true);

    const donationLookupById = await lookup(`donation-${suffix}`);
    assert.equal(donationLookupById.match_type, 'invoice_id');
    const donationLookupByReceipt = await lookup('rcpt-donation-2');
    assert.equal(donationLookupByReceipt.invoice.invoice_hash, donation.invoice_hash);

    console.log(JSON.stringify({
        ok: true,
        standard: {
            hash: standard.invoice_hash,
            verify: standardVerify,
        },
        multipay: {
            hash: multipay.invoice_hash,
            verify: multipayVerify,
        },
        donation: {
            hash: donation.invoice_hash,
            verify: donationVerify,
        },
    }, null, 2));
};

run().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
