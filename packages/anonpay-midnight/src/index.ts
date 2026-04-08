export const ANONPAY_NETWORK = 'midnight';

export const ANONPAY_CONTRACT = 'anonpay.compact';

export type AnonPayInvoiceReference = {
  invoice_name: string;
  invoice_hash?: string;
  salt?: string;
};
