import apiClient from './apiClient';

/**
 * authService — API Calls untuk Autentikasi
 * 
 * Login, logout, fetch user profile, update profile.
 */

export const auth = {
    login: async (email, password) => {
        try {
            const response = await apiClient.post('/login', { email, password });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    logout: async () => {
        try {
            await apiClient.post('/logout');
        } catch (error) {
            console.error('Logout failed', error);
        } finally {
            localStorage.removeItem('authToken');
        }
    },

    fetchUser: async () => {
        const response = await apiClient.get('/user');
        return response.data;
    },

    updateProfile: async (data) => {
        try {
            const config = data instanceof FormData
                ? { headers: { 'Content-Type': 'multipart/form-data' } }
                : {};
            const response = await apiClient.post('/user/update', data, config);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },
};
