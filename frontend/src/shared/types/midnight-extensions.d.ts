import '@midnight-ntwrk/dapp-connector-api';

declare module '@midnight-ntwrk/dapp-connector-api' {
    interface ConnectedAPI {
        executeTransaction?(options: any): Promise<{ transactionId?: string }>;
        transactionStatus?(txId: string): Promise<{ status?: string; transactionId?: string }>;
        requestRecords?(programId: string, decrypt?: boolean): Promise<any[]>;
        decrypt?(ciphertext: string): Promise<string | null>;
        adapter?: any;
        wallet?: any;
    }
}
