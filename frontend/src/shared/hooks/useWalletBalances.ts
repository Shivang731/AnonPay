import { useEffect, useState } from 'react';
import { useMidnightWallet } from './Wallet/WalletProvider';

export interface WalletTokenBalance {
    name: string;
    public: string;
    private: string;
    publicAmount: number;
    privateAmount: number;
    loading: boolean;
}

const INITIAL_BALANCES: WalletTokenBalance[] = [
    { name: 'tDUST', public: '0.00', private: '0.00', publicAmount: 0, privateAmount: 0, loading: false },
];

export const useWalletBalances = () => {
    const { walletAddress } = useMidnightWallet();
    
    const [balances, setBalances] = useState<WalletTokenBalance[]>(INITIAL_BALANCES);

    useEffect(() => {
        if (!walletAddress) {
            setBalances(INITIAL_BALANCES.map((balance) => ({ ...balance, loading: false })));
            return;
        }

        setBalances(INITIAL_BALANCES);
    }, [walletAddress]);

    return { balances };
};
