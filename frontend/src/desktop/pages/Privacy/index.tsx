import React from 'react';
import { motion } from 'framer-motion';
import { pageVariants } from '../../../shared/utils/animations';

const Privacy: React.FC = () => {
    return (
        <motion.div
            className="page-container relative min-h-screen"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
        >
            <div className="w-full pt-8 relative z-10 pb-24 px-6">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center text-center mb-16"
                >
                    <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tighter leading-tight text-white">
                        Privacy by <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7effcc] to-emerald-400">Design</span>
                    </h1>
                    <p className="text-gray-300 text-xl leading-relaxed max-w-2xl mb-8">
                        AnonPay leverages Midnight's shielded state and Zero-Knowledge Proofs to ensure your financial data remains confidential.
                        We don't just protect your privacy; we mathematically guarantee it.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* CARD 1: SHIELDED STATE */}
                    <div className="p-10 min-h-[400px] flex flex-col justify-between relative overflow-hidden group hover:bg-white/5 transition-all duration-500 border border-white/5 hover:border-white/10 rounded-2xl bg-[#080808]">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <span className="text-8xl font-bold font-mono">01</span>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3 transition-colors duration-500 group-hover:text-[#7effcc]">
                            <span className="w-8 h-8 rounded-lg bg-white/10 group-hover:bg-[#7effcc]/20 flex items-center justify-center text-white/70 group-hover:text-[#7effcc] transition-all duration-500 border border-white/5 group-hover:border-[#7effcc]/30">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </span>
                            Shielded State
                        </h2>
                        <p className="text-gray-400 mb-6 leading-relaxed">
                            Midnight's contract state is <span className="text-[#7effcc] font-semibold">private by default</span>. Unlike public ledgers where every balance and transaction is visible, AnonPay stores only commitment hashes on-chain.
                        </p>
                        <div className="bg-black/40 rounded-xl p-4 border border-white/5 font-mono text-xs text-gray-300">
                            <div className="flex justify-between mb-4 pb-2 border-b border-white/10">
                                <span className="text-gray-500 uppercase tracking-widest">On-Chain State</span>
                                <span className="text-green-400">● Private</span>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-[#7effcc]">Map&lt;Uint&lt;64&gt;, Invoice&gt;</span>
                                        <span className="text-[10px] text-gray-500">Shielded ledger storage</span>
                                    </div>
                                    <span className="px-2 py-1 bg-[#7effcc]/10 text-[#7effcc] rounded-md border border-[#7effcc]/20 text-[10px]">ENCRYPTED</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-cyan-400">Set&lt;Bytes&lt;32&gt;&gt;</span>
                                        <span className="text-[10px] text-gray-500">Nullifiers for replay protection</span>
                                    </div>
                                    <span className="px-2 py-1 bg-cyan-500/10 text-cyan-400 rounded-md border border-cyan-500/20 text-[10px]">ACTIVE</span>
                                </div>
                            </div>
                        </div>
                        <p className="mt-4 text-sm text-gray-500">
                            Only the merchant and payer can decrypt invoice details. The blockchain sees only hashes and nullifiers.
                        </p>
                    </div>

                    {/* CARD 2: BLIND DATABASE */}
                    <div className="p-10 min-h-[400px] flex flex-col justify-between relative overflow-hidden group hover:bg-white/5 transition-all duration-500 border border-white/5 hover:border-white/10 rounded-2xl bg-[#080808]">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <span className="text-8xl font-bold font-mono">02</span>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3 transition-colors duration-500 group-hover:text-[#7effcc]">
                            <span className="w-8 h-8 rounded-lg bg-white/10 group-hover:bg-[#7effcc]/20 flex items-center justify-center text-white/70 group-hover:text-[#7effcc] transition-all duration-500 border border-white/5 group-hover:border-[#7effcc]/30">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                                </svg>
                            </span>
                            Blind Database
                        </h2>
                        <p className="text-gray-400 mb-6 leading-relaxed">
                            Our backend database is mathematically blind. We explicitly <strong>do not store</strong> the Amount or Memo fields in plaintext.
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-red-500/10 p-4 rounded-xl border border-red-500/20">
                                <div className="text-red-400 text-xs uppercase tracking-widest mb-1">Never Stored</div>
                                <div className="font-mono text-sm text-gray-400 line-through">Amount</div>
                                <div className="font-mono text-sm text-gray-400 line-through">Memo</div>
                            </div>
                            <div className="bg-[#7effcc]/10 p-4 rounded-xl border border-[#7effcc]/20">
                                <div className="text-[#7effcc] text-xs uppercase tracking-widest mb-1">Encrypted</div>
                                <div className="font-mono text-sm text-white">Merchant Addr</div>
                                <div className="font-mono text-xs text-[#7effcc] mt-1 truncate">U2FsdGVkX19...</div>
                            </div>
                        </div>
                        <p className="mt-4 text-sm text-gray-500">
                            Even if our database were compromised, your financial data remains non-existent or encrypted with AES-256-GCM.
                        </p>
                    </div>

                    {/* CARD 3: SELECTIVE DISCLOSURE */}
                    <div className="p-10 min-h-[400px] flex flex-col justify-between relative overflow-hidden group hover:bg-white/5 transition-all duration-500 border border-white/5 hover:border-white/10 rounded-2xl bg-[#080808] md:col-span-2">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <span className="text-8xl font-bold font-mono">03</span>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3 transition-colors duration-500 group-hover:text-[#7effcc]">
                            <span className="w-8 h-8 rounded-lg bg-white/10 group-hover:bg-[#7effcc]/20 flex items-center justify-center text-white/70 group-hover:text-[#7effcc] transition-all duration-500 border border-white/5 group-hover:border-[#7effcc]/30">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </span>
                            Selective Disclosure
                        </h2>
                        <p className="text-gray-400 mb-8 leading-relaxed max-w-3xl">
                            Midnight's defining capability. Generate ZK proofs that reveal <strong>only specific financial facts</strong> to specific parties — total income for a period, revenue trends — without exposing individual transactions, payer identities, or amounts.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white/[0.03] p-4 rounded-xl border border-white/[0.06]">
                                <div className="text-[10px] text-[#7effcc] uppercase tracking-widest mb-2">Bank Loan</div>
                                <div className="text-sm text-white mb-1">Revealed: Total income for period</div>
                                <div className="text-xs text-gray-500">Hidden: Individual payer identities, transaction details</div>
                            </div>
                            <div className="bg-white/[0.03] p-4 rounded-xl border border-white/[0.06]">
                                <div className="text-[10px] text-[#7effcc] uppercase tracking-widest mb-2">Tax Authority</div>
                                <div className="text-sm text-white mb-1">Revealed: Total revenue for tax year</div>
                                <div className="text-xs text-gray-500">Hidden: Customer identities, individual amounts</div>
                            </div>
                            <div className="bg-white/[0.03] p-4 rounded-xl border border-white/[0.06]">
                                <div className="text-[10px] text-[#7effcc] uppercase tracking-widest mb-2">Auditor</div>
                                <div className="text-sm text-white mb-1">Revealed: Invoice settlement status</div>
                                <div className="text-xs text-gray-500">Hidden: Amounts, parties involved</div>
                            </div>
                        </div>
                    </div>

                    {/* CARD 4: COMMITMENT SCHEME */}
                    <div className="p-10 min-h-[400px] flex flex-col justify-between relative overflow-hidden group hover:bg-white/5 transition-all duration-500 border border-white/5 hover:border-white/10 rounded-2xl bg-[#080808]">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <span className="text-8xl font-bold font-mono">04</span>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3 transition-colors duration-500 group-hover:text-[#7effcc]">
                            <span className="w-8 h-8 rounded-lg bg-white/10 group-hover:bg-[#7effcc]/20 flex items-center justify-center text-white/70 group-hover:text-[#7effcc] transition-all duration-500 border border-white/5 group-hover:border-[#7effcc]/30">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                </svg>
                            </span>
                            The Payment Secret
                        </h2>
                        <p className="text-gray-400 mb-6 leading-relaxed">
                            Every invoice is protected by a client-generated <code className="text-pink-400">salt</code> — a 128-bit random value generated locally via <code className="text-[#7effcc] font-mono">crypto.getRandomValues()</code>.
                        </p>
                        <div className="bg-black/40 rounded-xl p-4 border border-white/5 text-sm space-y-3">
                            <p className="text-gray-400">
                                The invoice hash is computed as <span className="text-[#7effcc] font-mono">SHA-256(merchant + amount + salt)</span>.
                            </p>
                            <div className="flex gap-2 text-xs font-mono text-gray-500">
                                <span className="text-pink-400">Input:</span> merchant + amount + salt
                                <span className="mx-2">→</span>
                                <span className="text-green-400">Output:</span> invoice_hash
                            </div>
                        </div>
                        <p className="mt-4 text-sm text-gray-500">
                            The smart contract verifies the commitment without ever seeing the underlying values, enabling a truly trustless proof of payment.
                        </p>
                    </div>

                    {/* CARD 5: SHIELDED PAYMENTS */}
                    <div className="p-10 min-h-[400px] flex flex-col justify-between relative overflow-hidden group hover:bg-white/5 transition-all duration-500 border border-white/5 hover:border-white/10 rounded-2xl bg-[#080808]">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <span className="text-8xl font-bold font-mono">05</span>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3 transition-colors duration-500 group-hover:text-[#7effcc]">
                            <span className="w-8 h-8 rounded-lg bg-white/10 group-hover:bg-[#7effcc]/20 flex items-center justify-center text-white/70 group-hover:text-[#7effcc] transition-all duration-500 border border-white/5 group-hover:border-[#7effcc]/30">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </span>
                            Shielded Payments
                        </h2>
                        <div className="space-y-4">
                            <div className="bg-black/40 rounded-xl p-3 border border-white/5">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-[10px] uppercase tracking-widest text-[#7effcc] font-bold">Compact Circuit</span>
                                    <span className="text-[10px] text-gray-500 font-mono">pay_invoice</span>
                                </div>
                                <code className="block font-mono text-xs text-gray-300 bg-white/5 p-2 rounded border border-white/5">
                                    export circuit pay_invoice(invoice_id: Uint&lt;64&gt;)
                                </code>
                            </div>
                            <ul className="space-y-3 text-sm text-gray-400">
                                <li className="flex items-start gap-3">
                                    <div className="mt-1 min-w-[16px]">
                                        <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <div>
                                        <strong className="text-white">Nullifier Protection:</strong>
                                        <p className="text-xs text-gray-500 mt-0.5">Each payment generates a unique nullifier. Reusing it is impossible — the contract rejects double-spends at the protocol level.</p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="mt-1 min-w-[16px]">
                                        <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <strong className="text-white">ZK Verification:</strong>
                                        <p className="text-xs text-gray-500 mt-0.5">The contract verifies the payment proof without seeing private inputs — payer identity, amount, or secret key are never exposed on-chain.</p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* CARD 6: TAMPER-PROOF */}
                    <div className="p-10 min-h-[400px] flex flex-col justify-between relative overflow-hidden group hover:bg-white/5 transition-all duration-500 border border-white/5 hover:border-white/10 rounded-2xl bg-[#080808]">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <span className="text-8xl font-bold font-mono">06</span>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3 transition-colors duration-500 group-hover:text-[#7effcc]">
                            <span className="w-8 h-8 rounded-lg bg-white/10 group-hover:bg-[#7effcc]/20 flex items-center justify-center text-white/70 group-hover:text-[#7effcc] transition-all duration-500 border border-white/5 group-hover:border-[#7effcc]/30">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </span>
                            Tamper-Proof Integrity
                        </h2>
                        <p className="text-gray-400 mb-4 leading-relaxed">
                            <strong>No frauds, pure math.</strong> We employ <span className="text-[#7effcc] font-mono bg-[#7effcc]/10 px-1 rounded">SHA-256</span> hashing to cryptographically seal every invoice.
                        </p>
                        <p className="text-sm text-gray-500 mb-4">
                            Can a merchant trick you by creating a fake invoice for a higher amount?
                        </p>
                        <div className="bg-black/40 rounded-xl p-4 border border-white/5 space-y-2">
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                <span>Hash: SHA-256(merchant, 10, Salt)</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                <span>Link: SHA-256(merchant, 100, Salt)</span>
                            </div>
                            <div className="font-mono text-xs text-red-400 pt-2 border-t border-white/10">
                                ❌ HASH MISMATCH → REVERT
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </motion.div>
    );
};

export default Privacy;
