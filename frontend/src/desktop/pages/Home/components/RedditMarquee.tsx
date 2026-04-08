import React from 'react';

const FEATURE_CARDS = [
    {
        sub: 'Freelancers',
        user: 'AnonPay Use Case',
        title: 'Get paid in crypto without exposing your full income history',
        url: '#',
        content:
            'Send a private invoice, receive payment, and keep clients from seeing who else paid you or what you earned last month.',
    },
    {
        sub: 'Businesses',
        user: 'AnonPay Use Case',
        title: 'Accept crypto payments without broadcasting business revenue',
        url: '#',
        content:
            'Merchants can share payment links publicly while keeping balances, customer relationships, and transaction history private by default.',
    },
    {
        sub: 'Selective Disclosure',
        user: 'AnonPay Feature',
        title: 'Prove revenue totals without exposing every transaction',
        url: '#',
        content:
            'Generate verifiable financial disclosures for banks, auditors, or tax authorities while keeping counterparties and raw history hidden.',
    },
    {
        sub: 'Creators',
        user: 'AnonPay Use Case',
        title: 'Collect support and donations without turning earnings public',
        url: '#',
        content:
            'Open donation-style invoices let supporters contribute while preserving privacy for both the payer and the recipient.',
    },
    {
        sub: 'Verification',
        user: 'AnonPay Feature',
        title: 'Commitment-based invoices that can be checked before payment',
        url: '#',
        content:
            'Payers can verify that a payment request matches the intended invoice without seeing every sensitive field on-chain.',
    },
    {
        sub: 'Midnight',
        user: 'AnonPay Architecture',
        title: 'Built for private payments instead of public address exposure',
        url: '#',
        content:
            'AnonPay uses Midnight’s privacy model to support shielded settlement flows, selective disclosure, and private merchant operations.',
    },
    {
        sub: 'Receipts',
        user: 'AnonPay Feature',
        title: 'Track settlements and receipts without leaking your financial graph',
        url: '#',
        content:
            'Merchants and payers get verifiable proof of payment activity without publishing a readable ledger trail.',
    },
    {
        sub: 'Checkout',
        user: 'AnonPay Feature',
        title: 'Hosted checkout for private invoices',
        url: '#',
        content:
            'Create an invoice once, share a clean checkout link, and monitor settlement status from the merchant dashboard.',
    },
];

export const RedditMarquee: React.FC = () => {
    return (
        <>
            <div
                className="relative flex overflow-hidden group w-[100vw] left-1/2 -translate-x-1/2"
                style={{
                    maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
                    WebkitMaskImage:
                        'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
                }}
            >
                <div className="flex animate-[scroll_180s_linear_infinite] group-hover:[animation-play-state:paused] w-max gap-6 px-3">
                    {[...Array(2)].map((_, arrayIndex) => (
                        <div key={arrayIndex} className="flex gap-6">
                            {FEATURE_CARDS.map((post, i) => (
                                <div
                                    key={`post-${arrayIndex}-${i}`}
                                    className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 text-left w-[400px] shrink-0 relative overflow-hidden flex flex-col"
                                >
                                    <div className="absolute top-0 left-0 w-[3px] h-full bg-gradient-to-b from-white/40 to-white/5" />
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
                                                <span className="text-white font-bold text-xs">
                                                    {post.sub[0]}
                                                </span>
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <span className="font-bold text-white text-sm">{post.sub}</span>
                                                </div>
                                                <span className="text-gray-500 text-xs">{post.user}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4 space-y-2 flex-grow">
                                        <h3 className="font-bold text-lg leading-snug text-white">
                                            {post.title}
                                        </h3>
                                        <p className="text-sm leading-relaxed text-gray-400 font-light line-clamp-4 mt-2">
                                            {post.content}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            <style>{`
                @keyframes scroll {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
            `}</style>
        </>
    );
};
