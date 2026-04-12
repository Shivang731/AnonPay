import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    Bot,
    FileCode2,
    Gift,
    Radio,
    ShieldCheck,
    Sparkles,
} from 'lucide-react';

const STORAGE_KEY = 'anonpay_intro_seen';

const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.35 } },
    exit: { opacity: 0, transition: { duration: 0.25 } }
};

const modalVariants = {
    hidden: { opacity: 0, scale: 0.94, y: 24 },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: { type: 'spring' as const, duration: 0.55, bounce: 0.18 }
    },
    exit: { opacity: 0, scale: 0.96, y: 18, transition: { duration: 0.2 } }
};

const itemVariants = {
    hidden: { opacity: 0, x: -16 },
    visible: (i: number) => ({
        opacity: 1,
        x: 0,
        transition: { delay: i * 0.06 + 0.18, duration: 0.36 }
    })
};

const SectionCard = ({
    index,
    eyebrow,
    title,
    badge,
    accentClass,
    icon,
    glowClass,
    children,
}: {
    index: number;
    eyebrow: string;
    title: string;
    badge?: string;
    accentClass: string;
    icon: React.ReactNode;
    glowClass: string;
    children: React.ReactNode;
}) => (
    <motion.div
        custom={index}
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        className="group relative overflow-hidden rounded-[1.7rem] border border-white/[0.07] bg-[linear-gradient(160deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))] p-6 md:p-7 hover:border-white/[0.12] transition-colors duration-500"
    >
        <div className={`absolute -right-8 -top-8 h-28 w-28 rounded-full blur-3xl opacity-35 pointer-events-none transition-opacity duration-300 group-hover:opacity-50 ${glowClass}`} />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.04),transparent_22%,transparent_78%,rgba(255,255,255,0.02))] pointer-events-none" />
        <div className="flex items-start gap-5">
            <div className="flex flex-col items-center gap-2.5 shrink-0">
                <div className={`mt-0.5 shrink-0 w-11 h-11 rounded-xl border flex items-center justify-center shadow-[0_0_20px_rgba(0,0,0,0.3)] ${accentClass}`}>
                    {icon}
                </div>
                <span className="text-[9px] font-black tracking-[0.3em] text-white/20 tabular-nums">
                    {String(index + 1).padStart(2, '0')}
                </span>
            </div>
            <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-gray-500">
                        {eyebrow}
                    </span>
                    {badge && (
                        <span className="px-2 py-0.5 rounded-full border border-orange-400/20 bg-orange-500/10 text-[9px] font-bold uppercase tracking-[0.18em] text-orange-300">
                            {badge}
                        </span>
                    )}
                </div>
                <h3 className="text-lg md:text-xl font-bold text-white mb-3 tracking-tight leading-snug">{title}</h3>
                <div className="space-y-3 text-[13px] leading-[1.75] text-white/40">{children}</div>
            </div>
        </div>
    </motion.div>
);

