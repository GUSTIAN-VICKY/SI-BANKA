import React, { useState } from 'react';
import { BarChart2 } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

const COLORS = [
    'bg-emerald-500', 'bg-blue-500', 'bg-orange-500', 'bg-purple-500',
    'bg-red-500', 'bg-yellow-500', 'bg-pink-500', 'bg-indigo-500',
    'bg-teal-500', 'bg-cyan-500', 'bg-lime-500'
];

export const TransactionStackedChart = ({ data, title, icon: Icon, iconClassName, hideHeader }) => {
    const ChartIcon = Icon || BarChart2;
    // Calculate max total for scaling
    const maxVal = Math.max(...data.map(d => d.total), 1000);

    // 1. Extract Unique Waste Types for Legend & Color Mapping
    const uniqueWasteTypes = Array.from(new Set(
        data.flatMap(d => d.items.map(i => i.name))
    ));

    // Map each waste name to a stable color based on its index in unique list
    const colorMap = {};
    uniqueWasteTypes.forEach((type, index) => {
        colorMap[type] = COLORS[index % COLORS.length];
    });

    const getColor = (name) => colorMap[name] || 'bg-gray-300';

    // Tooltip State
    const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0, data: null });

    const handleMouseMove = (e, trx) => {
        setTooltip({
            show: true,
            x: e.clientX,
            y: e.clientY,
            data: trx
        });
    };

    const handleMouseLeave = () => {
        setTooltip(prev => ({ ...prev, show: false }));
    };

    return (
        <div className={hideHeader ? "" : "bg-white rounded-3xl shadow-sm border border-gray-100 p-6 relative"}>
            {/* Cursor Follower Tooltip */}
            {tooltip.show && tooltip.data && (
                <div
                    className="fixed z-50 min-w-[200px] bg-slate-900/95 backdrop-blur-sm text-white text-xs rounded-xl p-4 shadow-2xl pointer-events-none animate-fadeIn border border-white/10"
                    style={{
                        left: `${tooltip.x}px`,
                        top: `${tooltip.y}px`,
                        transform: 'translate(-50%, -110%)'
                    }}
                >
                    <p className="font-bold border-b border-white/20 pb-2 mb-2 text-center text-gray-100 text-sm">{tooltip.data.fullDate}</p>
                    <div className="space-y-2">
                        {tooltip.data.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between gap-3 items-center">
                                <span className="flex items-center gap-2">
                                    <span className={`w-2 h-2 rounded-full ${getColor(item.name)}`}></span>
                                    <span className="text-gray-300">{item.name}</span>
                                </span>
                                <span className="font-medium bg-white/10 px-1.5 py-0.5 rounded text-gray-100">{item.qty}kg</span>
                            </div>
                        ))}
                        <div className="pt-2 mt-2 border-t border-white/10 flex justify-between font-bold text-emerald-300 text-base">
                            <span>Total</span>
                            <span>{formatCurrency(tooltip.data.total)}</span>
                        </div>
                    </div>
                    {/* Triangle pointer */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900/95"></div>
                </div>
            )}

            {!hideHeader && (
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <h3 className={`text-lg font-bold text-gray-800 flex items-center gap-2`}>
                        <ChartIcon size={20} className={iconClassName} /> {title}
                    </h3>

                    {/* Legend */}
                    <div className="flex flex-wrap gap-3">
                        {uniqueWasteTypes.map(type => (
                            <div key={type} className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
                                <span className={`w-3 h-3 rounded-full ${getColor(type)}`}></span>
                                {type}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Chart Area */}
            <div className="relative h-72 w-full mt-8">
                {/* Y-Axis Grid Lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-xs text-gray-300">
                    <div className="border-b border-gray-100 w-full flex items-end pb-1">{formatCurrency(maxVal)}</div>
                    <div className="border-b border-gray-100 w-full flex items-end pb-1">{formatCurrency(maxVal * 0.75)}</div>
                    <div className="border-b border-gray-100 w-full flex items-end pb-1">{formatCurrency(maxVal * 0.5)}</div>
                    <div className="border-b border-gray-100 w-full flex items-end pb-1">{formatCurrency(maxVal * 0.25)}</div>
                    <div className="border-b border-gray-100 w-full">0</div>
                </div>

                <div className="absolute inset-0 flex justify-between items-end h-full gap-4 md:gap-8 overflow-x-auto pb-6 px-4 z-10 no-scrollbar" onMouseLeave={handleMouseLeave}>
                    {data.length === 0 ? (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <BarChart2 size={48} className="opacity-20 mb-2" />
                            <p>Belum ada data transaksi</p>
                        </div>
                    ) : (
                    // eslint-disable-next-line no-unused-vars
                        data.map((trx, index) => (
                            <div
                                key={trx.id}
                                className="group relative flex-1 flex flex-col justify-end items-center h-full min-w-[60px] cursor-pointer"
                                onMouseMove={(e) => handleMouseMove(e, trx)} // Attach handler here
                            >
                                {/* Grouped Bars Container */}
                                <div className="w-full flex items-end justify-center gap-1 h-full py-0">
                                    {trx.items.map((item, idx) => {
                                        // Calculate height percentage relative to scales. 
                                        const barHeight = (item.value / maxVal) * 100;
                                        return (
                                            <div
                                                key={idx}
                                                className="flex flex-col justify-end items-center h-full group/bar transition-transform duration-300 group-hover:scale-105"
                                            >
                                                <span className="text-[10px] font-bold text-gray-600 mb-1 opacity-100">{item.qty}kg</span>
                                                <div
                                                    className={`w-3 md:w-5 rounded-t-sm ${getColor(item.name)} transition-all duration-300 hover:brightness-110 origin-bottom shadow-sm`}
                                                    style={{ height: `${Math.max(barHeight, 2)}%` }} // Min height 2%
                                                ></div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <span className="text-[10px] sm:text-xs font-bold text-gray-500 mt-3 truncate max-w-full group-hover:text-emerald-600 transition-colors">{trx.date}</span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
