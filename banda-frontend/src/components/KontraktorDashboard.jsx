import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
  HardHat, 
  MapPin, 
  Camera, 
  CheckSquare, 
  Clock, 
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';

function KontraktorDashboard({ userData, stats }) {
  const [tugasanList, setTugasanList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTugasan = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:8000/api/kontraktor/tugasan', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTugasanList(res.data.slice(0, 5)); // Just show top 5 latest
      } catch (error) {
        console.error('Gagal memuatkan senarai tugasan');
      } finally {
        setIsLoading(false);
      }
    };
    fetchTugasan();
  }, []);

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-2xl mx-auto w-full px-4 md:px-0 pb-20">
      <motion.div variants={itemVariants} className="mb-8">
        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <HardHat className="w-6 h-6 text-amber-600" />
          Papan Pemuka Kontraktor
        </h3>
        <p className="text-sm font-medium text-slate-500 mt-1">Selesaikan arahan kerja dan muat naik bukti pembaikan berkoordinat GPS.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <motion.div variants={itemVariants} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500 border border-amber-100">
            <AlertCircle className="w-7 h-7" />
          </div>
          <div>
            <p className="text-slate-500 font-bold text-[11px] uppercase tracking-wider mb-1">Tugasan Dalam Proses</p>
            <h4 className="text-3xl font-black text-slate-900">{stats?.tugasan_baru || 0}</h4>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500 border border-emerald-100">
            <CheckSquare className="w-7 h-7" />
          </div>
          <div>
            <p className="text-slate-500 font-bold text-[11px] uppercase tracking-wider mb-1">Tugasan Selesai (Keseluruhan)</p>
            <h4 className="text-3xl font-black text-slate-900">{stats?.tugasan_selesai || 0}</h4>
          </div>
        </motion.div>
      </div>

      <div className="flex flex-col gap-6">
        <motion.div variants={itemVariants} className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 md:p-8 overflow-hidden">
          <h4 className="text-lg font-black text-slate-900 mb-6">Senarai Arahan Kerja Semasa</h4>
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center p-10"><Loader2 className="w-8 h-8 animate-spin text-teal-600" /></div>
            ) : tugasanList.length === 0 ? (
              <div className="bg-slate-50 p-6 rounded-2xl text-center text-slate-400 font-medium border border-slate-100">Tiada arahan kerja pada masa ini.</div>
            ) : (
              tugasanList.map(t => (
                <div key={t.id_arahan} className="border border-slate-100 bg-slate-50 p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-teal-200 transition-colors">
                  <div>
                    <span className={`px-2 py-1 text-[10px] font-black rounded uppercase ${
                      t.status_kerja === 'Selesai' ? 'bg-emerald-100 text-emerald-700' :
                      t.status_kerja === 'Dalam Proses' ? 'bg-amber-100 text-amber-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {t.status_kerja}
                    </span>
                    <h5 className="font-bold text-slate-800 mt-2">{t.aduan?.jenis_kerosakan || 'Kerja Pembaikan'}</h5>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {t.aduan?.alamat_lokasi || 'Lokasi tidak dinyatakan'}
                    </p>
                  </div>
                  <Link to="/pembaikan" className="bg-slate-900 hover:bg-teal-600 text-center text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-all w-full sm:w-auto">
                    Kemas Kini / Bukti
                  </Link>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Info Geo-Fencing BANDA+ */}
        <motion.div variants={itemVariants} className="bg-slate-900 rounded-3xl shadow-lg p-8 text-white">
          <div className="flex items-center gap-3 mb-6 text-amber-400">
            <MapPin className="w-6 h-6" />
            <h4 className="text-lg font-black">Validasi Geo-Fencing</h4>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed mb-6">
            Peringatan: Sistem BANDA+ menguatkuasakan validasi <span className="text-white font-bold">GPS 50 meter</span>. 
          </p>
          <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 flex items-start gap-3">
            <Camera className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-300 font-medium leading-relaxed">
              Gambar bukti "Selepas Pembaikan" mesti diambil di tapak lokasi aduan sebenar. Sistem akan menolak muat naik jika anda berada di luar radius geo-fencing.
            </p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default KontraktorDashboard;