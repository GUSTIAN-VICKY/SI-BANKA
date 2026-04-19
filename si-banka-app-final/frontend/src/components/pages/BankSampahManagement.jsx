import { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import {
    Building2, MapPin, Users, Receipt, Search,
    CheckCircle, XCircle, Globe
} from 'lucide-react';
import { API_BASE_URL, authHeaders } from '../../utils/constants';

const BankSampahManagement = ({ currentUser }) => {
    const [bankSampahList, setBankSampahList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState('all'); // all, active, inactive
    const [statistics, setStatistics] = useState(null);

    useEffect(() => {
        fetchBankSampah();
        fetchStatistics();
    }, []);

    const fetchBankSampah = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/bank-sampah`, {
                headers: authHeaders(),
            });
            if (!response.ok) throw new Error('Failed to fetch');
            const data = await response.json();
            setBankSampahList(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchStatistics = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/bank-sampah/statistics`, {
                headers: authHeaders(),
            });
            if (response.ok) {
                const data = await response.json();
                setStatistics(data);
            }
        } catch (err) {
            console.error('Failed to fetch statistics:', err);
        }
    };

    const filteredList = bankSampahList.filter(bs => {
        const matchesSearch = bs.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            bs.kota.toLowerCase().includes(searchQuery.toLowerCase()) ||
            `RT ${bs.rt}/RW ${bs.rw}`.includes(searchQuery);
        const matchesFilter = filter === 'all' ||
            (filter === 'active' && bs.is_active) ||
            (filter === 'inactive' && !bs.is_active);
        return matchesSearch && matchesFilter;
    });

    const isSuperAdminKota = currentUser?.role === 'super_admin_kota' || currentUser?.role === 'super_admin';

    return (
        <div className="p-4 md:p-6 space-y-6 animate-fadeIn">
            {/* Header Removed to match Dashboard layout consistency */}

            {/* Statistics Cards - Only for Super Admin Kota */}
            {isSuperAdminKota && statistics && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-5 text-white shadow-lg"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-100 text-sm font-medium uppercase tracking-wider">Total Bank Sampah</p>
                                <h3 className="text-3xl font-black mt-1">{statistics.total_bank_sampah}</h3>
                            </div>
                            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                                <Building2 size={24} />
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-5 text-white shadow-lg"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-emerald-100 text-sm font-medium uppercase tracking-wider">Aktif</p>
                                <h3 className="text-3xl font-black mt-1">{statistics.total_active}</h3>
                            </div>
                            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                                <CheckCircle size={24} />
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-5 text-white shadow-lg"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-purple-100 text-sm font-medium uppercase tracking-wider">Kota</p>
                                <h3 className="text-3xl font-black mt-1">{statistics.by_kota?.length || 0}</h3>
                            </div>
                            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                                <Globe size={24} />
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                        placeholder="Cari nama, kota, atau lokasi..."
                    />
                </div>

                {isSuperAdminKota && (
                    <div className="flex gap-2">
                        {['all', 'active', 'inactive'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-3 rounded-xl font-medium transition-all ${filter === f
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                                    }`}
                            >
                                {f === 'all' ? 'Semua' : f === 'active' ? 'Aktif' : 'Non-Aktif'}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Bank Sampah List */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                        <p className="text-slate-500 font-medium">Memuat data...</p>
                    </div>
                </div>
            ) : error ? (
                <div className="text-center py-20 bg-red-50 rounded-2xl">
                    <XCircle size={48} className="text-red-400 mx-auto mb-4" />
                    <p className="text-red-600 font-medium">{error}</p>
                </div>
            ) : filteredList.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 rounded-2xl">
                    <Building2 size={48} className="text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 font-medium">Tidak ada Bank Sampah ditemukan</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    <AnimatePresence>
                        {filteredList.map((bs, index) => (
                            <motion.div
                                key={bs.id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ delay: index * 0.05 }}
                                whileHover={{ y: -6, scale: 1.01 }}
                                className={`bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all relative group border ${bs.is_active ? 'border-emerald-100' : 'border-red-100'
                                    }`}
                            >
                                {/* Status Bar */}
                                <div className={`h-1.5 ${bs.is_active ? 'bg-gradient-to-r from-emerald-400 to-teal-500' : 'bg-gradient-to-r from-red-400 to-orange-500'}`} />

                                <div className="p-5">
                                    {/* Header */}
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${bs.is_active ? 'bg-gradient-to-br from-emerald-400 to-teal-500' : 'bg-gradient-to-br from-slate-300 to-slate-400'
                                            }`}>
                                            <Building2 size={28} className="text-white" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-slate-800 text-lg leading-tight truncate">{bs.name}</h3>
                                            <p className="text-slate-500 text-sm flex items-center gap-1 mt-1">
                                                <MapPin size={14} />
                                                RT {bs.rt}/RW {bs.rw}, {bs.kota}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Stats */}
                                    <div className="grid grid-cols-3 gap-3 mb-4">
                                        <div className="bg-blue-50 rounded-xl p-3 text-center">
                                            <Users size={18} className="text-blue-500 mx-auto mb-1" />
                                            <p className="text-lg font-black text-blue-600">{bs.customers_count || 0}</p>
                                            <p className="text-xs text-blue-400">Nasabah</p>
                                        </div>
                                        <div className="bg-emerald-50 rounded-xl p-3 text-center">
                                            <Receipt size={18} className="text-emerald-500 mx-auto mb-1" />
                                            <p className="text-lg font-black text-emerald-600">{bs.transactions_count || 0}</p>
                                            <p className="text-xs text-emerald-400">Transaksi</p>
                                        </div>
                                        <div className="bg-purple-50 rounded-xl p-3 text-center">
                                            <Users size={18} className="text-purple-500 mx-auto mb-1" />
                                            <p className="text-lg font-black text-purple-600">{bs.users_count || 0}</p>
                                            <p className="text-xs text-purple-400">Admin</p>
                                        </div>
                                    </div>

                                    {/* Location Details */}
                                    <div className="bg-slate-50 rounded-xl p-3 space-y-1">
                                        {bs.kelurahan && (
                                            <p className="text-sm text-slate-600">
                                                <span className="font-medium">Kelurahan:</span> {bs.kelurahan}
                                            </p>
                                        )}
                                        {bs.kecamatan && (
                                            <p className="text-sm text-slate-600">
                                                <span className="font-medium">Kecamatan:</span> {bs.kecamatan}
                                            </p>
                                        )}
                                        <p className="text-sm text-slate-600">
                                            <span className="font-medium">Kota:</span> {bs.kota}
                                        </p>
                                    </div>

                                    {/* Status Badge */}
                                    <div className="flex items-center justify-between mt-4">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${bs.is_active
                                            ? 'bg-emerald-100 text-emerald-700'
                                            : 'bg-red-100 text-red-700'
                                            }`}>
                                            {bs.is_active ? <CheckCircle size={14} /> : <XCircle size={14} />}
                                            {bs.is_active ? 'Aktif' : 'Non-Aktif'}
                                        </span>

                                        {bs.super_admin && (
                                            <span className="text-xs text-slate-400">
                                                Admin: {bs.super_admin.name}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
};

export default BankSampahManagement;
