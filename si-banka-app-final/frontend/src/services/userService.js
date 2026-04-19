import apiClient from './apiClient';

/**
 * userService — API Calls untuk User Management
 * 
 * CRUD operasi user (admin, nasabah, dll).
 */

export const fetchUsers = async () => {
    const response = await apiClient.get('/users');
    return response.data;
};

export const createUser = async (data) => {
    try {
        const config = data instanceof FormData
            ? { headers: { 'Content-Type': 'multipart/form-data' } }
            : {};
        const response = await apiClient.post('/users', data, config);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const updateUser = async (id, data) => {
    try {
        const config = data instanceof FormData
            ? { headers: { 'Content-Type': 'multipart/form-data' } }
            : {};

        if (data instanceof FormData) {
            data.append('_method', 'PUT');
            const response = await apiClient.post(`/users/${id}`, data, config);
            return response.data;
        } else {
            const response = await apiClient.put(`/users/${id}`, data);
            return response.data;
        }
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const deleteUser = async (id) => {
    try {
        await apiClient.delete(`/users/${id}`);
    } catch (error) {
        throw error.response?.data || error.message;
    }
};
