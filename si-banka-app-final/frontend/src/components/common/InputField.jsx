import React, { useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';

export const InputField = ({ icon: Icon, label, ...props }) => {
    const [focused, setFocused] = useState(false);

    return (
        <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                {Icon && <Icon size={14} className="text-slate-400" />}
                {label}
            </label>
            <motion.div
                className={`relative rounded-2xl transition-all duration-300 ${focused ? 'ring-2 ring-emerald-500 ring-offset-2' : ''
                    }`}
            >
                {Icon && (
                    <Icon
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                        size={18}
                    />
                )}
                <input
                    {...props}
                    onFocus={(e) => {
                        setFocused(true);
                        props.onFocus?.(e);
                    }}
                    onBlur={(e) => {
                        setFocused(false);
                        props.onBlur?.(e);
                    }}
                    className={`w-full p-4 ${Icon ? 'pl-12' : 'px-4'} bg-white border-2 border-slate-200 rounded-2xl focus:border-emerald-500 transition-all outline-none font-medium text-slate-700 placeholder:text-slate-400`}
                />
            </motion.div>
        </div>
    );
};
