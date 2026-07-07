import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

import mpajLogo from './assets/mpaj-logo.png';
import bandaLogoFull from './assets/banda-logo-full.png';
import bangunanMpaj from './assets/bangunan-mpaj.jpg';

const ResetPassword = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [focusedField, setFocusedField] = useState(null);

    const [formData, setFormData] = useState({
        password: '',
        password_confirmation: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (formData.password !== formData.password_confirmation) {
            toast.error('Ralat', { description: 'Kata laluan tidak sepadan.' });
            return;
        }

        setLoading(true);

        try {
            await axios.post('/api/reset-password', {
                email,
                token,
                password: formData.password,
                password_confirmation: formData.password_confirmation
            });
            toast.success('Berjaya', { description: 'Kata laluan berjaya dikemas kini.' });
            setTimeout(() => navigate('/login'), 1500);
        } catch (error) {
            const msg = error.response?.data?.message || 'Terdapat ralat semasa mengemas kini kata laluan.';
            toast.error('Gagal', { description: msg });
        } finally {
            setLoading(false);
        }
    };

    // Staggered Animation Variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.08 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
    };

    return (
        <div className="h-screen overflow-hidden bg-slate-50 flex font-sans selection:bg-blue-800/20">
            
            {/* Left Side: Branding Banner */}
            <div 
                className="hidden lg:flex w-1/2 relative overflow-hidden flex-col justify-between p-12 lg:p-16 bg-cover bg-center border-r border-slate-200/60"
                style={{ backgroundImage: `url(${bangunanMpaj})` }}
            >
                {/* Improved Overlay - balanced opacity for building recognition & text readability */}
                <div className="absolute inset-0 bg-slate-950/40 mix-blend-multiply z-0 pointer-events-none" />
                <div className="absolute inset-0 bg-blue-900/25 mix-blend-overlay z-0 pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/50 to-transparent z-0" />
                
                {/* Desktop: Top Left Navigation inside Left Panel */}
                <div className="relative z-20 w-full">
                    <Link 
                        to="/" 
                        className="inline-flex items-center gap-2.5 py-2 px-3.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 backdrop-blur-md text-white transition-all duration-200 group w-fit shadow-sm"
                    >
                        <img src={bandaLogoFull} alt="BANDA+ Logo" className="h-6 md:h-7 object-contain brightness-0 invert" />
                        <span className="text-xs font-semibold tracking-wide text-slate-200 group-hover:text-white transition-colors border-l border-white/20 pl-2.5">
                            ← Utama
                        </span>
                    </Link>
                </div>

                {/* Improved Left Hero Section */}
                <div className="relative z-10 my-auto pt-12">
                    <h2 className="text-3xl lg:text-4xl xl:text-5xl font-black text-white mb-4 leading-[1.15] tracking-tight">
                        Report issues.<br/>
                        Monitor progress.<br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-amber-300">
                            Stay informed.
                        </span>
                    </h2>
                    <p className="text-slate-300 text-sm md:text-base font-medium max-w-sm leading-relaxed">
                        Official AI-powered infrastructure complaint management portal for Majlis Perbandaran Ampang Jaya.
                    </p>
                </div>

                <div className="relative z-10 flex items-center gap-2 text-xs font-bold text-slate-400 tracking-wider uppercase">
                    <span>MPAJ Digital Governance</span>
                </div>
            </div>

            {/* Right Side: Form Container */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center p-6 sm:p-8 lg:p-12 relative z-10 overflow-y-auto max-h-screen">
                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="w-full max-w-md mx-auto bg-white shadow-xl shadow-slate-200/40 border border-slate-100/80 rounded-3xl p-6 sm:p-8"
                >
                    {/* Mobile/Tablet: Top Navigation */}
                    <div className="lg:hidden w-full mb-4">
                        <Link 
                            to="/" 
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-800 transition-colors group"
                        >
                            <span className="transition-transform group-hover:-translate-x-1 inline-block">←</span>
                            <span>Kembali ke Laman Utama</span>
                        </Link>
                    </div>

                    {/* Improved Branding Hierarchy */}
                    <motion.div variants={itemVariants} className="flex flex-col mb-6">
                        <div className="flex flex-col pb-5 mb-5 border-b border-slate-100">
                            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 text-center lg:text-left">Official Platform</span>
                            <div className="flex items-center justify-center lg:justify-start gap-4 sm:gap-5">
                                <img src={mpajLogo} alt="MPAJ Logo" className="h-12 md:h-14 object-contain shrink-0" />
                                <div className="h-8 w-[1.5px] bg-slate-200 shrink-0"></div>
                                <img src={bandaLogoFull} alt="BANDA+ Logo" className="h-11 md:h-13 object-contain shrink-0" />
                            </div>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-1.5 text-center lg:text-left">Tetapkan Semula</h1>
                        <p className="text-slate-500 font-medium text-xs sm:text-sm text-center lg:text-left leading-relaxed">Sila masukkan kata laluan baharu anda.</p>
                    </motion.div>

                    {/* Improved Form Styling */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <motion.div variants={itemVariants} className="space-y-1.5">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block">Kata Laluan Baharu</label>
                            <div className="relative group">
                                <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-200 ${focusedField === 'password' ? 'text-blue-700' : 'text-slate-400 group-hover:text-slate-500'}`} />
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    required
                                    value={formData.password}
                                    onFocus={() => setFocusedField('password')}
                                    onBlur={() => setFocusedField(null)}
                                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                                    className="w-full pl-11 pr-11 py-3 bg-slate-50/70 hover:bg-slate-50 border border-slate-200/80 rounded-xl text-slate-800 placeholder:text-slate-400 text-sm focus:bg-white focus:ring-4 focus:ring-blue-700/10 focus:border-blue-700 transition-all duration-200 outline-none font-medium"
                                    placeholder="••••••••"
                                />
                                <button 
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-700 transition-colors focus:outline-none p-1"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants} className="space-y-1.5">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block">Sahkan Kata Laluan</label>
                            <div className="relative group">
                                <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-200 ${focusedField === 'password_confirmation' ? 'text-blue-700' : 'text-slate-400 group-hover:text-slate-500'}`} />
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    required
                                    value={formData.password_confirmation}
                                    onFocus={() => setFocusedField('password_confirmation')}
                                    onBlur={() => setFocusedField(null)}
                                    onChange={(e) => setFormData({...formData, password_confirmation: e.target.value})}
                                    className="w-full pl-11 pr-11 py-3 bg-slate-50/70 hover:bg-slate-50 border border-slate-200/80 rounded-xl text-slate-800 placeholder:text-slate-400 text-sm focus:bg-white focus:ring-4 focus:ring-blue-700/10 focus:border-blue-700 transition-all duration-200 outline-none font-medium"
                                    placeholder="••••••••"
                                />
                            </div>
                        </motion.div>

                        {/* Improved Primary Button */}
                        <motion.button 
                            variants={itemVariants}
                            type="submit" 
                            disabled={loading}
                            className="w-full mt-2 bg-blue-800 hover:bg-blue-900 active:scale-[0.99] text-white font-bold py-3.5 px-6 rounded-xl transition-all duration-200 shadow-lg shadow-blue-800/25 hover:shadow-xl hover:shadow-blue-800/35 hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-blue-800/20 disabled:opacity-60 disabled:pointer-events-none disabled:shadow-none flex items-center justify-center gap-2 text-sm"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                                    <span>Memproses...</span>
                                </>
                            ) : (
                                <>
                                    <span>Sahkan</span>
                                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                </>
                            )}
                        </motion.button>
                    </form>
                </motion.div>
            </div>
        </div>
    );
};

export default ResetPassword;
