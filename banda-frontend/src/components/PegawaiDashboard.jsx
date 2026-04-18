import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Wallet, 
  Briefcase, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  Building2,
  AlertTriangle
} from 'lucide-react';

function PegawaiDashboard({ userData, stats }) {
  const navigate = useNavigate();

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } };

  // Data mokap untuk Bajet Mikro (Boleh disambung ke API kelak)
  const bajet = { tahunan: 500000, bakiSemasa: 345200 };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-7xl mx-auto w-full">
      <motion.div variants={itemVariants} className="mb-8">
        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Building2 className="w-6 h-6 text-teal-600" />
          Papan Pemuka Pegawai Jabatan
        </h3>
        <p className="text-sm font-medium text-slate-500 mt-1">Urus penugasan kontraktor dan pantau bajet mikro BANDA+.</p>
      </motion.div>

      {/* Kad Statistik & Bajet */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Kad Bajet Mikro (Khas untuk Pegawai) */}
        <motion.div variants={itemVariants} className="md:col-span-1 bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-20"><Wallet className="w-20 h-20" /></div>
          <p className="text-slate-300 text-xs font-bold uppercase tracking-widest mb-1">Baki Semasa Jabatan</p>
          <h4 className="text-3xl font-black mb-4">RM {(bajet.bakiSemasa).toLocaleString('ms-MY')}</h4>
          <div className="w-full bg-slate-700 rounded-full h-2 mb-2">
            <div className="bg-teal-400 h-2 rounded-full" style={{ width: `${(bajet.bakiSemasa / bajet.tahunan) * 100}%` }}></div>
          </div>
          <p className="text-xs text-slate-400">Daripada peruntukan RM {(bajet.tahunan).toLocaleString('ms-MY')}</p>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500 border border-amber-100">
            <Briefcase className="w-7 h-7" />
          </div>
          <div>
            <p className="text-slate-500 font-bold text-[11px] uppercase tracking-wider mb-1">Perlu Lantik Kontraktor</p>
            <h4 className="text-3xl font-black text-slate-900">{stats?.diproses || 0}</h4>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500 border border-emerald-100">
            <Clock className="w-7 h-7" />
          </div>
          <div>
            <p className="text-slate-500 font-bold text-[11px] uppercase tracking-wider mb-1">Kerja Sedang Berjalan</p>
            <h4 className="text-3xl font-black text-slate-900">{Math.floor((stats?.diproses || 0) / 2)}</h4>
          </div>
        </motion.div>
      </div>

      <motion.div variants={itemVariants} className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-lg font-black text-slate-900">Tindakan Segera</h4>
        </div>
        <div className="bg-teal-50 border border-teal-100 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white rounded-xl shadow-sm"><AlertTriangle className="w-6 h-6 text-amber-500" /></div>
            <div>
              <h5 className="font-bold text-slate-800">Terdapat Aduan Menunggu Penugasan</h5>
              <p className="text-sm text-slate-600">Sila semak aduan yang telah disahkan oleh Pentadbir dan lantik kontraktor bertugas.</p>
            </div>
          </div>
          <button className="whitespace-nowrap bg-teal-600 hover:bg-teal-700 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-md flex items-center gap-2">
            Senarai Arahan Kerja <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default PegawaiDashboard;