import { useEffect, useState } from 'react';
import { usePayment, PaymentStep } from '../../../shared/hooks/usePayment';
import { useMidnightWallet } from '../../../shared/hooks/Wallet/WalletProvider';
import { WalletConnectButton } from '../../../shared/components/ui/WalletConnectButton';
import { GlassCard } from '../../../shared/components/ui/GlassCard';
import { Button } from '../../../shared/components/ui/Button';
import { Shimmer } from '../../../shared/components/ui/Shimmer';
import { TokenCode, getAllowedTokensForInvoice, getTokenLabel, getTokenTypeFromCode } from '../../../shared/utils/tokens';

const formatCommitment = (value?: string) =>
    value ? `${value.slice(0, 16)}...${value.slice(-16)}` : null;

const PaymentPage = () => {
    const {
        step,
        status,
        loading,
        error,
        invoice,
        txId,
        handleConnect,
        payInvoice,
    } = usePayment();

    const [selectedToken, setSelectedToken] = useState<number>(0);
    const { walletAddress } = useMidnightWallet();
    const isProcess = loading;
    const allowedTokens: TokenCode[] = invoice
        ? getAllowedTokensForInvoice(invoice.tokenType, invoice.invoiceType)
        : ['TDUST'];

    useEffect(() => {
        if (!invoice || invoice.tokenType !== 3) return;
        const nextToken = getTokenTypeFromCode(allowedTokens[0]);
        setSelectedToken((current) => allowedTokens.some((token) => getTokenTypeFromCode(token) === current) ? current : nextToken);
    }, [invoice?.hash, invoice?.tokenType, allowedTokens.join(',')]);

    const handlePay = async () => {
        await payInvoice();
    };

    const steps: { key: PaymentStep; label: string }[] = [
        { key: 'CONNECT', label: '1. Connect' },
        { key: 'VERIFY', label: '2. Verify' },
        { key: 'PAY', label: '3. Pay' },
    ];

    const activeTokenType = invoice?.tokenType === 3 ? selectedToken : (invoice?.tokenType ?? 0);
    const currencyLabel = getTokenLabel(activeTokenType);
    const verificationRows = invoice ? [
        {
            label: 'Backend invoice',
            value: invoice.verification.backendStatus === 'SETTLED'
                ? 'Already settled'
                : invoice.verification.backendStatus === 'EXPIRED'
                    ? 'Expired'
                    : 'Open',
        },
        {
            label: 'Hash commitment',
            value: invoice.verification.hashMatches
                ? `Matched (${invoice.verification.hashSource})`
                : invoice.verification.hashSource === 'unverified'
                    ? 'Legacy link'
                    : 'Mismatch',
        },
        {
            label: 'Privacy',
            value: 'Shielded tDUST via Lace',
        },
    ] : [];

    return (
        <div className="page-container flex flex-col items-center justify-center min-h-[85vh]">
            <div className="absolute top-[-150px] left-1/2 -translate-x-1/2 w-screen h-[800px] z-0 pointer-events-none flex justify-center overflow-hidden">
                <img
                    src="/assets/anonpay_globe.png"
                    alt="Midnight Network"
                    className="w-full h-full object-cover opacity-50 mix-blend-screen mask-image-gradient-b"
                    style={{
                        maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)',
                        WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)'
                    }}
                />
            </div>
            <div className="w-full max-w-lg">
                <div className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tighter text-white">
                        {step === 'SUCCESS' ? 'Null Payment' : step === 'ALREADY_PAID' ? 'Null Invoice' : 'Make'} <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">{step === 'SUCCESS' ? 'Successful' : step === 'ALREADY_PAID' ? 'Paid' : 'Null Payment'}</span>
                    </h1>

                    {invoice && !error && (
                        <div className="inline-flex items-center gap-2 bg-neon-primary/10 px-4 py-2 rounded-full border border-neon-primary/20 shadow-[0_0_15px_rgba(0,243,255,0.15)]">
                            <svg className="w-5 h-5 text-neon-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-sm font-bold text-neon-primary tracking-wide uppercase">
                                Verified On-Chain
                            </span>
                        </div>
                    )}
                </div>

                <GlassCard variant="heavy" className="p-8 relative overflow-hidden">
                    <div className="flex justify-between mb-8 relative">
                        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/10 -z-0" />
                        {steps.map((s, index) => {
                            let isActive = s.key === step ||
                                (step === 'CONVERT' && s.key === 'PAY') ||
                                ((step === 'SUCCESS' || step === 'ALREADY_PAID') && s.key === 'PAY') ||
                                (steps.findIndex(x => x.key === step) > index);

                            return (
                                <div key={s.key} className="relative z-10 flex flex-col items-center gap-2">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${isActive
                                        ? 'bg-neon-primary border-neon-primary text-black shadow-[0_0_10px_rgba(0,243,255,0.5)]'
                                        : 'bg-black border-gray-700 text-gray-500'
                                        }`}>
                                        {isActive ? (
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                        ) : (
                                            <span className="text-xs font-bold">{index + 1}</span>
                                        )}
                                    </div>
                                    <span className={`text-xs font-bold tracking-wider uppercase transition-colors ${isActive ? 'text-neon-primary' : 'text-gray-600'}`}>
                                        {s.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    <div className="bg-black/30 rounded-2xl p-6 border border-white/5 mb-8 space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-400 uppercase tracking-widest">Merchant</span>
                            {loading && !invoice ? (
                                <Shimmer className="h-6 w-32 bg-white/5 rounded" />
                            ) : (
                                <span className="font-mono text-white text-sm bg-white/5 px-2 py-1 rounded">
                                    {invoice?.merchant ? `${invoice.merchant.slice(0, 10)}...${invoice.merchant.slice(-5)}` : 'Unknown'}
                                </span>
                            )}
                        </div>

                        {invoice?.items && invoice.items.length > 0 && (
                            <div className="pt-4 border-t border-white/5">
                                <span className="text-sm font-medium text-gray-400 uppercase tracking-widest block mb-3">Items</span>
                                <div className="bg-black/20 rounded-xl border border-white/5 overflow-hidden">
                                    <div className="grid grid-cols-[1fr_60px_80px_80px] gap-2 px-3 py-2 bg-white/5 border-b border-white/5">
                                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Item</span>
                                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center">Qty</span>
                                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center">Price</span>
                                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">Total</span>
                                    </div>
                                    {invoice.items.map((item, idx) => (
                                        <div key={idx} className="grid grid-cols-[1fr_60px_80px_80px] gap-2 px-3 py-2 border-b border-white/5 last:border-b-0">
                                            <span className="text-sm text-white truncate">{item.name || 'Unnamed'}</span>
                                            <span className="text-sm text-gray-400 text-center">{item.quantity}</span>
                                            <span className="text-sm text-gray-400 text-center">{item.unitPrice}</span>
                                            <span className="text-sm text-neon-primary font-mono text-right">{item.total.toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex justify-between items-center pt-4 border-t border-white/5">
                            <span className="text-sm font-medium text-gray-400 uppercase tracking-widest">Amount</span>
                            {loading && !invoice ? (
                                <Shimmer className="h-8 w-24 bg-white/5 rounded" />
                            ) : (
                                <span className="text-2xl font-bold text-white tracking-tight">{invoice?.amount || '0'} <span className="text-sm text-gray-500 font-normal">{currencyLabel}</span></span>
                            )}
                        </div>

                        {invoice?.tokenType === 3 && step !== 'SUCCESS' && step !== 'ALREADY_PAID' && (
                            <div className="pt-4 border-t border-white/5">
                                <span className="text-sm font-medium text-gray-400 uppercase tracking-widest block mb-2">Select Payment Token</span>
                                <div className="p-1 bg-black/20 rounded-xl flex gap-1 border border-white/5">
                                    {allowedTokens.map((token) => {
                                        const tokenType = getTokenTypeFromCode(token);
                                        const activeClass = tokenType === 0
                                            ? 'bg-white text-black shadow-lg'
                                            : tokenType === 1
                                                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                                                : 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20';

                                        return (
                                            <button
                                                key={token}
                                                onClick={() => setSelectedToken(tokenType)}
                                                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${selectedToken === tokenType
                                                    ? activeClass
                                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                                    }`}
                                            >
                                                {getTokenLabel(tokenType)}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                        {invoice?.memo && (
                            <div className="flex justify-between items-center pt-4 border-t border-white/5">
                                <span className="text-sm font-medium text-gray-400 uppercase tracking-widest">Memo</span>
                                {loading && !invoice ? (
                                    <Shimmer className="h-5 w-48 bg-white/5 rounded" />
                                ) : (
                                    <span className="text-gray-300">{invoice?.memo || '-'}</span>
                                )}
                            </div>
                        )}

                        {invoice && (
                            <div className="pt-4 border-t border-white/5 space-y-3">
                                <span className="text-sm font-medium text-gray-400 uppercase tracking-widest block">Shielded Checks</span>
                                {verificationRows.map((row) => (
                                    <div key={row.label} className="flex justify-between items-center gap-4 rounded-xl border border-white/5 bg-black/20 px-4 py-3">
                                        <span className="text-xs font-bold uppercase tracking-[0.18em] text-gray-500">{row.label}</span>
                                        <span className="text-sm text-white text-right">{row.value}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        {error && (
                            <div className="p-4 bg-white/5 border border-white/10 rounded-xl text-center">
                                <p className="text-white text-sm font-medium">{error}</p>
                            </div>
                        )}

                        {status && !status.startsWith('at1') && !error && step !== 'ALREADY_PAID' && step !== 'SUCCESS' && (
                            <div className="text-center p-3 bg-neon-primary/10 rounded-xl border border-neon-primary/20">
                                <p className="text-neon-primary text-sm font-mono animate-pulse">{status}</p>
                            </div>
                        )}

                        {(step === 'SUCCESS' || step === 'ALREADY_PAID') ? (
                            <div className="text-center space-y-4">
                                <p className="text-gray-400">
                                    {step === 'ALREADY_PAID'
                                        ? 'This invoice has already been settled on-chain.'
                                        : 'The transaction has been settled on-chain.'}
                                </p>
                                {invoice?.receiptCommitment && (
                                    <div className="rounded-xl border border-neon-primary/20 bg-neon-primary/10 px-4 py-3">
                                        <p className="text-[11px] uppercase tracking-[0.2em] text-neon-primary/70">ZK Receipt Commitment</p>
                                        <p className="mt-2 font-mono text-sm text-white break-all">{formatCommitment(invoice.receiptCommitment)}</p>
                                        <p className="mt-2 text-xs text-gray-400">Shared privately between payer and merchant.</p>
                                    </div>
                                )}
                                {txId && (
                                    <Button
                                        variant="primary"
                                        onClick={() => window.open(`https://explorer.preprod.midnight.network/transaction/${txId}`, '_blank')}
                                    >
                                        View Transaction
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <>
                                {step === 'CONNECT' ? (
                                    <div className="flex flex-col gap-3">
                                        <div className="wallet-adapter-wrapper w-full [&>button]:!w-full [&>button]:!justify-center">
                                            <WalletConnectButton className="w-full bg-neon-primary text-black font-bold rounded-xl h-12 hover:bg-neon-accent transition-colors" />
                                        </div>
                                        {walletAddress && (
                                            <Button variant="secondary" onClick={handleConnect}>
                                                Continue with Connected Wallet
                                            </Button>
                                        )}
                                    </div>
                                ) : step === 'VERIFY' ? (
                                    <Button variant="primary" onClick={handleConnect} className="w-full">
                                        Verify Hash & Records
                                    </Button>
                                ) : (
                                    <Button
                                        variant="primary"
                                        onClick={handlePay}
                                        disabled={isProcess}
                                        className="w-full"
                                        glow
                                    >
                                        {isProcess ? (
                                            <span className="flex items-center gap-2">
                                                <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                                Processing...
                                            </span>
                                        ) : (
                                            `Pay ${invoice?.amount || '0'} ${currencyLabel} Privately`
                                        )}
                                    </Button>
                                )}
                            </>
                        )}
                    </div>
                </GlassCard>

                <p className="text-center mt-8 text-xs font-medium text-gray-500 uppercase tracking-widest">
                    Secured by Midnight Zero-Knowledge Proofs
                </p>
            </div>
        </div>
    );
};

export default PaymentPage;
