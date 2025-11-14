
// Since Firebase is shelved, we'll create a placeholder for getAuthToken.
// This allows the API service to function without crashing, though requests
// will not be authenticated. This is acceptable for frontend testing.
async function getAuthToken(): Promise<string | null> {
    // Return null as we are not using Firebase auth for now.
    return null;
}

// FIX: Property 'env' does not exist on type 'ImportMeta'. Using process.env instead.
const API_BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:8080';

async function request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const token = await getAuthToken();
    const headers = new Headers(options.headers || {});
    
    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    if (options.body) {
        headers.set('Content-Type', 'application/json');
    }

    const config: RequestInit = {
        ...options,
        headers,
    };

    // The component's try/catch block will now handle network errors (e.g., "Failed to fetch")
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Request failed with status ' + response.status }));
        throw new Error(errorData.error || 'An unknown API error occurred');
    }
    
     // Handle cases where the response might be empty
    const text = await response.text();
    return text ? JSON.parse(text) : {};
}

export const api = {
    get: (endpoint: string) => request(endpoint),
    post: (endpoint: string, body: any) => request(endpoint, { method: 'POST', body: JSON.stringify(body) }),
    put: (endpoint: string, body: any) => request(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (endpoint: string) => request(endpoint, { method: 'DELETE' }),
};

// Example Usage:
// import { api } from './services/api';
// const settings = await api.get('/api/settings');
// await api.put('/api/settings', { newReasons: ['...'] });