import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Lock, Phone, ArrowRight, ArrowLeft, Loader2, Users, HardHat, CheckCircle2, XCircle, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const Register = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [focusedField, setFocusedField] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        no_telefon: '',
        peranan: 'komuniti',
        email: '',
        password: '',
        password_confirmation: ''
    });

    // Password Strength Logic
    const [pwdStrength, setPwdStrength] = useState({ score: 0, label: '', color: '' });
    
    useEffect(() => {
        let score = 0;
        const pwd = formData.password;
        if (pwd.length >= 8) score += 1;
        if (/[0-9]/.test(pwd)) score += 1;
        if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

        if (pwd.length === 0) setPwdStrength({ score: 0, label: '', color: 'bg-slate-200' });
        else if (score === 1) setPwdStrength({ score: 1, label: 'Lemah', color: 'bg-rose-500' });
        else if (score === 2) setPwdStrength({ score: 2, label: 'Sederhana', color: 'bg-amber-400' });
        else setPwdStrength({ score: 3, label: 'Kuat', color: 'bg-emerald-500' });
    }, [formData.password]);

    const handleNext = (e) => {
        e.preventDefault();
        if (formData.name && formData.no_telefon) {
            setStep(2);
        } else {
            toast.error('Maklumat Tidak Lengkap', { description: 'Sila isi nama dan nombor telefon.' });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (formData.password !== formData.password_confirmation) {
            toast.error('Ralat Kata Laluan', { description: 'Kata laluan tidak sepadan!' });
            return;
        }

        setLoading(true);

        try {
            await axios.post(`/api/register`, formData);
            
            toast.success('Pendaftaran Berjaya!', { description: 'Akaun anda telah dicipta. Sila log masuk.' });
            setTimeout(() => navigate('/login'), 1500);

        } catch (error) {
            toast.error('Pendaftaran Gagal', { description: 'Sila semak semula butiran anda.' });
        } finally {
            setLoading(false);
        }
    };

    // Animation Variants
    const pageVariants = {
        initial: { opacity: 0, x: 20 },
        in: { opacity: 1, x: 0 },
        out: { opacity: 0, x: -20 }
    };

    return (
        <div className="min-h-screen bg-white flex font-sans selection:bg-teal-500/20">
            
            {/* Left Side: Branding (High Contrast Slate) */}
            <div className="hidden lg:flex w-1/2 bg-slate-900 relative overflow-hidden flex-col justify-between p-12 border-r border-slate-200">
                
                {/* Animated Orbs */}
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <motion.div 
                        animate={{ y: [-20, 20, -20], opacity: [0.15, 0.25, 0.15] }}
                        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-teal-500/20 blur-[120px]" 
                    />
                    <motion.div 
                        animate={{ y: [20, -20, 20], opacity: [0.1, 0.2, 0.1] }}
                        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                        className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-500/20 blur-[120px]" 
                    />
                </div>
                
                <Link to="/" className="relative z-10 flex items-center gap-3 w-fit">
                    <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center text-white text-xl border border-white/20 shadow-lg">🏛️</div>
                    <span className="text-2xl font-black text-white tracking-tight">BANDA<span className="text-teal-400">+</span></span>
                </Link>

                <div className="relative z-10 mt-20">
                    <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-[1.1] tracking-tight">
                        Sertai Inisiatif<br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">
                            Komuniti Pintar.
                        </span>
                    </h2>
                    <p className="text-slate-400 text-lg max-w-md leading-relaxed font-medium">
                        Daftar akaun percuma anda hari ini dan mula mainkan peranan dalam memastikan Ampang Jaya kekal selamat dan sejahtera.
                    </p>
                </div>

                <div className="relative z-10 mt-auto bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 max-w-md shadow-2xl">
                    <div className="flex items-center gap-4 mb-2">
                        <Users className="w-8 h-8 text-teal-400" />
                        <h3 className="text-white font-bold">15,000+ Penduduk</h3>
                    </div>
                    <p className="text-slate-400 text-sm font-medium">Telah menyertai ekosistem BANDA+ di Ampang Jaya.</p>
                </div>
            </div>

            {/* Right Side: Form Wizard (Bright & Clean) */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 relative z-10 overflow-y-auto">
                <div className="w-full max-w-md">
                    
                    {/* Mobile Logo */}
                    <div className="lg:hidden flex items-center gap-2 mb-8">
                        <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center text-white text-sm shadow-md">🏛️</div>
                        <span className="font-black text-xl text-slate-900">BANDA<span className="text-teal-600">+</span></span>
                    </div>

                    {/* Wizard Progress Bar */}
                    <div className="flex items-center gap-2 mb-8">
                        <div className={`h-2 flex-1 rounded-full transition-colors duration-500 ${step >= 1 ? 'bg-teal-500 shadow-sm' : 'bg-slate-100'}`} />
                        <div className={`h-2 flex-1 rounded-full transition-colors duration-500 ${step >= 2 ? 'bg-teal-500 shadow-sm' : 'bg-slate-100'}`} />
                    </div>

                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-2">
                        {step === 1 ? 'Mula di sini.' : 'Keselamatan Akaun.'}
                    </h1>
                    <p className="text-slate-500 font-medium mb-8">
                        {step === 1 ? 'Pilih peranan dan masukkan profil anda.' : 'Lengkapkan butiran log masuk anda.'}
                    </p>

                    <AnimatePresence mode="wait">
                        {/* STEP 1 */}
                        {step === 1 && (
                            <motion.form 
                                key="step1"
                                initial="initial" animate="in" exit="out" variants={pageVariants} transition={{ duration: 0.3 }}
                                onSubmit={handleNext} 
                                className="space-y-6"
                            >
                                {/* Role Selection */}
                                <div className="space-y-3">
                                    <label className="text-sm font-bold text-slate-700">Pilih Peranan Anda</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div 
                                            onClick={() => setFormData({...formData, peranan: 'komuniti'})}
                                            className={`cursor-pointer rounded-2xl border p-4 transition-all duration-300 ${formData.peranan === 'komuniti' ? 'bg-teal-50 border-teal-500 shadow-[0_0_15px_rgba(20,184,166,0.15)]' : 'bg-white border-slate-200 hover:border-teal-200 hover:bg-slate-50'}`}
                                        >
                                            <Users className={`w-6 h-6 mb-3 ${formData.peranan === 'komuniti' ? 'text-teal-600' : 'text-slate-400'}`} />
                                            <h4 className="text-slate-900 font-bold text-sm">Komuniti Awam</h4>
                                            <p className="text-slate-500 text-xs mt-1">Lapor kerosakan infrastruktur.</p>
                                        </div>
                                        <div 
                                            onClick={() => setFormData({...formData, peranan: 'kontraktor'})}
                                            className={`cursor-pointer rounded-2xl border p-4 transition-all duration-300 ${formData.peranan === 'kontraktor' ? 'bg-amber-50 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.15)]' : 'bg-white border-slate-200 hover:border-teal-200 hover:bg-slate-50'}`}
                                        >
                                            <HardHat className={`w-6 h-6 mb-3 ${formData.peranan === 'kontraktor' ? 'text-amber-500' : 'text-slate-400'}`} />
                                            <h4 className="text-slate-900 font-bold text-sm">Kontraktor Sah</h4>
                                            <p className="text-slate-500 text-xs mt-1">Urus kerja penyelenggaraan.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Nama Penuh</label>
                                    <div className="relative group">
                                        <User className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${focusedField === 'name' ? 'text-teal-600' : 'text-slate-400 group-hover:text-slate-500'}`} />
                                        <input 
                                            type="text" required
                                            value={formData.name}
                                            onFocus={() => setFocusedField('name')} onBlur={() => setFocusedField(null)}
                                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 outline-none transition-all"
                                            placeholder="Ali bin Abu"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Nombor Telefon</label>
                                    <div className="relative group">
                                        <Phone className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${focusedField === 'phone' ? 'text-teal-600' : 'text-slate-400 group-hover:text-slate-500'}`} />
                                        <input 
                                            type="tel" required
                                            value={formData.no_telefon}
                                            onFocus={() => setFocusedField('phone')} onBlur={() => setFocusedField(null)}
                                            onChange={(e) => setFormData({...formData, no_telefon: e.target.value})}
                                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 outline-none transition-all"
                                            placeholder="0123456789"
                                        />
                                    </div>
                                </div>

                                <button type="submit" className="w-full mt-4 bg-teal-600 hover:bg-teal-700 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-teal-600/20 hover:-translate-y-0.5 flex items-center justify-center gap-2">
                                    Teruskan <ArrowRight className="w-5 h-5" />
                                </button>
                            </motion.form>
                        )}

                        {/* STEP 2 */}
                        {step === 2 && (
                            <motion.form 
                                key="step2"
                                initial="initial" animate="in" exit="out" variants={pageVariants} transition={{ duration: 0.3 }}
                                onSubmit={handleSubmit} 
                                className="space-y-6"
                            >
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Alamat E-mel</label>
                                    <div className="relative group">
                                        <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${focusedField === 'email' ? 'text-teal-600' : 'text-slate-400 group-hover:text-slate-500'}`} />
                                        <input 
                                            type="email" required
                                            value={formData.email}
                                            onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField(null)}
                                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 outline-none transition-all"
                                            placeholder="nama@contoh.com"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Kata Laluan</label>
                                    <div className="relative group">
                                        <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${focusedField === 'password' ? 'text-teal-600' : 'text-slate-400 group-hover:text-slate-500'}`} />
                                        <input 
                                            type={showPassword ? "text" : "password"} required
                                            value={formData.password}
                                            onFocus={() => setFocusedField('password')} onBlur={() => setFocusedField(null)}
                                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                                            className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 outline-none transition-all"
                                            placeholder="••••••••"
                                        />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-teal-600">
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                    {/* Password Strength Meter */}
                                    {formData.password.length > 0 && (
                                        <div className="pt-1">
                                            <div className="flex gap-1 h-1.5 mb-1">
                                                <div className={`flex-1 rounded-full ${pwdStrength.score >= 1 ? pwdStrength.color : 'bg-slate-200'}`}></div>
                                                <div className={`flex-1 rounded-full ${pwdStrength.score >= 2 ? pwdStrength.color : 'bg-slate-200'}`}></div>
                                                <div className={`flex-1 rounded-full ${pwdStrength.score >= 3 ? pwdStrength.color : 'bg-slate-200'}`}></div>
                                            </div>
                                            <p className={`text-xs text-right font-bold ${pwdStrength.color.replace('bg-', 'text-')}`}>{pwdStrength.label}</p>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Sahkan Kata Laluan</label>
                                    <div className="relative group">
                                        <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${focusedField === 'confirm' ? 'text-teal-600' : 'text-slate-400 group-hover:text-slate-500'}`} />
                                        <input 
                                            type={showPassword ? "text" : "password"} required
                                            value={formData.password_confirmation}
                                            onFocus={() => setFocusedField('confirm')} onBlur={() => setFocusedField(null)}
                                            onChange={(e) => setFormData({...formData, password_confirmation: e.target.value})}
                                            className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 outline-none transition-all"
                                            placeholder="••••••••"
                                        />
                                        {/* Live Match Indicator */}
                                        {formData.password_confirmation.length > 0 && (
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                                {formData.password === formData.password_confirmation 
                                                    ? <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                                    : <XCircle className="w-5 h-5 text-rose-500" />
                                                }
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-4 mt-6">
                                    <button type="button" onClick={() => setStep(1)} className="px-6 py-4 rounded-2xl border border-slate-200 bg-white text-slate-700 font-bold hover:bg-slate-50 transition-colors flex items-center gap-2">
                                        <ArrowLeft className="w-5 h-5" />
                                    </button>
                                    <button type="submit" disabled={loading || formData.password !== formData.password_confirmation} className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-teal-600/20 disabled:opacity-50 disabled:hover:bg-teal-600 flex items-center justify-center gap-2">
                                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sahkan & Daftar'}
                                    </button>
                                </div>
                            </motion.form>
                        )}
                    </AnimatePresence>

                    <div className="mt-8">
                        <hr className="border-slate-100" />
                        <p className="mt-8 text-center text-sm font-medium text-slate-500">
                            Sudah ada akaun? <Link to="/login" className="text-teal-600 font-bold hover:text-teal-700 hover:underline transition-colors">Log Masuk</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;