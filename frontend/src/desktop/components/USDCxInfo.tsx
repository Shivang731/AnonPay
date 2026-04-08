import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '../../shared/components/ui/Button';

const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

export const MidnightTokenInfo: React.FC = () => {
    return (
        <section className="relative z-10 pt-12 pb-20 overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] bg-emerald-500/5 rounded-full blur-[150px] pointer-events-none -z-10" />

            <div className="max-w-7xl mx-auto px-6">
                
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-12 text-center tracking-tight">
                    Built on <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-emerald-300 to-emerald-500 drop-shadow-[0_0_15px_rgba(126,255,204,0.3)]">Midnight</span>
                </h2>

                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeInUp}
                    className="text-center bg-white/5 border border-white/10 rounded-2xl p-8 hover:border-emerald-500/30 transition-colors group"
                >
                    <h3 className="text-3xl font-bold text-white mb-4 tracking-tight">
                        <span className="relative">
                            <span className="absolute inset-0 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-emerald-300 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 drop-shadow-[0_0_15px_rgba(126,255,204,0.3)]" aria-hidden="true">
                                tDUST
                            </span>
                            <span className="group-hover:opacity-0 transition-opacity duration-500">
                                tDUST
                            </span>
                        </span>
                    </h3>
                    <p className="text-lg text-gray-400 mb-8 min-h-[80px]">
                        The current AnonPay demo flow targets Midnight preprod and uses tDUST for testing. If you want to try the app end to end, start by funding a wallet from the faucet.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Button
                            variant="ghost"
                            className="h-12 px-6 text-sm text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 border border-emerald-500/20 w-full sm:w-auto"
                            onClick={() => window.open('https://faucet.preprod.midnight.network/', '_blank')}
                        >
                            Get tDUST from Faucet
                            <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                        </Button>
                        <Button
                            variant="ghost"
                            className="h-12 px-6 text-sm text-gray-400 hover:text-white hover:bg-white/5 border border-white/10 w-full sm:w-auto"
                            onClick={() => window.open('https://docs.midnight.network/', '_blank')}
                        >
                            Read Midnight Docs
                            <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                        </Button>
                    </div>
                </motion.div>

                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeInUp}
                    className="text-center border-t border-white/5 pt-6 mt-12"
                >
                    <p className="text-xs text-gray-500 max-w-4xl mx-auto leading-relaxed">
                        AnonPay uses Midnight as the foundation for its privacy-oriented invoice and payment workflow. The live MVP is focused on invoice creation, payment handling, and selective disclosure links rather than a fully finished proof-verifier stack.
                    </p>
                </motion.div>
            </div>
        </section>
    );
};
