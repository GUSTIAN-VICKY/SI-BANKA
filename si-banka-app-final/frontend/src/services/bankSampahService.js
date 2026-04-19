import apiClient from './apiClient';

/**
 * bankSampahService — API Calls untuk Bank Sampah
 * 
 * CRUD operasi Bank Sampah dan statistik.
 */

export const fetchBankSampah = async () => {
    try {
        const response = await apiClient.get('/bank-sampah');
        return response.data;
    } catch (error) {
        console.error('Error fetching bank sampah:', error);
        throw error;
    }
};

export const fetchBankSampahStatistics = async () => {
    try {
        const response = await apiClient.get('/bank-sampah/statistics');
        return response.data;
    } catch (error) {
        console.error('Error fetching bank sampah statistics:', error);
        throw error;
    }
};

export const getBankSampah = async (id) => {
    try {
        const response = await apiClient.get(`/bank-sampah/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error getting bank sampah:', error);
        throw error;
    }
};

export const createBankSampah = async (data) => {
    try {
        const response = await apiClient.post('/bank-sampah', data);
        return response.data;
    } catch (error) {
        console.error('Error creating bank sampah:', error);
        throw error.response?.data || error;
    }
};

export const updateBankSampah = async (id, data) => {
    try {
        const response = await apiClient.put(`/bank-sampah/${id}`, data);
        return response.data;
    } catch (error) {
        console.error('Error updating bank sampah:', error);
        throw error.response?.data || error;
    }
};
