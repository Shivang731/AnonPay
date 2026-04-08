export interface PrivateBalances {
    TDUST: number;
}

export type SweepCurrency = 'TDUST';

export interface BurnerWalletSettingsProps {
    itemVariants: any;
    transactions: any[];
}

export interface ScannerSession {
    scannerBase: string;
    scannerHeaders: Record<string, string>;
    scannerUuid: string;
    account: any;
}
