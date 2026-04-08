import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMidnightWallet } from '../../hooks/Wallet/WalletProvider';
import { GlassCard } from '../../components/ui/GlassCard';
import { Activity, Globe, Shield } from 'lucide-react';
import { MerchantConsole } from './components/MerchantConsole';
import { HostedCheckoutGuide } from './components/HostedCheckoutGuide';
import { WebhooksGuide } from './components/WebhooksGuide';
import { API_URL as apiUrl } from '../../config/api';

const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
};

const staggerContainer = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

export const DeveloperPortal = () => {
    const { walletAddress: publicKey } = useMidnightWallet();
    const [name, setName] = useState('');
    const [webhookUrl, setWebhookUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [secretKey, setSecretKey] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('console');

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!publicKey) {
            setError('Please connect your Midnight wallet first.');
            return;
        }
        if (!name) {
            setError('Merchant name is required.');
            return;
        }
        try {
            setLoading(true);
            setError(null);
            const response = await fetch(`${apiUrl}/merchants/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, midnight_address: publicKey, webhook_url: webhookUrl || null }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Registration failed.');
            setSecretKey(data.secret_key);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'console', label: 'Merchant Console', icon: Activity },
        { id: 'hosted', label: 'Hosted Checkout', icon: Globe },
        { id: 'delivery', label: 'Webhooks', icon: Shield },
    ];

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative min-h-screen">
            <div className="relative z-10 w-full max-w-7xl mx-auto pt-8 pb-24 px-6">
                <motion.div variants={staggerContainer} initial="hidden" animate="show" className="mb-16 flex flex-col items-center text-center">
                    <motion.div variants={fadeInUp} className="mb-6">
                        <span className="text-[11px] uppercase tracking-[0.25em] text-gray-500 font-semibold">For Developers</span>
                    </motion.div>
                    <motion.h1 variants={fadeInUp} className="text-4xl md:text-5xl font-bold tracking-tighter text-white mb-6">
                        Merchant onboarding and
                        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-300 to-orange-500">hosted checkout integration</span>
                    </motion.h1>
                    <motion.p variants={fadeInUp} className="text-gray-300 text-lg max-w-3xl leading-relaxed">
                        This developer surface is intentionally scoped to what the current MVP supports in the repository: merchant registration, secret-key issuance, hosted checkout flows, and webhook delivery. Broader packaged SDK, CLI, and MCP product claims are not presented here as shipped deliverables.
                    </motion.p>
                </motion.div>

                <GlassCard className="p-6 md:p-8 mb-10">
                    <div className="text-[11px] uppercase tracking-[0.25em] text-orange-300/80 mb-3">Current developer scope</div>
                    <p className="text-gray-300 leading-relaxed">
                        Use AnonPay to register a merchant, generate a secret key, create checkout sessions through the backend, and receive signed webhook events when settlement is detected. This is the current integration surface represented by the codebase.
                    </p>
                </GlassCard>

                <div className="sticky top-24 z-50 mb-12">
                    <div className="overflow-x-auto scrollbar-thin">
                        <div className="flex flex-nowrap gap-2 bg-black/60 backdrop-blur-2xl p-2 rounded-2xl border border-white/[0.06] w-max min-w-full">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 whitespace-nowrap ${activeTab === tab.id
                                        ? 'bg-white text-black shadow-lg'
                                        : 'text-gray-400 hover:text-white hover:bg-white/[0.05]'
                                        }`}
                                >
                                    <tab.icon className="w-3.5 h-3.5" />
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {activeTab === 'console' && (
                        <motion.div key="console" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                            <MerchantConsole
                                publicKey={publicKey}
                                name={name}
                                setName={setName}
                                webhookUrl={webhookUrl}
                                setWebhookUrl={setWebhookUrl}
                                loading={loading}
                                error={error}
                                secretKey={secretKey}
                                setSecretKey={setSecretKey}
                                handleRegister={handleRegister}
                            />
                        </motion.div>
                    )}

                    {activeTab === 'hosted' && (
                        <motion.div key="hosted" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                            <HostedCheckoutGuide />
                        </motion.div>
                    )}

                    {activeTab === 'delivery' && (
                        <motion.div key="delivery" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                            <WebhooksGuide />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default DeveloperPortal;
