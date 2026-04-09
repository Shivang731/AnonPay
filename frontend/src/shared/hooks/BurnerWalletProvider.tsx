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

    const resetBurnerState = () => {
        setBurnerAddress(null);
        setEncryptedBurnerKey(null);
        setDecryptedBurnerKey(null);
        setFetchedFromChain(false);
        setHasOnChainRecord(false);
        setAppPassword(null);
        setIsUnlocked(false);
        setHasProfile(null);
        setUserProfileMainAddress(null);
        setDecryptedBurnerAddress(null);
    };

    const refreshProfile = async () => {
        if (!walletAddress) {
            resetBurnerState();
            return;
        }

        try {
            const profile = await getUserProfile(walletAddress);
            if (profile) {
                setHasProfile(true);
                setUserProfileMainAddress(profile.main_address || null);
                setBurnerAddress(profile.burner_address || null);
                setEncryptedBurnerKey(profile.encrypted_burner_key || null);
                if (!profile.burner_address) {
                    setDecryptedBurnerAddress(null);
                }
                if (!profile.encrypted_burner_key) {
                    setDecryptedBurnerKey(null);
                }
            } else {
                setHasProfile(false);
                setBurnerAddress(null);
                setEncryptedBurnerKey(null);
                setDecryptedBurnerKey(null);
                setDecryptedBurnerAddress(null);
                setUserProfileMainAddress(null);
            }
        } catch (error: any) {
            console.error("Failed to fetch user profile for burner wallet details", error);
            setHasProfile(false);
            setBurnerAddress(null);
            setEncryptedBurnerKey(null);
            setDecryptedBurnerKey(null);
            setDecryptedBurnerAddress(null);
            setUserProfileMainAddress(null);
        }
    };

    useEffect(() => {
        refreshProfile();
    }, [walletAddress]);

    useEffect(() => {
        const decryptAddress = async () => {
            if (appPassword && burnerAddress) {
                try {
                    const addr = await decryptWithPassword(burnerAddress, appPassword);
                    if (addr !== decryptedBurnerAddress) {
                        setDecryptedBurnerAddress(addr);
                    }
                } catch (e) {
                    setDecryptedBurnerAddress(null);
                    console.warn('Could not decrypt burner address for display', e);
                }
            } else if (!burnerAddress) {
                setDecryptedBurnerAddress(null);
            }
        };
        decryptAddress();
    }, [appPassword, burnerAddress, decryptedBurnerAddress]);

    useEffect(() => {
        const decryptKey = async () => {
            if (appPassword && encryptedBurnerKey) {
                try {
                    const key = await decryptWithPassword(encryptedBurnerKey, appPassword);
                    if (key !== decryptedBurnerKey) {
                        setDecryptedBurnerKey(key);
                    }
                } catch (e) {
                    console.warn('Could not auto-decrypt burner private key', e);
                }
            } else if (!encryptedBurnerKey) {
                setDecryptedBurnerKey(null);
            }
        };
        decryptKey();
    }, [appPassword, encryptedBurnerKey, decryptedBurnerKey]);

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
