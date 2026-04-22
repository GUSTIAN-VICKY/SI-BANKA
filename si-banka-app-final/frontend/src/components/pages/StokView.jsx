import React, { useState, useMemo } from 'react';
import { Pencil, TrendingUp, TrendingDown, Trash2, Package, Warehouse, DollarSign, Scale, Sparkles, Building2, ChevronDown, Filter, MapPin } from 'lucide-react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency } from '../../utils/formatters';
import { showConfirm } from '../../utils/sweetAlert';

// Gradient colors for cards
const CARD_GRADIENTS = [
    'from-emerald-500 to-teal-600',
    'from-blue-500 to-indigo-600',
    'from-purple-500 to-pink-600',
    'from-orange-500 to-red-500',
    'from-cyan-500 to-blue-600',
    'from-pink-500 to-rose-600',
];

// Background patterns for variety
const CARD_BG_PATTERNS = [
    'from-emerald-50 to-teal-50',
    'from-blue-50 to-indigo-50',
    'from-purple-50 to-pink-50',
    'from-orange-50 to-amber-50',
    'from-cyan-50 to-blue-50',
    'from-pink-50 to-rose-50',
];

// Bank Sampah header gradients
const BANK_SAMPAH_GRADIENTS = [
    'from-slate-700 to-slate-800',
    'from-indigo-700 to-purple-800',
    'from-emerald-700 to-teal-800',
    'from-blue-700 to-indigo-800',
    'from-rose-700 to-pink-800',
];

