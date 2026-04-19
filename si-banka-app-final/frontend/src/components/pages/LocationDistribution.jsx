import React from 'react';
import { MapPin, Building2, Users, Map } from 'lucide-react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import CountUp from 'react-countup';

/**
 * LocationDistribution - Shows nasabah distribution by location
 * - Super Admin Kota: Distribution by Kecamatan
 * - Super Admin RT / Admin RT: Distribution by Kelurahan/RW in their Kecamatan
 */
export function LocationDistribution({ locationStats, isLoading }) {
    if (isLoading) {
        return (
            <div className="glass-card p-6 animate-pulse">
                <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
                <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-16 bg-slate-200 rounded-xl"></div>
                    ))}
                </div>
            </div>
        );
    }

    if (!locationStats) return null;

    const isSuperAdminKota = locationStats.type === 'kota';
    const { summary, distribution } = locationStats;

    // Color palette for bars
    const colors = [
        'from-blue-500 to-cyan-500',
        'from-emerald-500 to-teal-500',
        'from-purple-500 to-pink-500',
        'from-amber-500 to-orange-500',
        'from-rose-500 to-red-500',
        'from-indigo-500 to-violet-500',
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="glass-card overflow-hidden"
        >
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                    <Map size={20} className="text-white" />
                </div>
                <div>
                    <h3 className="text-white font-bold">
                        {isSuperAdminKota ? 'Sebaran Nasabah per Kecamatan' : `Sebaran di ${summary.kecamatan || 'Kecamatan'}`}
                    </h3>
                    <p className="text-white/70 text-xs">
                        {isSuperAdminKota
                            ? `${summary.total_kecamatan || 0} Kecamatan • ${summary.total_bank_sampah || 0} Bank Sampah`
                            : `${summary.total_kelurahan || 0} Kelurahan • ${summary.total_bank_sampah || 0} Bank Sampah`
                        }
                    </p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-3 p-4 border-b border-slate-100">
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-3 rounded-xl text-center border border-blue-100">
                    <div className="text-2xl font-bold text-blue-600">
                        <CountUp end={isSuperAdminKota ? summary.total_kecamatan || 0 : summary.total_kelurahan || 0} duration={1.5} />
                    </div>
                    <p className="text-xs text-blue-500 font-medium">{isSuperAdminKota ? 'Kecamatan' : 'Kelurahan'}</p>
                </div>
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-3 rounded-xl text-center border border-emerald-100">
                    <div className="text-2xl font-bold text-emerald-600">
                        <CountUp end={summary.total_bank_sampah || 0} duration={1.5} />
                    </div>
                    <p className="text-xs text-emerald-500 font-medium">Bank Sampah</p>
                </div>
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-3 rounded-xl text-center border border-amber-100">
                    <div className="text-2xl font-bold text-amber-600">
                        <CountUp end={summary.total_nasabah || 0} duration={1.5} />
                    </div>
                    <p className="text-xs text-amber-500 font-medium">Nasabah</p>
                </div>
            </div>

            {/* Distribution List */}
            <div className="p-4 space-y-3 max-h-[300px] overflow-y-auto">
                {distribution && distribution.length > 0 ? (
                    distribution.map((item, index) => {
                        const maxNasabah = Math.max(...distribution.map(d => d.total_nasabah || 0));
                        const percentage = maxNasabah > 0 ? ((item.total_nasabah || 0) / maxNasabah) * 100 : 0;
                        const colorClass = colors[index % colors.length];

                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 * index }}
                                className="bg-white rounded-xl border border-slate-100 p-3 hover:shadow-md transition-all group"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${colorClass} flex items-center justify-center`}>
                                            <MapPin size={14} className="text-white" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-700 text-sm">
                                                {isSuperAdminKota ? item.kecamatan : item.kelurahan}
                                            </p>
                                            {!isSuperAdminKota && (
                                                <p className="text-[10px] text-slate-400">
                                                    {item.total_rw || 0} RW • {item.total_bank_sampah || 0} Bank Sampah
                                                </p>
                                            )}
                                            {isSuperAdminKota && (
                                                <p className="text-[10px] text-slate-400">
                                                    {item.total_kelurahan || 0} Kel • {item.total_bank_sampah || 0} BS
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className={`font-bold text-lg bg-gradient-to-r ${colorClass} bg-clip-text text-transparent`}>
                                            {item.total_nasabah || 0}
                                        </span>
                                        <p className="text-[10px] text-slate-400">nasabah</p>
                                    </div>
                                </div>
                                {/* Progress Bar */}
                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${percentage}%` }}
                                        transition={{ duration: 0.8, delay: 0.2 * index }}
                                        className={`h-full bg-gradient-to-r ${colorClass} rounded-full`}
                                    />
                                </div>
                            </motion.div>
                        );
                    })
                ) : (
                    <div className="text-center py-8 text-slate-400">
                        <MapPin size={32} className="mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Belum ada data sebaran lokasi</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
