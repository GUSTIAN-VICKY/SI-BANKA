import apiClient from './apiClient';

/**
 * logService — API Calls untuk Log & Statistik
 * 
 * Riwayat perubahan harga, log transaksi, dan statistik lokasi.
 */

// ──────────────────────────────────────────────────
//  Update Log (Riwayat Perubahan Harga)
// ──────────────────────────────────────────────────

export const fetchUpdateLog = async () => {
    try {
        const response = await apiClient.get('/update-log');
        return response.data.data;
    } catch (error) {
        console.error('Error fetching update log:', error);
        throw error;
    }
};

// ──────────────────────────────────────────────────
//  Transaction Log (Riwayat Transaksi)
// ──────────────────────────────────────────────────

export const fetchTransactionLogs = async () => {
    try {
        const response = await apiClient.get('/transaction-logs');
        return response.data.data;
    } catch (error) {
        console.error('Error fetching transaction logs:', error);
        throw error;
    }
};

// ──────────────────────────────────────────────────
//  Location Statistics (Distribusi Lokasi)
// ──────────────────────────────────────────────────

export const fetchLocationStats = async () => {
    try {
        const response = await apiClient.get('/location-stats');
        return response.data;
    } catch (error) {
        console.error('Error fetching location stats:', error);
        throw error;
    }
};
