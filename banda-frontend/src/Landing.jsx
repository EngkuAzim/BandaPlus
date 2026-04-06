import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useSpring, AnimatePresence } from 'framer-motion';
import {
  Camera,
  BrainCircuit,
  CheckCircle2,
  ArrowRight,
  MapPin,
  Menu,
  X
} from 'lucide-react';

const Landing = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Scroll Progress Bar Logic
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-teal-500/20 overflow-x-hidden">
      
      {/* SCROLL PROGRESS BAR */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 to-emerald-400 z-[100]" 
        style={{ scaleX, transformOrigin: "0%" }} 
      />

      {/* NAVIGATION - Bright Glassmorphism */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-600 flex items-center justify-center text-white text-sm shadow-md">
              🏛️
            </div>
            <div className="leading-none">
              <span className="font-black text-2xl tracking-tight text-slate-900">
                BANDA<span className="text-teal-600">+</span>
              </span>
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8 px-8 py-2.5 rounded-full bg-slate-100/50 border border-slate-200 shadow-sm backdrop-blur-md">
            <a href="#utama" className="text-sm font-bold text-slate-600 hover:text-teal-600 transition-colors">Utama</a>
            <a href="#cara-guna" className="text-sm font-bold text-slate-600 hover:text-teal-600 transition-colors">Cara Guna</a>
            <a href="#impak" className="text-sm font-bold text-slate-600 hover:text-teal-600 transition-colors">Impak</a>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <Link to="/login" className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors">
              Log Masuk
            </Link>
            <Link to="/register" className="px-6 py-2.5 rounded-full bg-teal-600 text-white text-sm font-bold shadow-lg shadow-teal-600/20 hover:bg-teal-700 hover:-translate-y-0.5 hover:shadow-teal-600/40 transition-all duration-300">
              Daftar Akaun
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden text-slate-900 p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden bg-white border-b border-slate-200 overflow-hidden"
            >
              <div className="flex flex-col px-6 py-6 gap-4">
                <a href="#utama" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-bold text-slate-700">Utama</a>
                <a href="#cara-guna" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-bold text-slate-700">Cara Guna</a>
                <a href="#impak" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-bold text-slate-700">Impak</a>
                <hr className="border-slate-100 my-2" />
                <Link to="/login" className="text-lg font-bold text-teal-600">Log Masuk</Link>
                <Link to="/register" className="text-lg font-bold text-slate-900">Daftar Akaun Baru</Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* HERO SECTION - Bright & Clean */}
      <section id="utama" className="relative pt-36 lg:pt-48 pb-24 lg:pb-32 flex flex-col items-center text-center bg-slate-50">
        
        {/* Animated Background Orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden flex justify-center items-center">
          <motion.div 
            animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.6, 0.4] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-20 left-[10%] w-[600px] h-[600px] bg-teal-200/50 blur-[120px] rounded-full" 
          />
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-[-10%] right-[10%] w-[500px] h-[500px] bg-emerald-200/50 blur-[120px] rounded-full" 
          />
        </div>

        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="relative z-10 max-w-5xl px-6">
          
          {/* Animated Badge */}
          <div className="mx-auto mb-8 w-fit px-5 py-2 rounded-full border border-teal-100 bg-white shadow-sm flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-50 animate-ping" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-teal-500" />
            </span>
            <span className="text-xs md:text-sm font-bold uppercase tracking-[0.2em] text-teal-700">
              Enjin AI Generatif Sedia Beroperasi
            </span>
          </div>

          {/* Gradient Typography */}
          <h1 className="text-5xl md:text-7xl lg:text-[6.5rem] font-black leading-[1.05] tracking-tight mb-8 text-slate-900">
            Sistem Aduan
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-500 drop-shadow-sm">
              Lebih Pintar.
            </span>
          </h1>

          <p className="max-w-3xl mx-auto text-lg md:text-xl text-slate-600 leading-relaxed font-medium mb-12">
            Laporkan kerosakan infrastruktur di Ampang Jaya hanya dengan satu gambar.
            BANDA+ menggunakan AI untuk mengenal pasti jenis kerosakan, lokasi,
            dan menghantar aduan secara automatik.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-5">
            <Link to="/register" className="group inline-flex items-center justify-center px-9 py-4 rounded-full bg-teal-600 text-white text-lg font-black shadow-xl shadow-teal-600/20 hover:bg-teal-700 hover:-translate-y-1 hover:shadow-2xl hover:shadow-teal-600/30 transition-all duration-300">
              Lapor Sekarang
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a href="#cara-guna" className="inline-flex items-center justify-center px-9 py-4 rounded-full border border-slate-200 bg-white text-slate-700 text-lg font-bold hover:bg-slate-50 hover:border-slate-300 shadow-sm transition-all">
              Ketahui Cara
            </a>
          </div>
        </motion.div>
      </section>

      {/* CARA GUNA - Bright Bento Grid */}
      <section id="cara-guna" className="py-24 bg-white border-y border-slate-200 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-50 text-teal-700 font-bold text-sm mb-5 border border-teal-100">
              Bagaimana BANDA+ Berfungsi
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-4 tracking-tight text-slate-900">Mekanik Sistem.</h2>
            <p className="text-lg text-slate-600 max-w-2xl font-medium">
              Direka untuk pantas, mudah dan terus kepada tindakan. Hanya 3 langkah untuk melaporkan kerosakan di kawasan anda.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="md:col-span-2 rounded-[2rem] bg-slate-50 border border-slate-200 p-8 md:p-12 relative overflow-hidden group hover:border-teal-200 transition-all hover:shadow-xl hover:shadow-slate-200/50">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 group-hover:rotate-6 group-hover:scale-110 transition-all duration-500">
                <Camera className="w-40 h-40 text-teal-600" />
              </div>
              <div className="w-14 h-14 rounded-2xl bg-white shadow-sm text-teal-600 flex items-center justify-center font-black text-xl mb-6 border border-slate-100">1</div>
              <h3 className="text-3xl font-black mb-3 text-slate-900">Tangkap Gambar</h3>
              <p className="text-slate-600 text-lg leading-relaxed max-w-xl font-medium relative z-10">
                Ambil gambar kerosakan seperti jalan berlubang, lampu rosak atau longkang. Sistem akan mengesan koordinat GPS secara automatik.
              </p>
            </motion.div>

            {/* Card 2 - Keeps a dark accent for visual balance */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="rounded-[2rem] bg-slate-900 text-white p-8 md:p-10 relative overflow-hidden group hover:shadow-xl transition-all">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center mb-6">
                  <BrainCircuit className="w-7 h-7 text-teal-400" />
                </div>
                <h3 className="text-3xl font-black mb-3">Analisis AI</h3>
                <p className="text-slate-300 text-lg leading-relaxed font-medium">
                  AI mengenal pasti jenis kerosakan dan tahap keutamaan dalam beberapa saat.
                </p>
              </div>
            </motion.div>

            {/* Card 3 */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="rounded-[2rem] bg-white border border-slate-200 p-8 hover:border-teal-200 hover:shadow-lg transition-all">
              <MapPin className="w-9 h-9 text-teal-600 mb-4" />
              <h4 className="text-xl font-black text-slate-900 mb-2">Integrasi Peta</h4>
              <p className="text-slate-600 font-medium leading-relaxed">
                Lokasi terus dipaparkan pada sistem pentadbiran MPAJ.
              </p>
            </motion.div>

            {/* Card 4 */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="md:col-span-2 rounded-[2rem] bg-teal-50 border border-teal-100 p-8 md:p-10 flex items-center gap-6 group hover:shadow-lg hover:border-teal-200 transition-all">
              <div className="hidden md:flex w-20 h-20 rounded-full bg-white shadow-sm border border-teal-100 items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
              </div>
              <div>
                <h3 className="text-3xl font-black mb-2 text-slate-900">Selesai & Pantau</h3>
                <p className="text-slate-600 text-lg leading-relaxed font-medium">
                  Aduan dihantar kepada jabatan berkaitan dan anda boleh menjejaki status pembaikan secara masa nyata.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* IMPAK - High Contrast Section */}
      <section id="impak" className="py-28 bg-slate-900 relative overflow-hidden border-t border-slate-800">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:44px_44px]" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-4xl md:text-6xl font-black tracking-tight mb-16 text-white">
            Satu Daerah.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">Impak Berskala Besar.</span>
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-24 divide-y md:divide-y-0 md:divide-x divide-white/10">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="pt-8 md:pt-0">
              <div className="text-6xl md:text-7xl font-black text-white mb-2">15k<span className="text-4xl text-teal-400">+</span></div>
              <div className="uppercase tracking-[0.2em] text-sm text-slate-400 font-bold">Pengguna Komuniti</div>
            </motion.div>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="pt-8 md:pt-0">
              <div className="text-6xl md:text-7xl font-black text-white mb-2">98<span className="text-4xl text-teal-400">%</span></div>
              <div className="uppercase tracking-[0.2em] text-sm text-slate-400 font-bold">Ketepatan AI</div>
            </motion.div>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="pt-8 md:pt-0">
              <div className="text-6xl md:text-7xl font-black text-white mb-2">&lt;24<span className="text-4xl text-teal-400">j</span></div>
              <div className="uppercase tracking-[0.2em] text-sm text-slate-400 font-bold">Masa Tindakan</div>
            </motion.div>
          </div>

          {/* Call to Action CTA - Light version against dark background */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="relative overflow-hidden rounded-[3rem] bg-white p-12 md:p-20 shadow-2xl group">
            <div className="absolute -top-20 -right-20 w-72 h-72 bg-teal-100 blur-3xl rounded-full group-hover:bg-teal-200 transition-colors" />
            <div className="relative z-10">
              <h3 className="text-3xl md:text-5xl font-black mb-6 leading-tight text-slate-900">
                Bersedia Menjadi<br />Wira Komuniti?
              </h3>
              <p className="max-w-2xl mx-auto text-lg md:text-xl font-medium text-slate-600 mb-10 leading-relaxed">
                Sertai inisiatif Bandar Pintar dan bantu menjadikan Ampang Jaya lebih selamat, cekap dan responsif.
              </p>
              <Link to="/register" className="inline-flex items-center justify-center px-10 py-5 rounded-full bg-teal-600 text-white text-lg font-black shadow-xl hover:bg-teal-700 hover:scale-105 transition-all duration-300">
                Sertai BANDA+ Percuma
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-50 border-t border-slate-200 pt-16 pb-10 text-center relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-teal-600 flex items-center justify-center text-white shadow-md">
              🏛️
            </div>
            <div className="font-black text-2xl tracking-tight text-slate-900">
              BANDA<span className="text-teal-600">+</span>
            </div>
          </div>
          <p className="text-slate-600 font-medium mb-8">
            Inisiatif Pintar untuk Komuniti Ampang Jaya.
          </p>
          <div className="flex flex-wrap justify-center gap-6 mb-10 text-sm font-bold text-slate-600">
            <a href="#" className="hover:text-teal-600 transition-colors">Dasar Privasi</a>
            <a href="#" className="hover:text-teal-600 transition-colors">Terma & Syarat</a>
            <a href="#" className="hover:text-teal-600 transition-colors">Hubungi Sokongan MPAJ</a>
          </div>
          <p className="text-xs text-slate-400 font-medium">
            © 2026 BANDA+ · Sistem Maklumat Pengurusan Aduan Pintar Berintegrasikan Smart Vision dan Analitik Keutamaan
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;