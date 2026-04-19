import React from 'react';
import { LayoutDashboard, Users, Plus, Archive, History } from 'lucide-react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';

// eslint-disable-next-line no-unused-vars
const MobileNavLink = ({ icon: Icon, label, active, onClick }) => {
    return (
        <motion.button
            onClick={onClick}
            className={`relative flex flex-col items-center justify-center w-12 h-full transition-all duration-300`}
            whileTap={{ scale: 0.9 }}
        >
            <div className={`relative p-2 rounded-2xl transition-all duration-300 ${active ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'text-slate-400 hover:bg-slate-50 hover:text-emerald-500'}`}>
                <Icon size={20} strokeWidth={active ? 2.5 : 2} />
            </div>
            {active && (
                <span className="text-[9px] font-bold text-emerald-600 mt-1 absolute -bottom-3 w-16 text-center animate-fadeIn">
                    {label}
                </span>
            )}
        </motion.button>
    );
};

export function MobileBottomNav({ activeMenu, setActiveMenu, setShowNewTransactionModal, isNasabah }) {
    return (
        <div className="2xl:hidden fixed bottom-4 left-0 right-0 z-50 px-4 pointer-events-none flex justify-center">
            {/* Detached Floating Nav */}
            <div className="pointer-events-auto bg-white/95 backdrop-blur-2xl border border-white/40 shadow-2xl rounded-[2.5rem] px-2 py-3 flex justify-between items-center w-full max-w-sm relative">

                <div className="flex-1 flex justify-around">
                    <MobileNavLink icon={LayoutDashboard} label="Home" active={activeMenu === 'dashboard'} onClick={() => setActiveMenu('dashboard')} />
                    <MobileNavLink icon={Users} label="Nasabah" active={activeMenu === 'nasabah'} onClick={() => setActiveMenu('nasabah')} />
                </div>

                {/* Central Floating Action Button (FAB) - Sembunyikan untuk nasabah */}
                {!isNasabah && (
                    <div className="relative -top-8 -mx-2 z-10">
                        <motion.div
                            className="bg-white p-1.5 rounded-full shadow-sm"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <button
                                onClick={() => setShowNewTransactionModal(true)}
                                className="bg-gradient-to-br from-emerald-500 to-teal-500 text-white w-14 h-14 rounded-full shadow-lg shadow-emerald-500/40 flex items-center justify-center border-2 border-emerald-400/20 transition-transform active:shadow-none"
                            >
                                <Plus size={28} strokeWidth={3} />
                            </button>
                        </motion.div>
                    </div>
                )}

                <div className="flex-1 flex justify-around">
                    <MobileNavLink icon={Archive} label="Stok" active={activeMenu === 'stok'} onClick={() => setActiveMenu('stok')} />
                    <MobileNavLink icon={History} label="Riwayat" active={activeMenu === 'riwayat'} onClick={() => setActiveMenu('riwayat')} />
                </div>

            </div>
        </div>
    );
}
