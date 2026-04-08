export interface DerivedInvoiceRecord {
    invoiceHash: string;
    amount: number;
    tokenType: number;
    invoiceType: number;
    owner: string;
    salt: string;
    memo?: string;
    walletType?: number;
}

export interface DerivedReceipt {
    invoiceHash: string;
    amount: number;
    tokenType: number;
    receiptHash: string;
    timestamp?: number;
}

export interface StoredPayerReceipt extends DerivedReceipt {
    txId?: string;
}

const PAYER_RECEIPTS_STORAGE_KEY = 'anonpay:payer-receipts';

export const normalizeInvoiceHash = (hash?: string | null) =>
    String(hash || '').replace(/field$/, '');

type InvoiceLike = {
    invoice_hash: string;
    payment_tx_ids?: string[];
    payment_tx_id?: string;
    receipt_commitment?: string;
    amount?: number;
    token_type?: number;
    updated_at?: string;
    created_at?: string;
    invoice_type?: number;
    designated_address?: string;
    merchant_address?: string;
    memo?: string;
    salt?: string;
    is_burner?: boolean;
};

export const getInvoicePaymentIds = (invoice: Pick<InvoiceLike, 'payment_tx_ids' | 'payment_tx_id'>): string[] => {
    if (Array.isArray(invoice.payment_tx_ids)) {
        return invoice.payment_tx_ids.filter(Boolean);
    }

    if (invoice.payment_tx_id) {
        return [invoice.payment_tx_id];
    }

    return [];
};

export const deriveInvoiceRecordFromDbInvoice = (invoice: InvoiceLike): DerivedInvoiceRecord => ({
    invoiceHash: normalizeInvoiceHash(invoice.invoice_hash),
    amount: Math.round((Number(invoice.amount) || 0) * 1_000_000),
    tokenType: invoice.token_type ?? 0,
    invoiceType: invoice.invoice_type ?? 0,
    owner: invoice.designated_address || invoice.merchant_address || '',
    salt: invoice.salt || '',
    memo: invoice.memo || '',
    walletType: invoice.is_burner ? 1 : 0,
});

export const deriveMerchantReceiptsFromInvoice = (invoice: InvoiceLike): DerivedReceipt[] => {
    const paymentIds = getInvoicePaymentIds(invoice);
    const receiptHashes = paymentIds.length > 0
        ? paymentIds
        : invoice.receipt_commitment
            ? [invoice.receipt_commitment]
            : [];

    if (receiptHashes.length === 0) {
        return [];
    }

    const totalAmountMicro = Math.round((Number(invoice.amount) || 0) * 1_000_000);
    const amountPerReceipt = receiptHashes.length > 1 && totalAmountMicro > 0
        ? Math.round(totalAmountMicro / receiptHashes.length)
        : totalAmountMicro;
    const timestamp = Date.parse(invoice.updated_at || invoice.created_at || '') || Date.now();

    return receiptHashes.map((receiptHash) => ({
        invoiceHash: normalizeInvoiceHash(invoice.invoice_hash),
        amount: amountPerReceipt,
        tokenType: invoice.token_type ?? 0,
        receiptHash,
        timestamp,
    }));
};

export const readStoredPayerReceipts = (): StoredPayerReceipt[] => {
    if (typeof window === 'undefined') {
        return [];
    }

    try {
        const raw = window.localStorage.getItem(PAYER_RECEIPTS_STORAGE_KEY);
        if (!raw) {
            return [];
        }

        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
};

export const persistPayerReceipt = (receipt: StoredPayerReceipt) => {
    if (typeof window === 'undefined') {
        return;
    }

    const existing = readStoredPayerReceipts();
    const deduped = existing.filter((entry) => entry.receiptHash !== receipt.receiptHash);
    deduped.unshift(receipt);
    window.localStorage.setItem(
        PAYER_RECEIPTS_STORAGE_KEY,
        JSON.stringify(deduped.slice(0, 250)),
    );
};
