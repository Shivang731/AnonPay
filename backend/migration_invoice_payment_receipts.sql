ALTER TABLE invoices
ADD COLUMN IF NOT EXISTS payment_receipts JSONB;

