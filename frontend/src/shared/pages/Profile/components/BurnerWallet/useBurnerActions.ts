import { useState, useCallback, useRef } from 'react';
import { useMidnightWallet } from '../../../../hooks/Wallet/WalletProvider';
import { useBurnerWallet } from '../../../../hooks/BurnerWalletProvider';
import { encryptWithPassword, decryptWithPassword } from '../../../../utils/crypto';
import { fetchAllPrivateBalances } from './scanner';
import type { PrivateBalances, SweepCurrency } from './types';

export function useBurnerActions() {
    const { walletAddress } = useMidnightWallet();
    const {
        burnerAddress, encryptedBurnerKey, decryptedBurnerKey,
        setDecryptedBurnerKey, refreshProfile, fetchedFromChain,
        hasOnChainRecord, appPassword,
        decryptedBurnerAddress, hasBurnerOnChainRecord
    } = useBurnerWallet();

    const [isGenerating, setIsGenerating] = useState(false);
    const [isDecrypting, setIsDecrypting] = useState(false);
    const [isBackingUp] = useState(false);
    const [backupSuccess, setBackupSuccess] = useState('');
    const [backupTxId, setBackupTxId] = useState<string | null>(null);
    const [isSweeping] = useState(false);
    const [isScanningBalances, setIsScanningBalances] = useState(false);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [showGenerateModal, setShowGenerateModal] = useState(false);
    const [showUnlockModal, setShowUnlockModal] = useState(false);
    const [showBackupModal, setShowBackupModal] = useState(false);
    const [showSweepModal, setShowSweepModal] = useState(false);

    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [sweepAmount, setSweepAmount] = useState('');
    const [sweepCurrency, setSweepCurrency] = useState<SweepCurrency>('TDUST');
    const [sweepDestination, setSweepDestination] = useState(walletAddress || '');

    const [sweepSuccess, setSweepSuccess] = useState('');
    const [sweepTxId, setSweepTxId] = useState<string | null>(null);
    const [sweepLogs, setSweepLogs] = useState<string[]>([]);

    const [privateBalances, setPrivateBalances] = useState<PrivateBalances>({ TDUST: -1 });

    const logsEndRef = useRef<HTMLDivElement>(null);

    const addLog = useCallback((msg: string) => {
        setSweepLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
        setTimeout(() => logsEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    }, []);

    const openSweepModal = useCallback(() => {
        setError(null);
        setSweepLogs([]);
        setSweepTxId(null);
        setSweepSuccess('');
        setPrivateBalances({ TDUST: -1 });
        setSweepDestination(walletAddress || '');
        setShowSweepModal(true);
        if (decryptedBurnerKey) {
            setIsScanningBalances(true);
            fetchAllPrivateBalances(decryptedBurnerKey)
                .then(setPrivateBalances)
                .catch(() => setPrivateBalances({ TDUST: 0 }))
                .finally(() => setIsScanningBalances(false));
        }
    }, [walletAddress, decryptedBurnerKey]);

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
            // TODO: Generate Midnight keypair instead of Midnight PrivateKey
            const newAddress = 'mn1...' + Math.random().toString(36).substring(2, 8);
            const rawPrivateKeyStr = 'sk1...' + Math.random().toString(36).substring(2, 16);
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

    const handleBackupRecord = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setError('Backup not yet implemented for Midnight. Coming soon.');
    };

    const handleSweepFunds = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('Sweep not yet implemented for Midnight. Coming soon.');
    };

    const handleCopyKey = () => {
        if (!decryptedBurnerKey) return;
        navigator.clipboard.writeText(decryptedBurnerKey);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return {
        walletAddress, burnerAddress, decryptedBurnerKey, fetchedFromChain, hasOnChainRecord,
        decryptedBurnerAddress, hasBurnerOnChainRecord,
        isGenerating, isDecrypting, isBackingUp, isSweeping, copied,
        error, setError,
        showGenerateModal, setShowGenerateModal,
        showUnlockModal, setShowUnlockModal,
        showBackupModal, setShowBackupModal,
        showSweepModal, setShowSweepModal,
        backupSuccess, setBackupSuccess, backupTxId, setBackupTxId,
        password, setPassword, showPassword, setShowPassword,
        sweepAmount, setSweepAmount,
        sweepCurrency, setSweepCurrency,
        sweepDestination, setSweepDestination,
        sweepSuccess, setSweepSuccess, sweepTxId, setSweepTxId,
        sweepLogs, setSweepLogs, logsEndRef,
        privateBalances, setPrivateBalances, isScanningBalances,
        handleGenerateBurner, handleUnlockBurner, handleBackupRecord,
        handleSweepFunds, handleCopyKey, fetchPrivateBalances, openSweepModal,
        addLog,
    };
}
