import React, { useState } from 'react';
import { Search, UserPlus, Trash2, FileClock, User, Wallet, TrendingUp, MapPin, Package, Scale, Recycle, Pencil } from 'lucide-react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency } from '../../utils/formatters';
import { showConfirm } from '../../utils/sweetAlert';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
    PieChart, Pie, Legend
} from 'recharts';

// Custom Modern Tooltip for Balance Bar Chart
const BalanceTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700/50 backdrop-blur-sm animate-fadeIn">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg">
                        <Wallet size={14} className="text-white" />
                    </div>
                    <span className="font-bold text-sm truncate max-w-[120px]">{label}</span>
                </div>
                <div className="space-y-1">
                    <div className="flex items-center justify-between gap-4">
                        <span className="text-slate-400 text-xs">Saldo</span>
                        <span className="font-bold text-emerald-400 text-sm">{formatCurrency(payload[0].value)}</span>
                    </div>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-700/50">
                    <span className="text-[10px] text-slate-500">Top 5 Saldo Tertinggi</span>
                </div>
            </div>
        );
    }
    return null;
};

// Custom Modern Tooltip for Location Pie Chart
const LocationTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        const data = payload[0];
        const _percentage = ((data.value / payload[0].payload.value) * 100).toFixed(1);
        return (
            <div className="bg-gradient-to-br from-blue-900 to-indigo-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-blue-700/50 backdrop-blur-sm animate-fadeIn min-w-[160px]">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-lg" style={{ backgroundColor: data.payload.fill || '#3B82F6' }}>
                        <MapPin size={14} className="text-white" />
                    </div>
                    <span className="font-bold text-sm">{data.name}</span>
                </div>
                <div className="space-y-2">
                    <div className="flex items-center justify-between gap-4">
                        <span className="text-blue-300 text-xs">Jumlah</span>
                        <span className="font-bold text-white text-lg">{data.value} <span className="text-xs font-normal text-blue-300">nasabah</span></span>
                    </div>
                    <div className="w-full bg-blue-950/50 rounded-full h-2 overflow-hidden">
                        <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{ width: `100%`, backgroundColor: data.payload.fill || '#3B82F6' }}
                        />
                    </div>
                </div>
            </div>
        );
    }
    return null;
};

// Custom Modern Tooltip for Waste Pie Chart
const WasteTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        const data = payload[0];
        return (
            <div className="bg-gradient-to-br from-teal-900 to-emerald-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-teal-700/50 backdrop-blur-sm animate-fadeIn min-w-[180px]">
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{ backgroundColor: data.payload.fill || '#14B8A6' }}>
                        <Recycle size={18} className="text-white" />
                    </div>
                    <div>
                        <span className="font-bold text-sm block">{data.name}</span>
                        <span className="text-[10px] text-teal-300">Jenis Sampah</span>
                    </div>
                </div>
                <div className="bg-teal-950/50 rounded-lg p-3">
                    <div className="flex items-end justify-between gap-4">
                        <span className="text-teal-300 text-xs">Berat Total</span>
                        <div className="text-right">
                            <span className="font-black text-2xl text-white">{data.value.toFixed(1)}</span>
                            <span className="text-sm font-medium text-teal-300 ml-1">kg</span>
                        </div>
                    </div>
                </div>
                <div className="mt-2 flex items-center gap-1 text-[10px] text-teal-400">
                    <Scale size={10} />
                    <span>Hover untuk melihat detail</span>
                </div>
            </div>
        );
    }
    return null;
};

