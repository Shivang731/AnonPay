import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { GlassCard } from '../../../shared/components/ui/GlassCard';
import { Input } from '../../../shared/components/ui/Input';
import { Button } from '../../../shared/components/ui/Button';
import { fetchDisclosureProof, type DisclosureProof } from '../../../shared/services/api';

const Verification = () => {
    const { proofId: routeProofId } = useParams();
    const [proofId, setProofId] = useState(routeProofId || '');
    const [status, setStatus] = useState<'IDLE' | 'CHECKING' | 'VALID' | 'INVALID'>('IDLE');
    const [proof, setProof] = useState<DisclosureProof | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleVerify = async (candidate = proofId) => {
        const normalizedProofId = candidate.trim();
        if (!normalizedProofId) return;

        setStatus('CHECKING');
        setError(null);
        setProof(null);

        try {
            const result = await fetchDisclosureProof(normalizedProofId);
            setProof(result);
            setStatus(result.verified ? 'VALID' : 'INVALID');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to verify disclosure proof.');
            setStatus('INVALID');
        }
    };

    useEffect(() => {
        if (!routeProofId) return;
        setProofId(routeProofId);
        void handleVerify(routeProofId);
    }, [routeProofId]);

    return (
        <div className="page-container relative min-h-screen flex items-center justify-center p-6">
            <div className="fixed inset-0 pointer-events-none z-0 opacity-30">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-600/20 rounded-full blur-[120px] animate-float" />
                <div className="absolute bottom-[-10%] right-[20%] w-[35%] h-[35%] bg-blue-600/20 rounded-full blur-[120px] animate-float-delayed" />
            </div>

            <GlassCard className="w-full max-w-md p-8 relative z-10 flex flex-col gap-6">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-white mb-2">Verify Disclosure</h1>
                    <p className="text-gray-400 text-sm">
                        Check a selective disclosure link and see only the invoice facts the merchant chose to reveal.
                    </p>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="text-white text-xs font-bold uppercase tracking-wider mb-2 block">Disclosure Proof ID</label>
                        <Input
                            value={proofId}
                            onChange={(e) => {
                                setProofId(e.target.value);
                                setProof(null);
                                setError(null);
                                setStatus('IDLE');
                            }}
                            placeholder="Enter proof id..."
                            className="bg-black/40 border-white/10 focus:border-violet-500 font-mono text-sm"
                        />
                    </div>
                </div>

                <Button
                    variant="primary"
                    className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold"
                    onClick={() => void handleVerify()}
                    disabled={status === 'CHECKING' || !proofId.trim()}
                >
                    {status === 'CHECKING' ? 'Checking Disclosure...' : 'Verify Proof'}
                </Button>

                {status === 'VALID' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-emerald-500/20 border border-emerald-500/50 rounded-lg p-4">
                        <span className="text-emerald-400 font-bold flex items-center justify-center gap-2">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            Verified Disclosure
                        </span>
                        <div className="mt-4 space-y-2 text-xs text-gray-300">
                            <p className="break-all"><span className="text-white font-semibold">Proof ID:</span> {proof?.proof_id}</p>
                            {proof?.invoice_id && <p><span className="text-white font-semibold">Invoice:</span> {proof.invoice_id}</p>}
                            {proof?.status && <p><span className="text-white font-semibold">Status:</span> {proof.status}</p>}
                            {proof?.settled_at && <p><span className="text-white font-semibold">Settled At:</span> {new Date(proof.settled_at).toLocaleString()}</p>}
                            {proof?.amount !== undefined && <p><span className="text-white font-semibold">Amount:</span> {(Number(proof.amount) / 1_000_000).toLocaleString()}</p>}
                            {proof?.recipient_description && <p><span className="text-white font-semibold">Context:</span> {proof.recipient_description}</p>}
                        </div>
                    </motion.div>
                )}

                {status === 'INVALID' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-center">
                        <span className="text-red-400 font-bold flex items-center justify-center gap-2">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            Invalid Proof
                        </span>
                        <p className="text-xs text-gray-300 mt-1">{error || 'No disclosure proof was found for this ID.'}</p>
                    </motion.div>
                )}
            </GlassCard>
        </div>
    );
};

export default Verification;
