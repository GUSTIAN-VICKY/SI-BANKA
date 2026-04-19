import React, { useState, useEffect, useRef } from 'react';
import { Edit2, Bell, Check, LogOut, Loader2, Camera, Image as ImageIcon, User, AlertCircle, CheckCircle, Mail, Shield, Sparkles, Settings, BellRing, BellOff, Package } from 'lucide-react';
import { CameraCaptureModal } from '../modals/CameraCaptureModal';
import { compressImage } from '../../utils/imageUtils';
import { auth } from '../../services';
import { requestNotificationPermission, getNotificationPermission, isNotificationSupported, showNotification } from '../../utils/notifications';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { showSuccess, showError } from '../../utils/sweetAlert';

// Role styles for gradient colors - Hierarki 5 Role
const ROLE_STYLES = {
  super_admin_kota: {
    gradient: 'from-purple-500 to-indigo-600',
    bg: 'from-purple-50 to-indigo-50',
    text: 'text-purple-700',
    badge: 'bg-gradient-to-r from-purple-500 to-indigo-600',
    label: 'Super Admin Kota'
  },
  super_admin: { // Legacy alias
    gradient: 'from-purple-500 to-indigo-600',
    bg: 'from-purple-50 to-indigo-50',
    text: 'text-purple-700',
    badge: 'bg-gradient-to-r from-purple-500 to-indigo-600',
    label: 'Super Admin Kota'
  },
  admin_kota: {
    gradient: 'from-blue-500 to-cyan-600',
    bg: 'from-blue-50 to-cyan-50',
    text: 'text-blue-700',
    badge: 'bg-gradient-to-r from-blue-500 to-cyan-600',
    label: 'Admin Kota'
  },
  super_admin_rt: {
    gradient: 'from-emerald-500 to-teal-600',
    bg: 'from-emerald-50 to-teal-50',
    text: 'text-emerald-700',
    badge: 'bg-gradient-to-r from-emerald-500 to-teal-600',
    label: 'Super Admin RT'
  },
  admin_rt: {
    gradient: 'from-green-500 to-emerald-600',
    bg: 'from-green-50 to-emerald-50',
    text: 'text-green-700',
    badge: 'bg-gradient-to-r from-green-500 to-emerald-600',
    label: 'Admin RT'
  },
  admin: { // Legacy alias
    gradient: 'from-green-500 to-emerald-600',
    bg: 'from-green-50 to-emerald-50',
    text: 'text-green-700',
    badge: 'bg-gradient-to-r from-green-500 to-emerald-600',
    label: 'Admin RT'
  },
  nasabah: {
    gradient: 'from-amber-400 to-orange-500',
    bg: 'from-amber-50 to-orange-50',
    text: 'text-amber-700',
    badge: 'bg-gradient-to-r from-amber-400 to-orange-500',
    label: 'Nasabah'
  }
};

