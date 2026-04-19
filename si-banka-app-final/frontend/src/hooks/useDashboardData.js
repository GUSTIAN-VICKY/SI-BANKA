import { useState, useEffect } from 'react';
import {
    fetchCustomers, fetchWasteTypes, fetchTransactions, fetchUpdateLog, fetchTransactionLogs,
    fetchLocationStats
} from '../services';

export const useDashboardData = (activeMenu, selectedCustomerHistory) => {
    const [wasteTypes, setWasteTypes] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [allTransactions, setAllTransactions] = useState([]);
    const [updateLog, setUpdateLog] = useState([]);
    const [transactionLogs, setTransactionLogs] = useState([]);
    const [locationStats, setLocationStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadData = async () => {
        try {
            const [customersData, wasteTypesData, transactionsData, updateLogData, transactionLogsData, locationStatsData] = await Promise.all([
                fetchCustomers(),
                fetchWasteTypes(),
                fetchTransactions(),
                fetchUpdateLog(),
                fetchTransactionLogs(),
                fetchLocationStats().catch(() => null),
            ]);
            setCustomers(customersData);
            setWasteTypes(wasteTypesData);
            setAllTransactions(transactionsData);
            setUpdateLog(updateLogData);
            setTransactionLogs(transactionLogsData);
            if (locationStatsData) setLocationStats(locationStatsData);

            if (activeMenu === 'detailNasabah' && selectedCustomerHistory) {
                const updatedSelected = customersData.find(c => c.id === selectedCustomerHistory.id);
                if (updatedSelected) {
                    return { updatedSelected };
                }
            }
        } catch (err) {
            console.error("Failed to load data:", err);
            setError("Gagal memuat data dari server. Pastikan server backend Laravel berjalan.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return {
        customers, setCustomers,
        wasteTypes, setWasteTypes,
        allTransactions, setAllTransactions,
        updateLog, setUpdateLog,
        transactionLogs, setTransactionLogs,
        locationStats, setLocationStats,
        loading, setLoading,
        error, setError,
        loadData
    };
};
