import React from 'react';
import { UserPlus } from 'lucide-react';

export function AddCustomerSuccessModal({ customerName, onClose }) {
  if (!customerName) return null;
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center z-[100] animate-fadeIn p-4 md:p-0">
      <div className="bg-white w-full md:max-w-md rounded-t-3xl md:rounded-3xl shadow-2xl p-6 pt-10 animate-slideUp md:animate-fadeIn relative text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 mx-auto ring-4 ring-green-50">
          <UserPlus size={32} className="text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Nasabah Ditambahkan!</h2>
        <p className="text-gray-500 mb-6 text-lg">Nasabah baru bernama <strong>{customerName}</strong> telah berhasil disimpan.</p>
        <button onClick={onClose} className="w-full bg-gray-800 text-white py-3 rounded-xl font-bold hover:bg-gray-700 transition-colors">Selesai</button>
      </div>
    </div>
  );
};
