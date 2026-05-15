import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Loader2, Eye, EyeOff, Star } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import ReviewCarousel from './ReviewCarousel';

const Login = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [focusedField, setFocusedField] = useState(null); // Tracks which field is active
    
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/login`, formData);
            
            localStorage.setItem('token', response.data.access_token);
            localStorage.setItem('userRole', response.data.user.peranan || 'komuniti');

            toast.success('Log Masuk Berjaya!', { description: 'Selamat kembali ke sistem BANDA+.' });
            
            setTimeout(() => navigate('/dashboard'), 1000);

        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Sila semak e-mel dan kata laluan anda.';
            toast.error('Log Masuk Gagal', { description: errorMessage });
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
        <div className="min-h-screen bg-white flex font-sans selection:bg-teal-500/20">
            
            {/* Left Side: Branding (High Contrast Slate) */}
            <div className="hidden lg:flex w-1/2 bg-slate-900 relative overflow-hidden flex-col justify-between p-12">
                
                {/* Animated Orbs */}
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <motion.div 
                        animate={{ y: [-20, 20, -20], opacity: [0.15, 0.25, 0.15] }}
                        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-teal-500/20 blur-[120px]" 
                    />
                    <motion.div 
                        animate={{ y: [20, -20, 20], opacity: [0.1, 0.2, 0.1] }}
                        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                        className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-500/20 blur-[120px]" 
                    />
                </div>
                
                <Link to="/" className="relative z-10 flex items-center gap-3 w-fit">
                    <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center text-white text-xl border border-white/20 shadow-lg">🏛️</div>
                    <span className="text-2xl font-black text-white tracking-tight">BANDA<span className="text-teal-400">+</span></span>
                </Link>

                <div className="relative z-10 mt-20">
                    <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-[1.1] tracking-tight">
                        Selamat Kembali ke<br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">
                            Ekosistem Pintar.
                        </span>
                    </h2>
                    <p className="text-slate-400 text-lg max-w-md leading-relaxed font-medium">
                        Pantau status aduan anda, urus tugasan penyelenggaraan, dan pastikan Ampang Jaya kekal sejahtera.
                    </p>
                </div>

                {/* Trust/Testimonial Card */}
                <ReviewCarousel />
            </div>

            {/* Right Side: Form (Bright & Clean) */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 relative z-10">
                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="w-full max-w-md"
                >
                    <motion.div variants={itemVariants} className="lg:hidden flex items-center gap-2 mb-10">
                        <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center text-white text-sm shadow-md">🏛️</div>
                        <span className="font-black text-xl text-slate-900">BANDA<span className="text-teal-600">+</span></span>
                    </motion.div>

                    <motion.h1 variants={itemVariants} className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-2">Log Masuk.</motion.h1>
                    <motion.p variants={itemVariants} className="text-slate-500 font-medium mb-10">Sila masukkan butiran pendaftaran anda.</motion.p>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <motion.div variants={itemVariants} className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Alamat E-mel</label>
                            <div className="relative group">
                                <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${focusedField === 'email' ? 'text-teal-600' : 'text-slate-400 group-hover:text-slate-500'}`} />
                                <input 
                                    type="email" 
                                    required
                                    value={formData.email}
                                    onFocus={() => setFocusedField('email')}
                                    onBlur={() => setFocusedField(null)}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all outline-none font-medium"
                                    placeholder="nama@contoh.com"
                                />
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants} className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-bold text-slate-700">Kata Laluan</label>
                                <a href="#" className="text-xs font-bold text-teal-600 hover:text-teal-700 transition-colors">Lupa kata laluan?</a>
                            </div>
                            <div className="relative group">
                                <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${focusedField === 'password' ? 'text-teal-600' : 'text-slate-400 group-hover:text-slate-500'}`} />
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    required
                                    value={formData.password}
                                    onFocus={() => setFocusedField('password')}
                                    onBlur={() => setFocusedField(null)}
                                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                                    className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all outline-none font-medium"
                                    placeholder="••••••••"
                                />
                                <button 
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-teal-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </motion.div>

                        <motion.button 
                            variants={itemVariants}
                            type="submit" 
                            disabled={loading}
                            className="w-full mt-8 bg-teal-600 hover:bg-teal-700 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-teal-600/20 hover:shadow-teal-600/40 hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:bg-teal-600 disabled:hover:translate-y-0"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Log Masuk Akses'}
                            {!loading && <ArrowRight className="w-5 h-5" />}
                        </motion.button>
                    </form>

                    <motion.div variants={itemVariants} className="mt-8">
                        <hr className="border-slate-100" />
                        <p className="mt-8 text-center text-sm font-medium text-slate-500">
                            Kali pertama di sini? <Link to="/register" className="text-teal-600 font-bold hover:text-teal-700 hover:underline transition-colors">Daftar Akaun Baru</Link>
                        </p>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
};

export default Login;