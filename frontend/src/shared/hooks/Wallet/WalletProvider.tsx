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
import { Button } from '../../components/ui/Button';

const NETWORK_ID = import.meta.env.VITE_NETWORK || 'preprod';
const MIDNIGHT_LACE_URL = 'https://midnight.network';

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

const WalletConnectModal = ({
    isOpen,
    isInstalled,
    loading,
    onClose,
    onConnectLace,
    error,
}: {
    isOpen: boolean;
    isInstalled: boolean;
    loading: boolean;
    onClose: () => void;
    onConnectLace: () => Promise<void>;
    error: string | null;
}) => {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
            onClick={onClose}
        >
            <div
                className="w-full max-w-md rounded-3xl border border-white/10 bg-[#09090b]/95 p-7 shadow-[0_30px_80px_rgba(0,0,0,0.45)]"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="mb-6">
                    <p className="text-[11px] uppercase tracking-[0.25em] text-gray-500 font-semibold">Connect Wallet</p>
                    <h2 className="mt-3 text-2xl font-bold tracking-tight text-white">Choose your wallet</h2>
                    <p className="mt-2 text-sm text-gray-400">
                        Connect with Midnight Lace on the <span className="text-white font-semibold">{NETWORK_ID}</span> network.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => void onConnectLace()}
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left transition-all hover:border-white/20 hover:bg-white/[0.07]"
                    disabled={loading}
                >
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <div className="text-sm font-bold text-white">Midnight Lace</div>
                            <div className="mt-1 text-xs text-gray-500">
                                {isInstalled ? 'Installed in this browser profile' : 'Not detected. Open setup, install, or unlock it first.'}
                            </div>
                        </div>
                        <div className="text-xs font-bold uppercase tracking-[0.2em] text-orange-300">
                            {loading ? 'Opening' : isInstalled ? 'Continue' : 'Install'}
                        </div>
                    </div>
                </button>

                {error && (
                    <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
                        {error}
                    </div>
                )}

                <div className="mt-6 flex justify-end">
                    <Button variant="ghost" size="sm" onClick={onClose}>
                        Close
                    </Button>
                </div>
            </div>
        </div>
    );
};

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
    const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

    const attemptConnection = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const wallet = resolveInjectedMidnightWallet();
            if (!wallet) {
                window.open(MIDNIGHT_LACE_URL, '_blank', 'noopener,noreferrer');
                throw new Error(
                    'Midnight Lace was not detected. Install or unlock the wallet, then try again.',
                );
            }
            const connected = await wallet.connect(NETWORK_ID);

            const addresses = await connected.getShieldedAddresses();
            const connectionStatus = await connected.getConnectionStatus();

            if (connectionStatus) {
                setConnectedApi(connected as any);
                setIsConnected(true);
                setWalletAddress(addresses.shieldedAddress);
                setIsWalletModalOpen(false);
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

    const connect = useCallback(async () => {
        setError(null);
        setIsWalletModalOpen(true);
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
            <WalletErrorBoundary>
                {children}
                <WalletConnectModal
                    isOpen={isWalletModalOpen}
                    isInstalled={Boolean(resolveInjectedMidnightWallet())}
                    loading={loading}
                    onClose={() => setIsWalletModalOpen(false)}
                    onConnectLace={attemptConnection}
                    error={error}
                />
            </WalletErrorBoundary>
        </MidnightWalletContext.Provider>
    );
};
