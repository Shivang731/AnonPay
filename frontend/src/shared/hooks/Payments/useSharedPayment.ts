import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMidnightWallet } from '../Wallet/WalletProvider';
import { useWalletErrorHandler } from '../Wallet/WalletErrorBoundary';
import type { PaymentStep, InvoiceState } from './types';
import { createClient } from '@supabase/supabase-js';
import {
    buildCircuitContext,
    computeInvoiceHash,
    hexToBytes,
    bytesToHex,
    bytesToFieldString,
    generateSalt,
    CONTRACT_ADDRESS,
} from '../../utils/midnight-utils';
import { Contract, InvoiceStatus } from '../../../contract';
import { API_URL } from '../../config/api';
import { persistPayerReceipt } from '../../utils/receipts';
import type { Invoice } from '../../services/api';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
export const useSharedPayment = () => {
    const [searchParams] = useSearchParams();
    const { connectedApi, isConnected, walletAddress } = useMidnightWallet();
    const { handleWalletError } = useWalletErrorHandler();
    const [invoice, setInvoice] = useState<InvoiceState | null>(null);
    const [donationAmount, setDonationAmount] = useState<string>('');
    const [status, setStatus] = useState<string>('Initializing...');
    const [step, setStep] = useState<PaymentStep>('CONNECT');
    const [loading, setLoading] = useState(false);
    const [txId, setTxId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    const isPlainAddress = (value?: string | null) =>
        !!value && !value.includes(':') && !value.includes(' ');

    const toMicroUnits = (value?: string | number | null) =>
        BigInt(Math.round((Number(value) || 0) * 1_000_000));

    const pollResolvedInvoiceId = async (invoiceHash: string, invoiceTransactionId: string) => {
        for (let attempt = 0; attempt < 20; attempt += 1) {
            const response = await fetch(`${API_URL}/mcp/relay/resolve-invoice`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    invoice_hash: invoiceHash,
                    invoice_transaction_id: invoiceTransactionId,
                }),
            });

            if (response.ok) {
                const payload = await response.json();
                if (payload?.invoice_id) {
                    return String(payload.invoice_id);
                }
            }

            await wait(1500);
        }

        throw new Error('Timed out waiting for Midnight to finalize the payment invoice.');
    };

    const createOneTimePaymentInvoice = async (
        parentInvoice: InvoiceState,
        amount: number,
    ) => {
        if (!parentInvoice.merchantAddress) {
            throw new Error('Missing merchant address for reusable invoice payment.');
        }

        const saltBytes = generateSalt();
        const saltHex = bytesToHex(saltBytes);
        const saltField = bytesToFieldString(saltBytes);
        const amountMicro = BigInt(Math.round(amount * 1_000_000));
        const invoiceHashHex = bytesToHex(
            await computeInvoiceHash(parentInvoice.merchantAddress, amountMicro, saltBytes),
        );

        const relayResponse = await fetch(`${API_URL}/mcp/relay/create-invoice`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                merchant_address: parentInvoice.merchantAddress,
                amount,
                currency: 'TDUST',
                salt: saltField,
                memo: parentInvoice.memo || '',
                invoice_type: 0,
            }),
        });

        if (!relayResponse.ok) {
            const payload = await relayResponse.json().catch(() => ({}));
            throw new Error(payload.error || 'Failed to create reusable payment invoice.');
        }

        const relayPayload = await relayResponse.json();
        const invoiceId = await pollResolvedInvoiceId(invoiceHashHex, relayPayload.tx_id);

        return {
            invoiceId,
            invoiceHash: invoiceHashHex,
            saltHex,
            creationTxId: relayPayload.tx_id as string,
        };
    };

    const appendReceiptToReusableInvoice = async (
        parentInvoice: InvoiceState,
        receiptHash: string,
        txId: string,
        amountMicro: number,
    ) => {
        const { updateInvoiceStatus } = await import('../../services/api');
        const dbInvoice = await fetchDbInvoice(parentInvoice.hash);
        if (!dbInvoice) {
            throw new Error('Failed to reload parent invoice before recording receipt.');
        }

        const currentPaymentIds = Array.isArray(dbInvoice.payment_tx_ids) ? dbInvoice.payment_tx_ids : [];
        const nextPaymentIds = Array.from(new Set([...currentPaymentIds, txId]));
        const existingReceipts = Array.isArray(dbInvoice.payment_receipts) ? dbInvoice.payment_receipts : [];
        const nextReceipts = existingReceipts.some((entry) => entry.receiptHash === receiptHash)
            ? existingReceipts
            : [
                ...existingReceipts,
                {
                    receiptHash,
                    txId,
                    amount: amountMicro,
                    tokenType: parentInvoice.tokenType,
                    timestamp: Date.now(),
                },
            ];

        await updateInvoiceStatus(parentInvoice.hash, {
            payment_tx_ids: nextPaymentIds,
            payment_receipts: nextReceipts,
        });
    };

    const fetchDbInvoice = async (hash: string): Promise<Invoice | null> => {
        try {
            const { fetchInvoiceByHash } = await import('../../services/api');
            return await fetchInvoiceByHash(hash);
        } catch (error) {
            return null;
        }
    };

    const resolveInvoiceId = async (invoiceHash: string, currentInvoiceId?: string) => {
        if (currentInvoiceId) {
            return { invoiceId: currentInvoiceId, dbInvoice: null as Invoice | null };
        }

        for (let attempt = 0; attempt < 8; attempt += 1) {
            const dbInvoice = await fetchDbInvoice(invoiceHash);
            if (dbInvoice?.invoice_id) {
                return { invoiceId: dbInvoice.invoice_id, dbInvoice };
            }
            await wait(1500);
        }

        return { invoiceId: undefined, dbInvoice: null as Invoice | null };
    };

    useEffect(() => {
        const init = async () => {
            let merchant = searchParams.get('merchant');
            let amount = searchParams.get('amount');
            let salt = searchParams.get('salt');
            let hashParam = searchParams.get('hash');

            const memo = searchParams.get('memo') || '';
            const typeParam = searchParams.get('type');
            let initialType =
                typeParam === 'donation'
                    ? 2
                    : typeParam === 'multipay'
                      ? 1
                      : 0;
            const sessionId = searchParams.get('session_id');

            try {
                setLoading(true);
                setStatus('Verifying Invoice...');

                let fetchedHash: string | null = hashParam || null;
                let merchantAddressForVerification: string | null =
                    isPlainAddress(merchant) ? merchant : null;

                if (fetchedHash && (!merchant || !salt)) {
                    const dbInvoice = await fetchDbInvoice(fetchedHash);
                    if (dbInvoice) {
                        merchant =
                            dbInvoice.designated_address ||
                            dbInvoice.merchant_address ||
                            null;
                        merchantAddressForVerification =
                            merchantAddressForVerification ||
                            (isPlainAddress(dbInvoice.designated_address)
                                ? dbInvoice.designated_address!
                                : isPlainAddress(dbInvoice.merchant_address)
                                    ? dbInvoice.merchant_address
                                    : null);
                        salt = dbInvoice.salt || null;

                        const coercedAmount = dbInvoice.amount
                            ? dbInvoice.amount.toString()
                            : amount;
                        amount =
                            dbInvoice.invoice_type === 2
                                ? '0'
                                : coercedAmount || null;
                        initialType =
                            dbInvoice.invoice_type !== undefined
                                ? dbInvoice.invoice_type
                                : initialType;
                    } else {
                        console.warn(
                            'Could not fetch missing DB details for Hash-only link',
                            fetchedHash,
                        );
                    }
                }

                if (!merchant || !salt) {
                    if (!salt) {
                        setError('Invalid Invoice Link: Missing salt parameter');
                        setLoading(false);
                        return;
                    }
                }

                setError(null);

                if (!fetchedHash) {
                    if (!merchant) {
                        setError(
                            'Invalid Invoice Link: Missing merchant information needed to derive the invoice hash.',
                        );
                        setLoading(false);
                        return;
                    }

                    const saltBytes = hexToBytes(salt || '');
                    if (saltBytes.length === 0) {
                        setError('Invalid salt format.');
                        setLoading(false);
                        return;
                    }

                    let amountForHash = 0n;
                    if (amount) {
                        if (amount.includes('u')) {
                            const numericPart = amount.split('u')[0];
                            amountForHash = BigInt(numericPart || '0');
                        } else {
                            amountForHash = BigInt(
                                Math.round((Number(amount) || 0) * 1_000_000),
                            );
                        }
                    }

                    const derivedHash = await computeInvoiceHash(
                        merchant,
                        amountForHash,
                        saltBytes,
                    );
                    fetchedHash = bytesToHex(derivedHash);
                }

                const merchantLabel = merchant || 'Private Merchant';

                const dbInvoice = await fetchDbInvoice(fetchedHash);
                if (!dbInvoice) {
                    console.warn('Could not fetch DB details', fetchedHash);
                } else {
                    merchantAddressForVerification =
                        merchantAddressForVerification ||
                        (isPlainAddress(dbInvoice?.designated_address)
                            ? dbInvoice.designated_address!
                            : isPlainAddress(dbInvoice?.merchant_address)
                                ? dbInvoice?.merchant_address
                                : null);
                }

                if (!amount && initialType !== 2 && dbInvoice?.amount === undefined) {
                    setError('Invalid Invoice Link: Missing amount');
                    setLoading(false);
                    return;
                }

                let finalAmount = 0;
                if (amount) {
                    if (amount.includes('u')) {
                        const rawVal = parseFloat(amount.split('u')[0]);
                        if (!isNaN(rawVal)) finalAmount = rawVal / 1_000_000;
                    } else {
                        finalAmount = Number(amount) || 0;
                    }
                }

                if (dbInvoice && dbInvoice.amount !== undefined) {
                    finalAmount =
                        dbInvoice.invoice_type === 2
                            ? 0
                            : Number(dbInvoice.amount);
                }

                let hashMatches = false;
                let hashSource: 'query' | 'backend' | 'unverified' = 'unverified';

                if (fetchedHash && salt && merchantAddressForVerification) {
                    const expectedHash = bytesToHex(
                        await computeInvoiceHash(
                            merchantAddressForVerification,
                            (dbInvoice?.invoice_type ?? initialType) === 2
                                ? 0n
                                : toMicroUnits(dbInvoice?.amount ?? amount),
                            hexToBytes(salt),
                        ),
                    );

                    if (expectedHash !== fetchedHash) {
                        throw new Error('Invoice hash mismatch. This payment link does not match the stored invoice commitment.');
                    }

                    hashMatches = true;
                    hashSource = searchParams.get('merchant') ? 'query' : 'backend';
                }

                const isExpiredInvoice = !!dbInvoice && (
                    dbInvoice.status === 'EXPIRED' ||
                    (!!dbInvoice.expiry && Number(dbInvoice.expiry) * 1000 <= Date.now())
                );

                const verification = {
                    hashMatches,
                    hashSource,
                    backendStatus: (dbInvoice?.status || 'UNKNOWN') as 'PENDING' | 'SETTLED' | 'EXPIRED' | 'UNKNOWN',
                    onChainStatus: 'UNKNOWN' as const,
                    statusOpen: !dbInvoice || (!isExpiredInvoice && dbInvoice.status !== 'SETTLED'),
                };

                const isReusableInvoice =
                    !!dbInvoice && (dbInvoice.invoice_type === 1 || dbInvoice.invoice_type === 2);

                if (dbInvoice && dbInvoice.status === 'SETTLED' && !isReusableInvoice) {
                    if (dbInvoice.payment_tx_id) {
                        setTxId(dbInvoice.payment_tx_id);
                    }

                    setInvoice({
                        invoiceId: dbInvoice.invoice_id,
                        merchant: merchantLabel,
                        amount: finalAmount,
                        salt,
                        hash: fetchedHash!,
                        memo,
                        tokenType: 0,
                        invoiceType: initialType,
                        expiry: dbInvoice.expiry,
                        receiptCommitment: dbInvoice.receipt_commitment,
                        items: dbInvoice?.invoice_items || undefined,
                        sessionId: sessionId || undefined,
                        merchantAddress: merchantAddressForVerification || undefined,
                        verification,
                    });
                    setStep('ALREADY_PAID');
                    setLoading(false);
                    return;
                }

                if (isExpiredInvoice) {
                    setInvoice({
                        invoiceId: dbInvoice?.invoice_id,
                        merchant: merchantLabel,
                        amount: finalAmount,
                        salt,
                        hash: fetchedHash!,
                        memo,
                        tokenType: 0,
                        invoiceType: initialType,
                        expiry: dbInvoice?.expiry,
                        receiptCommitment: dbInvoice?.receipt_commitment,
                        items: dbInvoice?.invoice_items || undefined,
                        sessionId: sessionId || undefined,
                        merchantAddress: merchantAddressForVerification || undefined,
                        verification,
                    });
                    setStep('VERIFY');
                    setError('This invoice is expired.');
                    setLoading(false);
                    return;
                }

                setInvoice({
                    invoiceId: dbInvoice?.invoice_id,
                    merchant: merchantLabel,
                    amount: finalAmount,
                    salt,
                    hash: fetchedHash!,
                    memo,
                    tokenType: 0,
                    invoiceType: initialType,
                    expiry: dbInvoice?.expiry,
                    receiptCommitment: dbInvoice?.receipt_commitment,
                    items: dbInvoice?.invoice_items || undefined,
                    sessionId: sessionId || undefined,
                    merchantAddress: merchantAddressForVerification || undefined,
                    verification,
                });

                setStatus(
                    hashMatches
                        ? 'Invoice fetched, hash verified, and backend status confirmed.'
                        : 'Invoice fetched and backend status confirmed.',
                );
                if (isConnected) {
                    setStep('PAY');
                } else {
                    setStep('CONNECT');
                }
            } catch (err) {
                console.error(err);
                setError('Failed to verify invoice integrity.');
            } finally {
                setLoading(false);
            }
        };

        init();
    }, [searchParams, isConnected]);

    useEffect(() => {
        const sessionId = invoice?.sessionId;
        if (!sessionId || !supabaseUrl || !supabaseKey) return;

        const supabase = createClient(supabaseUrl, supabaseKey);

        const channel = supabase
            .channel(`intent_monitor_${sessionId}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'payment_intents',
                    filter: `id=eq.${sessionId}`,
                },
                async (payload) => {
                    const newStatus = payload.new.status;
                    if (newStatus === 'SETTLED') {
                        console.log(
                            `📡 [Real-Time] Payment Intent settled! Fetching session redirect URL...`,
                        );
                        setStep('SUCCESS');
                        setStatus('Payment Successful! Redirecting...');

                        try {
                            const response = await fetch(
                                `${API_URL}/checkout/sessions/${sessionId}`,
                            );
                            if (response.ok) {
                                const data = await response.json();
                                const redirectUrl = data.success_url;

                                if (redirectUrl) {
                                    console.log(
                                        `[useSharedPayment] Scheduling redirect to: ${redirectUrl} in 2 seconds...`,
                                    );
                                    setTimeout(() => {
                                        try {
                                            const url = new URL(
                                                redirectUrl as string,
                                            );
                                            url.searchParams.set(
                                                'session_id',
                                                sessionId,
                                            );
                                            window.location.href =
                                                url.toString();
                                        } catch (e) {
                                            window.location.href =
                                                (redirectUrl as string) +
                                                (redirectUrl.includes('?')
                                                    ? '&'
                                                    : '?') +
                                                `session_id=${sessionId}`;
                                        }
                                    }, 2000);
                                }
                            }
                        } catch (err) {
                            console.error(
                                'Failed to fetch session redirect url',
                                err,
                            );
                        }
                    }
                },
            )
            .subscribe();

        const intervalId = setInterval(async () => {
            try {
                const response = await fetch(
                    `${API_URL}/checkout/sessions/${sessionId}`,
                );
                if (response.ok) {
                    const data = await response.json();
                    if (data.status === 'SETTLED' && step !== 'SUCCESS') {
                        console.log(
                            `📡 [Polling] Payment Intent settled! Fetching session redirect URL...`,
                        );
                        setStep('SUCCESS');
                        setStatus('Payment Successful! Redirecting...');

                        const redirectUrl = data.success_url;
                        if (redirectUrl) {
                            console.log(
                                `[useSharedPayment] Scheduling redirect to: ${redirectUrl} in 2 seconds...`,
                            );
                            setTimeout(() => {
                                try {
                                    const url = new URL(redirectUrl as string);
                                    url.searchParams.set(
                                        'session_id',
                                        sessionId,
                                    );
                                    window.location.href = url.toString();
                                } catch (e) {
                                    window.location.href =
                                        (redirectUrl as string) +
                                        (redirectUrl.includes('?')
                                            ? '&'
                                            : '?') +
                                        `session_id=${sessionId}`;
                                }
                            }, 2000);
                        }
                    }
                }
            } catch (err) {}
        }, 3000);

        return () => {
            channel.unsubscribe();
            clearInterval(intervalId);
        };
    }, [invoice?.sessionId]);

    const pollTransaction = async (
        initialTxId: string,
        receiptCommitment?: string,
        paidAmountMicro?: number,
    ) => {
        let isPending = true;
        let attempts = 0;
        let onChainId = initialTxId;

        while (isPending && attempts < 120) {
            attempts++;
            await new Promise((r) => setTimeout(r, 1000));
            try {
                if (onChainId) {
                    setTxId(onChainId);
                }

                setStep('SUCCESS');
                setStatus('Payment Successful!');

                try {
                    const { updateInvoiceStatus } =
                        await import('../../services/api');
                    console.log('📝 [usePayment] Updating Invoice in DB...', {
                        onChainId,
                        invoiceHash: invoice?.hash,
                    });

                    const updatePayload: any = {
                        payment_tx_ids: onChainId,
                    };

                    if (receiptCommitment) {
                        updatePayload.receipt_commitment = receiptCommitment;
                    }

                    if (invoice?.sessionId) {
                        updatePayload.session_id = invoice.sessionId;
                    }

                    if (invoice?.hash) {
                        const currentDbInvoice = await fetchDbInvoice(
                            invoice.hash,
                        );
                        if (
                            currentDbInvoice &&
                            (currentDbInvoice.invoice_type === 1 ||
                                currentDbInvoice.invoice_type === 2)
                        ) {
                            console.log(
                                'ℹ️ Multi Pay / Donation Invoice detected. Keeping status as PENDING.',
                            );
                        } else {
                            updatePayload.status = 'SETTLED';
                        }
                        console.log(
                            '📤 Sending Update Payload:',
                            updatePayload,
                        );
                        await updateInvoiceStatus(
                            invoice.hash,
                            updatePayload,
                        );
                        if (receiptCommitment) {
                            persistPayerReceipt({
                                invoiceHash: invoice.hash,
                                amount: paidAmountMicro ?? Math.round(invoice.amount * 1_000_000),
                                tokenType: invoice.tokenType,
                                receiptHash: receiptCommitment,
                                timestamp: Date.now(),
                                txId: onChainId,
                            });
                        }
                        console.log('✅ DB Update Successful!');
                    }

                    if (invoice?.sessionId) {
                        try {
                            console.log(
                                `📢 [usePayment] Updating Checkout Session ${invoice.sessionId}`,
                            );
                            await fetch(
                                `${API_URL}/checkout/sessions/${invoice.sessionId}`,
                                {
                                    method: 'PATCH',
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({
                                        status: 'SETTLED',
                                        tx_id: onChainId,
                                    }),
                                },
                            );
                            console.log('✅ Checkout Session Updated!');
                        } catch (checkoutErr) {
                            console.error(
                                '❌ Failed to update checkout session:',
                                checkoutErr,
                            );
                        }
                    }
                } catch (dbErr) {
                    console.error('❌ DB Update Error:', dbErr);
                }

                isPending = false;
            } catch (err) {
                console.warn('Polling error:', err);
            }
        }
    };

    const handlePay = async () => {
        if (!invoice || !isConnected || !connectedApi || !walletAddress) {
            setError('Connect your Lace Wallet first.');
            return;
        }

        try {
            setLoading(true);
            setStatus('Fetching private invoice details...');

            let activeInvoiceId = invoice.invoiceId;
            let latestDbInvoice = null;

            if (!activeInvoiceId) {
                setStatus('Resolving on-chain invoice setup...');
                const resolved = await resolveInvoiceId(invoice.hash, invoice.invoiceId);
                activeInvoiceId = resolved.invoiceId;
                latestDbInvoice = resolved.dbInvoice;
            }

            if (!activeInvoiceId) {
                throw new Error('This invoice is still finalizing on Midnight. Retry in a few seconds.');
            }

            if (activeInvoiceId !== invoice.invoiceId) {
                setInvoice((current) => current ? { ...current, invoiceId: activeInvoiceId } : current);
            }

            const isDonationType =
                invoice.invoiceType === 2 || invoice.amount === 0;
            const parsedDonation = Number(donationAmount) || 0;
            const finalAmount =
                isDonationType && parsedDonation > 0
                    ? parsedDonation
                    : invoice.amount;
            if (finalAmount <= 0)
                throw new Error('Amount must be greater than zero.');

            const invoiceId = BigInt(activeInvoiceId);
            if (invoice.expiry && Number(invoice.expiry) * 1000 <= Date.now()) {
                throw new Error('This invoice has expired.');
            }

            setStatus('Verifying invoice integrity...');

            const dbInvoice = latestDbInvoice || await fetchDbInvoice(invoice.hash);
            if (!dbInvoice || dbInvoice.invoice_hash !== invoice.hash) {
                throw new Error('Invoice hash mismatch. Refusing to continue.');
            }
            if (dbInvoice.invoice_id && dbInvoice.invoice_id !== activeInvoiceId) {
                throw new Error('Invoice ID mismatch. Refusing to continue.');
            }
            const isReusableInvoice =
                dbInvoice.invoice_type === 1 || dbInvoice.invoice_type === 2;

            if (dbInvoice.status === 'SETTLED' && !isReusableInvoice) {
                setStep('ALREADY_PAID');
                throw new Error('This invoice is already settled.');
            }
            if (dbInvoice.expiry && Number(dbInvoice.expiry) * 1000 <= Date.now()) {
                throw new Error('This invoice has expired.');
            }

            if (invoice.merchantAddress && invoice.verification.hashSource !== 'unverified') {
                const expectedHash = bytesToHex(
                    await computeInvoiceHash(
                        invoice.merchantAddress,
                        invoice.invoiceType === 2 ? 0n : toMicroUnits(dbInvoice.amount),
                        hexToBytes(invoice.salt),
                    ),
                );
                if (expectedHash !== invoice.hash) {
                    throw new Error('Shielded payment aborted because the fetched invoice hash no longer matches the link commitment.');
                }
            }

            let payableInvoiceId = invoiceId;
            let parentInvoiceHash = invoice.hash;

            if (isReusableInvoice) {
                setStatus('Creating a one-time payment invoice for this reusable link...');
                const childInvoice = await createOneTimePaymentInvoice(invoice, finalAmount);
                payableInvoiceId = BigInt(childInvoice.invoiceId);
                setStatus('Reusable link prepared. Waiting for wallet approval...');
            }

            const payerSecretKey = crypto.getRandomValues(new Uint8Array(32));
            const payerNonce = crypto.getRandomValues(new Uint8Array(32));
            const contract = new Contract({
                secretKey: (ctx) => [ctx.privateState, payerSecretKey],
                payerNonce: (ctx) => [ctx.privateState, payerNonce],
            });
            const context = await buildCircuitContext(
                connectedApi,
                CONTRACT_ADDRESS,
                Contract,
            );

            try {
                const statusResult = await contract.circuits.get_invoice_status(
                    context,
                    payableInvoiceId,
                );
                if (statusResult.result === InvoiceStatus.PAID) {
                    setStep('ALREADY_PAID');
                    throw new Error('This invoice is already paid.');
                }
                if (statusResult.result === InvoiceStatus.EXPIRED) {
                    throw new Error('This invoice is expired.');
                }
                setInvoice((current) => current ? {
                    ...current,
                    verification: {
                        ...current.verification,
                        onChainStatus: 'OPEN',
                        statusOpen: true,
                    },
                } : current);
            } catch (statusError: any) {
                if (statusError instanceof Error && (
                    statusError.message === 'This invoice is already paid.' ||
                    statusError.message === 'This invoice is expired.'
                )) {
                    throw statusError;
                }
                console.warn('On-chain status check failed; proceeding with persisted invoice checks.', statusError);
                setInvoice((current) => current ? {
                    ...current,
                    verification: {
                        ...current.verification,
                        onChainStatus: 'UNKNOWN',
                    },
                } : current);
            }

            setStatus('Lace wallet approval required for shielded tDUST payment...');
            const result = await contract.circuits.pay_invoice(
                context,
                payableInvoiceId,
            );

            const receiptCommitmentBytes = (contract as any)._computeCommitment_0(
                0n,
                payerSecretKey,
                payerNonce,
            ) as Uint8Array;
            const receiptCommitment = bytesToHex(receiptCommitmentBytes);

            const resultTxId =
                result.result !== undefined && result.result !== null && String(result.result).length > 0
                    ? result.result.toString()
                    : 'pending';

            setTxId(resultTxId);
            setInvoice((current) => current ? {
                ...current,
                receiptCommitment,
                verification: {
                    ...current.verification,
                    onChainStatus: 'PAID',
                    backendStatus: 'SETTLED',
                    statusOpen: false,
                },
            } : current);
            setStatus('Shielded payment submitted. Waiting for Midnight confirmation...');

            const paidAmountMicro = Math.round(finalAmount * 1_000_000);

            if (isReusableInvoice) {
                await appendReceiptToReusableInvoice(
                    invoice,
                    receiptCommitment,
                    resultTxId,
                    paidAmountMicro,
                );
                persistPayerReceipt({
                    invoiceHash: parentInvoiceHash,
                    amount: paidAmountMicro,
                    tokenType: invoice.tokenType,
                    receiptHash: receiptCommitment,
                    timestamp: Date.now(),
                    txId: resultTxId,
                });
                setStep('SUCCESS');
                setStatus('Payment successful. The reusable link remains open for future payments.');

                if (invoice.sessionId) {
                    try {
                        await fetch(
                            `${API_URL}/checkout/sessions/${invoice.sessionId}`,
                            {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    status: 'SETTLED',
                                    tx_id: resultTxId,
                                }),
                            },
                        );
                    } catch (checkoutErr) {
                        console.error('❌ Failed to update checkout session:', checkoutErr);
                    }
                }
            } else {
                await pollTransaction(
                    resultTxId,
                    receiptCommitment,
                    paidAmountMicro,
                );
            }
        } catch (err: any) {
            if (handleWalletError(err)) return;
            console.error(err);
            setError(err.message || 'An error occurred during payment.');
        } finally {
            setLoading(false);
        }
    };

    const handleConnect = async () => {
        if (!isConnected) return;
        setStep('PAY');
    };

    return {
        invoice,
        donationAmount,
        setDonationAmount,
        status,
        setStatus,
        step,
        setStep,
        loading,
        setLoading,
        txId,
        setTxId,
        error,
        setError,
        publicKey: walletAddress,
        pollTransaction,
        handleConnect,
        handlePay,
    };
};
