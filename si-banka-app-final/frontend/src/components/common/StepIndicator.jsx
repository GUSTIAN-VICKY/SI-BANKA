import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { User, MapPin, CheckCircle } from 'lucide-react';

export const StepIndicator = ({ currentStep}) => {
    const steps = [
        { num: 1, title: 'Data Pribadi', icon: User },
        { num: 2, title: 'Lokasi', icon: MapPin },
        { num: 3, title: 'Selesai', icon: CheckCircle },
    ];

    return (
        <div className="flex items-center justify-center gap-2 mb-8">
            {steps.map((step, i) => (
                <div key={step.num} className="flex items-center">
                    <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{
                            scale: currentStep === step.num ? 1.1 : 1,
                            backgroundColor: currentStep >= step.num ? '#10b981' : '#e2e8f0',
                        }}
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${currentStep >= step.num
                            ? 'text-white shadow-lg shadow-emerald-500/30'
                            : 'text-slate-500'
                            }`}
                    >
                        {currentStep > step.num ? (
                            <CheckCircle size={18} />
                        ) : (
                            <step.icon size={18} />
                        )}
                    </motion.div>
                    {i < steps.length - 1 && (
                        <div className={`w-16 h-1 mx-2 rounded-full transition-colors ${currentStep > step.num ? 'bg-emerald-500' : 'bg-slate-200'
                            }`} />
                    )}
                </div>
            ))}
        </div>
    );
};
