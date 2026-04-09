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
const LEO_MEMO_MAX_BYTES = 31;

const getUtf8ByteLength = (value: string) => new TextEncoder().encode(value).length;

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

const isRelayerUnavailableError = (message: string) =>
    message.includes('RELAYER_PRIVATE_KEY missing') ||
    message.includes('Failed to submit create_invoice transaction.');

export const useCreateInvoice = () => {
    const { isConnected, walletAddress } = useMidnightWallet();
    const { appPassword, decryptedBurnerAddress } = useBurnerWallet();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [status, setStatus] = useState<string>('');
    const [paymentLink, setPaymentLink] = useState<string | null>(null);

    const resetCreateState = useCallback(() => {
        setError(null);
        setStatus('');
        setPaymentLink(null);
    }, []);

    const createInvoice = useCallback(async ({
        amount,
        memo = '',
        type = 'standard',
        walletType = 0,
        forSdk = false,
        items = [],
    }: CreateInvoiceParams): Promise<CreateInvoiceResult | null> => {
        resetCreateState();

        const trimmedMemo = memo.trim();
        const normalizedItems = items.map((item) => ({
            name: item.name.trim(),
            quantity: Number(item.quantity) || 0,
            unitPrice: Number(item.unitPrice) || 0,
            total: Number(item.total) || 0,
        }));

        // ── pre-flight checks ──────────────────────────────────────────
        if (!isConnected || !walletAddress) {
            setError('Error: Wallet not connected.');
            return null;
        }

        if (!appPassword) {
            setError('Error: Unlock the app first so invoice metadata can be encrypted locally.');
            return null;
        }

        const receivingAddress = walletType === 1
            ? (decryptedBurnerAddress || null)
            : walletAddress;

        if (!receivingAddress) {
            setError(
                walletType === 1
                    ? 'Error: Burner wallet not available yet. Wait for it to decrypt and try again.'
                    : 'Error: Wallet address unavailable.',
            );
            return null;
        }

        if (type !== 'donation' && amount <= 0n) {
            setError('Error: Enter an amount greater than 0.');
            return null;
        }

        if (trimmedMemo && getUtf8ByteLength(trimmedMemo) > LEO_MEMO_MAX_BYTES) {
            setError(`Error: Memo is too long. Keep it within ${LEO_MEMO_MAX_BYTES} UTF-8 bytes.`);
            return null;
        }

        if (normalizedItems.length > 0) {
            const hasInvalidItem = normalizedItems.some((item) => (
                !item.name ||
                item.quantity <= 0 ||
                item.unitPrice < 0 ||
                item.total <= 0
            ));

            if (hasInvalidItem) {
                setError('Error: Complete each line item with a name, quantity, and price before creating the invoice.');
                return null;
            }
        }

        setIsLoading(true);
        setStatus('Initializing invoice creation...');

        try {
            const typeMap: Record<InvoiceType, number> = { standard: 0, multipay: 1, donation: 2 };
            const amountDisplay = Number(amount) / 1_000_000;
            const sdkFlag = walletType === 1 ? false : forSdk;

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
            let relayPayload: { tx_id?: string } = {};
            let createdWithoutRelayer = false;

            setStatus('Submitting invoice to Midnight relayer...');
            const relayRes = await fetch(`${BACKEND_URL}/mcp/relay/create-invoice`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    merchant_address: receivingAddress,
                    amount: amountDisplay,
                    currency: 'TDUST',
                    salt: saltField,
                    memo: trimmedMemo,
                    invoice_type: typeMap[type],
                }),
            });

            if (!relayRes.ok) {
                const errBody = await relayRes.json().catch(() => ({}));
                const relayMessage = errBody.error || 'Failed to submit create_invoice transaction.';

                if (!isRelayerUnavailableError(relayMessage)) {
                    throw new Error(relayMessage);
                }

                createdWithoutRelayer = true;
                setStatus('Relayer unavailable. Creating a shareable local invoice instead...');
            } else {
                relayPayload = await relayRes.json();
            }

            // ── step 3: save encrypted metadata to backend ──
            const encryptedMerchantAddress = await encryptWithPassword(receivingAddress, appPassword);
            const encryptedMemo = trimmedMemo
                ? await encryptWithPassword(trimmedMemo, appPassword)
                : null;
            const merchantAddressHash = await hashAddress(receivingAddress);

            setStatus('Saving encrypted invoice details...');
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
                    invoice_items: normalizedItems.length > 0 ? normalizedItems : null,
                    for_sdk: sdkFlag,
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

            setStatus('Building payment link...');
            const paymentParams = new URLSearchParams({
                merchant: receivingAddress,
                amount: type === 'donation' ? '0' : amountDisplay.toString(),
                hash: invoiceHashHex,
                salt: saltHex,
            });

            if (trimmedMemo) {
                paymentParams.set('memo', trimmedMemo);
            }

            if (type !== 'standard') {
                paymentParams.set('type', type);
            }

            const link = `${baseUrl}/pay?${paymentParams.toString()}`;
            setPaymentLink(link);

            const savedInvoice = await backendRes.json();
            setStatus(
                createdWithoutRelayer
                    ? 'Invoice created. QR, link, and payment address are ready to share.'
                    : 'Invoice created successfully.'
            );

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
                    memo: trimmedMemo,
                },
            };
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to create invoice.';
            setError(message.startsWith('Error:') ? message : `Error: ${message}`);
            setStatus('');
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [appPassword, decryptedBurnerAddress, isConnected, resetCreateState, walletAddress]);

    return { createInvoice, isLoading, error, status, paymentLink, resetCreateState };
};
