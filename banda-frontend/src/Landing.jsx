import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Camera, Zap, Activity, ChevronRight, ShieldCheck } from 'lucide-react';

const Landing = () => {
    // Animation variants for smooth staggered loading
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.2, delayChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } }
    };

    return (
        <div className="relative min-h-screen bg-slate-50 overflow-hidden font-sans">
            
            {/* --- MODERN MESH GRADIENT BACKGROUND --- */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-teal-300/20 blur-[120px] mix-blend-multiply" />
                <div className="absolute top-[20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-blue-300/20 blur-[120px] mix-blend-multiply" />
                <div className="absolute bottom-[-20%] left-[20%] w-[700px] h-[700px] rounded-full bg-emerald-200/20 blur-[150px] mix-blend-multiply" />
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMTUsIDIzLCA0MiwgMC4wNSkiLz48L3N2Zz4=')] opacity-50" />
            </div>

            {/* Top Bar & Navbar (Kept minimal to focus on hero) */}
            <nav className="relative z-50 bg-white/60 backdrop-blur-xl border-b border-white/40 sticky top-0">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-700 rounded-xl flex items-center justify-center text-white text-xl shadow-lg shadow-teal-500/20">🏛️</div>
                        <span className="text-xl font-bold text-slate-900 tracking-tight">BANDA<span className="text-teal-600">+</span></span>
                    </div>
                    <div className="flex gap-4">
                        <Link to="/login" className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">Log Masuk</Link>
                        <Link to="/register" className="px-5 py-2.5 text-sm font-bold text-white bg-slate-900 rounded-xl hover:bg-teal-600 transition-all shadow-xl shadow-slate-900/10">Daftar Akaun</Link>
                    </div>
                </div>
            </nav>

            {/* --- HERO SECTION --- */}
            <main className="relative z-10 max-w-7xl mx-auto px-6 pt-20 lg:pt-32 pb-24">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    
                    {/* Left Column: Text & CTA */}
                    <motion.div 
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="max-w-2xl"
                    >
                        <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-teal-100 backdrop-blur-md shadow-sm mb-8">
                            <span className="flex h-2 w-2 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                            </span>
                            <span className="text-xs font-bold uppercase tracking-wider text-teal-800">Enjin AI Generatif 2.0</span>
                        </motion.div>

                        <motion.h1 variants={itemVariants} className="text-5xl lg:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-6">
                            Urus Aduan, <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-600">Lebih Pintar.</span>
                        </motion.h1>

                        <motion.p variants={itemVariants} className="text-lg text-slate-600 leading-relaxed font-medium mb-10 max-w-lg">
                            Laporkan kerosakan infrastruktur di kawasan anda hanya dengan sekeping gambar. Teknologi AI kami akan menganalisis, mengklasifikasi, dan menghantar terus kepada unit yang tepat.
                        </motion.p>

                        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
                            <Link to="/register" className="group relative inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white bg-teal-600 rounded-2xl overflow-hidden transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-teal-500/30">
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                                <Camera className="w-5 h-5 mr-2" />
                                Lapor Sekarang
                            </Link>
                            <Link to="/login" className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-slate-700 bg-white/80 backdrop-blur-md border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all hover:scale-[1.02] hover:shadow-lg">
                                Semak Status <ChevronRight className="w-5 h-5 ml-1" />
                            </Link>
                        </motion.div>
                    </motion.div>

                    {/* Right Column: Interactive AI Card */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, rotateX: 10 }}
                        animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                        transition={{ duration: 0.8, delay: 0.3, type: "spring" }}
                        className="relative perspective-1000"
                    >
                        {/* Glassmorphic Container */}
                        <div className="relative bg-white/40 backdrop-blur-2xl border border-white/60 p-6 rounded-[2.5rem] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)]">
                            
                            {/* Header */}
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center shadow-inner">
                                        <Zap className="w-6 h-6 text-teal-400" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-900 text-sm">Pemprosesan Teras AI</div>
                                        <div className="text-xs text-slate-500 font-medium flex items-center gap-1">
                                            <Activity className="w-3 h-3 text-teal-500" /> Menganalisis topologi...
                                        </div>
                                    </div>
                                </div>
                                <div className="px-3 py-1 bg-white/60 border border-white rounded-lg text-xs font-bold text-slate-700 shadow-sm">
                                    98% Akurat
                                </div>
                            </div>

                            {/* The "Scanner" Window */}
                            <div className="relative h-72 w-full rounded-3xl overflow-hidden bg-slate-900 isolate">
                                {/* The Target Image */}
                                <img 
                                    src="https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80" 
                                    alt="Road Damage" 
                                    className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-luminosity"
                                />
                                
                                {/* Animated Grid Overlay */}
                                <div className="absolute inset-0 bg-[linear-gradient(rgba(45,212,191,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(45,212,191,0.1)_1px,transparent_1px)] bg-[size:20px_20px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]" />

                                {/* Framer Motion Scanning Line */}
                                <motion.div 
                                    animate={{ y: [0, 280, 0] }}
                                    transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                                    className="absolute top-0 left-0 w-full h-1 bg-teal-400 shadow-[0_0_20px_4px_rgba(45,212,191,0.6)] z-20"
                                />

                                {/* AI Bounding Box (Pops in after delay) */}
                                <motion.div 
                                    initial={{ opacity: 0, scale: 1.2 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 1, duration: 0.5, type: "spring" }}
                                    className="absolute top-1/3 left-1/4 w-32 h-24 border-2 border-teal-400 bg-teal-400/10 rounded-lg z-10 flex items-end justify-center pb-2"
                                >
                                    <span className="bg-teal-500 text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Kerosakan Teras</span>
                                </motion.div>
                            </div>

                            {/* Results Panel */}
                            <motion.div 
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 1.5 }}
                                className="mt-4 bg-white/80 border border-white rounded-2xl p-4 flex gap-4 shadow-sm"
                            >
                                <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center shrink-0">
                                    <ShieldCheck className="w-5 h-5 text-teal-600" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-slate-900">Jalan Berlubang (Tahap Kritikal)</h4>
                                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                                        Lokasi GPS disahkan. Tiket auto-agihan kepada Unit Kejuruteraan telah dijana.
                                    </p>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>

                </div>
            </main>
        </div>
    );
};

export default Landing;