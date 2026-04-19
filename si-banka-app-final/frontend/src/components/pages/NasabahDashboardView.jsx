import React from 'react';
import { Phone, Calendar, MapPin, TrendingUp, Recycle, User, Package, Banknote, Scale, Award, ImageIcon } from 'lucide-react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { formatCurrency } from '../../utils/formatters';
import {
    AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

// Custom Modern Tooltip for Trend Chart
const TrendTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-gradient-to-br from-violet-900 to-purple-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-violet-700/50 backdrop-blur-sm animate-fadeIn min-w-[160px]">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center shadow-lg">
                        <TrendingUp size={14} className="text-white" />
                    </div>
                    <span className="font-bold text-sm">{label}</span>
                </div>
                <div className="bg-violet-950/50 rounded-lg p-2">
                    <div className="flex items-center justify-between gap-4">
                        <span className="text-violet-300 text-xs">Total Setoran</span>
                        <span className="font-bold text-white text-lg">{formatCurrency(payload[0].value)}</span>
                    </div>
                </div>
            </div>
        );
    }
    return null;
};

// Custom Modern Tooltip for Waste Composition Chart
const WasteComposeTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        const data = payload[0];
        return (
            <div className="bg-gradient-to-br from-emerald-900 to-green-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-emerald-700/50 backdrop-blur-sm animate-fadeIn min-w-[150px]">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-lg" style={{ backgroundColor: data.payload.color || '#22C55E' }}>
                        <Recycle size={14} className="text-white" />
                    </div>
                    <div>
                        <span className="font-bold text-sm block">{data.payload.fullName || data.name}</span>
                        <span className="text-[10px] text-emerald-300">Jenis Sampah</span>
                    </div>
                </div>
                <div className="bg-emerald-950/50 rounded-lg p-2">
                    <div className="flex items-center justify-between gap-4">
                        <span className="text-emerald-300 text-xs">Berat</span>
                        <span className="font-black text-xl text-white">{data.value} <span className="text-sm font-normal">kg</span></span>
                    </div>
                </div>
            </div>
        );
    }
    return null;
};

