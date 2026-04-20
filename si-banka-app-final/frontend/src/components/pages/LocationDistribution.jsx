import React, { useState } from 'react';
import { MapPin, Map, BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CountUp from 'react-countup';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
    PieChart, Pie, Legend
} from 'recharts';

/**
 * Custom Tooltips for Recharts
 */
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white/95 backdrop-blur-xl p-4 text-left rounded-2xl shadow-2xl border border-slate-100 min-w-[180px]">
                <p className="font-extrabold text-slate-800 mb-3 border-b border-slate-100 pb-2">{label || payload[0].payload.name}</p>
                <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full shadow-inner" style={{ backgroundColor: payload[0].payload.fillColor }} />
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Populasi</span>
                        <span className="font-black text-xl text-slate-700">{payload[0].value} <span className="text-xs text-slate-500 font-bold">Jiwa</span></span>
                    </div>
                </div>
                {payload[0].payload.total_bank_sampah !== undefined && (
                   <div className="mt-3 pt-2 border-t border-slate-50 flex justify-between items-center">
                       <span className="text-[10px] font-bold text-slate-400">UNIT BANK:</span>
                       <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">{payload[0].payload.total_bank_sampah}</span>
                   </div>
                )}
            </div>
        );
    }
    return null;
};

// Colors mapping for charts to look vibrant
const CHART_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#8b5cf6', '#f43f5e', '#14b8a6'];

