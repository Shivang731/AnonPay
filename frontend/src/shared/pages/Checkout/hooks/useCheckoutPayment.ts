import { useState } from 'react';
import { useMidnightWallet } from '../../../hooks/Wallet/WalletProvider';
import { CheckoutSession } from '../types';
import { buildPaymentLinkFromCheckoutSession } from '../../../utils/payment-links';

export const useCheckoutPayment = (session: CheckoutSession | null) => {
    const { walletAddress } = useMidnightWallet();
    const [paymentStatus, setPaymentStatus] = useState('');
    const [paymentLoading, setPaymentLoading] = useState(false);
    const txId: string | null = null;
    const success = false;
    const [error, setError] = useState<string | null>(null);

    const handlePay = async (donationAmount?: number, selectedToken?: string) => {
        if (!walletAddress) {
            setError('Connect your wallet first.');
            return;
        }
        if (!session) {
            setError('No active checkout session.');
            return;
        }

        setError(null);
        setPaymentLoading(true);
        try {
            const paymentLink = buildPaymentLinkFromCheckoutSession(session, {
                amountOverride: session.amount === 0 ? donationAmount : undefined,
                tokenOverride: selectedToken,
            });
            setPaymentStatus('Redirecting to the secure Midnight payment flow...');
            window.location.href = paymentLink;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to open payment flow.');
            setPaymentLoading(false);
        }
    };

    const handlePayWithGiftCard = async (_giftCode: string, donationAmount?: number, selectedToken?: string) => {
        await handlePay(donationAmount, selectedToken);
    };

    const handleRedeemGiftCardBalance = async () => {
        setError('Gift card balance redemption is unavailable until Midnight gift card records are wired to production.');
    };

    return {
        paymentStatus,
        paymentLoading,
        txId,
        success,
        error,
        onPay: handlePay,
        onPayWithGiftCard: handlePayWithGiftCard,
        onRedeemGiftCardBalance: handleRedeemGiftCardBalance,
    };
};
