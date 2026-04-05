import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Lock, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const Register = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        peranan: 'awam' // Default role
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (formData.password !== formData.password_confirmation) {
            toast.error('Ralat', { description: 'Kata laluan tidak sepadan.' });
            return;
        }

        setLoading(true);

        try {
            await axios.post('http://localhost:8000/api/register', formData);
            toast.success('Pendaftaran Berjaya!', { description: 'Sila log masuk menggunakan e-mel anda.' });
            setTimeout(() => navigate('/login'), 1500);
        } catch (error) {
            toast.error('Pendaftaran Gagal', { description: 'Sila semak maklumat anda dan cuba lagi.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 relative flex items-center justify-center p-4 sm:p-8 overflow-hidden">
            {/* Background Mesh */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-teal-300/20 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-blue-300/20 blur-[120px]" />
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, type: "spring" }}
                className="w-full max-w-xl bg-white/80 backdrop-blur-xl border border-white/60 p-8 sm:p-12 rounded-[2.5rem] shadow-2xl relative z-10"
            >
                <div className="text-center mb-10">
                    <Link to="/" className="inline-flex items-center gap-2 mb-6 hover:scale-105 transition-transform">
                        <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-white text-xl shadow-md">🏛️</div>
                    </Link>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Bina Akaun BANDA+</h1>
                    <p className="text-slate-500 font-medium">Sertai inisiatif komuniti pintar Ampang Jaya.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Role Selection */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <label className={`cursor-pointer p-4 rounded-2xl border-2 transition-all ${formData.peranan === 'awam' ? 'border-teal-500 bg-teal-50' : 'border-slate-100 bg-white hover:border-slate-200'}`}>
                            <input type="radio" name="role" className="hidden" checked={formData.peranan === 'awam'} onChange={() => setFormData({...formData, peranan: 'awam'})} />
                            <div className="text-sm font-bold text-slate-900 text-center">Pengguna Awam</div>
                        </label>
                        <label className={`cursor-pointer p-4 rounded-2xl border-2 transition-all ${formData.peranan === 'kontraktor' ? 'border-teal-500 bg-teal-50' : 'border-slate-100 bg-white hover:border-slate-200'}`}>
                            <input type="radio" name="role" className="hidden" checked={formData.peranan === 'kontraktor'} onChange={() => setFormData({...formData, peranan: 'kontraktor'})} />
                            <div className="text-sm font-bold text-slate-900 text-center">Kontraktor Sah</div>
                        </label>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Nama Penuh</label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-teal-500/50 outline-none font-medium" placeholder="Nama mengikut K/P" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Alamat E-mel</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-teal-500/50 outline-none font-medium" placeholder="nama@contoh.com" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Kata Laluan</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input type="password" required minLength="8" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-teal-500/50 outline-none font-medium" placeholder="••••••••" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Sahkan Laluan</label>
                            <div className="relative">
                                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input type="password" required minLength="8" value={formData.password_confirmation} onChange={(e) => setFormData({...formData, password_confirmation: e.target.value})} className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-teal-500/50 outline-none font-medium" placeholder="••••••••" />
                            </div>
                        </div>
                    </div>

                    <button type="submit" disabled={loading} className="w-full mt-4 bg-teal-600 hover:bg-slate-900 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-teal-500/30 flex items-center justify-center gap-2 disabled:opacity-70">
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sahkan Pendaftaran'}
                        {!loading && <ArrowRight className="w-5 h-5" />}
                    </button>
                </form>

                <p className="mt-8 text-center text-sm font-medium text-slate-500">
                    Sudah mempunyai akaun? <Link to="/login" className="text-teal-600 font-bold hover:underline">Log Masuk</Link>
                </p>
            </motion.div>
        </div>
    );
};

export default Register;