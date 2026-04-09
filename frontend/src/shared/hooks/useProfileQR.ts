import { useState, useEffect } from 'react';
import { useMidnightWallet } from './Wallet/WalletProvider';
import { updateUserProfile, getUserProfile, createInvoice, fetchInvoiceByHash } from '../services/api';
import { encryptWithPassword, hashAddress } from '../utils/crypto';
import { generateSalt, bytesToHex, computeInvoiceHash } from '../utils/midnight-utils';
import { useBurnerWallet } from './BurnerWalletProvider';

export const useProfileQR = () => {
    const { walletAddress } = useMidnightWallet();
    const { burnerAddress, decryptedBurnerAddress, appPassword, userProfileMainAddress } = useBurnerWallet();
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('');
    const [mainHash, setMainHash] = useState<string | null>(null);
    const [mainSalt, setMainSalt] = useState<string | null>(null);
    const [burnerHash, setBurnerHash] = useState<string | null>(null);
    const [burnerSalt, setBurnerSalt] = useState<string | null>(null);
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        if (walletAddress) {
            checkExistingProfile(walletAddress);
        }
    }, [walletAddress]);

    const checkExistingProfile = async (addr: string) => {
        try {
            const profile = await getUserProfile(addr);
            if (profile) {
                if (profile.profile_main_invoice_hash) {
                    setMainHash(profile.profile_main_invoice_hash);
                    setInitialized(true);
                    fetchInvoiceByHash(profile.profile_main_invoice_hash)
                        .then(inv => { if (inv?.salt) setMainSalt(inv.salt); })
                        .catch(console.warn);
                }
                if (profile.profile_burner_invoice_hash) {
                    setBurnerHash(profile.profile_burner_invoice_hash);
                    fetchInvoiceByHash(profile.profile_burner_invoice_hash)
                        .then(inv => { if (inv?.salt) setBurnerSalt(inv.salt); })
                        .catch(console.warn);
                }
            }
        } catch (e) {
            console.error("Failed to check profile", e);
        }
    };

    const generateSingleInvoice = async (isBurner: boolean): Promise<{ hash: string, salt: string }> => {
        if (!walletAddress) throw new Error("Wallet not connected");
        if (!appPassword) throw new Error("Please enter your password to unlock the application.");

        const salt = generateSalt();
        const merchantAddress = isBurner
            ? (decryptedBurnerAddress || null)
            : walletAddress;

        if (!merchantAddress) {
            throw new Error('Burner wallet is locked. Unlock it before generating the private QR.');
        }

        setStatus(`Creating ${isBurner ? 'Burner' : 'Main'} invoice...`);

        const encryptedMerchant = await encryptWithPassword(merchantAddress, appPassword);
        const merchantHash = await hashAddress(merchantAddress);
        const saltHex = bytesToHex(salt);
        const invoiceHash = bytesToHex(await computeInvoiceHash(merchantAddress, 0n, salt));

        await createInvoice({
            invoice_hash: invoiceHash,
            merchant_address: encryptedMerchant,
            merchant_address_hash: merchantHash,
            designated_address: merchantAddress,
            status: 'PENDING',
            invoice_transaction_id: '',
            salt: saltHex,
            invoice_type: 2,
            token_type: 0,
            is_burner: isBurner,
        });

        return { hash: invoiceHash, salt: saltHex };
    };

    const initializeQRs = async () => {
        if (!walletAddress) {
            setStatus("Please connect wallet first");
            return;
        }
        setLoading(true);
        setStatus("Initializing Profile QR...");

        try {
            let newMainHash = mainHash;
            if (!newMainHash) {
                setStatus("Creating Main Wallet invoice...");
                const res = await generateSingleInvoice(false);
                newMainHash = res.hash;
                setMainHash(res.hash);
                setMainSalt(res.salt);
            }

            let newBurnerHash = burnerHash;
            if (!newBurnerHash && burnerAddress) {
                setStatus("Creating Burner Wallet invoice...");
                const res = await generateSingleInvoice(true);
                newBurnerHash = res.hash;
                setBurnerHash(res.hash);
                setBurnerSalt(res.salt);
            }

            setStatus("Saving your Profile QR details...");

            if (!mainHash || (!burnerHash && burnerAddress)) {
                if (!appPassword) throw new Error("Password missing for profile update");
                const currentEncryptedMain = userProfileMainAddress || await encryptWithPassword(walletAddress, appPassword);
                await updateUserProfile(
                    walletAddress,
                    currentEncryptedMain,
                    undefined,
                    undefined,
                    newMainHash || undefined,
                    newBurnerHash || undefined
                );
            }

            setInitialized(true);
            setStatus("Profile QR successfully active!");
        } catch (e: any) {
            console.error("Initialization failed", e);
            setStatus(`Error: ${e.message}`);
        } finally {
            setLoading(false);
        }
    };

    return {
        initialized,
        loading,
        status,
        mainHash,
        mainSalt,
        burnerHash,
        burnerSalt,
        initializeQRs
    };
};
