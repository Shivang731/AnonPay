import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMidnightWallet } from '../../../hooks/Wallet/WalletProvider';
import { Search, Loader2, ArrowRight, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { FloatingGiftCard } from './FloatingGiftCard';

export const RedeemGiftCard: React.FC = () => {
    const { walletAddress } = useMidnightWallet();
    const [inputCode, setInputCode] = useState('');
    const [step, setStep] = useState<'INPUT' | 'LOADING' | 'REDEEMING' | 'SUCCESS'>('INPUT');
    const [redeemedData, setRedeemedData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const handleRedeem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!walletAddress) {
            toast.error('Connect your wallet first.');
            return;
        }
        if (!inputCode.trim()) {
            toast.error('Enter a gift card code.');
            return;
        }

        setError(null);
        setStep('LOADING');

        try {
            await new Promise(r => setTimeout(r, 1500));

            // Gift card redemption not yet implemented for Midnight
            setError('Gift card redemption not yet implemented for Midnight. Coming soon.');
            setStep('INPUT');
        } catch (err: any) {
            setError(err.message || 'Failed to redeem gift card.');
            setStep('INPUT');
        }
    };

    return (
        <div className="w-full">
            <AnimatePresence mode="wait">
                {step === 'INPUT' && (
                    <motion.form
                        key="input"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onSubmit={handleRedeem}
                        className="space-y-5"
                    >
                        <div className="mb-2">
                            <FloatingGiftCard amounts={{ TDUST: '0' }} isInteractive={false} />
                        </div>

                        <div className="relative flex items-center bg-white/[0.02] rounded-2xl overflow-hidden group h-14">
                            <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent group-focus-within:via-orange-500/50 transition-all duration-500" />
                            <Search className="w-4 h-4 text-white/20 ml-5 shrink-0" />
                            <input
                                type="text"
                                value={inputCode}
                                onChange={(e) => setInputCode(e.target.value)}
                                className="flex-1 h-full bg-transparent px-4 text-sm text-white font-mono focus:outline-none placeholder-white/10 tracking-wider"
                                placeholder="gift-..."
                            />
                        </div>

                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-center text-[13px] text-red-400">
                                {error}
                            </div>
                        )}

                        <div className="flex items-center justify-between pt-4">
                            <p className="text-[10px] uppercase tracking-widest text-white/20">
                                Powered by <span className="font-semibold text-white/40">Midnight ZK</span>
                            </p>
                            <button
                                type="submit"
                                disabled={!walletAddress || !inputCode.trim()}
                                className="px-6 py-4 text-sm font-semibold bg-white text-black rounded-xl hover:bg-white/90 active:scale-[0.98] transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.1)] shrink-0"
                            >
                                <span>Redeem</span>
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                        {!walletAddress && (
                            <p className="text-xs text-red-400/70 text-center">Connect your wallet to redeem.</p>
                        )}
                    </motion.form>
                )}

                {step === 'LOADING' && (
                    <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center py-10 text-center gap-6"
                    >
                        <Loader2 className="w-8 h-8 text-white/40 animate-spin" />
                        <div>
                            <h3 className="text-base font-semibold text-white mb-1">Verifying Code</h3>
                            <p className="text-sm text-white/40 font-mono">Checking on-chain record...</p>
                        </div>
                    </motion.div>
                )}

                {step === 'SUCCESS' && redeemedData && (
                    <motion.div
                        key="success"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center text-center gap-6"
                    >
                        <div className="w-10 h-10 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                            <CheckCircle2 className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-white mb-1">Redeemed!</h3>
                            <p className="text-sm text-white/40">Funds have been transferred to your wallet.</p>
                        </div>
                        <div className="w-full pointer-events-none opacity-70">
                            <FloatingGiftCard amounts={redeemedData.amounts} isInteractive={false} />
                        </div>
                        <button
                            onClick={() => { setStep('INPUT'); setInputCode(''); setRedeemedData(null); }}
                            className="text-sm text-white/30 hover:text-white/60 transition-colors"
                        >
                            Redeem another card
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