export function NasabahDashboardView({ customer, transactions, onContactAdmin }) {
    // Filter transaksi milik nasabah ini
    const myTransactions = transactions.filter(t => t.customerId === customer?.id);

    // Hitung statistik
    const totalBalance = parseFloat(customer?.balance || 0);
    const totalTransactions = myTransactions.length;
    const avgPerTransaction = totalTransactions > 0 ? totalBalance / totalTransactions : 0;

    // Hitung total berat sampah dan per jenis
    const getItemsFromTrx = (trx) => {
        return (typeof trx.items === 'string' ? JSON.parse(trx.items || '[]') : (trx.items || []));
    };

    const wasteBreakdown = {};
    let totalWeight = 0;

    myTransactions.forEach(trx => {
        const items = getItemsFromTrx(trx);
        items.forEach(item => {
            const qty = parseFloat(item.qty || 0);
            totalWeight += qty;
            if (item.name) {
                wasteBreakdown[item.name] = (wasteBreakdown[item.name] || 0) + qty;
            }
        });
    });

    // Pie chart data
    const COLORS = ['#22C55E', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'];
    const pieData = Object.entries(wasteBreakdown)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, value], idx) => ({
            name: name.length > 12 ? name.substring(0, 12) + '...' : name,
            fullName: name,
            value: parseFloat(value.toFixed(1)),
            color: COLORS[idx % COLORS.length]
        }));

    const sortedTransactions = [...myTransactions].sort((a, b) => new Date(b.date) - new Date(a.date));
    const lastTransaction = sortedTransactions[0];

    // Chart data
    const getMonthlyData = () => {
        const result = [];
        const now = new Date();
        for (let i = 3; i >= 0; i--) {
            const weekStart = new Date(now);
            weekStart.setDate(now.getDate() - (i * 7) - 6);
            const weekEnd = new Date(now);
            weekEnd.setDate(now.getDate() - (i * 7));
            const weekTransactions = myTransactions.filter(t => {
                const tDate = new Date(t.date);
                return tDate >= weekStart && tDate <= weekEnd;
            });
            const total = weekTransactions.reduce((sum, t) => sum + parseFloat(t.total || 0), 0);
            result.push({ name: `Minggu ${4 - i}`, total });
        }
        return result;
    };
    const monthlyData = getMonthlyData();
    const favoriteWaste = pieData.length > 0 ? pieData[0].fullName : null;

    // Photo URL helper
    const getPhotoUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('data:image')) return path;
        if (path.startsWith('http')) return path;
        return `/storage/${path}`;
    };

    // Hitung peringkat (simulasi)
    const getRank = () => {
        if (totalWeight >= 50) return { level: 'Emas', color: 'from-yellow-400 to-amber-500' };
        if (totalWeight >= 20) return { level: 'Perak', color: 'from-slate-300 to-slate-400' };
        if (totalWeight >= 5) return { level: 'Perunggu', color: 'from-orange-400 to-orange-600' };
        return { level: 'Pemula', color: 'from-green-400 to-emerald-500' };
    };
    const rank = getRank();

    // Waste icons mapping
    const getWasteIcon = (wasteName) => {
        const name = wasteName?.toLowerCase() || '';
        if (name.includes('plastik') || name.includes('botol')) return '🍾';
        if (name.includes('kertas') || name.includes('kardus')) return '📄';
        if (name.includes('logam') || name.includes('besi') || name.includes('kaleng')) return '🥫';
        if (name.includes('kaca') || name.includes('gelas')) return '🥛';
        if (name.includes('elektronik') || name.includes('hp')) return '📱';
        if (name.includes('minyak')) return '🛢️';
        if (name.includes('kain') || name.includes('tekstil')) return '👕';
        return '♻️';
    };

    return (
        <div className="animate-fadeIn pb-8 space-y-6">
            {/* Hero Balance Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 shadow-2xl shadow-purple-500/30"
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/30 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>

                <div className="relative z-10 p-6 md:p-8">
                    {/* Top: Profile + Welcome */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl overflow-hidden bg-white/20 border-2 border-white/30 flex-shrink-0 shadow-lg">
                                {customer?.photo_path ? (
                                    <img src={getPhotoUrl(customer.photo_path)} alt={customer.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-white/10">
                                        <User size={24} className="text-white/70" />
                                    </div>
                                )}
                            </div>
                            <div>
                                <p className="text-white/60 text-sm">Selamat datang,</p>
                                <h1 className="text-xl md:text-2xl font-bold text-white">{customer?.name || 'Nasabah'}</h1>
                            </div>
                        </div>
                        {/* Rank Badge */}
                        <div className={`bg-gradient-to-r ${rank.color} px-4 py-2 rounded-full shadow-lg`}>
                            <div className="flex items-center gap-2 text-white">
                                <Award size={16} />
                                <span className="font-bold text-sm">{rank.level}</span>
                            </div>
                        </div>
                    </div>

                    {/* Balance + Info Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Balance */}
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20">
                            <div className="flex items-center gap-2 text-white/60 text-sm mb-2">
                                <Banknote size={16} />
                                Total Saldo
                            </div>
                            <div className="text-4xl md:text-5xl font-black text-white mb-2">
                                <CountUp end={totalBalance} duration={2} prefix="Rp " separator="." decimals={0} />
                            </div>
                            {lastTransaction ? (
                                <p className="text-white/50 text-xs flex items-center gap-1">
                                    <Calendar size={12} />
                                    Update: {new Date(lastTransaction.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </p>
                            ) : (
                                <p className="text-white/50 text-xs">Belum ada transaksi</p>
                            )}
                        </div>

                        {/* Quick Stats Grid */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                                <div className="flex items-center gap-2 text-white/60 text-xs mb-1">
                                    <Package size={14} />
                                    Total Setoran
                                </div>
                                <p className="text-2xl font-bold text-white">
                                    <CountUp end={totalTransactions} duration={2} /> <span className="text-sm font-normal">kali</span>
                                </p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                                <div className="flex items-center gap-2 text-white/60 text-xs mb-1">
                                    <Scale size={14} />
                                    Total Berat
                                </div>
                                <p className="text-2xl font-bold text-white">
                                    <CountUp end={totalWeight} duration={2} decimals={1} /> <span className="text-sm font-normal">kg</span>
                                </p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                                <div className="flex items-center gap-2 text-white/60 text-xs mb-1">
                                    <TrendingUp size={14} />
                                    Rata-rata
                                </div>
                                <p className="text-xl font-bold text-white">{formatCurrency(avgPerTransaction)}</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                                <div className="flex items-center gap-2 text-white/60 text-xs mb-1">
                                    <MapPin size={14} />
                                    Lokasi
                                </div>
                                <p className="text-xl font-bold text-white">RT{customer?.rt}/{customer?.rw}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Trend Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="lg:col-span-3 bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-lg transition-all"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-lg font-bold text-slate-800">Tren Setoran Bulanan</h3>
                            <p className="text-slate-400 text-sm">Nilai setoran per minggu dalam sebulan terakhir</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-200">
                            <TrendingUp size={18} className="text-white" />
                        </div>
                    </div>

                    {totalTransactions > 0 ? (
                        <div className="h-[200px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={monthlyData}>
                                    <defs>
                                        <linearGradient id="colorGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.5} />
                                            <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 11 }} />
                                    <Tooltip content={<TrendTooltip />} cursor={{ stroke: 'rgba(139, 92, 246, 0.3)', strokeWidth: 2 }} />
                                    <Area type="monotone" dataKey="total" stroke="#8B5CF6" strokeWidth={3} fillOpacity={1} fill="url(#colorGrad)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="h-[200px] flex items-center justify-center bg-slate-50 rounded-2xl">
                            <div className="text-center">
                                <p className="text-3xl mb-2">📊</p>
                                <p className="text-slate-500 font-medium">Belum ada data transaksi</p>
                                <p className="text-slate-400 text-sm">Mulai setor sampah untuk melihat tren!</p>
                            </div>
                        </div>
                    )}
                </motion.div>

                {/* Waste Breakdown */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-lg transition-all"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-lg font-bold text-slate-800">Komposisi Sampah</h3>
                            <p className="text-slate-400 text-sm">Jenis sampah yang Anda setorkan</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-200">
                            <Recycle size={18} className="text-white" />
                        </div>
                    </div>

                    {pieData.length > 0 ? (
                        <>
                            <div className="h-[120px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={30} outerRadius={50} paddingAngle={4} dataKey="value">
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<WasteComposeTooltip />} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="space-y-2 mt-3">
                                {pieData.map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between text-sm p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg">{getWasteIcon(item.fullName)}</span>
                                            <span className="text-slate-700 font-medium">{item.name}</span>
                                        </div>
                                        <span className="font-bold text-slate-800">{item.value} kg</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="h-[200px] flex items-center justify-center bg-slate-50 rounded-2xl">
                            <div className="text-center">
                                <p className="text-3xl mb-2">♻️</p>
                                <p className="text-slate-400 text-sm">Belum ada data sampah</p>
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Transactions with Photos */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-lg transition-all"
                >
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Riwayat Transaksi</h3>

                    {sortedTransactions.length > 0 ? (
                        <div className="space-y-3">
                            {sortedTransactions.slice(0, 5).map((trx, idx) => {
                                const items = getItemsFromTrx(trx);
                                const itemNames = items.map(i => i.name).filter(Boolean);
                                const totalQty = items.reduce((sum, i) => sum + parseFloat(i.qty || 0), 0);
                                const mainWaste = itemNames[0] || 'Sampah';
                                const hasPhoto = trx.proof_image;

                                return (
                                    <div
                                        key={trx.id || idx}
                                        className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-slate-50 to-white border border-slate-100 hover:border-purple-200 hover:shadow-md transition-all"
                                    >
                                        {/* Photo or Icon */}
                                        <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0 shadow-md">
                                            {hasPhoto ? (
                                                <img
                                                    src={getPhotoUrl(trx.proof_image)}
                                                    alt="Bukti transaksi"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-100 to-teal-100">
                                                    <span className="text-2xl">{getWasteIcon(mainWaste)}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <p className="font-semibold text-slate-800 truncate">
                                                        {itemNames.length > 1
                                                            ? `${mainWaste} +${itemNames.length - 1} lainnya`
                                                            : mainWaste
                                                        }
                                                    </p>
                                                    <p className="text-slate-400 text-sm">
                                                        {new Date(trx.date).toLocaleDateString('id-ID', {
                                                            weekday: 'long',
                                                            day: 'numeric',
                                                            month: 'short',
                                                            year: 'numeric'
                                                        })}
                                                    </p>
                                                </div>
                                                <div className="text-right flex-shrink-0">
                                                    <p className="font-bold text-lg text-emerald-600">+{formatCurrency(trx.total)}</p>
                                                    <p className="text-slate-400 text-xs">{totalQty.toFixed(1)} kg</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-slate-50 rounded-2xl">
                            <p className="text-4xl mb-3">📦</p>
                            <p className="text-slate-500 font-medium">Belum ada transaksi</p>
                            <p className="text-slate-400 text-sm">Setor sampah ke bank sampah untuk mulai mendapatkan saldo!</p>
                        </div>
                    )}
                </motion.div>

                {/* Contact */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 rounded-3xl p-6 shadow-xl shadow-emerald-200/50 text-white relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>

                    <div className="relative z-10 h-full flex flex-col">
                        <h3 className="text-xl font-bold mb-2">Butuh Bantuan?</h3>
                        <p className="text-emerald-100 text-sm mb-4 flex-1">
                            Hubungi admin untuk informasi setoran, penarikan saldo, atau pertanyaan lainnya.
                        </p>

                        {favoriteWaste && (
                            <div className="bg-white/15 rounded-xl p-4 mb-4 border border-white/20">
                                <p className="text-white/60 text-xs mb-1">Sampah favorit Anda</p>
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl">{getWasteIcon(favoriteWaste)}</span>
                                    <p className="text-white font-bold">{favoriteWaste}</p>
                                </div>
                            </div>
                        )}

                        <button
                            onClick={onContactAdmin}
                            className="w-full bg-white text-emerald-600 px-6 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
                        >
                            <Phone size={18} /> Hubungi Admin
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
