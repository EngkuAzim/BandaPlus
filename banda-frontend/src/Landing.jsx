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
  X,
  Zap,
  BarChart3,
  ScanLine,
  ChevronRight,
  Shield,
  Users,
  FileCheck,
  Building2,
  HardHat
} from 'lucide-react';
import mpajLogo from './assets/mpaj-logo.png';
import bandaLogoFull from './assets/banda-logo-full.png';
import HeroParticleField from './components/landing/HeroParticleField';

/* ─── Shared animation variants ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

/* ─── Compartment 2A: Feature pill data ─── */
const FEATURES = [
  {
    icon: ScanLine,
    label: 'AI-Assisted Detection',
    desc: 'AI suggests category & priority from your report photo.'
  },
  {
    icon: MapPin,
    label: 'Location-Based Reporting',
    desc: 'Pin the exact location using GPS or an interactive map.'
  },
  {
    icon: BarChart3,
    label: 'Real-Time Status Tracking',
    desc: 'Follow your report from submission to resolution.'
  },
];

/* ─── Compartment 2B: How It Works steps ─── */
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

/* ─── Compartment 2C: Who Uses BANDA+ (4-Role Flow) ─── */
const ROLES = [
  {
    step: 'Step 1',
    role: 'Community',
    icon: Users,
    desc: 'Report and track issues.',
    color: 'bg-blue-50 text-blue-800 border-blue-200',
  },
  {
    step: 'Step 2',
    role: 'Admin',
    icon: Shield,
    desc: 'Review and assign reports.',
    color: 'bg-indigo-50 text-indigo-800 border-indigo-200',
  },
  {
    step: 'Step 3',
    role: 'Department Officer',
    icon: Building2,
    desc: 'Issue work orders and monitor progress.',
    color: 'bg-amber-50 text-amber-800 border-amber-200',
  },
  {
    step: 'Step 4',
    role: 'Contractor',
    icon: HardHat,
    desc: 'Complete assigned work and upload evidence.',
    color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  },
];

/* ─── Compartment 3: Honest project metrics ─── */
const STATS = [
  { value: '4', label: 'User Roles', icon: Users },
  { value: '13', label: 'Core Functions', icon: FileCheck },
  { value: '100%', label: 'Functional Test Pass', icon: Shield },
];

