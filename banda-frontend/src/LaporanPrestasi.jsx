import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
  FileText, Download, Loader2, MapPin, TrendingUp, Building2, HardHat,
  BarChart2, Activity, CheckCircle2, Clock, AlertCircle, XCircle, Layers
} from 'lucide-react';
import { toast } from 'sonner';
import Sidebar from './Sidebar';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const COLORS = ['#0d9488','#f59e0b','#10b981','#f43f5e','#6366f1','#8b5cf6'];

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl text-sm">
      <p className="font-black mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>{p.name}: <span className="font-black">{p.value}</span></p>
      ))}
    </div>
  );
};

function SummaryCard({ icon: Icon, label, value, color, bg, border }) {
  return (
    <div className={`${bg} rounded-2xl p-5 border ${border} flex items-center gap-4`}>
      <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center ${color} border ${border}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
        <h4 className="text-2xl font-black text-slate-900">{value}</h4>
      </div>
    </div>
  );
}

export default function LaporanPrestasi() {
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState(null);
  const [filterMonth, setFilterMonth] = useState('Semua');

  useEffect(() => {
    fetchData(true);
    const interval = setInterval(() => fetchData(false), 10000);
    return () => clearInterval(interval);
  }, [filterMonth]);

  const fetchData = async (isInitial = true) => {
    if (isInitial) setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const h = { Authorization: `Bearer ${token}`, 'Cache-Control': 'no-cache' };
      if (isInitial) {
        const u = await axios.get(`/api/user`, { headers: h });
        setUserData(u.data);
      }
      const r = await axios.get(`/api/admin/laporan-prestasi?month=${filterMonth}&t=${Date.now()}`, { headers: h });
      setData(r.data);
    } catch { console.error('Gagal memuat data.'); }
    finally { if (isInitial) setIsLoading(false); }
  };

  const exportPDF = () => {
    if (!data) return;
    const doc = new jsPDF();
    doc.setFontSize(20); doc.text('Laporan Prestasi BANDA+', 14, 22);
    doc.setFontSize(11); doc.text(`Bulan: ${filterMonth}`, 14, 30);
    doc.text(`Tarikh: ${new Date().toLocaleDateString('ms-MY')}`, 14, 36);
    let y = 45;
    doc.setFontSize(14); doc.text('1. Aduan Mengikut Kategori', 14, y);
    doc.autoTable({ startY: y+5, head:[['Kategori','Jumlah']], body: data.kategori.map(k=>[k.jenis_kerosakan, k.total]), theme:'grid', headStyles:{fillColor:[13,148,136]} });
    y = doc.lastAutoTable.finalY + 15;
    doc.text('2. Aduan Mengikut Zon', 14, y);
    doc.autoTable({ startY: y+5, head:[['Zon','Jumlah']], body: data.zon.map(z=>[z.id_zon, z.total]), theme:'grid', headStyles:{fillColor:[13,148,136]} });
    y = doc.lastAutoTable.finalY + 15;
    doc.text('3. Prestasi Kontraktor', 14, y);
    doc.autoTable({ startY: y+5, head:[['Kontraktor','Jumlah','Selesai','Tepat','Lewat']], body: data.kontraktor.map(k=>[k.name,k.jumlah,k.total_kerja,k.tepat,k.lewat]), theme:'grid', headStyles:{fillColor:[13,148,136]} });
    doc.save(`Laporan_BandaPlus_${filterMonth}.pdf`);
    toast.success('PDF dimuat turun.');
  };

  const exportExcel = () => {
    if (!data) return;
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data.kategori), 'Kategori');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data.zon.map(z=>({Zon:z.id_zon,Jumlah:z.total}))), 'Zon');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data.kontraktor), 'Kontraktor');
    XLSX.writeFile(wb, `Laporan_BandaPlus_${filterMonth}.xlsx`);
    toast.success('Excel dimuat turun.');
  };

  const ring = data?.ringkasan || {};
  const trend = data?.trend_bulanan || [];
  const kategori = data?.kategori || [];
  const zon = data?.zon || [];
  const kontraktor = data?.kontraktor || [];
  const statusDist = data?.status_distribusi || [];

  return (
    <div className="flex h-[100dvh] bg-slate-50 font-sans overflow-hidden">
      <Sidebar userData={userData} />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="px-8 py-5 bg-white border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center"><FileText className="w-6 h-6" /></div>
            <div>
              <h2 className="text-2xl font-black text-slate-800">Laporan Prestasi & Analitik</h2>
              <p className="text-sm font-bold text-slate-500">Statistik terperinci operasi BANDA+</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <select value={filterMonth} onChange={e=>setFilterMonth(e.target.value)}
              className="bg-white border border-slate-200 text-slate-700 text-sm rounded-xl px-4 py-2.5 font-bold outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm">
              <option value="Semua">Keseluruhan</option>
              {['Januari','Februari','Mac','April','Mei','Jun','Julai','Ogos','September','Oktober','November','Disember'].map((m,i)=>(
                <option key={i} value={String(i+1).padStart(2,'0')}>{m}</option>
              ))}
            </select>
            <button onClick={exportExcel} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-black flex items-center gap-2 shadow-lg shadow-emerald-200 transition-all">
              <Download className="w-4 h-4" /> Excel
            </button>
            <button onClick={exportPDF} className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2.5 rounded-xl text-sm font-black flex items-center gap-2 shadow-lg shadow-rose-200 transition-all">
              <Download className="w-4 h-4" /> PDF
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-8">
          {isLoading ? (
            <div className="flex justify-center items-center h-full"><Loader2 className="w-10 h-10 animate-spin text-indigo-600" /></div>
          ) : (
            <motion.div initial={{opacity:0}} animate={{opacity:1}} className="max-w-7xl mx-auto space-y-8">

              {/* ── Summary Cards ── */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <SummaryCard icon={Layers} label="Jumlah Aduan" value={ring.jumlah||0} color="text-indigo-600" bg="bg-indigo-50" border="border-indigo-100" />
                <SummaryCard icon={AlertCircle} label="Baru" value={ring.baru||0} color="text-teal-600" bg="bg-teal-50" border="border-teal-100" />
                <SummaryCard icon={Clock} label="Dalam Tindakan" value={ring.dalam_tindakan||0} color="text-amber-600" bg="bg-amber-50" border="border-amber-100" />
                <SummaryCard icon={CheckCircle2} label="Selesai" value={ring.selesai||0} color="text-emerald-600" bg="bg-emerald-50" border="border-emerald-100" />
                <SummaryCard icon={XCircle} label="Ditolak" value={ring.ditolak||0} color="text-rose-600" bg="bg-rose-50" border="border-rose-100" />
              </div>

              {/* ── Row 1: Trend + Status Pie ── */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Trend 12 Bulan */}
                <div className="lg:col-span-2 bg-white rounded-3xl p-7 border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600 border border-teal-100"><Activity className="w-5 h-5" /></div>
                    <div><h4 className="text-base font-black text-slate-900">Trend Aduan & Penyelesaian</h4><p className="text-xs text-slate-400 font-medium">12 bulan terkini</p></div>
                  </div>
                  {trend.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <AreaChart data={trend} margin={{top:5,right:5,bottom:0,left:-20}}>
                        <defs>
                          <linearGradient id="gAduan" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#0d9488" stopOpacity={0.3}/><stop offset="95%" stopColor="#0d9488" stopOpacity={0}/></linearGradient>
                          <linearGradient id="gSelesai" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="name" tick={{fontSize:10,fontWeight:700,fill:'#94a3b8'}} axisLine={false} tickLine={false} />
                        <YAxis allowDecimals={false} tick={{fontSize:11,fontWeight:700,fill:'#94a3b8'}} axisLine={false} tickLine={false} />
                        <Tooltip content={<ChartTooltip />} />
                        <Legend wrapperStyle={{fontSize:11,fontWeight:700}} />
                        <Area type="monotone" dataKey="aduan" name="Aduan Masuk" stroke="#0d9488" strokeWidth={2.5} fill="url(#gAduan)" dot={{fill:'#0d9488',r:3,strokeWidth:2,stroke:'#fff'}} />
                        <Area type="monotone" dataKey="selesai" name="Diselesaikan" stroke="#10b981" strokeWidth={2.5} fill="url(#gSelesai)" dot={{fill:'#10b981',r:3,strokeWidth:2,stroke:'#fff'}} />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : <div className="h-[250px] flex items-center justify-center text-slate-400 text-sm font-bold">Tiada data</div>}
                </div>

                {/* Status Pie */}
                <div className="bg-white rounded-3xl p-7 border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 border border-indigo-100"><BarChart2 className="w-5 h-5" /></div>
                    <div><h4 className="text-base font-black text-slate-900">Taburan Status</h4><p className="text-xs text-slate-400 font-medium">Peratusan aduan</p></div>
                  </div>
                  {statusDist.some(s=>s.value>0) ? (<>
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart><Pie data={statusDist} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                        {statusDist.map((_,i)=><Cell key={i} fill={COLORS[i]} />)}
                      </Pie><Tooltip content={<ChartTooltip />} /></PieChart>
                    </ResponsiveContainer>
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      {statusDist.map((s,i)=>(
                        <div key={i} className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{background:COLORS[i]}}></span>
                          <span className="text-[11px] font-bold text-slate-600">{s.name}: {s.value}</span>
                        </div>
                      ))}
                    </div>
                  </>) : <div className="h-[220px] flex items-center justify-center text-slate-400 text-sm font-bold">Tiada data</div>}
                </div>
              </div>

              {/* ── Row 2: Kategori Bar + Zon ── */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Kategori */}
                <div className="bg-white rounded-3xl p-7 border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 border border-amber-100"><TrendingUp className="w-5 h-5" /></div>
                    <div><h4 className="text-base font-black text-slate-900">Jenis Kerosakan</h4><p className="text-xs text-slate-400 font-medium">Semua kategori aduan</p></div>
                  </div>
                  {kategori.length > 0 ? (
                    <ResponsiveContainer width="100%" height={Math.max(200, kategori.length*45)}>
                      <BarChart data={kategori} layout="vertical" margin={{top:0,right:10,bottom:0,left:0}}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                        <XAxis type="number" tick={{fontSize:11,fontWeight:700,fill:'#94a3b8'}} axisLine={false} tickLine={false} allowDecimals={false} />
                        <YAxis type="category" dataKey="jenis_kerosakan" tick={{fontSize:10,fontWeight:700,fill:'#475569'}} axisLine={false} tickLine={false} width={120} />
                        <Tooltip content={<ChartTooltip />} />
                        <Bar dataKey="total" name="Aduan" radius={[0,6,6,0]}>
                          {kategori.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : <div className="h-[200px] flex items-center justify-center text-slate-400 text-sm font-bold">Tiada data</div>}
                </div>

                {/* Zon */}
                <div className="bg-white rounded-3xl p-7 border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 border border-rose-100"><MapPin className="w-5 h-5" /></div>
                    <div><h4 className="text-base font-black text-slate-900">Taburan Zon (Hotspot)</h4><p className="text-xs text-slate-400 font-medium">Kawasan paling aktif</p></div>
                  </div>
                  {zon.length > 0 ? (
                    <div className="space-y-3">
                      {zon.map((z,i)=>{
                        const max = Math.max(...zon.map(x=>x.total));
                        const pct = max>0 ? Math.round((z.total/max)*100) : 0;
                        return (
                          <div key={i} className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black text-white shrink-0" style={{background:COLORS[i%COLORS.length]}}>{i+1}</div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-xs font-bold text-slate-700 truncate">Zon {z.id_zon}</span>
                                <span className="text-xs font-black text-slate-900 ml-2">{z.total} aduan</span>
                              </div>
                              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full rounded-full transition-all duration-700" style={{width:`${pct}%`,background:COLORS[i%COLORS.length]}}></div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : <div className="h-[200px] flex items-center justify-center text-slate-400 text-sm font-bold">Tiada data zon</div>}
                </div>
              </div>

              {/* ── Row 3: Prestasi Kontraktor ── */}
              <div className="bg-white rounded-3xl p-7 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 border border-purple-100"><HardHat className="w-5 h-5" /></div>
                  <div><h4 className="text-base font-black text-slate-900">Prestasi Kontraktor</h4><p className="text-xs text-slate-400 font-medium">Kadar penyelesaian dan ketepatan masa</p></div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b-2 border-slate-100 text-slate-400 font-black text-xs uppercase tracking-wider">
                        <th className="pb-4 pl-2">Kontraktor</th>
                        <th className="pb-4 text-center">Jumlah Tugasan</th>
                        <th className="pb-4 text-center">Selesai</th>
                        <th className="pb-4 text-center">Dalam Proses</th>
                        <th className="pb-4 text-center text-emerald-600">Tepat Masa</th>
                        <th className="pb-4 text-center text-rose-600">Lewat</th>
                        <th className="pb-4 text-center">Kadar Selesai</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {kontraktor.length > 0 ? kontraktor.map((k,i)=>{
                        const kadar = k.jumlah > 0 ? Math.round((k.total_kerja/k.jumlah)*100) : 0;
                        return (
                          <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-4 pl-2 font-bold text-slate-800">{k.name}</td>
                            <td className="py-4 text-center font-black text-slate-600">{k.jumlah}</td>
                            <td className="py-4 text-center font-black text-indigo-600">{k.total_kerja}</td>
                            <td className="py-4 text-center font-bold text-amber-600">{k.dalam_proses}</td>
                            <td className="py-4 text-center font-bold text-emerald-600">{k.tepat}</td>
                            <td className="py-4 text-center font-bold text-rose-600">{k.lewat}</td>
                            <td className="py-4 text-center">
                              <div className="inline-flex items-center gap-2">
                                <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                                  <div className={`h-full rounded-full ${kadar>=70?'bg-emerald-500':kadar>=40?'bg-amber-500':'bg-rose-500'}`} style={{width:`${kadar}%`}}></div>
                                </div>
                                <span className="text-xs font-black text-slate-700">{kadar}%</span>
                              </div>
                            </td>
                          </tr>
                        );
                      }) : (
                        <tr><td colSpan="7" className="py-10 text-center text-slate-400 font-bold text-xs">Tiada rekod kontraktor.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
}
