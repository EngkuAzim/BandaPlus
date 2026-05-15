import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ClipboardList, CheckCircle2, Loader2, ArrowLeft, 
  MapPin, Clock, Save, Image as ImageIcon, Volume2, Send, CheckSquare
} from 'lucide-react';
import { toast } from 'sonner';
import Sidebar from './Sidebar';

function LaporanTugasan() {
  const [userData, setUserData] = useState(null);
  const [tugasanList, setTugasanList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);

  // Komentar Pegawai
  const [komen, setKomen] = useState('');
  const [isSendingKomen, setIsSendingKomen] = useState(false);

  // Pengesahan State
  const [sahkanData, setSahkanData] = useState({
    lawatan_tapak: false,
    spesifikasi: false,
    catatan: ''
  });
  const [isSahkan, setIsSahkan] = useState(false);

  useEffect(() => {
    fetchData(true);
    const interval = setInterval(() => fetchData(false), 2000); // 2 saat untuk live-chat feeling
    return () => clearInterval(interval);
  }, []);

  const fetchData = async (isInitial = true) => {
    try {
      const token = localStorage.getItem('token');
      
      if (isInitial) {
        setIsLoading(true);
        // Fetch user data ONLY on initial load to prevent server choking
        const userRes = await axios.get(`${import.meta.env.VITE_API_URL}/user`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUserData(userRes.data);
      }

      // Fetch arahan kerja
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/pegawai/arahan-kerja?t=${Date.now()}`, {
        headers: { Authorization: `Bearer ${token}`, 'Cache-Control': 'no-cache' }
      });
      setTugasanList(res.data);
      
      setSelectedTask(prev => {
        if (prev) return res.data.find(t => t.id_arahan === prev.id_arahan) || prev;
        return prev;
      });
    } catch (error) {
      console.error('Gagal memuat turun data laporan.', error);
    } finally {
      if (isInitial) setIsLoading(false);
    }
  };

  const handleOpenTask = (task) => {
    setSelectedTask(task);
    setKomen('');
    setSahkanData({ lawatan_tapak: false, spesifikasi: false, catatan: '' });
  };

  const hantarKomen = async () => {
    if (!komen.trim()) return;
    setIsSendingKomen(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${import.meta.env.VITE_API_URL}/pegawai/arahan-kerja/${selectedTask.id_arahan}/log`,
        { nota: komen },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Maklum balas ditambah!');
      setKomen('');
      fetchData();
    } catch (error) {
      toast.error('Gagal menghantar komen.');
    } finally {
      setIsSendingKomen(false);
    }
  };

  const hantarPengesahan = async (e) => {
    e.preventDefault();
    if (!sahkanData.lawatan_tapak && !sahkanData.spesifikasi) {
      toast.error('Sila tanda sekurang-kurangnya satu kaedah semakan.');
      return;
    }
    setIsSahkan(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${import.meta.env.VITE_API_URL}/pegawai/arahan-kerja/${selectedTask.id_arahan}/sahkan`,
        sahkanData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Kerja berjaya disahkan dan aduan ditutup sepenuhnya!');
      fetchData();
    } catch (error) {
      toast.error('Gagal mengesahkan laporan.');
    } finally {
      setIsSahkan(false);
    }
  };

  return (
    <div className="flex h-[100dvh] bg-slate-50 font-sans overflow-hidden">
      <Sidebar userData={userData} />
      <div className="flex-1 flex flex-col relative overflow-hidden bg-slate-50 md:rounded-l-3xl shadow-2xl p-6">
        <div className="max-w-6xl w-full mx-auto flex flex-col md:flex-row h-full bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden relative">
          
          {/* LIST VIEW */}
        <div className={`flex flex-col h-full ${selectedTask ? 'hidden md:flex md:w-1/3 border-r border-slate-200 shrink-0' : 'w-full'}`}>
          <header className="p-6 border-b border-slate-100 bg-slate-50 flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center">
              <ClipboardList className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800">Laporan Tugasan</h2>
              <p className="text-xs font-bold text-slate-500">Pantau & sahkan kerja kontraktor</p>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-4 space-y-3">
            {isLoading ? (
              <div className="flex justify-center p-10"><Loader2 className="w-8 h-8 animate-spin text-teal-600" /></div>
            ) : tugasanList.length === 0 ? (
              <p className="text-center text-sm font-bold text-slate-400 p-10">Tiada laporan tugasan wujud lagi.</p>
            ) : (
              tugasanList.map(task => (
                <div 
                  key={task.id_arahan} 
                  onClick={() => handleOpenTask(task)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${selectedTask?.id_arahan === task.id_arahan ? 'border-amber-500 bg-amber-50 shadow-sm ring-2 ring-amber-100' : 'border-slate-200 bg-white hover:border-amber-300'}`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-black text-slate-400">#{task.id_arahan}</span>
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${
                      task.status_kerja === 'Selesai' ? 'bg-blue-100 text-blue-700' :
                      task.status_kerja === 'Disahkan' ? 'bg-emerald-100 text-emerald-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {task.status_kerja}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm mb-1 line-clamp-1">{task.aduan?.jenis_kerosakan}</h4>
                  <p className="text-xs text-slate-500 font-medium">Oleh: {task.kontraktor?.name}</p>
                </div>
              ))
            )}
          </main>
        </div>

        {/* DETAILS VIEW */}
        <AnimatePresence>
          {selectedTask && (
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              className="absolute inset-0 md:static md:flex-1 bg-slate-50 flex flex-col z-20"
            >
              <header className="p-4 bg-white border-b border-slate-200 flex items-center justify-between sticky top-0 z-10">
                <button onClick={() => setSelectedTask(null)} className="md:hidden p-2 rounded-xl bg-slate-100 text-slate-600">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="font-black text-slate-800">Perincian #{selectedTask.id_arahan}</div>
                <div className="md:hidden w-9" />
              </header>

              <main className="flex-1 overflow-y-auto">
                <div className="p-6 max-w-3xl mx-auto space-y-8">
                  
                  {/* Photo Comparison Before / After */}
                  <div>
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><ImageIcon className="w-4 h-4" /> Perbandingan Visual</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {/* Sebelum */}
                      <div className="bg-white p-2 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-4 left-4 z-10 bg-rose-500 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-md">Sebelum (Aduan)</div>
                        {selectedTask.aduan?.gambar_bukti ? (
                          <img src={`${import.meta.env.VITE_API_URL.replace('/api', '')}/storage/${selectedTask.aduan.gambar_bukti}`} className="w-full h-48 object-cover rounded-2xl" />
                        ) : (
                          <div className="w-full h-48 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 text-xs font-bold">Tiada Gambar</div>
                        )}
                      </div>

                      {/* Selepas */}
                      <div className="bg-white p-2 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
                        <div className="absolute top-4 right-4 z-10 bg-emerald-500 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-md">Selepas (Pembaikan)</div>
                        {selectedTask.gambar_selepas ? (
                          <img src={`${import.meta.env.VITE_API_URL.replace('/api', '')}/storage/${selectedTask.gambar_selepas}`} className="w-full h-48 object-cover rounded-2xl" />
                        ) : (
                          <div className="w-full h-48 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 text-xs font-bold text-center px-4 border border-dashed border-slate-300">
                            Menunggu muat naik kontraktor
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Timeline & Komen */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2"><Clock className="w-4 h-4" /> Log & Tindakan</h3>
                    
                    <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:h-full before:w-[2px] before:bg-slate-100">
                      {(!selectedTask.log_kemajuan || selectedTask.log_kemajuan.length === 0) ? (
                        <p className="text-center text-xs font-bold text-slate-400">Tiada rekod setakat ini.</p>
                      ) : (
                        selectedTask.log_kemajuan.map((log, idx) => (
                          <div key={idx} className="relative flex items-start">
                            <div className={`w-10 h-10 rounded-full border-4 border-white flex items-center justify-center shrink-0 z-10 shadow-sm mt-0.5 ${log.role === 'pegawai' ? 'bg-amber-100 text-amber-600' : 'bg-teal-50 text-teal-600'}`}>
                              {log.role === 'pegawai' ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                            </div>
                            <div className={`p-4 rounded-3xl border ml-3 flex-1 shadow-sm ${log.role === 'pegawai' ? 'bg-amber-50/50 border-amber-200' : 'bg-slate-50 border-slate-200'}`}>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                                {new Date(log.tarikh).toLocaleString('ms-MY', { dateStyle: 'medium', timeStyle: 'short' })}
                                {log.role === 'pegawai' && <span className="ml-2 text-amber-600">PEGAWAI</span>}
                              </p>
                              <p className="text-sm font-medium text-slate-800 leading-relaxed mb-2">{log.nota}</p>
                              {log.audio && (
                                <div className="mt-3 p-2 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 shrink-0"><Volume2 className="w-4 h-4" /></div>
                                  <audio controls src={`${import.meta.env.VITE_API_URL.replace('/api', '')}/storage/${log.audio}`} className="w-full h-8 outline-none" />
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Reply Form */}
                    {selectedTask.status_kerja !== 'Disahkan' && (
                      <div className="mt-6 flex items-end gap-2 bg-slate-50 p-2 rounded-3xl border border-slate-200 focus-within:border-amber-400 transition-colors">
                        <textarea 
                          rows="1"
                          value={komen}
                          onChange={(e) => setKomen(e.target.value)}
                          placeholder="Beri komen atau maklum balas..."
                          className="flex-1 bg-transparent border-none outline-none resize-none p-3 text-sm font-medium text-slate-800"
                        />
                        <button 
                          onClick={hantarKomen}
                          disabled={!komen.trim() || isSendingKomen}
                          className="p-3.5 rounded-2xl bg-slate-900 text-white disabled:opacity-50 hover:bg-amber-600 transition-all"
                        >
                          {isSendingKomen ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-0.5" />}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Validation Form */}
                  {selectedTask.status_kerja === 'Selesai' && (
                    <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-200">
                      <h3 className="text-lg font-black text-emerald-800 mb-4 flex items-center gap-2"><CheckSquare className="w-5 h-5" /> Pengesahan Akhir Pegawai</h3>
                      <p className="text-sm font-medium text-emerald-700 mb-6">Kontraktor telah menanda kerja ini sebagai selesai. Sila sahkan kerja sebelum menutup kes ini secara rasmi.</p>
                      
                      <form onSubmit={hantarPengesahan} className="space-y-4">
                        <label className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-emerald-100 cursor-pointer hover:bg-emerald-50/50 transition-colors">
                          <input type="checkbox" className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500" 
                            checked={sahkanData.lawatan_tapak} onChange={(e) => setSahkanData({...sahkanData, lawatan_tapak: e.target.checked})} />
                          <span className="font-bold text-slate-700">Lawatan Tapak (Site Visit) telah dilakukan</span>
                        </label>

                        <label className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-emerald-100 cursor-pointer hover:bg-emerald-50/50 transition-colors">
                          <input type="checkbox" className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500" 
                            checked={sahkanData.spesifikasi} onChange={(e) => setSahkanData({...sahkanData, spesifikasi: e.target.checked})} />
                          <span className="font-bold text-slate-700">Gambar/Kerja menepati spesifikasi piawai</span>
                        </label>

                        <textarea 
                          placeholder="Catatan pengesahan (pilihan)..." 
                          className="w-full p-4 rounded-2xl border border-emerald-200 bg-white focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-medium"
                          rows="2"
                          value={sahkanData.catatan} onChange={(e) => setSahkanData({...sahkanData, catatan: e.target.value})}
                        />

                        <button 
                          type="submit" disabled={isSahkan}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 transition-all disabled:opacity-50"
                        >
                          {isSahkan ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />} Sahkan Kerja & Tutup Kes
                        </button>
                      </form>
                    </div>
                  )}

                  {selectedTask.status_kerja === 'Disahkan' && (
                    <div className="bg-slate-100 p-6 rounded-3xl border border-slate-200 text-center">
                      <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                      <h3 className="text-lg font-black text-slate-800">Kerja Telah Disahkan</h3>
                      <p className="text-sm font-bold text-slate-500 mt-1">Aduan ini ditutup secara rasmi.</p>
                    </div>
                  )}

                </div>
              </main>
            </motion.div>
          )}
        </AnimatePresence>

        {/* PLACEHOLDER WHEN NO TASK SELECTED (Desktop) */}
        {!selectedTask && (
          <div className="hidden md:flex flex-1 flex-col items-center justify-center p-10 bg-slate-50 text-center">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-sm mb-6 border border-slate-200">
              <ClipboardList className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-2">Pilih Laporan Tugasan</h3>
            <p className="text-sm font-medium text-slate-500 max-w-xs leading-relaxed">
              Sila pilih mana-mana laporan kerja dari senarai di sebelah kiri untuk melihat maklumat terperinci, gambar bukti, dan pengesahan.
            </p>
          </div>
        )}

        </div>
      </div>
    </div>
  );
}

export default LaporanTugasan;
