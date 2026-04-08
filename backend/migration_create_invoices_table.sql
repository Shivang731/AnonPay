-- ==========================================
-- BOOTSTRAP: INVOICES TABLE
-- ==========================================
-- Run this in the Supabase SQL editor before the additive invoice migrations
-- if your project does not already have `public.invoices`.

CREATE TABLE IF NOT EXISTS public.invoices (
    id BIGSERIAL PRIMARY KEY,
    invoice_id TEXT,
    invoice_hash TEXT NOT NULL UNIQUE,
    merchant_address TEXT NOT NULL,
    merchant_address_hash TEXT,
    designated_address TEXT,
    is_burner BOOLEAN NOT NULL DEFAULT FALSE,
    payer_address TEXT,
    amount NUMERIC,
    memo TEXT,
    status TEXT NOT NULL DEFAULT 'PENDING',
    block_height BIGINT,
    block_settled BIGINT,
    invoice_transaction_id TEXT,
    payment_tx_ids TEXT[],
    expiry TEXT,
    receipt_commitment TEXT,
    salt TEXT,
    invoice_type SMALLINT NOT NULL DEFAULT 0,
    token_type SMALLINT NOT NULL DEFAULT 0,
    invoice_items JSONB,
    for_sdk BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoices_invoice_hash ON public.invoices(invoice_hash);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_id ON public.invoices(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON public.invoices(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_invoices_merchant_address_hash ON public.invoices(merchant_address_hash);
CREATE INDEX IF NOT EXISTS idx_invoices_payment_tx_ids ON public.invoices USING GIN (payment_tx_ids);