export const ChangelogOverlay: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const hasSeen = localStorage.getItem(STORAGE_KEY);
        if (!hasSeen) {
            const timer = setTimeout(() => setIsVisible(true), 1200);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleClose = (dontShowAgain: boolean) => {
        setIsVisible(false);
        if (dontShowAgain) {
            localStorage.setItem(STORAGE_KEY, 'true');
        }
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 font-sans antialiased">
                    <motion.div
                        className="absolute inset-0 bg-black/85 backdrop-blur-xl"
                        variants={overlayVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onClick={() => handleClose(false)}
                    />

                    <motion.div
                        className="relative w-full max-w-4xl bg-[#060606] border border-white/[0.08] rounded-3xl shadow-[0_0_120px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.04)] overflow-hidden flex flex-col max-h-[92vh]"
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                    >
                        <div className="absolute top-0 right-0 w-[420px] h-[420px] bg-orange-400/8 rounded-full blur-[130px] pointer-events-none opacity-70" />
                        <div className="absolute bottom-0 left-0 w-[360px] h-[360px] bg-white/6 rounded-full blur-[120px] pointer-events-none opacity-70" />
                        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.45) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.45) 1px, transparent 1px)', backgroundSize: '26px 26px' }} />

                        <div className="p-8 pb-5 shrink-0 relative z-10">
                            <div className="flex items-center gap-2.5 mb-5">
                                <span className="px-3 py-1 bg-orange-500/10 border border-orange-400/20 rounded-full text-[9px] font-black text-orange-300 uppercase tracking-[0.28em]">
                                    Welcome
                                </span>
                                <span className="text-white/15 text-xs">·</span>
                                <span className="text-[9px] font-semibold text-white/35 uppercase tracking-[0.28em]">
                                    AnonPay
                                </span>
                                <span className="text-white/15 text-xs">·</span>
                                <span className="text-[9px] font-semibold text-white/35 uppercase tracking-[0.28em]">
                                    Private Payments
                                </span>
                            </div>
                            <motion.h2
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.12 }}
                                className="text-3xl md:text-[2.6rem] font-black tracking-tight leading-[1.1] text-white"
                            >
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-300 via-amber-200 to-orange-400">
                                    AnonPay
                                </span>
                                <br />
                                <span className="text-white/50 font-light text-2xl md:text-3xl tracking-normal">Private invoicing MVP on Midnight</span>
                            </motion.h2>
                        </div>

                        <div className="p-8 pt-6 overflow-y-auto custom-scrollbar space-y-6 relative z-10 pr-6">
                            <SectionCard
                                index={0}
                                eyebrow="Encryption"
                                badge="Security"
                                accentClass="bg-emerald-400/10 border-emerald-300/20 text-emerald-200"
                                icon={<ShieldCheck className="w-5 h-5" />}
                                glowClass="bg-emerald-400/35"
                                title="Privacy By Default"
                            >
                                <p>
                                    AnonPay lets merchants create invoices and receive payments in a workflow designed to reduce unnecessary public exposure compared with a plain public ledger experience.
                                </p>
                                <p>
                                    The product separates application-facing invoice data from contract-facing flows and keeps the MVP grounded in what the codebase actually supports.
                                </p>
                            </SectionCard>

                            <SectionCard
                                index={1}
                                eyebrow="Selective Disclosure"
                                badge="Core Feature"
                                accentClass="bg-orange-400/10 border-orange-300/20 text-orange-200"
                                icon={<Bot className="w-5 h-5" />}
                                glowClass="bg-orange-400/35"
                                title="Reveal Only What Matters"
                            >
                            <p>
                               Privacy does not have to mean opacity. The current MVP includes disclosure links for settled invoices so merchants can share selected facts.
                           </p>
                           <p>
                               A stronger proof-native verifier experience remains roadmap work, but the product direction is already visible in the app.
                          </p>
                          </SectionCard>



                            <SectionCard
                                index={2}
                                eyebrow="Payments"
                                badge="Shielded"
                                accentClass="bg-white/[0.05] border-white/10 text-white/85"
                                icon={<FileCode2 className="w-5 h-5" />}
                                glowClass="bg-white/20"
                                title="Built For Real Merchant Flows"
                            >
                                <p>
                                    AnonPay supports merchant registration, invoice creation, hosted checkout, dashboard views, and payment-related flows in the current repository.
                                </p>
                                <p>
                                    The goal is a usable merchant product, not just a protocol demo.
                                </p>
                            </SectionCard>

                            <SectionCard
                                index={3}
                                eyebrow="Infrastructure"
                                badge="Midnight"
                                accentClass="bg-purple-400/10 border-purple-300/20 text-purple-200"
                                icon={<Sparkles className="w-5 h-5" />}
                                glowClass="bg-purple-400/25"
                                title="Built Around Private Execution"
                            >
                                <p>
                                    AnonPay is built around Midnight because privacy is a product requirement here, not an afterthought layered on later.
                                </p>
                                <p>
                                    The MVP already shows that contract-backed invoicing can be shaped into a cleaner merchant experience.
                                </p>
                            </SectionCard>

                            <SectionCard
                                index={4}
                                eyebrow="Compliance"
                                badge="Practical"
                                accentClass="bg-pink-400/10 border-pink-300/20 text-pink-200"
                                icon={<Gift className="w-5 h-5" />}
                                glowClass="bg-pink-400/25"
                                title="Privacy That Still Works In The Real World"
                            >
                                <p>
                                    The goal is straightforward: merchants should be able to stay private by default, then disclose only the minimum necessary when the real world demands proof.
                                </p>
                                <p>
                                    That makes AnonPay relevant for reporting, verification, and trust-sensitive business relationships without claiming the full roadmap is already complete.
                                </p>
                            </SectionCard>

                            <SectionCard
                                index={5}
                                eyebrow="Checkout"
                                badge="Simple"
                                accentClass="bg-cyan-400/10 border-cyan-300/20 text-cyan-200"
                                icon={<Radio className="w-5 h-5" />}
                                glowClass="bg-cyan-400/20"
                                title="Create, Share, Track"
                            >
                                <p>
                                    Connect your wallet, create an invoice, share the payment flow, and let the app carry the user through checkout and settlement tracking.
                                </p>
                                <p>
                                    The product loop is already real; the deeper privacy infrastructure continues from here.
                                </p>
                            </SectionCard>
                        </div>

                        <div className="px-8 py-5 shrink-0 bg-[#060606]/80 flex items-center justify-between backdrop-blur-md relative z-10 gap-4">
                            <button
                                onClick={() => handleClose(false)}
                                className="text-[12px] text-white/30 hover:text-white/70 transition-colors font-medium px-3 py-2 rounded-lg hover:bg-white/[0.04] tracking-wide"
                            >
                                Close
                            </button>

                            <button
                                onClick={() => handleClose(true)}
                                className="px-7 py-2.5 bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-400 hover:to-orange-300 text-white text-[13px] font-bold rounded-xl transition-all shadow-[0_0_24px_rgba(249,115,22,0.3)] hover:shadow-[0_0_36px_rgba(249,115,22,0.45)] hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2 tracking-tight"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                </svg>
                                Enter AnonPay
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
