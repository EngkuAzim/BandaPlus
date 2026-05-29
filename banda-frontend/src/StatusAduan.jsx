import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle2, AlertCircle, XCircle, MapPin, Calendar, Activity, ChevronRight, X, MessageSquare, FileText, Package } from 'lucide-react';
import { toast } from 'sonner';
import Sidebar from './Sidebar';

function StatusAduan() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [aduans, setAduans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedAduan, setSelectedAduan] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchData = async (isInitial = true) => {
      try {
        if (isInitial) setIsLoading(true);
        const [userRes, aduanRes] = await Promise.all([
          axios.get(`/api/user`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`/api/aduan`, { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setUserData(userRes.data);
        setAduans(aduanRes.data);
        setSelectedAduan(prev => {
          if (prev) return aduanRes.data.find(a => a.id_aduan === prev.id_aduan) || prev;
          return prev;
        });
      } catch (error) {
        if (error.response && error.response.status === 401) {
          navigate('/login');
        }
      } finally {
        if (isInitial) setIsLoading(false);
      }
    };
    fetchData(true);
  }, [navigate]);

  useEffect(() => {
    if (aduans.length > 0) {
      import('./echo').then(({ default: echo }) => {
        aduans.forEach(aduan => {
          echo.channel(`aduan.${aduan.id_aduan}`)
            .listen('.StatusBerubah', (e) => {
              toast.info(`Status aduan ${e.aduanId} dikemaskini: ${e.status}`);
              const token = localStorage.getItem('token');
              axios.get(`/api/aduan`, { headers: { Authorization: `Bearer ${token}` } })
                .then(res => {
                  setAduans(res.data);
                  setSelectedAduan(prev => prev ? res.data.find(a => a.id_aduan === prev.id_aduan) : null);
                });
            });
        });
      });
    }

    return () => {
      import('./echo').then(({ default: echo }) => {
        aduans.forEach(aduan => echo.leave(`aduan.${aduan.id_aduan}`));
      });
    };
  }, [aduans]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Baru': return { color: 'bg-teal-50 text-teal-700 border-teal-200', icon: <AlertCircle className="w-4 h-4" /> };
      case 'Dalam Tindakan': return { color: 'bg-amber-50 text-amber-700 border-amber-200', icon: <Activity className="w-4 h-4" /> };
      case 'Selesai': return { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: <CheckCircle2 className="w-4 h-4" /> };
      case 'Ditolak': return { color: 'bg-rose-50 text-rose-700 border-rose-200', icon: <XCircle className="w-4 h-4" /> };
      default: return { color: 'bg-slate-50 text-slate-700 border-slate-200', icon: <Clock className="w-4 h-4" /> };
    }
  };

  // Helper for tracking timeline
  const getTimelineSteps = (currentStatus) => {
    if (currentStatus === 'Ditolak') {
        return [
            { id: 1, title: 'Laporan Diterima', active: true, completed: true },
            { id: 2, title: 'Laporan Ditolak', active: true, completed: true, isRejected: true },
        ];
    }
    
    return [
        { id: 1, title: 'Laporan Diterima', active: true, completed: true },
        { 
            id: 2, 
            title: 'Dalam Semakan / Tindakan Diambil', 
            active: ['Dalam Tindakan', 'Selesai'].includes(currentStatus),
            completed: ['Dalam Tindakan', 'Selesai'].includes(currentStatus) 
        },
        { 
            id: 3, 
            title: 'Kerja Pembaikan Selesai', 
            active: currentStatus === 'Selesai',
            completed: currentStatus === 'Selesai'
        }
    ];
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
            <p className="text-sm text-slate-500 font-medium mt-1">Jejak status laporan anda seperti bungkusan kurier</p>
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
                        onClick={() => setSelectedAduan(aduan)}
                        className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-teal-300 transition-all overflow-hidden flex flex-col md:flex-row cursor-pointer group"
                      >
                        <div className="w-full md:w-56 h-48 md:h-auto bg-slate-100 flex-shrink-0 relative overflow-hidden">
                          <img src={`/storage/${aduan.gambar_bukti}`} alt={aduan.jenis_kerosakan} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                          <div className="absolute top-3 left-3 bg-slate-900/70 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm">
                            Zon {aduan.id_zon}
                          </div>
                        </div>

                        <div className="p-6 flex-1 flex flex-col justify-center relative">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">ID: {aduan.id_aduan}</p>
                              <h4 className="text-xl font-black text-slate-900 group-hover:text-teal-700 transition-colors">{aduan.jenis_kerosakan}</h4>
                            </div>
                            <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border shadow-sm ${badge.color}`}>
                              {badge.icon} {aduan.status}
                            </span>
                          </div>

                          <div className="space-y-2 mb-4 pr-12">
                            <p className="flex items-start gap-2 text-sm text-slate-600">
                              <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                              <span className="line-clamp-2">{aduan.alamat_lokasi}</span>
                            </p>
                            <p className="flex items-center gap-2 text-sm text-slate-600">
                              <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                              {formattedDate}
                            </p>
                          </div>

                          <div className="absolute right-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-teal-50 group-hover:text-teal-600 transition-colors shadow-sm border border-slate-100 group-hover:border-teal-100">
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
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              />
              
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
              >
                {/* Modal Header */}
                <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
                        <Package className="w-5 h-5 text-teal-700" />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-slate-900">Penjejakan Aduan</h3>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{selectedAduan.id_aduan}</p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedAduan(null)} className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all shadow-sm">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="p-8 overflow-y-auto bg-white flex-1 flex flex-col md:flex-row gap-10">
                  
                  {/* Left Column: Details */}
                  <div className="w-full md:w-1/2 flex flex-col gap-6">
                    <div className="w-full aspect-video rounded-2xl overflow-hidden border border-slate-200 shadow-sm shrink-0 relative">
                      <img src={`/storage/${selectedAduan.gambar_bukti}`} className="w-full h-full object-cover" alt="Bukti Kerosakan" />
                    </div>
                    
                    <div>
                        <h4 className="text-2xl font-black text-slate-900 mb-2">{selectedAduan.jenis_kerosakan}</h4>
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border shadow-sm ${getStatusBadge(selectedAduan.status).color}`}>
                          {getStatusBadge(selectedAduan.status).icon} Status: {selectedAduan.status}
                        </div>
                    </div>

                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-4 shadow-inner">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Lokasi Kejadian</p>
                            <p className="text-sm font-medium text-slate-700 flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                            {selectedAduan.alamat_lokasi}
                            </p>
                        </div>
                        {selectedAduan.keterangan_aduan && (
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Keterangan</p>
                                <p className="text-sm text-slate-600 italic">"{selectedAduan.keterangan_aduan}"</p>
                            </div>
                        )}
                    </div>
                  </div>

                  {/* Right Column: SHOPEE-STYLE TIMELINE */}
                  <div className="w-full md:w-1/2 bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
                    <h4 className="text-lg font-black text-slate-900 mb-8 flex items-center gap-2">
                      <Activity className="w-5 h-5 text-teal-600" /> Jejak Status
                    </h4>
                    
                    <div className="relative pl-4 space-y-10">
                        {/* The connecting vertical line */}
                        <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-slate-200 rounded-full"></div>

                        {getTimelineSteps(selectedAduan.status).map((step, index) => (
                            <div key={step.id} className="relative flex items-start gap-6 group">
                                {/* The Circle */}
                                <div className={`relative z-10 w-5 h-5 rounded-full flex items-center justify-center border-[3px] ring-4 ring-slate-50 transition-colors ${
                                    step.isRejected ? 'bg-white border-rose-500' :
                                    step.active && step.completed ? 'bg-teal-500 border-teal-500' : 
                                    step.active ? 'bg-white border-teal-500' : 'bg-slate-200 border-slate-200'
                                }`}>
                                    {step.completed && !step.isRejected && <CheckCircle2 className="w-3 h-3 text-white" />}
                                    {step.isRejected && <XCircle className="w-4 h-4 text-rose-500" />}
                                </div>
                                
                                {/* The Content */}
                                <div className="flex-1 -mt-1">
                                    <h5 className={`font-bold text-base transition-colors ${
                                        step.isRejected ? 'text-rose-600' :
                                        step.active ? 'text-slate-900' : 'text-slate-400'
                                    }`}>
                                        {step.title}
                                    </h5>
                                    
                                    {/* Add detail texts for specific steps */}
                                    {step.id === 1 && (
                                        <p className="text-xs text-slate-500 mt-1">
                                            {new Date(selectedAduan.tarikh_lapor).toLocaleString('ms-MY', { dateStyle: 'medium', timeStyle: 'short' })}
                                        </p>
                                    )}
                                    {step.id === 2 && step.active && (
                                        <p className="text-xs text-slate-500 mt-1">Menunggu pengesahan dan tindakan kontraktor.</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* MAKLUM BALAS RASMI (Dynamic Data Fetching) */}
                    <div className={`mt-10 p-5 rounded-2xl flex flex-col gap-3 shadow-sm border ${selectedAduan.maklum_balas ? 'bg-white border-teal-100' : 'bg-slate-100 border-slate-200/60'}`}>
                      <div className="flex items-center gap-2">
                        <MessageSquare className={`w-4 h-4 ${selectedAduan.maklum_balas ? 'text-teal-600' : 'text-slate-400'}`} />
                        <h5 className="text-sm font-black text-slate-900">Maklum Balas Terkini</h5>
                      </div>
                      <p className={`text-sm leading-relaxed ${selectedAduan.maklum_balas ? 'text-slate-700' : 'text-slate-500 italic'}`}>
                        {selectedAduan.maklum_balas 
                          ? `"${selectedAduan.maklum_balas}"` 
                          : "Tiada sebarang maklum balas daripada pihak MP/Kontraktor buat masa ini."}
                      </p>
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