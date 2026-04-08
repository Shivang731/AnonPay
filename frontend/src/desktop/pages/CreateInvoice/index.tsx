import React, { useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { pageVariants } from '../../../shared/utils/animations';
import { useCreateInvoice, type InvoiceType } from '../../../shared/hooks/useCreateInvoice';
import { InvoiceForm } from '../../../shared/components/invoice/InvoiceForm';
import { InvoiceCard } from '../../../shared/components/invoice/InvoiceCard';
import { MidnightTokenInfo } from '../../components/USDCxInfo';
import { useBurnerWallet } from '../../../shared/hooks/BurnerWalletProvider';
import { useMidnightWallet } from '../../../shared/hooks/Wallet/WalletProvider';
import type { InvoiceData, InvoiceItem } from '../../../shared/types/invoice';

export const CreateInvoice: React.FC = () => {
    const { createInvoice, isLoading, error } = useCreateInvoice();
    const { burnerAddress } = useBurnerWallet();
    const { walletAddress } = useMidnightWallet();
    const hasBurnerWallet = !!burnerAddress;

    const [amount, setAmount] = useState<number | ''>('');
    const [memo, setMemo] = useState('');
    const [invoiceType, setInvoiceType] = useState<InvoiceType>('standard');
    const [walletType, setWalletType] = useState(0);
    const [forSdk, setForSdk] = useState(false);
    const [items, setItems] = useState<InvoiceItem[]>([]);
    const [showItems, setShowItems] = useState(false);
    const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);

    const addItem = useCallback(() => {
        setItems((prev) => [...prev, { name: '', quantity: 1, unitPrice: 0, total: 0 }]);
    }, []);

    const updateItem = useCallback((index: number, field: keyof InvoiceItem, value: string | number) => {
        setItems((prev) => {
            const updated = [...prev];
            const item = { ...updated[index] };
            if (field === 'name') item.name = value as string;
            if (field === 'quantity') item.quantity = Number(value) || 0;
            if (field === 'unitPrice') item.unitPrice = Number(value) || 0;
            item.total = item.quantity * item.unitPrice;
            updated[index] = item;

            const total = updated.reduce((sum, entry) => sum + entry.total, 0);
            setAmount(total > 0 ? total : '');

            return updated;
        });
    }, []);

    const removeItem = useCallback((index: number) => {
        setItems((prev) => {
            const updated = prev.filter((_, itemIndex) => itemIndex !== index);
            const total = updated.reduce((sum, entry) => sum + entry.total, 0);
            setAmount(updated.length > 0 && total > 0 ? total : '');
            return updated;
        });
    }, []);

    const handleCreate = useCallback(async () => {
        const invoiceAmount = invoiceType === 'donation'
            ? 0n
            : BigInt(Math.round(Number(amount || 0) * 1_000_000));

        const result = await createInvoice({
            amount: invoiceAmount,
            memo,
            type: invoiceType,
            walletType,
            forSdk,
            items: showItems ? items : [],
        });
        if (result) {
            setInvoiceData(result.invoiceData);
        }
    }, [amount, createInvoice, forSdk, invoiceType, items, memo, showItems, walletType]);

    const resetInvoice = useCallback(() => {
        setInvoiceData(null);
        setAmount('');
        setMemo('');
        setInvoiceType('standard');
        setWalletType(0);
        setForSdk(false);
        setItems([]);
        setShowItems(false);
    }, []);

    return (
        <motion.div
            className="page-container relative min-h-screen"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
        >
            <div className="fixed inset-0 pointer-events-none z-0 opacity-30">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/5 rounded-full blur-[120px] animate-float" />
                <div className="absolute top-[20%] right-[-5%] w-[30%] h-[30%] bg-zinc-800/20 rounded-full blur-[100px] animate-float-delayed" />
                <div className="absolute bottom-[-10%] left-[20%] w-[35%] h-[35%] bg-white/5 rounded-full blur-[120px] animate-pulse-slow" />
            </div>

            <div className="absolute top-[-150px] left-1/2 -translate-x-1/2 w-screen h-[800px] z-0 pointer-events-none flex justify-center overflow-hidden">
                <img
                    src="/assets/anonpay_globe.png"
                    alt="Midnight Network"
                    className="w-full h-full object-cover opacity-50 mix-blend-screen mask-image-gradient-b"
                    style={{
                        maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)',
                        WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)',
                    }}
                />
            </div>

            <div className="w-full max-w-7xl mx-auto pt-12 px-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center text-center mb-8"
                >
                    <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tighter leading-tight text-white">
                        Create <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-emerald-300 to-emerald-500 drop-shadow-[0_0_15px_rgba(126,255,204,0.3)]">AnonPay Invoice</span>
                    </h1>
                    <p className="text-gray-300 text-xl leading-relaxed max-w-2xl mb-2">
                        Generate a privacy-preserving AnonPay invoice link to receive payments securely on the Midnight Network.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-1 gap-12 items-start max-w-2xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="w-full"
                    >
                        {!invoiceData ? (
                            <InvoiceForm
                                amount={amount}
                                setAmount={setAmount}
                                memo={memo}
                                setMemo={setMemo}
                                handleCreate={handleCreate}
                                loading={isLoading}
                                publicKey={walletAddress}
                                status={error || ''}
                                invoiceType={invoiceType}
                                setInvoiceType={setInvoiceType}
                                walletType={walletType}
                                setWalletType={setWalletType}
                                forSdk={forSdk}
                                setForSdk={setForSdk}
                                hasBurnerWallet={hasBurnerWallet}
                                items={items}
                                showItems={showItems}
                                setShowItems={setShowItems}
                                addItem={addItem}
                                updateItem={updateItem}
                                removeItem={removeItem}
                            />
                        ) : (
                            <InvoiceCard
                                invoiceData={invoiceData}
                                resetInvoice={resetInvoice}
                                memo={memo}
                            />
                        )}
                    </motion.div>
                </div>
            </div>

            <MidnightTokenInfo />
        </motion.div>
    );
};

export default CreateInvoice;
