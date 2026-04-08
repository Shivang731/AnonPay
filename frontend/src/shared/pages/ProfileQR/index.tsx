import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useMidnightWallet } from '../../hooks/Wallet/WalletProvider';
import { useProfileQR } from '../../hooks/useProfileQR';
import { ProfileQR } from '../Profile/components/ProfileQR';

export interface MerchantReceipt {
    invoiceHash: string;
    amount: number;
    tokenType: number;
    receiptHash: string;
    timestamp?: number;
}

const ProfileQRPage: React.FC = () => {
    const { walletAddress } = useMidnightWallet();
    const { mainHash, burnerHash } = useProfileQR();

    // todo: implement receipt fetching with midnight sdk
    // for now relying on ProfileQR's live feed for real-time data
    const [mainReceipts] = useState<MerchantReceipt[]>([]);
    const [burnerReceipts] = useState<MerchantReceipt[]>([]);

    // silence unused warnings for now — these will be used when sdk is wired up
    void mainHash;
    void burnerHash;

    if (!walletAddress) {
        return (
            <div className="page-container relative min-h-screen flex items-center justify-center">
                <p className="text-gray-400">Connect your wallet to view your QR code.</p>
            </div>
        );
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="page-container relative min-h-screen">
            <div className="fixed inset-0 pointer-events-none z-0 opacity-30">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-500/5 rounded-full blur-[120px] animate-float" />
                <div className="absolute top-[20%] right-[-5%] w-[30%] h-[30%] bg-amber-400/10 rounded-full blur-[100px] animate-float-delayed" />
                <div className="absolute bottom-[-10%] left-[20%] w-[35%] h-[35%] bg-orange-500/5 rounded-full blur-[120px] animate-pulse-slow" />
            </div>
            <div className="absolute top-[-150px] left-1/2 -translate-x-1/2 w-screen h-[800px] z-0 pointer-events-none flex justify-center overflow-hidden">
                <img src="/assets/anonpay_logo.png" alt="AnonPay" className="w-full h-full object-cover opacity-50 mix-blend-screen mask-image-gradient-b" style={{ maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)', WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)' }} />
            </div>

            <motion.div initial="hidden" animate="visible" variants={itemVariants} className="w-full max-w-2xl mx-auto mt-16 relative z-10 mb-12">
                <ProfileQR initialMainReceipts={mainReceipts} initialBurnerReceipts={burnerReceipts} />
            </motion.div>

        </div>
    );
};

export default ProfileQRPage;
