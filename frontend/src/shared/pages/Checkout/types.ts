export interface CheckoutSession {
    id: string;
    amount: number;
    token_type: 'TDUST' | 'ANY';
    status: 'PENDING' | 'PROCESSING' | 'OPEN' | 'SETTLED' | 'FAILED';
    invoice_hash: string;
    salt: string;
    success_url?: string;
    cancel_url?: string;
    merchant_name?: string;
    merchant_address?: string;
    merchants?: {
        name: string;
        midnight_address: string;
    };
    invoice_type?: number;
}
