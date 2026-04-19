import { useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import {
    Recycle, Mail, Lock, User, MapPin, Building2,
    ArrowRight, ArrowLeft, CheckCircle, Loader2,
    Eye, EyeOff, AlertCircle, Sparkles, Leaf, Trees, Globe, RefreshCw, Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../utils/constants';

import logoImage from '../assets/Sibanka Logo - Circular Recycling Arrows.png';

import { FloatingParticle } from '../components/common/FloatingParticle';
import { StepIndicator } from '../components/common/StepIndicator';
import { InputField } from '../components/common/InputField';


const RegisterPage = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [resendSuccess, setResendSuccess] = useState(false);
    const [resendError, setResendError] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        bank_sampah_name: '',
        rt: '',
        rw: '',
        kelurahan: '',
        kecamatan: '',
        kota: '',
        alamat: '',
    });

    const [registrationResult, setRegistrationResult] = useState(null);

    // Particle configurations
    const particles = [
        { delay: 0, duration: 6, size: 80, left: 10, top: 20 },
        { delay: 1, duration: 8, size: 120, left: 70, top: 15 },
        { delay: 2, duration: 7, size: 60, left: 85, top: 60 },
        { delay: 1.5, duration: 9, size: 100, left: 20, top: 70 },
        { delay: 0.5, duration: 5, size: 40, left: 50, top: 80 },
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError(null);
    };

    const validateStep1 = () => {
        if (!formData.name.trim()) return 'Nama lengkap wajib diisi';
        if (!formData.email.trim()) return 'Email wajib diisi';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return 'Format email tidak valid';
        if (formData.password.length < 8) return 'Password minimal 8 karakter';
        if (formData.password !== formData.password_confirmation) return 'Konfirmasi password tidak cocok';
        return null;
    };

    const validateStep2 = () => {
        if (!formData.bank_sampah_name.trim()) return 'Nama Bank Sampah wajib diisi';
        if (!formData.rt.trim()) return 'RT wajib diisi';
        if (!formData.rw.trim()) return 'RW wajib diisi';
        if (!formData.kota.trim()) return 'Kota wajib diisi';
        return null;
    };

    const handleNextStep = () => {
        const validationError = validateStep1();
        if (validationError) {
            setError(validationError);
            return;
        }
        setStep(2);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationError = validateStep2();
        if (validationError) {
            setError(validationError);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_BASE_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.errors) {
                    const firstError = Object.values(data.errors)[0];
                    throw new Error(Array.isArray(firstError) ? firstError[0] : firstError);
                }
                throw new Error(data.message || 'Registrasi gagal');
            }

            setRegistrationResult(data);
            setStep(3);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex overflow-hidden">
            {/* Left Panel - Branding */}
            <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative bg-gradient-to-br from-slate-900 via-emerald-900 to-teal-900 p-12 flex-col justify-between overflow-hidden">
                {/* Floating Particles */}
                {particles.map((particle, i) => (
                    <FloatingParticle key={i} {...particle} />
                ))}

                {/* Animated Background Icon */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    className="absolute -right-20 -bottom-20 opacity-5"
                >
                    <Recycle size={400} strokeWidth={0.5} />
                </motion.div>

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
                        Bergabunglah<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
                            Sekarang!
                        </span>
                    </h2>
                    <p className="text-xl text-slate-300/80 leading-relaxed max-w-lg">
                        Daftarkan Bank Sampah RT Anda dan mulai kelola sampah dengan lebih efisien dan terorganisir.
                    </p>

                    {/* Benefits */}
                    <div className="mt-10 space-y-4">
                        {[
                            { icon: Trees, text: "Lingkungan lebih bersih & hijau" },
                            { icon: Globe, text: "Kontribusi untuk bumi yang lebih baik" },
                            { icon: Sparkles, text: "Manfaatkan sampah jadi berkah" },
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

                {/* Trust Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                    className="relative z-10"
                >
                    <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md rounded-2xl p-4">
                        <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center">
                            <CheckCircle className="text-white" size={24} />
                        </div>
                        <div>
                            <p className="text-white font-semibold">Gratis Selamanya</p>
                            <p className="text-slate-400 text-sm">Tanpa biaya tersembunyi</p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Right Panel - Register Form */}
            <div className="w-full lg:w-1/2 xl:w-[45%] flex items-center justify-center p-6 sm:p-8 lg:p-12 relative bg-gradient-to-br from-slate-50 to-slate-100 overflow-y-auto">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-100 rounded-full blur-3xl opacity-50" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-100 rounded-full blur-3xl opacity-50" />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="w-full max-w-lg relative z-10"
                >
                    {/* Mobile Logo */}
                    <div className="lg:hidden flex flex-col items-center mb-6">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", duration: 0.8 }}
                            className="w-20 h-20 flex items-center justify-center mb-4"
                        >
                            <img src={logoImage} alt="Si-Banka Logo" className="w-full h-full object-contain drop-shadow-xl" />
                        </motion.div>
                        <h1 className="text-2xl font-bold text-slate-800">Daftar Bank Sampah</h1>
                    </div>

                    {/* Step Indicator */}
                    <StepIndicator currentStep={step} totalSteps={3} />

                    {/* Form Card */}
                    <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 border border-slate-100">
                        <AnimatePresence mode="wait">
                            {/* Step 1: Personal Info */}
                            {step === 1 && (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                >
                                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Data Pribadi</h2>
                                    <p className="text-slate-500 mb-6">Lengkapi informasi akun Anda</p>

                                    <div className="space-y-4">
                                        <InputField
                                            icon={User}
                                            label="Nama Lengkap"
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="Masukkan nama lengkap"
                                        />

                                        <InputField
                                            icon={Mail}
                                            label="Email"
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="contoh@email.com"
                                        />

                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                                <Lock size={14} className="text-slate-400" />
                                                Password
                                            </label>
                                            <div className="relative">
                                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                                <input
                                                    type={showPassword ? 'text' : 'password'}
                                                    name="password"
                                                    value={formData.password}
                                                    onChange={handleChange}
                                                    className="w-full p-4 pl-12 pr-12 bg-white border-2 border-slate-200 rounded-2xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all outline-none font-medium text-slate-700 placeholder:text-slate-400"
                                                    placeholder="Minimal 8 karakter"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                                >
                                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                                <Lock size={14} className="text-slate-400" />
                                                Konfirmasi Password
                                            </label>
                                            <div className="relative">
                                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                                <input
                                                    type={showConfirmPassword ? 'text' : 'password'}
                                                    name="password_confirmation"
                                                    value={formData.password_confirmation}
                                                    onChange={handleChange}
                                                    className="w-full p-4 pl-12 pr-12 bg-white border-2 border-slate-200 rounded-2xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all outline-none font-medium text-slate-700 placeholder:text-slate-400"
                                                    placeholder="Ketik ulang password"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                                >
                                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Error Message */}
                                    <AnimatePresence>
                                        {error && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="mt-4 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-600 text-sm"
                                            >
                                                <AlertCircle size={18} />
                                                {error}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    <motion.button
                                        whileHover={{ scale: 1.02, y: -2 }}
                                        whileTap={{ scale: 0.98 }}
                                        type="button"
                                        onClick={handleNextStep}
                                        className="w-full mt-6 bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl shadow-emerald-500/30 relative overflow-hidden group"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
                                        <span>Lanjutkan</span>
                                        <ArrowRight size={18} className="w-0 opacity-0 group-hover:w-auto group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 ml-0 group-hover:ml-2" />
                                    </motion.button>

                                    <p className="text-center mt-6 text-slate-600">
                                        Sudah punya akun?{' '}
                                        <button
                                            onClick={() => navigate('/login')}
                                            className="text-emerald-600 font-bold hover:underline"
                                        >
                                            Login disini
                                        </button>
                                    </p>
                                </motion.div>
                            )}

                            {/* Step 2: Location Info */}
                            {step === 2 && (
                                <motion.form
                                    key="step2"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    onSubmit={handleSubmit}
                                >
                                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Lokasi Bank Sampah</h2>
                                    <p className="text-slate-500 mb-6">Tentukan lokasi Bank Sampah Anda</p>

                                    <div className="space-y-4">
                                        <InputField
                                            icon={Building2}
                                            label="Nama Bank Sampah"
                                            type="text"
                                            name="bank_sampah_name"
                                            value={formData.bank_sampah_name}
                                            onChange={handleChange}
                                            placeholder="Bank Sampah Makmur Jaya"
                                        />

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-semibold text-slate-700">RT *</label>
                                                <input
                                                    type="text"
                                                    name="rt"
                                                    value={formData.rt}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-4 bg-white border-2 border-slate-200 rounded-2xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all outline-none font-medium text-slate-700"
                                                    placeholder="001"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-semibold text-slate-700">RW *</label>
                                                <input
                                                    type="text"
                                                    name="rw"
                                                    value={formData.rw}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-4 bg-white border-2 border-slate-200 rounded-2xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all outline-none font-medium text-slate-700"
                                                    placeholder="002"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-semibold text-slate-700">Kelurahan</label>
                                                <input
                                                    type="text"
                                                    name="kelurahan"
                                                    value={formData.kelurahan}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-4 bg-white border-2 border-slate-200 rounded-2xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all outline-none font-medium text-slate-700"
                                                    placeholder="Sukamaju"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-semibold text-slate-700">Kecamatan</label>
                                                <input
                                                    type="text"
                                                    name="kecamatan"
                                                    value={formData.kecamatan}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-4 bg-white border-2 border-slate-200 rounded-2xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all outline-none font-medium text-slate-700"
                                                    placeholder="Cibeunying"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-700">Kota *</label>
                                            <input
                                                type="text"
                                                name="kota"
                                                value={formData.kota}
                                                onChange={handleChange}
                                                className="w-full px-4 py-4 bg-white border-2 border-slate-200 rounded-2xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all outline-none font-medium text-slate-700"
                                                placeholder="Bandung"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-700">Alamat Lengkap</label>
                                            <textarea
                                                name="alamat"
                                                value={formData.alamat}
                                                onChange={handleChange}
                                                rows={2}
                                                className="w-full px-4 py-4 bg-white border-2 border-slate-200 rounded-2xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all outline-none font-medium text-slate-700 resize-none"
                                                placeholder="Jl. Contoh No. 123"
                                            />
                                        </div>
                                    </div>

                                    {/* Error Message */}
                                    <AnimatePresence>
                                        {error && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="mt-4 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-600 text-sm"
                                            >
                                                <AlertCircle size={18} />
                                                {error}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    <div className="flex gap-3 mt-6">
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            type="button"
                                            onClick={() => setStep(1)}
                                            className="flex-1 bg-transparent border-2 border-emerald-500 text-emerald-600 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-50 transition-all duration-300 group"
                                        >
                                            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Kembali
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.02, y: -2 }}
                                            whileTap={{ scale: 0.98 }}
                                            type="submit"
                                            disabled={loading}
                                            className="flex-[2] bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl shadow-emerald-500/30 disabled:opacity-60 relative overflow-hidden group"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
                                            {loading ? (
                                                <Loader2 className="animate-spin" size={18} />
                                            ) : (
                                                <>
                                                    <span>Daftar Sekarang</span>
                                                    <CheckCircle size={18} />
                                                </>
                                            )}
                                        </motion.button>
                                    </div>
                                </motion.form>
                            )}

                            {/* Step 3: Success */}
                            {step === 3 && (
                                <motion.div
                                    key="step3"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-center py-8"
                                >
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", duration: 0.6 }}
                                        className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full mx-auto mb-6 flex items-center justify-center shadow-xl shadow-emerald-500/30"
                                    >
                                        <Mail size={48} className="text-white" />
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                    >
                                        <h2 className="text-3xl font-bold text-slate-800 mb-3">Registrasi Berhasil!</h2>
                                        <p className="text-slate-600 mb-6">
                                            Silakan cek email <strong className="text-emerald-600">{formData.email}</strong> untuk verifikasi akun Anda.
                                        </p>
                                    </motion.div>

                                    {registrationResult?.bank_sampah && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.3 }}
                                            className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-6 mb-6 text-left"
                                        >
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center">
                                                    <Building2 size={20} className="text-white" />
                                                </div>
                                                <p className="text-sm font-bold text-emerald-800">Bank Sampah Terdaftar</p>
                                            </div>
                                            <p className="text-emerald-800 font-bold text-lg">{registrationResult.bank_sampah.name}</p>
                                            <p className="text-emerald-600">
                                                RT {registrationResult.bank_sampah.rt}/RW {registrationResult.bank_sampah.rw}, {registrationResult.bank_sampah.kota}
                                            </p>
                                        </motion.div>
                                    )}

                                    {/* Expiration Notice */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.35 }}
                                        className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-start gap-3"
                                    >
                                        <Clock size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-amber-800 font-semibold text-sm">Link berlaku 24 jam</p>
                                            <p className="text-amber-700 text-xs">Segera verifikasi email Anda sebelum link kadaluarsa.</p>
                                        </div>
                                    </motion.div>

                                    {/* Resend Verification Button */}
                                    <motion.button
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4 }}
                                        whileHover={{ scale: resendLoading || resendSuccess ? 1 : 1.02 }}
                                        whileTap={{ scale: resendLoading || resendSuccess ? 1 : 0.98 }}
                                        onClick={async () => {
                                            if (resendLoading || resendSuccess) return;
                                            setResendLoading(true);
                                            setResendError(null);
                                            try {
                                                const res = await fetch(`${API_BASE_URL}/email/resend-verification`, {
                                                    method: 'POST',
                                                    headers: {
                                                        'Content-Type': 'application/json',
                                                        'Accept': 'application/json',
                                                    },
                                                    body: JSON.stringify({ email: formData.email }),
                                                });
                                                const data = await res.json();
                                                if (!res.ok) throw new Error(data.message || 'Gagal mengirim ulang');
                                                setResendSuccess(true);
                                            } catch (err) {
                                                setResendError(err.message);
                                            } finally {
                                                setResendLoading(false);
                                            }
                                        }}
                                        disabled={resendLoading || resendSuccess}
                                        className={`w-full py-3 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all mb-3 ${resendSuccess
                                            ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-300'
                                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-2 border-slate-200'
                                            }`}
                                    >
                                        {resendLoading ? (
                                            <Loader2 className="animate-spin" size={18} />
                                        ) : resendSuccess ? (
                                            <>
                                                <CheckCircle size={18} />
                                                <span>Email Terkirim!</span>
                                            </>
                                        ) : (
                                            <>
                                                <RefreshCw size={18} />
                                                <span>Kirim Ulang Email Verifikasi</span>
                                            </>
                                        )}
                                    </motion.button>

                                    {resendError && (
                                        <motion.p
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="text-red-600 text-sm text-center mb-3"
                                        >
                                            {resendError}
                                        </motion.p>
                                    )}

                                    <motion.button
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.45 }}
                                        whileHover={{ scale: 1.02, y: -2 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => navigate('/login')}
                                        className="w-full bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl shadow-emerald-500/30 relative overflow-hidden group"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
                                        <span>Ke Halaman Login</span>
                                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                    </motion.button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Footer */}
                    <p className="text-center text-slate-400 text-sm mt-6">
                        © {new Date().getFullYear()} Si-Banka. All rights reserved.
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default RegisterPage;
