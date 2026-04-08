import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useCreateInvoice, InvoiceType } from '../../../shared/hooks/useCreateInvoice';
import { MobileInvoiceForm } from '../../components/InvoiceForm';
import { InvoiceCard } from '../../../shared/components/invoice/InvoiceCard';
import { useBurnerWallet } from '../../../shared/hooks/BurnerWalletProvider';
import { useMidnightWallet } from '../../../shared/hooks/Wallet/WalletProvider';
import type { InvoiceData, InvoiceItem } from '../../../shared/types/invoice';
import toast from 'react-hot-toast';

const MobileCreateInvoice: React.FC = () => {
    const { createInvoice, isLoading, error } = useCreateInvoice();
    const { burnerAddress } = useBurnerWallet();
    const { walletAddress } = useMidnightWallet();
    const hasBurnerWallet = !!burnerAddress;

    // form state lives in the page now — keeps the hook focused on chain logic
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

    const updateItem = useCallback((index: number, field: string, value: string | number) => {
        setItems((prev) => {
            const updated = [...prev];
            const item = { ...updated[index] };
            if (field === 'name') item.name = value as string;
            else if (field === 'quantity') { item.quantity = Number(value) || 0; item.total = item.quantity * item.unitPrice; }
            else if (field === 'unitPrice') { item.unitPrice = Number(value) || 0; item.total = item.quantity * item.unitPrice; }
            updated[index] = item;
            const total = updated.reduce((sum, i) => sum + i.total, 0);
            setAmount(total > 0 ? total : '');
            return updated;
        });
    }, []);

    const removeItem = useCallback((index: number) => {
        setItems((prev) => {
            const updated = prev.filter((_, i) => i !== index);
            const total = updated.reduce((sum, i) => sum + i.total, 0);
            setAmount(updated.length > 0 && total > 0 ? total : '');
            return updated;
        });
    }, []);

    const handleCreate = useCallback(async () => {
        const invoiceAmount = invoiceType === 'donation'
            ? 0n
            : BigInt(Math.round(Number(amount) * 1_000_000));

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
        } else if (error) {
            toast.error(error);
        }
    }, [amount, createInvoice, error, forSdk, invoiceType, items, memo, showItems, walletType]);

    const resetInvoice = useCallback(() => {
        setInvoiceData(null);
        setAmount('');
        setMemo('');
        setInvoiceType('standard');
        setWalletType(0);
        setItems([]);
        setShowItems(false);
        setForSdk(false);
    }, []);

    return (
        <div className="page-container relative min-h-screen pt-0 px-4">
            <div className="w-full max-w-2xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center text-center mb-8"
                >
                    <h1 className="text-3xl font-bold mb-4 tracking-tighter leading-none text-white">
                        Create <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-primary to-neon-accent">AnonPay Invoice</span>
                    </h1>
                    <p className="text-gray-400 text-sm leading-relaxed max-w-xs mb-2">
                        Generate a privacy-preserving invoice link.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 gap-12 items-start">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="w-full"
                    >
                        {!invoiceData ? (
                            <MobileInvoiceForm
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
        </div>
    );
};

export default MobileCreateInvoice;
