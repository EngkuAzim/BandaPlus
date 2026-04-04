import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Camera, BrainCircuit, CheckCircle2, ArrowRight, Shield, Zap, MapPin, BarChart3 } from 'lucide-react';

const Landing = () => {
    // Reusable animation for sections appearing on scroll
    const fadeUp = {
        hidden: { opacity: 0, y: 40 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }
    };

    return (
        <div className="bg-[#FAFAFA] min-h-screen font-sans text-slate-900 selection:bg-teal-200">
            
            {/* --- NAVIGATION --- */}
            <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl border-b border-black/5 supports-[backdrop-filter]:bg-white/40">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white text-sm shadow-md">🏛️</div>
                        <span className="font-extrabold tracking-tight text-lg">BANDA<span className="text-teal-600">+</span></span>
                    </div>

                    {/* Smooth Scroll Links */}
                    <div className="hidden md:flex items-center gap-8 bg-white/50 px-6 py-1.5 rounded-full border border-black/5 shadow-sm">
                        <a href="#utama" className="text-sm font-semibold text-slate-600 hover:text-black transition">Utama</a>
                        <a href="#cara-guna" className="text-sm font-semibold text-slate-600 hover:text-black transition">Cara Guna</a>
                        <a href="#impak" className="text-sm font-semibold text-slate-600 hover:text-black transition">Impak</a>
                    </div>

                    <div className="flex gap-3">
                        <Link to="/login" className="hidden md:flex items-center px-4 py-2 text-sm font-bold text-slate-700 hover:text-black transition">Log Masuk</Link>
                        <Link to="/register" className="px-4 py-2 text-sm font-bold text-white bg-slate-900 rounded-full hover:bg-teal-600 transition-all shadow-lg hover:shadow-teal-500/25 hover:-translate-y-0.5">
                            Daftar Akaun
                        </Link>
                    </div>
                </div>
            </nav>

            {/* --- COMPARTMENT 1: HERO (#utama) --- */}
            <section id="utama" className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden flex flex-col items-center text-center">
                {/* Framer-style subtle glow background */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-teal-400/10 blur-[120px] rounded-full pointer-events-none" />
                
                <motion.div initial="hidden" animate="visible" variants={fadeUp} className="max-w-4xl px-6 relative z-10">
                    <div className="mx-auto w-fit mb-8 px-4 py-1.5 rounded-full border border-black/10 bg-white/50 backdrop-blur-md shadow-sm flex items-center gap-2">
                        <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span></span>
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Enjin AI Generatif BANDA+ Sedia Beroperasi</span>
                    </div>

                    <h1 className="text-6xl lg:text-[5.5rem] font-black tracking-tighter leading-[0.95] mb-8 text-slate-900">
                        Urus Aduan, <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-br from-teal-500 to-slate-900">Lebih Pintar.</span>
                    </h1>

                    <p className="text-xl text-slate-500 font-medium mb-10 max-w-2xl mx-auto leading-relaxed">
                        Infrastruktur awam terjejas? Laporkan kerosakan di Ampang Jaya hanya dengan sekeping gambar. Biar AI kami uruskan klasifikasi dan agihan terus kepada pihak berkuasa.
                    </p>

                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Link to="/register" className="group flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-slate-900 rounded-full hover:bg-teal-600 transition-all duration-300 shadow-xl hover:shadow-teal-500/30 hover:-translate-y-1">
                            Lapor Sekarang <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </motion.div>
            </section>

            {/* --- COMPARTMENT 2: BENTO BOX "CARA GUNA" (#cara-guna) --- */}
            <section id="cara-guna" className="py-24 bg-white relative">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp} className="mb-16">
                        <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4 text-slate-900">Mekanik Sistem.</h2>
                        <p className="text-lg text-slate-500 font-medium max-w-xl">Direka untuk kepantasan. Tiada borang panjang, hanya 3 langkah mudah untuk kesejahteraan komuniti.</p>
                    </motion.div>

                    {/* Bento Grid Layout */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Step 1: Big Card */}
                        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="md:col-span-2 bg-slate-50 rounded-[2rem] p-8 md:p-12 border border-black/5 hover:border-teal-500/30 transition-colors group relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity"><Camera className="w-32 h-32" /></div>
                            <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-6">
                                <span className="text-xl font-black text-slate-900">1</span>
                            </div>
                            <h3 className="text-3xl font-bold mb-3 text-slate-900">Tangkap Gambar.</h3>
                            <p className="text-slate-500 text-lg font-medium max-w-md">Buka aplikasi web BANDA+ dan ambil gambar kerosakan. Sistem akan mengekstrak koordinat GPS secara automatik untuk ketepatan lokasi.</p>
                        </motion.div>

                        {/* Step 2: Tall Card */}
                        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="bg-slate-900 text-white rounded-[2rem] p-8 md:p-12 border border-slate-800 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-b from-teal-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center mb-6">
                                <BrainCircuit className="w-6 h-6 text-teal-400" />
                            </div>
                            <h3 className="text-3xl font-bold mb-3">Analisis AI.</h3>
                            <p className="text-slate-400 font-medium text-lg">Enjin Neural kami mengesan jenis kerosakan (cth: Jalan Berlubang) dalam masa 0.4 saat.</p>
                        </motion.div>

                        {/* Small Feature Cards */}
                        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="bg-white rounded-[2rem] p-8 border border-black/5 flex flex-col justify-center shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
                            <MapPin className="w-8 h-8 text-slate-400 mb-4" />
                            <h4 className="text-lg font-bold text-slate-900">Integrasi Peta Pantas</h4>
                            <p className="text-sm text-slate-500 font-medium mt-2">Geo-lokasi terus ke sistem pentadbiran.</p>
                        </motion.div>

                        {/* Step 3: Wide Card */}
                        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="md:col-span-2 bg-teal-50 rounded-[2rem] p-8 border border-teal-100 flex items-center gap-8 group hover:bg-teal-100/50 transition-colors">
                            <div className="hidden md:flex w-24 h-24 bg-white rounded-full shadow-sm items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                <CheckCircle2 className="w-10 h-10 text-teal-600" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold mb-2 text-slate-900">3. Selesai & Pantau</h3>
                                <p className="text-slate-600 font-medium">Tiket dijana dan diagihkan kepada kontraktor yang sah. Anda akan menerima notifikasi masa-nyata apabila kerosakan sedang dibaiki.</p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* --- COMPARTMENT 3: IMPAK (#impak) --- */}
            <section id="impak" className="py-32 bg-slate-900 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
                
                <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
                    <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-4xl md:text-6xl font-black tracking-tight mb-16">
                        Satu Daerah.<br/>Impak Berskala Besar.
                    </motion.h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-24 divide-y md:divide-y-0 md:divide-x divide-white/10">
                        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="pt-8 md:pt-0">
                            <div className="text-6xl font-black text-teal-400 tracking-tighter mb-2">15k+</div>
                            <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">Pengguna Komuniti</div>
                        </motion.div>
                        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="pt-8 md:pt-0">
                            <div className="text-6xl font-black text-white tracking-tighter mb-2">98%</div>
                            <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">Ketepatan AI</div>
                        </motion.div>
                        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="pt-8 md:pt-0">
                            <div className="text-6xl font-black text-teal-400 tracking-tighter mb-2">&lt;24j</div>
                            <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">Tindakan Respon</div>
                        </motion.div>
                    </div>

                    {/* Final CTA Banner */}
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="bg-gradient-to-br from-teal-500 to-teal-700 rounded-[3rem] p-12 md:p-20 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                        <h3 className="text-3xl md:text-5xl font-black mb-6 tracking-tight leading-tight">Bersedia untuk Menjadi<br/>Wira Komuniti?</h3>
                        <p className="text-teal-50 text-lg font-medium mb-10 max-w-2xl mx-auto">Sertai inisiatif Bandar Pintar. Laporkan aduan pertama anda hari ini dan bantu tingkatkan infrastruktur sekeliling kita.</p>
                        <Link to="/register" className="inline-flex items-center justify-center px-10 py-5 text-lg font-black text-teal-700 bg-white rounded-full hover:scale-105 transition-transform shadow-xl">
                            Sertai BANDA+ Percuma
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* --- COMPARTMENT 4: FOOTER --- */}
            <footer className="bg-white border-t border-black/5 pt-16 pb-8 text-center">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex items-center justify-center gap-2 mb-6">
                        <span className="text-2xl">🏛️</span>
                        <span className="font-extrabold text-xl text-slate-900 tracking-tight">BANDA+</span>
                    </div>
                    <p className="text-slate-500 font-medium mb-8">Inisiatif Pintar untuk Komuniti Ampang Jaya.</p>
                    <div className="flex justify-center gap-6 mb-12 text-sm font-semibold text-slate-400">
                        <a href="#" className="hover:text-slate-900 transition">Dasar Privasi</a>
                        <a href="#" className="hover:text-slate-900 transition">Terma & Syarat</a>
                        <a href="#" className="hover:text-slate-900 transition">Hubungi Sokongan</a>
                    </div>
                    <p className="text-slate-400 text-xs font-medium">© 2026 Hak Cipta Terpelihara. Teknologi BANDA+.</p>
                </div>
            </footer>
        </div>
    );
};

export default Landing;