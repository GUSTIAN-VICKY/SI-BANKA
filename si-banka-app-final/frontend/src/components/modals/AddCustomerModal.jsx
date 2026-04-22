import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, UserPlus, Loader2, Camera, Image as ImageIcon, Lock, CheckCircle, MapPin, Building2, ChevronDown, Sparkles, Shield, User, AlertCircle } from 'lucide-react';
import { CameraCaptureModal } from './CameraCaptureModal';
import { compressImage } from '../../utils/imageUtils';
import { useModalClose } from '../../hooks/useModalClose';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export function AddCustomerModal({ setShowAddCustomerModal, handleAddCustomer, geminiLoading, error, currentUser }) {
    const [name, setName] = useState('');
    const [rt, setRt] = useState('');
    const [rw, setRw] = useState('');
    const [alamat, setAlamat] = useState('');
    const [password, setPassword] = useState('');
    const [photo, setPhoto] = useState(null);
    const [preview, setPreview] = useState(null);
    const [localError, setLocalError] = useState(null);
    const [showCameraModal, setShowCameraModal] = useState(false);
    const [_successInfo, setSuccessInfo] = useState(null);

    // Bank Sampah selection for city-level admins
    const [bankSampahList, setBankSampahList] = useState([]);
    const [selectedBankSampah, setSelectedBankSampah] = useState('');
    const [loadingBankSampah, setLoadingBankSampah] = useState(false);

    const isCityAdmin = currentUser && ['super_admin', 'super_admin_kota', 'admin_kota'].includes(currentUser.role);
    const isRTAdmin = currentUser && ['super_admin_rt', 'admin_rt', 'admin'].includes(currentUser.role);

    // Fetch Bank Sampah list for city-level admins
    useEffect(() => {
        if (isCityAdmin) {
            setLoadingBankSampah(true);
            const token = localStorage.getItem('authToken') || localStorage.getItem('token');
            fetch(`${API_BASE_URL}/bank-sampah`, {
                headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
            })
                .then(res => res.json())
                .then(data => { if (data.data) setBankSampahList(data.data); })
                .catch(err => console.error('Failed to fetch bank sampah:', err))
                .finally(() => setLoadingBankSampah(false));
        }
    }, [isCityAdmin]);

    // Auto-fill RT/RW and Alamat when Bank Sampah is selected (City Admin)
    useEffect(() => {
        if (isCityAdmin && selectedBankSampah) {
            const selected = bankSampahList.find(b => b.id === selectedBankSampah);
            if (selected) {
                setRt(selected.rt || '');
                setRw(selected.rw || '');
                setAlamat(selected.alamat || '');
            }
        }
    }, [selectedBankSampah, bankSampahList, isCityAdmin]);

    // Auto-fill RT/RW and Alamat for RT-level admins from their own Bank Sampah
    useEffect(() => {
        const bs = currentUser?.bank_sampah || currentUser?.bankSampah;
        if (!isCityAdmin && bs) {
            setRt(bs.rt || '');
            setRw(bs.rw || '');
            setAlamat(bs.alamat || '');
        }
    }, [currentUser, isCityAdmin]);

    const handlePhotoSelect = async (file) => {
        if (!file) return;
        try {
            const compressed = await compressImage(file, 800, 0.7);
            setPhoto(compressed);
            setPreview(URL.createObjectURL(compressed));
        } catch (e) {
            setPhoto(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async () => {
        const bs = currentUser?.bank_sampah || currentUser?.bankSampah;
        setLocalError(null);
        if (isCityAdmin && !selectedBankSampah) { setLocalError("Pilih Bank Sampah terlebih dahulu!"); return; }
        if (isRTAdmin && !bs) { setLocalError("Akun Anda belum terhubung ke Bank Sampah manapun. Hubungi Admin Kota."); return; }
        if (!name || !rt || !rw) { setLocalError("Semua field (Nama, RT, RW) wajib diisi!"); return; }
        if (!password || password.length < 6) { setLocalError("Password wajib diisi (minimal 6 karakter)!"); return; }

        try {
            const result = await handleAddCustomer({
                name, rt, rw, alamat, photo, password,
                bank_sampah_id: isCityAdmin ? selectedBankSampah : undefined
            });
            if (result?.user_account) {
                setSuccessInfo(result.user_account);
                setTimeout(() => setShowAddCustomerModal(false), 3000);
            } else if (!error) {
                setShowAddCustomerModal(false);
            }
        } catch (e) { /* Error handled by parent */ }
    };

    useModalClose(() => setShowAddCustomerModal(false));

    return createPortal(
        <div 
            onClick={() => setShowAddCustomerModal(false)}
            className="fixed inset-0 bg-gradient-to-br from-slate-900/80 via-slate-900/70 to-emerald-900/50 backdrop-blur-md flex items-center justify-center z-[100] p-4 sm:p-6 md:p-8 animate-fadeIn"
        >
            {showCameraModal && (
                <CameraCaptureModal
                    onClose={() => setShowCameraModal(false)}
                    onCapture={(file) => { handlePhotoSelect(file); setShowCameraModal(false); }}
                />
            )}

            {/* Modal Container */}
            <div 
                onClick={(e) => e.stopPropagation()}
                className="bg-white w-full max-w-xl max-h-[95vh] sm:max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-slideUp relative"
            >
                {/* Gradient Header */}
                <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 p-5 sm:p-6 relative overflow-hidden flex-shrink-0 flex justify-between items-start">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />

                    <div className="flex items-center gap-4 relative z-10">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                            <UserPlus size={28} className="text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                                Nasabah Baru
                                <Sparkles size={18} className="text-yellow-300 animate-pulse" />
                            </h3>
                            <p className="text-white/80 text-sm sm:text-base">Tambahkan data diri nasabah</p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => setShowAddCustomerModal(false)}
                        className="relative z-10 text-white/80 hover:text-white hover:bg-white/20 bg-white/10 rounded-full p-2 transition-all backdrop-blur-sm -mt-2 -mr-2 shadow-sm"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Scrollable Form Content */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
                    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-4 sm:space-y-5">
                        
                        {/* Bank Sampah Status for RT Admin */}
                        {isRTAdmin && !(currentUser?.bank_sampah || currentUser?.bankSampah) && (
                            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3 text-amber-700 text-sm animate-pulse">
                                <AlertCircle size={20} />
                                <p><strong>Peringatan:</strong> Akun Anda belum terhubung ke Bank Sampah. Silakan hubungi Admin Kota.</p>
                            </div>
                        )}

                        {/* Bank Sampah Dropdown - City Admin Only */}
                        {isCityAdmin && (
                            <div className="group">
                                <label className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                                    <Building2 size={16} className="text-emerald-500" />
                                    Pilih Bank Sampah
                                </label>
                                <div className="relative">
                                    <select
                                        value={selectedBankSampah}
                                        onChange={(e) => setSelectedBankSampah(e.target.value)}
                                        className="w-full px-4 py-3.5 border-2 border-slate-200 rounded-2xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 font-semibold text-slate-700 outline-none transition-all appearance-none cursor-pointer bg-white hover:border-slate-300"
                                        required
                                    >
                                        <option value="">-- Pilih Bank Sampah --</option>
                                        {bankSampahList.map(bs => (
                                            <option key={bs.id} value={bs.id}>
                                                {bs.name} - RT {bs.rt}/RW {bs.rw}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                </div>
                                {loadingBankSampah && <p className="text-xs text-slate-400 mt-2 animate-pulse">Memuat...</p>}
                            </div>
                        )}

                        {/* Photo Upload */}
                        <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-slate-50 to-slate-100/50 rounded-2xl border border-slate-100">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white border-2 border-slate-200 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm">
                                {preview ? (
                                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <User size={28} className="text-slate-300" />
                                )}
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-bold text-slate-700 mb-2">Foto Profil</p>
                                <div className="flex gap-2">
                                    {preview ? (
                                        <button type="button" onClick={() => { setPhoto(null); setPreview(null); }} className="text-xs font-bold text-red-500 bg-red-50 hover:bg-red-100 py-2 px-4 rounded-xl transition-colors">Hapus</button>
                                    ) : (
                                        <>
                                            <button type="button" onClick={() => setShowCameraModal(true)} className="flex-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors text-xs font-bold"><Camera size={14} /> Kamera</button>
                                            <label className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors text-xs font-bold">
                                                <ImageIcon size={14} /> Galeri
                                                <input type="file" accept="image/*" onChange={(e) => handlePhotoSelect(e.target.files[0])} className="hidden" />
                                            </label>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Nama Lengkap */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                <User size={16} className="text-emerald-500" />
                                Nama Lengkap
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Penerima rekening nasabah baru"
                                className="w-full px-4 py-3.5 border-2 border-slate-200 rounded-2xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 text-base font-semibold text-slate-700 outline-none transition-all placeholder:text-slate-400 placeholder:font-normal hover:border-slate-300"
                                required
                            />
                        </div>

                        {/* RT & RW Grid */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col items-center">
                                <label className="text-xs font-bold text-slate-500 mb-1">RT</label>
                                <div className="text-3xl font-black text-slate-700">{rt || '00'}</div>
                                <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-bold">Otomatis</p>
                            </div>
                            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col items-center">
                                <label className="text-xs font-bold text-slate-500 mb-1">RW</label>
                                <div className="text-3xl font-black text-slate-700">{rw || '00'}</div>
                                <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-bold">Otomatis</p>
                            </div>
                        </div>

                        {/* Alamat */}
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-100 flex items-start gap-4">
                            <div className="p-2.5 bg-white rounded-xl shadow-sm text-blue-500 border border-blue-100/50">
                                <MapPin size={22} />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs font-bold text-blue-600 mb-1">Alamat Penyetoran</p>
                                <p className="text-sm font-semibold text-slate-700 leading-relaxed">
                                    {alamat || <span className="text-slate-400 italic">Pilih Bank Sampah untuk melihat alamat</span>}
                                </p>
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                <Shield size={16} className="text-amber-500" />
                                Password Akun Nasabah
                            </label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Minimal 6 karakter"
                                    className="w-full pl-11 pr-4 py-3.5 border-2 border-slate-200 rounded-2xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 font-medium text-slate-700 outline-none transition-all placeholder:text-slate-400 hover:border-slate-300"
                                    required
                                    minLength={6}
                                    autoComplete="new-password"
                                />
                            </div>
                        </div>

                        {/* Error Display */}
                        {(localError || error) && (
                            <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-bold flex items-center gap-3 animate-shake">
                                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <X size={16} />
                                </div>
                                <span className="flex-1">{localError || error}</span>
                            </div>
                        )}
                    </form>
                </div>

                {/* Footer Submit Button */}
                <div className="p-4 sm:p-6 border-t border-slate-100 bg-white">
                    <button
                        onClick={handleSubmit}
                        disabled={geminiLoading}
                        className="w-full bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 text-white py-4 rounded-2xl font-black text-lg hover:from-emerald-600 hover:via-emerald-700 hover:to-teal-700 transition-all shadow-lg hover:shadow-emerald-500/30 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-70 disabled:grayscale group"
                    >
                        {geminiLoading ? (
                            <Loader2 className="animate-spin" size={24} />
                        ) : (
                            <CheckCircle size={24} className="group-hover:scale-110 transition-transform" />
                        )}
                        {geminiLoading ? 'Menyimpan...' : 'Simpan Nasabah'}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
