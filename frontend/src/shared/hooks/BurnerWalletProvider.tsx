import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUserProfile } from '../services/api';
import { decryptWithPassword } from '../utils/crypto';
import { useMidnightWallet } from './Wallet/WalletProvider';

interface BurnerWalletContextType {
    burnerAddress: string | null;
    decryptedBurnerKey: string | null;
    setDecryptedBurnerKey: (key: string | null) => void;
    encryptedBurnerKey: string | null;
    refreshProfile: () => Promise<void>;
    fetchedFromChain: boolean;
    hasOnChainRecord: boolean;
    setHasOnChainRecord: (v: boolean) => void;
    appPassword: string | null;
    setAppPassword: (p: string | null) => void;
    isUnlocked: boolean;
    setIsUnlocked: (v: boolean) => void;
    hasProfile: boolean | null;
    userProfileMainAddress: string | null;
    isAutoUnlocking: boolean;
    decryptedBurnerAddress: string | null;
    hasBurnerOnChainRecord: boolean;
}

const BurnerWalletContext = createContext<BurnerWalletContextType | undefined>(undefined);

export const BurnerWalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { walletAddress } = useMidnightWallet();
    
    const [burnerAddress, setBurnerAddress] = useState<string | null>(null);
    const [encryptedBurnerKey, setEncryptedBurnerKey] = useState<string | null>(null);
    const [decryptedBurnerKey, setDecryptedBurnerKey] = useState<string | null>(null);
    const [fetchedFromChain, setFetchedFromChain] = useState<boolean>(false);
    const [hasOnChainRecord, setHasOnChainRecord] = useState<boolean>(false);
    const [appPassword, setAppPassword] = useState<string | null>(null);
    const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
    const [hasProfile, setHasProfile] = useState<boolean | null>(null);
    const [userProfileMainAddress, setUserProfileMainAddress] = useState<string | null>(null);
    const [isAutoUnlocking] = useState<boolean>(false);
    const [decryptedBurnerAddress, setDecryptedBurnerAddress] = useState<string | null>(null);
    const [hasBurnerOnChainRecord] = useState<boolean>(false);

    const refreshProfile = async () => {
        if (!walletAddress) {
            setBurnerAddress(null);
            setEncryptedBurnerKey(null);
            setDecryptedBurnerKey(null);
            setFetchedFromChain(false);
            setHasOnChainRecord(false);
            setAppPassword(null);
            setIsUnlocked(false);
            setHasProfile(null);
            setUserProfileMainAddress(null);
            return;
        }

        try {
            const profile = await getUserProfile(walletAddress);
            if (profile) {
                setHasProfile(true);
                setUserProfileMainAddress(profile.main_address || null);
                setBurnerAddress(profile.burner_address || null);
                setEncryptedBurnerKey(profile.encrypted_burner_key || null);
            } else {
                setHasProfile(false);
            }
        } catch (error: any) {
            console.error("Failed to fetch user profile for burner wallet details", error);
            setHasProfile(false);
        }
    };

    useEffect(() => {
        refreshProfile();
    }, [walletAddress]);

    useEffect(() => {
        const decryptAddress = async () => {
            if (appPassword && burnerAddress && !decryptedBurnerAddress) {
                try {
                    const addr = await decryptWithPassword(burnerAddress, appPassword);
                    setDecryptedBurnerAddress(addr);
                } catch (e) {
                    console.warn('Could not decrypt burner address for display', e);
                }
            }
        };
        decryptAddress();
    }, [appPassword, burnerAddress, decryptedBurnerAddress]);

    return (
        <BurnerWalletContext.Provider value={{
            burnerAddress,
            decryptedBurnerKey,
            setDecryptedBurnerKey,
            encryptedBurnerKey,
            refreshProfile,
            fetchedFromChain,
            hasOnChainRecord,
            setHasOnChainRecord,
            appPassword,
            setAppPassword,
            isUnlocked,
            setIsUnlocked,
            hasProfile,
            userProfileMainAddress,
            isAutoUnlocking,
            decryptedBurnerAddress,
            hasBurnerOnChainRecord
        }}>
            {children}
        </BurnerWalletContext.Provider>
    );
};

export const useBurnerWallet = () => {
    const context = useContext(BurnerWalletContext);
    if (!context) {
        throw new Error('useBurnerWallet must be used within a BurnerWalletProvider');
    }
    return context;
};
