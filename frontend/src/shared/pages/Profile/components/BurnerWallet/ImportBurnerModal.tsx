import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface ImportBurnerModalProps {
    open: boolean;
    burnerAddress: string;
    burnerSecretHex: string;
    onClose: () => void;
    onCopyAddress: () => void;
    onCopySecret: () => void;
    onDownloadEncrypted: () => void;
    onDownloadPlaintext: () => void;
}

export const ImportBurnerModal: React.FC<ImportBurnerModalProps> = ({
    open,
    burnerAddress,
    burnerSecretHex,
    onClose,
    onCopyAddress,
    onCopySecret,
    onDownloadEncrypted,
    onDownloadPlaintext,
}) => {
    const [revealSecret, setRevealSecret] = useState(false);

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <div
                className="w-full max-w-2xl rounded-2xl border border-white/10 bg-[#0b0b0d] p-6 shadow-[0_0_40px_rgba(0,0,0,0.35)]"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="flex items-start justify-between gap-4 mb-5">
                    <div>
                        <p className="text-[10px] uppercase tracking-[0.25em] text-gray-500 font-bold">Import Burner</p>
                        <h3 className="text-xl font-bold text-white mt-2">Burner Wallet Export</h3>
                        <p className="text-sm text-gray-400 mt-2 max-w-xl">
                            Use this modal to move the burner wallet into another client, or keep an offline backup you can restore later.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-gray-500 hover:text-white transition-colors"
                    >
                        Close
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[240px,1fr] gap-6">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 flex flex-col items-center">
                        <div className="bg-white rounded-xl p-3">
                            <QRCodeSVG value={burnerAddress} size={180} level="H" includeMargin={false} />
                        </div>
                        <p className="text-xs text-gray-500 mt-3 text-center">
                            QR for the burner receive address
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                            <div className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold mb-2">Burner Address</div>
                            <div className="font-mono text-xs text-white break-all">{burnerAddress}</div>
                            <button
                                type="button"
                                onClick={onCopyAddress}
                                className="mt-3 px-3 py-1.5 rounded-lg border border-white/15 text-xs font-bold text-white hover:bg-white/5 transition-colors"
                            >
                                Copy Address
                            </button>
                        </div>

                        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                            <div className="flex items-center justify-between gap-3 mb-2">
                                <div className="text-[10px] uppercase tracking-[0.2em] text-amber-300 font-bold">Burner Secret Hex</div>
                                <button
                                    type="button"
                                    onClick={() => setRevealSecret((value) => !value)}
                                    className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-300 hover:text-amber-200 transition-colors"
                                >
                                    {revealSecret ? 'Hide' : 'Reveal'}
                                </button>
                            </div>
                            <div className="font-mono text-xs break-all text-white">
                                {revealSecret ? burnerSecretHex : '•'.repeat(Math.max(32, burnerSecretHex.length))}
                            </div>
                            <div className="flex flex-wrap gap-2 mt-3">
                                <button
                                    type="button"
                                    onClick={onCopySecret}
                                    className="px-3 py-1.5 rounded-lg bg-amber-400 text-black text-xs font-bold hover:opacity-90 transition-opacity"
                                >
                                    Copy Secret
                                </button>
                                <button
                                    type="button"
                                    onClick={onDownloadPlaintext}
                                    className="px-3 py-1.5 rounded-lg border border-amber-400/40 text-amber-300 text-xs font-bold hover:bg-amber-400/10 transition-colors"
                                >
                                    Download Plaintext JSON
                                </button>
                            </div>
                        </div>

                        <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
                            <div className="text-[10px] uppercase tracking-[0.2em] text-blue-300 font-bold mb-2">Encrypted Backup</div>
                            <p className="text-xs text-gray-300 leading-relaxed">
                                Prefer this if you want a safer export to store offline. It keeps the burner key encrypted with your AnonPay app password.
                            </p>
                            <button
                                type="button"
                                onClick={onDownloadEncrypted}
                                className="mt-3 px-3 py-1.5 rounded-lg border border-blue-400/40 text-blue-300 text-xs font-bold hover:bg-blue-400/10 transition-colors"
                            >
                                Download Encrypted Backup
                            </button>
                        </div>

                        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                            <div className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold mb-2">How To Use</div>
                            <ol className="text-xs text-gray-300 space-y-2 list-decimal list-inside">
                                <li>Copy the burner address to receive private invoice payments.</li>
                                <li>Use the secret hex only when importing the burner wallet into another compatible client.</li>
                                <li>Store either the encrypted backup or the plaintext export offline before removing the burner wallet.</li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
