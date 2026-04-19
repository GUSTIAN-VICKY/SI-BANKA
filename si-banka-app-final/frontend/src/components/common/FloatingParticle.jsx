import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';

export const FloatingParticle = ({ delay, duration, size, left, top }) => (
    <motion.div
        className="absolute rounded-full bg-gradient-to-br from-emerald-400/30 to-teal-400/20"
        style={{ width: size, height: size, left: `${left}%`, top: `${top}%` }}
        animate={{
            y: [-20, 20, -20],
            x: [-10, 10, -10],
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
            duration: duration,
            repeat: Infinity,
            delay: delay,
            ease: "easeInOut",
        }}
    />
);
