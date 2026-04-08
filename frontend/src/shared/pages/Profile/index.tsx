import { useMidnightWallet } from '../../hooks/Wallet/WalletProvider';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '../../components/ui/GlassCard';
import { useTransactions } from '../../hooks/useTransactions';
import { useBurnerWallet } from '../../hooks/BurnerWalletProvider';
import { useWalletErrorHandler } from '../../hooks/Wallet/WalletErrorBoundary';
import { StatsCards } from './components/StatsCards';
import { InvoiceTable } from './components/InvoiceTable';
import { PaidInvoicesTable } from './components/PaidInvoicesTable';
import { VerifyModal } from './components/modals/VerifyModal';
import toast from 'react-hot-toast';
import { PaymentHistoryModal } from './components/modals/PaymentHistoryModal';
import { ReceiptHashesModal } from './components/modals/ReceiptHashesModal';
import { BurnerWalletSettings } from './components/BurnerWalletSettings';
import { BackupBanner } from './components/BackupBanner';
import { InvoiceDistributionChart } from './components/Charts/InvoiceDistributionChart';
import { TokenDistributionChart } from './components/Charts/TokenDistributionChart';
import { WalletBalances } from './components/WalletBalances';
import { useWalletBalances } from '../../hooks/useWalletBalances';
import { DashboardChatbot } from './components/DashboardChatbot';
import { deriveInvoiceRecordFromDbInvoice, deriveMerchantReceiptsFromInvoice, normalizeInvoiceHash, readStoredPayerReceipts } from '../../utils/receipts';

// Midnight types — replaces Midnight receipt/invoice types
export interface MerchantReceipt {
    invoiceHash: string;
    amount: number;
    tokenType: number;
    receiptHash: string;
    timestamp?: number;
}

export interface InvoiceRecord {
    invoiceHash: string;
    amount: number;
    tokenType: number;
    invoiceType: number;
    owner: string;
    salt: string;
    memo?: string;
    walletType?: number;
}

export interface PayerReceipt {
    invoiceHash: string;
    amount: number;
    tokenType: number;
    receiptHash: string;
}

