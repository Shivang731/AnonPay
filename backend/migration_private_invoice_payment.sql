-- ==========================================
-- MIGRATION: PRIVATE INVOICE PAYMENT SUPPORT
-- ==========================================
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS invoice_id TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS expiry TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS receipt_commitment TEXT;

CREATE INDEX IF NOT EXISTS idx_invoices_invoice_id ON invoices(invoice_id);
