import { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

function playPaymentSound() {
    try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const playTone = (freq: number, start: number, duration: number, gain: number) => {
            const osc = ctx.createOscillator();
            const g = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = freq;
            g.gain.setValueAtTime(gain, ctx.currentTime + start);
            g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
            osc.connect(g);
            g.connect(ctx.destination);
            osc.start(ctx.currentTime + start);
            osc.stop(ctx.currentTime + start + duration);
        };
        playTone(523.25, 0, 0.15, 0.3);
        playTone(659.25, 0.12, 0.15, 0.3);
        playTone(783.99, 0.24, 0.25, 0.25);
        setTimeout(() => ctx.close(), 1000);
    } catch (e) {
        console.warn('Could not play notification sound:', e);
    }
}

export const usePaymentMonitor = () => {
    const notifiedInvoices = useRef<Set<string>>(new Set());
    const lastSoundPlayed = useRef<Map<string, number>>(new Map());

    useEffect(() => {
        if (!supabaseUrl || !supabaseKey) return;

        const supabase = createClient(supabaseUrl, supabaseKey);

        const supabaseChannel = supabase.channel('invoices_changes')
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'invoices' },
                (payload) => {
                    const oldRecord = payload.old;
                    const newRecord = payload.new;

                    if (newRecord.status === 'SETTLED' && oldRecord.status !== 'SETTLED') {
                        const dedupKey = `${newRecord.invoice_hash}_SETTLED`;
                        if (notifiedInvoices.current.has(dedupKey)) return;
                        notifiedInvoices.current.add(dedupKey);

                        const now = Date.now();
                        const lastPlayed = lastSoundPlayed.current.get(newRecord.invoice_hash) || 0;
                        if (now - lastPlayed > 5000) {
                            playPaymentSound();
                            lastSoundPlayed.current.set(newRecord.invoice_hash, now);
                        }

                        toast.success(
                            `Invoice ${newRecord.invoice_hash.slice(0, 8)}... settled!`,
                            { id: dedupKey, duration: 6000, position: 'top-right' },
                        );
                    }
                },
            )
            .subscribe();

        return () => {
            supabaseChannel.unsubscribe();
        };
    }, []);
};
