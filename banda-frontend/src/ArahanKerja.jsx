import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, HardHat, Calendar, FileText, Save, 
  Loader2, MapPin, Search, Filter, CheckCircle2, Clock, Wallet, AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import Sidebar from './Sidebar';

function ArahanKerja() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [aduans, setAduans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAduan, setSelectedAduan] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Senarai kontraktor dari pangkalan data
  const [senaraiKontraktor, setSenaraiKontraktor] = useState([]);

  // Form untuk melantik kontraktor
  const [form, setForm] = useState({
    id_kontraktor: '',
    tarikh_jangkaan_siap: '',
    nota_pegawai: '',
    kos_anggaran: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const [userRes, aduanRes, kontraktorRes] = await Promise.all([
          axios.get('http://localhost:8000/api/user', { headers: { Authorization: `Bearer ${token}` } }),
          // Guna /aduan-pending: aduan dari jabatan pegawai ini yang BELUM ada arahan kerja
          axios.get('http://localhost:8000/api/pegawai/aduan-pending', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:8000/api/pegawai/kontraktor-list', { headers: { Authorization: `Bearer ${token}` } })
        ]);

        setUserData(userRes.data);
        setAduans(aduanRes.data);
        setSenaraiKontraktor(kontraktorRes.data);
      } catch (error) {
        toast.error('Gagal memuatkan data aduan.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSelectAduan = (aduan) => {
    setSelectedAduan(aduan);
    setForm({ id_kontraktor: '', tarikh_jangkaan_siap: '', nota_pegawai: '', kos_anggaran: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:8000/api/pegawai/aduan/${selectedAduan.id_aduan}/tugaskan`, form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Arahan Kerja Dikeluarkan!', { description: `Kontraktor telah dilantik untuk ${selectedAduan.id_aduan}.` });
      // Buang aduan yang sudah dilantik dari senarai
      setAduans(aduans.filter(a => a.id_aduan !== selectedAduan.id_aduan));
      setSelectedAduan(null);
    } catch (error) {
      toast.error('Ralat', { 
        description: error.response?.data?.message || 'Gagal menghantar arahan kerja.' 
      });
    } finally {
      setIsSaving(false);
    }
  };

  const bakiSemasa = userData?.jabatan?.baki_semasa || 0;
  const kosAnggaran = parseFloat(form.kos_anggaran) || 0;
  const bakiSelepas = bakiSemasa - kosAnggaran;
  const isOverBudget = bakiSelepas < 0;

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      <Sidebar userData={userData} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="px-8 py-6 bg-white border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-teal-50 rounded-2xl text-teal-600">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900">Pengurusan Arahan Kerja</h2>
              <p className="text-sm text-slate-500 font-medium italic">BANDA<span className="text-teal-600">+</span> Pegawai Operations</p>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* SEBELAH KIRI: SENARAI ADUAN */}
          <div className="space-y-6">
            <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Clock className="w-4 h-4" /> Aduan Menunggu Penugasan ({aduans.length})
            </h4>
            
            {isLoading ? (
              <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-teal-600" /></div>
            ) : (
              <div className="space-y-4">
                {aduans.map(aduan => (
                  <motion.div 
                    key={aduan.id_aduan}
                    whileHover={{ scale: 1.01 }}
                    onClick={() => handleSelectAduan(aduan)}
                    className={`p-6 rounded-3xl border-2 transition-all cursor-pointer shadow-sm ${
                      selectedAduan?.id_aduan === aduan.id_aduan 
                      ? 'bg-white border-teal-500 ring-4 ring-teal-50' 
                      : 'bg-white border-slate-100 hover:border-teal-200'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <span className="font-mono text-xs font-black text-teal-600">{aduan.id_aduan}</span>
                      <span className="px-2 py-1 bg-amber-100 text-amber-700 text-[10px] font-black rounded uppercase">Tindakan Pegawai</span>
                    </div>
                    <h5 className="font-bold text-slate-800 text-lg mb-1">{aduan.jenis_kerosakan}</h5>
                    <div className="flex items-center gap-2 text-slate-500 mb-4">
                      <MapPin className="w-3 h-3" />
                      <span className="text-xs font-medium truncate">{aduan.alamat_lokasi}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Dilaporkan pada: {new Date(aduan.tarikh_lapor).toLocaleDateString()}</p>
                      <span className="text-teal-600 font-black text-xs flex items-center gap-1">Lantik Kontraktor →</span>
                    </div>
                  </motion.div>
                ))}
                {aduans.length === 0 && (
                  <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 border-dashed">
                    <p className="text-slate-400 font-medium">Tiada aduan menunggu penugasan buat masa ini.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* SEBELAH KANAN: BORANG LANTIKAN */}
          <div className="relative">
            <AnimatePresence mode="wait">
              {selectedAduan ? (
                <motion.div 
                  key={selectedAduan.id_aduan}
                  initial={{ opacity: 0, x: 20 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  exit={{ opacity: 0, x: -20 }}
                  className="sticky top-0 space-y-6"
                >
                  <div className="bg-white rounded-[40px] border border-slate-200 shadow-xl overflow-hidden">
                    {/* Preview Gambar */}
                    <div className="h-48 bg-slate-100 relative">
                      <img 
                        src={`http://localhost:8000/storage/${selectedAduan.gambar_bukti}`} 
                        className="w-full h-full object-cover" 
                        alt="Bukti" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-6 left-8">
                        <h3 className="text-white font-black text-xl leading-none">{selectedAduan.id_aduan}</h3>
                        <p className="text-teal-300 text-xs font-bold mt-1 uppercase tracking-widest">{selectedAduan.jenis_kerosakan}</p>
                      </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-8 space-y-5">
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Pilih Kontraktor Berdaftar</label>
                        <select 
                          required value={form.id_kontraktor}
                          onChange={(e) => setForm({...form, id_kontraktor: e.target.value})}
                          className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:border-teal-500 focus:bg-white transition-all font-bold text-slate-700"
                        >
                          <option value="">-- Pilih Kontraktor --</option>
                          {senaraiKontraktor.map(k => <option key={k.id} value={k.id}>{k.name} ({k.no_pengguna})</option>)}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-5">
                        <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Tarikh Jangkaan Siap</label>
                          <input 
                            type="date" required value={form.tarikh_jangkaan_siap}
                            onChange={(e) => setForm({...form, tarikh_jangkaan_siap: e.target.value})}
                            className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:border-teal-500 focus:bg-white transition-all font-bold text-slate-700"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Kos Anggaran (RM)</label>
                          <input 
                            type="number" min="0" step="0.01" required value={form.kos_anggaran}
                            onChange={(e) => setForm({...form, kos_anggaran: e.target.value})}
                            placeholder="Contoh: 1500.00"
                            className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:border-teal-500 focus:bg-white transition-all font-bold text-slate-700"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Nota Kerja Arahan</label>
                        <textarea 
                          rows="3" value={form.nota_pegawai}
                          onChange={(e) => setForm({...form, nota_pegawai: e.target.value})}
                          className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:border-teal-500 focus:bg-white transition-all text-sm font-medium"
                          placeholder="Spesifikasi pembaikan tambahan..."
                        />
                      </div>

                      {/* Paparan Kalkulator Bajet Automatik */}
                      <div className={`p-5 rounded-2xl border-2 transition-all ${isOverBudget ? 'bg-rose-50 border-rose-200' : 'bg-slate-50 border-slate-200'}`}>
                        <div className="flex items-center gap-3 mb-3">
                          <Wallet className={`w-5 h-5 ${isOverBudget ? 'text-rose-500' : 'text-slate-400'}`} />
                          <h6 className={`text-xs font-black uppercase tracking-widest ${isOverBudget ? 'text-rose-600' : 'text-slate-500'}`}>Status Bajet Jabatan</h6>
                        </div>
                        <div className="flex justify-between items-center text-sm mb-1">
                          <span className="text-slate-500 font-medium">Baki Semasa:</span>
                          <span className="font-bold text-slate-700">RM {bakiSemasa.toLocaleString('ms-MY', {minimumFractionDigits: 2})}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm mb-2 pb-2 border-b border-slate-200/60">
                          <span className="text-slate-500 font-medium">Tolak Kos Kerja:</span>
                          <span className="font-bold text-rose-500">- RM {kosAnggaran.toLocaleString('ms-MY', {minimumFractionDigits: 2})}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className={`text-xs font-bold uppercase tracking-wider ${isOverBudget ? 'text-rose-600' : 'text-teal-600'}`}>Baki Tinggal:</span>
                          <span className={`text-lg font-black ${isOverBudget ? 'text-rose-600' : 'text-teal-600'}`}>RM {bakiSelepas.toLocaleString('ms-MY', {minimumFractionDigits: 2})}</span>
                        </div>
                        {isOverBudget && (
                          <div className="mt-3 flex items-start gap-2 bg-rose-100 p-3 rounded-xl text-rose-700 text-xs font-bold">
                            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                            <p>Amaran: Bajet tidak mencukupi. Sila pastikan kos anggaran dalam lingkungan baki yang ada.</p>
                          </div>
                        )}
                      </div>

                      <button 
                        type="submit" disabled={isSaving || !form.id_kontraktor || isOverBudget}
                        className="w-full bg-slate-900 text-white font-black py-5 rounded-[25px] hover:bg-teal-600 disabled:opacity-50 flex items-center justify-center gap-3 shadow-xl shadow-teal-100 transition-all mt-4"
                      >
                        {isSaving ? <Loader2 className="animate-spin" /> : <CheckCircle2 />}
                        HANTAR ARAHAN KERJA
                      </button>
                    </form>
                  </div>
                </motion.div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-slate-100/50 border-2 border-dashed border-slate-200 rounded-[40px]">
                  <HardHat className="w-16 h-16 text-slate-300 mb-4" />
                  <h4 className="text-lg font-black text-slate-400">Pilih Aduan</h4>
                  <p className="text-xs text-slate-400 max-w-[200px]">Sila pilih mana-mana aduan di sebelah kiri untuk mula melantik kontraktor.</p>
                </div>
              )}
            </AnimatePresence>
          </div>

        </main>
      </div>
    </div>
  );
}

export default ArahanKerja;