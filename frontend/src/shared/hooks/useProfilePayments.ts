import { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useBurnerWallet } from './BurnerWalletProvider';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export interface ProfilePayment {
    type: 'main' | 'burner';
    amount: number;
    tokenType: number;
    timestamp: number;
    receiptHash: string;
    txId: string;
}

export const useProfilePayments = (
    mainHash: string | null,
    burnerHash: string | null,
    initialMainReceipts: any[],
    initialBurnerReceipts: any[]
) => {
    
    const { decryptedBurnerKey } = useBurnerWallet();

    const [livePayments, setLivePayments] = useState<ProfilePayment[]>([]);
    const handledTxIds = useRef<Set<string>>(new Set());

    useEffect(() => {
        const base: ProfilePayment[] = [];

        if (mainHash) {
            initialMainReceipts.forEach(r => {
                if (r.invoiceHash === mainHash) {
                    base.push({
                        type: 'main',
                        amount: Number(r.amount) / 1_000_000,
                        tokenType: r.tokenType,
                        timestamp: r.timestamp || 0,
                        receiptHash: r.receiptHash,
                        txId: ''
                    });
                    handledTxIds.current.add(r.receiptHash);
                }
            });
        }

        if (burnerHash) {
            initialBurnerReceipts.forEach(r => {
                if (r.invoiceHash === burnerHash) {
                    base.push({
                        type: 'burner',
                        amount: Number(r.amount) / 1_000_000,
                        tokenType: r.tokenType,
                        timestamp: r.timestamp || 0,
                        receiptHash: r.receiptHash,
                        txId: ''
                    });
                    handledTxIds.current.add(r.receiptHash);
                }
            });
        }

        setLivePayments(base);

    }, [mainHash, burnerHash, initialMainReceipts, initialBurnerReceipts]);

    useEffect(() => {
        if (!mainHash && !burnerHash) return;
        if (!supabaseUrl || !supabaseKey) return;

        const supabase = createClient(supabaseUrl, supabaseKey);

        const channel = supabase.channel('profile_payments')
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'invoices' },
                async (payload) => {
                    const oldRecord = payload.old;
                    const newRecord = payload.new;

                    if (newRecord.invoice_hash !== mainHash && newRecord.invoice_hash !== burnerHash) {
                        return;
                    }

                    let oldTxIds: string[] = [];
                    let newTxIds: string[] = [];
                    try { oldTxIds = Array.isArray(oldRecord.payment_tx_ids) ? oldRecord.payment_tx_ids : JSON.parse(oldRecord.payment_tx_ids || '[]'); } catch (e) { }
                    try { newTxIds = Array.isArray(newRecord.payment_tx_ids) ? newRecord.payment_tx_ids : JSON.parse(newRecord.payment_tx_ids || '[]'); } catch (e) { }

                    if (newTxIds.length > oldTxIds.length) {
                        const newId = newTxIds.find(id => !oldTxIds.includes(id));
                        if (newId) {
                            console.log(`[RealTime] New payment detected for ${newRecord.invoice_hash === mainHash ? 'Main' : 'Burner'} QR! TX:`, newId);
                            setLivePayments(prev => [{
                                type: newRecord.invoice_hash === mainHash ? 'main' : 'burner',
                                amount: Number(newRecord.amount) / 1_000_000,
                                tokenType: newRecord.token_type || 0,
                                timestamp: Date.now(),
                                receiptHash: newId,
                                txId: newId
                            }, ...prev]);
                        }
                    }
                }
            )
            .subscribe();

        return () => {
            channel.unsubscribe();
        };

    }, [mainHash, burnerHash, decryptedBurnerKey]);

    return { unifiedPayments: livePayments };
};
