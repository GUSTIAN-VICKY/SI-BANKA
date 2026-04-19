import React from 'react';
import { BarChart2 } from 'lucide-react';

export const TrendChart = ({ trendData, title, icon: Icon, barClassName, iconClassName }) => {
    const maxVal = Math.max(...trendData.map(d => d.value), 1); 
    const ChartIcon = Icon || BarChart2;
    const chartTitle = title || "Grafik Tren";

    return (
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
        <h3 className={`text-lg font-bold text-gray-800 mb-4 flex items-center gap-2`}>
          <ChartIcon size={20} className={iconClassName} /> {chartTitle}
        </h3>
        <div className="flex justify-between items-end h-40 gap-3" aria-label="Grafik batang">
          {trendData.map((item, index) => (
            <div key={index} className="flex-1 flex flex-col justify-end items-center gap-2 h-full"> 
              <div 
                className={`w-full transition-all rounded-t-lg ${barClassName}`}
                style={{ height: `${(item.value / maxVal) * 100}%` }}
                title={`${item.day}: ${item.value.toLocaleString()}`}
              ></div>
              <span className="text-xs font-bold text-gray-500">{item.day}</span>
            </div>
          ))}
        </div>
      </div>
    );
};
