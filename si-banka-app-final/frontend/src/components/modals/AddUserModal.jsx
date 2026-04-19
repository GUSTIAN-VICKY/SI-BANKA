import React, { useState, useRef } from 'react';
import { X, Upload, Camera, User, Mail, Lock, Loader2, AlertCircle, Shield, Users } from 'lucide-react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { CameraCaptureModal } from './CameraCaptureModal';

export function AddUserModal({ onClose, onAddUser, isLoading, error, initialData, customers = [] }) {
    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        email: initialData?.email || '',
        password: '',
        photo: null,
        role: initialData?.role || 'admin_rt',
        customer_id: initialData?.customer_id || ''
    });
    const [preview, setPreview] = useState(
        initialData?.photo_path
            ? (initialData.photo_path.startsWith('http') ? initialData.photo_path : `/storage/${initialData.photo_path}`)
            : null
    );
    const [showCamera, setShowCamera] = useState(false);
    const fileInputRef = useRef(null);
    const [validationError, setValidationError] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setValidationError(null);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, photo: file });
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleCameraCapture = (file) => {
        setFormData({ ...formData, photo: file });
        setPreview(URL.createObjectURL(file));
        setShowCamera(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.email) {
            setValidationError("Nama dan Email wajib diisi.");
            return;
        }
        if (!initialData && !formData.password) {
            setValidationError("Password wajib diisi untuk user baru.");
            return;
        }
        if (formData.password && formData.password.length < 8) {
            setValidationError("Password minimal 8 karakter.");
            return;
        }
        try {
            await onAddUser(formData);
        } catch (err) {
            setValidationError(err.message || "Terjadi kesalahan.");
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden relative"
                >
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                <User size={18} />
                            </div>
                            {initialData ? 'Edit User Admin' : 'Tambah User Admin'}
                        </h2>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="p-6">
                        {error && (
                            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm flex items-center gap-2 border border-red-100">
                                <AlertCircle size={16} />
                                {error}
                            </div>
                        )}
                        {validationError && (
                            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm flex items-center gap-2 border border-red-100">
                                <AlertCircle size={16} />
                                {validationError}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Photo Upload */}
                            <div className="flex justify-center mb-6">
                                <div className="relative group">
                                    <div className="w-24 h-24 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden">
                                        {preview ? (
                                            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <User size={32} className="text-slate-400" />
                                        )}
                                    </div>
                                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="p-1.5 bg-emerald-500 text-white rounded-full shadow-lg hover:bg-emerald-600 transition-colors"
                                            title="Upload Foto"
                                        >
                                            <Upload size={14} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setShowCamera(true)}
                                            className="p-1.5 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-colors"
                                            title="Ambil Foto"
                                        >
                                            <Camera size={14} />
                                        </button>
                                    </div>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Nama Lengkap</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                                            placeholder="Nama User"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                                            placeholder="email@bankasentosa.id"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                                            placeholder="Minimal 8 karakter"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                        <Shield size={18} />
                                    </div>
                                    <select
                                        name="role"
                                        value={formData.role || 'admin_rt'}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all appearance-none"
                                    >
                                        <optgroup label="Level Kota">
                                            <option value="super_admin_kota">Super Admin Kota (Full Akses)</option>
                                            <option value="admin_kota">Admin Kota (Lihat Semua)</option>
                                        </optgroup>
                                        <optgroup label="Level RT">
                                            <option value="super_admin_rt">Super Admin RT (Kelola Bank Sampah)</option>
                                            <option value="admin_rt">Admin RT (CRUD Data)</option>
                                        </optgroup>
                                        <optgroup label="Nasabah">
                                            <option value="nasabah">Nasabah (Read Only)</option>
                                        </optgroup>
                                    </select>
                                </div>
                                <p className="text-xs text-slate-400 mt-1 ml-1">
                                    {['super_admin_kota', 'super_admin'].includes(formData.role)
                                        ? 'Akses penuh ke semua bank sampah + kelola user.'
                                        : formData.role === 'admin_kota'
                                            ? 'Lihat semua data, tidak bisa kelola user.'
                                            : formData.role === 'super_admin_rt'
                                                ? 'Kelola 1 bank sampah + user di RT tersebut.'
                                                : ['admin_rt', 'admin'].includes(formData.role)
                                                    ? 'CRUD nasabah & transaksi di 1 bank sampah.'
                                                    : 'Hanya bisa melihat data transaksi pribadi.'}
                                </p>
                            </div>

                            {/* Customer Selection - Hanya muncul jika role = nasabah */}
                            {formData.role === 'nasabah' && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Pilih Nasabah</label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                            <Users size={18} />
                                        </div>
                                        <select
                                            name="customer_id"
                                            value={formData.customer_id || ''}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all appearance-none"
                                            required
                                        >
                                            <option value="">-- Pilih Nasabah --</option>
                                            {customers.map(c => (
                                                <option key={c.id} value={c.id}>{c.name} (RT{c.rt}/RW{c.rw})</option>
                                            ))}
                                        </select>
                                    </div>
                                    <p className="text-xs text-slate-400 mt-1 ml-1">
                                        Akun nasabah ini akan terhubung dengan data nasabah yang dipilih.
                                    </p>
                                </div>
                            )}

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-xl transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isLoading ? <Loader2 className="animate-spin" size={18} /> : 'Simpan User'}
                                </button>
                            </div>
                        </form>
                    </div>
                </motion.div>
            </div>

            {showCamera && (
                <CameraCaptureModal
                    onCapture={handleCameraCapture}
                    onClose={() => setShowCamera(false)}
                />
            )}
        </AnimatePresence>
    );
}
