import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Clock, CheckCircle2, AlertCircle, XCircle, MapPin, Calendar, Activity } from 'lucide-react';
import Sidebar from './Sidebar';

function StatusAduan() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [aduans, setAduans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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
        navigate('/login');
      }
    };
    fetchData();
  }, [navigate]);

  // Helper to map status to colors and icons
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Baru':
        return { color: 'bg-teal-50 text-teal-700 border-teal-200', icon: <AlertCircle className="w-4 h-4" /> };
      case 'Dalam Tindakan':
        return { color: 'bg-amber-50 text-amber-700 border-amber-200', icon: <Activity className="w-4 h-4" /> };
      case 'Selesai':
        return { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: <CheckCircle2 className="w-4 h-4" /> };
      case 'Ditolak':
        return { color: 'bg-rose-50 text-rose-700 border-rose-200', icon: <XCircle className="w-4 h-4" /> };
      default:
        return { color: 'bg-slate-50 text-slate-700 border-slate-200', icon: <Clock className="w-4 h-4" /> };
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      <Sidebar userData={userData} />

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <header className="flex items-center justify-between px-8 py-5 bg-white border-b border-slate-200 sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Status Aduan</h2>
            <p className="text-sm text-slate-500 font-medium mt-1">Jejak sejarah dan status laporan anda</p>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto p-8">
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
                    // Format date neatly
                    const dateObj = new Date(aduan.tarikh_lapor);
                    const formattedDate = dateObj.toLocaleDateString('ms-MY', { day: 'numeric', month: 'long', year: 'numeric' });

                    return (
                      <motion.div key={aduan.id_aduan} variants={itemVariants} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col md:flex-row">
                        
                        {/* Image Thumbnail */}
                        <div className="w-full md:w-48 h-48 md:h-auto bg-slate-100 flex-shrink-0">
                          <img 
                            src={`http://localhost:8000/storage/${aduan.gambar_bukti}`} 
                            alt={aduan.jenis_kerosakan} 
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Details */}
                        <div className="p-6 flex-1 flex flex-col justify-center">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{aduan.id_aduan}</p>
                              <h4 className="text-xl font-black text-slate-900">{aduan.jenis_kerosakan}</h4>
                            </div>
                            <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border shadow-sm ${badge.color}`}>
                              {badge.icon} {aduan.status}
                            </span>
                          </div>

                          <div className="space-y-2 mb-4">
                            <p className="flex items-start gap-2 text-sm text-slate-600">
                              <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                              <span className="line-clamp-2">{aduan.alamat_lokasi}</span>
                            </p>
                            <p className="flex items-center gap-2 text-sm text-slate-600">
                              <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                              {formattedDate}
                            </p>
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
      </div>
    </div>
  );
}

export default StatusAduan;