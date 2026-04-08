const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');

export const getApiBaseUrl = (): string => {
    const explicit =
        import.meta.env.VITE_API_URL ||
        import.meta.env.VITE_BACKEND_URL;

    if (explicit) {
        return trimTrailingSlash(explicit);
    }

    if (typeof window === 'undefined') {
        return 'http://localhost:4000/api';
    }

    const { hostname, origin } = window.location;

    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:4000/api';
    }

    return `${trimTrailingSlash(origin)}/api`;
};

export const API_URL = getApiBaseUrl();
