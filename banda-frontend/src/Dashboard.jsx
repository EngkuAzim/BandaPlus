import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FilePlus, AlertCircle, Clock, CheckCircle2, Bell, Calendar, ClipboardList, ShieldCheck, FileSearch, HardHat, PieChart } from 'lucide-react';
import Sidebar from './Sidebar';

function Dashboard() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [stats, setStats] = useState({});
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) { navigate('/login'); return; }

      try {
        // 1. Dapatkan Profil Pengguna Dahulu
        const userRes = await axios.get('http://localhost:8000/api/user', { headers: { Authorization: `Bearer ${token}` } });
        const user = userRes.data;
        setUserData(user);

        // 2. Semak peranan & panggil API yang betul
        const statsUrl = (user.peranan === 'pentadbir' || user.peranan === 'pegawai') 
          ? 'http://localhost:8000/api/admin/dashboard/stats' 
          : 'http://localhost:8000/api/dashboard/stats';

        const statsRes = await axios.get(statsUrl, { headers: { Authorization: `Bearer ${token}` } });
        setStats(statsRes.data);
        setIsLoading(false);
      } catch (error) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    };
    fetchData();
  }, [navigate]);

  const formattedDate = currentTime.toLocaleDateString('ms-MY', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const initial = userData?.name ? userData.name.charAt(0).toUpperCase() : 'A';

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } };

  // ==========================================
  // VIEW 1: PAPAN PEMUKA PENTADBIR & PEGAWAI
  // ==========================================
  const renderManagementDashboard = () => (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-6xl mx-auto">
      <motion.div variants={itemVariants} className="flex justify-between items-end mb-6">
        <h3 className="text-xl font-black text-slate-900">Prestasi Keseluruhan BANDA+</h3>
        <span className="px-3 py-1 bg-indigo-50 text-indigo-700 font-bold text-xs rounded-lg uppercase tracking-widest border border-indigo-100">
          Mod {userData.peranan}
        </span>
      </motion.div>

      {/* STATISTIK KESELURUHAN SISTEM */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <motion.div variants={itemVariants} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center mb-4"><PieChart className="w-5 h-5" /></div>
          <div>
            <p className="text-slate-500 font-bold text-xs uppercase tracking-wide">Jumlah Terkumpul</p>
            <h4 className="text-3xl font-black text-slate-900 mt-1">{stats.jumlah_keseluruhan || 0}</h4>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white rounded-2xl p-5 border border-rose-100 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center mb-4"><AlertCircle className="w-5 h-5" /></div>
          <div>
            <p className="text-rose-500 font-bold text-xs uppercase tracking-wide">Menunggu Semakan</p>
            <h4 className="text-3xl font-black text-rose-700 mt-1">{stats.baru || 0}</h4>
          </div>
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-rose-50 rounded-full blur-2xl"></div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white rounded-2xl p-5 border border-amber-100 shadow-sm flex flex-col justify-between">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center mb-4"><Clock className="w-5 h-5" /></div>
          <div>
            <p className="text-amber-600 font-bold text-xs uppercase tracking-wide">Kerja Dijalankan</p>
            <h4 className="text-3xl font-black text-amber-700 mt-1">{stats.diproses || 0}</h4>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white rounded-2xl p-5 border border-emerald-100 shadow-sm flex flex-col justify-between">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center mb-4"><CheckCircle2 className="w-5 h-5" /></div>
          <div>
            <p className="text-emerald-600 font-bold text-xs uppercase tracking-wide">Selesai Dibaikpulih</p>
            <h4 className="text-3xl font-black text-emerald-700 mt-1">{stats.selesai || 0}</h4>
          </div>
        </motion.div>
      </div>

      {/* TUGAS BERBEZA MENGIKUT PERANAN */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {userData.peranan === 'pentadbir' ? (
          // TINDAKAN KHAS PENTADBIR (ADMIN MPAJ)
          <>
            <div onClick={() => navigate('/urus-aduan')} className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-3xl p-8 text-white cursor-pointer hover:shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-1 transition-all group relative overflow-hidden">
              <ShieldCheck className="w-12 h-12 text-indigo-300 mb-6 group-hover:scale-110 transition-transform" />
              <h4 className="text-2xl font-black mb-2">Tugasan Agihan Kontraktor</h4>
              <p className="text-indigo-200 text-sm leading-relaxed">Urus dan sahkan aduan masuk, kemudian agihkan tugasan kepada kontraktor panel berdaftar.</p>
              <div className="absolute right-0 bottom-0 opacity-10 scale-150 translate-x-4 translate-y-4"><ClipboardList size={180} /></div>
            </div>
            
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col justify-center items-center text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100"><HardHat className="w-8 h-8 text-slate-400" /></div>
              <h4 className="text-lg font-black text-slate-900 mb-2">Urus Direktori Kontraktor</h4>
              <p className="text-slate-500 text-sm mb-6">Tambah, buang, atau gantung akaun kontraktor dalam zon MPAJ.</p>
              <button className="px-6 py-2.5 bg-slate-900 text-white font-bold rounded-xl text-sm hover:bg-slate-800 transition-colors">Buka Direktori (Akan Datang)</button>
            </div>
          </>
        ) : (
          // TINDAKAN KHAS PEGAWAI JABATAN
          <>
            <div onClick={() => navigate('/urus-aduan')} className="bg-gradient-to-br from-teal-600 to-teal-800 rounded-3xl p-8 text-white cursor-pointer hover:shadow-lg hover:shadow-teal-500/30 hover:-translate-y-1 transition-all group relative overflow-hidden">
              <FileSearch className="w-12 h-12 text-teal-300 mb-6 group-hover:scale-110 transition-transform" />
              <h4 className="text-2xl font-black mb-2">Semakan Integriti Aduan</h4>
              <p className="text-teal-100 text-sm leading-relaxed">Sahihkan aduan daripada komuniti, sahkan kerosakan fizikal tapak, dan turunkan nota siasatan.</p>
              <div className="absolute right-0 bottom-0 opacity-10 scale-150 translate-x-4 translate-y-4"><FileSearch size={180} /></div>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col justify-center items-center text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100"><ClipboardList className="w-8 h-8 text-slate-400" /></div>
              <h4 className="text-lg font-black text-slate-900 mb-2">Laporan Keseluruhan Zon</h4>
              <p className="text-slate-500 text-sm mb-6">Jana laporan PDF bulanan untuk diserahkan kepada pihak atasan pengurusan.</p>
              <button className="px-6 py-2.5 bg-slate-900 text-white font-bold rounded-xl text-sm hover:bg-slate-800 transition-colors">Jana Laporan (Akan Datang)</button>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );

  // ==========================================
  // VIEW 2: PAPAN PEMUKA KOMUNITI (AWAM)
  // ==========================================
  const renderKomunitiDashboard = () => (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-6xl mx-auto">
      <motion.h3 variants={itemVariants} className="text-lg font-medium text-slate-600 mb-6">
        Selamat datang, <span className="font-bold text-slate-900">{userData.name}</span>! Berikut adalah ringkasan aduan anda.
      </motion.h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div variants={itemVariants} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex items-center gap-5 relative overflow-hidden">
          <div className="w-14 h-14 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600 border border-teal-100"><AlertCircle className="w-7 h-7" /></div>
          <div>
            <p className="text-slate-500 font-bold text-sm uppercase tracking-wide">Aduan Baru</p>
            <h4 className="text-4xl font-black text-slate-900 mt-1">{stats.baru || 0}</h4>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-5 relative overflow-hidden">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500 border border-amber-100"><Clock className="w-7 h-7" /></div>
          <div>
            <p className="text-slate-500 font-bold text-sm uppercase tracking-wide">Diproses</p>
            <h4 className="text-4xl font-black text-slate-900 mt-1">{stats.diproses || 0}</h4>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-5 relative overflow-hidden">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500 border border-emerald-100"><CheckCircle2 className="w-7 h-7" /></div>
          <div>
            <p className="text-slate-500 font-bold text-sm uppercase tracking-wide">Selesai</p>
            <h4 className="text-4xl font-black text-slate-900 mt-1">{stats.selesai || 0}</h4>
          </div>
        </motion.div>
      </div>

      <motion.div variants={itemVariants} className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden mt-8">
        <div className="p-12 flex flex-col items-center justify-center text-center bg-gradient-to-b from-white to-slate-50/50">
          <div className="w-24 h-24 bg-teal-50 rounded-full flex items-center justify-center mb-6 border border-teal-100 shadow-sm">
            <FilePlus className="w-10 h-10 text-teal-600" />
          </div>
          <h4 className="text-2xl font-black text-slate-900 mb-3">Lapor Kerosakan Infrastruktur</h4>
          <p className="text-slate-600 max-w-md mb-8 leading-relaxed">Muat naik gambar kerosakan jalan, lampu jalan, atau kemudahan awam. Sistem BANDA+ akan mengesannya secara automatik.</p>
          <button onClick={() => navigate('/lapor-aduan')} className="bg-teal-600 hover:bg-teal-700 text-white font-black py-4 px-10 rounded-2xl transition-all shadow-lg shadow-teal-600/20 hover:-translate-y-1">
            Mula Lapor Aduan
          </button>
        </div>
      </motion.div>
    </motion.div>
  );

  // ==========================================
  // RENDER UTAMA
  // ==========================================
  if (isLoading || !userData) {
    return (
      <div className="flex h-screen bg-slate-50"><div className="m-auto"><Loader2 className="w-8 h-8 animate-spin text-teal-600" /></div></div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 font-sans selection:bg-teal-500/20">
      <Sidebar userData={userData} />

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <header className="flex items-center justify-between px-8 py-5 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Papan Pemuka</h2>
            <div className="flex items-center gap-2 text-sm text-slate-500 font-medium mt-1">
              <Calendar className="w-4 h-4 text-teal-600" />
              <span>{formattedDate}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-5">
            <button className="relative p-2 text-slate-400 hover:text-teal-600 transition-colors">
              <Bell className="w-6 h-6" />
              <span className="absolute top-1 right-2 w-2.5 h-2.5 bg-rose-500 border-2 border-white rounded-full"></span>
            </button>
            <div className="flex items-center gap-3 pl-5 border-l border-slate-200">
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-slate-900 leading-tight">{userData.name}</p>
                <p className="text-xs text-slate-500 capitalize">{userData.peranan}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold border border-teal-200 shadow-sm">
                {initial}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto p-8">
          {/* RENDER BERSYARAT MENGIKUT PERANAN */}
          {(userData.peranan === 'pentadbir' || userData.peranan === 'pegawai') 
            ? renderManagementDashboard() 
            : renderKomunitiDashboard()
          }
        </main>
      </div>
    </div>
  );
}

export default Dashboard;