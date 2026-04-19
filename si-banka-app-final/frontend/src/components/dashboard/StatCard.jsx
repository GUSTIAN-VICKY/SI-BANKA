import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';

export const RpIcon = ({ size }) => (<span className={`font-bold ${size > 30 ? 'text-3xl' : 'text-xl'}`}>Rp</span>);

// eslint-disable-next-line no-unused-vars
export const StatCard = ({ title, value, icon: Icon, color }) => {
    return (
        <motion.div 
            className="bg-white p-6 rounded-2xl shadow-md border border-gray-200/80 flex flex-col justify-between gap-4 transition-shadow hover:shadow-lg"
            whileHover={{ y: -5 }}
        >
            <div className="flex justify-between items-start">
                <p className="text-gray-500 font-semibold">{title}</p>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color} text-white shadow-md`}>
                    <Icon size={22} />
                </div>
            </div>
            <div>
                <h3 className="text-3xl font-bold text-gray-800 tracking-tight">{value}</h3>
            </div>
        </motion.div>
    );
};
