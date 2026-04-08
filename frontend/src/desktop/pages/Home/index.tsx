import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Lock, Globe, EyeOff, FileText, Layers, KeyRound, Eye, Shield } from 'lucide-react';
import DottedGlobe from './components/DottedGlobe';
import { RedditMarquee } from './components/RedditMarquee';
import { FlashlightEffect } from './components/FlashlightEffect';

const easePremium: [number, number, number, number] = [0.22, 1, 0.36, 1];

const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    show: { opacity: 1, y: 0, transition: { duration: 1.1, ease: easePremium } }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.05 } }
};

const scaleIn = {
    hidden: { opacity: 0, scale: 0.93, y: 20 },
    show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.9, ease: easePremium } }
};

const GrainOverlay = () => (
    <div
        className="pointer-events-none fixed inset-0 z-[999] opacity-[0.032]"
        style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
            backgroundSize: '128px 128px',
        }}
    />
);

const GlowDivider = () => (
    <div className="relative w-full h-px overflow-visible">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-px bg-gradient-to-r from-transparent via-[#7effcc]/40 to-transparent blur-[1px]" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-2 bg-[#7effcc]/10 rounded-full blur-xl" />
    </div>
);

const FeatureCard = ({
    icon: Icon,
    title,
    desc,
    colorClass,
    bgClass,
    borderClass,
    float = false,
}: {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    desc: string;
    colorClass: string;
    bgClass: string;
    borderClass: string;
    delay?: number;
    float?: boolean;
}) => (
    <motion.div variants={scaleIn} className="relative group">
        <div className={`absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-sm ${bgClass}`} />
        <div className={`relative p-7 rounded-2xl bg-[#080808] border ${borderClass} group-hover:border-opacity-60 transition-all duration-500 overflow-hidden h-full`}>
            <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent ${colorClass.replace('text-', 'via-')} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
            <div className={`absolute top-0 right-0 w-24 h-24 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-3xl ${bgClass}`} />
            <div className={`w-12 h-12 rounded-xl ${bgClass} flex items-center justify-center mb-6 border ${borderClass} group-hover:scale-110 transition-transform duration-500 ${float ? 'animate-float' : 'animate-float-delayed'}`}>
                <Icon className={`w-5 h-5 ${colorClass}`} />
            </div>
            <h3 className="text-base font-bold mb-3 text-white tracking-tight group-hover:text-white transition-colors">{title}</h3>
            <p className="text-white/35 text-sm leading-relaxed group-hover:text-white/55 transition-colors duration-500">{desc}</p>
        </div>
    </motion.div>
);

const TrustBar = () => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.8, ease: easePremium }}
        className="flex flex-wrap items-center gap-3 md:gap-4 justify-center lg:justify-start pt-6"
    >
        {[
            { label: '100% Private', colorClass: 'bg-[#7effcc]', shadowClass: 'shadow-[0_0_10px_rgba(126,255,204,0.8)]' },
            { label: 'ZK Native', colorClass: 'bg-white', shadowClass: 'shadow-[0_0_10px_rgba(255,255,255,0.8)]' },
            { label: 'Built on Midnight', colorClass: 'bg-[#7effcc]', shadowClass: 'shadow-[0_0_10px_rgba(126,255,204,0.8)]' },
            { label: 'Non-Custodial', colorClass: 'bg-white', shadowClass: 'shadow-[0_0_10px_rgba(255,255,255,0.8)]' },
        ].map(({ label, colorClass, shadowClass }, i) => (
            <motion.div
                key={label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1 + (i * 0.1), duration: 0.5, ease: easePremium }}
                className="group relative flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.06] hover:border-white/15 transition-all duration-300 backdrop-blur-md cursor-default"
            >
                <div className={`w-1.5 h-1.5 rounded-full ${colorClass} ${shadowClass} transition-transform duration-300 group-hover:scale-125`} />
                <span className="text-[11px] font-mono tracking-widest text-white/50 group-hover:text-white/80 transition-colors uppercase">{label}</span>
            </motion.div>
        ))}
    </motion.div>
);

