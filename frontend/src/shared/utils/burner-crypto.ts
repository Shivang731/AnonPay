import { ZswapSecretKeys } from '@midnight-ntwrk/ledger-v8';
import {
    MidnightBech32m,
    ShieldedAddress,
    ShieldedCoinPublicKey,
    ShieldedEncryptionPublicKey,
    type NetworkId,
} from '@midnight-ntwrk/wallet-sdk-address-format';

const SIGN_MESSAGE = 'AnonPay-Burner-Wallet-Encryption-Key-v1';

const bytesToHex = (bytes: Uint8Array) =>
    Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');

const hexToBytes = (value: string) => {
    const normalized = value.trim().replace(/^0x/i, '');
    if (!normalized || normalized.length % 2 !== 0 || !/^[0-9a-fA-F]+$/.test(normalized)) {
        throw new Error('Invalid hex payload.');
    }

    const bytes = new Uint8Array(normalized.length / 2);
    for (let index = 0; index < normalized.length; index += 2) {
        bytes[index / 2] = Number.parseInt(normalized.slice(index, index + 2), 16);
    }
    return bytes;
};

const bytesToBase64 = (bytes: Uint8Array) => {
    let binary = '';
    const chunkSize = 0x8000;

    for (let index = 0; index < bytes.length; index += chunkSize) {
        binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
    }

    return window.btoa(binary);
};

const base64ToBytes = (value: string) =>
    Uint8Array.from(window.atob(value), (char) => char.charCodeAt(0));

async function deriveKeyFromSignature(signatureBytes: Uint8Array): Promise<CryptoKey> {
    // Hash the signature to get exactly 32 bytes for AES-256
    const hashBuffer = await crypto.subtle.digest('SHA-256', new Uint8Array(signatureBytes));
    
    return crypto.subtle.importKey(
        'raw',
        hashBuffer,
        { name: 'AES-GCM' },
        false,
        ['encrypt', 'decrypt']
    );
}

export async function encryptWithWallet(
    rawPrivateKey: string,
    signMessage: (message: string | Uint8Array) => Promise<Uint8Array | undefined>
): Promise<string> {
    // 1. Get deterministic signature from the wallet
    const signatureBytes = await signMessage(SIGN_MESSAGE);
    if (!signatureBytes) throw new Error('Wallet did not return a signature.');
    
    // 2. Derive AES key
    const aesKey = await deriveKeyFromSignature(signatureBytes);
    
    // 3. Generate a random IV (12 bytes for AES-GCM)
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    // 4. Encrypt
    const encoded = new TextEncoder().encode(rawPrivateKey);
    const ciphertext = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        aesKey,
        encoded
    );
    
    // 5. Combine IV + ciphertext → base64
    const combined = new Uint8Array(iv.length + new Uint8Array(ciphertext).length);
    combined.set(iv, 0);
    combined.set(new Uint8Array(ciphertext), iv.length);
    
    return bytesToBase64(combined);
}

export async function decryptWithWallet(
    encryptedBase64: string,
    signMessage: (message: string | Uint8Array) => Promise<Uint8Array | undefined>
): Promise<string> {

    const signatureBytes = await signMessage(SIGN_MESSAGE);
    if (!signatureBytes) throw new Error('Wallet did not return a signature.');
    const aesKey = await deriveKeyFromSignature(signatureBytes);
    const combined = base64ToBytes(encryptedBase64);
    const iv = combined.slice(0, 12);
    const ciphertext = combined.slice(12);
    const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        aesKey,
        ciphertext
    );
    
    return new TextDecoder().decode(decrypted);
}

export interface GeneratedBurnerWallet {
    address: string;
    secret: string;
}

export function generateBurnerWallet(networkId: NetworkId): GeneratedBurnerWallet {
    const seed = crypto.getRandomValues(new Uint8Array(32));
    const secretKeys = ZswapSecretKeys.fromSeed(seed);

    const shieldedAddress = new ShieldedAddress(
        new ShieldedCoinPublicKey(hexToBytes(secretKeys.coinPublicKey)),
        new ShieldedEncryptionPublicKey(hexToBytes(secretKeys.encryptionPublicKey)),
    );

    return {
        address: MidnightBech32m.encode(networkId, shieldedAddress).toString(),
        secret: bytesToHex(seed),
    };
}
