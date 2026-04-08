import { motion } from 'framer-motion';
import { pageVariants, staggerContainer, fadeInUp } from '../../../shared/utils/animations';

const Vision = () => {
    const sections = [
        {
            title: "Selective Disclosure",
            icon: (
                <svg className="w-8 h-8 text-[#7effcc]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
            ),
            description: "Generate ZK proofs that reveal only specific financial facts — total income for a period, revenue trends — to banks, tax authorities, or auditors. The merchant controls exactly what is revealed, and the verifier gets a cryptographically verified proof without seeing raw transaction data.",
            gradient: "from-[#7effcc]/20 to-emerald-500/20"
        },
        {
            title: "Instant Retail Invoices",
            icon: (
                <svg className="w-8 h-8 text-neon-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            ),
            description: "A dedicated 'Instant Invoice' page designed specifically for physical stores, cafes, and pop-up shops. Merchants can generate a quick invoice, and upon user payment, receive immediate 'Payment Successful' feedback. This real-time confirmation makes in-person crypto payments seamlessly practical.",
            gradient: "from-green-500/20 to-emerald-500/20"
        },
        {
            title: "Mobile Experience",
            icon: (
                <svg className="w-8 h-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
            ),
            description: "AnonPay V1 Mobile is live with a clean, privacy-first interface. Native QR scanning for invoice payments, full wallet integration via Midnight Lace Wallet, and a streamlined flow for creating and settling invoices on the go.",
            gradient: "from-cyan-500/20 to-blue-500/20"
        },
        {
            title: "E-Commerce & Enterprise",
            icon: (
                <svg className="w-8 h-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
            ),
            description: "Scalable multi-payment invoices for e-commerce and large-scale operations. Each product sold generates a unique, verifiable payment proof. Organized with individual invoice hashes and memos, making reconciliation effortless for high-volume merchants.",
            gradient: "from-purple-500/20 to-pink-500/20"
        },
        {
            title: "Developer SDK",
            icon: (
                <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
            ),
            description: "A powerful SDK for seamless integration. Developers and companies can integrate AnonPay into their platforms as easily as Stripe or Razorpay, bringing private, zero-knowledge payments to their own applications with just a few lines of code.",
            gradient: "from-emerald-500/20 to-teal-500/20"
        },
        {
            title: "Donations & Fundraising",
            icon: (
                <svg className="w-8 h-8 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
            ),
            description: "Empowering NGOs, creators, and charitable causes. Use open-ended donation invoices, giving supporters the flexibility to contribute any amount privately. Perfect for creators and open-source developers seeking privacy-preserving support.",
            gradient: "from-pink-500/20 to-rose-500/20"
        }
    ];

    return (
        <motion.div
            className="page-container relative min-h-screen"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
        >
            <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="show"
                className="w-full pt-8 pb-20 relative z-10 px-6"
            >
                <motion.div variants={fadeInUp} className="text-center mb-20">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tighter text-white leading-tight">
                        The current <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7effcc] to-emerald-400">MVP and roadmap</span>
                    </h1>
                    <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                        This page keeps the ambition visible while separating what the repository already delivers from what still belongs on the roadmap.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {sections.map((section, index) => (
                        <div
                            key={index}
                            className={`p-8 group relative overflow-hidden border border-white/5 hover:border-white/20 transition-all duration-500 rounded-2xl bg-[#080808] ${index === sections.length - 1 ? 'md:col-span-2' : ''}`}
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br ${section.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                            <div className="relative z-10 flex flex-col h-full">
                                <div className="mb-6 p-3 bg-white/5 rounded-2xl w-fit group-hover:scale-110 transition-transform duration-300 border border-white/5">
                                    {section.icon}
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-4 tracking-tight transition-colors duration-500 group-hover:text-[#7effcc]">
                                    {section.title}
                                </h3>
                                <p className="text-gray-400 leading-relaxed text-sm md:text-base">
                                    {section.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                <motion.div variants={fadeInUp} className="mt-24 text-center">
                    <div className="inline-block p-[1px] rounded-full bg-gradient-to-r from-[#7effcc]/50 to-emerald-500/50">
                        <div className="bg-black/80 backdrop-blur-xl rounded-full px-8 py-3">
                            <span className="text-gray-300 font-mono text-sm tracking-widest uppercase">
                                Building the Private Economy on Midnight
                            </span>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </motion.div>
    );
};

export default Vision;