const Landing = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  /* Top scroll progress bar */
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-800/20 overflow-x-hidden">

      {/* ── SCROLL PROGRESS BAR ── */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-800 via-indigo-600 to-amber-500 z-[100]"
        style={{ scaleX, transformOrigin: '0%' }}
      />

      {/* ══════════════════════ 1. FULL-WIDTH PREMIUM NAVBAR ══════════════════════ */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/90 shadow-[0_4px_20px_rgba(0,0,0,0.03)] w-full">
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">

          {/* Brand Block with Increased Visibility & Alignment Polish */}
          <div className="flex items-center gap-3 md:gap-4">
            <img src={mpajLogo} alt="MPAJ Logo" className="h-10 md:h-12 object-contain shrink-0" />
            <div className="h-8 md:h-10 w-[1.5px] bg-slate-200 shrink-0" />
            <div className="flex flex-col justify-center">
              <img src={bandaLogoFull} alt="BANDA+ Logo" className="h-6 md:h-7 object-contain object-left" />
              <span className="text-[9px] md:text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-600 leading-none mt-1">
                Smart Complaint Platform
              </span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8 font-extrabold text-sm text-slate-600">
            <a href="#home"         className="hover:text-blue-800 transition-colors">Home</a>
            <a href="#how-it-works" className="hover:text-blue-800 transition-colors">How It Works</a>
            <a href="#impact"       className="hover:text-blue-800 transition-colors">Impact</a>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-bold text-slate-700 hover:text-blue-800 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="group px-6 py-2.5 rounded-full bg-blue-800 text-white text-sm font-bold shadow-md shadow-blue-800/25 hover:bg-blue-900 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-800/35 transition-all duration-300 flex items-center gap-1.5"
            >
              Create Account
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden text-slate-900 p-2 rounded-xl hover:bg-slate-100 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu Dropdown Card */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute top-[calc(100%+0.5rem)] left-0 right-0 md:hidden bg-white/95 backdrop-blur-xl border border-slate-200 shadow-xl rounded-2xl overflow-hidden"
            >
              <div className="flex flex-col px-6 py-6 gap-4">
                <a href="#home"         onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-bold text-slate-800">Home</a>
                <a href="#how-it-works" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-bold text-slate-800">How It Works</a>
                <a href="#impact"       onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-bold text-slate-800">Impact</a>
                <hr className="border-slate-100 my-2" />
                <Link to="/login"    onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-bold text-blue-800">Sign In</Link>
                <Link to="/register" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-bold text-slate-900">Create Account</Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ══════════════════════ COMPARTMENT 1: HERO SECTION ══════════════════════ */}
      <section
        id="home"
        className="relative min-h-screen flex flex-col items-center justify-center text-center pt-32 pb-24 md:pt-40 md:pb-32 bg-slate-50 overflow-hidden"
      >
        {/* Lightweight background overlay */}
        <HeroParticleField />

        <motion.div
          className="relative z-10 max-w-5xl mx-auto px-6 w-full"
          initial="hidden"
          animate="visible"
          variants={stagger}
        >
          {/* Main Headline (Ultra-crisp slate-950 with rich gradient) */}
          <motion.h1
            variants={fadeUp}
            className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.06] tracking-tight mb-6 text-slate-950"
          >
            Smarter Complaint
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-800 via-blue-900 to-amber-500">
              Management.
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={fadeUp}
            className="max-w-2xl mx-auto text-lg sm:text-xl text-slate-600 leading-relaxed font-medium mb-10"
          >
            Report infrastructure issues in Ampang Jaya with a photo, location, and description.
            BANDA+ helps classify reports, prioritize action, and keep users updated.
          </motion.p>

          {/* Primary & Secondary CTA Buttons with Micro-Interactions */}
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/register"
              className="group inline-flex items-center justify-center gap-2 px-9 py-4 rounded-full bg-blue-800 text-white text-lg font-black shadow-xl shadow-blue-800/30 hover:bg-blue-900 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-800/40 transition-all duration-300"
            >
              Report Now
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center gap-2 px-9 py-4 rounded-full border border-slate-300 bg-white text-slate-700 text-lg font-bold hover:bg-slate-50 hover:border-blue-300 hover:text-blue-800 hover:-translate-y-0.5 shadow-sm hover:shadow-md transition-all duration-300"
            >
              See How It Works
            </a>
          </motion.div>
        </motion.div>
      </section>

      {/* ══════════════════════ COMPARTMENT 2: FEATURES + HOW IT WORKS + USER ROLE FLOW ══════════════════════ */}
      <section id="how-it-works" className="py-28 bg-white relative z-10 border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-6">

          {/* ── SECTION 2A: FEATURE CARDS WITH INTERACTIVE ELEVATION ── */}
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32"
          >
            {FEATURES.map(({ icon: Icon, label, desc }) => (
              <motion.div
                key={label}
                variants={fadeUp}
                className="group bg-slate-50/80 rounded-3xl p-8 border border-slate-200/80 hover:bg-white hover:border-blue-400 hover:shadow-xl hover:shadow-blue-950/5 hover:-translate-y-1 transition-all duration-300 text-left flex flex-col justify-between"
              >
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-800 mb-6 group-hover:bg-blue-800 group-hover:text-white group-hover:scale-105 transition-all duration-300 shadow-sm">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-3 group-hover:text-blue-800 transition-colors">{label}</h3>
                  <p className="text-slate-600 text-base leading-relaxed font-medium">{desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* ── SECTION 2B: HOW IT WORKS WITH DISTINCT STEP MARKERS ── */}
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
            className="mb-32"
          >
            {/* Header */}
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-blue-50 text-blue-800 font-bold text-xs uppercase tracking-widest mb-4 border border-blue-100">
                <Zap className="w-3.5 h-3.5" />
                How It Works
              </span>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 leading-tight mb-5 tracking-tight">
                Simple. Fast. Effective.
              </h2>
              <p className="text-lg sm:text-xl text-slate-600 font-medium leading-relaxed">
                Designed to make infrastructure reporting faster, clearer, and easier to track — from any device.
              </p>
            </div>

            {/* Steps Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {STEPS.map(({ num, icon: Icon, title, desc }) => (
                <motion.div
                  key={num}
                  variants={fadeUp}
                  className="group relative bg-white rounded-3xl p-8 border border-slate-200 hover:border-blue-400 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-left flex flex-col justify-between overflow-hidden"
                >
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-800 to-blue-900 text-white flex items-center justify-center font-black shadow-md shadow-blue-800/25 group-hover:scale-110 transition-transform">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-3xl font-black text-slate-300 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-700 group-hover:to-amber-500 transition-all">{num}</span>
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 mb-3 group-hover:text-blue-800 transition-colors">{title}</h3>
                    <p className="text-slate-600 text-base leading-relaxed font-medium">{desc}</p>
                  </div>
                  {/* Subtle background accent number */}
                  <div className="absolute -bottom-4 -right-4 text-8xl font-black text-slate-50 group-hover:text-blue-50/60 transition-colors pointer-events-none select-none">
                    {num}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* ── SECTION 2C: WHO USES BANDA+ (CONNECTED TIMELINE WORKFLOW) ── */}
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
            className="pt-12 border-t border-slate-200/80"
          >
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-slate-100 text-slate-800 font-bold text-xs uppercase tracking-widest mb-4 border border-slate-200">
                <Users className="w-3.5 h-3.5" />
                Ecosystem Workflow
              </span>
              <h3 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4 tracking-tight">
                Who Uses BANDA+
              </h3>
              <p className="text-lg text-slate-600 font-medium leading-relaxed">
                Built around 4 main user roles for complete end-to-end municipal accountability.
              </p>
            </div>

            {/* 4-Role Flow Grid with Connected Indicators */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
              {ROLES.map(({ step, role, icon: Icon, desc, color }, index) => (
                <motion.div
                  key={role}
                  variants={fadeUp}
                  className="group bg-slate-50/90 rounded-3xl p-6 border border-slate-200/80 hover:bg-white hover:border-blue-400 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-left relative flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4 relative">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
                        {step}
                      </span>
                      {index < 3 && (
                        <div className="hidden lg:flex items-center text-blue-400 font-bold absolute -right-6 top-1/2 -translate-y-1/2 z-20">
                          <ChevronRight className="w-6 h-6 animate-pulse" />
                        </div>
                      )}
                    </div>
                    <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center mb-4 shadow-sm group-hover:scale-105 transition-transform ${color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h4 className="text-xl font-black text-slate-900 mb-2 group-hover:text-blue-800 transition-colors">{role}</h4>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed">{desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

        </div>
      </section>

      {/* ══════════════════════ COMPARTMENT 3: IMPACT / TRUST / FINAL CTA ══════════════════════ */}
      <section id="impact" className="py-28 bg-slate-900 text-white relative z-10 overflow-hidden border-t border-slate-800">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:48px_48px]" />

        {/* Soft ambient blue/gold glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-blue-800/20 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-6">

          {/* Impact Heading */}
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={stagger}
            className="text-center max-w-3xl mx-auto mb-20"
          >
            <motion.h2
              variants={fadeUp}
              className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight mb-5"
            >
              One Platform.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-amber-300">
                Better Complaint Coordination.
              </span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-slate-300 text-lg sm:text-xl font-medium">
              Built for the community. Managed by MPAJ. Powered by BANDA+.
            </motion.p>
          </motion.div>

          {/* Trust / Impact Glassmorphic Metrics Grid */}
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24 max-w-5xl mx-auto"
          >
            {STATS.map(({ value, label, icon: Icon }) => (
              <motion.div
                key={label}
                variants={fadeUp}
                className="group text-center p-8 rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-sm hover:border-blue-500/40 hover:bg-white/[0.08] hover:-translate-y-1 transition-all duration-300 shadow-lg"
              >
                <div className="w-14 h-14 rounded-2xl bg-blue-800/40 border border-blue-500/30 flex items-center justify-center mx-auto mb-5 group-hover:bg-blue-800 group-hover:scale-110 transition-all duration-300">
                  <Icon className="w-7 h-7 text-blue-300 group-hover:text-white transition-colors" />
                </div>
                <div className="text-6xl md:text-7xl font-black text-white mb-2 leading-none">
                  {value}
                </div>
                <div className="uppercase tracking-[0.2em] text-xs text-slate-400 font-bold">{label}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* FINAL CTA CONVERSION CARD WITH AMBIENT GLOW */}
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={fadeUp}
            className="relative max-w-4xl mx-auto group"
          >
            {/* Ambient background glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-amber-500 rounded-[3.2rem] blur-xl opacity-25 group-hover:opacity-40 transition-opacity duration-500 pointer-events-none" />

            <div className="relative bg-white text-slate-900 rounded-[3rem] p-10 sm:p-16 shadow-2xl text-center overflow-hidden border border-slate-100">
              {/* Subtle decorative background blur in card */}
              <div className="absolute -top-24 -right-24 w-72 h-72 bg-blue-100 blur-3xl rounded-full opacity-60 pointer-events-none" />
              <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-amber-100 blur-3xl rounded-full opacity-50 pointer-events-none" />

              <div className="relative z-10 max-w-2xl mx-auto">
                <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-blue-50 text-blue-800 text-xs font-bold uppercase tracking-widest border border-blue-100 mb-6">
                  <Zap className="w-3.5 h-3.5" />
                  Get Started Today
                </span>

                <h3 className="text-4xl sm:text-5xl font-black mb-6 leading-tight text-slate-900 tracking-tight">
                  Help Build a Better
                  <br />
                  Ampang Jaya.
                </h3>

                <p className="text-lg sm:text-xl font-medium text-slate-600 mb-10 leading-relaxed">
                  Create your account and start reporting infrastructure issues more clearly.
                </p>

                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Link
                    to="/register"
                    className="group inline-flex items-center justify-center gap-2 px-9 py-4 rounded-full bg-blue-800 text-white text-lg font-black shadow-xl shadow-blue-800/30 hover:bg-blue-900 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-800/40 transition-all duration-300"
                  >
                    Create Account
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center px-9 py-4 rounded-full border border-slate-300 bg-slate-50 text-slate-700 text-lg font-bold hover:bg-white hover:border-blue-300 hover:text-blue-800 hover:-translate-y-0.5 transition-all duration-300 shadow-sm hover:shadow-md"
                  >
                    Sign In
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* ══════════════════════ FOOTER ══════════════════════ */}
      <footer className="bg-white border-t border-slate-200 pt-16 pb-12 relative z-10">
        <div className="max-w-7xl mx-auto px-6 text-center">
          {/* Brand */}
          <div className="flex items-center justify-center gap-4 mb-4">
            <img src={mpajLogo} alt="MPAJ Logo" className="h-10 object-contain" />
            <div className="h-6 w-[1.5px] bg-slate-200 shrink-0" />
            <img src={bandaLogoFull} alt="BANDA+ Logo" className="h-7 object-contain" />
          </div>
          <p className="text-sm text-slate-500 font-medium mb-8">
            Smart complaint management for Ampang Jaya.
          </p>

          <div className="flex flex-wrap justify-center gap-8 mb-10 text-sm font-bold text-slate-500">
            <a href="#" className="hover:text-blue-800 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-blue-800 transition-colors">Terms &amp; Conditions</a>
            <a href="#" className="hover:text-blue-800 transition-colors">Contact MPAJ Support</a>
          </div>

          <p className="text-xs text-slate-400 font-medium">
            © 2026 BANDA+ · Smart Complaint Management System · Majlis Perbandaran Ampang Jaya
          </p>
        </div>
      </footer>

    </div>
  );
};

export default Landing;