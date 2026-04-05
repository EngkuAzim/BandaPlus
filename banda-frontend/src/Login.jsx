import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const Login = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Update this URL if your Laravel API uses a different endpoint
            const response = await axios.post('http://localhost:8000/api/login', formData);
            
            // Save the token and role
            localStorage.setItem('token', response.data.access_token);
            localStorage.setItem('userRole', response.data.user.peranan || 'awam');

            toast.success('Log Masuk Berjaya!', { description: 'Selamat kembali ke sistem BANDA+.' });
            
            // Redirect based on role (you can create these pages later)
            setTimeout(() => navigate('/dashboard'), 1000);

        } catch (error) {
            toast.error('Log Masuk Gagal', { description: 'Sila semak e-mel dan kata laluan anda.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex">
            {/* Left Side: Branding / Visual (Hidden on mobile) */}
            <div className="hidden lg:flex w-1/2 bg-slate-900 relative overflow-hidden flex-col justify-between p-12">
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] rounded-full bg-teal-500/20 blur-[120px]" />
                    <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-emerald-500/20 blur-[120px]" />
                </div>
                
                <Link to="/" className="relative z-10 flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center text-white text-xl border border-white/20">🏛️</div>
                    <span className="text-2xl font-bold text-white tracking-tight">BANDA<span className="text-teal-400">+</span></span>
                </Link>

                <div className="relative z-10">
                    <h2 className="text-4xl font-black text-white mb-6 leading-tight">Selamat Kembali ke<br/>Ekosistem Pintar.</h2>
                    <p className="text-slate-400 text-lg max-w-md leading-relaxed">
                        Pantau status aduan anda, urus tugasan penyelenggaraan, dan pastikan Ampang Jaya kekal sejahtera.
                    </p>
                </div>
            </div>

            {/* Right Side: Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12">
                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="w-full max-w-md"
                >
                    <div className="lg:hidden flex items-center gap-2 mb-10">
                        <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white text-sm">🏛️</div>
                        <span className="font-bold text-xl">BANDA<span className="text-teal-600">+</span></span>
                    </div>

                    <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Log Masuk.</h1>
                    <p className="text-slate-500 font-medium mb-10">Sila masukkan butiran pendaftaran anda.</p>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Alamat E-mel</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input 
                                    type="email" 
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all outline-none font-medium"
                                    placeholder="nama@contoh.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-bold text-slate-700">Kata Laluan</label>
                                <a href="#" className="text-xs font-bold text-teal-600 hover:text-teal-700">Lupa kata laluan?</a>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input 
                                    type="password" 
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all outline-none font-medium"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full mt-8 bg-slate-900 hover:bg-teal-600 text-white font-bold py-4 rounded-2xl transition-all shadow-lg hover:shadow-teal-500/30 flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:bg-slate-900"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Log Masuk Akses'}
                            {!loading && <ArrowRight className="w-5 h-5" />}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-sm font-medium text-slate-500">
                        Belum ada akaun? <Link to="/register" className="text-teal-600 font-bold hover:underline">Daftar sekarang</Link>
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default Login;