// eslint-disable-next-line no-unused-vars
export function NasabahView({ customers, allTransactions = [], wasteTypes = [], setShowAddCustomerModal, handleViewCustomerHistory, handleDeleteCustomer, isNasabah, locationStats, currentUser, onEditCustomer }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRT, setSelectedRT] = useState('All');
    const [selectedRW, setSelectedRW] = useState('All');

    // Check if user is city-level admin (can edit alamat)
    const isCityAdmin = currentUser && ['super_admin', 'super_admin_kota', 'admin_kota'].includes(currentUser.role);

    // Extract Unique RT and RW for Filters
    const uniqueRTs = ['All', ...new Set(customers.map(c => c.rt))].sort((a, b) => a - b);
    const uniqueRWs = ['All', ...new Set(customers.map(c => c.rw))].sort((a, b) => a - b);

    // [LOGIKA FILTER] Pencarian & Filter Data Nasabah
    // Melakukan filter array 'customers' berdasarkan 4 kondisi:
    // 1. Nama/ID/Alamat cocok dengan kotak pencarian (searchTerm)
    // 2. RT cocok atau 'All'
    // 3. RW cocok atau 'All'
    const filteredCustomers = customers.filter(customer => {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = customer.name.toLowerCase().includes(searchLower) ||
            customer.id.toLowerCase().includes(searchLower) ||
            (customer.alamat && customer.alamat.toLowerCase().includes(searchLower)) ||
            (customer.bankSampah?.name && customer.bankSampah.name.toLowerCase().includes(searchLower)) ||
            (customer.bankSampah?.alamat && customer.bankSampah.alamat.toLowerCase().includes(searchLower)) ||
            (customer.bankSampah?.kecamatan && customer.bankSampah.kecamatan.toLowerCase().includes(searchLower)) ||
            (customer.bankSampah?.kelurahan && customer.bankSampah.kelurahan.toLowerCase().includes(searchLower));
        const matchesRT = selectedRT === 'All' || customer.rt === selectedRT;
        const matchesRW = selectedRW === 'All' || customer.rw === selectedRW;
        return matchesSearch && matchesRT && matchesRW;
    });

    // --- Statistics Calculations ---
    // [LOGIKA STATISTIK] Menghitung Ringkasan Data
    const dataToDisplay = filteredCustomers;
    const totalCustomers = dataToDisplay.length;
    // Menjumlahkan total saldo dari hasil filter
    const totalBalance = dataToDisplay.reduce((acc, curr) => acc + parseFloat(curr.balance || 0), 0);
    // Menghitung rata-rata (Total Saldo / Jumlah Orang)
    const avgBalance = totalCustomers > 0 ? totalBalance / totalCustomers : 0;

    // [LOGIKA SORTING] Top 5 Nasabah
    // 1. Copy array agar data asli tidak berubah ([...data])
    // 2. Sort dari saldo terbesar ke terkecil (b.balance - a.balance)
    // 3. Ambil 5 urutan pertama (.slice(0, 5))
    const topCustomersData = [...dataToDisplay]
        .sort((a, b) => parseFloat(b.balance || 0) - parseFloat(a.balance || 0))
        .slice(0, 5)
        .map(c => ({ name: c.name, balance: parseFloat(c.balance || 0) }));

    // Customer Distribution - Role-based
    // Super Admin Kota/Admin Kota: By Kecamatan from locationStats
    // Super Admin RT/Admin RT: By Kelurahan from locationStats
    // Fallback: By RW from customer data
    const isSuperAdminKota = currentUser && ['super_admin', 'super_admin_kota', 'admin_kota'].includes(currentUser.role);
    const isSuperAdminRT = currentUser && ['super_admin_rt', 'admin', 'admin_rt'].includes(currentUser.role);

    const getLocationData = () => {
        // Use locationStats if available and appropriate for role
        if (locationStats && locationStats.distribution && locationStats.distribution.length > 0) {
            if (isSuperAdminKota && locationStats.type === 'kota') {
                // Show by Kecamatan
                return locationStats.distribution.map(item => ({
                    name: item.kecamatan || 'Tidak Diketahui',
                    value: parseInt(item.total_nasabah) || 0
                })).filter(item => item.value > 0);
            } else if (isSuperAdminRT && locationStats.type === 'rt') {
                // Show by Kelurahan
                return locationStats.distribution.map(item => ({
                    name: item.kelurahan || 'Tidak Diketahui',
                    value: parseInt(item.total_nasabah) || 0
                })).filter(item => item.value > 0);
            }
        }

        // Fallback: Calculate from customer data
        if (isSuperAdminKota) {
            // Group by kecamatan from bankSampah
            return Object.values(dataToDisplay.reduce((acc, curr) => {
                const kecamatan = curr.bankSampah?.kecamatan || curr.bank_sampah?.kecamatan || 'Tidak Diketahui';
                if (!acc[kecamatan]) acc[kecamatan] = { name: kecamatan, value: 0 };
                acc[kecamatan].value++;
                return acc;
            }, {}));
        } else if (isSuperAdminRT) {
            // Group by kelurahan from bankSampah
            return Object.values(dataToDisplay.reduce((acc, curr) => {
                const kelurahan = curr.bankSampah?.kelurahan || curr.bank_sampah?.kelurahan || 'Tidak Diketahui';
                if (!acc[kelurahan]) acc[kelurahan] = { name: kelurahan, value: 0 };
                acc[kelurahan].value++;
                return acc;
            }, {}));
        }

        // Default: By RW from customer data
        return Object.values(dataToDisplay.reduce((acc, curr) => {
            const key = `RW ${curr.rw}`;
            if (!acc[key]) acc[key] = { name: key, value: 0 };
            acc[key].value++;
            return acc;
        }, {}));
    };

    const locationData = getLocationData();
    const locationChartTitle = isSuperAdminKota ? 'Sebaran Lokasi (Kecamatan)' : isSuperAdminRT ? 'Sebaran Lokasi (Kelurahan)' : 'Sebaran Lokasi (RW)';

    // --- Waste Statistics ---
    // Calculate total weight from all transactions
    const getTotalWeight = () => {
        return allTransactions.reduce((total, trx) => {
            const items = trx.items || [];
            const trxWeight = items.reduce((sum, item) => sum + parseFloat(item.qty || 0), 0);
            return total + trxWeight;
        }, 0);
    };
    const totalWeight = getTotalWeight();
    const totalTransactions = allTransactions.length;

    // Calculate waste type distribution
    const wasteDistribution = () => {
        const distribution = {};
        allTransactions.forEach(trx => {
            (trx.items || []).forEach(item => {
                const wasteName = item.name || 'Lainnya';
                if (!distribution[wasteName]) {
                    distribution[wasteName] = { name: wasteName, value: 0 };
                }
                distribution[wasteName].value += parseFloat(item.qty || 0);
            });
        });
        return Object.values(distribution).sort((a, b) => b.value - a.value);
    };
    const wasteData = wasteDistribution();

    // Most popular waste type
    const favoriteWaste = wasteData.length > 0 ? wasteData[0].name : 'Belum ada';

    const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#6366F1', '#EC4899', '#14B8A6'];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            {/* --- Filter & Action Bar --- */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white/40 backdrop-blur-md p-4 rounded-2xl border border-white/20 shadow-sm mt-4 md:mt-0">
                <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto flex-1">
                    <div className="relative w-full md:w-64 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Cari nama, ID, alamat, lokasi..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white/60 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all outline-none font-medium text-sm"
                        />
                    </div>

                    <div className="flex gap-2 w-full md:w-auto">
                        {/* RT Filter */}
                        <select
                            value={selectedRT}
                            onChange={(e) => setSelectedRT(e.target.value)}
                            className="flex-1 px-4 py-3 bg-white/60 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-medium text-slate-600 appearance-none text-sm"
                        >
                            {uniqueRTs.map(rt => (
                                <option key={rt} value={rt}>{rt === 'All' ? 'Semua RT' : `RT ${rt}`}</option>
                            ))}
                        </select>

                        {/* RW Filter */}
                        <select
                            value={selectedRW}
                            onChange={(e) => setSelectedRW(e.target.value)}
                            className="flex-1 px-4 py-3 bg-white/60 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-medium text-slate-600 appearance-none text-sm"
                        >
                            {uniqueRWs.map(rw => (
                                <option key={rw} value={rw}>{rw === 'All' ? 'Semua RW' : `RW ${rw}`}</option>
                            ))}
                        </select>
                    </div>
                </div>
                {/* Tombol Tambah Nasabah - Sembunyikan untuk nasabah */}
                {!isNasabah && (
                    <button
                        onClick={() => setShowAddCustomerModal(true)}
                        className="w-full md:w-auto bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-transform active:scale-95 text-sm"
                    >
                        <UserPlus size={18} /> Tambah Nasabah
                    </button>
                )}
            </div>
            {/* --- Stats Cards Grid with Gradient Backgrounds --- */}
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {/* Total Nasabah */}
                <motion.div
                    whileHover={{ scale: 1.02, y: -4 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="bg-gradient-to-br from-blue-500 to-blue-600 p-5 rounded-2xl shadow-lg shadow-blue-500/25 cursor-pointer group"
                >
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                            <User size={22} />
                        </div>
                        <span className="text-white/60 text-xs font-bold uppercase">Nasabah</span>
                    </div>
                    <h3 className="text-3xl font-black text-white tracking-tight">{totalCustomers}</h3>
                    <p className="text-white/70 text-xs mt-1 font-medium">Total terdaftar</p>
                </motion.div>

                {/* Total Saldo */}
                <motion.div
                    whileHover={{ scale: 1.02, y: -4 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-5 rounded-2xl shadow-lg shadow-emerald-500/25 cursor-pointer group"
                >
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                            <Wallet size={22} />
                        </div>
                        <span className="text-white/60 text-xs font-bold uppercase">Saldo</span>
                    </div>
                    <h3 className="text-2xl font-black text-white tracking-tight">{formatCurrency(totalBalance)}</h3>
                    <p className="text-white/70 text-xs mt-1 font-medium">Total semua</p>
                </motion.div>

                {/* Total Berat Sampah */}
                <motion.div
                    whileHover={{ scale: 1.02, y: -4 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="bg-gradient-to-br from-orange-400 to-orange-500 p-5 rounded-2xl shadow-lg shadow-orange-500/25 cursor-pointer group"
                >
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                            <Scale size={22} />
                        </div>
                        <span className="text-white/60 text-xs font-bold uppercase">Sampah</span>
                    </div>
                    <h3 className="text-3xl font-black text-white tracking-tight">{totalWeight.toFixed(1)}<span className="text-lg ml-1">kg</span></h3>
                    <p className="text-white/70 text-xs mt-1 font-medium">Total terkumpul</p>
                </motion.div>

                {/* Total Transaksi */}
                <motion.div
                    whileHover={{ scale: 1.02, y: -4 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="bg-gradient-to-br from-purple-500 to-purple-600 p-5 rounded-2xl shadow-lg shadow-purple-500/25 cursor-pointer group"
                >
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                            <Package size={22} />
                        </div>
                        <span className="text-white/60 text-xs font-bold uppercase">Transaksi</span>
                    </div>
                    <h3 className="text-3xl font-black text-white tracking-tight">{totalTransactions}</h3>
                    <p className="text-white/70 text-xs mt-1 font-medium">Total setoran</p>
                </motion.div>

                {/* Rata-rata Saldo */}
                <motion.div
                    whileHover={{ scale: 1.02, y: -4 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="bg-gradient-to-br from-pink-500 to-rose-500 p-5 rounded-2xl shadow-lg shadow-pink-500/25 cursor-pointer group"
                >
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                            <TrendingUp size={22} />
                        </div>
                        <span className="text-white/60 text-xs font-bold uppercase">Rata-rata</span>
                    </div>
                    <h3 className="text-2xl font-black text-white tracking-tight">{formatCurrency(avgBalance)}</h3>
                    <p className="text-white/70 text-xs mt-1 font-medium">Per nasabah</p>
                </motion.div>

                {/* Sampah Terbanyak */}
                <motion.div
                    whileHover={{ scale: 1.02, y: -4 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="bg-gradient-to-br from-teal-500 to-cyan-500 p-5 rounded-2xl shadow-lg shadow-teal-500/25 cursor-pointer group"
                >
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                            <Recycle size={22} />
                        </div>
                        <span className="text-white/60 text-xs font-bold uppercase">Top</span>
                    </div>
                    <h3 className="text-lg font-black text-white tracking-tight truncate" title={favoriteWaste}>{favoriteWaste}</h3>
                    <p className="text-white/70 text-xs mt-1 font-medium">Paling banyak</p>
                </motion.div>
            </div>

            {/* --- Charts Section --- */}
            {customers.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {/* Top 5 Nasabah Chart */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-gradient-to-br from-white to-emerald-50/50 p-6 rounded-2xl shadow-lg border border-emerald-100/50 min-h-[350px] hover:shadow-xl transition-shadow"
                    >
                        <h4 className="font-bold text-slate-700 mb-6 flex items-center gap-2">
                            <Wallet size={18} className="text-emerald-500" />
                            Top 5 Saldo Tertinggi
                        </h4>
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={topCustomersData} layout="vertical" margin={{ left: 40 }}>
                                    <XAxis type="number" hide />
                                    <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12 }} />
                                    <Tooltip content={<BalanceTooltip />} cursor={{ fill: 'rgba(16, 185, 129, 0.1)' }} />
                                    <Bar dataKey="balance" radius={[0, 4, 4, 0]} barSize={20}>
                                        {topCustomersData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* Location Distribution Chart */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-gradient-to-br from-white to-blue-50/50 p-6 rounded-2xl shadow-lg border border-blue-100/50 min-h-[350px] hover:shadow-xl transition-shadow"
                    >
                        <h4 className="font-bold text-slate-700 mb-6 flex items-center gap-2">
                            <MapPin size={18} className="text-blue-500" />
                            {locationChartTitle}
                        </h4>
                        <div className="h-[250px] w-full flex items-center justify-center">
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={locationData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {locationData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<LocationTooltip />} />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* Waste Distribution Chart */}
                    {wasteData.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-gradient-to-br from-white to-teal-50/50 p-6 rounded-2xl shadow-lg border border-teal-100/50 min-h-[350px] hover:shadow-xl transition-shadow"
                        >
                            <h4 className="font-bold text-slate-700 mb-6 flex items-center gap-2">
                                <Recycle size={18} className="text-teal-500" />
                                Distribusi Jenis Sampah (kg)
                            </h4>
                            <div className="h-[250px] w-full flex items-center justify-center">
                                <ResponsiveContainer width="100%" height={250}>
                                    <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                        <Pie
                                            data={wasteData.slice(0, 6)}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={50}
                                            outerRadius={70}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {wasteData.slice(0, 6).map((entry, index) => (
                                                <Cell key={`cell-waste-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<WasteTooltip />} />
                                        <Legend
                                            verticalAlign="bottom"
                                            height={36}
                                            formatter={(value) => value.length > 15 ? value.substring(0, 15) + '...' : value}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </motion.div>
                    )}
                </div>
            )}



            <div className="glass-card overflow-hidden">
                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100/50">
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">ID Nasabah</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Nama Lengkap</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Bank Sampah</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Alamat Nasabah</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">RT/RW</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Saldo</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100/50">
                            <AnimatePresence>
                                {filteredCustomers.length > 0 ? (
                                    filteredCustomers.map((customer, index) => (
                                        <motion.tr
                                            key={customer.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="hover:bg-emerald-50/30 transition-colors"
                                        >
                                            <td className="px-6 py-4 text-sm font-medium text-slate-500 font-mono">{customer.id}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center overflow-hidden border border-emerald-200">
                                                        {customer.photo_path ? (
                                                            <img
                                                                src={`/storage/${customer.photo_path}?t=${new Date().getTime()}`}
                                                                alt={customer.name}
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                                                            />
                                                        ) : (
                                                            <span className="text-emerald-600 font-bold text-xs">{customer.name.charAt(0).toUpperCase()}</span>
                                                        )}
                                                        <div className="hidden w-full h-full bg-emerald-50 items-center justify-center">
                                                            <span className="text-emerald-600 font-bold text-xs">{customer.name.charAt(0).toUpperCase()}</span>
                                                        </div>
                                                    </div>
                                                    <span className="font-bold text-slate-700">{customer.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-slate-700 text-sm">
                                                        {customer.bankSampah?.name || customer.bank_sampah?.name || '-'}
                                                    </span>
                                                    {(customer.bankSampah?.kecamatan || customer.bankSampah?.kelurahan) && (
                                                        <span className="text-xs text-slate-400 truncate max-w-[150px]" title={`${customer.bankSampah?.kelurahan || ''}, ${customer.bankSampah?.kecamatan || ''}`}>
                                                            {customer.bankSampah?.kelurahan}{customer.bankSampah?.kelurahan && customer.bankSampah?.kecamatan ? ', ' : ''}{customer.bankSampah?.kecamatan}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {customer.alamat ? (
                                                    <div className="flex items-start gap-1 max-w-[180px]">
                                                        <MapPin size={12} className="text-slate-400 mt-0.5 flex-shrink-0" />
                                                        <span className="text-sm text-slate-600 line-clamp-2" title={customer.alamat}>
                                                            {customer.alamat}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-300 text-sm">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium">
                                                    RT {customer.rt} / RW {customer.rw}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-emerald-600">{formatCurrency(customer.balance)}</td>
                                            <td className="px-6 py-4">
                                                {!isNasabah && (
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => handleViewCustomerHistory(customer)}
                                                            className="p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                                                            title="Lihat Riwayat"
                                                        >
                                                            <FileClock size={18} />
                                                        </button>
                                                        {isCityAdmin && (
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); onEditCustomer && onEditCustomer(customer); }}
                                                                className="p-2 text-amber-600 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors"
                                                                title="Edit Alamat"
                                                            >
                                                                <Pencil size={18} />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={async () => {
                                                                const isConfirmed = await showConfirm({
                                                                    title: 'Hapus Nasabah?',
                                                                    text: 'Data nasabah dan riwayat transaksi akan dihapus permanen.',
                                                                    confirmText: 'Ya, Hapus'
                                                                });
                                                                if (isConfirmed) handleDeleteCustomer(customer.id);
                                                            }}
                                                            className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                                                            title="Hapus Nasabah"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </motion.tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                                            <User size={48} className="mx-auto mb-3 opacity-20" />
                                            <p>Data nasabah tidak ditemukan.</p>
                                        </td>
                                    </tr>
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                    <AnimatePresence>
                        {filteredCustomers.length > 0 ? (
                            filteredCustomers.map((customer, index) => (
                                <motion.div
                                    key={customer.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 relative"
                                    onClick={() => !isNasabah && handleViewCustomerHistory(customer)}
                                    style={{ cursor: isNasabah ? 'default' : 'pointer' }}
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-12 h-12 rounded-full bg-emerald-50 flex-shrink-0 flex items-center justify-center overflow-hidden border border-emerald-100 shadow-sm">
                                            {customer.photo_path ? (
                                                <img
                                                    src={`/storage/${customer.photo_path}?t=${new Date().getTime()}`}
                                                    alt={customer.name}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                                                />
                                            ) : (
                                                <span className="text-emerald-600 font-bold text-lg">{customer.name.charAt(0).toUpperCase()}</span>
                                            )}
                                            <div className="hidden w-full h-full bg-emerald-50 items-center justify-center">
                                                <span className="text-emerald-600 font-bold text-lg">{customer.name.charAt(0).toUpperCase()}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-800 text-lg leading-tight">{customer.name}</h4>
                                            <p className="text-xs text-slate-500 font-mono mt-0.5">{customer.id}</p>
                                        </div>
                                        {/* Arrow - only show for admin */}
                                        {!isNasabah && (
                                            <div className="ml-auto opacity-30">
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 mb-3">
                                        <div className="bg-slate-50 rounded-xl p-2.5">
                                            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Lokasi</span>
                                            <span className="text-sm font-semibold text-slate-700">RT {customer.rt} / RW {customer.rw}</span>
                                        </div>
                                        <div className="bg-emerald-50 rounded-xl p-2.5">
                                            <span className="text-[10px] uppercase font-bold text-emerald-400 block mb-0.5">Saldo</span>
                                            <span className="text-sm font-bold text-emerald-700">{formatCurrency(customer.balance)}</span>
                                        </div>
                                    </div>

                                    {/* Actions - only show for admin */}
                                    {!isNasabah && (
                                        <div className="flex gap-2 mt-2 pt-2 border-t border-slate-50">
                                            {isCityAdmin && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); onEditCustomer && onEditCustomer(customer); }}
                                                    className="flex-1 py-2 flex items-center justify-center gap-2 text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-lg text-xs font-bold transition-colors"
                                                >
                                                    <Pencil size={14} /> Edit Alamat
                                                </button>
                                            )}
                                            <button
                                                onClick={async (e) => {
                                                    e.stopPropagation();
                                                    const isConfirmed = await showConfirm({
                                                        title: 'Hapus Nasabah?',
                                                        text: 'Data nasabah dan riwayat transaksi akan dihapus permanen.',
                                                        confirmText: 'Ya, Hapus'
                                                    });
                                                    if (isConfirmed) handleDeleteCustomer(customer.id);
                                                }}
                                                className={`${isCityAdmin ? 'flex-1' : 'w-full'} py-2 flex items-center justify-center gap-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg text-xs font-bold transition-colors`}
                                            >
                                                <Trash2 size={14} /> Hapus
                                            </button>
                                        </div>
                                    )}
                                </motion.div>
                            ))
                        ) : (
                            <div className="text-center py-12 text-slate-400">
                                <User size={48} className="mx-auto mb-3 opacity-20" />
                                <p>Data nasabah tidak ditemukan.</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div >
    );
}
