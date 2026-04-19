import axios from 'axios';

/**
 * apiClient — Axios Instance Terpusat
 * 
 * Base configuration untuk semua API call ke Laravel backend.
 * Termasuk interceptor untuk otomatis menyertakan auth token.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor: sertakan Bearer token di setiap request
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default apiClient;
