import React from 'react';
import { Award } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export const TopNasabahCard = ({ customers }) => {
    const top3 = customers.sort((a, b) => b.balance - a.balance).slice(0, 3);
    const colors = ['text-yellow-500', 'text-gray-400', 'text-yellow-700'];
    return (
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2"><Award size={20} className="text-yellow-500" /> Nasabah Teraktif (by Saldo)</h3>
        <div className="space-y-4">
          {top3.map((cust, index) => (
            <div key={cust.id} className="flex items-center gap-4">
              <Award size={24} className={colors[index]} />
              <div className="flex-1">
                <p className="font-bold text-gray-800">{cust.name}</p>
                <p className="text-xs text-gray-500">Terakhir setor: {cust.last_deposit.slice(5)}</p>
              </div>
              <span className="font-bold text-lg text-green-600">{formatCurrency(cust.balance)}</span>
            </div>
          ))}
        </div>
      </div>
    );
};
