import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Loader2, Eye, EyeOff, Star } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import ReviewCarousel from './ReviewCarousel';

import mpajLogo from './assets/mpaj-logo.png';
import bangunanMpaj from './assets/bangunan-mpaj.jpg';

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
            const response = await axios.post(`/api/login`, formData);
            
            localStorage.setItem('token', response.data.access_token);
            localStorage.setItem('userRole', response.data.user.peranan || 'komuniti');

            toast.success('Login Successful!', { description: 'Welcome back to the BANDA+ system.' });
            
            setTimeout(() => navigate('/dashboard'), 1000);

        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Please check your email and password.';
            toast.error('Login Failed', { description: errorMessage });
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
        <div className="h-screen overflow-hidden bg-white flex font-sans selection:bg-teal-500/20">
            
            {/* Left Side: Branding (Image with Overlay) */}
            <div 
                className="hidden lg:flex w-1/2 relative overflow-hidden flex-col justify-end p-16 bg-cover bg-center"
                style={{ backgroundImage: `url(${bangunanMpaj})` }}
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

            {/* Right Side: Form (Bright & Clean) */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 sm:p-12 lg:p-20 relative z-10 bg-slate-50 overflow-y-auto">
                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="w-full max-w-md mx-auto"
                >
                    <motion.div variants={itemVariants} className="flex flex-col mb-10 items-center lg:items-start text-center lg:text-left">
                        <img src={mpajLogo} alt="MPAJ Logo" className="h-16 mb-8 object-contain" />
                        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-3">Sign In</h1>
                        <p className="text-slate-500 font-medium">Enter your account details to proceed.</p>
                    </motion.div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <motion.div variants={itemVariants} className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Email Address</label>
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
                                    placeholder="name@example.com"
                                />
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants} className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-bold text-slate-700">Password</label>
                                <a href="#" className="text-xs font-bold text-teal-600 hover:text-teal-700 transition-colors">Forgot password?</a>
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
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In to Dashboard'}
                            {!loading && <ArrowRight className="w-5 h-5" />}
                        </motion.button>
                    </form>

                    <motion.div variants={itemVariants} className="mt-8">
                        <hr className="border-slate-100" />
                        <p className="mt-8 text-center text-sm font-medium text-slate-500">
                            First time here? <Link to="/register" className="text-teal-600 font-bold hover:text-teal-700 hover:underline transition-colors">Create New Account</Link>
                        </p>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
};

export default Login;