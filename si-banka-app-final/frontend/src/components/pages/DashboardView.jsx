import React from 'react';
import { Users, Trash2, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { formatCurrency } from '../../utils/formatters';
import { LocationDistribution } from './LocationDistribution';



export function DashboardView({ customers, allTransactions, weeklyTrendData, onAddCustomer, onUpdatePrice, onContactAdmin, isNasabah, locationStats }) {
    // Helper to extract total weight from a transaction
    const getTrxWeight = (trx) => {
        const items = (typeof trx.items === 'string' ? JSON.parse(trx.items || '[]') : (trx.items || []));
        return items.reduce((sum, item) => sum + parseFloat(item.qty || 0), 0);
    };

    // 1. Calculate Customer Stats (Growth This Month)
    const totalCustomers = customers.length;
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Count customers created this month vs last month
    let thisMonthCount = 0;
    let lastMonthCount = 0;

    customers.forEach(c => {
        const d = new Date(c.created_at || c.updated_at); // Fallback to updated_at if created_at missing
        if (isNaN(d.getTime())) return;

        if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
            thisMonthCount++;
        } else {
            // Check if last month
            const lastMonthDate = new Date(now);
            lastMonthDate.setMonth(now.getMonth() - 1);
            if (d.getMonth() === lastMonthDate.getMonth() && d.getFullYear() === lastMonthDate.getFullYear()) {
                lastMonthCount++;
            }
        }
    });

    // Calculate Customer Growth Percentage
    let customerGrowth = 0;
    if (lastMonthCount > 0) {
        customerGrowth = ((thisMonthCount - lastMonthCount) / lastMonthCount) * 100;
    } else if (thisMonthCount > 0) {
        customerGrowth = 100; // If previous was 0 and now we have some, it's 100% growth
    }

    // 2. Calculate Waste Stats (Growth This Week vs Last Week)
    // [LOGIKA DASHBOARD] Menghitung Total Sampah Terkumpul
    // Menggunakan fungsi .reduce() untuk menjumlahkan berat seluruh transaksi yang pernah ada.
    // getTrxWeight() mengambil berat item dari setiap transaksi.
    const totalWasteKg = allTransactions.reduce((acc, trx) => acc + getTrxWeight(trx), 0);

    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const fourteenDaysAgo = new Date(now);
    fourteenDaysAgo.setDate(now.getDate() - 14);
    fourteenDaysAgo.setHours(0, 0, 0, 0);

    let thisWeekWaste = 0;
    let lastWeekWaste = 0;

    allTransactions.forEach(trx => {
        const d = new Date(trx.created_at || trx.date);
        if (isNaN(d.getTime())) return;
        const weight = getTrxWeight(trx);

        if (d >= sevenDaysAgo) {
            thisWeekWaste += weight;
        } else if (d >= fourteenDaysAgo && d < sevenDaysAgo) {
            lastWeekWaste += weight;
        }
    });

    let wasteGrowth = 0;
    if (lastWeekWaste > 0) {
        wasteGrowth = ((thisWeekWaste - lastWeekWaste) / lastWeekWaste) * 100;
    } else if (thisWeekWaste > 0) {
        wasteGrowth = 100;
    }


    const todayTransactions = allTransactions.filter(t => {
        const d = new Date(t.created_at || t.date);
        return d.toDateString() === now.toDateString();
    }).length;

    // [LOGIKA DASHBOARD] Menghitung Total Saldo Semua Nasabah
    // Mengambil semua data nasabah, lalu menjumlahkan kolom 'balance' masing-masing.
    // parseFloat() memastikan data dianggap angka (bukan teks).
    const totalBalance = customers.reduce((sum, c) => sum + parseFloat(c.balance || 0), 0);

    return (
        <div className="animate-fadeIn pb-8">
            {/* Bento Grid Layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 mt-4 md:mt-0">
                {/* Nasabah Card - Blue Gradient */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="relative overflow-hidden rounded-[2rem] p-5 shadow-xl bg-gradient-to-br from-blue-500 to-cyan-400 text-white group hover:scale-[1.02] transition-transform duration-300 min-h-[160px] flex flex-col justify-between"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-20 transform translate-x-2 -translate-y-2 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
                        <Users size={80} />
                    </div>
                    <div className="relative z-10">
                        <div className="bg-white/20 w-fit p-2.5 rounded-2xl mb-3 backdrop-blur-sm">
                            <Users size={20} className="text-white" />
                        </div>
                        <h3 className="text-white/80 font-medium text-xs tracking-wide uppercase mb-0.5">Total Nasabah</h3>
                        <div className="text-3xl font-extrabold tracking-tight">
                            <CountUp end={totalCustomers} duration={2} />
                        </div>
                    </div>
                    <div className="relative z-10 mt-auto">
                        <div className="flex items-center gap-1.5 text-blue-50 text-[10px] font-medium bg-white/10 w-fit px-2 py-0.5 rounded-lg backdrop-blur-sm">
                            <span className="bg-white/20 p-0.5 rounded flex items-center gap-1">
                                {customerGrowth >= 0 ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                                {Math.abs(customerGrowth).toFixed(0)}%
                            </span>
                            <span>Bulan ini</span>
                        </div>
                    </div>
                </motion.div>

                {/* Sampah Card - Emerald Gradient */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="relative overflow-hidden rounded-[2rem] p-5 shadow-xl bg-gradient-to-br from-emerald-500 to-teal-400 text-white group hover:scale-[1.02] transition-transform duration-300 min-h-[160px] flex flex-col justify-between"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-20 transform translate-x-2 -translate-y-2 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
                        <Trash2 size={80} />
                    </div>
                    <div className="relative z-10">
                        <div className="bg-white/20 w-fit p-2.5 rounded-2xl mb-3 backdrop-blur-sm">
                            <Trash2 size={20} className="text-white" />
                        </div>
                        <h3 className="text-white/80 font-medium text-xs tracking-wide uppercase mb-0.5">Terkumpul</h3>
                        <div className="text-3xl font-extrabold tracking-tight flex items-baseline gap-1">
                            <CountUp end={totalWasteKg} duration={2} /> <span className="text-lg font-bold opacity-80">kg</span>
                        </div>
                    </div>
                    <div className="relative z-10 mt-auto">
                        <div className="flex items-center gap-1.5 text-emerald-50 text-[10px] font-medium bg-white/10 w-fit px-2 py-0.5 rounded-lg backdrop-blur-sm">
                            <span className="bg-white/20 p-0.5 rounded flex items-center gap-1">
                                {wasteGrowth >= 0 ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                                {Math.abs(wasteGrowth).toFixed(1)}%
                            </span>
                            <span>Minggu ini</span>
                        </div>
                    </div>
                </motion.div>

                {/* Transaksi Card - Purple/Pink Gradient */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="relative overflow-hidden rounded-[2rem] p-5 shadow-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white group hover:scale-[1.02] transition-transform duration-300 min-h-[160px] flex flex-col justify-between"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-20 transform translate-x-2 -translate-y-2 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
                        <Activity size={80} />
                    </div>
                    <div className="relative z-10">
                        <div className="bg-white/20 w-fit p-2.5 rounded-2xl mb-3 backdrop-blur-sm">
                            <Activity size={20} className="text-white" />
                        </div>
                        <h3 className="text-white/80 font-medium text-xs tracking-wide uppercase mb-0.5">Transaksi Hari Ini</h3>
                        <div className="text-3xl font-extrabold tracking-tight">
                            <CountUp end={todayTransactions} duration={2} />
                        </div>
                    </div>
                    <div className="relative z-10 mt-auto">
                        <div className="text-purple-50 text-[10px] font-medium bg-white/10 w-fit px-2 py-1 rounded-lg backdrop-blur-sm">
                            <span>{new Date().toLocaleDateString('id-ID', { weekday: 'long' })}</span>
                        </div>
                    </div>
                </motion.div>

                {/* Saldo Card - Amber/Orange Gradient */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="relative overflow-hidden rounded-[2rem] p-5 shadow-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white group hover:scale-[1.02] transition-transform duration-300 min-h-[160px] flex flex-col justify-between"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-20 transform translate-x-2 -translate-y-2 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
                        <Users size={80} />
                    </div>
                    <div className="relative z-10">
                        <div className="bg-white/20 w-fit p-2.5 rounded-2xl mb-3 backdrop-blur-sm">
                            <Users size={20} className="text-white" />
                        </div>
                        <h3 className="text-white/80 font-medium text-xs tracking-wide uppercase mb-0.5">Total Saldo</h3>
                        <div className="text-2xl font-extrabold tracking-tight truncate leading-tight">
                            {formatCurrency(totalBalance)}
                        </div>
                    </div>
                    <div className="relative z-10 mt-auto">
                        <div className="mt-2 text-amber-50 text-[10px] font-medium bg-white/10 w-fit px-2 py-1 rounded-lg backdrop-blur-sm">
                            <span>Realtime Update</span>
                        </div>
                    </div>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Chart Section (Mockup) */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="glass-card p-8 lg:col-span-2"
                >
                    <div className="flex justify-between items-end mb-8">
                        <div>
                            <h3 className="text-xl font-bold text-slate-800">Tren Setoran Sampah</h3>
                            <p className="text-slate-500 text-sm">Statistik minggu ini (kg)</p>
                        </div>
                        <div className="flex gap-2">
                            <div className="flex items-center gap-1 text-xs text-slate-500"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Total</div>
                        </div>
                    </div>

                    <div className="h-64 flex items-end justify-between gap-4 mt-8">
                        {weeklyTrendData.map((data, index) => {
                            // Find absolute max value to normalize height (100%)
                            const maxVal = Math.max(...weeklyTrendData.map(d => d.value));
                            // Prevent division by zero, default to 10 if max is 0
                            const safeMax = maxVal > 0 ? maxVal : 10;

                            // Calculate percentage
                            let percentage = (data.value / safeMax) * 100;

                            // Visual fix: If value > 0, make sure bar is at least 5% high so it's visible
                            if (data.value > 0 && percentage < 5) percentage = 5;

                            return (
                                <div key={index} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer relative h-full justify-end">
                                    {/* Value Label (Visible on Hover or always if value > 0) */}
                                    <div className={`text-xs font-bold text-slate-700 mb-1 transition-opacity ${data.value > 0 ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                        {data.value}kg
                                    </div>

                                    {/* Bar Container */}
                                    <div className="w-full bg-slate-200/70 rounded-t-xl relative overflow-hidden h-full flex items-end ring-1 ring-slate-300/50">
                                        {/* Colored Bar */}
                                        <div
                                            className="w-full bg-gradient-to-t from-emerald-600 to-teal-500 rounded-t-xl transition-all duration-500 ease-out hover:opacity-90 shadow-lg shadow-emerald-500/20"
                                            style={{ height: `${percentage}%` }}
                                        ></div>
                                    </div>

                                    {/* Day Label */}
                                    <span className="text-xs font-bold text-slate-600">{data.day}</span>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>

                {/* Right Side Panel - e.g., Top Contributors or Quick Actions */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                    className="glass-card p-6 flex flex-col"
                >
                    <h3 className="text-lg font-bold text-slate-800 mb-6">Aksi Cepat</h3>
                    <div className="space-y-4 flex-1">
                        {!isNasabah && (
                            <>
                                <button onClick={onAddCustomer} className="w-full p-4 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl font-semibold flex items-center gap-3 transition-colors text-left font-bold">
                                    <Users size={18} /> Tambah Nasabah Baru
                                </button>
                                <button onClick={onUpdatePrice} className="w-full p-4 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-xl font-semibold flex items-center gap-3 transition-colors text-left font-bold">
                                    <Trash2 size={18} /> Update Harga Sampah
                                </button>
                            </>
                        )}
                        <div className="mt-8 p-4 bg-gradient-to-br from-emerald-500 to-teal-700 rounded-2xl text-white shadow-lg shadow-emerald-500/30">
                            <h4 className="font-bold text-lg mb-1">Butuh Bantuan?</h4>
                            <p className="text-emerald-100 text-xs mb-4">Hubungi tim support jika ada kendala.</p>
                            <button onClick={onContactAdmin} className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-4 py-2 rounded-lg text-sm font-semibold w-full">Hubungi Admin</button>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Location Distribution Section */}
            {locationStats && (
                <div className="mt-8">
                    <LocationDistribution locationStats={locationStats} isLoading={false} />
                </div>
            )}
        </div>
    );
}
