import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, MapPin, Save, Loader2, User, Building2, ChevronDown } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export function EditCustomerModal({ customer, onClose, onSuccess }) {
    const [alamat, setAlamat] = useState(customer?.alamat || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [bankSampahList, setBankSampahList] = useState([]);
    const [loadingBankSampah, setLoadingBankSampah] = useState(true);

    // Fetch Bank Sampah list for alamat dropdown
    useEffect(() => {
        const fetchBankSampah = async () => {
            try {
                const token = localStorage.getItem('authToken') || localStorage.getItem('token');
                const response = await fetch(`${API_BASE_URL}/bank-sampah`, {
                    headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
                });
                const data = await response.json();
                if (data.data) {
                    setBankSampahList(data.data);
                }
            } catch (err) {
                console.error('Failed to fetch bank sampah:', err);
            } finally {
                setLoadingBankSampah(false);
            }
        };
        fetchBankSampah();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!alamat) { setError("Pilih alamat terlebih dahulu!"); return; }
        setError(null);
        setLoading(true);

        try {
            const token = localStorage.getItem('authToken') || localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/customers/${customer.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ alamat })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Gagal menyimpan alamat');
            }

            onSuccess(data.data || data);
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Get unique addresses from Bank Sampah list
    const uniqueAddresses = [...new Set(bankSampahList.filter(bs => bs.alamat).map(bs => bs.alamat))];

    return createPortal(
        <div className="fixed inset-0 bg-gradient-to-br from-slate-900/80 via-slate-900/70 to-blue-900/50 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-fadeIn">
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-slideUp">
                {/* Gradient Header */}
                <div className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 p-5 relative overflow-hidden flex-shrink-0">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                    <button
                        onClick={onClose}
                        type="button"
                        className="absolute right-3 top-3 z-20 text-white/90 hover:text-white bg-white/20 hover:bg-white/40 rounded-full p-2.5 transition-all backdrop-blur-sm cursor-pointer"
                    >
                        <X size={20} />
                    </button>

                    <div className="flex items-center gap-3 relative z-10">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                            <MapPin size={24} className="text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-white">Edit Alamat</h3>
                            <p className="text-white/80 text-sm">Pilih alamat dari Bank Sampah</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-5">
                    {/* Customer Info with Photo */}
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl mb-4">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-200 to-slate-300 border-2 border-white shadow-md flex-shrink-0">
                            {customer?.photo_path ? (
                                <img
                                    src={customer.photo_path.startsWith('http') || customer.photo_path.startsWith('data:')
                                        ? customer.photo_path
                                        : `${import.meta.env.VITE_STORAGE_URL || 'http://localhost:8000/storage'}/${customer.photo_path}`}
                                    alt={customer?.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <User size={24} className="text-slate-400" />
                            )}
                        </div>
                        <div className="flex-1">
                            <p className="font-bold text-slate-800">{customer?.name}</p>
                            <p className="text-xs text-slate-500">{customer?.id}</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Alamat Dropdown */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                                <Building2 size={14} className="text-blue-500" />
                                Pilih Alamat Bank Sampah
                            </label>

                            {loadingBankSampah ? (
                                <div className="flex items-center gap-2 text-slate-400 py-3">
                                    <Loader2 size={16} className="animate-spin" />
                                    <span className="text-sm">Memuat daftar alamat...</span>
                                </div>
                            ) : (
                                <div className="relative">
                                    <select
                                        value={alamat}
                                        onChange={(e) => setAlamat(e.target.value)}
                                        className="w-full px-4 py-3.5 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 font-medium text-slate-700 outline-none transition-all appearance-none cursor-pointer bg-white hover:border-slate-300"
                                        required
                                    >
                                        <option value="">-- Pilih Alamat --</option>
                                        {uniqueAddresses.map((addr, idx) => (
                                            <option key={idx} value={addr}>{addr}</option>
                                        ))}
                                    </select>
                                    <ChevronDown size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                </div>
                            )}

                            {uniqueAddresses.length === 0 && !loadingBankSampah && (
                                <p className="text-xs text-amber-600 mt-2">Tidak ada alamat Bank Sampah tersedia. Tambahkan alamat di Bank Sampah terlebih dahulu.</p>
                            )}
                        </div>

                        {/* Current Address Display */}
                        {alamat && (
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3 border border-blue-100">
                                <div className="flex items-center gap-2 mb-1">
                                    <MapPin size={14} className="text-blue-600" />
                                    <span className="text-xs font-bold text-blue-600">Alamat Dipilih:</span>
                                </div>
                                <p className="text-sm font-medium text-slate-700">{alamat}</p>
                            </div>
                        )}

                        {error && (
                            <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium flex items-center gap-2 border border-red-100">
                                <X size={14} /> {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || !alamat}
                            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3.5 rounded-xl font-bold hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg hover:shadow-blue-500/30 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                            {loading ? 'Menyimpan...' : 'Simpan Alamat'}
                        </button>
                    </form>
                </div>
            </div>
        </div>,
        document.body
    );
}
