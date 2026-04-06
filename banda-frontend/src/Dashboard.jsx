import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FilePlus, AlertCircle, Clock, CheckCircle2, Bell, Calendar } from 'lucide-react';
import Sidebar from './Sidebar';

function Dashboard() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update clock every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Fetch User Data
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response = await axios.get('http://localhost:8000/api/user', {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          }
        });
        setUserData(response.data);
        setIsLoading(false);
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        navigate('/login');
      }
    };
    fetchUser();
  }, [navigate]);

  // Format date for Header (e.g., "6 April 2026")
  const formattedDate = currentTime.toLocaleDateString('ms-MY', { 
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' 
  });

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  // PREMIUM LOADING SKELETON
  if (isLoading) {
    return (
      <div className="flex h-screen bg-slate-50 font-sans">
        <div className="w-72 bg-white border-r border-slate-200 animate-pulse"></div>
        <div className="flex-1 flex flex-col">
          <div className="h-20 bg-white border-b border-slate-200 animate-pulse"></div>
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => <div key={i} className="h-32 bg-slate-200 rounded-2xl animate-pulse"></div>)}
            </div>
            <div className="h-64 bg-slate-200 rounded-2xl animate-pulse mt-8"></div>
          </div>
        </div>
      </div>
    );
  }

  const initial = userData?.name ? userData.name.charAt(0).toUpperCase() : 'A';

  return (
    <div className="flex h-screen bg-slate-50 font-sans selection:bg-teal-500/20">
      
      {/* Sidebar Component */}
      <Sidebar userData={userData} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        
        {/* Top Header */}
        <header className="flex items-center justify-between px-8 py-5 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Papan Pemuka</h2>
            <div className="flex items-center gap-2 text-sm text-slate-500 font-medium mt-1">
              <Calendar className="w-4 h-4 text-teal-600" />
              <span>{formattedDate}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-5">
            {/* Notification Bell */}
            <button className="relative p-2 text-slate-400 hover:text-teal-600 transition-colors">
              <Bell className="w-6 h-6" />
              <span className="absolute top-1 right-2 w-2.5 h-2.5 bg-rose-500 border-2 border-white rounded-full"></span>
            </button>

            {/* User Profile */}
            <div className="flex items-center gap-3 pl-5 border-l border-slate-200">
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-slate-900 leading-tight">{userData?.name || 'Pengguna'}</p>
                <p className="text-xs text-slate-500 capitalize">{userData?.peranan || 'Komuniti'}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold border border-teal-200 shadow-sm">
                {initial}
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-8">
          
          <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-6xl mx-auto">
            
            {/* Greeting */}
            <motion.h3 variants={itemVariants} className="text-lg font-medium text-slate-600 mb-6">
              Selamat datang, <span className="font-bold text-slate-900">{userData?.name}</span>! Berikut adalah ringkasan aduan anda.
            </motion.h3>

            {/* Status Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              
              {/* Card 1: Baru (Teal) */}
              <motion.div variants={itemVariants} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex items-center gap-5 relative overflow-hidden">
                <div className="w-14 h-14 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600 border border-teal-100">
                  <AlertCircle className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-slate-500 font-bold text-sm uppercase tracking-wide">Aduan Baru</p>
                  <h4 className="text-4xl font-black text-slate-900 mt-1">2</h4>
                </div>
                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-teal-50 rounded-full blur-2xl pointer-events-none"></div>
              </motion.div>

              {/* Card 2: Sedang Diproses (Amber) */}
              <motion.div variants={itemVariants} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex items-center gap-5 relative overflow-hidden">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500 border border-amber-100">
                  <Clock className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-slate-500 font-bold text-sm uppercase tracking-wide">Diproses</p>
                  <h4 className="text-4xl font-black text-slate-900 mt-1">1</h4>
                </div>
                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-amber-50 rounded-full blur-2xl pointer-events-none"></div>
              </motion.div>

              {/* Card 3: Selesai (Emerald) */}
              <motion.div variants={itemVariants} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex items-center gap-5 relative overflow-hidden">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500 border border-emerald-100">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-slate-500 font-bold text-sm uppercase tracking-wide">Selesai</p>
                  <h4 className="text-4xl font-black text-slate-900 mt-1">5</h4>
                </div>
                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-emerald-50 rounded-full blur-2xl pointer-events-none"></div>
              </motion.div>
            </div>

            {/* Main Action Area */}
            <motion.div variants={itemVariants} className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden mt-8">
              <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <h3 className="text-lg font-black text-slate-900">Tindakan Pantas</h3>
              </div>
              <div className="p-12 flex flex-col items-center justify-center text-center bg-gradient-to-b from-white to-slate-50/50">
                <div className="w-24 h-24 bg-teal-50 rounded-full flex items-center justify-center mb-6 border border-teal-100 shadow-sm">
                  <FilePlus className="w-10 h-10 text-teal-600" />
                </div>
                <h4 className="text-2xl font-black text-slate-900 mb-3">Lapor Kerosakan Infrastruktur</h4>
                <p className="text-slate-600 max-w-md mb-8 leading-relaxed">
                  Muat naik gambar kerosakan jalan, lampu jalan, atau kemudahan awam. Sistem AI BANDA+ akan mengklasifikasikan aduan anda secara automatik.
                </p>
                <button onClick={() => navigate('/lapor-aduan')} className="bg-teal-600 hover:bg-teal-700 text-white font-black py-4 px-10 rounded-2xl transition-all shadow-lg shadow-teal-600/20 hover:-translate-y-1 hover:shadow-teal-600/40 flex items-center gap-3">
                  <FilePlus className="w-5 h-5" />
                  Mula Lapor Aduan
                </button>
              </div>
            </motion.div>

          </motion.div>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;