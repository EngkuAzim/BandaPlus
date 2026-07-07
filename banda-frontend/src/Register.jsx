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
            toast.error('Registration Failed', { description: 'Please review your details and try again.' });
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
        <div className="h-screen overflow-hidden bg-white flex font-sans selection:bg-teal-500/20">
            
            {/* Left Side: Branding (Image with Overlay) */}
            <div 
                className="hidden lg:flex w-1/2 relative overflow-hidden flex-col justify-end p-16 bg-cover bg-center border-r border-slate-200"
                style={{ backgroundImage: 'url("/bangunan-mpaj.jpg")' }}
            >
                {/* Dark Overlay */}
                <div className="absolute inset-0 bg-slate-900/80 mix-blend-multiply z-0 pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent z-0" />
                
                <div className="relative z-10 mb-8">
                    <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-[1.2] tracking-tight">
                        Track your<br/>
                        infrastructure complaints.
                    </h2>
                    <p className="text-teal-400 text-sm font-bold tracking-[0.2em] uppercase">
                        SIMPLE • EFFICIENT • DETAILED
                    </p>
                </div>
            </div>

            {/* Right Side: Form Wizard (Bright & Clean) */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 relative z-10 overflow-y-auto bg-slate-50">
                <div className="w-full max-w-md mx-auto">
                    
                    {/* MPAJ Logo */}
                    <div className="flex flex-col mb-8 items-center lg:items-start text-center lg:text-left">
                        <img src="/mpaj-logo.png" alt="MPAJ Logo" className="h-16 mb-2 object-contain" />
                    </div>

                    {/* Wizard Progress Bar */}
                    <div className="flex items-center gap-2 mb-8">
                        <div className={`h-2 flex-1 rounded-full transition-colors duration-500 ${step >= 1 ? 'bg-teal-500 shadow-sm' : 'bg-slate-100'}`} />
                        <div className={`h-2 flex-1 rounded-full transition-colors duration-500 ${step >= 2 ? 'bg-teal-500 shadow-sm' : 'bg-slate-100'}`} />
                    </div>

                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-2">
                        {step === 1 ? 'Get Started.' : 'Account Security.'}
                    </h1>
                    <p className="text-slate-500 font-medium mb-8">
                        {step === 1 ? 'Complete your personal profile.' : 'Complete your login credentials.'}
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
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Full Name</label>
                                    <div className="relative group">
                                        <User className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${focusedField === 'name' ? 'text-teal-600' : 'text-slate-400 group-hover:text-slate-500'}`} />
                                        <input 
                                            type="text" required
                                            value={formData.name}
                                            onFocus={() => setFocusedField('name')} onBlur={() => setFocusedField(null)}
                                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 outline-none transition-all"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Phone Number</label>
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
                                    Continue <ArrowRight className="w-5 h-5" />
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
                                    <label className="text-sm font-bold text-slate-700">Email Address</label>
                                    <div className="relative group">
                                        <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${focusedField === 'email' ? 'text-teal-600' : 'text-slate-400 group-hover:text-slate-500'}`} />
                                        <input 
                                            type="email" required
                                            value={formData.email}
                                            onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField(null)}
                                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 outline-none transition-all"
                                            placeholder="name@example.com"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Password</label>
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
                                    <label className="text-sm font-bold text-slate-700">Confirm Password</label>
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
                                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm & Register'}
                                    </button>
                                </div>
                            </motion.form>
                        )}
                    </AnimatePresence>

                    <div className="mt-8">
                        <hr className="border-slate-100" />
                        <p className="mt-8 text-center text-sm font-medium text-slate-500">
                            Already have an account? <Link to="/login" className="text-teal-600 font-bold hover:text-teal-700 hover:underline transition-colors">Sign In</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;