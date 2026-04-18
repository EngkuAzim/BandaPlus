import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FilePlus, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';

function UserDashboard({ userData, stats }) {
  const navigate = useNavigate();

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-6xl mx-auto">
      <motion.h3 variants={itemVariants} className="text-lg font-medium text-slate-600 mb-6">
        Selamat datang, <span className="font-bold text-slate-900">{userData?.name}</span>! Berikut adalah ringkasan aduan anda.
      </motion.h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div variants={itemVariants} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex items-center gap-5 relative overflow-hidden">
          <div className="w-14 h-14 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600 border border-teal-100"><AlertCircle className="w-7 h-7" /></div>
          <div>
            <p className="text-slate-500 font-bold text-sm uppercase tracking-wide">Aduan Baru</p>
            <h4 className="text-4xl font-black text-slate-900 mt-1">{stats?.baru || 0}</h4>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-5 relative overflow-hidden">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500 border border-amber-100"><Clock className="w-7 h-7" /></div>
          <div>
            <p className="text-slate-500 font-bold text-sm uppercase tracking-wide">Diproses</p>
            <h4 className="text-4xl font-black text-slate-900 mt-1">{stats?.diproses || 0}</h4>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-5 relative overflow-hidden">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500 border border-emerald-100"><CheckCircle2 className="w-7 h-7" /></div>
          <div>
            <p className="text-slate-500 font-bold text-sm uppercase tracking-wide">Selesai</p>
            <h4 className="text-4xl font-black text-slate-900 mt-1">{stats?.selesai || 0}</h4>
          </div>
        </motion.div>
      </div>

      <motion.div variants={itemVariants} className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden mt-8">
        <div className="p-12 flex flex-col items-center justify-center text-center bg-gradient-to-b from-white to-slate-50/50">
          <div className="w-24 h-24 bg-teal-50 rounded-full flex items-center justify-center mb-6 border border-teal-100 shadow-sm">
            <FilePlus className="w-10 h-10 text-teal-600" />
          </div>
          <h4 className="text-2xl font-black text-slate-900 mb-3">Lapor Kerosakan Infrastruktur</h4>
          <p className="text-slate-600 max-w-md mb-8 leading-relaxed">Muat naik gambar kerosakan jalan, lampu jalan, atau kemudahan awam. Sistem BANDA+ akan mengesannya secara automatik melalui Smart Vision.</p>
          <button onClick={() => navigate('/lapor-aduan')} className="bg-teal-600 hover:bg-teal-700 text-white font-black py-4 px-10 rounded-2xl transition-all shadow-lg shadow-teal-600/20 hover:-translate-y-1">
            Mula Lapor Aduan
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default UserDashboard;