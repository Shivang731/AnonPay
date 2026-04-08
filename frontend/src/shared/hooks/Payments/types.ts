export type PaymentStep = 'CONNECT' | 'VERIFY' | 'CONVERT' | 'PAY' | 'SUCCESS' | 'ALREADY_PAID';

export interface InvoiceVerificationState {
    hashMatches: boolean;
    hashSource: 'query' | 'backend' | 'unverified';
    backendStatus: 'PENDING' | 'SETTLED' | 'EXPIRED' | 'UNKNOWN';
    onChainStatus: 'OPEN' | 'PAID' | 'EXPIRED' | 'UNKNOWN';
    statusOpen: boolean;
}

export interface InvoiceState {
    invoiceId?: string;
    merchant: string;
    merchantAddress?: string;
    amount: number;
    salt: string;
    hash: string;
    memo: string;
    tokenType: number;
    invoiceType: number;
    expiry?: string;
    receiptCommitment?: string;
    items?: { name: string; quantity: number; unitPrice: number; total: number }[];
    sessionId?: string;
    verification: InvoiceVerificationState;
}
