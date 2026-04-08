export type TokenCode = 'TDUST';

export const TOKEN_CODE_TO_TYPE: Record<TokenCode, number> = {
    TDUST: 0,
};

export const TOKEN_TYPE_TO_CODE: Record<number, TokenCode> = {
    0: 'TDUST',
    1: 'TDUST',
    2: 'TDUST',
};

export const TOKEN_LABELS: Record<TokenCode, string> = {
    TDUST: 'tDUST',
};

export const ANY_ALLOWED_TOKENS: TokenCode[] = ['TDUST'];

export const getDefaultAllowedTokens = (tokenType: number): TokenCode[] => {
    void tokenType;
    return ['TDUST'];
};

export const getAllowedTokensForInvoice = (
    tokenType: number,
    invoiceType?: number
): TokenCode[] => {
    void tokenType;
    void invoiceType;
    return ['TDUST'];
};

export const getTokenLabel = (
    tokenType: number,
    invoiceType?: number
): string => {
    void tokenType;
    void invoiceType;
    return 'tDUST';
};

export const getTokenTypeFromCode = (tokenCode: TokenCode): number => TOKEN_CODE_TO_TYPE[tokenCode];

export const getTokenCodeFromType = (tokenType: number): TokenCode => TOKEN_TYPE_TO_CODE[tokenType] || 'TDUST';
