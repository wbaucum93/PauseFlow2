import { getFirebaseAuth } from './firebaseClient';

async function getAuthToken(): Promise<string | null> {
    const auth = getFirebaseAuth();
    const currentUser = auth.currentUser;

    if (!currentUser) {
        return null;
    }

    try {
        return await currentUser.getIdToken();
    } catch (error) {
        console.error('Failed to retrieve auth token', error);
        return null;
    }
}

const metaEnv = (typeof import.meta !== 'undefined'
    ? (import.meta as unknown as { env?: Record<string, string | undefined> })
    : undefined);

const API_BASE_URL = metaEnv?.env?.VITE_API_BASE_URL
    || (typeof process !== 'undefined' ? process.env?.VITE_API_BASE_URL : undefined)
    || 'http://localhost:8080';

async function request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const token = await getAuthToken();
    const headers = new Headers(options.headers || {});

    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    if (options.body && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
    }

    const config: RequestInit = {
        ...options,
        headers,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Request failed with status ' + response.status }));
        throw new Error(errorData.error || 'An unknown API error occurred');
    }

    const text = await response.text();
    return text ? JSON.parse(text) : {};
}

export const api = {
    get: (endpoint: string) => request(endpoint),
    post: (endpoint: string, body: any) => request(endpoint, { method: 'POST', body: JSON.stringify(body) }),
    put: (endpoint: string, body: any) => request(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (endpoint: string) => request(endpoint, { method: 'DELETE' }),
};
