import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
  FileText, Download, Loader2, Calendar, MapPin, 
  TrendingUp, Building2, HardHat
} from 'lucide-react';
import { toast } from 'sonner';
import Sidebar from './Sidebar';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

function LaporanPrestasi() {
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statsData, setStatsData] = useState({
    kategori: [],
    zon: [],
    kontraktor: [],
    bajet: []
  });

  const [filterMonth, setFilterMonth] = useState('Semua');

  useEffect(() => {
    fetchData();
  }, [filterMonth]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      const userRes = await axios.get('http://localhost:8000/api/user', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserData(userRes.data);

      const statsRes = await axios.get(`http://localhost:8000/api/admin/laporan-prestasi?month=${filterMonth}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStatsData(statsRes.data);
    } catch (error) {
      toast.error('Gagal memuat turun data laporan.');
    } finally {
      setIsLoading(false);
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text('Laporan Prestasi BANDA+', 14, 22);
    doc.setFontSize(11);
    doc.text(`Bulan: ${filterMonth}`, 14, 30);
    doc.text(`Tarikh Janaan: ${new Date().toLocaleDateString('ms-MY')}`, 14, 36);

    let currentY = 45;

    // 1. Kategori Aduan
    doc.setFontSize(14);
    doc.text('1. Jumlah Aduan Mengikut Kategori', 14, currentY);
    doc.autoTable({
      startY: currentY + 5,
      head: [['Kategori Kerosakan', 'Jumlah Laporan']],
      body: statsData.kategori.map(k => [k.jenis_kerosakan, k.total]),
      theme: 'grid',
      headStyles: { fillColor: [13, 148, 136] }
    });
    currentY = doc.lastAutoTable.finalY + 15;

    // 2. Aduan Mengikut Zon
    doc.text('2. Aduan Mengikut Zon', 14, currentY);
    doc.autoTable({
      startY: currentY + 5,
      head: [['Zon', 'Jumlah Kes']],
      body: statsData.zon.map(z => [`Zon ${z.id_zon}`, z.total]),
      theme: 'grid',
      headStyles: { fillColor: [13, 148, 136] }
    });
    currentY = doc.lastAutoTable.finalY + 15;

    // 3. Prestasi Kontraktor
    doc.text('3. Prestasi Kontraktor (Kes Selesai)', 14, currentY);
    doc.autoTable({
      startY: currentY + 5,
      head: [['Nama Kontraktor', 'Jumlah Kerja', 'Tepat Masa', 'Lewat']],
      body: statsData.kontraktor.map(k => [k.name, k.total_kerja, k.tepat, k.lewat]),
      theme: 'grid',
      headStyles: { fillColor: [13, 148, 136] }
    });
    
    doc.save(`Laporan_BandaPlus_${filterMonth}.pdf`);
    toast.success('Laporan PDF berjaya dimuat turun.');
  };

  const exportExcel = () => {
    const wb = XLSX.utils.book_new();
    
    const wsKategori = XLSX.utils.json_to_sheet(statsData.kategori);
    XLSX.utils.book_append_sheet(wb, wsKategori, "Kategori");
    
    const wsZon = XLSX.utils.json_to_sheet(statsData.zon.map(z => ({ Zon: z.id_zon, Jumlah: z.total })));
    XLSX.utils.book_append_sheet(wb, wsZon, "Mengikut Zon");

    const wsKontraktor = XLSX.utils.json_to_sheet(statsData.kontraktor);
    XLSX.utils.book_append_sheet(wb, wsKontraktor, "Prestasi Kontraktor");

    XLSX.writeFile(wb, `Laporan_BandaPlus_${filterMonth}.xlsx`);
    toast.success('Laporan Excel berjaya dimuat turun.');
  };

  return (
    <div className="flex h-[100dvh] bg-slate-50 font-sans overflow-hidden">
      <Sidebar userData={userData} />
      
      <div className="flex-1 flex flex-col relative overflow-hidden bg-slate-50 md:rounded-l-3xl shadow-2xl p-6">
        <div className="max-w-6xl w-full mx-auto flex flex-col h-full bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden relative">
          
          <header className="p-6 md:p-8 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Laporan Prestasi</h2>
                <p className="text-sm font-bold text-slate-500">Jana statistik analitik operasi rasmi MPAJ</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <select 
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="bg-white border border-slate-200 text-slate-700 text-sm rounded-xl px-4 py-2.5 font-bold outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
              >
                <option value="Semua">Keseluruhan</option>
                <option value="01">Januari</option>
                <option value="02">Februari</option>
                <option value="03">Mac</option>
                <option value="04">April</option>
              </select>

              <button onClick={exportExcel} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-black flex items-center gap-2 shadow-lg shadow-emerald-200 transition-all">
                <Download className="w-4 h-4" /> Excel
              </button>
              
              <button onClick={exportPDF} className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2.5 rounded-xl text-sm font-black flex items-center gap-2 shadow-lg shadow-rose-200 transition-all">
                <Download className="w-4 h-4" /> PDF
              </button>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-8">
            {isLoading ? (
              <div className="flex justify-center items-center h-full"><Loader2 className="w-10 h-10 animate-spin text-indigo-600" /></div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Kad 1: Kategori */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" /> Aduan Mengikut Kategori
                  </h3>
                  <div className="space-y-3">
                    {statsData.kategori.map((k, i) => (
                      <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded-2xl border border-slate-100">
                        <span className="font-bold text-slate-700 text-sm">{k.jenis_kerosakan}</span>
                        <span className="font-black text-indigo-600 bg-indigo-100 px-3 py-1 rounded-lg text-xs">{k.total} Kes</span>
                      </div>
                    ))}
                    {statsData.kategori.length === 0 && <p className="text-center text-xs font-bold text-slate-400 py-4">Tiada rekod.</p>}
                  </div>
                </div>

                {/* Kad 2: Zon */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> Taburan Zon (Hotspots)
                  </h3>
                  <div className="space-y-3">
                    {statsData.zon.map((z, i) => (
                      <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded-2xl border border-slate-100">
                        <span className="font-bold text-slate-700 text-sm">Zon {z.id_zon}</span>
                        <span className="font-black text-rose-600 bg-rose-100 px-3 py-1 rounded-lg text-xs">{z.total} Aduan</span>
                      </div>
                    ))}
                    {statsData.zon.length === 0 && <p className="text-center text-xs font-bold text-slate-400 py-4">Tiada rekod.</p>}
                  </div>
                </div>

                {/* Kad 3: Prestasi Kontraktor */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm md:col-span-2">
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <HardHat className="w-4 h-4" /> Prestasi Kontraktor
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-400 font-black">
                          <th className="pb-3">Nama Kontraktor</th>
                          <th className="pb-3">Jumlah Tugasan Selesai</th>
                          <th className="pb-3 text-emerald-600">Tepat Masa</th>
                          <th className="pb-3 text-rose-600">Lewat</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {statsData.kontraktor.map((k, i) => (
                          <tr key={i}>
                            <td className="py-4 font-bold text-slate-800">{k.name}</td>
                            <td className="py-4 font-black">{k.total_kerja}</td>
                            <td className="py-4 font-bold text-emerald-600">{k.tepat}</td>
                            <td className="py-4 font-bold text-rose-600">{k.lewat}</td>
                          </tr>
                        ))}
                        {statsData.kontraktor.length === 0 && (
                          <tr><td colSpan="4" className="py-8 text-center text-slate-400 font-bold text-xs">Tiada rekod kontraktor.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default LaporanPrestasi;
