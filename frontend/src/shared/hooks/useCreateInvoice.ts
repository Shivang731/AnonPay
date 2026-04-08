import { useState, useCallback } from 'react';
import {
    bytesToHex,
    bytesToFieldString,
    computeInvoiceHash,
    generateSalt,
} from '../utils/midnight-utils';
import { useMidnightWallet } from './Wallet/WalletProvider';
import { useBurnerWallet } from './BurnerWalletProvider';
import type { InvoiceData } from '../types/invoice';
import type { InvoiceItem } from '../types/invoice';
import { encryptWithPassword, hashAddress } from '../utils/crypto';
import { API_URL as BACKEND_URL } from '../config/api';

const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL || 'http://localhost:5173';

export type InvoiceType = 'standard' | 'multipay' | 'donation';

interface CreateInvoiceParams {
    amount: bigint;
    memo?: string;
    type?: InvoiceType;
    walletType?: number;
    forSdk?: boolean;
    items?: InvoiceItem[];
}

interface CreateInvoiceResult {
    invoice_id: string;
    paymentLink: string;
    invoiceData: InvoiceData;
}

export const useCreateInvoice = () => {
    const { isConnected, walletAddress } = useMidnightWallet();
    const { appPassword, decryptedBurnerAddress } = useBurnerWallet();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [paymentLink, setPaymentLink] = useState<string | null>(null);

    const createInvoice = useCallback(async ({
        amount,
        memo = '',
        type = 'standard',
        walletType = 0,
        forSdk = false,
        items = [],
    }: CreateInvoiceParams): Promise<CreateInvoiceResult | null> => {
        setError(null);
        setPaymentLink(null);

        // ── pre-flight checks ──────────────────────────────────────────
        if (!isConnected || !walletAddress) {
            setError('Wallet not connected.');
            return null;
        }

        if (!appPassword) {
            setError('Unlock the app first so invoice metadata can be encrypted locally.');
            return null;
        }

        const receivingAddress = walletType === 1
            ? (decryptedBurnerAddress || null)
            : walletAddress;

        if (!receivingAddress) {
            setError(
                walletType === 1
                    ? 'Burner wallet not available yet. Wait for it to decrypt and try again.'
                    : 'Wallet address unavailable.',
            );
            return null;
        }

        setIsLoading(true);

        try {
            const typeMap: Record<InvoiceType, number> = { standard: 0, multipay: 1, donation: 2 };
            const amountDisplay = Number(amount) / 1_000_000;

            // Generate a 128-bit salt entirely in-browser.
            const salt = generateSalt();
            const saltHex = bytesToHex(salt);
            const saltField = bytesToFieldString(salt);

            // Commit only the SHA-256 hash of merchant + amount + salt to Midnight.
            const invoiceHash = await computeInvoiceHash(
                receivingAddress,
                amount,
                salt,
            );
            const invoiceHashHex = bytesToHex(invoiceHash);

            const expiry = BigInt(Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60);
            const relayRes = await fetch(`${BACKEND_URL}/mcp/relay/create-invoice`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    merchant_address: receivingAddress,
                    amount: amountDisplay,
                    currency: 'CREDITS',
                    salt: saltField,
                    memo,
                    invoice_type: typeMap[type],
                }),
            });

            if (!relayRes.ok) {
                const errBody = await relayRes.json().catch(() => ({}));
                throw new Error(errBody.error || 'Failed to submit create_invoice transaction.');
            }

            const relayPayload = await relayRes.json();

            // ── step 3: save encrypted metadata to backend ──
            const encryptedMerchantAddress = await encryptWithPassword(receivingAddress, appPassword);
            const encryptedMemo = memo
                ? await encryptWithPassword(memo, appPassword)
                : null;
            const merchantAddressHash = await hashAddress(receivingAddress);

            const backendRes = await fetch(`${BACKEND_URL}/invoices`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    invoice_id: null,
                    invoice_hash: invoiceHashHex,
                    amount: amountDisplay,
                    memo: encryptedMemo,
                    invoice_type: typeMap[type],
                    merchant_address: encryptedMerchantAddress,
                    designated_address: receivingAddress,
                    merchant_address_hash: merchantAddressHash,
                    is_burner: walletType === 1,
                    salt: saltHex,
                    invoice_items: items.length > 0 ? items : null,
                    for_sdk: forSdk,
                    expiry: expiry.toString(),
                    invoice_transaction_id: relayPayload.tx_id || null,
                }),
            });

            if (!backendRes.ok) {
                const errBody = await backendRes.json().catch(() => ({}));
                throw new Error(errBody.error || 'Backend failed to save invoice.');
            }

            // ── step 4: build payment link ──
            const baseUrl =
                typeof window !== 'undefined' && window.location?.origin
                    ? window.location.origin
                    : FRONTEND_URL;
            const paymentParams = new URLSearchParams({
                merchant: receivingAddress,
                amount: type === 'donation' ? '0' : amountDisplay.toString(),
                hash: invoiceHashHex,
                salt: saltHex,
            });

            if (memo) {
                paymentParams.set('memo', memo);
            }

            if (type !== 'standard') {
                paymentParams.set('type', type);
            }

            const link = `${baseUrl}/pay?${paymentParams.toString()}`;
            setPaymentLink(link);

            const savedInvoice = await backendRes.json();

            return {
                invoice_id: String(savedInvoice.invoice_id || savedInvoice.id || relayPayload.tx_id || ''),
                paymentLink: link,
                invoiceData: {
                    merchant: receivingAddress,
                    amount: amountDisplay,
                    salt: saltHex,
                    hash: invoiceHashHex,
                    link,
                    type: typeMap[type],
                    memo,
                },
            };
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to create invoice.';
            setError(message);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [appPassword, decryptedBurnerAddress, isConnected, walletAddress]);

    return { createInvoice, isLoading, error, paymentLink };
};
