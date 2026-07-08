import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, X, Save, Loader2, MapPin, Building2, BrainCircuit, Layers, ChevronDown, ChevronUp, Mic } from 'lucide-react';
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
  const [selectedClusterParent, setSelectedClusterParent] = useState(null);

  const getPriorityColor = (prio) => {
    const p = (prio || '').toLowerCase();
    if (p.includes('tinggi')) return 'bg-rose-100 text-rose-700 border-rose-200';
    if (p.includes('sederhana')) return 'bg-amber-100 text-amber-700 border-amber-200';
    return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  };

  const displayStatus = (s) => ({ 'Baru': 'New', 'Dalam Tindakan': 'In Progress', 'Selesai': 'Completed', 'Ditolak': 'Rejected', 'KIV': 'On Hold' })[s] || s;
  const displayCategory = (c) => ({
    'Jalan Berlubang': 'Pothole',
    'Banjir': 'Flood',
    'Pokok Tumbang': 'Fallen Tree',
    'Pembuangan Sampah Haram': 'Illegal Dumping',
    'Haiwan Liar': 'Stray Animal',
    'Lampu Jalan Rosak': 'Faulty Streetlight',
    'Longkang Tersumbat': 'Clogged Drain'
  })[c] || c;

  const displayPriority = (prio) => {
    const map = { 'Tinggi': 'High', 'Sederhana': 'Medium', 'Rendah': 'Low' };
    return map[prio] || prio;
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }

    const fetchData = async (isInitial = true) => {
      try {
        if (isInitial) setIsLoading(true);
        const userRes = await axios.get(`/api/user`, { headers: { Authorization: `Bearer ${token}` } });
        setUserData(userRes.data);

        if (userRes.data.peranan !== 'pentadbir') {
          navigate('/dashboard');
          return;
        }

        const aduanRes = await axios.get(`/api/admin/aduan`, { headers: { Authorization: `Bearer ${token}` } });
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

    // --- FEATURE 3: Echo listener for live incoming complaints ---
    let echoInstance = null;
    import('./echo').then(({ default: echo }) => {
      echoInstance = echo;
      echo.private('admin-dashboard')
        .listen('.AduanBaru', (e) => {
          if (!e.aduan) return;
          
          if (e.aduan.id_aduan_induk) {
             // If it's a child aduan (cluster), we refetch to get the updated parent score and anak array
              fetchData(false);
              toast.success('New Related Report Detected!', {
                description: `A new related report was grouped under report #${e.aduan.id_aduan_induk}.`,
                duration: 6000,
              });
           } else {
              // Slide new complaint into the top of the list
              setAduans(prev => [e.aduan, ...prev]);
              toast.success('New Report Received!', {
                description: `${displayCategory(e.aduan.jenis_kerosakan) || 'New report'} received from ${e.aduan.pengguna?.name || 'Community User'}.`,
                duration: 6000,
              });
           }
        });
    });

    return () => {
      if (echoInstance) echoInstance.leave('admin-dashboard');
    };
  }, [navigate]);

  const handleOpenModal = (aduan) => {
    setSelectedClusterParent(null); // Close drawer if open
    setSelectedAduan(aduan);
    setEditForm({
      status: aduan.status,
      maklum_balas: aduan.maklum_balas || '',
      id_jabatan: aduan.id_jabatan || '',
      jenis_kerosakan: aduan.jenis_kerosakan || ''
    });
  };

  const handleSaveUpdate = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(`/api/admin/aduan/${selectedAduan.id_aduan}`, editForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setAduans(aduans.map(a => a.id_aduan === selectedAduan.id_aduan ? res.data.aduan : a));
      toast.success('Review Saved!', { description: 'Report verified and department assigned successfully.' });
      setSelectedAduan(null);
    } catch (error) {
      toast.error('Error', { description: 'Failed to save review.' });
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
            <h2 className="text-2xl font-black text-slate-900 tracking-tight italic">BANDA<span className="text-blue-800">+</span> Admin</h2>
            <p className="text-sm text-slate-500 font-medium mt-1">Review incoming reports and assign responsible MPAJ departments.</p>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-8">
          {isLoading ? (
            <div className="flex items-center justify-center h-full"><Loader2 className="w-10 h-10 animate-spin text-blue-800" /></div>
          ) : (
            <div className="max-w-7xl mx-auto space-y-4">
              <div className="flex items-center justify-between">
                 <div className="relative w-full sm:w-80">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                      type="text" placeholder="Search ID or Reporter..." 
                      value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 shadow-sm rounded-xl text-sm outline-none focus:border-blue-800 focus:ring-4 focus:ring-blue-800/10 transition-all font-medium"
                    />
                 </div>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase">
                  <tr>
                    <th className="p-5 rounded-tl-3xl">Report ID</th>
                    <th className="p-5">Reporter & Zone</th>
                    <th className="p-5 hidden md:table-cell">Problem Details</th>
                    <th className="p-5">AI Priority</th>
                    <th className="p-5">Status</th>
                    <th className="p-5 text-right rounded-tr-3xl">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAduans.map(aduan => {
                    const hasCluster = aduan.anak_aduan_count > 0;
                    
                    return (
                      <React.Fragment key={aduan.id_aduan}>
                        <tr className="hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-b-0 group/row">
                          <td className="p-5 group-last/row:rounded-bl-3xl">
                            <div className="font-mono text-sm font-bold text-blue-800">{aduan.id_aduan}</div>
                            {hasCluster && (
                              <div className="flex items-center gap-1 text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded font-bold uppercase mt-1 w-max border border-purple-200">
                                <Layers className="w-2.5 h-2.5" />
                                {aduan.anak_aduan_count} Related Reports
                              </div>
                            )}
                          </td>
                          <td className="p-5">
                            <p className="font-bold text-slate-900">{aduan.pengguna?.name}</p>
                            <p className="text-xs text-slate-500">Zone: {aduan.id_zon || 'N/A'}</p>
                          </td>
                          <td className="p-5 hidden md:table-cell max-w-[200px] relative group cursor-pointer">
                            <p className="text-sm font-bold text-slate-800">{displayCategory(aduan.jenis_kerosakan)}</p>
                            {aduan.keterangan_aduan && (
                              <>
                                <p className="text-xs text-slate-500 mt-0.5 truncate italic">
                                  "{aduan.keterangan_aduan}"
                                </p>
                                {/* Custom Hover Tooltip */}
                                <div className="absolute left-5 top-full mt-2 hidden group-hover:block w-[250px] p-3 bg-slate-900 text-slate-100 text-xs rounded-xl shadow-2xl z-[60] whitespace-normal leading-relaxed pointer-events-none">
                                  {/* Arrow pointing up */}
                                  <div className="absolute -top-1.5 left-4 w-3 h-3 bg-slate-900 transform rotate-45"></div>
                                  <div className="font-bold text-white mb-1 uppercase tracking-widest text-[10px]">Full Description</div>
                                  {aduan.keterangan_aduan}
                                </div>
                              </>
                            )}
                          </td>
                          <td className="p-5">
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase border ${getPriorityColor(aduan.label_prioriti)}`}>
                                {displayPriority(aduan.label_prioriti || 'Sederhana')}
                              </span>
                              <span className="text-xs font-bold text-slate-400">{aduan.skor_ai || '0'}% AI</span>
                            </div>
                          </td>
                          <td className="p-5">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              aduan.status === 'Baru' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'
                            }`}>
                              {displayStatus(aduan.status)}
                            </span>
                          </td>
                          <td className="p-5 text-right flex justify-end gap-2 group-last/row:rounded-br-3xl">
                            {hasCluster && (
                              <button
                                onClick={() => setSelectedClusterParent(aduan)}
                                className="flex items-center gap-1 text-xs font-bold px-3 py-2 rounded-xl transition-all bg-purple-100 text-purple-700 hover:bg-purple-200"
                              >
                                Related
                              </button>
                            )}
                            <button onClick={() => handleOpenModal(aduan)} className="text-sm font-bold text-white bg-slate-900 px-4 py-2 rounded-xl hover:bg-blue-800 transition-all">
                              Review
                            </button>
                          </td>
                        </tr>
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
              </div>
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
                    <h4 className="flex items-center gap-2 font-black text-slate-900 text-sm uppercase tracking-widest border-b border-slate-100 pb-2">
                        Evidence
                    </h4>
                    <div className="aspect-video rounded-3xl overflow-hidden bg-slate-100 border-4 border-white shadow-lg">
                      <img src={`/storage/${selectedAduan.gambar_bukti}`} className="w-full h-full object-cover" alt="Main Photo" />
                    </div>
                    {selectedAduan.evidences && selectedAduan.evidences.length > 0 && (
                        <div className="grid grid-cols-3 gap-2">
                            {selectedAduan.evidences.map((ev, idx) => (
                                <div key={idx} className="aspect-square rounded-2xl overflow-hidden bg-slate-100 border-2 border-slate-200 shadow-sm relative group">
                                    {ev.file_type === 'video' ? (
                                        <video src={`/storage/${ev.file_path}`} controls className="w-full h-full object-cover bg-slate-900" />
                                    ) : (
                                        <a href={`/storage/${ev.file_path}`} target="_blank" rel="noreferrer">
                                            <img src={`/storage/${ev.file_path}`} className="w-full h-full object-cover hover:scale-105 transition-transform" alt={`Extra Evidence ${idx+1}`} />
                                        </a>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Problem Description (Prominent) */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm mt-4 relative overflow-hidden">
                       <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-full blur-2xl -mr-10 -mt-10"></div>
                       <h4 className="flex items-center gap-2 font-black text-slate-900 text-[10px] uppercase tracking-widest mb-3 relative z-10">
                         <Layers className="w-4 h-4 text-purple-600" /> Reporter's Description
                       </h4>
                       <p className="text-base text-slate-700 leading-relaxed italic font-medium border-l-4 border-purple-300 pl-4 py-1 relative z-10">
                         "{selectedAduan.keterangan_aduan || 'No additional description provided.'}"
                       </p>

                       {selectedAduan.audio && (
                         <div className="mt-5 pt-5 border-t border-slate-100 relative z-10">
                           <h4 className="flex items-center gap-2 font-black text-slate-900 text-[10px] uppercase tracking-widest mb-3">
                              <Mic className="w-3.5 h-3.5 text-blue-600" /> Original Voice Report
                           </h4>
                           <audio src={`/storage/${selectedAduan.audio}`} controls className="w-full h-10 rounded-full bg-slate-50" />
                         </div>
                       )}
                    </div>

                    <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100 mt-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <h4 className="flex items-center gap-2 font-black text-slate-900 text-sm uppercase tracking-widest">
                          <MapPin className="w-4 h-4 text-blue-800" /> Location Details
                        </h4>
                        <span className="text-[10px] font-bold bg-white px-3 py-1 rounded-full border border-slate-200 text-slate-500 w-max">
                          {new Date(selectedAduan.tarikh_lapor).toLocaleString('ms-MY', {
                            dateStyle: 'medium', timeStyle: 'short'
                          })}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-slate-700">{selectedAduan.alamat_lokasi}</p>
                    </div>
                  </div>

                  {/* Borang Saringan Pentadbir */}
                  <form onSubmit={handleSaveUpdate} className="flex flex-col gap-5">
                    <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                      <BrainCircuit className="w-8 h-8 text-blue-800" />
                      <div>
                        <p className="text-[10px] font-black text-blue-800 uppercase">AI Suggestion</p>
                        <p className="text-sm font-bold text-slate-800">Issue: {displayCategory(selectedAduan.jenis_kerosakan)} ({selectedAduan.skor_ai || 0}% Confidence)</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {/* Override Issue Category */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-black text-slate-400 uppercase ml-1">Issue Category</label>
                        <select 
                          required 
                          value={editForm.jenis_kerosakan} 
                          onChange={(e) => setEditForm({...editForm, jenis_kerosakan: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-800/20 focus:border-blue-800 transition-all font-semibold text-slate-700"
                        >
                          <option value="Pothole">Pothole (Jalanraya Rosak)</option>
                          <option value="Fallen Tree">Fallen Tree (Pokok Tumbang)</option>
                          <option value="Streetlight">Streetlight (Lampu Rosak)</option>
                          <option value="Drainage">Drainage (Longkang Tersumbat)</option>
                          <option value="Pelbagai Kerosakan">Pelbagai Kerosakan</option>
                          <option value="Lain-lain">Others</option>
                        </select>
                      </div>

                      {/* Penugasan Jabatan (CRITICAL FLOW) */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-black text-slate-400 uppercase ml-1">Department</label>
                        <select 
                          required 
                          value={editForm.id_jabatan} 
                          onChange={(e) => setEditForm({...editForm, id_jabatan: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-800/20 focus:border-blue-800 transition-all font-semibold text-slate-700"
                        >
                          <option value="">-- Select Department --</option>
                          <option value="J01">J01 - Jabatan Kejuruteraan</option>
                          <option value="J02">J02 - Jabatan Belia Masyarakat dan Landskap</option>
                          <option value="J03">J03 - Jabatan Perkhidmatan Bandar dan Kesihatan</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-black text-slate-400 uppercase ml-1">Decision</label>
                        <select 
                          required 
                          value={editForm.status} 
                          onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-800/20 focus:border-blue-800 transition-all font-semibold text-slate-700"
                        >
                          <option value="Baru">New</option>
                          <option value="Dalam Tindakan">In Progress</option>
                          <option value="Ditolak">Rejected</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-black text-slate-400 uppercase ml-1">Response</label>
                        <textarea 
                          rows="3" value={editForm.maklum_balas} onChange={(e) => setEditForm({...editForm, maklum_balas: e.target.value})}
                          className="w-full mt-1 px-5 py-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:border-blue-800 focus:bg-white transition-all text-sm font-medium"
                          placeholder="Write a response or explanation for the reporter..."
                        />
                      </div>
                    </div>

                    <button type="submit" disabled={isSaving || !editForm.id_jabatan} className="mt-auto w-full bg-slate-900 text-white font-black py-5 rounded-3xl hover:bg-blue-800 disabled:opacity-50 disabled:hover:bg-slate-900 flex items-center justify-center gap-3 shadow-xl shadow-blue-100 transition-all">
                      {isSaving ? <Loader2 className="animate-spin" /> : <Save />}
                      Send to Department
                    </button>
                  </form>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* SIDE PANEL FOR RELATED REPORTS */}
        <AnimatePresence>
          {selectedClusterParent && (
            <>
              {/* Overlay */}
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
                onClick={() => setSelectedClusterParent(null)} 
                className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm z-40" 
              />
              
              {/* Drawer */}
              <motion.div 
                initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} 
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="absolute top-0 right-0 bottom-0 w-full sm:w-[450px] bg-white shadow-2xl z-50 flex flex-col border-l border-slate-200"
              >
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div>
                    <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
                      <Layers className="w-5 h-5 text-purple-600" /> Related Reports
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-1">
                      Grouped under <span className="font-bold text-blue-800">#{selectedClusterParent.id_aduan}</span>
                    </p>
                  </div>
                  <button onClick={() => setSelectedClusterParent(null)} className="p-2 bg-white rounded-full border border-slate-200 hover:bg-slate-100 text-slate-500 transition-all">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
                  {/* Cluster Summary Card */}
                  <div className="bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden flex flex-col">
                    {selectedClusterParent.gambar_bukti && (
                      <div className="h-40 w-full bg-slate-100 relative">
                        <img src={`/storage/${selectedClusterParent.gambar_bukti}`} alt="Cluster Evidence" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
                        <div className="absolute bottom-4 left-5 right-5 text-white">
                           <span className="bg-blue-600 px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider mb-2 inline-block shadow-sm">Main Issue</span>
                           <h4 className="font-bold text-lg leading-tight">{displayCategory(selectedClusterParent.jenis_kerosakan)}</h4>
                        </div>
                      </div>
                    )}
                    <div className="p-5">
                      <p className="text-sm text-slate-600 mb-4">{selectedClusterParent.keterangan_aduan || 'No additional description provided.'}</p>
                      
                      <div className="flex items-center justify-between p-4 bg-purple-50 rounded-2xl border border-purple-100">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-full bg-purple-200 flex items-center justify-center text-purple-700">
                             <Layers className="w-5 h-5" />
                           </div>
                           <div>
                             <p className="text-[10px] font-black text-purple-600 uppercase tracking-widest">Total Reports</p>
                             <p className="font-black text-xl text-purple-900">{selectedClusterParent.anak_aduan_count || (selectedClusterParent.anak_aduan ? selectedClusterParent.anak_aduan.length : 0)}</p>
                           </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="flex items-center gap-4 py-2">
                    <div className="h-px bg-slate-200 flex-1"></div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Related Reports</span>
                    <div className="h-px bg-slate-200 flex-1"></div>
                  </div>

                  {/* List of related reports */}
                  <div className="space-y-4">
                    {(selectedClusterParent.anak_aduan || []).map((anak, idx) => (
                      <div key={anak.id_aduan} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-purple-300 hover:shadow-md transition-all group">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 text-[10px] font-black flex items-center justify-center">
                              {idx + 1}
                            </div>
                            <span className="font-mono text-sm font-bold text-purple-700">#{anak.id_aduan}</span>
                          </div>
                          <span className={`px-2 py-1 rounded text-[10px] font-black uppercase border ${getPriorityColor(anak.label_prioriti)}`}>
                            {displayPriority(anak.label_prioriti || 'Sederhana')}
                          </span>
                        </div>
                        
                        <div className="mb-4">
                          <p className="text-xs font-black text-slate-400 uppercase mb-1">Reporter Details</p>
                          <p className="text-sm font-bold text-slate-800">{anak.pengguna?.name || 'Community User'}</p>
                          {anak.alamat_lokasi && (
                            <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-1 truncate" title={anak.alamat_lokasi}>
                              <MapPin className="w-2.5 h-2.5 shrink-0" />
                              {anak.alamat_lokasi}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                            anak.status === 'Baru' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {displayStatus(anak.status)}
                          </span>
                          <button onClick={() => handleOpenModal(anak)} className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg hover:bg-slate-200 transition-all">
                            Review Full Details
                          </button>
                        </div>
                      </div>
                    ))}
                    
                    {(!selectedClusterParent.anak_aduan || selectedClusterParent.anak_aduan.length === 0) && (
                      <div className="text-center p-8 text-slate-400 text-sm font-medium border-2 border-dashed border-slate-200 rounded-2xl">
                        No related reports found.
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default UrusAduan;