import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Activity, TrendingUp, Package, DollarSign, List, Camera, Image as ImageIcon, Loader2, Trash2, Edit, Save, User, MapPin, Lock, Key, CheckCircle, Wallet, Sparkles } from 'lucide-react';
import { TrendChart } from '../dashboard/TrendChart';
import { TransactionStackedChart } from '../dashboard/TransactionStackedChart';
import { formatCurrency } from '../../utils/formatters';
import { compressImage } from '../../utils/imageUtils';
import { updateCustomer, deleteTransaction, updateTransaction, fetchWasteTypes, updateCustomerPassword, createCustomerAccount, checkCustomerAccountStatus } from '../../services';
import { CameraCaptureModal } from '../modals/CameraCaptureModal';
import { EditTransactionModal } from '../modals/EditTransactionModal';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { showConfirm, showSuccess, showError } from '../../utils/sweetAlert';

export function DetailNasabahPage({ customer, onBack, allTransactions, transactionLogs, getCustomerTransactionsForChart, getFavoriteWaste, onUpdateCustomer, onTransactionUpdate }) {
  // [LOGIKA DATA NASABAH]
  // 1. Ambil transaksi HANYA milik nasabah ini (filter by id)
  // 2. Urutkan berdasarkan tanggal terbaru (sort date desc)
  const customerTransactions = allTransactions.filter(trx => trx.customerId === customer.id).sort((a, b) => new Date(b.date) - new Date(a.date));

  // Hitung total saldo saat ini (dari data nasabah langsung)
  const totalSetoran = customer.balance;

  // Hitung rata-rata nilai setoran per transaksi
  const avgSetoran = customerTransactions.length > 0 ? totalSetoran / customerTransactions.length : 0;

  // Cari jenis sampah yang paling sering disetor
  const favoriteWaste = getFavoriteWaste(customer.id, allTransactions);

  // Get granular chart data
  const chartData = getCustomerTransactionsForChart ? getCustomerTransactionsForChart(customer.id, allTransactions) : [];

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'settings'


  const [isUpdating, setIsUpdating] = useState(false);
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const fileInputRef = useRef(null);

  // Profile Edit State
  const [editFormData, setEditFormData] = useState({
    name: customer.name || '',
    rt: customer.rt || '',
    rw: customer.rw || ''
  });

  // Update form data when customer prop changes
  useEffect(() => {
    setEditFormData({
      name: customer.name || '',
      rt: customer.rt || '',
      rw: customer.rw || ''
    });
  }, [customer]);

  // Transaction Edit Stats
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [wasteTypes, setWasteTypes] = useState([]);

  // Password Change State
  const [newPassword, setNewPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(null);
  const [hasAccount, setHasAccount] = useState(null); // null = checking, true = has account, false = no account
  const [accountUsername, setAccountUsername] = useState(null);

  // Cek apakah nasabah sudah punya akun login
  useEffect(() => {
    const checkAccount = async () => {
      try {
        const result = await checkCustomerAccountStatus(customer.id);
        setHasAccount(result.hasAccount);
        setAccountUsername(result.username);
      } catch (err) {
        console.error('Failed to check account status:', err);
        setHasAccount(null);
      }
    };
    checkAccount();
  }, [customer.id]);

  const updatePhoto = async (file) => {
    if (!file) return;

    // Compress first
    let fileToUpload = file;
    try {
      fileToUpload = await compressImage(file, 800, 0.7);
    } catch (err) {
      console.error("Compression failed, using original", err);
    }

    if (fileToUpload.size > 10 * 1024 * 1024) { // 10MB limit
      await showError('File Terlalu Besar', 'Ukuran foto maksimal 10MB');
      return;
    }

    setIsUpdating(true);
    setShowPhotoOptions(false);

    try {
      const formData = new FormData();
      formData.append('photo', fileToUpload, file.name);

      // Add minimum delay for UX
      await new Promise(resolve => setTimeout(resolve, 800));

      const updatedData = await updateCustomer(customer.id, formData);
      if (onUpdateCustomer) {
        onUpdateCustomer(updatedData);
      }
      await showSuccess('Berhasil!', "Foto profil berhasil diperbarui!");
     
    } catch (error) {
      console.error("Failed to update photo:", error);
      await showError('Gagal', "Gagal mengupdate foto profil.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const formData = new FormData();
      formData.append('name', editFormData.name);
      formData.append('rt', editFormData.rt);
      formData.append('rw', editFormData.rw);

      // Add minimum delay for UX
      await new Promise(resolve => setTimeout(resolve, 800));

      const updatedData = await updateCustomer(customer.id, formData);
      if (onUpdateCustomer) {
        onUpdateCustomer(updatedData);
      }
      await showSuccess('Berhasil!', "Profil berhasil diperbarui!");
     
    } catch (error) {
      console.error("Failed to update profile:", error);
      await showError('Gagal', "Gagal memperbarui profil.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleFileChange = (e) => {
    updatePhoto(e.target.files[0]);
  };

  const handleDeleteTransaction = async (trxId) => {
    const isConfirmed = await showConfirm({
      title: 'Hapus Transaksi?',
      text: 'Stok dan saldo akan dikembalikan secara otomatis.',
      confirmText: 'Ya, Hapus'
    });

    if (!isConfirmed) return;

    try {
      await deleteTransaction(trxId);
      await showSuccess('Terhapus!', 'Transaksi berhasil dihapus.');
      if (onTransactionUpdate) onTransactionUpdate(); // Trigger refresh
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      await showError('Gagal', "Gagal menghapus transaksi.");
    }
  };

  const handleEditClick = async (trx) => {
    if (wasteTypes.length === 0) {
      try {
        const types = await fetchWasteTypes();
        setWasteTypes(types);
      // eslint-disable-next-line no-unused-vars
      } catch (e) {
        console.error("Failed to load waste types");
        return;
      }
    }
    setEditingTransaction(trx);
  };

  // Transaction History Logs State
  const [selectedTransactionForLogs, setSelectedTransactionForLogs] = useState(null);
  const [showLogModal, setShowLogModal] = useState(false);

  // Filter logs for specific transaction
  // eslint-disable-next-line no-unused-vars
  const _getTransactionHistoryLogs = (_trxId) => {
    // transactionLogs prop passed from Dashboard
    // We filter logs where transaction_id matches or details contain the ID
    const _logs = (onBack ? (onBack.prototype?.constructor?.name === "DetailNasabahPage" ? [] : []) : []); // Dummy check
    // Actually we need to access transactionLogs from props. 
    // It is passed as prop 'transactionLogs' in line 10.

    // Safety check if prop exists
    const _allLogs = onTransactionUpdate && onUpdateCustomer ? (arguments[0].transactionLogs || []) : [];

    // Wait, arguments[0] is props. Let's access 'transactionLogs' directly from destructured props in line 10.
    // I need to add transactionLogs to destructuring in Line 10 first.
    return [];
  };

  // Actually, I will replace the component definition to include transactionLogs prop and the full implementation.

  return (
    <div className="animate-fadeIn space-y-6 md:space-y-8">
      {/* Log Modal */}
      {showLogModal && selectedTransactionForLogs && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-scaleIn">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Activity size={20} className="text-blue-500" /> Riwayat Perubahan
              </h3>
              <button
                onClick={() => { setShowLogModal(false); setSelectedTransactionForLogs(null); }}
                className="p-2 hover:bg-slate-200 rounded-full transition-colors"
              >
                <ArrowLeft size={18} />
              </button>
            </div>
            <div className="p-6 max-h-[60vh] overflow-y-auto space-y-6">
              {/* Filter logic inside render to access props */}
              {(() => {
                const targetId = String(selectedTransactionForLogs.id).toLowerCase();
                const relevantLogs = (transactionLogs || []).filter(log => {
                  if (!log.transaction_id) return false;
                  // Robust comparison
                  if (String(log.transaction_id).toLowerCase() === targetId) return true;

                  // Fallback check in details
                  try {
                    const details = typeof log.details === 'string' ? JSON.parse(log.details) : log.details;
                    if (details?.transaction?.id && String(details.transaction.id).toLowerCase() === targetId) return true;
                    if (details?.transaction_id && String(details.transaction_id).toLowerCase() === targetId) return true;
                  // eslint-disable-next-line no-unused-vars
                  } catch (e) { /* ignored */ }
                  return false;
                }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

                if (relevantLogs.length === 0) {
                  return (
                    <div className="text-center py-8">
                      <p className="text-gray-400">Belum ada riwayat perubahan.</p>
                      <p className="text-[10px] text-gray-300 mt-2">ID: {selectedTransactionForLogs.id}</p>
                    </div>
                  );
                }

                return relevantLogs.map((log, index) => (
                  <div key={index} className="relative pl-6 pb-6 border-l-2 border-slate-200 last:pb-0 last:border-l-0">
                    <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-white ${log.action === 'CREATE' ? 'bg-green-500' : log.action === 'UPDATE' ? 'bg-orange-500' : 'bg-red-500'
                      }`}></div>
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-sm">
                      <p className="font-bold text-slate-700">
                        {log.action === 'CREATE' ? 'Transaksi Dibuat' : log.action === 'UPDATE' ? 'Diperbarui' : 'Dihapus'}
                      </p>
                      <p className="text-xs text-slate-500 mb-2">{new Date(log.created_at).toLocaleString('id-ID')} • oleh {log.user?.name || 'System'}</p>

                      {log.action === 'CREATE' && (() => {
                        try {
                          const details = typeof log.details === 'string' ? JSON.parse(log.details) : log.details;
                          const items = details.items;
                          const total = details.transaction?.total;

                          if (items && Array.isArray(items)) {
                            return (
                              <div className="bg-white p-3 rounded border border-slate-100 mt-2">
                                <p className="text-xs font-bold text-slate-700 mb-2 border-b border-slate-100 pb-1">Input Awal:</p>
                                <ul className="space-y-1">
                                  {items.map((item, idx) => (
                                    <li key={idx} className="flex justify-between text-xs text-slate-600">
                                      <span>{item.name} ({item.qty}kg)</span>
                                      <span>{formatCurrency(item.total)}</span>
                                    </li>
                                  ))}
                                </ul>
                                <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-100 font-bold text-xs text-slate-800">
                                  <span>Total</span>
                                  <span className="text-emerald-600">{formatCurrency(total)}</span>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        // eslint-disable-next-line no-unused-vars
                        } catch (e) { return null; }
                      })()}

                      {log.action === 'UPDATE' && (() => {
                        try {
                          const details = typeof log.details === 'string' ? JSON.parse(log.details) : log.details;
                          const oldItems = details.old_data?.items;
                          const newItems = details.new_data?.items;
                          const oldDate = details.old_data?.created_at || details.old_data?.date;
                          const newDate = details.new_data?.updated_at || log.created_at;

                          return (
                            <div className="space-y-2 mt-2">
                              {/* Difference in Total */}
                              {details.old_data?.total !== details.new_data?.total && (
                                <div className="flex items-center gap-2 bg-white p-2 rounded border border-slate-100">
                                  <span className="line-through text-slate-400">{formatCurrency(details.old_data.total)}</span>
                                  <span className="text-xs">→</span>
                                  <span className="font-bold text-emerald-600">{formatCurrency(details.new_data.total)}</span>
                                </div>
                              )}

                              {/* Show Previous Items State if available */}
                              {oldItems && Array.isArray(oldItems) && (
                                <div className="bg-orange-50/50 p-2 rounded border border-orange-100">
                                  <p className="text-[10px] font-bold text-orange-600 mb-1">
                                    Data Sebelum Edit {oldDate ? `(${new Date(oldDate).toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit' })})` : ''}:
                                  </p>
                                  <ul className="space-y-1">
                                    {oldItems.map((item, idx) => (
                                      <li key={idx} className="flex justify-between text-[10px] text-slate-500">
                                        <span>{item.name} ({item.qty}kg)</span>
                                        <span>{formatCurrency(item.total)}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {/* Show New Items State */}
                              {newItems && Array.isArray(newItems) && (
                                <div className="bg-emerald-50/50 p-2 rounded border border-emerald-100">
                                  <p className="text-[10px] font-bold text-emerald-600 mb-1">
                                    Data Sesudah Edit {newDate ? `(${new Date(newDate).toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit' })})` : ''}:
                                  </p>
                                  <ul className="space-y-1">
                                    {newItems.map((item, idx) => (
                                      <li key={idx} className="flex justify-between text-[10px] text-slate-600">
                                        <span>{item.name} ({item.qty}kg)</span>
                                        <span>{formatCurrency(item.total)}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          );
                        // eslint-disable-next-line no-unused-vars
                        } catch (e) { return null; }
                      })()}
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>
      )}

      {showCameraModal && (
        <CameraCaptureModal
          onClose={() => setShowCameraModal(false)}
          onCapture={(file) => {
            updatePhoto(file);
            setShowCameraModal(false);
          }}
        />
      )}

      {editingTransaction && (
        <EditTransactionModal
          transaction={editingTransaction}
          wasteTypes={wasteTypes}
          customers={[customer]} // Pass current customer as array
          onClose={() => setEditingTransaction(null)}
          onSave={async (id, data, photo) => { // Rename onUpdate to onSave and accept photo
            let payload = data;
            if (photo instanceof File) {
              payload = new FormData();
              payload.append('customerId', customer.id);
              payload.append('total', data.total);
              payload.append('date', data.date);
              payload.append('items', JSON.stringify(data.items));
              payload.append('proof_image', photo);
            }

            await updateTransaction(id, payload);
            if (onTransactionUpdate) onTransactionUpdate();
            setEditingTransaction(null);
          }}
        />
      )}

      {/* Profile Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-white to-emerald-50/50 rounded-3xl shadow-lg border border-emerald-100/50 overflow-hidden"
      >
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05, x: -3 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
              className="w-10 h-10 bg-white/20 backdrop-blur hover:bg-white/30 rounded-xl flex items-center justify-center transition-colors"
            >
              <ArrowLeft size={20} className="text-white" />
            </motion.button>
            <div>
              <p className="text-white/70 text-xs font-medium">Detail Nasabah</p>
              <p className="text-white font-bold">{customer.id}</p>
            </div>
          </div>
          {/* Tab Switcher */}
          <div className="bg-white/10 backdrop-blur-md p-1 rounded-xl flex gap-1 border border-white/20">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${activeTab === 'overview' ? 'bg-white text-emerald-600 shadow-md' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}
            >
              Ringkasan
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${activeTab === 'settings' ? 'bg-white text-emerald-600 shadow-md' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}
            >
              Pengaturan
            </button>
          </div>
        </div>
        <div className="p-6 flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-0.5 shadow-lg cursor-pointer"
                onClick={() => setShowPhotoOptions(!showPhotoOptions)}
              >
                <div className="w-full h-full rounded-[14px] bg-white overflow-hidden relative">
                  {isUpdating ? (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
                      <Loader2 className="animate-spin text-white" size={24} />
                    </div>
                  ) : (
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center z-10">
                      <Camera className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={24} />
                    </div>
                  )}
                  {customer.photo_path ? (
                    <img
                      src={`/storage/${customer.photo_path}?t=${new Date().getTime()}`}
                      alt={customer.name}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.onerror = null; e.target.src = 'https://ui-avatars.com/api/?name=' + customer.name; }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-100 to-teal-100 text-emerald-600 font-bold text-xl">
                      {customer.name.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>
              </motion.div>

              {showPhotoOptions && !isUpdating && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 p-2 z-50 flex flex-col gap-1 min-w-[150px]"
                >
                  <button
                    onClick={() => { setShowCameraModal(true); setShowPhotoOptions(false); }}
                    className="flex items-center gap-2 px-3 py-2.5 hover:bg-emerald-50 rounded-lg text-sm text-slate-700 font-medium transition-colors"
                  >
                    <Camera size={16} className="text-emerald-600" /> Ambil Foto
                  </button>
                  <button
                    onClick={() => { fileInputRef.current.click(); setShowPhotoOptions(false); }}
                    className="flex items-center gap-2 px-3 py-2.5 hover:bg-blue-50 rounded-lg text-sm text-slate-700 font-medium transition-colors"
                  >
                    <ImageIcon size={16} className="text-blue-600" /> Pilih Galeri
                  </button>
                </motion.div>
              )}

              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" hidden />
            </div>

            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-800">{customer.name}</h2>
              <div className="flex flex-col gap-1 mt-1">
                <p className="text-slate-500 flex items-center gap-1">
                  <MapPin size={14} className="text-emerald-500" />
                  RT {customer.rt}/RW {customer.rw}
                </p>
                {(customer.bankSampah?.name || customer.bank_sampah?.name) && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-lg font-medium">
                      {customer.bankSampah?.name || customer.bank_sampah?.name}
                    </span>
                    {(customer.bankSampah?.alamat || customer.bank_sampah?.alamat) && (
                      <span className="text-slate-400 text-xs truncate max-w-[200px]" title={customer.bankSampah?.alamat || customer.bank_sampah?.alamat}>
                        {customer.bankSampah?.alamat || customer.bank_sampah?.alamat}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="text-left md:text-right bg-gradient-to-r from-emerald-500 to-teal-600 p-4 rounded-2xl shadow-lg">
            <p className="text-sm font-medium text-white/70">Total Saldo Saat Ini</p>
            <p className="text-3xl md:text-4xl font-black text-white">{formatCurrency(customer.balance)}</p>
          </div>
        </div>
      </motion.div>

      {/* Conditional Rendering based on activeTab */}
      {activeTab === 'overview' ? (
        <>
          {/* Stats Cards with Gradients */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              whileHover={{ scale: 1.02, y: -4 }}
              className="bg-gradient-to-br from-blue-500 to-indigo-600 p-5 rounded-2xl shadow-lg shadow-blue-500/25 cursor-pointer"
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-white/90 text-sm">Total Transaksi</h4>
                <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                  <Activity size={20} className="text-white" />
                </div>
              </div>
              <p className="text-4xl font-black text-white">{customerTransactions.length}</p>
              <p className="text-white/70 text-sm mt-1">kali transaksi</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.02, y: -4 }}
              className="bg-gradient-to-br from-emerald-500 to-teal-600 p-5 rounded-2xl shadow-lg shadow-emerald-500/25 cursor-pointer"
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-white/90 text-sm">Rata-rata Setoran</h4>
                <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                  <TrendingUp size={20} className="text-white" />
                </div>
              </div>
              <p className="text-3xl font-black text-white">{formatCurrency(avgSetoran)}</p>
              <p className="text-white/70 text-sm mt-1">per transaksi</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.02, y: -4 }}
              className="bg-gradient-to-br from-orange-500 to-red-500 p-5 rounded-2xl shadow-lg shadow-orange-500/25 cursor-pointer"
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-white/90 text-sm">Sampah Favorit</h4>
                <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                  <Package size={20} className="text-white" />
                </div>
              </div>
              <p className="text-3xl font-black text-white">{favoriteWaste}</p>
              <p className="text-white/70 text-sm mt-1">paling sering</p>
            </motion.div>
          </div>

          {/* Chart Section with Gradient */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-white to-blue-50/50 rounded-3xl shadow-lg border border-blue-100/50 overflow-hidden"
          >
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                  <DollarSign size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-white font-bold">Grafik Setoran {customer.name}</p>
                  <p className="text-white/70 text-xs">Per Transaksi</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <TransactionStackedChart
                data={chartData}
                title={null}
                hideHeader={true}
              />
            </div>
          </motion.div>

          {/* Transaction History with Gradient */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-br from-white to-purple-50/50 rounded-3xl shadow-lg border border-purple-100/50 overflow-hidden"
          >
            <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                <List size={20} className="text-white" />
              </div>
              <div>
                <p className="text-white font-bold">Riwayat Transaksi</p>
                <p className="text-white/70 text-xs">{customerTransactions.length} transaksi</p>
              </div>
            </div>
            <div className="divide-y divide-slate-100">
              {customerTransactions.length > 0 ? (customerTransactions.map((trx, index) => (
                <motion.div
                  key={trx.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="p-4 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-purple-50/50 transition-colors duration-200 group"
                >
                  <div className="flex items-start gap-4 flex-1">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="w-14 h-14 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-xl overflow-hidden flex-shrink-0 border-2 border-purple-200 group-hover:border-purple-300 transition-colors cursor-pointer shadow-sm"
                    >
                      {trx.proof_image ? (
                        <img
                          src={`/storage/${trx.proof_image}`}
                          alt="Bukti"
                          className="w-full h-full object-cover"
                          onClick={() => window.open(`/storage/${trx.proof_image}`, '_blank')}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-purple-300">
                          <ImageIcon size={20} />
                        </div>
                      )}
                    </motion.div>
                    <div>
                      <p className="font-bold text-slate-800 group-hover:text-purple-800 transition-colors">
                        {new Date(trx.date).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace('.', ':')}
                      </p>
                      <p className="text-sm text-slate-500 mt-1">
                        {typeof trx.items === 'string' ? JSON.parse(trx.items).map(i => `${i.name} (${i.qty}kg)`).join(', ') : trx.items.map(i => `${i.name} (${i.qty}kg)`).join(', ')}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-row md:flex-col items-end gap-2 md:gap-1 w-full md:w-auto justify-between md:justify-center">
                    <div className="text-right">
                      <p className="font-bold text-xl text-emerald-600">+ {formatCurrency(trx.total)}</p>
                      <p className="text-xs text-slate-400 font-mono">{trx.id}</p>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => { setSelectedTransactionForLogs(trx); setShowLogModal(true); }}
                        className="p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors"
                        title="Riwayat"
                      >
                        <Activity size={16} />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleEditClick(trx)}
                        className="p-2.5 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-200 transition-colors"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDeleteTransaction(trx.id)}
                        className="p-2.5 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-colors"
                        title="Hapus"
                      >
                        <Trash2 size={16} />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))) : (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <List size={32} className="text-purple-400" />
                  </div>
                  <p className="text-slate-500">Belum ada riwayat transaksi</p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      ) : (
        <div className="space-y-6 animate-fadeIn">
          {/* Edit Profile Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-white to-emerald-50/50 rounded-3xl shadow-lg border border-emerald-100/50 overflow-hidden"
          >
            {/* Gradient Header */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                  <User size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Edit Profil Nasabah</h3>
                  <p className="text-white/70 text-sm">Ubah nama dan lokasi nasabah</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleUpdateProfile} className="p-6 space-y-5">
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                  <User size={14} className="text-slate-400" /> Nama Lengkap
                </label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full p-3.5 bg-white border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none font-medium shadow-sm"
                  placeholder="Nama Nasabah"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                    <MapPin size={14} className="text-slate-400" /> RT
                  </label>
                  <input
                    type="text"
                    value={editFormData.rt}
                    onChange={(e) => setEditFormData({ ...editFormData, rt: e.target.value })}
                    className="w-full p-3.5 bg-white border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none font-medium shadow-sm"
                    placeholder="00"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                    <MapPin size={14} className="text-slate-400" /> RW
                  </label>
                  <input
                    type="text"
                    value={editFormData.rw}
                    onChange={(e) => setEditFormData({ ...editFormData, rw: e.target.value })}
                    className="w-full p-3.5 bg-white border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none font-medium shadow-sm"
                    placeholder="00"
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isUpdating}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-8 py-3.5 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all disabled:opacity-60"
              >
                {isUpdating ? <Loader2 className="animate-spin" /> : <Save size={18} />}
                Simpan Perubahan
              </motion.button>
            </form>
          </motion.div>

          {/* Password Change Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-white to-amber-50/50 rounded-3xl shadow-lg border border-amber-100/50 overflow-hidden"
          >
            {/* Gradient Header */}
            <div className="bg-gradient-to-r from-amber-400 to-orange-500 p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                  <Key size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Akun Login Nasabah</h3>
                  <p className="text-white/70 text-sm">Kelola password akun nasabah</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Account Status Badge */}
              {hasAccount === null ? (
                <div className="p-4 bg-slate-100 text-slate-600 rounded-xl text-sm font-medium flex items-center gap-3 border border-slate-200">
                  <Loader2 className="animate-spin" size={18} />
                  <span>Memeriksa status akun...</span>
                </div>
              ) : hasAccount ? (
                <div className="p-4 bg-emerald-100 text-emerald-700 rounded-xl text-sm font-medium flex items-center gap-3 border border-emerald-200">
                  <CheckCircle size={18} />
                  <span>Sudah punya akun login: <strong>{accountUsername}</strong></span>
                </div>
              ) : (
                <div className="p-4 bg-red-100 text-red-700 rounded-xl text-sm font-medium flex items-center gap-3 border border-red-200">
                  <Lock size={18} />
                  <span>Belum punya akun login. Silakan buat akun di bawah.</span>
                </div>
              )}

              {passwordSuccess && (
                <div className="p-4 bg-blue-100 text-blue-700 rounded-xl text-sm font-medium flex items-center gap-3 border border-blue-200">
                  <CheckCircle size={18} />
                  <span>{passwordSuccess}</span>
                </div>
              )}

              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                  <Lock size={14} className="text-slate-400" /> Password Baru
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-3.5 bg-white border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all outline-none font-medium shadow-sm"
                  placeholder="Minimal 6 karakter"
                  minLength={6}
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="button"
                disabled={passwordLoading || newPassword.length < 6}
                onClick={async () => {
                  setPasswordLoading(true);
                  setPasswordSuccess(null);
                  try {
                    const result = await updateCustomerPassword(customer.id, newPassword);
                    setPasswordSuccess(result.message);
                    setHasAccount(true);
                    setNewPassword('');
                  } catch (err) {
                    if (err.message?.includes('tidak ditemukan') || err.status === 404) {
                      try {
                        const createResult = await createCustomerAccount(customer.id, newPassword);
                        setPasswordSuccess(`Akun berhasil dibuat! Username: ${createResult.username}`);
                        setHasAccount(true);
                        setNewPassword('');
                      } catch (createErr) {
                        await showError('Gagal', createErr.message || 'Gagal membuat akun');
                      }
                    } else {
                      await showError('Gagal', err.message || 'Gagal mengubah password');
                    }
                  } finally {
                    setPasswordLoading(false);
                  }
                }}
                className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-8 py-3.5 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all disabled:opacity-60"
              >
                {passwordLoading ? <Loader2 className="animate-spin" /> : <Key size={18} />}
                {hasAccount === false ? 'Buat Akun Login' : 'Simpan Password'}
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
