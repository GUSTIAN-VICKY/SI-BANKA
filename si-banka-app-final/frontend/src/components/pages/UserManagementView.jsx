import React, { useState, useEffect } from 'react';
import { Plus, Search, Trash2, Edit2, User, MoreVertical, Shield, Mail, Calendar, Users, Loader2, Crown, UserCheck, Sparkles, MapPin } from 'lucide-react';
import { fetchUsers, deleteUser, createUser, updateUser, auth, fetchCustomers} from '../../services';
import { AddUserModal } from '../modals/AddUserModal';
import { showConfirm, showSuccess, showError } from '../../utils/sweetAlert';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';

// Role colors and gradients - 5-tier hierarchy
const ROLE_STYLES = {
    // Level 1: Super Admin Kota (Tertinggi)
    super_admin_kota: {
        gradient: 'from-purple-500 to-indigo-600',
        bg: 'bg-gradient-to-br from-purple-50 to-indigo-50',
        border: 'border-purple-200',
        text: 'text-purple-700',
        badge: 'bg-gradient-to-r from-purple-500 to-indigo-600',
        icon: Crown,
        label: 'Super Admin Kota'
    },
    super_admin: { // Legacy alias
        gradient: 'from-purple-500 to-indigo-600',
        bg: 'bg-gradient-to-br from-purple-50 to-indigo-50',
        border: 'border-purple-200',
        text: 'text-purple-700',
        badge: 'bg-gradient-to-r from-purple-500 to-indigo-600',
        icon: Crown,
        label: 'Super Admin Kota'
    },
    // Level 2: Admin Kota
    admin_kota: {
        gradient: 'from-blue-500 to-cyan-600',
        bg: 'bg-gradient-to-br from-blue-50 to-cyan-50',
        border: 'border-blue-200',
        text: 'text-blue-700',
        badge: 'bg-gradient-to-r from-blue-500 to-cyan-600',
        icon: Shield,
        label: 'Admin Kota'
    },
    // Level 3: Super Admin RT
    super_admin_rt: {
        gradient: 'from-emerald-500 to-teal-600',
        bg: 'bg-gradient-to-br from-emerald-50 to-teal-50',
        border: 'border-emerald-200',
        text: 'text-emerald-700',
        badge: 'bg-gradient-to-r from-emerald-500 to-teal-600',
        icon: UserCheck,
        label: 'Super Admin RT'
    },
    // Level 4: Admin RT
    admin_rt: {
        gradient: 'from-green-500 to-emerald-600',
        bg: 'bg-gradient-to-br from-green-50 to-emerald-50',
        border: 'border-green-200',
        text: 'text-green-700',
        badge: 'bg-gradient-to-r from-green-500 to-emerald-600',
        icon: Shield,
        label: 'Admin RT'
    },
    admin: { // Legacy alias
        gradient: 'from-green-500 to-emerald-600',
        bg: 'bg-gradient-to-br from-green-50 to-emerald-50',
        border: 'border-green-200',
        text: 'text-green-700',
        badge: 'bg-gradient-to-r from-green-500 to-emerald-600',
        icon: Shield,
        label: 'Admin RT'
    },
    // Level 5: Nasabah
    nasabah: {
        gradient: 'from-amber-400 to-orange-500',
        bg: 'bg-gradient-to-br from-amber-50 to-orange-50',
        border: 'border-amber-200',
        text: 'text-amber-700',
        badge: 'bg-gradient-to-r from-amber-400 to-orange-500',
        icon: User,
        label: 'Nasabah'
    }
};


