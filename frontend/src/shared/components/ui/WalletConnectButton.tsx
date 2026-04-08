import { useMidnightWallet } from '../../hooks/Wallet/WalletProvider';

interface WalletConnectButtonProps {
    className?: string;
}

export const WalletConnectButton = ({ className = '' }: WalletConnectButtonProps) => {
    const { walletAddress, isConnected, connect, disconnect, loading, error } = useMidnightWallet();

    const handleClick = async () => {
        if (isConnected) {
            disconnect();
        } else {
            await connect();
        }
    };

    const displayAddress = walletAddress
        ? `${walletAddress.slice(0, 8)}...${walletAddress.slice(-4)}`
        : 'Connect Wallet';

    return (
        <button
            onClick={handleClick}
            disabled={loading}
            className={className}
            title={error || undefined}
        >
            {loading ? 'Connecting...' : error && !isConnected ? 'Retry Wallet Connect' : displayAddress}
        </button>
    );
};
