import {
    createCircuitContext,
    type CircuitContext,
    emptyRunningCost,
} from '@midnight-ntwrk/compact-runtime';
import type { ConnectedAPI } from '@midnight-ntwrk/dapp-connector-api';
import type { Contract, Witnesses } from '../../contract';

export const CONTRACT_ADDRESS =
    import.meta.env.VITE_ANONPAY_CONTRACT_ADDRESS ?? '';

export const NETWORK_ID = import.meta.env.VITE_NETWORK || 'preprod';

export const generateSalt = (): Uint8Array => {
    const salt = new Uint8Array(16);
    crypto.getRandomValues(salt);
    return salt;
};

export const buildContract = (
    ContractClass: new (witnesses: Witnesses<any>) => Contract<any>,
): Contract<any> => {
    const witnesses: Witnesses<any> = {
        secretKey: (context) => {
            return [context.privateState, new Uint8Array(32)];
        },
        payerNonce: (context) => {
            const nonce = new Uint8Array(32);
            crypto.getRandomValues(nonce);
            return [context.privateState, nonce];
        },
    };

    return new ContractClass(witnesses);
};

export const buildCircuitContext = async (
    _connectedApi: ConnectedAPI,
    contractAddress: string,
    ContractClass: new (witnesses: Witnesses<any>) => Contract<any>,
): Promise<CircuitContext<any>> => {
    const contract = buildContract(ContractClass);
    const initialState = contract.initialState({
        initialPrivateState: null,
        initialZswapLocalState: {
            coinPublicKey: { bytes: new Uint8Array(32) },
            currentIndex: 0n,
            inputs: [],
            outputs: [],
        },
    });

    return createCircuitContext(
        contractAddress,
        { bytes: new Uint8Array(32) },
        initialState.currentContractState,
        initialState.currentPrivateState,
        emptyRunningCost(),
    );
};

export const hexToBytes = (hex: string): Uint8Array => {
    const clean = hex.replace(/^0x/, '');
    const bytes = new Uint8Array(clean.length / 2);
    for (let i = 0; i < clean.length; i += 2) {
        bytes[i / 2] = parseInt(clean.substring(i, i + 2), 16);
    }
    return bytes;
};

export const bytesToHex = (bytes: Uint8Array): string => {
    return Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
};

export const bytesToFieldString = (bytes: Uint8Array): string => {
    let value = 0n;
    for (const byte of bytes) {
        value = (value << 8n) + BigInt(byte);
    }
    return `${value}field`;
};

export const computeInvoiceHash = async (
    merchantAddress: string,
    amount: bigint,
    salt: Uint8Array,
): Promise<Uint8Array> => {
    const encoder = new TextEncoder();
    const merchantBytes = encoder.encode(merchantAddress);
    const amountBytes = new Uint8Array(8);
    const view = new DataView(amountBytes.buffer);
    view.setBigUint64(0, amount, true);

    const combined = new Uint8Array(
        merchantBytes.length + amountBytes.length + salt.length,
    );
    combined.set(merchantBytes, 0);
    combined.set(amountBytes, merchantBytes.length);
    combined.set(salt, merchantBytes.length + amountBytes.length);

    const hashBuffer = await crypto.subtle.digest('SHA-256', combined);
    return new Uint8Array(hashBuffer);
};

export const parseInvoiceStatus = (status: number): string => {
    const statusMap: Record<number, string> = {
        0: 'PENDING',
        1: 'PAID',
        2: 'EXPIRED',
        3: 'CLAIMED',
    };
    return statusMap[status] ?? 'UNKNOWN';
};