export function UserManagementView() {
    const [currentUser, setCurrentUser] = useState(null);
    const [users, setUsers] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [_error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [_generatingAccounts, _setGeneratingAccounts] = useState(false);
    const [roleFilter, setRoleFilter] = useState('all');

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        setLoading(true);
        try {
            const me = await auth.fetchUser();
            setCurrentUser(me);
            const data = await fetchUsers();
            setUsers(data);
            const customersData = await fetchCustomers();
            setCustomers(customersData);
        } catch (err) {
            console.error("Failed to load users", err);
            setError("Gagal memuat data user.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (userId) => {
        const isConfirmed = await showConfirm({
            title: 'Hapus User?',
            text: 'User yang dihapus tidak dapat dikembalikan lagi.',
            confirmText: 'Ya, Hapus'
        });

        if (!isConfirmed) return;

        setActionLoading(true);
        try {
            await deleteUser(userId);
            setUsers(users.filter(u => u.id !== userId));
            await showSuccess('Terhapus!', 'User telah berhasil dihapus.');
        } catch (err) {
            await showError('Gagal Hapus', err.message || "Gagal menghapus user.");
        } finally {
            setActionLoading(false);
        }
    };

    const handleSaveUser = async (formData) => {
        setActionLoading(true);
        try {
            const payload = new FormData();
            payload.append('name', formData.name);
            payload.append('email', formData.email);
            if (formData.password) payload.append('password', formData.password);
            if (formData.photo) payload.append('photo', formData.photo);
            if (formData.role) payload.append('role', formData.role);
            if (formData.role === 'nasabah' && formData.customer_id) {
                payload.append('customer_id', formData.customer_id);
            }

            await new Promise(resolve => setTimeout(resolve, 800));

            if (editingUser) {
                await updateUser(editingUser.id, payload);
                await showSuccess('Berhasil!', 'User berhasil diperbarui!');
            } else {
                await createUser(payload);
                await showSuccess('Berhasil!', 'User baru berhasil ditambahkan!');
            }
            setShowAddModal(false);
            setEditingUser(null);
            loadUsers();
        } catch (err) {
            console.error(err);
            await showError('Gagal', err.message || "Terjadi kesalahan saat menyimpan user.");
        } finally {
            setActionLoading(false);
        }
    };

    const openEditModal = (user) => {
        setEditingUser(user);
        setShowAddModal(true);
    };

    const openAddModal = () => {
        setEditingUser(null);
        setShowAddModal(true);
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    // Role counts untuk hierarki 5 role
    const superAdminKotaCount = users.filter(u => ['super_admin', 'super_admin_kota'].includes(u.role)).length;
    const _adminKotaCount = users.filter(u => u.role === 'admin_kota').length;
    const _superAdminRTCount = users.filter(u => u.role === 'super_admin_rt').length;
    const adminRTCount = users.filter(u => ['admin', 'admin_rt'].includes(u.role)).length;
    const nasabahCount = users.filter(u => u.role === 'nasabah').length;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            {/* --- Stats Cards with Gradients --- */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <motion.div
                    whileHover={{ scale: 1.02, y: -2 }}
                    onClick={() => setRoleFilter('all')}
                    className={`p-5 rounded-2xl shadow-lg cursor-pointer transition-all ${roleFilter === 'all' ? 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-500/30' : 'bg-gradient-to-br from-blue-400 to-indigo-500 shadow-blue-400/20'}`}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-100 text-xs font-medium mb-1 uppercase tracking-wider">Total User</p>
                            <h3 className="text-3xl font-black text-white">{users.length}</h3>
                        </div>
                        <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                            <Users size={24} className="text-white" />
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    whileHover={{ scale: 1.02, y: -2 }}
                    onClick={() => setRoleFilter('super_admin')}
                    className={`p-5 rounded-2xl shadow-lg cursor-pointer transition-all ${roleFilter === 'super_admin' ? 'bg-gradient-to-br from-purple-500 to-indigo-600 shadow-purple-500/30 ring-2 ring-white' : 'bg-gradient-to-br from-purple-400 to-indigo-500 shadow-purple-400/20'}`}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-purple-100 text-xs font-medium mb-1 uppercase tracking-wider">Super Admin</p>
                            <h3 className="text-3xl font-black text-white">{superAdminKotaCount}</h3>
                        </div>
                        <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                            <Crown size={24} className="text-white" />
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    whileHover={{ scale: 1.02, y: -2 }}
                    onClick={() => setRoleFilter('admin')}
                    className={`p-5 rounded-2xl shadow-lg cursor-pointer transition-all ${roleFilter === 'admin' ? 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/30 ring-2 ring-white' : 'bg-gradient-to-br from-emerald-400 to-teal-500 shadow-emerald-400/20'}`}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-emerald-100 text-xs font-medium mb-1 uppercase tracking-wider">Admin</p>
                            <h3 className="text-3xl font-black text-white">{adminRTCount}</h3>
                        </div>
                        <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                            <Shield size={24} className="text-white" />
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    whileHover={{ scale: 1.02, y: -2 }}
                    onClick={() => setRoleFilter('nasabah')}
                    className={`p-5 rounded-2xl shadow-lg cursor-pointer transition-all ${roleFilter === 'nasabah' ? 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-amber-500/30 ring-2 ring-white' : 'bg-gradient-to-br from-amber-300 to-orange-400 shadow-amber-400/20'}`}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-amber-100 text-xs font-medium mb-1 uppercase tracking-wider">Nasabah</p>
                            <h3 className="text-3xl font-black text-white">{nasabahCount}</h3>
                        </div>
                        <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                            <User size={24} className="text-white" />
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* --- Filter & Action Bar --- */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-gradient-to-r from-white to-slate-50 p-4 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto flex-1">
                    <div className="relative w-full sm:w-72 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Cari nama atau email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none font-medium text-sm shadow-sm"
                        />
                    </div>
                    {roleFilter !== 'all' && (
                        <motion.button
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            onClick={() => setRoleFilter('all')}
                            className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors flex items-center gap-2"
                        >
                            🔄 Reset Filter
                        </motion.button>
                    )}
                </div>

                {['super_admin', 'super_admin_kota', 'super_admin_rt'].includes(currentUser?.role) && (
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={openAddModal}
                        className="w-full md:w-auto bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all text-sm"
                    >
                        <Plus size={18} /> Tambah User
                    </motion.button>
                )}
            </div>

            {/* User Grid */}
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
                        <p className="text-slate-500 font-medium">Memuat data user...</p>
                    </div>
                </div>
            ) : filteredUsers.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-20 bg-gradient-to-br from-slate-50 to-white rounded-3xl border-2 border-dashed border-slate-200"
                >
                    <div className="w-20 h-20 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
                        <User size={36} className="text-slate-400" />
                    </div>
                    <p className="text-slate-600 font-bold text-lg mb-1">User tidak ditemukan</p>
                    <p className="text-slate-400 text-sm">Coba ubah kata kunci pencarian atau filter</p>
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    <AnimatePresence>
                        {filteredUsers.map((user, index) => {
                            const roleStyle = ROLE_STYLES[user.role] || ROLE_STYLES.nasabah;
                            const RoleIcon = roleStyle.icon;

                            return (
                                <motion.div
                                    key={user.id}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ delay: index * 0.05, type: "spring", stiffness: 100 }}
                                    whileHover={{ y: -6, scale: 1.01 }}
                                    className={`${roleStyle.bg} rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all relative group cursor-pointer border ${roleStyle.border}`}
                                >
                                    {/* Gradient bar on top */}
                                    <div className={`h-1.5 bg-gradient-to-r ${roleStyle.gradient}`}></div>

                                    <div className="p-5">
                                        {/* Actions - Only for Super Admin */}
                                        {['super_admin', 'super_admin_kota', 'super_admin_rt'].includes(currentUser?.role) && (
                                            <div className="absolute top-6 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
                                                <motion.button
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={() => openEditModal(user)}
                                                    className="p-2.5 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition-colors shadow-md border border-blue-100"
                                                    title="Edit"
                                                >
                                                    <Edit2 size={16} />
                                                </motion.button>
                                                <motion.button
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={() => handleDelete(user.id)}
                                                    className="p-2.5 bg-white text-red-600 rounded-xl hover:bg-red-50 transition-colors shadow-md border border-red-100"
                                                    title="Hapus"
                                                >
                                                    <Trash2 size={16} />
                                                </motion.button>
                                            </div>
                                        )}

                                        {/* User Info */}
                                        <div className="flex items-center gap-4 mb-4">
                                            <motion.div
                                                whileHover={{ scale: 1.05 }}
                                                className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${roleStyle.gradient} p-0.5 shadow-lg flex-shrink-0`}
                                            >
                                                <div className="w-full h-full rounded-[14px] bg-white overflow-hidden flex items-center justify-center">
                                                    {(user.photo_path || user.customer?.photo_path) ? (
                                                        <img
                                                            src={(() => {
                                                                const photoPath = user.photo_path || user.customer?.photo_path;
                                                                if (photoPath.startsWith('http')) return photoPath;
                                                                return `/storage/${photoPath}`;
                                                            })()}
                                                            alt={user.name}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                                                        />
                                                    ) : null}
                                                    <div className={`w-full h-full items-center justify-center bg-gradient-to-br ${roleStyle.gradient} ${(user.photo_path || user.customer?.photo_path) ? 'hidden' : 'flex'}`}>
                                                        <User size={24} className="text-white" />
                                                    </div>
                                                </div>
                                            </motion.div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-slate-800 text-lg leading-tight truncate">{user.name}</h3>
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${roleStyle.badge} text-white text-xs font-bold mt-1.5 shadow-sm`}>
                                                    <RoleIcon size={12} />
                                                    {roleStyle.label}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Location Info - Bank Sampah */}
                                        {(user.bank_sampah || user.customer?.bank_sampah || user.customer?.rt) && (
                                            <div className="flex items-start gap-2 mt-2 bg-white/60 backdrop-blur-sm rounded-lg p-2 border border-white/80">
                                                <MapPin size={14} className={`${roleStyle.text} mt-0.5 flex-shrink-0`} />
                                                <div className="text-xs text-slate-600 leading-relaxed">
                                                    {(user.bank_sampah?.name || user.customer?.bank_sampah?.name) ? (
                                                        <>
                                                            <span className="font-semibold text-slate-700">
                                                                {user.bank_sampah?.name || user.customer?.bank_sampah?.name}
                                                            </span>
                                                            {(user.bank_sampah?.alamat || user.customer?.bank_sampah?.alamat) && (
                                                                <span className="text-slate-400 ml-1">
                                                                    ({user.bank_sampah?.alamat || user.customer?.bank_sampah?.alamat})
                                                                </span>
                                                            )}
                                                        </>
                                                    ) : (user.customer?.rt || user.customer?.rw) ? (
                                                        <span>RT {user.customer?.rt || '-'}/RW {user.customer?.rw || '-'}</span>
                                                    ) : null}
                                                </div>
                                            </div>
                                        )}

                                        {/* Contact Info */}
                                        <div className="space-y-2.5 bg-white/60 backdrop-blur-sm rounded-xl p-3 border border-white/80">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${roleStyle.gradient} flex items-center justify-center`}>
                                                    <Mail size={14} className="text-white" />
                                                </div>
                                                <span className="text-sm text-slate-600 truncate flex-1 font-medium">{user.email}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${roleStyle.gradient} flex items-center justify-center`}>
                                                    <Calendar size={14} className="text-white" />
                                                </div>
                                                <span className="text-sm text-slate-500">
                                                    Terdaftar: {new Date(user.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div >
                            );
                        })}
                    </AnimatePresence >
                </div >
            )}

            {
                showAddModal && (
                    <AddUserModal
                        onClose={() => setShowAddModal(false)}
                        initialData={editingUser}
                        onAddUser={handleSaveUser}
                        isLoading={actionLoading}
                        customers={customers}
                    />
                )
            }
        </motion.div >
    );
}
