import React, { createContext, useCallback, useContext, useRef } from 'react';
import { useMidnightWallet } from './WalletProvider';

const CONNECTION_ERROR_PATTERNS = [
    'not connected',
    'connection expired',
    'dapp not connected',
    'lace not found',
];

function isConnectionExpiredError(error: unknown): boolean {
    const msg = error instanceof Error
        ? error.message.toLowerCase()
        : String(error).toLowerCase();
    return CONNECTION_ERROR_PATTERNS.some((p) => msg.includes(p));
}

interface WalletErrorContextState {
    handleWalletError: (error: unknown) => boolean;
}

const WalletErrorContext = createContext<WalletErrorContextState>({
    handleWalletError: () => false,
});

export const useWalletErrorHandler = () => useContext(WalletErrorContext);

export const WalletErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { disconnect } = useMidnightWallet();
    const handlingRef = useRef(false);

    const handleWalletError = useCallback(
        (error: unknown): boolean => {
            if (!isConnectionExpiredError(error)) return false;

            if (handlingRef.current) return true;
            handlingRef.current = true;

            console.warn('[AnonPay] Wallet connection expired — disconnecting.');
            disconnect();

            setTimeout(() => {
                handlingRef.current = false;
            }, 300);

            return true;
        },
        [disconnect],
    );

    return (
        <WalletErrorContext.Provider value={{ handleWalletError }}>
            {children}
        </WalletErrorContext.Provider>
    );
};
