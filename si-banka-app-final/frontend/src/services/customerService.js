import apiClient from './apiClient';

/**
 * customerService — API Calls untuk Nasabah (Customer)
 * 
 * CRUD nasabah, manajemen akun nasabah, transfer antar Bank Sampah.
 */

// ──────────────────────────────────────────────────
//  CRUD Nasabah
// ──────────────────────────────────────────────────

export const fetchCustomers = async () => {
    try {
        const response = await apiClient.get('/customers');
        return response.data.data;
    } catch (error) {
        console.error('Error fetching customers:', error);
        throw error;
    }
};

export const createCustomer = async (customerData) => {
    try {
        const config = customerData instanceof FormData
            ? { headers: { 'Content-Type': 'multipart/form-data' } }
            : {};
        const response = await apiClient.post('/customers', customerData, config);
        return response.data.data;
    } catch (error) {
        console.error('Error creating customer:', error);
        throw error;
    }
};

export const updateCustomer = async (id, data) => {
    try {
        const config = data instanceof FormData
            ? { headers: { 'Content-Type': 'multipart/form-data' } }
            : {};
        const response = await apiClient.post(`/customers/${id}/update`, data, config);
        return response.data.data;
    } catch (error) {
        console.error('Error updating customer:', error);
        throw error;
    }
};

export const deleteCustomer = async (customerId) => {
    try {
        await apiClient.delete(`/customers/${customerId}`);
        return true;
    } catch (error) {
        console.error('Error deleting customer:', error);
        throw error;
    }
};

// ──────────────────────────────────────────────────
//  Akun Nasabah
// ──────────────────────────────────────────────────

export const checkCustomerAccountStatus = async (customerId) => {
    try {
        const response = await apiClient.get(`/customers/${customerId}/account-status`);
        return response.data;
    } catch (error) {
        console.error('Error checking customer account status:', error);
        throw error.response?.data || error;
    }
};

export const updateCustomerPassword = async (customerId, newPassword) => {
    try {
        const response = await apiClient.put(`/customers/${customerId}/password`, { password: newPassword });
        return response.data;
    } catch (error) {
        console.error('Error updating customer password:', error);
        throw error.response?.data || error;
    }
};

export const createCustomerAccount = async (customerId, password) => {
    try {
        const response = await apiClient.post(`/customers/${customerId}/create-account`, { password });
        return response.data;
    } catch (error) {
        console.error('Error creating customer account:', error);
        throw error.response?.data || error;
    }
};

export const generateAllCustomerAccounts = async (password = '123456') => {
    try {
        const response = await apiClient.post('/customers/generate-all-accounts', { password });
        return response.data;
    } catch (error) {
        console.error('Error generating all accounts:', error);
        throw error.response?.data || error;
    }
};

// ──────────────────────────────────────────────────
//  Transfer Nasabah
// ──────────────────────────────────────────────────

export const transferCustomer = async (customerId, targetBankSampahId) => {
    try {
        const response = await apiClient.post(`/customers/${customerId}/transfer`, {
            bank_sampah_id: targetBankSampahId,
        });
        return response.data;
    } catch (error) {
        console.error('Error transferring customer:', error);
        throw error.response?.data || error;
    }
};
