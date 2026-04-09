import { useState, useCallback, useRef } from 'react';
import { useMidnightWallet } from '../../../../hooks/Wallet/WalletProvider';
import { useBurnerWallet } from '../../../../hooks/BurnerWalletProvider';
import { encryptWithPassword, decryptWithPassword } from '../../../../utils/crypto';
import { fetchAllPrivateBalances } from './scanner';
import type { PrivateBalances } from './types';
import { generateBurnerWallet } from '../../../../utils/burner-crypto';

export function useBurnerActions() {
    const { walletAddress } = useMidnightWallet();
    const {
        burnerAddress, encryptedBurnerKey, decryptedBurnerKey,
        setDecryptedBurnerKey, refreshProfile, fetchedFromChain,
        hasOnChainRecord, appPassword,
        decryptedBurnerAddress, hasBurnerOnChainRecord
    } = useBurnerWallet();
    const networkId = (import.meta.env.VITE_NETWORK || 'preprod') as string;

    const [isGenerating, setIsGenerating] = useState(false);
    const [isDecrypting, setIsDecrypting] = useState(false);
    const [isRemoving, setIsRemoving] = useState(false);
    const [isScanningBalances, setIsScanningBalances] = useState(false);
    const [copied, setCopied] = useState(false);
    const [copiedAddress, setCopiedAddress] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [showGenerateModal, setShowGenerateModal] = useState(false);
    const [showUnlockModal, setShowUnlockModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [showRemoveModal, setShowRemoveModal] = useState(false);

    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const [privateBalances, setPrivateBalances] = useState<PrivateBalances>({ TDUST: -1 });

    const logsEndRef = useRef<HTMLDivElement>(null);

    const addLog = useCallback((_msg: string) => {
        setTimeout(() => logsEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    }, []);

    const fetchPrivateBalances = useCallback(async () => {
        if (!decryptedBurnerKey) return;
        setIsScanningBalances(true);
        setPrivateBalances({ TDUST: -1 });
        try {
            const balances = await fetchAllPrivateBalances(decryptedBurnerKey);
            setPrivateBalances(balances);
        } catch (e) {
            console.error('Failed to fetch private balances:', e);
            setPrivateBalances({ TDUST: 0 });
        } finally {
            setIsScanningBalances(false);
        }
    }, [decryptedBurnerKey]);

    const handleGenerateBurner = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!walletAddress) { setError('Wallet not connected.'); return; }
        if (!appPassword) { setError('App is locked.'); return; }
        try {
            setIsGenerating(true);
            setError(null);
            const generatedWallet = generateBurnerWallet(networkId);
            const newAddress = generatedWallet.address;
            const rawPrivateKeyStr = generatedWallet.secret;
            const encryptedKeyPayload = await encryptWithPassword(rawPrivateKeyStr, appPassword);
            const encryptedBurnerAddress = await encryptWithPassword(newAddress, appPassword);
            const encryptedMainAddress = await encryptWithPassword(walletAddress, appPassword);
            const { updateUserProfile } = await import('../../../../services/api');
            await updateUserProfile(walletAddress, encryptedMainAddress, encryptedBurnerAddress, encryptedKeyPayload);
            setDecryptedBurnerKey(rawPrivateKeyStr);
            await refreshProfile();
            setShowGenerateModal(false);
            setPassword('');
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Failed to generate Burner Wallet.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleUnlockBurner = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!encryptedBurnerKey) return;
        if (!appPassword) { setError('App is locked.'); return; }
        try {
            setIsDecrypting(true);
            setError(null);
            const decryptedKey = await decryptWithPassword(encryptedBurnerKey, appPassword);
            if (!/^[0-9a-fA-F]{64}$/.test(decryptedKey)) {
                throw new Error('Invalid burner key payload.');
            }
            setDecryptedBurnerKey(decryptedKey);
            setShowUnlockModal(false);
            setPassword('');
        } catch (err: any) {
            console.error('Unlock failed', err);
            setError('Incorrect password or corrupted data.');
        } finally {
            setIsDecrypting(false);
        }
    };

    const handleCopyKey = () => {
        if (!decryptedBurnerKey) return;
        navigator.clipboard.writeText(decryptedBurnerKey);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleCopyAddress = () => {
        const addressToCopy = decryptedBurnerAddress || burnerAddress;
        if (!addressToCopy) return;
        navigator.clipboard.writeText(addressToCopy);
        setCopiedAddress(true);
        setTimeout(() => setCopiedAddress(false), 2000);
    };

    const handleDownloadBackup = () => {
        if (!burnerAddress || !encryptedBurnerKey || !walletAddress) {
            setError('Burner wallet backup is not available yet.');
            return;
        }

        const payload = {
            version: 1,
            exported_at: new Date().toISOString(),
            main_wallet: walletAddress,
            burner_address_encrypted: burnerAddress,
            burner_address_plaintext: decryptedBurnerAddress || null,
            burner_key_encrypted: encryptedBurnerKey,
        };

        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `anonpay-burner-backup-${Date.now()}.json`;
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        URL.revokeObjectURL(url);
    };

    const handleDownloadPlaintextBackup = () => {
        if (!decryptedBurnerKey || !decryptedBurnerAddress || !walletAddress) {
            setError('Unlock the burner wallet before exporting it.');
            return;
        }

        const payload = {
            version: 1,
            exported_at: new Date().toISOString(),
            main_wallet: walletAddress,
            burner_address: decryptedBurnerAddress,
            burner_secret_hex: decryptedBurnerKey,
            network: networkId,
        };

        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `anonpay-burner-wallet-${Date.now()}.json`;
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        URL.revokeObjectURL(url);
    };

    const handleRemoveBurner = async () => {
        if (!walletAddress) {
            setError('Wallet not connected.');
            return;
        }

        try {
            setIsRemoving(true);
            setError(null);
            const { clearBurnerData } = await import('../../../../services/api');
            await clearBurnerData(walletAddress);
            setDecryptedBurnerKey(null);
            await refreshProfile();
            setShowRemoveModal(false);
        } catch (err: any) {
            setError(err.message || 'Failed to remove burner wallet.');
        } finally {
            setIsRemoving(false);
        }
    };

    return {
        walletAddress, burnerAddress, decryptedBurnerKey, fetchedFromChain, hasOnChainRecord,
        decryptedBurnerAddress, hasBurnerOnChainRecord,
        isGenerating, isDecrypting, isRemoving, copied, copiedAddress,
        error, setError,
        showGenerateModal, setShowGenerateModal,
        showUnlockModal, setShowUnlockModal,
        showImportModal, setShowImportModal,
        showRemoveModal, setShowRemoveModal,
        password, setPassword, showPassword, setShowPassword,
        logsEndRef,
        privateBalances, setPrivateBalances, isScanningBalances,
        handleGenerateBurner, handleUnlockBurner,
        handleCopyKey, handleCopyAddress, handleDownloadBackup, handleDownloadPlaintextBackup, handleRemoveBurner, fetchPrivateBalances,
        addLog,
    };
}