export function SettingsPage({ onLogout, user }) {
  const isNasabah = user?.role === 'nasabah';
  const roleStyle = ROLE_STYLES[user?.role] || ROLE_STYLES.nasabah;
  const roleLabel = roleStyle.label;

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [photo, setPhoto] = useState(null);

  const getPhotoUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('data:')) return path;
    if (path.startsWith('http')) return path;
    return `/storage/${path}`;
  };

  const getInitialPhoto = () => {
    if (user?.photo_path) return getPhotoUrl(user.photo_path);
    if (isNasabah && user?.customer?.photo_path) return getPhotoUrl(user.customer.photo_path);
    return null;
  };

  const [preview, setPreview] = useState(getInitialPhoto());
  const [notifStock, setNotifStock] = useState(true);
  const [notifTrx, setNotifTrx] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const savedNotifStock = localStorage.getItem('notifStock') !== 'false';
    const savedNotifTrx = localStorage.getItem('notifTrx') === 'true';
    setNotifStock(savedNotifStock);
    setNotifTrx(savedNotifTrx);
  }, []);

  const [notifPermission, setNotifPermission] = useState(getNotificationPermission());

  const handleToggleNotifStock = async () => {
    const newValue = !notifStock;
    setNotifStock(newValue);
    localStorage.setItem('notifStock', newValue);

    if (newValue && notifPermission !== 'granted') {
      const permission = await requestNotificationPermission();
      setNotifPermission(permission);
      if (permission === 'granted') {
        showNotification('🔔 Notifikasi Aktif!', {
          body: 'Anda akan menerima notifikasi saat stok hampir penuh.'
        });
      }
    }
  };

  const handleToggleNotifTrx = async () => {
    const newValue = !notifTrx;
    setNotifTrx(newValue);
    localStorage.setItem('notifTrx', newValue);

    if (newValue && notifPermission !== 'granted') {
      const permission = await requestNotificationPermission();
      setNotifPermission(permission);
      if (permission === 'granted') {
        showNotification('🔔 Notifikasi Aktif!', {
          body: 'Anda akan menerima notifikasi setiap ada transaksi baru.'
        });
      }
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);

      if (photo) {
        formData.append('photo', photo);
      } else if (preview === null && user?.photo) {
        formData.append('reset_photo', 'true');
      }

      await new Promise(resolve => setTimeout(resolve, 800));
      await auth.updateProfile(formData);

      localStorage.setItem('notifStock', notifStock);
      localStorage.setItem('notifTrx', notifTrx);

      await showSuccess('Berhasil!', 'Perubahan profil berhasil disimpan!');
      window.location.reload();
    } catch (err) {
      console.error("Failed to update profile", err);
      await showError('Gagal', err.message || "Gagal menyimpan perubahan.");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePhotoSelect = async (file) => {
    if (!file) return;
    try {
      const compressed = await compressImage(file, 300, 0.7);
      setPhoto(compressed);
      setPreview(URL.createObjectURL(compressed));
    } catch (err) {
      console.error("Compression failed", err);
      setPhoto(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 md:space-y-8"
    >
      {showCameraModal && (
        <CameraCaptureModal
          onClose={() => setShowCameraModal(false)}
          onCapture={(file) => {
            handlePhotoSelect(file);
            setShowCameraModal(false);
          }}
        />
      )}

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`bg-gradient-to-br ${roleStyle.bg} rounded-3xl shadow-lg border border-white/50 overflow-hidden`}
      >
        {/* Gradient Header */}
        <div className={`bg-gradient-to-r ${roleStyle.gradient} p-6`}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
              <Settings size={24} className="text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Profil {roleLabel}</h3>
              <p className="text-white/70 text-sm">Kelola informasi akun Anda</p>
            </div>
          </div>
        </div>

        <form className="p-6 space-y-6" onSubmit={handleSaveProfile}>
          {/* Photo Upload Section */}
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className={`w-28 h-28 rounded-2xl bg-gradient-to-br ${roleStyle.gradient} p-1 shadow-lg flex-shrink-0`}
            >
              <div className="w-full h-full rounded-[14px] bg-white overflow-hidden flex items-center justify-center">
                {preview ? (
                  <img src={preview} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User size={40} className="text-slate-300" />
                )}
              </div>
            </motion.div>

            <div className="flex-1 space-y-4">
              <div>
                <p className="text-sm font-bold text-slate-700 mb-2">Foto Profil</p>
                <p className="text-xs text-slate-400 mb-3">Gunakan foto rasio 1:1, max 2MB</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => setShowCameraModal(true)}
                  className={`flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r ${roleStyle.gradient} text-white rounded-xl shadow-md hover:shadow-lg transition-all font-bold text-sm`}
                >
                  <Camera size={16} /> Kamera
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white text-slate-700 rounded-xl border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all font-bold text-sm shadow-sm"
                >
                  <ImageIcon size={16} /> Galeri
                </motion.button>
                <input
                  type="file"
                  hidden
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={(e) => handlePhotoSelect(e.target.files[0])}
                />
                {preview && (
                  <button
                    type="button"
                    onClick={() => { setPhoto(null); setPreview(null); }}
                    className="text-red-500 text-sm font-bold hover:underline px-3 py-2"
                  >
                    Hapus Foto
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                <User size={14} className="text-slate-400" /> Nama {roleLabel}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full p-3.5 bg-white border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-offset-0 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none font-medium shadow-sm`}
                placeholder="Masukkan nama lengkap"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                <Mail size={14} className="text-slate-400" /> Alamat Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full p-3.5 bg-white border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-offset-0 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none font-medium shadow-sm`}
                placeholder="email@example.com"
              />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="submit"
            disabled={isSaving}
            className={`bg-gradient-to-r ${roleStyle.gradient} text-white px-8 py-3.5 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed`}
          >
            {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
            {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </motion.button>
        </form>
      </motion.div>

      {/* Notifications Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-br from-white to-purple-50/50 rounded-3xl shadow-lg border border-purple-100/50 overflow-hidden"
      >
        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
              <Bell size={24} className="text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Notifikasi</h3>
              <p className="text-white/70 text-sm">Kelola preferensi notifikasi browser</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Permission status indicator */}
          {isNotificationSupported() && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`flex items-center gap-3 p-4 rounded-xl ${notifPermission === 'granted'
                ? 'bg-emerald-50 border border-emerald-200'
                : notifPermission === 'denied'
                  ? 'bg-red-50 border border-red-200'
                  : 'bg-amber-50 border border-amber-200'
                }`}
            >
              {notifPermission === 'granted' ? (
                <>
                  <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <CheckCircle size={20} className="text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-bold text-emerald-700">Notifikasi Diizinkan</p>
                    <p className="text-emerald-600 text-xs">Anda akan menerima notifikasi browser</p>
                  </div>
                </>
              ) : notifPermission === 'denied' ? (
                <>
                  <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                    <BellOff size={20} className="text-red-600" />
                  </div>
                  <div>
                    <p className="font-bold text-red-700">Notifikasi Diblokir</p>
                    <p className="text-red-600 text-xs">Aktifkan di pengaturan browser Anda</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                    <AlertCircle size={20} className="text-amber-600" />
                  </div>
                  <div>
                    <p className="font-bold text-amber-700">Izin Belum Diberikan</p>
                    <p className="text-amber-600 text-xs">Aktifkan toggle di bawah untuk meminta izin</p>
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* Toggle Options */}
          <div className="space-y-3">
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="flex justify-between items-center p-4 bg-white rounded-xl border border-slate-100 shadow-sm cursor-pointer"
              onClick={handleToggleNotifStock}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${notifStock ? 'bg-gradient-to-br from-emerald-500 to-teal-600' : 'bg-slate-100'}`}>
                  <Package size={18} className={notifStock ? 'text-white' : 'text-slate-400'} />
                </div>
                <div>
                  <p className="font-bold text-slate-700">Notifikasi Stok Penuh</p>
                  <p className="text-slate-400 text-xs">Terima notifikasi saat stok gudang penuh</p>
                </div>
              </div>
              <button
                id="notif-stok"
                className={`w-14 h-7 rounded-full p-1 flex items-center transition-all ${notifStock ? 'bg-gradient-to-r from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/30' : 'bg-slate-200'}`}
              >
                <motion.span
                  animate={{ x: notifStock ? 28 : 0 }}
                  className="w-5 h-5 bg-white rounded-full shadow-md"
                />
              </button>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.01 }}
              className="flex justify-between items-center p-4 bg-white rounded-xl border border-slate-100 shadow-sm cursor-pointer"
              onClick={handleToggleNotifTrx}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${notifTrx ? 'bg-gradient-to-br from-blue-500 to-indigo-600' : 'bg-slate-100'}`}>
                  <BellRing size={18} className={notifTrx ? 'text-white' : 'text-slate-400'} />
                </div>
                <div>
                  <p className="font-bold text-slate-700">Notifikasi Transaksi Baru</p>
                  <p className="text-slate-400 text-xs">Terima notifikasi setiap ada transaksi</p>
                </div>
              </div>
              <button
                id="notif-transaksi"
                className={`w-14 h-7 rounded-full p-1 flex items-center transition-all ${notifTrx ? 'bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30' : 'bg-slate-200'}`}
              >
                <motion.span
                  animate={{ x: notifTrx ? 28 : 0 }}
                  className="w-5 h-5 bg-white rounded-full shadow-md"
                />
              </button>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Logout Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-br from-white to-red-50/50 rounded-3xl shadow-lg border border-red-100/50 p-6"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <LogOut size={24} className="text-red-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Keluar dari Akun</h3>
              <p className="text-slate-400 text-sm">Anda dapat masuk kembali kapan saja</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onLogout}
            className="w-full md:w-auto bg-gradient-to-r from-red-500 to-rose-600 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-red-500/25 hover:shadow-xl transition-all"
          >
            <LogOut size={18} /> Keluar
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};
