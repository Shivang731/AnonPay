import type { CheckoutSession } from '../pages/Checkout/types';
import type { Invoice } from '../services/api';

export interface PaymentLinkOptions {
    baseUrl?: string;
    amountOverride?: number;
    tokenOverride?: string;
}

const resolveBaseUrl = (baseUrl?: string) => {
    if (baseUrl) {
        return baseUrl.replace(/\/+$/, '');
    }

    if (typeof window !== 'undefined' && window.location?.origin) {
        return window.location.origin;
    }

    return 'http://localhost:5173';
};

const resolveInvoiceType = (invoiceType?: number) => {
    if (invoiceType === 2) return 'donation';
    if (invoiceType === 1) return 'multipay';
    return 'standard';
};

export const buildPaymentLinkFromCheckoutSession = (
    session: CheckoutSession,
    options: PaymentLinkOptions = {},
) => {
    const amount = options.amountOverride ?? session.amount;
    const params = new URLSearchParams({
        hash: session.invoice_hash,
        salt: session.salt || '',
        amount: `${Math.round((Number(amount) || 0) * 1_000_000)}u64`,
        type: resolveInvoiceType(session.invoice_type),
        session_id: session.id,
    });

    const merchantAddress = session.merchant_address || session.merchants?.midnight_address;
    if (merchantAddress) {
        params.set('merchant', merchantAddress);
    }

    if (options.tokenOverride) {
        params.set('token', options.tokenOverride.toLowerCase());
    }

    return `${resolveBaseUrl(options.baseUrl)}/pay?${params.toString()}`;
};

export const buildPaymentLinkFromInvoiceRecord = (
    invoice: Pick<Invoice, 'invoice_hash' | 'salt' | 'amount' | 'invoice_type' | 'designated_address' | 'merchant_address'>,
    options: PaymentLinkOptions = {},
) => {
    const amount = options.amountOverride ?? (Number(invoice.amount) || 0);
    const params = new URLSearchParams({
        hash: invoice.invoice_hash,
        salt: invoice.salt || '',
        amount: `${Math.round(amount * 1_000_000)}u64`,
        type: resolveInvoiceType(invoice.invoice_type),
    });

    const merchantAddress = invoice.designated_address || invoice.merchant_address;
    if (merchantAddress) {
        params.set('merchant', merchantAddress);
    }

    if (options.tokenOverride) {
        params.set('token', options.tokenOverride.toLowerCase());
    }

    return `${resolveBaseUrl(options.baseUrl)}/pay?${params.toString()}`;
};
