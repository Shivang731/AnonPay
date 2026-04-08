import { useState } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '../../../shared/components/ui/GlassCard';
import { DocsChatbot } from '../../../shared/components/DocsChatbot';
import { pageVariants, staggerContainer, fadeInUp } from '../../../shared/utils/animations';

const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'workflow', label: 'Workflow' },
    { id: 'contract', label: 'Contract' },
    { id: 'backend', label: 'Backend' },
    { id: 'deploy', label: 'Deploy' },
];

const CodeBlock = ({ title, code, language = 'bash' }: { title: string; code: string; language?: string }) => (
    <div className="mt-6">
        <div className="flex items-center justify-between px-4 py-2 bg-white/5 border border-white/10 rounded-t-lg border-b-0">
            <span className="font-mono text-xs text-orange-300 font-bold uppercase tracking-wider">{title}</span>
            <span className="text-[10px] text-gray-500">{language.toUpperCase()}</span>
        </div>
        <pre className="p-4 bg-black/80 border border-white/10 rounded-b-lg overflow-x-auto text-xs text-gray-300 font-mono leading-relaxed">
            <code>{code}</code>
        </pre>
    </div>
);

const Docs = () => {
    const [activeTab, setActiveTab] = useState('overview');

    return (
        <motion.div
            className="page-container relative min-h-screen"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
        >
            <motion.div
                initial="hidden"
                animate="show"
                variants={staggerContainer}
                className="w-full max-w-6xl mx-auto pt-12 pb-20 px-6 relative z-10"
            >
                <motion.div variants={fadeInUp} className="text-center mb-12 border-b border-white/10 pb-10 flex flex-col items-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tighter leading-tight text-white">
                        AnonPay <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-300 to-orange-500">MVP Docs</span>
                    </h1>
                    <p className="text-gray-300 text-lg md:text-xl max-w-3xl leading-relaxed">
                        This documentation is aligned to the current repository and whitepaper. It explains the working product loop without advertising unfinished infrastructure.
                    </p>
                </motion.div>

                <motion.div variants={fadeInUp} className="flex flex-wrap justify-center gap-4 mb-12 sticky top-24 z-50 bg-black/50 backdrop-blur-xl p-4 rounded-full border border-white/5 max-w-5xl mx-auto">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-6 py-2 rounded-full font-bold transition-all duration-300 ${activeTab === tab.id
                                ? 'bg-white text-black shadow-lg'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </motion.div>

                {activeTab === 'overview' && (
                    <GlassCard className="p-10">
                        <h2 className="text-3xl font-bold mb-6 tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-300 to-orange-500">What is AnonPay?</h2>
                        <p className="text-gray-400 mb-6 leading-relaxed">
                            AnonPay is a privacy-first invoicing and checkout app built on Midnight. The current MVP supports invoice creation, payment flows, hosted checkout sessions, merchant registration, dashboard views, and application-level selective disclosure links for settled invoices.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-black/40 p-6 rounded-xl border border-white/5">
                                <h3 className="text-white font-bold mb-2">Current strength</h3>
                                <p className="text-sm text-gray-400">A working merchant payment workflow that is more privacy-oriented than a plain public payment ledger experience.</p>
                            </div>
                            <div className="bg-black/40 p-6 rounded-xl border border-white/5">
                                <h3 className="text-white font-bold mb-2">Current boundary</h3>
                                <p className="text-sm text-gray-400">The disclosure experience is not yet a fully trust-minimized end-to-end verifier system tied entirely to live proof artifacts.</p>
                            </div>
                        </div>
                    </GlassCard>
                )}

                {activeTab === 'workflow' && (
                    <GlassCard className="p-10">
                        <h2 className="text-3xl font-bold mb-8 tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-300 to-orange-500">Product workflow</h2>
                        <div className="space-y-8">
                            {[
                                ['1. Create invoice', 'Merchant creates an invoice in the app. Business-facing metadata is handled off-chain while the chain-facing path uses contract state and invoice-related commitments.'],
                                ['2. Share payment flow', 'The merchant shares a payment experience with the payer through the product UI or hosted checkout flow.'],
                                ['3. Pay through Midnight-oriented flow', 'The payer completes the payment path using the app’s Midnight integration rather than a public-by-default transfer UX.'],
                                ['4. Sync settlement', 'The backend stores invoice, merchant, payment intent, and disclosure-related records and reconciles settlement back into the application.'],
                                ['5. Selectively disclose later', 'For a settled invoice, the merchant can create a disclosure link that reveals only chosen fields.']
                            ].map(([title, body]) => (
                                <div key={title} className="relative pl-8 border-l-2 border-orange-400/30">
                                    <div className="absolute -left-[11px] top-0 w-5 h-5 rounded-full bg-orange-400 border-4 border-black" />
                                    <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
                                    <p className="text-sm text-gray-400 leading-relaxed">{body}</p>
                                </div>
                            ))}
                        </div>
                    </GlassCard>
                )}

                {activeTab === 'contract' && (
                    <GlassCard className="p-10">
                        <h2 className="text-3xl font-bold mb-6 tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-300 to-orange-500">Contract scope</h2>
                        <p className="text-gray-400 leading-relaxed mb-6">
                            The Midnight contract in this repository is intentionally narrower than the long-term vision. It already demonstrates invoice lifecycle handling, payment state transitions, nullifier-based replay protection, and disclosure-related circuit support.
                        </p>
                        <CodeBlock
                            title="Current circuits"
                            language="text"
                            code={`create_invoice
pay_invoice
generate_disclosure_proof
get_invoice_status`}
                        />
                    </GlassCard>
                )}

                {activeTab === 'backend' && (
                    <GlassCard className="p-10">
                        <h2 className="text-3xl font-bold mb-6 tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-300 to-orange-500">Backend responsibilities</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[
                                'merchant registration',
                                'invoice creation and retrieval',
                                'checkout session APIs',
                                'user profile endpoints',
                                'disclosure generation and verification',
                                'webhook delivery',
                                'indexer polling and settlement sync',
                                'developer-facing support routes'
                            ].map((item) => (
                                <div key={item} className="bg-black/40 p-5 rounded-xl border border-white/5 text-gray-300 capitalize">
                                    {item}
                                </div>
                            ))}
                        </div>
                    </GlassCard>
                )}

                {activeTab === 'deploy' && (
                    <GlassCard className="p-10">
                        <h2 className="text-3xl font-bold mb-6 tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-300 to-orange-500">Local and deployment notes</h2>
                        <p className="text-gray-400 leading-relaxed mb-4">
                            The repository is structured for a split deployment: frontend on Vercel or another static host, backend on a long-running Node host, and Supabase for storage.
                        </p>
                        <CodeBlock title="Run frontend" code={`npm run dev --workspace=anonpay-frontend`} />
                        <CodeBlock title="Run backend" code={`npm run start --prefix backend`} />
                        <CodeBlock title="Build frontend" code={`npm run build --workspace=anonpay-frontend`} />
                    </GlassCard>
                )}

                <div className="mt-12">
                    <DocsChatbot mode="docs" />
                </div>
            </motion.div>
        </motion.div>
    );
};

export default Docs;
