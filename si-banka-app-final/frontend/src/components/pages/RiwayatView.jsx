import React, { useState } from 'react';
import { Calendar, Trash2, ArrowUpRight, Search, FileClock, Edit, History } from 'lucide-react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency } from '../../utils/formatters';
import { showConfirm } from '../../utils/sweetAlert';
import { EditTransactionModal } from '../modals/EditTransactionModal';

export function RiwayatView({ historyTab, setHistoryTab, allTransactions, updateLog, customers, wasteTypes, handleDeleteTransaction, onUpdateTransaction, geminiLoading, error, isNasabah }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [editingTransaction, setEditingTransaction] = useState(null);

    const filteredTransactions = allTransactions.filter(trx => {
        const customerName = customers.find(c => c.id === trx.customerId)?.name || '';
        const term = searchTerm.toLowerCase();
        return (
            trx.customerId.toLowerCase().includes(term) ||
            trx.id.toLowerCase().includes(term) ||
            customerName.toLowerCase().includes(term)
        );
    }).sort((a, b) => new Date(b.date) - new Date(a.date));

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            <div className="flex gap-2 p-1 bg-white/40 backdrop-blur-md rounded-2xl w-fit border border-white/20 overflow-x-auto max-w-full">
                <button
                    onClick={() => setHistoryTab('transaksi')}
                    className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${historyTab === 'transaksi' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'text-slate-600 hover:bg-white/50'}`}
                >
                    Transaksi Penyetoran
                </button>

                <button
                    onClick={() => setHistoryTab('log')}
                    className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${historyTab === 'log' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'text-slate-600 hover:bg-white/50'}`}
                >
                    Log Perubahan Harga
                </button>
            </div>

            <div className="glass-card min-h-[500px]">
                {historyTab === 'transaksi' ? (
                    <div className="flex flex-col h-full">
                        <div className="p-6 border-b border-slate-100/50 flex flex-col md:flex-row justify-between items-center gap-4">
                            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2"><FileClock size={20} className="text-emerald-500" /> Riwayat Penyetoran</h3>
                            <div className="relative w-full md:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Cari ID / Customer..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                                />
                            </div>
                        </div>
                        <div className="flex-1 overflow-hidden">
                            {/* DESKTOP TABLE VIEW */}
                            <div className="hidden 2xl:block overflow-x-auto h-full custom-scrollbar">
                                <table className="w-full">
                                    <thead className="sticky top-0 bg-white z-10 shadow-sm">
                                        <tr className="bg-slate-50/50">
                                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Tanggal</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Nasabah</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Admin</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Detail Sampah</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Berat (Kg)</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Total (Rp)</th>
                                            <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100/50">
                                        <AnimatePresence>
                                            {filteredTransactions.map((trx, index) => {
                                                const customerName = customers.find(c => c.id === trx.customerId)?.name || 'Unknown';
                                                return (
                                                    <motion.tr
                                                        key={trx.id}
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        transition={{ delay: index * 0.05 }}
                                                        className="hover:bg-emerald-50/20"
                                                    >
                                                        <td className="px-6 py-4 text-sm text-slate-600">
                                                            <div className="flex items-center gap-2">
                                                                <Calendar size={14} className="text-slate-400" />
                                                                {new Date(trx.date).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace('.', ':')}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 font-bold text-slate-700">{customerName}</td>
                                                        <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                                                            <span
                                                                className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold border truncate max-w-[120px] whitespace-nowrap ${['super_admin', 'super_admin_kota', 'super_admin_rt'].includes(trx.user?.role) ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}
                                                                title={trx.user?.name || 'System / Deleted'}
                                                            >
                                                                {trx.user?.name || 'System / Deleted'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-slate-600">
                                                            <div className="flex flex-col gap-1">
                                                                {(trx.items || []).map((item, i) => (
                                                                    <span key={i} className="text-slate-700 font-medium h-6 flex items-center">
                                                                        {item.name}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-slate-600">
                                                            <div className="flex flex-col gap-1">
                                                                {(trx.items || []).map((item, i) => (
                                                                    <span key={i} className="bg-emerald-100 text-emerald-700 px-2 rounded text-[10px] font-bold border border-emerald-200 w-fit h-6 flex items-center">
                                                                        {item.qty} kg
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 font-bold text-emerald-600">{formatCurrency(trx.total)}</td>
                                                        <td className="px-6 py-4 text-center">
                                                            <div className="flex items-center justify-center gap-2">
                                                                {trx.proof_image && (
                                                                    <a
                                                                        href={`/storage/${trx.proof_image}`}
                                                                        target="_blank"
                                                                        rel="noreferrer"
                                                                        className="text-blue-400 hover:text-blue-600 transition-colors bg-white p-2 rounded-lg shadow-sm border border-slate-100"
                                                                        title="Lihat Bukti"
                                                                    >
                                                                        <FileClock size={16} />
                                                                    </a>
                                                                )}
                                                                {/* Edit/Delete buttons - only for admin */}
                                                                {!isNasabah && (
                                                                    <>
                                                                        <button
                                                                            onClick={() => setEditingTransaction(trx)}
                                                                            className="text-slate-400 hover:text-emerald-500 transition-colors bg-white p-2 rounded-lg shadow-sm border border-slate-100"
                                                                            title="Edit Transaksi"
                                                                        >
                                                                            <Edit size={16} />
                                                                        </button>
                                                                        <button
                                                                            onClick={async () => {
                                                                                const isConfirmed = await showConfirm({
                                                                                    title: 'Hapus Transaksi?',
                                                                                    text: 'Saldo nasabah akan disesuaikan secara otomatis.',
                                                                                    confirmText: 'Ya, Hapus'
                                                                                });
                                                                                if (isConfirmed) handleDeleteTransaction(trx.id);
                                                                            }}
                                                                            className="text-slate-400 hover:text-red-500 transition-colors bg-white p-2 rounded-lg shadow-sm border border-slate-100"
                                                                            title="Hapus Transaksi"
                                                                        >
                                                                            <Trash2 size={16} />
                                                                        </button>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </motion.tr>
                                                );
                                            })}
                                        </AnimatePresence>
                                    </tbody>
                                </table>
                            </div>

                            {/* MOBILE CARD VIEW */}
                            <div className="2xl:hidden p-4 space-y-4 pb-24">
                                {filteredTransactions.map((trx) => {
                                    const customerName = customers.find(c => c.id === trx.customerId)?.name || 'Unknown';
                                    return (
                                        <div key={trx.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4 relative overflow-hidden">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="font-black text-slate-800 text-lg">{formatCurrency(trx.total)}</h4>
                                                    <p className="text-sm font-bold text-slate-500">{customerName}</p>
                                                </div>
                                                <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${['super_admin', 'super_admin_kota', 'super_admin_rt'].includes(trx.user?.role) ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-500'}`}>
                                                    {trx.user?.name || 'System'}
                                                </span>
                                            </div>

                                            <div className="bg-slate-50 p-3 rounded-2xl space-y-2">
                                                {(trx.items || []).map((item, i) => (
                                                    <div key={i} className="flex justify-between items-center text-sm">
                                                        <span className="text-slate-700 font-medium">{item.name}</span>
                                                        <span className="bg-white px-2 py-0.5 rounded-md border border-slate-200 text-slate-500 text-xs font-bold">{item.qty} kg</span>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                                                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                                                    <Calendar size={12} />
                                                    {new Date(trx.date).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace('.', ':')}
                                                </div>
                                                <div className="flex gap-2">
                                                    {trx.proof_image && (
                                                        <a
                                                            href={`/storage/${trx.proof_image}`}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="p-2 bg-blue-50 text-blue-600 rounded-xl"
                                                        >
                                                            <FileClock size={18} />
                                                        </a>
                                                    )}
                                                    {/* Edit/Delete buttons - only for admin */}
                                                    {!isNasabah && (
                                                        <>
                                                            <button onClick={() => setEditingTransaction(trx)} className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                                                                <Edit size={18} />
                                                            </button>
                                                            <button
                                                                onClick={async () => {
                                                                    const isConfirmed = await showConfirm({
                                                                        title: 'Hapus Transaksi?',
                                                                        text: 'Saldo nasabah akan disesuaikan secara otomatis.',
                                                                        confirmText: 'Ya, Hapus'
                                                                    });
                                                                    if (isConfirmed) handleDeleteTransaction(trx.id);
                                                                }}
                                                                className="p-2 bg-red-50 text-red-600 rounded-xl"
                                                            >
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {filteredTransactions.length === 0 && (
                                <div className="p-12 text-center text-slate-400">Tidak ada riwayat transaksi.</div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col h-full">
                        <div className="p-6 border-b border-slate-100/50">
                            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2"><ArrowUpRight size={20} className="text-blue-500" /> Log Perubahan Harga</h3>
                        </div>
                        <div className="hidden 2xl:block overflow-x-auto flex-1">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-slate-50/50">
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Tanggal</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Item</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Perubahan</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Oleh</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100/50">
                                    {updateLog.map((log, index) => (
                                        <tr key={index} className="hover:bg-blue-50/20">
                                            <td className="px-6 py-4 text-sm text-slate-600">
                                                {new Date(log.date).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace('.', ':')}
                                            </td>
                                            <td className="px-6 py-4 font-bold text-slate-700">{log.itemName}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <span className="text-slate-400 line-through">{formatCurrency(log.oldValue)}</span>
                                                    <span className="text-slate-300">→</span>
                                                    <span className={`font-bold ${log.newValue > log.oldValue ? 'text-emerald-600' : 'text-red-500'}`}>{formatCurrency(log.newValue)}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-500 italic">
                                                <span className={`px-2 py-1 rounded-full text-xs not-italic border ${['super_admin', 'super_admin_kota', 'super_admin_rt'].includes(log.user?.role) ? 'bg-purple-100 text-purple-700 border-purple-200 font-bold' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                                                    {log.user?.name || log.admin || 'System'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* MOBILE CARD VIEW FOR PRICE LOG */}
                        <div className="2xl:hidden p-4 space-y-4 pb-24">
                            {updateLog.map((log, index) => (
                                <div key={index} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4 relative overflow-hidden">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-black text-slate-800 text-lg">{log.itemName}</h4>
                                            <div className="flex items-center gap-2 text-sm mt-1">
                                                <span className="text-slate-400 line-through text-xs">{formatCurrency(log.oldValue)}</span>
                                                <ArrowUpRight size={14} className="text-slate-300" />
                                                <span className={`font-bold ${log.newValue > log.oldValue ? 'text-emerald-600' : 'text-red-500'}`}>{formatCurrency(log.newValue)}</span>
                                            </div>
                                        </div>
                                        <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${['super_admin', 'super_admin_kota', 'super_admin_rt'].includes(log.user?.role) ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-500'}`}>
                                            {log.user?.name || log.admin || 'System'}
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                                        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                                            <Calendar size={12} />
                                            {new Date(log.date).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace('.', ':')}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {updateLog.length === 0 && (
                                <div className="p-12 text-center text-slate-400">Belum ada log perubahan harga.</div>
                            )}
                        </div>
                    </div>
                )}

            </div>

            {
                editingTransaction && (
                    <EditTransactionModal
                        transaction={editingTransaction}
                        customers={customers}
                        wasteTypes={wasteTypes}
                        onClose={() => setEditingTransaction(null)}
                        onSave={(id, data, photo) => {
                            console.log("onSave called in RiwayatView", { id, data, photo });
                            if (onUpdateTransaction) {
                                onUpdateTransaction(id, data, photo);
                            } else {
                                console.error("onUpdateTransaction is missing in RiwayatView");
                            }
                            setEditingTransaction(null);
                        }}
                        geminiLoading={geminiLoading}
                        error={error}
                    />
                )
            }
        </motion.div >
    );
}
