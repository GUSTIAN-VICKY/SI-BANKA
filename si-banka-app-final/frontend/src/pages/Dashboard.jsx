import React, { useState, useEffect } from 'react';

// Services (dari module terpisah via barrel export)
import {
    createCustomer, updateWasteType, createTransaction, updateTransaction,
    deleteCustomer, deleteTransaction, deleteWasteType
} from '../services';

// Hooks
import { useDashboardData } from '../hooks/useDashboardData';
import { useCartManager } from '../hooks/useCartManager';
import {
    getWeeklyTrend, getCustomerTrend,
    getFavoriteWaste, getCustomerTransactionsForChart
} from '../hooks/useTransactionHelpers';

// Icons
import { AlertTriangle, User, Users } from 'lucide-react';

// Layout Components
import { DesktopSidebar } from '../components/layout/DesktopSidebar';
import { MobileBottomNav } from '../components/layout/MobileBottomNav';
import { MainContent } from '../components/dashboard/MainContent';

// Page Views
import { DashboardView } from '../components/pages/DashboardView';
import { NasabahView } from '../components/pages/NasabahView';
import { StokView } from '../components/pages/StokView';
import { RiwayatView } from '../components/pages/RiwayatView';
import { SettingsPage } from '../components/pages/SettingsPage';
import { DetailNasabahPage } from '../components/pages/DetailNasabahPage';
import { UserManagementView } from '../components/pages/UserManagementView';
import { NasabahDashboardView } from '../components/pages/NasabahDashboardView';
import BankSampahManagement from '../components/pages/BankSampahManagement';

// Modals
import { NewTransactionModal } from '../components/modals/NewTransactionModal';
import { AddCustomerModal } from '../components/modals/AddCustomerModal';
import { EditCustomerModal } from '../components/modals/EditCustomerModal';
import { TransactionSuccessModal } from '../components/modals/TransactionSuccessModal';
import { AddCustomerSuccessModal } from '../components/modals/AddCustomerSuccessModal';
import { UpdatePriceModal } from '../components/modals/UpdatePriceModal';

// ──────────────────────────────────────────────────
//  HELPER FUNCTIONS
// ──────────────────────────────────────────────────

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Konversi path foto ke URL yang bisa ditampilkan.
 */
const getPhotoUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('data:')) return path;
    return `/storage/${path}`;
};

// ──────────────────────────────────────────────────
//  DASHBOARD APP
// ──────────────────────────────────────────────────

