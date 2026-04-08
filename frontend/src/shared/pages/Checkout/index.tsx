import { useParams } from 'react-router-dom';
import { useCheckoutSession } from './hooks/useCheckoutSession';
import { useCheckoutPayment } from './hooks/useCheckoutPayment';
import { CheckoutUI } from './components/CheckoutUI';
import { useMidnightWallet } from '../../hooks/Wallet/WalletProvider';

export const CheckoutPage = () => {
    const { id } = useParams<{ id: string }>();
    const { session, loading, error: sessionError } = useCheckoutSession(id);
    const { walletAddress, connect } = useMidnightWallet();
    const {
        paymentStatus,
        paymentLoading,
        txId,
        success,
        error,
        onPay,
        onPayWithGiftCard,
        onRedeemGiftCardBalance,
    } = useCheckoutPayment(session);

    return (
        <div className="px-4 pt-6">
            <CheckoutUI
                session={session}
                loading={loading}
                error={error || sessionError}
                publicKey={walletAddress}
                paymentStatus={paymentStatus}
                paymentLoading={paymentLoading}
                txId={txId}
                success={success}
                onPay={onPay}
                onPayWithGiftCard={onPayWithGiftCard}
                onRedeemGiftCardBalance={onRedeemGiftCardBalance}
                connect={connect}
            />
        </div>
    );
};