const Profile: React.FC = () => {
    const { walletAddress } = useMidnightWallet();
    const { handleWalletError } = useWalletErrorHandler();
    const { decryptedBurnerAddress } = useBurnerWallet();
    const publicKey = walletAddress;
    const { transactions: mainTransactions, loading: loadingTransactions, fetchTransactions } = useTransactions(publicKey || undefined);
    const [burnerDbTransactions, setBurnerDbTransactions] = useState<any[]>([]);

    // Merge main + burner DB transactions so fetchBurnerData can find burner TX IDs
    const transactions = useMemo(() => {
        const merged = [...mainTransactions];
        const existingHashes = new Set(mainTransactions.map(t => t.invoice_hash));
        burnerDbTransactions.forEach(t => {
            if (!existingHashes.has(t.invoice_hash)) {
                merged.push(t);
            }
        });
        return merged;
    }, [mainTransactions, burnerDbTransactions]);
    const [settling, setSettling] = useState<string | null>(null);
    const [showVerifyModal, setShowVerifyModal] = useState(false);
    const [verifyInput, setVerifyInput] = useState('');
    const [verifyStatus, setVerifyStatus] = useState<'IDLE' | 'CHECKING' | 'FOUND' | 'NOT_FOUND' | 'ERROR' | 'MISMATCH'>('IDLE');
    const [verifiedRecord, setVerifiedRecord] = useState<any>(null);
    const [verifyingInvoice, setVerifyingInvoice] = useState<any>(null);
    const [selectedPaymentIds, setSelectedPaymentIds] = useState<string[] | null>(null);
    const [selectedReceiptHashes, setSelectedReceiptHashes] = useState<string[] | null>(null);
    const [invoiceSearch, setInvoiceSearch] = useState('');
    const [activeTab, setActiveTab] = useState<'created' | 'paid'>('created');
    const [merchantReceipts, setMerchantReceipts] = useState<MerchantReceipt[]>([]);
    const [createdInvoices, setCreatedInvoices] = useState<InvoiceRecord[]>([]);
    const [payerReceipts, setPayerReceipts] = useState<PayerReceipt[]>([]);
    const [burnerCreatedInvoices, setBurnerCreatedInvoices] = useState<InvoiceRecord[]>([]);
    const [burnerMerchantReceipts, setBurnerMerchantReceipts] = useState<MerchantReceipt[]>([]);
    const [loadingReceipts, setLoadingReceipts] = useState(false);
    const [loadingCreated, setLoadingCreated] = useState(false);
    const [loadingBurner, setLoadingBurner] = useState(true);
    const [loadingPayerReceipts, setLoadingPayerReceipts] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const fetchPayerReceiptsRef = useRef(0);

    const [profileMainHash, setProfileMainHash] = useState<string | null>(null);
    const [profileBurnerHash, setProfileBurnerHash] = useState<string | null>(null);
    const { balances } = useWalletBalances();

    useEffect(() => {
        const fetchProfileData = async () => {
            if (publicKey) {
                try {
                    const { getUserProfile } = await import('../../services/api');
                    const profile = await getUserProfile(publicKey);
                    if (profile) {
                        setProfileMainHash(profile.profile_main_invoice_hash || null);
                        setProfileBurnerHash(profile.profile_burner_invoice_hash || null);
                    }
                } catch (e) {
                    console.error("Failed to fetch profile hashes for exclusion", e);
                }
            }
        };
        fetchProfileData();
    }, [publicKey]);

    useEffect(() => {
        if (publicKey) {
            fetchTransactions();
            fetchCreatedInvoices();
            fetchMerchantReceipts();
            fetchPayerReceipts();
        }
    }, [publicKey]);

    useEffect(() => {
        if (!publicKey) return;
        fetchCreatedInvoices();
        fetchMerchantReceipts();
    }, [publicKey, mainTransactions]);

    useEffect(() => {
        if (!publicKey) return;
        fetchPayerReceipts();
    }, [publicKey, transactions.length]);

    // Fetch burner invoices from DB separately (they have a different merchant_address_hash)
    useEffect(() => {
        console.log("🔥 [BurnerDB] Effect fired. decryptedBurnerAddress:", !!decryptedBurnerAddress, decryptedBurnerAddress?.slice(0, 15));
        const fetchBurnerDbInvoices = async () => {
            if (!decryptedBurnerAddress) {
                setBurnerDbTransactions([]);
                return;
            }
            try {
                const { fetchInvoicesByMerchant: fetchByMerchant } = await import('../../services/api');
                const data = await fetchByMerchant(decryptedBurnerAddress);
                console.log(`🔥 [BurnerDB] Fetched ${data.length} burner invoices from DB`);
                setBurnerDbTransactions(data);
            } catch (e) {
                console.error('Failed to fetch burner DB invoices', e);
            }
        };
        fetchBurnerDbInvoices();
    }, [decryptedBurnerAddress]);

    useEffect(() => {
        const fetchBurnerData = async () => {
            if (!decryptedBurnerAddress) {
                setBurnerCreatedInvoices([]);
                setBurnerMerchantReceipts([]);
                setLoadingBurner(false);
                return;
            }
            setLoadingBurner(true);

            const burnerInvoices = burnerDbTransactions.map((invoice) => deriveInvoiceRecordFromDbInvoice(invoice));
            const newCreated: InvoiceRecord[] = burnerInvoices;
            const newReceipts: MerchantReceipt[] = burnerDbTransactions.flatMap((invoice) =>
                deriveMerchantReceiptsFromInvoice(invoice)
            );
            setBurnerCreatedInvoices(newCreated);
            setBurnerMerchantReceipts(newReceipts);
            setLoadingBurner(false);
        };
        fetchBurnerData();
    }, [burnerDbTransactions, decryptedBurnerAddress]);

    const fetchCreatedInvoices = async () => {
        if (!publicKey) return;
        setLoadingCreated(true);
        try {
            const validInvoices: InvoiceRecord[] = mainTransactions
                .filter((invoice) => !invoice.is_burner)
                .map((invoice) => deriveInvoiceRecordFromDbInvoice(invoice));
            setCreatedInvoices(validInvoices.reverse());
        } catch (e) {
            handleWalletError(e);
            console.error("Error fetching created invoices:", e);
        } finally {
            setLoadingCreated(false);
        }
    };

    const fetchMerchantReceipts = async () => {
        if (!publicKey) return;
        setLoadingReceipts(true);
        try {
            const validReceipts: MerchantReceipt[] = mainTransactions
                .filter((invoice) => !invoice.is_burner)
                .flatMap((invoice) => deriveMerchantReceiptsFromInvoice(invoice));
            setMerchantReceipts(validReceipts.reverse());
        } catch (e) {
            handleWalletError(e);
            console.error("Error fetching merchant receipts:", e);
        } finally {
            setLoadingReceipts(false);
        }
    };

    const fetchPayerReceipts = async () => {
        if (!publicKey) return;
        const fetchId = ++fetchPayerReceiptsRef.current;
        setLoadingPayerReceipts(true);
        try {
            if (fetchId !== fetchPayerReceiptsRef.current) {
                return;
            }
            const validReceipts: PayerReceipt[] = readStoredPayerReceipts().map((receipt) => ({
                invoiceHash: normalizeInvoiceHash(receipt.invoiceHash),
                amount: receipt.amount,
                tokenType: receipt.tokenType,
                receiptHash: receipt.receiptHash,
            }));
            setPayerReceipts([...validReceipts].reverse());
        } catch (e) {
            handleWalletError(e);
            console.error(`[fetchPayerReceipts #${fetchId}] Error:`, e);
        } finally {
            if (fetchId === fetchPayerReceiptsRef.current) {
                setLoadingPayerReceipts(false);
            }
        }
    };

    const sdkHashSet = useMemo(() => {
        return new Set(transactions.filter(tx => tx.for_sdk).map(tx => tx.invoice_hash));
    }, [transactions]);

    const combinedInvoices = useMemo(() => {
        const merged = new Map<string, any>();
        console.log("🔄 Merging Invoices! Created:", createdInvoices.length, "Burner Created:", burnerCreatedInvoices.length);

        // 1. Index DB transactions for quick lookup (Metadata only)
        const dbMap = new Map<string, any>();
        transactions.forEach(tx => {
            if (tx.invoice_hash) dbMap.set(tx.invoice_hash, tx);
        });

        // 2. Layer on On-Chain Records (Authoritative Data)
        // MAIN WALLET INVOICES
        createdInvoices.forEach(record => {
            if (record.invoiceHash === profileMainHash || record.invoiceHash === profileBurnerHash) return; // Filter explicitly only Profile QRs from the Dashboard!
            if (sdkHashSet.has(record.invoiceHash)) return; // Filter explicitly SDK invoices from the Main Dashboard!

            const dbTx = dbMap.get(record.invoiceHash);

            merged.set(record.invoiceHash, {
                invoiceHash: record.invoiceHash,
                amount: record.amount / 1_000_000,
                tokenType: record.tokenType,
                invoiceType: record.invoiceType,
                walletType: 0, // Enforce Main Wallet
                owner: record.owner,
                salt: record.salt,

                // Merge DB Metadata if available
                status: dbTx?.status === 'SETTLED' ? 'SETTLED' : 'PENDING',
                creationTx: dbTx?.invoice_transaction_id || null,
                paymentTxIds: dbTx?.payment_tx_ids || (dbTx?.payment_tx_id ? [dbTx.payment_tx_id] : []),
                memo: record.memo || dbTx?.memo || '',
                isPending: false,
                source: 'chain',
                isValidOnChain: true
            });
        });

        // BURNER WALLET INVOICES
        burnerCreatedInvoices.forEach(record => {
            if (record.invoiceHash === profileMainHash || record.invoiceHash === profileBurnerHash) return; // Filter explicitly only Profile QRs from the Dashboard!
            if (sdkHashSet.has(record.invoiceHash)) return; // Filter explicitly SDK invoices from the Main Dashboard!

            const dbTx = dbMap.get(record.invoiceHash);

            merged.set(record.invoiceHash, {
                invoiceHash: record.invoiceHash,
                amount: record.amount / 1_000_000,
                tokenType: record.tokenType,
                invoiceType: record.invoiceType,
                walletType: 1, // Enforce Burner Wallet
                owner: record.owner,
                salt: record.salt,

                // Merge DB Metadata if available
                status: dbTx?.status === 'SETTLED' ? 'SETTLED' : 'PENDING',
                creationTx: dbTx?.invoice_transaction_id || null,
                paymentTxIds: dbTx?.payment_tx_ids || (dbTx?.payment_tx_id ? [dbTx.payment_tx_id] : []),
                memo: record.memo || dbTx?.memo || '',
                isPending: false,
                source: 'chain',
                isValidOnChain: true
            });
        });
        // 3. Aggregate donation totals from MerchantReceipts
        const allReceipts = [...merchantReceipts, ...burnerMerchantReceipts];
        const donationTotals = new Map<string, { credits: number, usdcx: number, usad: number }>();
        allReceipts.forEach(receipt => {
            const hash = receipt.invoiceHash.replace('field', '');
            if (!donationTotals.has(hash)) {
                donationTotals.set(hash, { credits: 0, usdcx: 0, usad: 0 });
            }
            const totals = donationTotals.get(hash)!;
            const amt = receipt.amount / 1_000_000;
            if (receipt.tokenType === 0) totals.credits += amt;
            else if (receipt.tokenType === 1) totals.usdcx += amt;
            else if (receipt.tokenType === 2) totals.usad += amt;
        });

        // Attach donation totals to donation invoices (invoiceType === 2)
        merged.forEach((inv, hash) => {
            if (inv.invoiceType === 2) {
                const normalizedHash = hash.replace('field', '');
                const totals = donationTotals.get(normalizedHash);
                if (totals) {
                    inv.donations = totals;
                    // Set the display amount to the total across all token types
                    inv.amount = totals.credits + totals.usdcx + totals.usad;
                }
            }
        });

        const finalArr = Array.from(merged.values());
        console.log("🔄 Final Combined Invoices Array (excluding Tips):", finalArr.length, finalArr);
        return finalArr;
    }, [transactions, createdInvoices, merchantReceipts, burnerCreatedInvoices, burnerMerchantReceipts]);

    const handleVerifyReceipt = async () => {
        if (!verifyInput) return;

        try {
            setVerifyStatus('CHECKING');
            setVerifiedRecord(null);
            const allReceipts = [...merchantReceipts, ...burnerMerchantReceipts];
            const foundRecord = allReceipts.find((receipt) => receipt.receiptHash === verifyInput.trim());
            if (foundRecord) {
                const recordHash = normalizeInvoiceHash(foundRecord.invoiceHash);
                const invoiceHash = normalizeInvoiceHash(verifyingInvoice.invoiceHash || verifyingInvoice.invoice_hash);

                if (verifyingInvoice && recordHash !== invoiceHash) {
                    setVerifiedRecord({ ...foundRecord, amount: Number(foundRecord.amount) / 1_000_000 });
                    setVerifyStatus('MISMATCH');
                } else {
                    setVerifiedRecord({ ...foundRecord, amount: Number(foundRecord.amount) / 1_000_000 });
                    setVerifyStatus('FOUND');
                }
            } else {
                setVerifyStatus('NOT_FOUND');
            }

        } catch (e) {
            handleWalletError(e);
            console.error("Verification failed", e);
            setVerifyStatus('ERROR');
        }
    };



    const uniqueMainReceipts = useMemo(() => {
        return Array.from(new Map(merchantReceipts.map((receipt) => [receipt.receiptHash, receipt])).values())
            .filter((receipt) => receipt.invoiceHash !== profileMainHash && receipt.invoiceHash !== profileBurnerHash && !sdkHashSet.has(receipt.invoiceHash));
    }, [merchantReceipts, profileMainHash, profileBurnerHash, sdkHashSet]);

    const uniqueBurnerReceipts = useMemo(() => {
        return Array.from(new Map(burnerMerchantReceipts.map((receipt) => [receipt.receiptHash, receipt])).values())
            .filter((receipt) => receipt.invoiceHash !== profileMainHash && receipt.invoiceHash !== profileBurnerHash && !sdkHashSet.has(receipt.invoiceHash));
    }, [burnerMerchantReceipts, profileMainHash, profileBurnerHash, sdkHashSet]);

    const merchantStats = useMemo(() => {
        return {
            mainPaid: uniqueMainReceipts
                .filter((receipt) => receipt.tokenType !== 1 && receipt.tokenType !== 2)
                .reduce((acc, curr) => acc + (Number(curr.amount) / 1_000_000 || 0), 0)
                .toFixed(2),
            mainPending: uniqueMainReceipts
                .filter((receipt) => receipt.tokenType === 1)
                .reduce((acc, curr) => acc + (Number(curr.amount) / 1_000_000 || 0), 0)
                .toFixed(2),
            mainExpired: uniqueMainReceipts
                .filter((receipt) => receipt.tokenType === 2)
                .reduce((acc, curr) => acc + (Number(curr.amount) / 1_000_000 || 0), 0)
                .toFixed(2),
            burnerPaid: uniqueBurnerReceipts
                .filter((receipt) => receipt.tokenType !== 1 && receipt.tokenType !== 2)
                .reduce((acc, curr) => acc + (Number(curr.amount) / 1_000_000 || 0), 0)
                .toFixed(2),
            burnerPending: uniqueBurnerReceipts
                .filter((receipt) => receipt.tokenType === 1)
                .reduce((acc, curr) => acc + (Number(curr.amount) / 1_000_000 || 0), 0)
                .toFixed(2),
            burnerExpired: uniqueBurnerReceipts
                .filter((receipt) => receipt.tokenType === 2)
                .reduce((acc, curr) => acc + (Number(curr.amount) / 1_000_000 || 0), 0)
                .toFixed(2),
            mainTDUST: uniqueMainReceipts
                .filter((receipt) => receipt.tokenType !== 1 && receipt.tokenType !== 2)
                .reduce((acc, curr) => acc + (Number(curr.amount) / 1_000_000 || 0), 0)
                .toFixed(2),
            burnerTDUST: uniqueBurnerReceipts
                .filter((receipt) => receipt.tokenType !== 1 && receipt.tokenType !== 2)
                .reduce((acc, curr) => acc + (Number(curr.amount) / 1_000_000 || 0), 0)
                .toFixed(2),
            invoices: combinedInvoices.length,
            settled: combinedInvoices.filter((invoice) => invoice.status === 'SETTLED' || invoice.status === 1).length,
            pending: combinedInvoices.filter((invoice) => invoice.status === 'PENDING' || invoice.status === 0).length
        };
    }, [combinedInvoices, uniqueBurnerReceipts, uniqueMainReceipts]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    const openExplorer = (txId?: string) => {
        if (txId) {
            window.open(`https://explorer.midnight.network/transaction/${txId}`, '_blank');
        }
    };

    const handleSettle = async (invoice: any) => {
        if (!invoice || !invoice.salt) return;
        setSettling(invoice.invoiceHash);
        try {
            const { updateInvoiceStatus } = await import('../../services/api');
            await updateInvoiceStatus(invoice.invoiceHash, {
                status: 'SETTLED'
            });
            toast.success('Invoice marked as settled.');
            setTimeout(() => {
                fetchCreatedInvoices();
                fetchTransactions();
            }, 500);
        } catch (e: any) {
            if (handleWalletError(e)) return;
            console.error("Settlement failed", e);
            toast.error("Failed to settle invoice: " + (e.message || "Unknown error"));
        } finally {
            setSettling(null);
        }
    };

    return (
        <div className="page-container relative min-h-screen">
            {/* BACKGROUND */}
            <div className="fixed inset-0 pointer-events-none z-0 opacity-30">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-500/5 rounded-full blur-[120px] animate-float" />
                <div className="absolute top-[20%] right-[-5%] w-[30%] h-[30%] bg-amber-400/10 rounded-full blur-[100px] animate-float-delayed" />
                <div className="absolute bottom-[-10%] left-[20%] w-[35%] h-[35%] bg-orange-500/5 rounded-full blur-[120px] animate-pulse-slow" />
            </div>
            <div className="absolute top-[-150px] left-1/2 -translate-x-1/2 w-screen h-[800px] z-0 pointer-events-none flex justify-center overflow-hidden">
                <img
                    src="/assets/anonpay_logo.png"
                    alt="AnonPay"
                    className="w-full h-full object-cover opacity-50 mix-blend-screen mask-image-gradient-b"
                    style={{
                        maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)',
                        WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)'
                    }}
                />
            </div>


            {/* VERIFY MODAL */}
            <VerifyModal
                isOpen={showVerifyModal}
                onClose={() => setShowVerifyModal(false)}
                verifyingInvoice={verifyingInvoice}
                verifyInput={verifyInput}
                setVerifyInput={setVerifyInput}
                verifyStatus={verifyStatus}
                verifiedRecord={verifiedRecord}
                merchantReceipts={[...merchantReceipts, ...burnerMerchantReceipts]}
                onVerify={handleVerifyReceipt}
            />

            {/* TRANSACTION HISTORY MODAL (Legacy) */}
            <PaymentHistoryModal
                paymentIds={selectedPaymentIds}
                onClose={() => setSelectedPaymentIds(null)}
                onViewTx={openExplorer}
            />

            {/* RECEIPT HASHES MODAL */}
            <ReceiptHashesModal
                receiptHashes={selectedReceiptHashes}
                onClose={() => setSelectedReceiptHashes(null)}
            />

            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="w-full max-w-7xl mx-auto pt-10 relative z-10 pb-20"
            >
                {/* HEADER */}
                <motion.div variants={itemVariants} className="flex flex-col items-center justify-center text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tighter leading-tight text-white">
                        Merchant <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-300 to-orange-500 drop-shadow-[0_0_15px_rgba(249,115,22,0.3)]">Dashboard</span>
                    </h1>
                    <p className="text-gray-400 text-sm leading-relaxed max-w-xs mb-6">
                        Manage your invoices and settlements.
                    </p>

                    {/* NEW: WALLET BALANCES */}
                    <WalletBalances itemVariants={itemVariants} balances={balances} />
                </motion.div>

                {/* BACKUP BANNER */}
                <BackupBanner />

                {/* TOP ROW: Stats & Charts */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-4">
                    {/* STATS */}
                    <div className="xl:col-span-1">
                        <StatsCards
                            merchantStats={merchantStats}
                            loadingReceipts={loadingReceipts}
                            loadingCreated={loadingCreated}
                            loadingBurner={loadingBurner}
                            itemVariants={itemVariants}
                        />
                    </div>

                    {/* CHARTS */}
                    <motion.div variants={itemVariants} className="xl:col-span-1 grid grid-cols-1 sm:grid-cols-2 gap-4 h-full">
                        <InvoiceDistributionChart invoices={loadingBurner ? [] : combinedInvoices} isLoading={loadingCreated || loadingBurner} />
                        <TokenDistributionChart receipts={[...merchantReceipts, ...burnerMerchantReceipts]} isLoading={loadingReceipts || loadingBurner} />
                    </motion.div>
                </div>

                {/* BURNER WALLET SETTINGS - FULL WIDTH */}
                <BurnerWalletSettings itemVariants={itemVariants} transactions={transactions} />

                {/* INVOICE HISTORY */}
                <GlassCard variants={itemVariants} className="p-0 overflow-hidden">
                    <div className="p-6 border-b border-white/5 flex flex-col items-center justify-center gap-4">
                        <div className="flex p-1 bg-black/40 backdrop-blur-xl rounded-full border border-white/10 relative">
                            {['created', 'paid'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab as any)}
                                    className={`relative z-10 px-6 py-2 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === tab ? 'text-black' : 'text-gray-400 hover:text-white'
                                        }`}
                                >
                                    {activeTab === tab && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className="absolute inset-0 bg-white rounded-full -z-10"
                                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                        />
                                    )}
                                    {tab === 'created' ? 'My Invoices' : 'Paid Invoices'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* SEARCH */}
                    <div className="px-6 pb-4">
                        <div className="relative max-w-md mx-auto">
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search by invoice hash..."
                                value={invoiceSearch}
                                onChange={(e) => setInvoiceSearch(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-10 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-neon-primary/50 focus:ring-1 focus:ring-neon-primary/30 transition-colors"
                            />
                            {invoiceSearch && (
                                <button
                                    onClick={() => setInvoiceSearch('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="overflow-x-auto min-h-[300px]">
                        {/* CREATED TAB */}
                        <div style={{ display: activeTab === 'created' ? 'block' : 'none' }}>
                            <InvoiceTable
                                invoices={loadingBurner ? [] : combinedInvoices}
                                loading={loadingCreated || loadingTransactions || loadingBurner}
                                search={invoiceSearch}
                                currentPage={currentPage}
                                itemsPerPage={itemsPerPage}
                                setCurrentPage={setCurrentPage}
                                onVerify={(inv) => {
                                    setVerifyingInvoice(inv);
                                    setVerifyInput('');
                                    setVerifyStatus('IDLE');
                                    setVerifiedRecord(null);
                                    setShowVerifyModal(true);
                                }}
                                onSettle={handleSettle}
                                settlingId={settling}
                                onViewPayments={(ids) => setSelectedPaymentIds(ids)}
                                transactions={transactions}
                            />
                        </div>

                        {/* PAID TAB */}
                        <div style={{ display: activeTab === 'paid' ? 'block' : 'none' }}>
                            <PaidInvoicesTable
                                receipts={payerReceipts}
                                loading={loadingPayerReceipts}
                                search={invoiceSearch}
                                onViewReceipts={(hashes) => setSelectedReceiptHashes(hashes)}
                            />
                        </div>
                    </div>
                    {/* PRIVACY FOOTER */}
                    <div className="p-4 bg-white/5 border-t border-white/5 text-center text-xs text-gray-500 italic">
                        All this information is fetched from your private account records.
                    </div>
                </GlassCard>
            </motion.div>

            <DashboardChatbot
                mainWalletAddress={publicKey || null}
                burnerWalletAddress={decryptedBurnerAddress || null}
                balances={balances}
                merchantStats={merchantStats}
                invoices={loadingBurner ? [] : combinedInvoices}
                mainMerchantReceipts={uniqueMainReceipts}
                burnerMerchantReceipts={uniqueBurnerReceipts}
                payerReceipts={payerReceipts}
                loadingInvoices={loadingCreated || loadingTransactions || loadingBurner}
                loadingReceipts={loadingReceipts || loadingBurner}
                loadingPayerReceipts={loadingPayerReceipts}
            />
        </div>
    );
};

export default Profile;