const Home = () => {
    return (
        <FlashlightEffect>
            <GrainOverlay />
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
                .font-display { font-family: 'Space Grotesk', sans-serif; }
                .font-mono-syne { font-family: 'Space Grotesk', monospace; }
                .text-stroke { -webkit-text-stroke: 1.5px rgba(255,255,255,0.25); color: transparent; }
                .text-stroke-mint { -webkit-text-stroke: 1.5px rgba(126,255,204,0.5); color: transparent; }
                .enter-bliss-button {
                    position: relative; border-radius: 9999px;
                    background: linear-gradient(135deg, #7effcc, #5cd9a8);
                    overflow: hidden; transition: transform 0.3s ease, box-shadow 0.3s ease;
                    box-shadow: 0 0 0 0 rgba(126,255,204,0);
                }
                .enter-bliss-button::before {
                    content: ''; position: absolute; inset: 0;
                    background: linear-gradient(135deg, rgba(255,255,255,0.15), transparent);
                    opacity: 0; transition: opacity 0.3s ease;
                }
                .enter-bliss-button:hover {
                    transform: translateY(-2px) scale(1.02);
                    box-shadow: 0 0 40px 8px rgba(126,255,204,0.35), 0 20px 40px -10px rgba(126,255,204,0.3);
                }
                .enter-bliss-button:hover::before { opacity: 1; }
                @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-8px); } }
                @keyframes float-delayed { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
                .animate-float { animation: float 5s ease-in-out infinite; }
                .animate-float-delayed { animation: float-delayed 6s ease-in-out infinite 1s; }
                @keyframes scan { 0% { top: -2px; } 100% { top: 100%; } }
                .scanline { position: absolute; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, transparent, rgba(126,255,204,0.15), transparent); animation: scan 6s linear infinite; pointer-events: none; }
                @keyframes orbit { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes orbit-r { from { transform: rotate(0deg); } to { transform: rotate(-360deg); } }
            `}</style>

            <div className="min-h-screen bg-[#030303] text-white relative font-display w-full overflow-x-hidden">
                <main className="relative z-10 w-full overflow-hidden">

                    {/* HERO */}
                    <section className="relative min-h-[92vh] flex items-center overflow-hidden">
                        <div className="scanline z-20" />
                        <div className="absolute inset-0 z-0 pointer-events-none">
                            <motion.div
                                className="absolute inset-0 opacity-[0.035]"
                                animate={{ backgroundPosition: ['0px 0px', '64px 64px'] }}
                                transition={{ duration: 20, ease: 'linear', repeat: Infinity }}
                                style={{
                                    backgroundImage: 'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
                                    backgroundSize: '64px 64px',
                                    maskImage: 'radial-gradient(ellipse 70% 80% at 25% 50%, #000 10%, transparent 100%)',
                                }}
                            />
                            <motion.div
                                animate={{ x: [0, 100, -60, 0], y: [0, -60, 80, 0], scale: [1, 1.15, 0.9, 1] }}
                                transition={{ duration: 28, ease: 'easeInOut', repeat: Infinity }}
                                className="absolute -top-1/4 -left-1/4 w-[70vw] h-[70vw] bg-[#7effcc]/5 rounded-full blur-[180px]"
                            />
                            <motion.div
                                animate={{ x: [0, -80, 50, 0], y: [0, 80, -100, 0], scale: [1, 0.85, 1.2, 1] }}
                                transition={{ duration: 35, ease: 'easeInOut', repeat: Infinity, delay: 3 }}
                                className="absolute top-1/4 left-1/4 w-[50vw] h-[50vw] bg-[#7effcc]/4 rounded-full blur-[200px]"
                            />
                        </div>
                        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                            <DottedGlobe />
                        </div>
                        <div className="relative z-10 w-full px-6 md:px-12 lg:px-24 pt-24 pb-12">
                            <motion.div
                                variants={staggerContainer}
                                initial="hidden"
                                animate="show"
                                className="flex flex-col space-y-7 text-center lg:text-left max-w-2xl"
                            >
                                <motion.div variants={fadeInUp} className="relative z-20">
                                    <h1 className="text-4xl md:text-5xl lg:text-7xl font-black tracking-tighter leading-[1.05]">
                                        <span className="text-white">Pay Privately.</span>
                                        <br />
                                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7effcc] via-[#5cd9a8] to-[#7effcc] drop-shadow-[0_0_30px_rgba(126,255,204,0.3)]">Nullify</span>
                                        {' '}
                                        <span className="text-stroke-mint">the Trace.</span>
                                    </h1>
                                </motion.div>
                                <motion.p variants={fadeInUp} className="text-lg md:text-xl text-white/50 max-w-xl font-light leading-relaxed tracking-wide pt-2">
                                    A decentralized privacy protocol on Midnight. Create and settle invoices without ever exposing your{' '}
                                    <span className="text-white font-medium drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">wallet balance</span>
                                    {' '}or{' '}
                                    <span className="text-white font-medium drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">transaction history</span>
                                    {' '}to the public.
                                </motion.p>
                                <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center gap-5 pt-6 justify-center lg:justify-start">
                                    <Link to="/explorer" className="enter-bliss-button group inline-flex items-center justify-center gap-3 px-8 py-4 text-black min-w-[200px]">
                                        <span className="font-bold text-base relative z-10 tracking-tight">Get Started</span>
                                        <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                    <Link to="/docs" className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-transparent overflow-hidden min-w-[200px]">
                                        <div className="absolute inset-0 border border-white/20 rounded-full group-hover:border-white/40 transition-colors duration-500" />
                                        <div className="absolute inset-0 bg-white/0 group-hover:bg-white/[0.03] transition-colors duration-500" />
                                        <span className="font-semibold text-base text-white/50 group-hover:text-white transition-colors tracking-tight relative z-10">Documentation</span>
                                    </Link>
                                </motion.div>
                                <TrustBar />
                            </motion.div>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#030303] to-transparent z-10 pointer-events-none" />
                    </section>

                    <GlowDivider />

                    {/* THE PROBLEM */}
                    <section className="py-28 px-6 md:px-12 lg:px-24">
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-80px' }}
                            transition={{ duration: 0.9, ease: 'easeOut' }}
                            className="max-w-5xl mx-auto"
                        >
                            <div className="text-center mb-12">
                                <span className="font-mono-syne text-[10px] uppercase tracking-[0.3em] text-white/40 font-semibold">The Problem</span>
                                <h2 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-[-0.03em] mt-5 leading-tight">
                                    Public Ledgers{' '}
                                    <span className="text-[#7effcc] drop-shadow-[0_0_30px_rgba(126,255,204,0.45)]" style={{ fontStyle: 'italic' }}>Expose You</span>
                                </h2>
                                <p className="text-white/35 text-base mt-4 max-w-xl mx-auto font-light tracking-wide leading-relaxed">
                                    Every transaction broadcasts your wallet balance, history, and habits to the entire world.
                                </p>
                            </div>
                            <RedditMarquee />
                        </motion.div>
                    </section>

                    <GlowDivider />

                    {/* WHAT IS ANONPAY */}
                    <section className="py-28 px-6 md:px-12 lg:px-24 relative overflow-hidden">
                        <div className="absolute inset-0 pointer-events-none">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[60vh] bg-[#7effcc]/3 rounded-full blur-[120px]" />
                        </div>
                        <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }} className="max-w-7xl mx-auto relative">
                            <motion.div variants={fadeInUp} className="text-center mb-16">
                                <span className="font-mono-syne text-[10px] uppercase tracking-[0.3em] text-[#7effcc]/70 font-semibold">The Solution</span>
                                <h2 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-[-0.03em] mt-5">
                                    What is{' '}
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7effcc] via-[#5cd9a8] to-[#7effcc]">AnonPay?</span>
                                </h2>
                                <p className="text-white/35 text-base mt-5 max-w-2xl mx-auto leading-relaxed font-light">
                                    A decentralized invoice and payment protocol that breaks the link between sender and receiver.
                                    Create invoices, collect payments, and settle — all without exposing who paid whom, or how much.
                                </p>
                            </motion.div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {[
                                    { icon: Shield, title: 'Private Invoice Creation', desc: 'The merchant enters an amount, memo, and invoice type. The browser generates a random 128-bit salt locally, computes a SHA-256 commitment from the merchant address, amount, and salt, and sends only that hash to the `create_invoice` circuit on Midnight.', colorClass: 'text-[#7effcc]', bgClass: 'bg-[#7effcc]/8', borderClass: 'border-[#7effcc]/15', float: true },
                                    { icon: EyeOff, title: 'Untraceable Payments', desc: "Payments execute through Midnight's shielded transaction layer. The sender's identity is never revealed on-chain. No one can trace who paid the invoice.", colorClass: 'text-cyan-400', bgClass: 'bg-cyan-500/8', borderClass: 'border-cyan-500/15', float: false },
                                    { icon: Layers, title: 'Dual-Record System', desc: 'Every payment atomically generates two encrypted receipts — a PayerReceipt and MerchantReceipt. Both parties get proof without public exposure.', colorClass: 'text-violet-400', bgClass: 'bg-violet-500/8', borderClass: 'border-violet-500/15', float: true },
                                    { icon: Zap, title: 'Selective Disclosure', desc: 'Generate ZK proofs that reveal only specific financial facts — total income, revenue trends — to banks, tax authorities, or auditors. Nothing more.', colorClass: 'text-emerald-400', bgClass: 'bg-emerald-500/8', borderClass: 'border-emerald-500/15', float: false },
                                    { icon: FileText, title: 'Flexible Invoice Types', desc: 'Standard invoices for one-time payments, Multi-Pay invoices for crowdfunding campaigns, and Donation invoices with open-ended amounts.', colorClass: 'text-[#7effcc]', bgClass: 'bg-[#7effcc]/8', borderClass: 'border-[#7effcc]/15', float: true },
                                    { icon: KeyRound, title: 'Encrypted Metadata', desc: 'The blockchain never sees the merchant identity or invoice amount. The backend stores the invoice metadata separately in encrypted form, and the merchant gets a shareable payment link with the salt embedded for later verification.', colorClass: 'text-cyan-400', bgClass: 'bg-cyan-500/8', borderClass: 'border-cyan-500/15', float: false },
                                ].map((f, i) => (
                                    <FeatureCard key={i} {...f} delay={i * 0.1} />
                                ))}
                            </div>
                        </motion.div>
                    </section>

                    <GlowDivider />

                    {/* HOW IT WORKS */}
                    <section className="py-28 px-6 md:px-12 lg:px-24 relative overflow-hidden">
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
                            <span className="text-[20vw] font-black text-white/[0.015] tracking-tighter leading-none whitespace-nowrap">PRIVATE</span>
                        </div>
                        <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }} className="max-w-6xl mx-auto relative">
                            <motion.div variants={fadeInUp} className="text-center mb-20">
                                <span className="font-mono-syne text-[10px] uppercase tracking-[0.3em] text-white/35 font-semibold">How It Works</span>
                                <h2 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-[-0.03em] mt-5">
                                    Three Steps{' '}
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7effcc] via-[#5cd9a8] to-[#7effcc] drop-shadow-[0_0_15px_rgba(126,255,204,0.3)]">to Privacy</span>
                                </h2>
                                <p className="text-white/35 text-base mt-4 max-w-xl mx-auto font-light leading-relaxed">
                                    From invoice creation to private settlement — the entire flow is designed around zero-knowledge.
                                </p>
                            </motion.div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 relative">
                                <div className="hidden md:block absolute top-[68px] left-[16.66%] right-[16.66%] h-px">
                                    <div className="w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#7effcc]/30 to-transparent blur-[1px]" />
                                </div>
                                {[
                                    { step: '01', title: 'Create Invoice', desc: 'The merchant enters the amount, memo, and invoice type. The browser generates a random 128-bit salt locally and commits the SHA-256 hash of merchant address, amount, and salt through the `create_invoice` circuit.', icon: FileText },
                                    { step: '02', title: 'Share Payment Link', desc: "The merchant shares a payment link containing the salt. The payer's client verifies the on-chain hash, confirming the invoice is authentic and unmodified.", icon: Globe },
                                    { step: '03', title: 'Private Settlement', desc: "The payer executes a shielded payment on Midnight. Funds move to the merchant without revealing the payer's identity. Both parties receive encrypted receipts atomically.", icon: Lock },
                                ].map((s, i) => (
                                    <motion.div key={i} variants={fadeInUp}>
                                        <div className="flex flex-col items-center text-center p-8 rounded-2xl bg-[#080808] border border-white/[0.06] hover:border-[#7effcc]/25 hover:bg-[#0c0c0c] transition-all duration-500 group h-full relative overflow-hidden">
                                            <span className="absolute bottom-4 right-4 font-black text-[80px] leading-none text-white/[0.03] group-hover:text-white/[0.06] transition-colors select-none">{s.step}</span>
                                            <div className="w-14 h-14 rounded-full border border-white/10 group-hover:border-[#7effcc]/40 bg-white/[0.03] group-hover:bg-[#7effcc]/10 flex items-center justify-center mb-5 transition-all duration-500 relative z-10">
                                                <span className="font-mono-syne text-sm font-bold text-white/40 group-hover:text-[#7effcc] transition-colors">{s.step}</span>
                                            </div>
                                            <s.icon className="w-5 h-5 text-white/25 mb-4 group-hover:text-[#7effcc] transition-colors duration-300 relative z-10" />
                                            <h3 className="text-lg font-bold text-white mb-3 tracking-tight relative z-10">{s.title}</h3>
                                            <p className="text-white/35 text-sm leading-relaxed group-hover:text-white/55 transition-colors duration-500 relative z-10">{s.desc}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </section>

                    <GlowDivider />

                    {/* POWERED BY MIDNIGHT */}
                    <section className="py-28 px-6 md:px-12 lg:px-24 relative overflow-hidden">
                        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.9 }} className="max-w-6xl mx-auto">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                                <div className="space-y-7">
                                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#7effcc]/8 border border-[#7effcc]/20">
                                        <Layers className="w-3.5 h-3.5 text-[#7effcc]" />
                                        <span className="font-mono-syne text-[10px] font-bold tracking-[0.25em] text-[#7effcc] uppercase">Architecture</span>
                                    </div>
                                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-[-0.03em] leading-tight">
                                        Powered by{' '}
                                        <span className="text-[#7effcc] drop-shadow-[0_0_30px_rgba(126,255,204,0.4)]">Midnight</span>
                                    </h2>
                                    <p className="text-white/40 font-light leading-loose text-base">
                                        Midnight is a <strong className="text-white font-semibold">Layer-1 blockchain</strong> purpose-built for programmable privacy. Unlike Ethereum or Solana where privacy is an afterthought, Midnight makes ZK-proofs a native, first-class feature with selective disclosure.
                                    </p>
                                    <div className="space-y-3 pt-2">
                                        {[
                                            { label: 'Shielded State', desc: 'Contract state is private by default — not public.' },
                                            { label: 'Selective Disclosure', desc: 'Reveal only what is necessary, to only who needs it.' },
                                            { label: 'Native ZK Proofs', desc: 'ZK proof generation is built into the protocol, not bolted on.' },
                                        ].map((item) => (
                                            <div key={item.label} className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-[#7effcc]/20 hover:bg-[#7effcc]/3 transition-all duration-400 group">
                                                <div className="w-2 h-2 rounded-full bg-[#7effcc] mt-1.5 shrink-0 group-hover:shadow-[0_0_8px_rgba(126,255,204,0.8)] transition-shadow" />
                                                <div>
                                                    <h4 className="text-sm font-bold text-white mb-0.5 group-hover:text-[#7effcc] transition-colors">{item.label}</h4>
                                                    <p className="text-xs text-white/35 leading-relaxed">{item.desc}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex justify-center">
                                    <div className="relative w-full aspect-square max-w-[340px]">
                                        <div className="absolute inset-0 rounded-full" style={{ border: '1px solid rgba(126,255,204,0.2)', animation: 'orbit 22s linear infinite', boxShadow: 'inset 0 0 60px rgba(126,255,204,0.03)' }}>
                                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.8)]" />
                                        </div>
                                        <div className="absolute inset-8 rounded-full border-dashed" style={{ border: '1px dashed rgba(34,211,238,0.2)', animation: 'orbit-r 16s linear infinite' }}>
                                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-3 h-3 rounded-full bg-violet-400 shadow-[0_0_10px_rgba(167,139,250,0.8)]" />
                                        </div>
                                        <div className="absolute inset-16 rounded-full" style={{ border: '1px solid rgba(126,255,204,0.3)', animation: 'orbit 10s linear infinite' }}>
                                            <div className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-[#7effcc] shadow-[0_0_10px_rgba(126,255,204,0.9)]" />
                                        </div>
                                        <div className="absolute inset-[90px] rounded-full bg-gradient-to-br from-[#7effcc]/15 via-[#7effcc]/5 to-transparent backdrop-blur-xl flex items-center justify-center border border-[#7effcc]/20 shadow-[0_0_60px_rgba(126,255,204,0.15),inset_0_0_30px_rgba(126,255,204,0.05)]">
                                            <div className="flex flex-col items-center gap-1.5">
                                                <Zap className="w-7 h-7 text-[#7effcc] drop-shadow-[0_0_12px_rgba(126,255,204,0.7)]" />
                                                <span className="font-mono-syne text-[9px] font-bold tracking-[0.3em] uppercase text-[#7effcc]/70">ZK Native</span>
                                            </div>
                                        </div>
                                        <div className="absolute inset-0 rounded-full bg-[#7effcc]/5 blur-3xl scale-75 pointer-events-none" />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </section>

                    <GlowDivider />

                    {/* COMPARISON */}
                    <section className="py-28 px-6 md:px-12 lg:px-24 relative overflow-hidden">
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
                            <span className="text-[18vw] font-black text-white/[0.015] tracking-tighter leading-none">ZERO</span>
                        </div>
                        <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }} className="max-w-6xl mx-auto relative">
                            <motion.div variants={fadeInUp} className="text-center mb-16">
                                <span className="font-mono-syne text-[10px] uppercase tracking-[0.3em] text-white/35 font-semibold">Why AnonPay</span>
                                <h2 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-[-0.03em] mt-5">
                                    Privacy is{' '}
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7effcc] via-[#5cd9a8] to-[#7effcc] drop-shadow-[0_0_15px_rgba(126,255,204,0.3)]">Not Optional</span>
                                </h2>
                                <p className="text-white/35 text-base mt-4 max-w-xl mx-auto font-light">
                                    See how AnonPay fundamentally differs from traditional blockchain payments.
                                </p>
                            </motion.div>
                            <motion.div variants={fadeInUp} className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-stretch">
                                <div className="p-8 rounded-2xl bg-[#080808] border border-white/[0.05] relative overflow-hidden">
                                    <div className="flex items-center gap-3 mb-8">
                                        <Eye className="w-5 h-5 text-red-400" />
                                        <h3 className="text-lg font-bold text-white/60">Traditional Blockchain</h3>
                                    </div>
                                    <div className="space-y-4">
                                        {['Public wallet addresses', 'Visible transaction amounts', 'Full transaction history exposed', 'Balance visible to anyone', 'No compliance-ready privacy'].map((item) => (
                                            <div key={item} className="flex items-center gap-3">
                                                <div className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                                                <span className="text-sm text-white/35">{item}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex items-center justify-center">
                                    <ArrowRight className="w-6 h-6 text-white/10 hidden md:block" />
                                </div>
                                <div className="p-8 rounded-2xl bg-[#080808] border border-[#7effcc]/15 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-[#7effcc]/[0.02]" />
                                    <div className="flex items-center gap-3 mb-8 relative">
                                        <EyeOff className="w-5 h-5 text-[#7effcc]" />
                                        <h3 className="text-lg font-bold text-white">AnonPay on Midnight</h3>
                                    </div>
                                    <div className="space-y-4 relative">
                                        {['Private wallet addresses', 'Hidden payment amounts', 'No public transaction trail', 'Balance shielded by default', 'Selective disclosure for compliance'].map((item) => (
                                            <div key={item} className="flex items-center gap-3">
                                                <div className="w-1.5 h-1.5 rounded-full bg-[#7effcc] shrink-0" />
                                                <span className="text-sm text-white/70">{item}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    </section>

                    <GlowDivider />

                    {/* CTA */}
                    <section className="py-28 px-6 md:px-12 lg:px-24 relative overflow-hidden">
                        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.9 }} className="max-w-4xl mx-auto text-center">
                            <h2 className="text-3xl md:text-5xl font-black tracking-tighter leading-tight mb-6">
                                Building the Private Economy on{' '}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7effcc] via-[#5cd9a8] to-[#7effcc]">Midnight</span>
                            </h2>
                            <p className="text-white/40 text-lg max-w-2xl mx-auto mb-10 font-light leading-relaxed">
                                AnonPay is the only invoice protocol combining full payment privacy with compliance-ready selective disclosure. Built for freelancers, small businesses, and privacy-conscious professionals.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Link to="/explorer" className="enter-bliss-button group inline-flex items-center justify-center gap-3 px-8 py-4 text-black min-w-[200px]">
                                    <span className="font-bold text-base relative z-10 tracking-tight">Launch App</span>
                                    <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <Link to="/docs" className="px-8 py-4 rounded-full border border-white/15 text-white/50 hover:text-white hover:border-white/30 transition-all text-sm font-semibold">
                                    Read the Docs
                                </Link>
                            </div>
                        </motion.div>
                    </section>
                </main>
            </div>
        </FlashlightEffect>
    );
};

export default Home;
