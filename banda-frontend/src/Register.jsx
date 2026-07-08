import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Lock, Phone, ArrowRight, ArrowLeft, Loader2, Users, HardHat, CheckCircle2, XCircle, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import mpajLogo from './assets/mpaj-logo.png';
import bandaLogoFull from './assets/banda-logo-full.png';
import bangunanMpaj from './assets/bangunan-mpaj.jpg';

const Register = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
        else if (score === 1) setPwdStrength({ score: 1, label: 'Weak', color: 'bg-rose-500' });
        else if (score === 2) setPwdStrength({ score: 2, label: 'Medium', color: 'bg-amber-400' });
        else setPwdStrength({ score: 3, label: 'Strong', color: 'bg-emerald-500' });
    }, [formData.password]);

    const handleNext = (e) => {
        e.preventDefault();
        if (formData.name && formData.no_telefon) {
            setStep(2);
        } else {
            toast.error('Incomplete Details', { description: 'Please fill in your name and phone number.' });
        }
    };

    const handleBack = () => {
        setStep(1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (formData.password !== formData.password_confirmation) {
            toast.error('Password Error', { description: 'Passwords do not match!' });
            return;
        }

        setLoading(true);

        try {
            await axios.post(`/api/register`, formData);
            
            toast.success('Registration Successful!', { description: 'Your account has been created. Please sign in.' });
            setTimeout(() => navigate('/login'), 1500);

        } catch (error) {
            let errorMsg = 'Please review your details and try again.';
            if (error.response && error.response.data && error.response.data.errors) {
                // Get the first validation error message
                const firstErrorKey = Object.keys(error.response.data.errors)[0];
                errorMsg = error.response.data.errors[firstErrorKey][0];
            } else if (error.response && error.response.data && error.response.data.message) {
                errorMsg = error.response.data.message;
            }
            toast.error('Registration Failed', { description: errorMsg });
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

            {/* Right Side: Form Wizard Container */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 relative z-10 overflow-hidden bg-slate-50">
                <div className="w-full max-w-md mx-auto bg-white shadow-xl shadow-slate-200/40 border border-slate-100/80 rounded-3xl p-6 sm:p-8 max-h-[92vh] overflow-y-auto custom-scrollbar">
                    
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
                    <div className="flex flex-col pb-5 mb-5 border-b border-slate-100">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 text-center lg:text-left">Official Platform</span>
                        <div className="flex items-center justify-center lg:justify-start gap-4 sm:gap-5">
                            <img src={mpajLogo} alt="MPAJ Logo" className="h-12 md:h-14 object-contain shrink-0" />
                            <div className="h-8 w-[1.5px] bg-slate-200 shrink-0"></div>
                            <img src={bandaLogoFull} alt="BANDA+ Logo" className="h-11 md:h-13 object-contain shrink-0" />
                        </div>
                    </div>

                    {/* Wizard Progress Bar */}
                    <div className="flex items-center gap-2 mb-6">
                        <div className={`h-1.5 flex-1 rounded-full transition-colors duration-500 ${step >= 1 ? 'bg-blue-800 shadow-sm' : 'bg-slate-100'}`} />
                        <div className={`h-1.5 flex-1 rounded-full transition-colors duration-500 ${step >= 2 ? 'bg-blue-800 shadow-sm' : 'bg-slate-100'}`} />
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-1.5 text-center lg:text-left">
                        {step === 1 ? 'Get Started.' : 'Account Security.'}
                    </h1>
                    <p className="text-slate-500 font-medium text-xs sm:text-sm mb-6 text-center lg:text-left leading-relaxed">
                        {step === 1 ? 'Complete your personal profile.' : 'Complete your login credentials.'}
                    </p>

                    <AnimatePresence mode="wait">
                        {/* STEP 1 */}
                        {step === 1 && (
                            <motion.form 
                                key="step1"
                                initial="initial" animate="in" exit="out" variants={pageVariants} transition={{ duration: 0.3 }}
                                onSubmit={handleNext} 
                                className="space-y-5"
                            >
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block">Full Name</label>
                                    <div className="relative group">
                                        <User className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-200 ${focusedField === 'name' ? 'text-blue-700' : 'text-slate-400 group-hover:text-slate-500'}`} />
                                        <input 
                                            type="text" 
                                            required
                                            value={formData.name}
                                            onFocus={() => setFocusedField('name')}
                                            onBlur={() => setFocusedField(null)}
                                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                                            className="w-full pl-11 pr-4 py-3 bg-slate-50/70 hover:bg-slate-50 border border-slate-200/80 rounded-xl text-slate-800 placeholder:text-slate-400 text-sm focus:bg-white focus:ring-4 focus:ring-blue-700/10 focus:border-blue-700 transition-all duration-200 outline-none font-medium"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block">Phone Number</label>
                                    <div className="relative group">
                                        <Phone className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-200 ${focusedField === 'phone' ? 'text-blue-700' : 'text-slate-400 group-hover:text-slate-500'}`} />
                                        <input 
                                            type="tel" 
                                            required
                                            value={formData.no_telefon}
                                            onFocus={() => setFocusedField('phone')}
                                            onBlur={() => setFocusedField(null)}
                                            onChange={(e) => setFormData({...formData, no_telefon: e.target.value})}
                                            className="w-full pl-11 pr-4 py-3 bg-slate-50/70 hover:bg-slate-50 border border-slate-200/80 rounded-xl text-slate-800 placeholder:text-slate-400 text-sm focus:bg-white focus:ring-4 focus:ring-blue-700/10 focus:border-blue-700 transition-all duration-200 outline-none font-medium"
                                            placeholder="0123456789"
                                        />
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <button 
                                        type="submit" 
                                        className="w-full mt-2 bg-blue-800 hover:bg-blue-900 active:scale-[0.99] text-white font-bold py-3.5 px-6 rounded-xl transition-all duration-200 shadow-lg shadow-blue-800/25 hover:shadow-xl hover:shadow-blue-800/35 hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-blue-800/20 flex items-center justify-center gap-2 text-sm"
                                    >
                                        <span>Continue</span> <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                    </button>
                                </div>
                            </motion.form>
                        )}

                        {step === 2 && (
                            <motion.form 
                                key="step2"
                                initial="initial" animate="in" exit="out" variants={pageVariants} transition={{ duration: 0.3 }}
                                onSubmit={handleSubmit} 
                                className="space-y-5"
                            >
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block">Email Address</label>
                                    <div className="relative group">
                                        <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-200 ${focusedField === 'email' ? 'text-blue-700' : 'text-slate-400 group-hover:text-slate-500'}`} />
                                        <input 
                                            type="email" 
                                            required
                                            value={formData.email}
                                            onFocus={() => setFocusedField('email')}
                                            onBlur={() => setFocusedField(null)}
                                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                                            className="w-full pl-11 pr-4 py-3 bg-slate-50/70 hover:bg-slate-50 border border-slate-200/80 rounded-xl text-slate-800 placeholder:text-slate-400 text-sm focus:bg-white focus:ring-4 focus:ring-blue-700/10 focus:border-blue-700 transition-all duration-200 outline-none font-medium"
                                            placeholder="name@example.com"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block">Password</label>
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
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-700 focus:outline-none p-1">
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
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

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block">Confirm Password</label>
                                    <div className="relative group">
                                        <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-200 ${focusedField === 'confirm' ? 'text-blue-700' : 'text-slate-400 group-hover:text-slate-500'}`} />
                                        <input 
                                            type={showConfirmPassword ? "text" : "password"} 
                                            required
                                            value={formData.password_confirmation}
                                            onFocus={() => setFocusedField('confirm')}
                                            onBlur={() => setFocusedField(null)}
                                            onChange={(e) => setFormData({...formData, password_confirmation: e.target.value})}
                                            className="w-full pl-11 pr-11 py-3 bg-slate-50/70 hover:bg-slate-50 border border-slate-200/80 rounded-xl text-slate-800 placeholder:text-slate-400 text-sm focus:bg-white focus:ring-4 focus:ring-blue-700/10 focus:border-blue-700 transition-all duration-200 outline-none font-medium"
                                            placeholder="••••••••"
                                        />
                                        {formData.password_confirmation.length > 0 && (
                                            <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                                                {formData.password === formData.password_confirmation 
                                                    ? <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                                    : <XCircle className="w-4 h-4 text-rose-500" />
                                                }
                                            </div>
                                        )}
                                    </div>
                                    <div className="pt-2 flex gap-3">
                                        <button 
                                            type="button" 
                                            onClick={handleBack}
                                            className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3.5 px-4 rounded-xl transition-all duration-200 active:scale-[0.99] flex items-center justify-center gap-1.5 text-sm"
                                        >
                                            <ArrowLeft className="w-4 h-4" /> Back
                                        </button>
                                        <button 
                                            type="submit" 
                                            disabled={loading}
                                            className="w-2/3 bg-blue-800 hover:bg-blue-900 active:scale-[0.99] text-white font-bold py-3.5 px-6 rounded-xl transition-all duration-200 shadow-lg shadow-blue-800/25 hover:shadow-xl hover:shadow-blue-800/35 hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-blue-800/20 disabled:opacity-60 disabled:pointer-events-none disabled:shadow-none flex items-center justify-center gap-2 text-sm"
                                        >
                                            {loading ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : 'Confirm & Register'}
                                        </button>
                                    </div>
                                </div>
                            </motion.form>
                        )}
                    </AnimatePresence>

                    <div className="mt-6 pt-5 border-t border-slate-100 text-center">
                        <span className="text-slate-500 text-xs sm:text-sm font-medium">Already have an account? </span>
                        <Link to="/login" className="text-blue-700 font-bold hover:text-blue-900 underline-offset-4 hover:underline transition-all text-xs sm:text-sm">
                            Sign In
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