export function LocationDistribution({ locationStats, isLoading }) {
    const [viewMode, setViewMode] = useState('bar'); // 'bar' or 'pie'

    if (isLoading) {
        return (
             <div className="glass-card p-6 animate-pulse">
                <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
                <div className="h-[400px] bg-slate-100 rounded-2xl"></div>
             </div>
        );
    }

    if (!locationStats) return null;

    const isSuperAdminKota = locationStats.type === 'kota';
    const { summary, distribution } = locationStats;

    // Filter out zero-data entirely or keep them? Keeping them shows the locations but charts look better filtering completely empty ones
    const chartData = (distribution || []).map((item, index) => ({
        name: isSuperAdminKota ? item.kecamatan : item.kelurahan,
        Nasabah: item.total_nasabah || 0,
        total_bank_sampah: item.total_bank_sampah || 0,
        fillColor: CHART_COLORS[index % CHART_COLORS.length]
    }));

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, type: 'spring', stiffness: 50 }}
            className="glass-card overflow-hidden shadow-xl"
        >
             {/* Dynamic Aesthetic Header */}
            <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 p-5 flex items-center justify-between relative overflow-hidden">
                {/* Decorative glow */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-400/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />
                
                <div className="flex items-center gap-4 relative z-10">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-[0_8px_16px_rgb(0_0_0/0.15)] border border-white/20">
                        <Map size={22} className="text-white drop-shadow-md" />
                    </div>
                    <div>
                        <h3 className="text-white font-black text-xl tracking-tight drop-shadow-md">
                            {isSuperAdminKota ? 'Distribusi Wilayah Kecamatan' : `Distribusi Area ${summary.kecamatan || ''}`}
                        </h3>
                        <p className="text-indigo-100 text-xs font-semibold tracking-wider mt-0.5 opacity-90">
                            VISUALISASI STATISTIK NASABAH
                        </p>
                    </div>
                </div>

                {/* Interactive Chart Toggles */}
                <div className="flex bg-black/20 backdrop-blur-md rounded-xl p-1.5 relative z-10 border border-white/10 shadow-inner">
                    <button 
                        onClick={() => setViewMode('bar')}
                        className={`p-2 rounded-lg transition-all duration-300 ${viewMode === 'bar' ? 'bg-white text-indigo-600 shadow-lg scale-100' : 'text-white/60 hover:text-white hover:bg-white/10 scale-95'}`}
                        title="Tampilan Grafik Bar"
                    >
                        <BarChart3 size={18} strokeWidth={viewMode === 'bar' ? 3 : 2} />
                    </button>
                    <button 
                        onClick={() => setViewMode('pie')}
                        className={`p-2 rounded-lg transition-all duration-300 ${viewMode === 'pie' ? 'bg-white text-fuchsia-600 shadow-lg scale-100' : 'text-white/60 hover:text-white hover:bg-white/10 scale-95'}`}
                        title="Tampilan Grafik Donut"
                    >
                        <PieChartIcon size={18} strokeWidth={viewMode === 'pie' ? 3 : 2} />
                    </button>
                </div>
            </div>

            {/* Top Summaries Board */}
            <div className="grid grid-cols-3 divide-x divide-slate-100 border-b border-slate-100 bg-slate-50/80">
                <div className="p-4 sm:p-5 text-center hover:bg-white transition-colors cursor-default group">
                    <p className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest mb-1 group-hover:text-indigo-500 transition-colors">{isSuperAdminKota ? 'Kecamatan' : 'Kelurahan'}</p>
                    <div className="text-2xl sm:text-3xl font-black text-indigo-600 drop-shadow-sm">
                        <CountUp end={isSuperAdminKota ? summary.total_kecamatan || 0 : summary.total_kelurahan || 0} duration={2} />
                    </div>
                </div>
                <div className="p-4 sm:p-5 text-center hover:bg-white transition-colors cursor-default group">
                    <p className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest mb-1 group-hover:text-emerald-500 transition-colors">Bank Sampah</p>
                    <div className="text-2xl sm:text-3xl font-black text-emerald-500 drop-shadow-sm">
                        <CountUp end={summary.total_bank_sampah || 0} duration={2} />
                    </div>
                </div>
                <div className="p-4 sm:p-5 text-center hover:bg-white transition-colors cursor-default group">
                    <p className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest mb-1 group-hover:text-rose-500 transition-colors">Nasabah Aktif</p>
                    <div className="text-2xl sm:text-3xl font-black text-rose-500 drop-shadow-sm">
                        <CountUp end={summary.total_nasabah || 0} duration={2} separator="," />
                    </div>
                </div>
            </div>

            {/* Core Chart Canvas Area */}
            <div className="p-5 sm:p-6 bg-white relative">
                {chartData.length > 0 ? (
                    <div className="h-[360px] w-full mt-2">
                        <AnimatePresence mode="wait">
                            {viewMode === 'bar' ? (
                                <motion.div 
                                    key="bar"
                                    initial={{ opacity: 0, scale: 0.98, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.98, y: -10 }}
                                    transition={{ duration: 0.4, type: 'spring' }}
                                    className="h-full w-full"
                                >
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData} margin={{ top: 20, right: 20, left: -20, bottom: 5 }} barSize={38}>
                                            <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
                                            <XAxis 
                                                dataKey="name" 
                                                axisLine={false} 
                                                tickLine={false} 
                                                tick={{ fill: '#64748b', fontSize: 13, fontWeight: 700 }} 
                                                dy={15}
                                            />
                                            <YAxis 
                                                axisLine={false} 
                                                tickLine={false} 
                                                tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }} 
                                                dx={-10}
                                            />
                                            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc', opacity: 0.6 }} />
                                            <Bar 
                                                dataKey="Nasabah" 
                                                radius={[8, 8, 8, 8]}
                                                animationDuration={1500}
                                                animationEasing="ease-out"
                                            >
                                                {chartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.fillColor} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </motion.div>
                            ) : (
                                <motion.div 
                                    key="pie"
                                    initial={{ opacity: 0, scale: 0.9, rotate: -15 }}
                                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                    exit={{ opacity: 0, scale: 0.9, rotate: 15 }}
                                    transition={{ duration: 0.5, type: 'spring', bounce: 0.4 }}
                                    className="h-full w-full flex items-center justify-center p-2"
                                >
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Tooltip content={<CustomTooltip />} />
                                            <Legend 
                                                verticalAlign="bottom" 
                                                height={40} 
                                                iconType="circle" 
                                                wrapperStyle={{ fontSize: '13px', fontWeight: 700, color: '#475569', paddingTop: '10px' }} 
                                            />
                                            <Pie
                                                data={chartData}
                                                cx="50%"
                                                cy="45%"
                                                innerRadius={75}
                                                outerRadius={120}
                                                paddingAngle={6}
                                                dataKey="Nasabah"
                                                stroke="none"
                                                animationDuration={1200}
                                                animationEasing="ease-out"
                                                cornerRadius={6}
                                            >
                                                {chartData.map((entry, index) => (
                                                    <Cell 
                                                        key={`cell-${index}`} 
                                                        fill={entry.fillColor} 
                                                        style={{ filter: `drop-shadow(0px 4px 6px ${entry.fillColor}40)` }}
                                                    />
                                                ))}
                                            </Pie>
                                        </PieChart>
                                    </ResponsiveContainer>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ) : (
                    <div className="text-center py-20 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                        <div className="w-20 h-20 bg-white rounded-full shadow-lg flex items-center justify-center mx-auto mb-5 border border-slate-100">
                            <MapPin size={36} className="text-indigo-300" />
                        </div>
                        <p className="text-xl font-black text-slate-700">Belum Ada Data</p>
                        <p className="text-sm font-semibold text-slate-400 mt-2 max-w-sm mx-auto leading-relaxed">
                            Sistem belum mencatat metrik persebaran nasabah di area ini. Grafik akan muncul secara otomatis.
                        </p>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
