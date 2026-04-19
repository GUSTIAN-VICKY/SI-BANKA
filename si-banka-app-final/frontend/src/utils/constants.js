/**
 * constants.js — Konfigurasi & Konstanta Aplikasi
 * 
 * URL backend, storage URL, dan konstanta lainnya.
 */

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
export const STORAGE_URL = import.meta.env.VITE_STORAGE_URL || 'http://localhost:8000/storage';

/**
 * Helper untuk mendapatkan auth headers (Bearer token).
 * Digunakan oleh komponen yang masih menggunakan native fetch.
 */
export const authHeaders = () => {
    const token = localStorage.getItem('authToken');
    return {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    };
};
