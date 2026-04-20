// eslint-disable-next-line no-unused-vars
import React, { useState } from 'react';
import { X, Check, Tag, Truck, Loader2 } from 'lucide-react';
import { useModalClose } from '../../hooks/useModalClose';

export function UpdatePriceModal({ item, onClose, onSave, updateLog, geminiLoading, error }) {
  useModalClose(onClose);

  // Check mobile or short landscape
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 768 || window.innerHeight < 700);

  const [newPrice, setNewPrice] = React.useState(item.price);
  const [newStock, _setNewStock] = React.useState(item.stok);
  const itemHistory = updateLog.filter(log => log.itemId === item.id);
  const [localError, setLocalError] = React.useState(null);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768 || window.innerHeight < 700);
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSubmit = async () => {
    setLocalError(null);
    if (newPrice === '' || newStock === '') {
      setLocalError("Harga baru dan stok baru wajib diisi!");
      return;
    }
    await onSave(item.id, newPrice, newStock);
  };

  return (
    <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center z-[100] animate-fadeIn p-4 md:p-0"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className={`bg-white w-full shadow-2xl overflow-hidden animate-slideUp md:animate-fadeIn relative flex flex-col md:flex-row ${!isMobile ? 'md:max-w-4xl md:rounded-3xl' : 'h-full rounded-none'}`}
      >

        {/* Close Button (Mobile Absolute) */}
        <button onClick={onClose} className="absolute right-4 top-4 md:hidden z-20 bg-gray-100 p-2 rounded-full text-gray-500 hover:bg-gray-200"><X size={20} /></button>

        {/* LEFT: Form Inputs */}
        <div className="flex-1 p-6 md:p-8 flex flex-col h-full overflow-y-auto custom-scrollbar relative">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-1 flex items-center gap-2">
                <span className="text-3xl">{item.icon}</span> Update {item.name}
              </h3>
              <p className="text-sm text-gray-500">Update harga pasar terkini.</p>
            </div>
            {/* Desktop Close */}
            <button onClick={onClose} className="hidden md:block text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 p-2 rounded-full transition-colors"><X size={20} /></button>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-6 flex-1 flex flex-col">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Harga Baru (Rp)</label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold group-focus-within:text-green-600 transition-colors">Rp</span>
                  <input
                    type="number"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:border-green-500 focus:ring-4 focus:ring-green-500/10 text-xl font-bold text-gray-800 outline-none transition-all"
                    required
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Stok Saat Ini</label>
                <div className="relative">
                  <input
                    type="text"
                    value={`${item.stok} kg`}
                    readOnly
                    className="w-full px-4 py-3 border border-gray-200 bg-gray-50 text-gray-500 rounded-xl font-semibold cursor-not-allowed"
                  />
                  <div className="mt-2 text-xs text-blue-600 bg-blue-50 p-2 rounded-lg flex items-center gap-2 font-medium">
                    <Truck size={14} /> Stok diperbarui otomatis dari transaksi.
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-auto pt-6">
              {(localError || error) && <p className="text-red-500 text-sm font-bold bg-red-50 p-3 rounded-xl mb-4 flex items-center gap-2"><X size={16} /> {localError || error}</p>}

              <button type="submit" disabled={geminiLoading} className="w-full bg-green-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-green-700 transition-all shadow-lg hover:shadow-green-600/30 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed">
                {geminiLoading ? <Loader2 className="animate-spin" size={24} /> : <Check size={24} />}
                {geminiLoading ? 'Menyimpan...' : 'Simpan Harga'}
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT: History Log */}
        <div className={`w-full md:w-80 bg-gray-50 border-l border-gray-200 flex flex-col ${isMobile ? 'h-64 border-t' : 'h-auto'} md:h-auto`}>
          <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white/50 backdrop-blur-sm sticky top-0 md:static">
            <h4 className="font-bold text-gray-700 text-sm uppercase tracking-wider flex items-center gap-2">
              <Tag size={16} className="text-green-600" /> Riwayat
            </h4>
            <span className="bg-gray-200 text-gray-600 text-[10px] px-2 py-0.5 rounded-full font-bold">{itemHistory.length}</span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {itemHistory.length > 0 ? [...itemHistory].reverse().map((history, index) => (
              <div key={index} className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-1 relative overflow-hidden">
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${history.changeType === 'Harga' ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                <div className="flex justify-between items-start">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${history.changeType === 'Harga' ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'}`}>{history.changeType}</span>
                  <span className="text-[10px] text-gray-400 font-mono">{history.date}</span>
                </div>
                <div className="flex items-center gap-2 text-sm mt-1">
                  <span className="text-gray-400 line-through text-xs">{history.oldValue.toLocaleString()}</span>
                  <span className="text-gray-300">→</span>
                  <span className="font-bold text-gray-800">{history.newValue.toLocaleString()}</span>
                </div>
              </div>
            )) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-300 opacity-60">
                <Tag size={32} className="mb-2" />
                <p className="text-xs text-center px-4">Belum ada riwayat perubahan.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
