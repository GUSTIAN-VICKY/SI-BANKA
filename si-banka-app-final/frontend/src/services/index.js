/**
 * services/index.js — Barrel Export
 * 
 * Re-export semua service modules agar import tetap simple.
 * 
 * Usage:
 *   import { auth } from '../services';
 *   import { fetchCustomers, createCustomer } from '../services';
 */

// Auth
export { auth } from './authService';

// User Management
export { fetchUsers, createUser, updateUser, deleteUser } from './userService';

// Customer (Nasabah)
export {
    fetchCustomers, createCustomer, updateCustomer, deleteCustomer,
    checkCustomerAccountStatus, updateCustomerPassword,
    createCustomerAccount, generateAllCustomerAccounts,
    transferCustomer,
} from './customerService';

// Transaction
export { fetchTransactions, createTransaction, updateTransaction, deleteTransaction } from './transactionService';

// Waste Type
export { fetchWasteTypes, createWasteType, updateWasteType, deleteWasteType } from './wasteTypeService';

// Bank Sampah
export { fetchBankSampah, fetchBankSampahStatistics, getBankSampah, createBankSampah, updateBankSampah } from './bankSampahService';

// Logs & Statistics
export { fetchUpdateLog, fetchTransactionLogs, fetchLocationStats } from './logService';
