// Scanner — Midnight-specific, stubbed for Midnight migration
import type { PrivateBalances, ScannerSession } from './types';

const BALANCE_CACHE_KEY = 'anonpay:burner-private-balances';

function readCachedBalances(): PrivateBalances {
    if (typeof window === 'undefined') {
        return { TDUST: 0 };
    }

    try {
        const raw = window.localStorage.getItem(BALANCE_CACHE_KEY);
        if (!raw) {
            return { TDUST: 0 };
        }

        const parsed = JSON.parse(raw) as Partial<PrivateBalances>;
        const tdust = Number(parsed.TDUST);
        return { TDUST: Number.isFinite(tdust) && tdust >= 0 ? tdust : 0 };
    } catch {
        return { TDUST: 0 };
    }
}

export async function getScannerSession(_decryptedBurnerKey: string): Promise<ScannerSession> {
    return {
        scannerBase: 'midnight-local-placeholder',
        scannerHeaders: {},
        scannerUuid: 'scanner-unavailable',
        account: null,
    };
}

export async function scanProgramBalance(
    _session: ScannerSession,
    _programFilter: string,
    _recordName: string,
): Promise<number> {
    return 0;
}

export async function fetchAllPrivateBalances(_decryptedBurnerKey: string): Promise<PrivateBalances> {
    return readCachedBalances();
}

export async function findSpendableRecord(
    _session: ScannerSession,
    _programFilter: string,
    _recordName: string,
    _microcreditsRequired: number,
    _isCredits: boolean,
): Promise<string | null> {
    return null;
}
