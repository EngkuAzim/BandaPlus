import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useSpring, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Camera,
  BrainCircuit,
  CheckCircle2,
  ArrowRight,
  MapPin,
  Menu,
  X,
  Zap,
  BarChart3,
  ScanLine,
  ChevronRight,
  Shield,
  Users,
  FileCheck,
} from 'lucide-react';
import mpajLogo from './assets/mpaj-logo.png';
import bandaLogoFull from './assets/banda-logo-full.png';
import HeroParticleField from './components/landing/HeroParticleField';

/* ─── Shared animation variants ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
  },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

/* ─── Feature pill data ─── */
const FEATURES = [
  { icon: ScanLine, label: 'AI-Assisted Detection', desc: 'AI suggests category & priority from your report photo.' },
  { icon: MapPin,   label: 'Location-Based Reporting', desc: 'Pin the exact location using GPS or an interactive map.' },
  { icon: BarChart3, label: 'Real-Time Status Tracking', desc: 'Follow your report from submission to resolution.' },
];

/* ─── How It Works steps ─── */
const STEPS = [
  {
    num: '01',
    icon: Camera,
    title: 'Upload a Photo',
    desc: 'Take a photo of the issue — potholes, fallen trees, stray animals. Your photo becomes supporting evidence for the report.',
  },
  {
    num: '02',
    icon: BrainCircuit,
    title: 'Confirm Details',
    desc: 'Review the AI suggestion, add a location, choose a zone and describe the issue. You always stay in control.',
  },
  {
    num: '03',
    icon: CheckCircle2,
    title: 'Track Progress',
    desc: 'Follow your report status as it moves from review to action. Get notified when things change.',
  },
];

/* ─── Impact / stats ─── */
const STATS = [
  { value: '4', label: 'User Roles', icon: Users },
  { value: '13', label: 'Core Functions', icon: FileCheck },
  { value: '100%', label: 'Functional Test Pass', icon: Shield },
];