export function DashboardApp({ user, onLogout }) {
    // ─── Navigation & UI State ────────────────────
    const [activeMenu, setActiveMenu] = useState('dashboard');
    const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1536);
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1536);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);

    // ─── Modal State ──────────────────────────────
    const [showNewTransactionModal, setShowNewTransactionModal] = useState(false);
    const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [itemToUpdateModal, setItemToUpdateModal] = useState(null);
    const [transactionSuccess, setTransactionSuccess] = useState(null);
    const [addCustomerSuccess, setAddCustomerSuccess] = useState(null);

    // ─── Data State ───────────────────────────────
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [selectedCustomerHistory, setSelectedCustomerHistory] = useState(null);
    const [historyTab, setHistoryTab] = useState('transaksi');
    const [geminiLoading, setGeminiLoading] = useState(false);

    // ─── Hooks ────────────────────────────────────
    const {
        customers, setCustomers,
        wasteTypes, setWasteTypes,
        allTransactions, updateLog, transactionLogs, locationStats,
        loading, error, setError, loadData
    } = useDashboardData(activeMenu, selectedCustomerHistory);

    const { cart, setCart, handleAddToCart, handleRemoveFromCart, clearCart } = useCartManager(wasteTypes);

    // ─── Derived State ────────────────────────────
    const isNasabah = user?.role === 'nasabah';
    const isSuperAdminKota = ['super_admin', 'super_admin_kota'].includes(user?.role);
    const isAdminKota = user?.role === 'admin_kota';
    const isSuperAdminRT = user?.role === 'super_admin_rt';
    const isAdminRT = ['admin', 'admin_rt'].includes(user?.role);
    const isSuperAdmin = isSuperAdminKota || isSuperAdminRT;

    const adminProfile = {
        name: user?.name || 'Admin',
        email: user?.email || '',
        photo: getPhotoUrl(user?.photo_path || (isNasabah ? user?.customer?.photo_path : null)),
    };

    // ─── Resize Listener ──────────────────────────
    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            setIsDesktop(width >= 1536);
            if (width >= 1536) {
                if (!isSidebarOpen) setIsSidebarOpen(true);
            } else {
                if (isSidebarOpen) setIsSidebarOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ──────────────────────────────────────────────
    //  EVENT HANDLERS
    // ──────────────────────────────────────────────

    const handleViewCustomerHistory = (customer) => {
        setSelectedCustomerHistory(customer);
        setActiveMenu('detailNasabah');
    };

    const handleAddCustomer = async (newCustomerData) => {
        setGeminiLoading(true);
        try {
            await wait(800);

            const newId = `NSB-${crypto.randomUUID().slice(0, 8)}`;
            const defaults = {
                id: newId,
                balance: 0,
                last_deposit: new Date().toISOString().slice(0, 10),
            };

            let customerPayload;
            if (newCustomerData.photo instanceof File) {
                customerPayload = new FormData();
                customerPayload.append('id', defaults.id);
                customerPayload.append('name', newCustomerData.name);
                customerPayload.append('rt', newCustomerData.rt);
                customerPayload.append('rw', newCustomerData.rw);
                customerPayload.append('balance', defaults.balance);
                customerPayload.append('last_deposit', defaults.last_deposit);
                customerPayload.append('photo', newCustomerData.photo);
                customerPayload.append('password', newCustomerData.password);
            } else {
                customerPayload = { ...newCustomerData, ...defaults };
            }

            const result = await createCustomer(customerPayload);
            setCustomers((prev) => [result.data || result, ...prev]);
            setShowAddCustomerModal(false);
            setAddCustomerSuccess((result.data || result).name);
            return result;
        } catch (err) {
            console.error('Failed to add customer:', err);
            setError('Gagal menambahkan nasabah. Silakan coba lagi.');
            throw err;
        } finally {
            setGeminiLoading(false);
        }
    };

    const handleUpdateItem = async (id, newPriceString, newStockString) => {
        setGeminiLoading(true);
        try {
            await wait(800);
            await updateWasteType(id, { price: parseFloat(newPriceString), stok: parseFloat(newStockString) });
            await loadData();
            setItemToUpdateModal(null);
        } catch (err) {
            console.error('Failed to update waste type:', err);
            setError('Gagal memperbarui harga/stok. Silakan coba lagi.');
        } finally {
            setGeminiLoading(false);
        }
    };

    const handleUpdateTransaction = async (id, transactionData, proofPhoto) => {
        setGeminiLoading(true);
        try {
            let payload = transactionData;
            if (proofPhoto instanceof File) {
                payload = new FormData();
                payload.append('customerId', transactionData.customerId);
                payload.append('total', transactionData.total);
                payload.append('date', transactionData.date);
                payload.append('items', JSON.stringify(transactionData.items));
                payload.append('proof_image', proofPhoto);
            }
            await updateTransaction(id, payload);
            await loadData();
        } catch (err) {
            console.error('Failed to update transaction:', err);
            setError('Gagal memperbarui transaksi.');
        } finally {
            setGeminiLoading(false);
        }
    };

    const handleConfirmTransaction = async (proofPhoto = null) => {
        if (!selectedCustomer || cart.length === 0) {
            setError('Pelanggan belum dipilih atau keranjang belanja kosong.');
            return;
        }

        setGeminiLoading(true);
        try {
            const baseData = {
                customerId: selectedCustomer.id,
                items: cart.map((item) => ({
                    id: item.id,
                    name: item.name,
                    qty: item.weight,
                    price: item.price,
                    total: item.total,
                })),
                total: cart.reduce((sum, item) => sum + item.total, 0),
                date: new Date().toISOString(),
            };

            let transactionPayload;
            if (proofPhoto instanceof File) {
                transactionPayload = new FormData();
                transactionPayload.append('customerId', baseData.customerId);
                transactionPayload.append('total', baseData.total);
                transactionPayload.append('date', baseData.date);
                transactionPayload.append('image', proofPhoto);
                transactionPayload.append('items', JSON.stringify(baseData.items));
            } else {
                transactionPayload = baseData;
            }

            await createTransaction(transactionPayload);
            await loadData();

            setTransactionSuccess({ customerName: selectedCustomer.name, total: baseData.total });
            setShowNewTransactionModal(false);
            setSelectedCustomer(null);
            clearCart();
        } catch (err) {
            console.error('Failed to create transaction:', err);
            setError('Gagal membuat transaksi. Silakan coba lagi.');
        } finally {
            setGeminiLoading(false);
        }
    };

    const handleCustomerUpdated = (updatedCustomer) => {
        setCustomers((prev) => prev.map((c) => (c.id === updatedCustomer.id ? updatedCustomer : c)));
        if (selectedCustomerHistory && selectedCustomerHistory.id === updatedCustomer.id) {
            setSelectedCustomerHistory(updatedCustomer);
        }
    };

    const handleDeleteCustomer = async (customerId) => {
        setGeminiLoading(true);
        try {
            await deleteCustomer(customerId);
            await loadData();
        } catch (err) {
            console.error('Failed to delete customer:', err);
            setError('Gagal menghapus nasabah. Silakan coba lagi.');
        } finally {
            setGeminiLoading(false);
        }
    };

    const handleDeleteTransaction = async (transactionId) => {
        setGeminiLoading(true);
        try {
            await deleteTransaction(transactionId);
            await loadData();
        } catch (err) {
            console.error('Failed to delete transaction:', err);
            setError('Gagal menghapus transaksi. Silakan coba lagi.');
        } finally {
            setGeminiLoading(false);
        }
    };

    const handleDeleteWasteType = async (wasteTypeId) => {
        setGeminiLoading(true);
        try {
            await deleteWasteType(wasteTypeId);
            setWasteTypes((prev) => prev.filter((wt) => wt.id !== wasteTypeId));
        } catch (err) {
            console.error('Failed to delete waste type:', err);
            setError('Gagal menghapus jenis sampah. Silakan coba lagi.');
        } finally {
            setGeminiLoading(false);
        }
    };

    // ──────────────────────────────────────────────
    //  MOBILE PROFILE MENU
    // ──────────────────────────────────────────────

    const renderProfileMenu = () => (
        <div className="fixed top-16 right-4 w-72 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-2 z-[60] animate-fadeIn origin-top-right 2xl:hidden">
            <div className="p-4 border-b border-slate-100 mb-2">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 overflow-hidden">
                        {adminProfile.photo ? (
                            <img src={adminProfile.photo} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400"><User size={20} /></div>
                        )}
                    </div>
                    <div>
                        <p className="font-bold text-slate-800 text-sm">{adminProfile.name}</p>
                        <p className="text-xs text-slate-500 truncate max-w-[150px]">{adminProfile.email}</p>
                    </div>
                </div>
                <div className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-lg text-xs font-bold w-fit">
                    {isSuperAdminKota ? 'Super Admin Kota' :
                        isAdminKota ? 'Admin Kota' :
                            isSuperAdminRT ? 'Super Admin RT' :
                                isAdminRT ? 'Admin RT' : 'Nasabah'}
                </div>
            </div>

            <div className="space-y-1">
                {isSuperAdminKota && !isNasabah && (
                    <button
                        onClick={() => { setActiveMenu('bankSampah'); setShowProfileMenu(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 rounded-xl text-slate-600 font-medium transition-colors text-sm"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21V11l9-6 9 6v10H3Z" /><path d="M9 21V13h6v8" /></svg>
                        Lokasi Bank Sampah
                    </button>
                )}

                {isSuperAdmin && !isNasabah && (
                    <button
                        onClick={() => { setActiveMenu('userManagement'); setShowProfileMenu(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 rounded-xl text-slate-600 font-medium transition-colors text-sm"
                    >
                        <Users size={18} /> Manajemen User
                    </button>
                )}

                <button
                    onClick={() => { setActiveMenu('settings'); setShowProfileMenu(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 rounded-xl text-slate-600 font-medium transition-colors text-sm"
                >
                    <User size={18} /> Pengaturan Akun
                </button>

                <div className="h-px bg-slate-100 my-2"></div>

                <button
                    onClick={() => { onLogout(); setShowProfileMenu(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 rounded-xl text-red-600 font-medium transition-colors text-sm"
                >
                    <AlertTriangle size={18} /> Keluar Aplikasi
                </button>
            </div>
        </div>
    );

    // ──────────────────────────────────────────────
    //  RENDER
    // ──────────────────────────────────────────────

    return (
        <div className="min-h-screen font-sans text-slate-900 transition-colors duration-500">
            <DesktopSidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} onLogout={onLogout} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} user={user} isNasabah={isNasabah} />

            {showProfileMenu && renderProfileMenu()}

            <MainContent
                loading={loading} geminiLoading={geminiLoading} error={error} isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen}
                isDesktop={isDesktop} activeMenu={activeMenu} setActiveMenu={setActiveMenu}
                adminProfile={adminProfile} showProfileMenu={showProfileMenu} setShowProfileMenu={setShowProfileMenu}
                showNotificationDropdown={showNotificationDropdown} setShowNotificationDropdown={setShowNotificationDropdown}
                isNasabah={isNasabah} user={user}
                customers={customers} allTransactions={allTransactions} updateLog={updateLog} transactionLogs={transactionLogs}
                wasteTypes={wasteTypes} locationStats={locationStats} getWeeklyTrend={getWeeklyTrend}
                handleViewCustomerHistory={handleViewCustomerHistory} setShowNewTransactionModal={setShowNewTransactionModal} showNewTransactionModal={showNewTransactionModal}
                setShowAddCustomerModal={setShowAddCustomerModal} setItemToUpdateModal={setItemToUpdateModal} setEditingCustomer={setEditingCustomer}
                handleDeleteCustomer={handleDeleteCustomer} handleDeleteWasteType={handleDeleteWasteType} setHistoryTab={setHistoryTab} historyTab={historyTab}
                handleDeleteTransaction={handleDeleteTransaction} handleUpdateTransaction={handleUpdateTransaction} onLogout={onLogout}
                selectedCustomerHistory={selectedCustomerHistory} getCustomerTrend={getCustomerTrend} getCustomerTransactionsForChart={getCustomerTransactionsForChart}
                getFavoriteWaste={getFavoriteWaste} handleCustomerUpdated={handleCustomerUpdated} loadData={loadData}
            />

            <MobileBottomNav activeMenu={activeMenu} setActiveMenu={setActiveMenu} setShowNewTransactionModal={setShowNewTransactionModal} isNasabah={isNasabah} />

            {showNewTransactionModal && <NewTransactionModal {...{ customers, wasteTypes, cart, setCart, selectedCustomer, setSelectedCustomer, setShowNewTransactionModal, handleConfirmTransaction, handleAddToCart, handleRemoveFromCart, setGeminiLoading, error }} />}
            {showAddCustomerModal && <AddCustomerModal setShowAddCustomerModal={setShowAddCustomerModal} handleAddCustomer={handleAddCustomer} setGeminiLoading={setGeminiLoading} error={error} currentUser={user} />}
            {editingCustomer && <EditCustomerModal customer={editingCustomer} onClose={() => setEditingCustomer(null)} onSuccess={(updatedCustomer) => { setCustomers(prev => prev.map(c => c.id === updatedCustomer.id ? updatedCustomer : c)); setEditingCustomer(null); }} />}
            {transactionSuccess && <TransactionSuccessModal successData={transactionSuccess} onClose={() => setTransactionSuccess(null)} />}
            {addCustomerSuccess && <AddCustomerSuccessModal customerName={addCustomerSuccess} onClose={() => setAddCustomerSuccess(null)} />}
            {itemToUpdateModal && <UpdatePriceModal item={itemToUpdateModal} onClose={() => setItemToUpdateModal(null)} onSave={handleUpdateItem} updateLog={updateLog} setGeminiLoading={setGeminiLoading} error={error} />}
        </div>
    );
}
