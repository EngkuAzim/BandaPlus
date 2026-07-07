import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { 
  Wallet, 
  ClipboardList, 
  Clock, 
  CheckCircle2, 
  Building2,
  AlertTriangle,
  TrendingUp,
  MoreVertical,
  Wrench,
  Layers,
  ChevronDown,
  ChevronUp,
  MapPin
} from 'lucide-react';

function PegawaiDashboard({ userData }) {
  const navigate = useNavigate();
  const [statsData, setStatsData] = useState(null);
  const [recentAduan, setRecentAduan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCluster, setExpandedCluster] = useState(null);
  const displayStatus = (s) => ({ 'Baru': 'New', 'Dalam Tindakan': 'In Progress', 'Selesai': 'Completed', 'Ditolak': 'Rejected', 'KIV': 'On Hold' })[s] || s;
  
  const displayCategory = (c) => ({
    'Jalan Berlubang': 'Pothole',
    'Banjir': 'Flood',
    'Anjing Liar / Haiwan Terbiar': 'Stray Animal',
    'Haiwan Liar': 'Stray Animal',
    'Pembuangan Sampah Haram': 'Illegal Dumping',
    'Lampu Jalan Rosak': 'Faulty Streetlight',
    'Longkang Tersumbat/Pecah': 'Clogged Drain',
    'Longkang Tersumbat': 'Clogged Drain',
    'Pokok Tumbang': 'Fallen Tree',
    'Infrastruktur Awam': 'Public Infrastructure',
    'Lain-lain': 'Others'
  })[c] || c;

  // Data Bajet dari DB atau Fallback Mokap
  const bajet = { 
    tahunan: userData?.jabatan?.bajet_tahunan || 500000, 
    bakiSemasa: userData?.jabatan?.baki_semasa || 345200,
    nama: userData?.jabatan?.nama_jabatan || 'Department'
  };

  useEffect(() => {
    const fetchDashboardData = async (isInitial = true) => {
      try {
        if (isInitial) setLoading(true);
        // Guna token dari localStorage (sesuaikan jika anda guna cara lain)
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        // Tarik data stat & aduan serentak
        const [statsRes, aduanRes] = await Promise.all([
          axios.get(`/api/pegawai/dashboard/stats`, { headers }),
          axios.get(`/api/pegawai/aduan`, { headers })
        ]);

        setStatsData(statsRes.data);
        const fetchedAduans = aduanRes.data.data ? aduanRes.data.data : aduanRes.data;
        // Ambil 5 aduan terbaru (hanya aduan induk) untuk jadual
        const parentOnly = fetchedAduans.filter(a => !a.id_aduan_induk);
        setRecentAduan(parentOnly.slice(0, 5));
      } catch (error) {
        console.error("Ralat menarik data:", error);
      } finally {
        if (isInitial) setLoading(false);
      }
    };

    fetchDashboardData(true);
    const interval = setInterval(() => fetchDashboardData(false), 10000);
    return () => clearInterval(interval);
  }, []);

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } };

  const getStatusStyle = (status) => {
    switch(status) {
      case 'Baru': return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'Dalam Tindakan': return 'bg-purple-50 text-purple-600 border-purple-200';
      case 'Selesai': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
      case 'Ditolak': return 'bg-rose-50 text-rose-600 border-rose-200';
      default: return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading BANDA+ data...</div>;
  }

  const statCards = [
    { title: 'Total Reports', value: statsData?.jumlah_keseluruhan || 0, increase: `${statsData?.perubahan_jumlah > 0 ? '+' : ''}${statsData?.perubahan_jumlah || 0}%`, icon: ClipboardList, color: 'text-blue-800', bg: 'bg-blue-50', border: 'border-blue-100' },
    { title: 'Pending Assignment', value: statsData?.baru || 0, increase: `${statsData?.perubahan_baru > 0 ? '+' : ''}${statsData?.perubahan_baru || 0}%`, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-100' },
    { title: 'In Progress', value: statsData?.diproses || 0, increase: `${statsData?.perubahan_diproses > 0 ? '+' : ''}${statsData?.perubahan_diproses || 0}%`, icon: Wrench, color: 'text-indigo-500', bg: 'bg-indigo-50', border: 'border-indigo-100' },
    { title: 'Completed', value: statsData?.selesai || 0, increase: `${statsData?.perubahan_selesai > 0 ? '+' : ''}${statsData?.perubahan_selesai || 0}%`, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-100' }
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-7xl mx-auto w-full p-6 md:p-8 font-sans">
      
      {/* Header */}
      <motion.div variants={itemVariants} className="mb-8">
        <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Building2 className="w-7 h-7 text-blue-800" />
          Officer Dashboard - {bajet.nama}
        </h3>
        <p className="text-sm font-medium text-slate-500 mt-1">Manage contractor assignments and monitor report status in real time.</p>
      </motion.div>

      {/* Action Banner (Tindakan Segera) */}
      {statsData?.baru > 0 && (
        <motion.div variants={itemVariants} className="mb-8 bg-amber-50 border border-amber-200 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white rounded-xl shadow-sm"><AlertTriangle className="w-6 h-6 text-amber-500" /></div>
            <div>
              <h5 className="font-bold text-slate-800">{statsData.baru} Reports Pending Assignment</h5>
              <p className="text-sm text-slate-600">Please review verified reports and assign responsible contractors promptly.</p>
            </div>
          </div>
          <button className="whitespace-nowrap bg-amber-500 hover:bg-amber-600 text-white font-bold px-6 py-2.5 rounded-xl transition-all shadow-sm">
            Manage New Reports
          </button>
        </motion.div>
      )}

      {/* Grid Statistik 4 Lajur */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <motion.div variants={itemVariants} key={index} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center ${stat.color} border ${stat.border}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded-lg">
                <TrendingUp className="w-3 h-3" /> {stat.increase}
              </div>
            </div>
            <div>
              <h4 className="text-3xl font-black text-slate-900 mb-1">{stat.value}</h4>
              <p className="text-slate-500 font-bold text-[11px] uppercase tracking-wider">{stat.title}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Content Bawah: Jadual & Bajet */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Jadual Aduan */}
        <motion.div variants={itemVariants} className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h4 className="text-lg font-black text-slate-800">Recent System Reports</h4>
            <button className="text-sm text-blue-800 hover:text-blue-900 font-bold">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Report ID</th>
                  <th className="px-6 py-4">Category & Location</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentAduan.map((aduan, i) => {
                  const hasCluster = aduan.anak_aduan_count > 0;
                  const isExpanded = expandedCluster === aduan.id_aduan;
                  return (
                    <React.Fragment key={i}>
                      <tr className="hover:bg-slate-50 transition-colors border-b border-slate-100">
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-700">{aduan.id_aduan}</div>
                          {hasCluster && (
                            <div className="flex items-center gap-1 text-[9px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded font-bold uppercase mt-1 w-max border border-purple-200">
                              <Layers className="w-2.5 h-2.5" />
                              {aduan.anak_aduan_count} Clustered Reports
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-800">{displayCategory(aduan.jenis_kerosakan)}</span>
                            <span className="text-xs text-slate-500 truncate max-w-[200px]">{aduan.alamat_lokasi}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusStyle(aduan.status)}`}>
                            {displayStatus(aduan.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {hasCluster ? (
                            <button
                              onClick={() => setExpandedCluster(prev => prev === aduan.id_aduan ? null : aduan.id_aduan)}
                              className={`flex items-center gap-1 mx-auto text-xs font-bold px-3 py-1.5 rounded-xl transition-all ${
                                isExpanded ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                              }`}
                            >
                              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                              Cluster
                            </button>
                          ) : aduan.status === 'Baru' || aduan.status === 'Dalam Tindakan' ? (
                            <button 
                              onClick={() => navigate('/arahan-kerja')}
                              className="bg-slate-900 hover:bg-blue-800 text-white text-xs font-bold px-4 py-2 rounded-lg transition-all shadow-sm whitespace-nowrap"
                            >
                              Work Order
                            </button>
                          ) : (
                            <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-blue-800 transition-colors">
                              <MoreVertical className="w-5 h-5" />
                            </button>
                          )}
                        </td>
                      </tr>
                      {/* Expandable cluster rows */}
                      {hasCluster && isExpanded && (aduan.anak_aduan || []).map((anak, idx) => (
                        <tr key={anak.id_aduan} className="bg-purple-50 border-b border-purple-100">
                          <td className="px-6 py-3 pl-10">
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 rounded-full bg-purple-200 text-purple-700 text-[9px] font-black flex items-center justify-center shrink-0">
                                {idx + 1}
                              </div>
                              <span className="font-mono text-[10px] font-bold text-purple-600">{anak.id_aduan}</span>
                            </div>
                          </td>
                          <td className="px-6 py-3">
                            <div className="flex flex-col">
                              <span className="text-xs font-semibold text-slate-700">{displayCategory(anak.jenis_kerosakan)}</span>
                              <span className="text-[10px] text-slate-400 truncate max-w-[200px] flex items-center gap-1">
                                <MapPin className="w-2.5 h-2.5 shrink-0" />{anak.alamat_lokasi}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusStyle(anak.status)}`}>
                              {displayStatus(anak.status)}
                            </span>
                          </td>
                          <td className="px-6 py-3 text-center">
                            <span className="text-[9px] text-purple-500 font-bold">Clustered Report</span>
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  );
                })}
                {recentAduan.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-slate-500">No reports recorded.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Kad Bajet Mikro */}
        <motion.div variants={itemVariants} className="md:col-span-1 bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden h-fit">
          <div className="absolute -top-4 -right-4 p-6 opacity-10">
            <Wallet className="w-32 h-32" />
          </div>
          <p className="text-slate-300 text-xs font-bold uppercase tracking-widest mb-2 relative z-10">Current Department Budget</p>
          <h4 className="text-4xl font-black mb-6 relative z-10">RM {(bajet.bakiSemasa).toLocaleString('ms-MY')}</h4>
          
          <div className="relative z-10">
            <div className="flex justify-between text-xs font-bold text-slate-300 mb-2">
              <span>Utilization</span>
              <span>{Math.round(((bajet.tahunan - bajet.bakiSemasa) / bajet.tahunan) * 100)}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2.5 mb-3">
              <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${((bajet.tahunan - bajet.bakiSemasa) / bajet.tahunan) * 100}%` }}></div>
            </div>
            <p className="text-xs text-slate-400">Out of allocated RM {(bajet.tahunan).toLocaleString('ms-MY')}</p>
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
}

export default PegawaiDashboard;