import React from 'react';
import { LayoutDashboard, Users as UsersIcon, Package, History, Settings, LogOut, ChevronLeft, ChevronRight, Users, Archive, Leaf, Building2 } from 'lucide-react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';

import logoImage from '../../assets/Sibanka Logo - Circular Recycling Arrows.png';

// eslint-disable-next-line no-unused-vars
const MenuLink = ({ icon: Icon, label, active, onClick }) => {
    return (
        <motion.button
            onClick={onClick}
            className={`relative flex items-center gap-3 w-full p-4 rounded-xl transition-all font-medium ${active ? 'text-white shadow-lg shadow-emerald-500/25' : 'text-slate-600 hover:text-emerald-600 hover:bg-emerald-50/80'}`}
            whileHover={{ scale: 1.02, x: 5 }}
            whileTap={{ scale: 0.98 }}
        >
            {active && (
                <motion.div
                    layoutId="active-pill"
                    className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl -z-10 shadow-md border border-white/20"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
            )}
            <Icon size={22} className={active ? 'text-white drop-shadow-sm' : 'text-slate-400 group-hover:text-emerald-500'} />
            <span className="tracking-wide text-sm font-semibold">{label}</span>
        </motion.button>
    );
};

export function DesktopSidebar({ activeMenu, setActiveMenu, onLogout, isOpen, setIsOpen, user, isNasabah }) {
    // Role checks untuk hierarki 5 role
    const isSuperAdminKota = ['super_admin', 'super_admin_kota'].includes(user?.role);
    const _isAdminKota = user?.role === 'admin_kota';
    const isSuperAdminRT = user?.role === 'super_admin_rt';
    const canManageUsers = isSuperAdminKota || isSuperAdminRT;

    return (
        <motion.div
            initial={{ x: 0, opacity: 1 }}
            animate={{ x: isOpen ? 0 : -320, opacity: isOpen ? 1 : 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="hidden 2xl:flex w-72 h-[calc(100vh-2rem)] fixed left-4 top-4 z-50 flex-col"
        >
            <div className="h-full rounded-3xl flex flex-col shadow-2xl overflow-hidden border border-white/40 relative bg-white/60 backdrop-blur-xl ring-1 ring-white/50">
                <button
                    onClick={() => setIsOpen(false)}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1 rounded-full transition-all 2xl:hidden"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 6 6 18" />
                        <path d="m6 6 12 12" />
                    </svg>
                </button>

                <div className="p-8 pb-4 flex flex-col items-center">
                    <div className="w-48 h-48 flex items-center justify-center hover:scale-105 transition-transform duration-500">
                        <img src={logoImage} alt="Si Banka Logo" className="w-full h-full object-contain filter drop-shadow-xl" />
                    </div>
                    <div className="mt-[-10px] bg-white/60 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/30 shadow-sm">
                        <p className="text-[10px] font-bold text-emerald-600 tracking-[0.2em] uppercase">
                            {isNasabah ? 'Nasabah Portal' : 'Admin Dashboard'}
                        </p>
                    </div>
                </div>

                <div className="px-6 py-4 flex-1 overflow-y-auto custom-scrollbar">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 px-4">Menu Utama</p>
                    <nav className="space-y-2">
                        <MenuLink icon={LayoutDashboard} label="Dashboard" active={activeMenu === 'dashboard'} onClick={() => { setActiveMenu('dashboard'); setIsOpen(false); }} />
                        <MenuLink icon={Users} label="Data Nasabah" active={activeMenu === 'nasabah'} onClick={() => { setActiveMenu('nasabah'); setIsOpen(false); }} />
                        <MenuLink icon={Archive} label="Stok & Harga" active={activeMenu === 'stok'} onClick={() => { setActiveMenu('stok'); setIsOpen(false); }} />
                        <MenuLink icon={History} label="Riwayat" active={activeMenu === 'riwayat'} onClick={() => { setActiveMenu('riwayat'); setIsOpen(false); }} />
                    </nav>

                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-8 mb-4 px-4">Lainnya</p>
                    <nav className="space-y-2">
                        {isSuperAdminKota && !isNasabah && (
                            <MenuLink icon={Building2} label="Lokasi Bank Sampah" active={activeMenu === 'bankSampah'} onClick={() => { setActiveMenu('bankSampah'); setIsOpen(false); }} />
                        )}
                        {canManageUsers && !isNasabah && (
                            <MenuLink icon={Users} label="Manajemen User" active={activeMenu === 'userManagement'} onClick={() => { setActiveMenu('userManagement'); setIsOpen(false); }} />
                        )}
                        <MenuLink icon={Settings} label="Pengaturan" active={activeMenu === 'settings'} onClick={() => { setActiveMenu('settings'); setIsOpen(false); }} />
                    </nav>
                </div>

                <div className="p-6 bg-gradient-to-t from-white/40 to-transparent">
                    <button onClick={onLogout} className="flex items-center gap-3 text-slate-500 hover:text-red-500 hover:bg-red-50 hover:border-red-200 border border-slate-200/50 w-full p-4 rounded-xl transition-all font-semibold group backdrop-blur-sm shadow-sm bg-white/40">
                        <LogOut size={22} className="group-hover:text-red-500 transition-colors" />
                        <span className="group-hover:text-red-500 transition-colors">Keluar Aplikasi</span>
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
