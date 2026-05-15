import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, X, Save, Loader2, MapPin, Building2, BrainCircuit, Layers, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import Sidebar from './Sidebar';

function UrusAduan() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [aduans, setAduans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAduan, setSelectedAduan] = useState(null);
  
  const [isSaving, setIsSaving] = useState(false);
  // Tambah id_jabatan dalam editForm mengikut flow BANDA+
  const [editForm, setEditForm] = useState({ 
    status: '', 
    maklum_balas: '',
    id_jabatan: '', // Untuk penugasan pegawai
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Semua');
  const [expandedCluster, setExpandedCluster] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }

    const fetchData = async (isInitial = true) => {
      try {
        if (isInitial) setIsLoading(true);
        const userRes = await axios.get(`${import.meta.env.VITE_API_URL}/user`, { headers: { Authorization: `Bearer ${token}` } });
        setUserData(userRes.data);

        if (userRes.data.peranan !== 'pentadbir') {
          navigate('/dashboard');
          return;
        }

        const aduanRes = await axios.get(`${import.meta.env.VITE_API_URL}/admin/aduan`, { headers: { Authorization: `Bearer ${token}` } });
        // Handle both paginated (.data.data) and non-paginated (.data) responses
        const fetchedAduans = aduanRes.data.data ? aduanRes.data.data : aduanRes.data;
        setAduans(fetchedAduans);
        setSelectedAduan(prev => {
          if (prev) return fetchedAduans.find(a => a.id_aduan === prev.id_aduan) || prev;
          return prev;
        });
      } catch (error) {
        console.error("Ralat menarik data:", error);
      } finally {
        if (isInitial) setIsLoading(false);
      }
    };
    fetchData(true);
    const interval = setInterval(() => fetchData(false), 10000);
    return () => clearInterval(interval);
  }, [navigate]);

  const handleOpenModal = (aduan) => {
    setSelectedAduan(aduan);
    setEditForm({
      status: aduan.status,
      maklum_balas: aduan.maklum_balas || '',
      id_jabatan: aduan.id_jabatan || ''
    });
  };

  const handleSaveUpdate = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(`${import.meta.env.VITE_API_URL}/admin/aduan/${selectedAduan.id_aduan}`, editForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setAduans(aduans.map(a => a.id_aduan === selectedAduan.id_aduan ? res.data.aduan : a));
      toast.success('Saringan Berjaya!', { description: 'Aduan telah disaring dan dikemaskini.' });
      setSelectedAduan(null);
    } catch (error) {
      toast.error('Ralat', { description: 'Gagal mengemaskini saringan.' });
    } finally {
      setIsSaving(false);
    }
  };

  // Filter parents first
  const parentAduans = aduans.filter(aduan => !aduan.id_aduan_induk);

  const filteredAduans = parentAduans.filter(aduan => {
    const matchesSearch = aduan.id_aduan.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (aduan.pengguna?.name && aduan.pengguna.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === 'Semua' || aduan.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      <Sidebar userData={userData} />

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-8 py-5 bg-white border-b border-slate-200 sticky top-0 z-10 gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight italic">BANDA<span className="text-teal-600">+</span> Admin</h2>
            <p className="text-sm text-slate-500 font-medium mt-1">Saringan Aduan & Penugasan Jabatan</p>
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" placeholder="Cari ID atau Pengadu..." 
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-teal-500"
              />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-8">
          {isLoading ? (
            <div className="flex items-center justify-center h-full"><Loader2 className="w-10 h-10 animate-spin text-teal-600" /></div>
          ) : (
            <div className="max-w-7xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase">
                  <tr>
                    <th className="p-5">ID Aduan</th>
                    <th className="p-5">Pengadu & Zon</th>
                    <th className="p-5">Analitik AI</th>
                    <th className="p-5">Status</th>
                    <th className="p-5 text-right">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAduans.map(aduan => {
                    const hasCluster = aduan.anak_aduan_count > 0;
                    const isExpanded = expandedCluster === aduan.id_aduan;
                    
                    return (
                      <React.Fragment key={aduan.id_aduan}>
                        <tr className="hover:bg-slate-50 transition-colors border-b border-slate-100">
                          <td className="p-5">
                            <div className="font-mono text-sm font-bold text-teal-700">{aduan.id_aduan}</div>
                            {hasCluster && (
                              <div className="flex items-center gap-1 text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded font-bold uppercase mt-1 w-max border border-purple-200">
                                <Layers className="w-2.5 h-2.5" />
                                {aduan.anak_aduan_count} Aduan Kluster
                              </div>
                            )}
                          </td>
                          <td className="p-5">
                            <p className="font-bold text-slate-900">{aduan.pengguna?.name}</p>
                            <p className="text-xs text-slate-500">Zon: {aduan.id_zon || 'N/A'}</p>
                          </td>
                          <td className="p-5">
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                aduan.label_prioriti === 'Tinggi' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                              }`}>
                                {aduan.label_prioriti || 'Sederhana'}
                              </span>
                              <span className="text-xs font-bold text-slate-400">{aduan.skor_ai || '0'}% AI</span>
                            </div>
                          </td>
                          <td className="p-5">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              aduan.status === 'Baru' ? 'bg-teal-100 text-teal-700' : 'bg-slate-100 text-slate-600'
                            }`}>
                              {aduan.status}
                            </span>
                          </td>
                          <td className="p-5 text-right flex justify-end gap-2">
                            {hasCluster && (
                              <button
                                onClick={() => setExpandedCluster(prev => prev === aduan.id_aduan ? null : aduan.id_aduan)}
                                className={`flex items-center gap-1 text-xs font-bold px-3 py-2 rounded-xl transition-all ${
                                  isExpanded ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                                }`}
                              >
                                {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                Kluster
                              </button>
                            )}
                            <button onClick={() => handleOpenModal(aduan)} className="text-sm font-bold text-white bg-slate-900 px-4 py-2 rounded-xl hover:bg-teal-600 transition-all">
                              Saring
                            </button>
                          </td>
                        </tr>
                        
                        {/* Expandable Child Rows */}
                        {hasCluster && isExpanded && (aduan.anak_aduan || []).map((anak, idx) => (
                          <tr key={anak.id_aduan} className="bg-purple-50/50 border-b border-purple-100/50">
                            <td className="p-5 pl-12">
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded-full bg-purple-200 text-purple-700 text-[9px] font-black flex items-center justify-center shrink-0">
                                  {idx + 1}
                                </div>
                                <span className="font-mono text-xs font-bold text-purple-600">{anak.id_aduan}</span>
                              </div>
                            </td>
                            <td className="p-5">
                              <p className="font-bold text-slate-700">{anak.pengguna?.name || 'Pengguna Komuniti'}</p>
                              <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5 truncate max-w-[200px]">
                                <MapPin className="w-2.5 h-2.5 shrink-0" />
                                {anak.alamat_lokasi}
                              </p>
                            </td>
                            <td className="p-5">
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-blue-100 text-blue-600">
                                  {anak.label_prioriti || 'Sederhana'}
                                </span>
                              </div>
                            </td>
                            <td className="p-5">
                              <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                                anak.status === 'Baru' ? 'bg-teal-100 text-teal-700' : 'bg-slate-100 text-slate-600'
                              }`}>
                                {anak.status}
                              </span>
                            </td>
                            <td className="p-5 text-right">
                              <button onClick={() => handleOpenModal(anak)} className="text-xs font-bold text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-all">
                                Saring Anak Aduan
                              </button>
                            </td>
                          </tr>
                        ))}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </main>

        {/* MODAL SARINGAN (FOLLOWING BANDA+ FLOW) */}
        <AnimatePresence>
          {selectedAduan && (
            <div className="absolute inset-0 z-50 flex items-center justify-center p-8">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedAduan(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="relative w-full max-w-4xl bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 overflow-y-auto">
                  {/* Bukti Digital */}
                  <div className="space-y-4">
                    <div className="aspect-video rounded-3xl overflow-hidden bg-slate-100 border-4 border-white shadow-lg">
                      <img src={`${import.meta.env.VITE_API_URL.replace('/api', '')}/storage/${selectedAduan.gambar_bukti}`} className="w-full h-full object-cover" alt="Bukti" />
                    </div>
                    <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100">
                      <h4 className="flex items-center gap-2 font-black text-slate-900 mb-2 text-sm uppercase tracking-widest"><MapPin className="w-4 h-4 text-teal-600" /> Lokasi & Keterangan</h4>
                      <p className="text-sm font-bold text-slate-700 mb-2">{selectedAduan.alamat_lokasi}</p>
                      <p className="text-xs text-slate-500 leading-relaxed italic">"{selectedAduan.keterangan_aduan || 'Tiada keterangan tambahan.'}"</p>
                    </div>
                  </div>

                  {/* Borang Saringan Pentadbir */}
                  <form onSubmit={handleSaveUpdate} className="flex flex-col gap-5">
                    <div className="flex items-center gap-3 p-4 bg-teal-50 rounded-2xl border border-teal-100">
                      <BrainCircuit className="w-8 h-8 text-teal-600" />
                      <div>
                        <p className="text-[10px] font-black text-teal-600 uppercase">Analisis Smart Vision</p>
                        <p className="text-sm font-bold text-slate-800">Kerosakan: {selectedAduan.jenis_kerosakan} ({selectedAduan.skor_ai || 0}%)</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {/* Penugasan Jabatan (CRITICAL FLOW) */}
                      <div>
                        <label className="text-xs font-black text-slate-400 uppercase ml-1">Tugaskan Jabatan</label>
                        <select 
                          value={editForm.id_jabatan} onChange={(e) => setEditForm({...editForm, id_jabatan: e.target.value})}
                          className="w-full mt-1 px-5 py-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:border-teal-500 focus:bg-white transition-all font-bold text-slate-700"
                        >
                          <option value="">-- Pilih Jabatan Bertanggungjawab --</option>
                          <option value="J01">J01 - Jabatan Kejuruteraan</option>
                          <option value="J02">J02 - Jabatan Landskap</option>
                          <option value="J03">J03 - Jabatan Kesihatan Awam</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-black text-slate-400 uppercase ml-1">Keputusan Saringan Status</label>
                        <select 
                          value={editForm.status} onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                          className="w-full mt-1 px-5 py-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:border-teal-500 focus:bg-white transition-all font-bold text-slate-700"
                        >
                          <option value="Baru">Baru (Belum Disahkan)</option>
                          <option value="Dalam Tindakan">Sahkan & Serah ke Jabatan</option>
                          <option value="Ditolak">Tolak Aduan (Palsu/Luar Bidang)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-black text-slate-400 uppercase ml-1">Nota Saringan (Maklum Balas)</label>
                        <textarea 
                          rows="3" value={editForm.maklum_balas} onChange={(e) => setEditForm({...editForm, maklum_balas: e.target.value})}
                          className="w-full mt-1 px-5 py-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:border-teal-500 focus:bg-white transition-all text-sm font-medium"
                          placeholder="Berikan ulasan saringan untuk rujukan pengadu..."
                        />
                      </div>
                    </div>

                    <button type="submit" disabled={isSaving || !editForm.id_jabatan} className="mt-auto w-full bg-slate-900 text-white font-black py-5 rounded-3xl hover:bg-teal-600 disabled:opacity-50 disabled:hover:bg-slate-900 flex items-center justify-center gap-3 shadow-xl shadow-teal-100 transition-all">
                      {isSaving ? <Loader2 className="animate-spin" /> : <Save />}
                      SAHKAN SARINGAN & TUGASKAN
                    </button>
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