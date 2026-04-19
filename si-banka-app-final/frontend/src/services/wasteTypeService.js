import apiClient from './apiClient';

/**
 * wasteTypeService — API Calls untuk Jenis Sampah (WasteType)
 * 
 * CRUD operasi jenis sampah dan harga.
 */

export const fetchWasteTypes = async () => {
    try {
        const response = await apiClient.get('/waste-types');
        return response.data.data;
    } catch (error) {
        console.error('Error fetching waste types:', error);
        throw error;
    }
};

export const createWasteType = async (wasteTypeData) => {
    try {
        const response = await apiClient.post('/waste-types', wasteTypeData);
        return response.data.data;
    } catch (error) {
        console.error('Error creating waste type:', error);
        throw error;
    }
};

export const updateWasteType = async (wasteTypeId, wasteTypeData) => {
    try {
        const response = await apiClient.put(`/waste-types/${wasteTypeId}`, wasteTypeData);
        return response.data.data;
    } catch (error) {
        console.error('Error updating waste type:', error);
        throw error;
    }
};

export const deleteWasteType = async (wasteTypeId) => {
    try {
        await apiClient.delete(`/waste-types/${wasteTypeId}`);
        return true;
    } catch (error) {
        console.error('Error deleting waste type:', error);
        throw error;
    }
};
