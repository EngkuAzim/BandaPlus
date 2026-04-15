import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle2, AlertCircle, XCircle, MapPin, Calendar, Activity, ChevronRight, X, MessageSquare, FileText } from 'lucide-react';
import Sidebar from './Sidebar';

function StatusAduan() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [aduans, setAduans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // NEW: State to control the popup modal
  const [selectedAduan, setSelectedAduan] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const [userRes, aduanRes] = await Promise.all([
          axios.get('http://localhost:8000/api/user', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:8000/api/aduan', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setUserData(userRes.data);
        setAduans(aduanRes.data);
        setIsLoading(false);
      } catch (error) {
        console.error("API Error:", error);
        // Only navigate to login if it's an actual 401 Unauthorized error
        if (error.response && error.response.status === 401) {
          navigate('/login');
        } else {
          setIsLoading(false); // Stop loading so user sees an empty list instead of crashing
        }
      }
    };
    fetchData();
  }, [navigate]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Baru': return { color: 'bg-teal-50 text-teal-700 border-teal-200', icon: <AlertCircle className="w-4 h-4" /> };
      case 'Dalam Tindakan': return { color: 'bg-amber-50 text-amber-700 border-amber-200', icon: <Activity className="w-4 h-4" /> };
      case 'Selesai': return { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: <CheckCircle2 className="w-4 h-4" /> };
      case 'Ditolak': return { color: 'bg-rose-50 text-rose-700 border-rose-200', icon: <XCircle className="w-4 h-4" /> };
      default: return { color: 'bg-slate-50 text-slate-700 border-slate-200', icon: <Clock className="w-4 h-4" /> };
    }
  };

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      <Sidebar userData={userData} />

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <header className="flex items-center justify-between px-8 py-5 bg-white border-b border-slate-200 sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Sejarah Aduan</h2>
            <p className="text-sm text-slate-500 font-medium mt-1">Klik pada kad aduan untuk melihat status terperinci</p>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto p-8 relative">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
            </div>
          ) : (
            <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-5xl mx-auto">
              
              {aduans.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm flex flex-col items-center justify-center">
                  <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                    <Clock className="w-10 h-10 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-2">Tiada Rekod Aduan</h3>
                  <p className="text-slate-500 mb-6">Anda belum membuat sebarang laporan kerosakan infrastruktur.</p>
                  <button onClick={() => navigate('/lapor-aduan')} className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-6 rounded-xl transition-all">
                    Mula Lapor Aduan
                  </button>
                </div>
              ) : (
                <div className="grid gap-6">
                  {aduans.map((aduan) => {
                    const badge = getStatusBadge(aduan.status);
                    const formattedDate = new Date(aduan.tarikh_lapor).toLocaleDateString('ms-MY', { day: 'numeric', month: 'long', year: 'numeric' });

                    return (
                      <motion.div 
                        key={aduan.id_aduan} variants={itemVariants} 
                        onClick={() => setSelectedAduan(aduan)} // <-- MAKES CARD CLICKABLE
                        className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-teal-300 transition-all overflow-hidden flex flex-col md:flex-row cursor-pointer group"
                      >
                        <div className="w-full md:w-48 h-48 md:h-auto bg-slate-100 flex-shrink-0 relative overflow-hidden">
                          <img src={`http://localhost:8000/storage/${aduan.gambar_bukti}`} alt={aduan.jenis_kerosakan} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        </div>

                        <div className="p-6 flex-1 flex flex-col justify-center relative">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{aduan.id_aduan}</p>
                              <h4 className="text-xl font-black text-slate-900 group-hover:text-teal-700 transition-colors">{aduan.jenis_kerosakan}</h4>
                            </div>
                            <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border shadow-sm ${badge.color}`}>
                              {badge.icon} {aduan.status}
                            </span>
                          </div>

                          <div className="space-y-2 mb-4 pr-8">
                            <p className="flex items-start gap-2 text-sm text-slate-600">
                              <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                              <span className="line-clamp-2">{aduan.alamat_lokasi}</span>
                            </p>
                            <p className="flex items-center gap-2 text-sm text-slate-600">
                              <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                              {formattedDate}
                            </p>
                          </div>

                          <div className="absolute right-6 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-teal-50 group-hover:text-teal-600 transition-colors">
                            <ChevronRight className="w-5 h-5" />
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}
        </main>

        {/* MODAL PENJEJAKAN ADUAN (TRACKING OVERLAY) */}
        <AnimatePresence>
          {selectedAduan && (
            <div className="absolute inset-0 z-50 flex items-center justify-center p-4 sm:p-8">
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setSelectedAduan(null)} 
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              />
              
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
              >
                {/* Modal Header */}
                <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
                  <div>
                    <h3 className="text-lg font-black text-slate-900">Maklumat & Jejak Aduan</h3>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{selectedAduan.id_aduan}</p>
                  </div>
                  <button onClick={() => setSelectedAduan(null)} className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="p-8 overflow-y-auto">
                  <div className="flex flex-col sm:flex-row gap-8 mb-8">
                    <div className="w-full sm:w-1/3 aspect-square rounded-2xl overflow-hidden border border-slate-200 shrink-0">
                      <img src={`http://localhost:8000/storage/${selectedAduan.gambar_bukti}`} className="w-full h-full object-cover" alt="Bukti Kerosakan" />
                    </div>
                    <div className="flex-1 space-y-4">
                      <div>
                        <h4 className="text-2xl font-black text-slate-900 mb-2">{selectedAduan.jenis_kerosakan}</h4>
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border ${getStatusBadge(selectedAduan.status).color}`}>
                          {getStatusBadge(selectedAduan.status).icon} {selectedAduan.status}
                        </div>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <p className="text-sm text-slate-600 flex items-start gap-2 mb-3">
                          <MapPin className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                          {selectedAduan.alamat_lokasi}
                        </p>
                        <p className="text-sm text-slate-600 flex items-start gap-2">
                          <FileText className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                          {selectedAduan.keterangan_aduan || "Tiada keterangan lanjut diberikan semasa laporan dibuat."}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* TIMELINE SECTION (Dinamik mengikut status) */}
                  <div className="border-t border-slate-100 pt-8">
                    <h4 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                      <Activity className="w-5 h-5 text-teal-600" /> Status Terkini
                    </h4>
                    
                    {/* MAKLUM BALAS RASMI (Dynamic Data Fetching) */}
                    <div className={`p-5 border rounded-2xl flex gap-4 ${selectedAduan.maklum_balas ? 'bg-teal-50 border-teal-100' : 'bg-slate-50 border-slate-200'}`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm border ${selectedAduan.maklum_balas ? 'bg-white border-teal-200 text-teal-600' : 'bg-white border-slate-200 text-slate-400'}`}>
                        <MessageSquare className="w-5 h-5" />
                      </div>
                      <div>
                        <h5 className="text-sm font-bold text-slate-900 mb-1">Maklum Balas Pegawai / Kontraktor</h5>
                        <p className={`text-sm leading-relaxed ${selectedAduan.maklum_balas ? 'text-teal-800' : 'text-slate-500 italic'}`}>
                          {selectedAduan.maklum_balas 
                            ? selectedAduan.maklum_balas 
                            : "Tiada sebarang kemaskini buat masa ini. Sistem sedang menunggu maklum balas dan tindakan daripada pihak bertanggungjawab. Terima kasih atas masa dan kerjasama anda."}
                        </p>
                      </div>
                    </div>

                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}

export default StatusAduan;