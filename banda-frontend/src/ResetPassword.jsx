import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

import mpajLogo from './assets/mpaj-logo.png';
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
            
            {/* Left Side: Branding */}
            <div 
                className="hidden lg:flex w-1/2 relative overflow-hidden flex-col justify-end p-16 bg-cover bg-center"
                style={{ backgroundImage: `url(${bangunanMpaj})` }}
            >
                <div className="absolute inset-0 bg-slate-900/60 mix-blend-multiply z-0 pointer-events-none" />
                <div className="absolute inset-0 bg-blue-900/40 mix-blend-overlay z-0 pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent z-0" />
                
                <div className="relative z-10 mb-8">
                    <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-[1.2] tracking-tight">
                        Track your<br/>
                        infrastructure complaints.
                    </h2>
                    <p className="text-emerald-500 text-sm font-bold tracking-[0.2em] uppercase">
                        SIMPLE • EFFICIENT • DETAILED
                    </p>
                </div>
            </div>

            {/* Right Side: Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 relative z-10 overflow-y-auto">
                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="w-full max-w-md mx-auto bg-white shadow-xl shadow-slate-200/50 border border-slate-100 rounded-3xl p-8"
                >
                    <motion.div variants={itemVariants} className="flex flex-col mb-8 items-center lg:items-start text-center lg:text-left">
                        <img src={mpajLogo} alt="MPAJ Logo" className="h-16 mb-6 object-contain" />
                        <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight mb-2">Tetapkan Semula</h1>
                        <p className="text-slate-500 font-medium text-sm">Sila masukkan kata laluan baharu anda.</p>
                    </motion.div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <motion.div variants={itemVariants} className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Kata Laluan Baharu</label>
                            <div className="relative group">
                                <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${focusedField === 'password' ? 'text-blue-800' : 'text-slate-400 group-hover:text-slate-500'}`} />
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    required
                                    value={formData.password}
                                    onFocus={() => setFocusedField('password')}
                                    onBlur={() => setFocusedField(null)}
                                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                                    className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-800/30 focus:border-blue-800 transition-all outline-none font-medium"
                                    placeholder="••••••••"
                                />
                                <button 
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-800 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants} className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Sahkan Kata Laluan</label>
                            <div className="relative group">
                                <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${focusedField === 'password_confirmation' ? 'text-blue-800' : 'text-slate-400 group-hover:text-slate-500'}`} />
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    required
                                    value={formData.password_confirmation}
                                    onFocus={() => setFocusedField('password_confirmation')}
                                    onBlur={() => setFocusedField(null)}
                                    onChange={(e) => setFormData({...formData, password_confirmation: e.target.value})}
                                    className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-800/30 focus:border-blue-800 transition-all outline-none font-medium"
                                    placeholder="••••••••"
                                />
                            </div>
                        </motion.div>

                        <motion.button 
                            variants={itemVariants}
                            type="submit" 
                            disabled={loading}
                            className="w-full mt-4 bg-blue-800 hover:bg-blue-900 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-800/20 hover:-translate-y-0.5 flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sahkan'} <ArrowRight className="w-5 h-5" />
                        </motion.button>
                    </form>
                </motion.div>
            </div>
        </div>
    );
};

export default ResetPassword;
