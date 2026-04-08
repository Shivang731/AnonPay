import { useSharedPayment } from './useSharedPayment';

export type { PaymentStep } from './types';

export const usePayment = () => {
    const shared = useSharedPayment();

    return {
        step: shared.step,
        status: shared.status,
        loading: shared.loading,
        error: shared.error,
        invoice: shared.invoice,
        txId: shared.txId,
        publicKey: shared.publicKey,
        payInvoice: shared.handlePay,
        handleConnect: shared.handleConnect,
        donationAmount: shared.donationAmount,
        setDonationAmount: shared.setDonationAmount,
    };
};
