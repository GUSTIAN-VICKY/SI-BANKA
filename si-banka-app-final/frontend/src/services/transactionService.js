import apiClient from './apiClient';

/**
 * transactionService — API Calls untuk Transaksi
 * 
 * CRUD operasi transaksi setoran sampah.
 */

export const fetchTransactions = async () => {
    try {
        const response = await apiClient.get('/transactions');
        return response.data.data;
    } catch (error) {
        console.error('Error fetching transactions:', error);
        throw error;
    }
};

export const createTransaction = async (transactionData) => {
    try {
        const config = transactionData instanceof FormData
            ? { headers: { 'Content-Type': 'multipart/form-data' } }
            : {};
        const response = await apiClient.post('/transactions', transactionData, config);
        return response.data.data;
    } catch (error) {
        console.error('Error creating transaction:', error);
        throw error;
    }
};

export const updateTransaction = async (id, transactionData) => {
    try {
        const config = transactionData instanceof FormData
            ? { headers: { 'Content-Type': 'multipart/form-data' } }
            : {};
        const response = await apiClient.post(`/transactions/${id}/update`, transactionData, config);
        return response.data.data;
    } catch (error) {
        console.error('Error updating transaction:', error);
        throw error;
    }
};

export const deleteTransaction = async (transactionId) => {
    try {
        await apiClient.delete(`/transactions/${transactionId}`);
        return true;
    } catch (error) {
        console.error('Error deleting transaction:', error);
        throw error;
    }
};
