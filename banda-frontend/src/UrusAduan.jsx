import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle2, AlertCircle, XCircle, Search, Filter, X, Save, Loader2, Activity } from 'lucide-react';
import { toast } from 'sonner';
import Sidebar from './Sidebar';

function UrusAduan() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [aduans, setAduans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAduan, setSelectedAduan] = useState(null);
  
  // State untuk form kemaskini
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState({ status: '', maklum_balas: '' });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }

    const fetchData = async () => {
      try {
        const userRes = await axios.get('http://localhost:8000/api/user', { headers: { Authorization: `Bearer ${token}` } });
        setUserData(userRes.data);

        // Jika bukan pentadbir, tendang balik ke dashboard
        if (userRes.data.peranan !== 'pentadbir') {
          navigate('/dashboard');
          return;
        }

        const aduanRes = await axios.get('http://localhost:8000/api/admin/aduan', { headers: { Authorization: `Bearer ${token}` } });
        setAduans(aduanRes.data);
        setIsLoading(false);
      } catch (error) {
        navigate('/login');
      }
    };
    fetchData();
  }, [navigate]);

  const handleOpenModal = (aduan) => {
    setSelectedAduan(aduan);
    setEditForm({
      status: aduan.status,
      maklum_balas: aduan.maklum_balas || ''
    });
  };

  const handleSaveUpdate = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(`http://localhost:8000/api/admin/aduan/${selectedAduan.id_aduan}`, editForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Kemaskini senarai UI tanpa perlu refresh page
      setAduans(aduans.map(a => a.id_aduan === selectedAduan.id_aduan ? res.data.aduan : a));
      toast.success('Berjaya!', { description: 'Status dan maklum balas telah dikemaskini.' });
      setSelectedAduan(null);
    } catch (error) {
      toast.error('Ralat', { description: 'Gagal mengemaskini aduan.' });
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Baru': return 'bg-teal-100 text-teal-800';
      case 'Dalam Tindakan': return 'bg-amber-100 text-amber-800';
      case 'Selesai': return 'bg-emerald-100 text-emerald-800';
      case 'Ditolak': return 'bg-rose-100 text-rose-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      <Sidebar userData={userData} />

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <header className="flex items-center justify-between px-8 py-5 bg-white border-b border-slate-200 sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Pengurusan Aduan</h2>
            <p className="text-sm text-slate-500 font-medium mt-1">Pantau dan urus laporan kerosakan komuniti</p>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto p-8">
          {isLoading ? (
            <div className="flex items-center justify-center h-full"><Loader2 className="w-10 h-10 animate-spin text-teal-600" /></div>
          ) : (
            <div className="max-w-7xl mx-auto">
              
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        <th className="p-5">ID Aduan</th>
                        <th className="p-5">Pengadu</th>
                        <th className="p-5">Kategori</th>
                        <th className="p-5">Tarikh Lapor</th>
                        <th className="p-5">Status</th>
                        <th className="p-5 text-right">Tindakan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {aduans.map(aduan => (
                        <tr key={aduan.id_aduan} className="hover:bg-slate-50 transition-colors group">
                          <td className="p-5 font-mono text-sm font-bold text-teal-700">{aduan.id_aduan}</td>
                          <td className="p-5">
                            <p className="font-bold text-slate-900">{aduan.pengguna?.name}</p>
                            <p className="text-xs text-slate-500">{aduan.pengguna?.no_telefon || 'Tiada No Tel'}</p>
                          </td>
                          <td className="p-5 font-medium text-slate-700">{aduan.jenis_kerosakan}</td>
                          <td className="p-5 text-sm text-slate-500">{new Date(aduan.tarikh_lapor).toLocaleDateString('ms-MY')}</td>
                          <td className="p-5">
                            <span className={`px-3 py-1 rounded-lg text-xs font-bold ${getStatusColor(aduan.status)}`}>
                              {aduan.status}
                            </span>
                          </td>
                          <td className="p-5 text-right">
                            <button onClick={() => handleOpenModal(aduan)} className="text-sm font-bold text-teal-600 hover:text-teal-800 bg-teal-50 px-4 py-2 rounded-lg transition-colors">
                              Urus
                            </button>
                          </td>
                        </tr>
                      ))}
                      {aduans.length === 0 && (
                        <tr><td colSpan="6" className="p-10 text-center text-slate-500">Tiada rekod aduan buat masa ini.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}
        </main>

        {/* MODAL URUS ADUAN (ADMIN OVERLAY) */}
        <AnimatePresence>
          {selectedAduan && (
            <div className="absolute inset-0 z-50 flex items-center justify-center p-4 sm:p-8">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedAduan(null)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
              
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                
                <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
                  <h3 className="text-lg font-black text-slate-900">Urus Aduan: {selectedAduan.id_aduan}</h3>
                  <button onClick={() => setSelectedAduan(null)} className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-200"><X className="w-5 h-5" /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 flex flex-col md:flex-row gap-8">
                  {/* Info Panel */}
                  <div className="w-full md:w-1/2 space-y-6">
                    <div className="aspect-video rounded-2xl overflow-hidden border border-slate-200">
                      <img src={`http://localhost:8000/storage/${selectedAduan.gambar_bukti}`} className="w-full h-full object-cover" alt="Kerosakan" />
                    </div>
                    <div>
                      <h5 className="font-bold text-slate-900 mb-1">Lokasi Kerosakan</h5>
                      <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">{selectedAduan.alamat_lokasi}</p>
                    </div>
                    <div>
                      <h5 className="font-bold text-slate-900 mb-1">Keterangan Pengadu</h5>
                      <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">{selectedAduan.keterangan_aduan || 'Tiada keterangan.'}</p>
                    </div>
                  </div>

                  {/* Kemaskini Form */}
                  <form onSubmit={handleSaveUpdate} className="w-full md:w-1/2 flex flex-col h-full">
                    <div className="flex-1 space-y-5">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Tukar Status Terkini</label>
                        <select 
                          value={editForm.status} onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                          className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all font-bold text-slate-700"
                        >
                          <option value="Baru">Baru (Belum Disemak)</option>
                          <option value="Dalam Tindakan">Dalam Tindakan (Diserahkan ke Kontraktor)</option>
                          <option value="Selesai">Selesai (Kerja Pembaikan Siap)</option>
                          <option value="Ditolak">Ditolak (Palsu / Luar Bidang Kuasa)</option>
                        </select>
                      </div>

                      <div className="space-y-2 flex-1 flex flex-col">
                        <label className="text-sm font-bold text-slate-700">Maklum Balas Rasmi (Untuk dilihat pengadu)</label>
                        <textarea 
                          placeholder="Taipkan jawapan, arahan atau status semasa di sini..."
                          value={editForm.maklum_balas} onChange={(e) => setEditForm({...editForm, maklum_balas: e.target.value})}
                          className="w-full flex-1 min-h-[150px] px-4 py-3 bg-white border border-slate-300 rounded-xl outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all resize-none text-sm text-slate-700"
                        ></textarea>
                      </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-slate-100 flex justify-end">
                      <button type="submit" disabled={isSaving} className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg flex justify-center items-center gap-2">
                        {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        Simpan Perubahan
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}

export default UrusAduan;