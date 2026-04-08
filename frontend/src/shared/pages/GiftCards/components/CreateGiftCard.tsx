import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMidnightWallet } from '../../../hooks/Wallet/WalletProvider';
import { Copy, CheckCircle2, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { FloatingGiftCard } from './FloatingGiftCard';

export const CreateGiftCard: React.FC = () => {
    const { walletAddress } = useMidnightWallet();
    const [amounts, setAmounts] = useState({ TDUST: '' });
    const [isGenerating, setIsGenerating] = useState(false);
    const [step, setStep] = useState<'INPUT' | 'FUNDING' | 'SUCCESS'>('INPUT');
    const [fundingStatus, setFundingStatus] = useState<string>('');
    const [giftCode, setGiftCode] = useState<string>('');
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();

        const tdustAmt = Number(amounts.TDUST || 0);

        if (tdustAmt <= 0) {
            toast.error('Please enter an amount.');
            return;
        }

        if (!walletAddress) {
            toast.error('Please connect your wallet first.');
            return;
        }

        setError(null);
        setIsGenerating(true);
        setStep('FUNDING');
        setFundingStatus('Gift card funding not yet implemented for Midnight. Coming soon.');
        setError('Gift card funding requires Midnight integration.');
        
        setIsGenerating(false);
    };

    const copyCode = () => {
        navigator.clipboard.writeText(giftCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const reset = () => {
        setAmounts({ TDUST: '' });
        setGiftCode('');
        setStep('INPUT');
        setError(null);
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
                        onSubmit={handleCreate}
                        className="space-y-5"
                    >
                        <div className="mb-2">
                            <FloatingGiftCard amounts={{ TDUST: amounts.TDUST }} />
                        </div>

                        <div className="space-y-3">
                            {(['TDUST'] as const).map((token) => (
                                <div
                                    key={token}
                                    className="relative flex items-center bg-white/[0.02] rounded-2xl overflow-hidden group h-14"
                                >
                                    <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent group-focus-within:via-emerald-500/50 transition-all duration-500" />
                                    <span className="pl-5 text-xs font-semibold text-white/30 uppercase tracking-[0.2em] w-24 shrink-0 transition-colors group-focus-within:text-white/50">
                                        {token}
                                    </span>
                                    <input
                                        type="number"
                                        step="0.000001"
                                        min="0"
                                        value={amounts[token]}
                                        onChange={(e) => setAmounts({ ...amounts, [token]: e.target.value })}
                                        className="flex-1 h-full bg-transparent px-5 text-right text-lg text-white font-light focus:outline-none placeholder-white/10 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                        placeholder="0.00"
                                    />
                                </div>
                            ))}
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
                                disabled={isGenerating || !walletAddress || (!amounts.TDUST)}
                                className="px-6 py-4 text-sm font-semibold bg-white text-black rounded-xl hover:bg-white/90 active:scale-[0.98] transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.1)] shrink-0 group relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <span className="relative z-10">{isGenerating ? 'Minting...' : 'Mint Card'}</span>
                            </button>
                        </div>
                        {!walletAddress && (
                            <p className="text-xs text-red-400/70 text-center">Connect your wallet to mint.</p>
                        )}
                    </motion.form>
                )}

                {step === 'FUNDING' && (
                    <motion.div
                        key="funding"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center py-10 text-center gap-6"
                    >
                        <Loader2 className="w-8 h-8 text-white/40 animate-spin" />
                        <div>
                            <h3 className="text-base font-semibold text-white mb-1">Forging Card</h3>
                            <p className="text-sm text-white/40 font-mono max-w-xs">{fundingStatus}</p>
                        </div>
                        <div className="w-full pointer-events-none opacity-50">
                            <FloatingGiftCard amounts={{ TDUST: amounts.TDUST }} isInteractive={false} />
                        </div>
                    </motion.div>
                )}

                {step === 'SUCCESS' && (
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
                            <h3 className="text-lg font-semibold text-white mb-1">Gift Card Ready</h3>
                            <p className="text-sm text-white/40">Share this code with the recipient — they can redeem it instantly.</p>
                        </div>

                        <div className="w-full cursor-pointer" onClick={copyCode}>
                            <FloatingGiftCard giftCode={giftCode} amounts={{ TDUST: amounts.TDUST }} isInteractive={false} />
                            <p className="mt-3 text-xs text-white/25 flex items-center justify-center gap-1.5">
                                <Copy className="w-3 h-3" />
                                {copied ? 'Copied!' : 'Click to copy code'}
                            </p>
                        </div>

                        <button
                            onClick={reset}
                            className="text-sm text-white/30 hover:text-white/60 transition-colors"
                        >
                            Create another card
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
