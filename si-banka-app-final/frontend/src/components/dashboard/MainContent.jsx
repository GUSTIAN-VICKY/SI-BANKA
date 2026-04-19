import React from 'react';
import { Search, Loader2, AlertTriangle, Bell, User, Plus } from 'lucide-react';
import { showError } from '../../utils/sweetAlert';

// Layout
import { MobileHeader } from '../layout/MobileHeader';

// Page Views
import { DashboardView } from '../pages/DashboardView';
import { NasabahView } from '../pages/NasabahView';
import { StokView } from '../pages/StokView';
import { RiwayatView } from '../pages/RiwayatView';
import { SettingsPage } from '../pages/SettingsPage';
import { DetailNasabahPage } from '../pages/DetailNasabahPage';
import { UserManagementView } from '../pages/UserManagementView';
import { NasabahDashboardView } from '../pages/NasabahDashboardView';
import BankSampahManagement from '../pages/BankSampahManagement';

export const MainContent = ({
    // State/Loading
    loading, geminiLoading, error, isSidebarOpen, setIsSidebarOpen,
    isDesktop, activeMenu, setActiveMenu,

    // User Context
    adminProfile, showProfileMenu, setShowProfileMenu,
    showNotificationDropdown, setShowNotificationDropdown,
    isNasabah, user,

    // Data
    customers, allTransactions, updateLog, transactionLogs,
    wasteTypes, locationStats, getWeeklyTrend,

    // Handlers
    handleViewCustomerHistory, setShowNewTransactionModal,
    setShowAddCustomerModal, setItemToUpdateModal, setEditingCustomer,
    handleDeleteCustomer, handleDeleteWasteType, setHistoryTab, historyTab,
    handleDeleteTransaction, handleUpdateTransaction, onLogout,
    selectedCustomerHistory, getCustomerTrend, getCustomerTransactionsForChart,
    getFavoriteWaste, handleCustomerUpdated, loadData
}) => {
    if (loading || geminiLoading) {
        return (
            <div className="flex items-center justify-center h-screen w-full">
                <Loader2 className="animate-spin text-emerald-500" size={64} />
                <p className="ml-4 text-white text-lg font-bold animate-pulse drop-shadow-md">Memuat Data Aplikasi...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-screen w-full text-red-600">
                <div className="bg-red-50 p-6 rounded-3xl border border-red-100 flex flex-col items-center shadow-xl">
                    <AlertTriangle size={64} className="mb-4 text-red-500" />
                    <p className="text-xl font-bold text-center mb-2">Terjadi Kesalahan</p>
                    <p className="text-center text-red-800 mb-6 max-w-md">{error}</p>
                    <button onClick={() => window.location.reload()} className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-full font-semibold transition-colors shadow-lg shadow-red-500/30">Coba Lagi</button>
                </div>
            </div>
        );
    }

    return (
        <div className={`p-4 2xl:p-8 min-h-screen transition-all duration-300 ${isSidebarOpen ? '2xl:ml-[20rem]' : '2xl:ml-0'} pt-20 2xl:pt-8 relative`}>

            <MobileHeader
                user={adminProfile}
                onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                onNotificationClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
                notificationCount={0}
                onProfileClick={() => setShowProfileMenu(!showProfileMenu)}
            />

            {isDesktop && (
                <header className="hidden 2xl:flex justify-between items-center mb-8 p-5 sticky top-4 z-[70] bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg shadow-slate-200/50 border border-white/60">
                    <div className="flex items-center gap-5">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-3 hover:bg-white/60 bg-white/40 backdrop-blur-sm rounded-xl transition-all text-slate-600 shadow-sm border border-white/50"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                        </button>
                        <div>
                            <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">
                                {activeMenu === 'dashboard' && 'Dashboard Overview'}
                                {activeMenu === 'nasabah' && 'Data Nasabah'}
                                {activeMenu === 'stok' && 'Stok Gudang & Harga'}
                                {activeMenu === 'riwayat' && 'Riwayat Transaksi'}
                                {activeMenu === 'settings' && 'Pengaturan Akun'}
                                {activeMenu === 'userManagement' && 'Manajemen User'}
                                {activeMenu === 'detailNasabah' && 'Detail Nasabah'}
                                {activeMenu === 'bankSampah' && 'Lokasi Bank Sampah'}
                            </h2>
                            <p className="text-slate-500 font-medium text-sm">Selamat datang kembali, {adminProfile.name || 'Admin'}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {activeMenu === 'dashboard' && (
                            <div className="relative group animate-fadeIn">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                                <input
                                    type="text"
                                    placeholder="Cari ID / Nama Nasabah..."
                                    className="pl-11 pr-5 py-2.5 bg-white/80 backdrop-blur-sm border border-slate-200/80 rounded-xl w-64 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-300 shadow-sm transition-all outline-none font-medium text-sm"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            const term = e.target.value.toLowerCase();
                                            const found = customers.find(c => c.id.toLowerCase().includes(term) || c.name.toLowerCase().includes(term));
                                            if (found) {
                                                handleViewCustomerHistory(found);
                                            } else {
                                                showError('Tidak Ditemukan', 'Nasabah tidak ditemukan. Fitur ini hanya untuk mencari nasabah yang sudah terdaftar.');
                                            }
                                        }
                                    }}
                                />
                            </div>
                        )}

                        <div className="relative z-[80]">
                            <button
                                onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
                                className="w-10 h-10 bg-white/80 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-sm border border-slate-200/80 relative cursor-pointer hover:bg-white transition-all active:scale-95"
                            >
                                <Bell size={18} className="text-slate-600" />
                                <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></div>
                            </button>

                            {showNotificationDropdown && (
                                <div className="absolute right-0 top-14 w-80 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-100 p-4 z-[100] animate-fadeIn origin-top-right">
                                    <div className="flex justify-between items-center mb-3">
                                        <h3 className="font-bold text-slate-800">Aktivitas Terbaru</h3>
                                        <button onClick={() => setShowNotificationDropdown(false)} className="text-xs text-blue-500 hover:underline">Tutup</button>
                                    </div>
                                    <div className="max-h-64 overflow-y-auto space-y-2 custom-scrollbar">
                                        {(() => {
                                            const notifs = [
                                                ...allTransactions.map(t => ({
                                                    type: 'trx',
                                                    date: new Date(t.created_at || t.date || 0),
                                                    text: `Transaksi baru Rp ${t.total.toLocaleString()}`,
                                                    subtext: customers.find(c => c.id === t.customerId)?.name || 'Nasabah'
                                                })),
                                                ...updateLog.map(l => ({
                                                    type: 'update',
                                                    date: new Date(l.date),
                                                    text: `Update harga ${l.itemName}`,
                                                    subtext: `${l.oldValue} -> ${l.newValue}`
                                                })),
                                                ...customers.map(c => ({
                                                    type: 'new_user',
                                                    date: new Date(c.created_at || c.updated_at || 0),
                                                    text: `Nasabah baru terdaftar`,
                                                    subtext: c.name
                                                }))
                                            ].sort((a, b) => b.date - a.date).slice(0, 10);

                                            if (notifs.length === 0) return <p className="text-xs text-slate-400 text-center py-4">Belum ada aktivitas.</p>;

                                            return notifs.map((n, idx) => (
                                                <div key={idx} className="flex gap-3 items-start p-2.5 hover:bg-slate-50 rounded-xl transition-colors">
                                                    <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center ${n.type === 'trx' ? 'bg-green-100 text-green-600' : n.type === 'update' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                                                        {n.type === 'trx' ? <Plus size={14} /> : n.type === 'update' ? <AlertTriangle size={14} /> : <User size={14} />}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-xs font-bold text-slate-700 truncate">{n.text}</p>
                                                        <p className="text-[10px] text-slate-500 truncate">{n.subtext}</p>
                                                        <p className="text-[9px] text-slate-400 mt-0.5">{n.date.toLocaleString()}</p>
                                                    </div>
                                                </div>
                                            ));
                                        })()}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div onClick={() => setActiveMenu('settings')} className="flex items-center gap-2.5 bg-white/80 backdrop-blur-sm p-2 pr-4 rounded-xl shadow-sm border border-slate-200/80 cursor-pointer hover:bg-white transition-all active:scale-[0.98]">
                            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600 font-bold border border-emerald-200 overflow-hidden">
                                {adminProfile.photo ? (
                                    <img src={adminProfile.photo} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <User size={16} />
                                )}
                            </div>
                            <span className="text-sm font-semibold text-slate-700 max-w-[100px] truncate">{adminProfile.name}</span>
                        </div>

                        {!isNasabah && (
                            <button onClick={() => setShowNewTransactionModal(true)} className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all active:scale-[0.98] hover:shadow-xl hover:shadow-emerald-500/30">
                                <Plus size={18} /> Transaksi
                            </button>
                        )}
                    </div>
                </header>
            )}

            <div className="pb-24 md:pb-8">
                {activeMenu === 'dashboard' && (
                    isNasabah ? (
                        <NasabahDashboardView
                            customer={user?.customer || customers.find(c => c.id === user?.customer_id)}
                            transactions={allTransactions}
                            onContactAdmin={() => window.open('https://wa.me/628972323228', '_blank')}
                        />
                    ) : (
                        <DashboardView
                            customers={customers}
                            allTransactions={allTransactions}
                            weeklyTrendData={getWeeklyTrend(allTransactions)}
                            onAddCustomer={() => { setActiveMenu('nasabah'); setShowAddCustomerModal(true); }}
                            onUpdatePrice={() => setActiveMenu('stok')}
                            onContactAdmin={() => window.open('https://wa.me/628972323228', '_blank')}
                            isNasabah={isNasabah}
                            locationStats={locationStats}
                        />
                    )
                )}
                {activeMenu === 'nasabah' && <NasabahView customers={customers} allTransactions={allTransactions} wasteTypes={wasteTypes} setShowAddCustomerModal={setShowAddCustomerModal} handleViewCustomerHistory={handleViewCustomerHistory} geminiLoading={geminiLoading} handleDeleteCustomer={handleDeleteCustomer} isNasabah={isNasabah} locationStats={locationStats} currentUser={user} onEditCustomer={(customer) => setEditingCustomer(customer)} />}
                {activeMenu === 'stok' && <StokView wasteTypes={wasteTypes} updateLog={updateLog} setItemToUpdateModal={setItemToUpdateModal} handleDeleteWasteType={handleDeleteWasteType} isNasabah={isNasabah} currentUser={user} />}
                {activeMenu === 'riwayat' && <RiwayatView historyTab={historyTab} setHistoryTab={setHistoryTab} allTransactions={allTransactions} updateLog={updateLog} transactionLogs={transactionLogs} customers={customers} wasteTypes={wasteTypes} handleDeleteTransaction={handleDeleteTransaction} onUpdateTransaction={handleUpdateTransaction} geminiLoading={geminiLoading} error={error} isNasabah={isNasabah} />}
                {activeMenu === 'settings' && <SettingsPage user={user} onLogout={onLogout} />}
                {activeMenu === 'userManagement' && !isNasabah && <UserManagementView />}
                {activeMenu === 'bankSampah' && !isNasabah && <BankSampahManagement currentUser={user} />}
                {activeMenu === 'detailNasabah' && selectedCustomerHistory && <DetailNasabahPage customer={selectedCustomerHistory} onBack={() => setActiveMenu('nasabah')} allTransactions={allTransactions} transactionLogs={transactionLogs} getCustomerTrend={getCustomerTrend} getCustomerTransactionsForChart={getCustomerTransactionsForChart} getFavoriteWaste={getFavoriteWaste} onUpdateCustomer={handleCustomerUpdated} onTransactionUpdate={loadData} />}
            </div>
        </div>
    );
};