export function StokView({ wasteTypes, updateLog, setItemToUpdateModal, handleDeleteWasteType, isNasabah, currentUser }) {
    const [selectedBankSampah, setSelectedBankSampah] = useState('all');
    const [showDropdown, setShowDropdown] = useState(false);

    // Check if user is Super Admin Kota or Admin Kota
    const isSuperAdminKota = currentUser && ['super_admin', 'super_admin_kota', 'admin_kota'].includes(currentUser.role);

    // Group waste types by Bank Sampah
    const groupedWasteTypes = useMemo(() => {
        const groups = {};
        wasteTypes.forEach(item => {
            const bankSampahId = item.bank_sampah_id || item.bankSampah?.id || 'master';
            const bankSampahName = item.bankSampah?.name || item.bank_sampah?.name || 'Harga Master / Standar Sistem';
            const bankSampahLocation = item.bankSampah?.alamat || item.bank_sampah?.alamat ||
                `RT ${item.bankSampah?.rt || item.bank_sampah?.rt || '-'}/RW ${item.bankSampah?.rw || item.bank_sampah?.rw || '-'}`;

            if (!groups[bankSampahId]) {
                groups[bankSampahId] = {
                    id: bankSampahId,
                    name: bankSampahName,
                    location: bankSampahLocation,
                    kecamatan: item.bankSampah?.kecamatan || item.bank_sampah?.kecamatan || '',
                    kelurahan: item.bankSampah?.kelurahan || item.bank_sampah?.kelurahan || '',
                    items: []
                };
            }
            groups[bankSampahId].items.push(item);
        });
        return Object.values(groups);
    }, [wasteTypes]);

    // Get unique bank sampah list for dropdown
    const bankSampahList = useMemo(() => {
        return groupedWasteTypes.map(g => ({ id: g.id, name: g.name, location: g.location }));
    }, [groupedWasteTypes]);

    // Filter waste types based on selection
    const filteredWasteTypes = useMemo(() => {
        if (selectedBankSampah === 'all' || !isSuperAdminKota) {
            return wasteTypes;
        }
        return wasteTypes.filter(item =>
            (item.bank_sampah_id || item.bankSampah?.id) === selectedBankSampah
        );
    }, [wasteTypes, selectedBankSampah, isSuperAdminKota]);

    // Filtered groups for display
    const filteredGroups = useMemo(() => {
        if (selectedBankSampah === 'all') {
            return groupedWasteTypes;
        }
        return groupedWasteTypes.filter(g => g.id === selectedBankSampah);
    }, [groupedWasteTypes, selectedBankSampah]);

    // Calculate totals
    const totalStock = filteredWasteTypes.reduce((sum, item) => sum + parseFloat(item.stok || 0), 0);
    const avgPrice = filteredWasteTypes.length > 0
        ? filteredWasteTypes.reduce((sum, item) => sum + parseFloat(item.price || 0), 0) / filteredWasteTypes.length
        : 0;

    // Render single waste type card
    const renderWasteCard = (item, index, colorOffset = 0) => {
        const priceLog = updateLog.find(log => log.itemId === item.id && log.changeType === 'Harga');
        const oldPrice = priceLog ? priceLog.oldValue : null;
        const colorIndex = (index + colorOffset) % CARD_GRADIENTS.length;

        return (
            <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, type: "spring", stiffness: 100 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className={`bg-gradient-to-br ${CARD_BG_PATTERNS[colorIndex]} rounded-3xl shadow-lg hover:shadow-2xl overflow-hidden relative group cursor-pointer border border-white/50`}
            >
                {/* Decorative gradient bar on top */}
                <div className={`h-2 bg-gradient-to-r ${CARD_GRADIENTS[colorIndex]}`}></div>

                <div className="p-5 md:p-6 flex flex-col h-full relative z-10">
                    {/* Header with Icon and Name */}
                    <div className="flex items-start justify-between mb-5">
                        <div className="flex items-center gap-4">
                            <motion.div
                                whileHover={{ rotate: [0, -10, 10, 0] }}
                                transition={{ duration: 0.5 }}
                                className={`w-14 h-14 bg-gradient-to-br ${CARD_GRADIENTS[colorIndex]} rounded-2xl flex items-center justify-center text-2xl shadow-lg`}
                            >
                                <span className="text-white drop-shadow-md">{item.icon}</span>
                            </motion.div>
                            <div>
                                <h4 className="font-bold text-slate-800 text-lg leading-tight mb-1">{item.name}</h4>
                                <span className={`inline-block px-2.5 py-0.5 bg-gradient-to-r ${CARD_GRADIENTS[colorIndex]} text-white rounded-lg text-xs font-bold shadow-sm`}>
                                    {item.id}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="flex-1 space-y-3 mb-4">
                        {/* Stock */}
                        <div className="p-3 bg-white/80 backdrop-blur-sm rounded-xl border border-slate-100 shadow-sm group-hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Scale size={14} className="text-slate-400" />
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Stok</p>
                                </div>
                                <div className={`w-2 h-2 rounded-full ${parseFloat(item.stok) > 0 ? 'bg-emerald-500' : 'bg-slate-300'} animate-pulse`}></div>
                            </div>
                            <p className="text-2xl font-black text-slate-700 mt-1">
                                {parseFloat(item.stok).toFixed(2)}
                                <span className="text-sm font-bold text-slate-400 ml-1">kg</span>
                            </p>
                        </div>

                        {/* Price */}
                        <div className={`p-3 bg-gradient-to-r ${CARD_GRADIENTS[colorIndex]} rounded-xl shadow-md`}>
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <DollarSign size={12} className="text-white/70" />
                                        <p className="text-xs font-bold text-white/70 uppercase tracking-wider">Harga</p>
                                    </div>
                                    <p className="text-xl font-black text-white mt-1">
                                        {formatCurrency(item.price)}
                                        <span className="text-xs font-bold text-white/70 ml-1">/kg</span>
                                    </p>
                                </div>
                                {oldPrice && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className={`text-xs font-bold px-2 py-1 rounded-lg ${item.price > oldPrice
                                            ? 'bg-emerald-400/30 text-white border border-emerald-300/50'
                                            : 'bg-red-400/30 text-white border border-red-300/50'
                                            }`}
                                    >
                                        {item.price > oldPrice ? (
                                            <span className="flex items-center gap-1"><TrendingUp size={10} /> {Math.abs(((item.price - oldPrice) / oldPrice * 100).toFixed(0))}%</span>
                                        ) : (
                                            <span className="flex items-center gap-1"><TrendingDown size={10} /> {Math.abs(((item.price - oldPrice) / oldPrice * 100).toFixed(0))}%</span>
                                        )}
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Action buttons - only for non-nasabah and non-super-admin-kota viewing other bank sampah */}
                    {!isNasabah && (!isSuperAdminKota || (item.bank_sampah_id === currentUser?.bank_sampah_id || !currentUser?.bank_sampah_id)) && (
                        <div className="flex gap-2 mt-auto">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setItemToUpdateModal(item)}
                                className={`flex-1 bg-gradient-to-r ${CARD_GRADIENTS[colorIndex]} text-white py-3 rounded-xl font-bold text-sm shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2`}
                            >
                                <Pencil size={14} /> Update
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={async (e) => {
                                    e.stopPropagation();
                                    const isConfirmed = await showConfirm({
                                        title: 'Hapus Jenis Sampah?',
                                        text: 'Stok dan data terkait akan dihapus permanen.',
                                        confirmText: 'Ya, Hapus'
                                    });
                                    if (isConfirmed) handleDeleteWasteType(item.id);
                                }}
                                className="w-12 bg-white text-red-500 rounded-xl flex items-center justify-center hover:bg-red-50 transition-colors border-2 border-red-100 shadow-sm"
                            >
                                <Trash2 size={16} />
                            </motion.button>
                        </div>
                    )}
                </div>
            </motion.div>
        );
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            {/* Header with Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Total Items Card */}
                <motion.div
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="bg-gradient-to-br from-emerald-500 to-teal-600 p-5 rounded-2xl shadow-lg shadow-emerald-500/20 cursor-pointer"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-emerald-100 text-sm font-medium mb-1">Jenis Sampah</p>
                            <h3 className="text-3xl font-black text-white">{filteredWasteTypes.length}</h3>
                            <p className="text-emerald-200 text-xs mt-1">
                                {isSuperAdminKota && selectedBankSampah === 'all'
                                    ? `dari ${bankSampahList.length} Bank Sampah`
                                    : 'item terdaftar'}
                            </p>
                        </div>
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                            <Package size={28} className="text-white" />
                        </div>
                    </div>
                </motion.div>

                {/* Total Stock Card */}
                <motion.div
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="bg-gradient-to-br from-blue-500 to-indigo-600 p-5 rounded-2xl shadow-lg shadow-blue-500/20 cursor-pointer"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-100 text-sm font-medium mb-1">Total Stok</p>
                            <h3 className="text-3xl font-black text-white">{totalStock.toFixed(1)}<span className="text-lg ml-1">kg</span></h3>
                            <p className="text-blue-200 text-xs mt-1">di gudang</p>
                        </div>
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                            <Warehouse size={28} className="text-white" />
                        </div>
                    </div>
                </motion.div>

                {/* Average Price Card */}
                <motion.div
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="bg-gradient-to-br from-purple-500 to-pink-600 p-5 rounded-2xl shadow-lg shadow-purple-500/20 cursor-pointer"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-purple-100 text-sm font-medium mb-1">Rata-rata Harga</p>
                            <h3 className="text-2xl font-black text-white">{formatCurrency(avgPrice)}</h3>
                            <p className="text-purple-200 text-xs mt-1">per kilogram</p>
                        </div>
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                            <DollarSign size={28} className="text-white" />
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Filter Bar - Only for Super Admin Kota */}
            {isSuperAdminKota && bankSampahList.length > 1 && (
                <div className="bg-gradient-to-r from-slate-50 to-white p-4 rounded-xl border border-slate-100 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                            <Filter size={20} className="text-white" />
                        </div>
                        <div>
                            <p className="text-slate-700 font-semibold">Filter Bank Sampah</p>
                            <p className="text-slate-400 text-xs">Pilih untuk melihat data spesifik</p>
                        </div>
                    </div>

                    <div className="relative flex-1 sm:max-w-xs ml-auto">
                        <button
                            onClick={() => setShowDropdown(!showDropdown)}
                            className="w-full flex items-center justify-between px-4 py-3 bg-white border-2 border-slate-200 rounded-xl hover:border-indigo-300 transition-colors font-medium text-slate-700"
                        >
                            <span className="flex items-center gap-2">
                                <Building2 size={16} className="text-indigo-500" />
                                {selectedBankSampah === 'all'
                                    ? 'Semua Bank Sampah'
                                    : bankSampahList.find(b => b.id === selectedBankSampah)?.name || 'Pilih Bank Sampah'}
                            </span>
                            <ChevronDown size={18} className={`text-slate-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                        </button>

                        <AnimatePresence>
                            {showDropdown && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden max-h-64 overflow-y-auto"
                                >
                                    <button
                                        onClick={() => { setSelectedBankSampah('all'); setShowDropdown(false); }}
                                        className={`w-full px-4 py-3 text-left hover:bg-indigo-50 transition-colors flex items-center gap-3 ${selectedBankSampah === 'all' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700'}`}
                                    >
                                        <Package size={16} className="text-indigo-500" />
                                        <div>
                                            <p className="font-semibold">Semua Bank Sampah</p>
                                            <p className="text-xs text-slate-400">{wasteTypes.length} jenis sampah</p>
                                        </div>
                                    </button>
                                    {bankSampahList.map(bank => {
                                        const itemCount = wasteTypes.filter(w => (w.bank_sampah_id || w.bankSampah?.id) === bank.id).length;
                                        return (
                                            <button
                                                key={bank.id}
                                                onClick={() => { setSelectedBankSampah(bank.id); setShowDropdown(false); }}
                                                className={`w-full px-4 py-3 text-left hover:bg-indigo-50 transition-colors flex items-center gap-3 border-t border-slate-100 ${selectedBankSampah === bank.id ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700'}`}
                                            >
                                                <Building2 size={16} className="text-emerald-500" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold truncate">{bank.name}</p>
                                                    <p className="text-xs text-slate-400 truncate">{bank.location} • {itemCount} jenis</p>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            )}

            {/* Description */}
            <div className="bg-gradient-to-r from-slate-50 to-white p-4 rounded-xl border border-slate-100 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-200">
                    <Sparkles size={20} className="text-white" />
                </div>
                <div>
                    <p className="text-slate-700 font-semibold">
                        {isNasabah ? 'Lihat stok dan harga sampah saat ini' :
                            isSuperAdminKota ? 'Kelola dan pantau stok & harga dari semua Bank Sampah' :
                                'Kelola stok real-time dan update harga pasar'}
                    </p>
                    <p className="text-slate-400 text-xs">Data diperbarui secara otomatis</p>
                </div>
            </div>

            {/* Waste Type Cards - Grouped by Bank Sampah for Super Admin Kota */}
            {isSuperAdminKota && selectedBankSampah === 'all' ? (
                // Grouped View
                <div className="space-y-8 pb-20 md:pb-0">
                    {filteredGroups.length > 0 ? (
                        filteredGroups.map((group, groupIndex) => {
                            const groupTotalStock = group.items.reduce((sum, item) => sum + parseFloat(item.stok || 0), 0);
                            const groupAvgPrice = group.items.length > 0
                                ? group.items.reduce((sum, item) => sum + parseFloat(item.price || 0), 0) / group.items.length
                                : 0;

                            return (
                                <motion.div
                                    key={group.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: groupIndex * 0.1 }}
                                    className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-100"
                                >
                                    {/* Bank Sampah Header */}
                                    <div className={`bg-gradient-to-r ${BANK_SAMPAH_GRADIENTS[groupIndex % BANK_SAMPAH_GRADIENTS.length]} p-5`}>
                                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                                                    <Building2 size={28} className="text-white" />
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-bold text-white">{group.name}</h3>
                                                    <p className="text-white/70 text-sm flex items-center gap-1">
                                                        <MapPin size={14} />
                                                        {group.location}
                                                        {group.kecamatan && ` • ${group.kecamatan}`}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex gap-4">
                                                <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl">
                                                    <p className="text-white/70 text-xs">Jenis</p>
                                                    <p className="text-white font-bold text-lg">{group.items.length}</p>
                                                </div>
                                                <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl">
                                                    <p className="text-white/70 text-xs">Total Stok</p>
                                                    <p className="text-white font-bold text-lg">{groupTotalStock.toFixed(1)} kg</p>
                                                </div>
                                                <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl">
                                                    <p className="text-white/70 text-xs">Rata-rata Harga</p>
                                                    <p className="text-white font-bold text-lg">{formatCurrency(groupAvgPrice)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Waste Type Cards Grid */}
                                    <div className="p-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                        {group.items.map((item, index) => renderWasteCard(item, index, groupIndex * 2))}
                                    </div>
                                </motion.div>
                            );
                        })
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center justify-center py-20 bg-gradient-to-br from-slate-50 to-slate-100 rounded-3xl border-2 border-dashed border-slate-200 text-center"
                        >
                            <div className="w-20 h-20 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full flex items-center justify-center mb-4">
                                <Package size={40} className="text-slate-400" />
                            </div>
                            <p className="text-slate-600 font-bold text-lg mb-2">Belum ada data</p>
                            <p className="text-slate-400 text-sm max-w-xs mx-auto">Tambahkan jenis sampah baru melalui menu Transaksi saat input sampah.</p>
                        </motion.div>
                    )}
                </div>
            ) : (
                // Flat View (default for non-super-admin or when specific bank sampah selected)
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 pb-20 md:pb-0">
                    {filteredWasteTypes.length > 0 ? (
                        filteredWasteTypes.map((item, index) => renderWasteCard(item, index))
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="col-span-full flex flex-col items-center justify-center py-20 bg-gradient-to-br from-slate-50 to-slate-100 rounded-3xl border-2 border-dashed border-slate-200 text-center mx-4 md:mx-0"
                        >
                            <div className="w-20 h-20 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full flex items-center justify-center mb-4">
                                <Package size={40} className="text-slate-400" />
                            </div>
                            <p className="text-slate-600 font-bold text-lg mb-2">Belum ada data</p>
                            <p className="text-slate-400 text-sm max-w-xs mx-auto">Tambahkan jenis sampah baru melalui menu Transaksi saat input sampah.</p>
                        </motion.div>
                    )}
                </div>
            )}
        </motion.div>
    );
}

