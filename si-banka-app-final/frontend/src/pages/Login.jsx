import React, { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, LogIn, Lock, User, Building2, Leaf, Recycle, ArrowRight, Sparkles, CheckCircle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

import logoImage from '../assets/Sibanka Logo - Circular Recycling Arrows.png';
import { auth } from '../services';

// Floating Particle Component
const FloatingParticle = ({ delay, duration, size, left, top }) => (
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

// Animated Recycling Icon
const AnimatedRecycleIcon = () => (
  <motion.div
    animate={{ rotate: 360 }}
    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
    className="absolute -right-20 -bottom-20 opacity-5"
  >
    <Recycle size={400} strokeWidth={0.5} />
  </motion.div>
);

export function LoginPage({ onLogin }) {
  const navigate = useNavigate();
  const location = useLocation(); // Added hook
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(''); // Added success state
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  // Check for verified query param
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('verified') === '1') {
      setSuccess('Email berhasil diverifikasi! Silakan login.');
    }
  }, [location]);

  // Particle configurations... (unchanged)

  const particles = [
    { delay: 0, duration: 6, size: 80, left: 10, top: 20 },
    { delay: 1, duration: 8, size: 120, left: 70, top: 15 },
    { delay: 2, duration: 7, size: 60, left: 85, top: 60 },
    { delay: 1.5, duration: 9, size: 100, left: 20, top: 70 },
    { delay: 0.5, duration: 5, size: 40, left: 50, top: 80 },
    { delay: 3, duration: 6, size: 90, left: 5, top: 45 },
  ];

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await auth.login(username, password);
      onLogin(response.access_token, response.user);
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || 'Username atau password salah.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex overflow-hidden">
      {/* Left Panel - Branding & Info */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative bg-gradient-to-br from-slate-900 via-emerald-900 to-teal-900 p-12 flex-col justify-between overflow-hidden">
        {/* Floating Particles */}
        {particles.map((particle, i) => (
          <FloatingParticle key={i} {...particle} />
        ))}

        {/* Animated Background Icon */}
        <AnimatedRecycleIcon />

        {/* Decorative Gradient Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-teal-500/20 rounded-full blur-[80px]" />

        {/* Logo Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10"
        >
          <div className="flex items-center gap-4 mb-4">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 10 }}
              className="w-20 h-20 flex items-center justify-center"
            >
              <img src={logoImage} alt="Si-Banka Logo" className="w-full h-full object-contain drop-shadow-lg" />
            </motion.div>
            <div>
              <h1 className="text-3xl font-bold text-white">Si-Banka</h1>
              <p className="text-emerald-300/80 text-sm">Sistem Bank Sampah Digital</p>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="relative z-10 flex-1 flex flex-col justify-center py-12"
        >
          <h2 className="text-5xl xl:text-6xl font-black text-white leading-tight mb-6">
            Kelola Sampah,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
              Selamatkan Bumi
            </span>
          </h2>
          <p className="text-xl text-slate-300/80 leading-relaxed max-w-lg">
            Platform manajemen bank sampah modern yang memudahkan pengelolaan sampah di lingkungan RT/RW Anda.
          </p>

          {/* Feature Highlights */}
          <div className="mt-10 space-y-4">
            {[
              { icon: Building2, text: "Multi-tenant untuk setiap RT" },
              { icon: Recycle, text: "Pencatatan transaksi otomatis" },
              { icon: Sparkles, text: "Dashboard analitik real-time" },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="flex items-center gap-4 text-slate-300/90"
              >
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <feature.icon size={20} className="text-emerald-400" />
                </div>
                <span className="font-medium">{feature.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Bottom Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="relative z-10 flex gap-8"
        >
          {[
            { value: "500+", label: "Bank Sampah" },
            { value: "10K+", label: "Nasabah" },
            { value: "50T", label: "Kg Sampah" },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl font-bold text-white">{stat.value}</div>
              <div className="text-sm text-slate-400">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 xl:w-[45%] flex items-center justify-center p-6 sm:p-8 lg:p-12 relative bg-gradient-to-br from-slate-50 to-slate-100">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-100 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-100 rounded-full blur-3xl opacity-50" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-md relative z-10"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex flex-col items-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.8 }}
              className="w-24 h-24 flex items-center justify-center mb-4"
            >
              <img src={logoImage} alt="Si-Banka Logo" className="w-full h-full object-contain drop-shadow-xl" />
            </motion.div>
            <h1 className="text-2xl font-bold text-slate-800">Si-Banka</h1>
            <p className="text-slate-500 text-sm">Sistem Bank Sampah Digital</p>
          </div>

          {/* Welcome Text */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Selamat Datang! </h2>
            <p className="text-slate-500">Masuk ke akun Anda untuk melanjutkan</p>
          </div>

          {/* Success Message */}
          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ height: 0, opacity: 0, y: -10 }}
                animate={{ height: "auto", opacity: 1, y: 0 }}
                exit={{ height: 0, opacity: 0, y: -10 }}
                className="bg-emerald-50 border border-emerald-200 text-emerald-600 p-4 rounded-2xl mb-6 text-sm font-medium flex items-center gap-3 overflow-hidden"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <CheckCircle size={18} />
                </div>
                {success}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Message Only */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ height: 0, opacity: 0, y: -10 }}
                animate={{ height: "auto", opacity: 1, y: 0 }}
                exit={{ height: 0, opacity: 0, y: -10 }}
                className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-2xl mb-6 text-sm font-medium flex items-center gap-3 overflow-hidden"
              >
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">⚠️</span>
                </div>
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Username Field */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <User size={14} className="text-slate-400" />
                Email / Username
              </label>
              <motion.div
                className={`relative rounded-2xl transition-all duration-300 ${focusedField === 'username'
                  ? 'ring-2 ring-emerald-500 ring-offset-2'
                  : ''
                  }`}
              >
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onFocus={() => setFocusedField('username')}
                  onBlur={() => setFocusedField(null)}
                  className="w-full p-4 pl-12 bg-white border-2 border-slate-200 rounded-2xl focus:border-emerald-500 focus:bg-white transition-all outline-none font-medium text-slate-700 placeholder:text-slate-400"
                  placeholder="Admin: email | Nasabah: nama"
                />
              </motion.div>
              <p className="text-xs text-slate-400 ml-1">Admin menggunakan email, Nasabah menggunakan username</p>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Lock size={14} className="text-slate-400" />
                Password
              </label>
              <motion.div
                className={`relative rounded-2xl transition-all duration-300 ${focusedField === 'password'
                  ? 'ring-2 ring-emerald-500 ring-offset-2'
                  : ''
                  }`}
              >
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  className="w-full p-4 pl-12 bg-white border-2 border-slate-200 rounded-2xl focus:border-emerald-500 focus:bg-white transition-all outline-none font-medium text-slate-700 placeholder:text-slate-400"
                  placeholder="Masukkan password Anda"
                />
              </motion.div>
            </div>

            {/* Login Button */}
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-emerald-500/30 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed mt-8 relative overflow-hidden group"
            >
              {/* Button Shine Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />

              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={22} />
                  <span>Sedang Masuk...</span>
                </>
              ) : (
                <>
                  <LogIn size={22} />
                  <span>Masuk Sekarang</span>
                  <ArrowRight size={18} className="w-0 opacity-0 group-hover:w-auto group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 ml-0 group-hover:ml-2" />
                </>
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-slate-400 text-sm font-medium">atau</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* Register Bank Sampah */}
          <div className="text-center">
            <p className="text-slate-600 mb-4">Ingin membuat Bank Sampah RT Anda sendiri?</p>
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/register')}
              className="w-full bg-slate-800 hover:bg-slate-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-lg transition-colors group"
            >
              <Building2 size={20} />
              <span>Daftar Bank Sampah Baru</span>
              <ArrowRight size={18} className="ml-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </motion.button>
          </div>

          {/* Footer */}
          <p className="text-center text-slate-400 mt-8 text-sm">
            © {new Date().getFullYear()} Si-Banka. All rights reserved.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
