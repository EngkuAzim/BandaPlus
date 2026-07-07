import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

import mpajLogo from './assets/mpaj-logo.png';
import bangunanMpaj from './assets/bangunan-mpaj.jpg';

const ForgotPassword = () => {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [focusedField, setFocusedField] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await axios.post('/api/forgot-password', { email });
            toast.success('Permintaan Dihantar', { description: 'Jika e-mel ini wujud, pautan tetapan semula kata laluan telah dihantar.' });
            setEmail('');
        } catch (error) {
            toast.error('Gagal', { description: 'Terdapat ralat semasa menghantar permintaan.' });
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
                        <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight mb-2">Lupa Kata Laluan?</h1>
                        <p className="text-slate-500 font-medium text-sm">Masukkan e-mel anda dan kami akan hantar pautan tetapan semula.</p>
                    </motion.div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <motion.div variants={itemVariants} className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Alamat E-mel</label>
                            <div className="relative group">
                                <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${focusedField === 'email' ? 'text-blue-800' : 'text-slate-400 group-hover:text-slate-500'}`} />
                                <input 
                                    type="email" 
                                    required
                                    value={email}
                                    onFocus={() => setFocusedField('email')}
                                    onBlur={() => setFocusedField(null)}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-800/30 focus:border-blue-800 transition-all outline-none font-medium"
                                    placeholder="nama@contoh.com"
                                />
                            </div>
                        </motion.div>

                        <motion.button 
                            variants={itemVariants}
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-blue-800 hover:bg-blue-900 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-800/20 hover:-translate-y-0.5 flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Hantar Pautan'}
                        </motion.button>
                    </form>

                    <motion.div variants={itemVariants} className="mt-8 text-center">
                        <Link to="/login" className="text-sm font-bold text-blue-800 hover:text-blue-900 transition-colors flex items-center justify-center gap-2">
                            <ArrowLeft className="w-4 h-4" /> Kembali ke Log Masuk
                        </Link>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
};

export default ForgotPassword;
