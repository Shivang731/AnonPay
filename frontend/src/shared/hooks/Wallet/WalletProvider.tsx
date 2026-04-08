import React, {
    useState,
    useEffect,
    useCallback,
    createContext,
    useContext,
} from 'react';
import '@midnight-ntwrk/dapp-connector-api';
import type { InitialAPI, ConnectedAPI } from '@midnight-ntwrk/dapp-connector-api';
import toast from 'react-hot-toast';
import { WalletErrorBoundary } from './WalletErrorBoundary';

const NETWORK_ID = import.meta.env.VITE_NETWORK || 'preprod';

function resolveInjectedMidnightWallet(): InitialAPI | null {
    const midnight = (window as any).midnight;
    if (!midnight || typeof midnight !== 'object') return null;

    if (midnight.lace && typeof midnight.lace.connect === 'function') {
        return midnight.lace as InitialAPI;
    }

    const injectedProvider = Object.values(midnight).find((value) => (
        value &&
        typeof value === 'object' &&
        typeof (value as any).connect === 'function'
    ));

    return (injectedProvider as InitialAPI) || null;
}

function getReadableWalletError(error: unknown): string {
    const message =
        error instanceof Error ? error.message : String(error || 'Unknown wallet error');

    if (message.toLowerCase().includes('not found')) {
        return 'Midnight Lace wallet not found in this browser profile.';
    }

    if (message.toLowerCase().includes('reject')) {
        return 'Wallet connection was rejected in Lace.';
    }

    return message;
}

interface MidnightWalletContextType {
    connectedApi: ConnectedAPI | null;
    isConnected: boolean;
    walletAddress: string | null;
    connect: () => Promise<void>;
    disconnect: () => void;
    loading: boolean;
    error: string | null;
}

const MidnightWalletContext = createContext<MidnightWalletContextType>({
    connectedApi: null,
    isConnected: false,
    walletAddress: null,
    connect: async () => {},
    disconnect: () => {},
    loading: false,
    error: null,
});

export const useMidnightWallet = () => useContext(MidnightWalletContext);

interface MidnightWalletProviderProps {
    children: React.ReactNode;
}

export const MidnightWalletProvider = ({
    children,
}: MidnightWalletProviderProps) => {
    const [connectedApi, setConnectedApi] = useState<ConnectedAPI | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [walletAddress, setWalletAddress] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const connect = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const wallet = resolveInjectedMidnightWallet();
            if (!wallet) {
                throw new Error(
                    'Lace Wallet not found. Please install the Midnight Lace wallet extension.',
                );
            }
            const connected = await wallet.connect(NETWORK_ID);

            const addresses = await connected.getShieldedAddresses();
            const connectionStatus = await connected.getConnectionStatus();

            if (connectionStatus) {
                setConnectedApi(connected as any);
                setIsConnected(true);
                setWalletAddress(addresses.shieldedAddress);
            }
        } catch (err: any) {
            console.error('[AnonPay] Wallet connection error:', err);
            const friendlyError = `${getReadableWalletError(err)} Target network: ${NETWORK_ID}.`;
            setError(friendlyError);
            toast.error(friendlyError, { duration: 5000 });
        } finally {
            setLoading(false);
        }
    }, []);

    const disconnect = useCallback(() => {
        setConnectedApi(null);
        setIsConnected(false);
        setWalletAddress(null);
    }, []);

    useEffect(() => {
        const checkExistingConnection = async () => {
            try {
                const wallet = resolveInjectedMidnightWallet();
                if (wallet) {
                    const connected = await wallet.connect(NETWORK_ID);
                    const addresses = await connected.getShieldedAddresses();
                    const connectionStatus =
                        await connected.getConnectionStatus();

                    if (connectionStatus) {
                        setConnectedApi(connected as any);
                        setIsConnected(true);
                        setWalletAddress(addresses.shieldedAddress);
                    }
                }
            } catch (err) {
                console.log('[AnonPay] No existing wallet connection');
            }
        };

        checkExistingConnection();
    }, []);

    const value = {
        connectedApi,
        isConnected,
        walletAddress,
        connect,
        disconnect,
        loading,
        error,
    };

    return (
        <MidnightWalletContext.Provider value={value}>
            <WalletErrorBoundary>{children}</WalletErrorBoundary>
        </MidnightWalletContext.Provider>
    );
};
