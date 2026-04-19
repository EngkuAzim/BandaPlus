import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  HardHat, 
  Calendar, 
  FileText, 
  Save, 
  Loader2, 
  MapPin, 
  Info
} from 'lucide-react';
import { toast } from 'sonner';
import Sidebar from './Sidebar';

function LantikKontraktor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [aduan, setAduan] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [form, setForm] = useState({
    id_kontraktor: '',
    tarikh_jangkaan_siap: '',
    nota_pegawai: ''
  });

  // Data Kontraktor (Boleh diambil dari API di masa hadapan)
  const senaraiKontraktor = [
    { id: 'K001', nama: 'Bina Teguh Enterprise', zon: 'Zon 1 & 2' },
    { id: 'K002', nama: 'Maju Jaya Landskap', zon: 'Zon 3 & 4' },
    { id: 'K003', nama: 'Elektrik Cekap Sdn Bhd', zon: 'Semua Zon' }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const [userRes, aduanRes] = await Promise.all([
          axios.get('http://localhost:8000/api/user', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`http://localhost:8000/api/admin/aduan`, { headers: { Authorization: `Bearer ${token}` } })
        ]);

        setUserData(userRes.data);
        // Cari aduan spesifik dari senarai (atau buat endpoint show di backend)
        const currentAduan = aduanRes.data.find(a => a.id_aduan === id);
        setAduan(currentAduan);
      } catch (error) {
        toast.error('Gagal memuatkan maklumat aduan.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:8000/api/pegawai/aduan/${id}/tugaskan`, form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Arahan Kerja Berjaya!', { description: `Kontraktor telah dilantik untuk aduan ${id}.` });
      navigate('/dashboard');
    } catch (error) {
      toast.error('Galat', { description: 'Gagal menghantar arahan kerja.' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <Loader2 className="w-10 h-10 animate-spin text-teal-600" />
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      <Sidebar userData={userData} />

      <div className="flex-1 overflow-auto">
        <header className="px-8 py-6 bg-white border-b border-slate-200 sticky top-0 z-10">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 text-slate-500 hover:text-teal-600 font-bold transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali
          </button>
          <h2 className="text-2xl font-black text-slate-900">Arahan Kerja: {id}</h2>
        </header>

        <main className="p-8 max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Butiran Aduan */}
            <div className="md:col-span-1 space-y-6">
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Bukti Aduan</h4>
                <div className="aspect-square rounded-2xl overflow-hidden bg-slate-100 mb-4">
                  <img 
                    src={`http://localhost:8000/storage/${aduan?.gambar_bukti}`} 
                    className="w-full h-full object-cover" 
                    alt="Bukti" 
                  />
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-teal-600 shrink-0 mt-1" />
                    <p className="text-xs font-bold text-slate-700">{aduan?.alamat_lokasi}</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-teal-600 shrink-0 mt-1" />
                    <p className="text-xs text-slate-500 italic">"{aduan?.keterangan_aduan || 'Tiada nota tambahan.'}"</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Borang Pelantikan */}
            <div className="md:col-span-2">
              <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-teal-50 rounded-lg text-teal-600">
                    <HardHat className="w-5 h-5" />
                  </div>
                  <h3 className="font-black text-slate-900">Maklumat Pelantikan Kontraktor</h3>
                </div>

                <div>
                  <label className="text-xs font-black text-slate-400 uppercase ml-1 block mb-2">Pilih Kontraktor Bertugas</label>
                  <select 
                    required
                    value={form.id_kontraktor}
                    onChange={(e) => setForm({...form, id_kontraktor: e.target.value})}
                    className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:border-teal-500 focus:bg-white transition-all font-bold text-slate-700"
                  >
                    <option value="">-- Pilih Kontraktor --</option>
                    {senaraiKontraktor.map(k => (
                      <option key={k.id} value={k.id}>{k.nama} ({k.zon})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-black text-slate-400 uppercase ml-1 block mb-2">Tarikh Jangkaan Siap (SLA)</label>
                  <div className="relative">
                    <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                      type="date" required
                      value={form.tarikh_jangkaan_siap}
                      onChange={(e) => setForm({...form, tarikh_jangkaan_siap: e.target.value})}
                      className="w-full pl-14 pr-5 py-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:border-teal-500 focus:bg-white transition-all font-bold text-slate-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-black text-slate-400 uppercase ml-1 block mb-2">Arahan Spesifik (Nota Kerja)</label>
                  <div className="relative">
                    <FileText className="absolute left-5 top-5 w-5 h-5 text-slate-400" />
                    <textarea 
                      rows="4"
                      value={form.nota_pegawai}
                      onChange={(e) => setForm({...form, nota_pegawai: e.target.value})}
                      className="w-full pl-14 pr-5 py-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:border-teal-500 focus:bg-white transition-all text-sm font-medium"
                      placeholder="Sila nyatakan arahan teknikal atau spesifikasi pembaikan jika perlu..."
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isSaving || !form.id_kontraktor}
                  className="w-full bg-slate-900 text-white font-black py-5 rounded-3xl hover:bg-teal-600 disabled:opacity-50 flex items-center justify-center gap-3 shadow-xl transition-all"
                >
                  {isSaving ? <Loader2 className="animate-spin" /> : <Save />}
                  HANTAR ARAHAN KERJA
                </button>
              </form>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}

export default LantikKontraktor;