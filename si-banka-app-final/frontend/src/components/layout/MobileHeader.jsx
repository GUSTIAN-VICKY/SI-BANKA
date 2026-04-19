import React from 'react';
import { Bell, Menu, CircleUser } from 'lucide-react';
import logoImage from '../../assets/Sibanka Logo - Circular Recycling Arrows.png';

export function MobileHeader({ user, onToggleSidebar, onNotificationClick, onProfileClick, notificationCount = 0 }) {
    return (
        <div className="2xl:hidden fixed top-0 left-0 right-0 z-40 px-5 py-4 transition-all duration-300 bg-white/80 backdrop-blur-xl border-b border-white/50 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
            <div className="flex justify-between items-center">
                {/* Left: Logo & Brand */}
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center border border-emerald-100/50 shadow-sm transform hover:scale-105 transition-transform" onClick={onToggleSidebar}>
                        {/* Make logo clickable for sidebar too */}
                        <img src={logoImage} alt="Logo" className="w-6 h-6 object-contain" />
                    </div>
                    <div>
                        <h1 className="text-base font-extrabold text-slate-800 leading-none tracking-tight">Si Banka</h1>
                        <p className="text-[10px] font-semibold text-emerald-600 tracking-wider uppercase mt-0.5">Mobile Admin</p>
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2">
                    {/* Notification */}
                    <button
                        onClick={onNotificationClick}
                        className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-50 active:bg-slate-100 transition-colors text-slate-500"
                    >
                        <Bell size={22} />
                        {notificationCount > 0 && (
                            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                        )}
                    </button>

                    {/* Profile Avatar */}
                    <div
                        className="w-10 h-10 rounded-full bg-slate-100 border-2 border-white shadow-sm overflow-hidden relative cursor-pointer active:scale-95 transition-transform ml-1"
                        onClick={onProfileClick}
                    >
                        {user?.photo ? (
                            <img src={user.photo} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-400">
                                <CircleUser size={24} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
