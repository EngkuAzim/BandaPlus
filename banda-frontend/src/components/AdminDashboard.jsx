import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Activity, 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ShieldAlert, 
  BrainCircuit, 
  ArrowRight 
} from 'lucide-react';

function AdminDashboard({ userData, stats }) {
  const navigate = useNavigate();

  // Animasi standard untuk transisi kemas
  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-7xl mx-auto w-full">
      
      {/* Header Selamat Datang Pentadbir */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-800">
            Pusat Kawalan <span className="text-teal-600 font-black italic">BANDA+</span>
          </h3>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Pantau saringan, kluster kerosakan, dan prestasi jabatan.
          </p>
        </div>
        <button 
          onClick={() => navigate('/urus-aduan')}
          className="bg-slate-900 hover:bg-teal-600 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-lg shadow-slate-200 transition-all flex items-center gap-2"
        >
          <ShieldAlert className="w-4 h-4" />
          Urus & Saring Aduan
        </button>
      </motion.div>

      {/* Kad Statistik Keseluruhan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        <motion.div variants={itemVariants} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex items-center gap-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-teal-50 rounded-full blur-2xl -mr-8 -mt-8 transition-all group-hover:bg-teal-100"></div>
          <div className="w-14 h-14 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600 border border-teal-100 z-10">
            <AlertCircle className="w-7 h-7" />
          </div>
          <div className="z-10">
            <p className="text-slate-500 font-bold text-[11px] uppercase tracking-wider mb-1">Menunggu Saringan</p>
            <h4 className="text-3xl font-black text-slate-900">{stats?.baru || 0}</h4>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex items-center gap-5 relative overflow-hidden">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500 border border-amber-100 z-10">
            <Clock className="w-7 h-7" />
          </div>
          <div className="z-10">
            <p className="text-slate-500 font-bold text-[11px] uppercase tracking-wider mb-1">Dalam Tindakan Jabatan</p>
            <h4 className="text-3xl font-black text-slate-900">{stats?.diproses || 0}</h4>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex items-center gap-5 relative overflow-hidden">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500 border border-emerald-100 z-10">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div className="z-10">
            <p className="text-slate-500 font-bold text-[11px] uppercase tracking-wider mb-1">Selesai / Ditutup</p>
            <h4 className="text-3xl font-black text-slate-900">{stats?.selesai || 0}</h4>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex items-center gap-5 relative overflow-hidden">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500 border border-rose-100 z-10">
            <XCircle className="w-7 h-7" />
          </div>
          <div className="z-10">
            <p className="text-slate-500 font-bold text-[11px] uppercase tracking-wider mb-1">Aduan Ditolak</p>
            <h4 className="text-3xl font-black text-slate-900">{stats?.ditolak || 0}</h4>
          </div>
        </motion.div>

      </div>

      {/* Bahagian Pintasan & Integrasi AI (Persediaan untuk Modul Seterusnya) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Panel Pintasan Tindakan */}
        <motion.div variants={itemVariants} className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
          <div className="flex items-center gap-3 mb-6">
            <Activity className="w-6 h-6 text-slate-800" />
            <h4 className="text-lg font-black text-slate-900">Aktiviti Saringan</h4>
          </div>
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 text-center">
            <ShieldAlert className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h5 className="font-bold text-slate-700 mb-1">Terdapat {stats?.baru || 0} aduan baharu</h5>
            <p className="text-sm text-slate-500 mb-5">Aduan ini memerlukan saringan Pentadbir untuk ditugaskan ke Jabatan yang betul.</p>
            <button onClick={() => navigate('/urus-aduan')} className="text-teal-600 font-bold text-sm bg-teal-50 px-5 py-2.5 rounded-xl hover:bg-teal-100 transition-colors inline-flex items-center gap-2">
              Saring Sekarang <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        {/* Panel Status AI (Mokap untuk Fasa YOLOv8/Clustering) */}
        <motion.div variants={itemVariants} className="bg-gradient-to-br from-teal-900 to-slate-900 rounded-3xl shadow-lg p-8 text-white relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 opacity-10"><BrainCircuit className="w-40 h-40" /></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <BrainCircuit className="w-6 h-6 text-teal-400" />
              <h4 className="text-lg font-black tracking-wide">Status BANDA+ AI</h4>
            </div>
            
            <div className="space-y-5">
              <div>
                <p className="text-teal-200 text-xs font-bold uppercase tracking-widest mb-1">Smart Vision (YOLOv8)</p>
                <div className="flex items-center gap-2">
                  <span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span></span>
                  <span className="text-sm font-medium">Model Aktif & Bersedia</span>
                </div>
              </div>
              
              <div className="pt-4 border-t border-slate-700/50">
                <p className="text-teal-200 text-xs font-bold uppercase tracking-widest mb-1">Kluster Kerosakan Radius 20m</p>
                <p className="text-2xl font-black">{Math.floor((stats?.jumlah_keseluruhan || 0) * 0.1)} Kluster</p>
                <p className="text-xs text-slate-400 mt-1">Dikesan bulan ini</p>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
}

export default AdminDashboard;