/* ══════════════════════════════════════════════════════════════════ */
const Landing = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  /* Scroll progress bar */
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-800/20 overflow-x-hidden">

      {/* ── SCROLL PROGRESS BAR ── */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-800 via-indigo-600 to-amber-500 z-[100]"
        style={{ scaleX, transformOrigin: '0%' }}
      />

      {/* ══════════════════════ NAVBAR ══════════════════════ */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200/80 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">

          {/* Brand */}
          <div className="flex items-center gap-3">
            <img src={mpajLogo} alt="MPAJ Logo" className="h-10 md:h-11 object-contain shrink-0" />
            <div className="h-7 w-[1.5px] bg-slate-300 shrink-0" />
            <div className="flex flex-col">
              <img src={bandaLogoFull} alt="BANDA+ Logo" className="h-6 md:h-7 object-contain object-left" />
              <span className="text-[9px] font-extrabold uppercase tracking-[0.1em] text-slate-400 leading-none mt-1">
                Smart Complaint Platform
              </span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8 px-8 py-2.5 rounded-full bg-slate-100/70 border border-slate-200 shadow-sm backdrop-blur-md">
            <a href="#home"         className="text-sm font-bold text-slate-600 hover:text-blue-800 transition-colors">Home</a>
            <a href="#how-it-works" className="text-sm font-bold text-slate-600 hover:text-blue-800 transition-colors">How It Works</a>
            <a href="#impact"       className="text-sm font-bold text-slate-600 hover:text-blue-800 transition-colors">Impact</a>
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-4">
            <Link to="/login" className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors">
              Sign In
            </Link>
            <Link
              to="/register"
              className="group px-6 py-2.5 rounded-full bg-blue-800 text-white text-sm font-bold shadow-lg shadow-blue-800/20 hover:bg-blue-900 hover:-translate-y-0.5 hover:shadow-blue-800/40 transition-all duration-300 flex items-center gap-1.5"
            >
              Create Account
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden text-slate-900 p-2 rounded-lg hover:bg-slate-100 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="md:hidden bg-white border-b border-slate-200 overflow-hidden"
            >
              <div className="flex flex-col px-6 py-6 gap-4">
                <a href="#home"         onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-bold text-slate-700">Home</a>
                <a href="#how-it-works" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-bold text-slate-700">How It Works</a>
                <a href="#impact"       onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-bold text-slate-700">Impact</a>
                <hr className="border-slate-100 my-2" />
                <Link to="/login"    className="text-lg font-bold text-blue-800">Sign In</Link>
                <Link to="/register" className="text-lg font-bold text-slate-900">Create Account</Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ══════════════════════ HERO SECTION ══════════════════════ */}
      <section
        id="home"
        className="relative min-h-screen flex flex-col items-center justify-center text-center pt-24 pb-16 bg-white overflow-hidden"
        style={{ background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 60%, #f1f5f9 100%)' }}
      >
        {/* Interactive particle field */}
        <HeroParticleField />

        {/* Hero content */}
        <motion.div
          className="relative z-10 max-w-5xl mx-auto px-6"
          initial="hidden"
          animate="visible"
          variants={stagger}
        >
          {/* Main Headline — NO badge above */}
          <motion.h1
            variants={fadeUp}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] xl:text-[6.5rem] font-black leading-[1.05] tracking-tight mb-8 text-slate-900"
          >
            Smarter Complaint
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-800 via-blue-700 to-amber-500">
              Management.
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={fadeUp}
            className="max-w-2xl mx-auto text-lg md:text-xl text-slate-500 leading-relaxed font-medium mb-12"
          >
            Report infrastructure issues in Ampang Jaya with a photo, location, and description.
            BANDA+ helps classify reports, prioritize action, and keep users updated.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/register"
              className="group inline-flex items-center justify-center gap-2 px-9 py-4 rounded-full bg-blue-800 text-white text-lg font-black shadow-xl shadow-blue-800/25 hover:bg-blue-900 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-800/35 transition-all duration-300"
            >
              Report Now
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center gap-2 px-9 py-4 rounded-full border border-slate-200 bg-white/80 text-slate-700 text-lg font-bold hover:bg-white hover:border-blue-200 hover:text-blue-800 shadow-sm transition-all duration-300"
            >
              See How It Works
            </a>
          </motion.div>

          {/* Feature strip */}
          <motion.div
            variants={stagger}
            className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-4"
          >
            {FEATURES.map(({ icon: Icon, label, desc }) => (
              <motion.div
                key={label}
                variants={fadeUp}
                className="group flex items-start gap-4 px-5 py-4 rounded-2xl border border-slate-200 bg-white/70 backdrop-blur-sm hover:border-blue-200 hover:bg-white hover:shadow-md transition-all duration-300 text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
                  <Icon className="w-5 h-5 text-blue-800" />
                </div>
                <div>
                  <p className="text-sm font-black text-slate-900 mb-0.5">{label}</p>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">{desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Bottom fade gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none bg-gradient-to-t from-slate-50 to-transparent" />
      </section>

      {/* ══════════════════════ HOW IT WORKS ══════════════════════ */}
      <section id="how-it-works" className="py-28 bg-slate-50 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          {/* Section header */}
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={stagger}
            className="mb-20 max-w-2xl"
          >
            <motion.div
              variants={fadeUp}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-800 font-bold text-xs uppercase tracking-widest mb-6 border border-blue-100"
            >
              <Zap className="w-3.5 h-3.5" />
              How It Works
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-black mb-5 tracking-tight text-slate-900 leading-tight">
              Simple.<br />Fast.<br />Effective.
            </motion.h2>
            <motion.p variants={fadeUp} className="text-lg text-slate-600 font-medium leading-relaxed">
              Designed to make infrastructure reporting faster, clearer, and easier to track — from any device.
            </motion.p>
          </motion.div>

          {/* Steps */}
          <div className="relative">
            {/* Vertical connector line (desktop) */}
            <div className="hidden md:block absolute left-[2.25rem] top-10 bottom-10 w-[1.5px] bg-gradient-to-b from-blue-200 via-slate-200 to-transparent" />

            <div className="flex flex-col gap-6">
              {STEPS.map(({ num, icon: Icon, title, desc }, i) => (
                <motion.div
                  key={num}
                  initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }}
                  variants={fadeUp}
                  className="group relative flex gap-6 bg-white rounded-3xl p-7 md:p-9 border border-slate-200 hover:border-blue-200 hover:shadow-xl hover:shadow-slate-200/60 transition-all duration-400"
                >
                  {/* Step number badge */}
                  <div className="relative shrink-0">
                    <div className="w-[4.5rem] h-[4.5rem] rounded-2xl bg-blue-50 border border-blue-100 flex flex-col items-center justify-center text-blue-800 group-hover:bg-blue-800 group-hover:border-blue-800 group-hover:text-white transition-all duration-300 z-10">
                      <Icon className="w-6 h-6 mb-0.5" />
                      <span className="text-[9px] font-black tracking-widest opacity-60">{num}</span>
                    </div>
                  </div>

                  <div className="flex-1 pt-1">
                    <h3 className="text-2xl font-black text-slate-900 mb-2 group-hover:text-blue-800 transition-colors">{title}</h3>
                    <p className="text-slate-600 text-base leading-relaxed font-medium max-w-2xl">{desc}</p>
                  </div>

                  {/* Subtle accent number */}
                  <div className="hidden lg:block absolute right-8 top-1/2 -translate-y-1/2 text-[5rem] font-black text-slate-100 group-hover:text-blue-50 transition-colors leading-none select-none">
                    {num}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════ IMPACT / STATS ══════════════════════ */}
      <section id="impact" className="py-28 bg-slate-900 relative overflow-hidden border-t border-slate-800">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff06_1px,transparent_1px),linear-gradient(to_bottom,#ffffff06_1px,transparent_1px)] bg-[size:48px_48px]" />

        {/* Ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-800/10 blur-[80px] rounded-full pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-6">
          {/* Heading */}
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-20"
          >
            <motion.h2
              variants={fadeUp}
              className="text-4xl md:text-6xl font-black tracking-tight text-white leading-tight mb-4"
            >
              One Platform.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-amber-300">
                Better Complaint Coordination.
              </span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-slate-400 text-lg font-medium max-w-xl mx-auto">
              Built for the community. Managed by MPAJ. Powered by BANDA+.
            </motion.p>
          </motion.div>

          {/* Stats grid */}
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20"
          >
            {STATS.map(({ value, label, icon: Icon }) => (
              <motion.div
                key={label}
                variants={fadeUp}
                className="group text-center p-8 rounded-3xl border border-white/8 bg-white/4 hover:border-blue-500/30 hover:bg-white/6 transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-2xl bg-blue-800/30 border border-blue-600/20 flex items-center justify-center mx-auto mb-5 group-hover:bg-blue-800/50 transition-colors">
                  <Icon className="w-7 h-7 text-blue-300" />
                </div>
                <div className="text-6xl md:text-7xl font-black text-white mb-2 leading-none">
                  {value.endsWith('%') ? (
                    <>{value.replace('%', '')}<span className="text-4xl text-amber-400">%</span></>
                  ) : value}
                </div>
                <div className="uppercase tracking-[0.2em] text-xs text-slate-400 font-bold">{label}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA Card */}
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={fadeUp}
            className="relative overflow-hidden rounded-[2.5rem] bg-white p-10 md:p-16 shadow-2xl"
          >
            {/* Decorative */}
            <div className="absolute -top-24 -right-24 w-72 h-72 bg-blue-100 blur-3xl rounded-full opacity-60 pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-amber-100 blur-2xl rounded-full opacity-40 pointer-events-none" />

            <div className="relative z-10 text-center max-w-2xl mx-auto">
              <p className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-800 text-xs font-bold uppercase tracking-widest border border-blue-100 mb-6">
                <Zap className="w-3.5 h-3.5" />
                Get Started Today
              </p>
              <h3 className="text-3xl md:text-5xl font-black mb-5 leading-tight text-slate-900">
                Ready to improve<br />your community?
              </h3>
              <p className="text-lg md:text-xl font-medium text-slate-600 mb-10 leading-relaxed">
                Create your account and start reporting infrastructure issues more clearly.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link
                  to="/register"
                  className="group inline-flex items-center justify-center gap-2 px-9 py-4 rounded-full bg-blue-800 text-white text-base font-black shadow-xl shadow-blue-800/25 hover:bg-blue-900 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300"
                >
                  Create Account
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center px-9 py-4 rounded-full border border-slate-200 bg-slate-50 text-slate-700 text-base font-bold hover:bg-white hover:border-blue-200 hover:text-blue-800 transition-all duration-300"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════ FOOTER ══════════════════════ */}
      <footer className="bg-white border-t border-slate-200 pt-14 pb-10 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          {/* Brand */}
          <div className="flex items-center justify-center gap-4 mb-4">
            <img src={mpajLogo} alt="MPAJ Logo" className="h-9 object-contain" />
            <div className="h-6 w-[1.5px] bg-slate-200 shrink-0" />
            <img src={bandaLogoFull} alt="BANDA+ Logo" className="h-7 object-contain" />
          </div>
          <p className="text-center text-sm text-slate-500 font-medium mb-8">
            Smart complaint management for Ampang Jaya.
          </p>

          <div className="flex flex-wrap justify-center gap-6 mb-10 text-sm font-bold text-slate-500">
            <a href="#" className="hover:text-blue-800 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-blue-800 transition-colors">Terms &amp; Conditions</a>
            <a href="#" className="hover:text-blue-800 transition-colors">Contact MPAJ Support</a>
          </div>

          <p className="text-center text-xs text-slate-400 font-medium">
            © 2026 BANDA+ · Smart Complaint Management System · Majlis Perbandaran Ampang Jaya
          </p>
        </div>
      </footer>

    </div>
  );
};

export default Landing;