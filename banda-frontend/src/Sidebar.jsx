import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  FilePlus, 
  History, 
  LogOut, 
  Settings, 
  Users, 
  ClipboardList, 
  Map, 
  ChevronLeft, 
  ChevronRight, 
  UserCircle,
  Building2,
  HardHat,
  Wallet,
  Camera
} from 'lucide-react';

const Sidebar = ({ userData }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const role = userData?.peranan || 'komuniti';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  // Konfigurasi Navigasi Lengkap Berdasarkan 4 Peranan BANDA+
  const navigationConfig = {
    komuniti: [
      { name: 'Papan Pemuka', path: '/dashboard', icon: Home },
      { name: 'Lapor Aduan', path: '/lapor-aduan', icon: FilePlus },
      { name: 'Sejarah Laporan', path: '/sejarah', icon: History },
      { name: 'Profil Saya', path: '/profil', icon: UserCircle },
    ],
    pentadbir: [
      { name: 'Pusat Kawalan', path: '/dashboard', icon: Home },
      { name: 'Saringan Aduan', path: '/urus-aduan', icon: ClipboardList },
      { name: 'Pengurusan Pengguna', path: '/pengguna', icon: Users },
      { name: 'Peta Kluster (AI)', path: '/peta', icon: Map },
      { name: 'Tetapan Sistem', path: '/tetapan', icon: Settings },
    ],
    pegawai: [
      { name: 'Papan Pemuka', path: '/dashboard', icon: Home },
      { name: 'Arahan Kerja', path: '/arahan-kerja', icon: Building2 },
      { name: 'Log Bajet Mikro', path: '/bajet', icon: Wallet },
    ],
    kontraktor: [
      { name: 'Tugasan Semasa', path: '/dashboard', icon: Home },
      { name: 'Senarai Pembaikan', path: '/pembaikan', icon: HardHat },
      { name: 'Kamera Geo-Fencing', path: '/geo-kamera', icon: Camera },
      { name: 'Sejarah Kerja', path: '/sejarah-kerja', icon: History },
    ]
  };

  const currentLinks = navigationConfig[role] || navigationConfig.komuniti;

  // Konfigurasi Fizik Framer Motion untuk pergerakan lebih "smooth"
  const springConfig = { type: "spring", stiffness: 300, damping: 26 };

  return (
    <motion.aside 
      animate={{ width: isCollapsed ? 84 : 290 }}
      transition={springConfig}
      className="bg-white shadow-[10px_0_40px_-15px_rgba(0,0,0,0.05)] border-r border-slate-100 flex flex-col h-full relative z-40 selection:bg-teal-500/20 shrink-0"
    >
      {/* Collapse Toggle dengan Efek Timbul */}
      <motion.button 
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3.5 top-10 bg-white border border-slate-200 shadow-md rounded-full p-1.5 text-slate-400 hover:text-teal-600 hover:border-teal-200 transition-colors z-50 flex items-center justify-center"
      >
        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </motion.button>

      {/* Brand Logo & Peranan */}
      <div className={`pt-8 pb-6 px-6 flex items-center ${isCollapsed ? 'justify-center px-0' : 'gap-4'} transition-all duration-300 relative overflow-hidden`}>
        {/* Latar Belakang Abstrak Halus di bawah Logo */}
        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-teal-50/50 to-transparent -z-10"></div>
        
        <div className="w-11 h-11 rounded-[14px] bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center shadow-lg shadow-teal-500/30 shrink-0 border border-teal-400/20">
          <span className="text-white text-lg font-black tracking-tighter leading-none">B+</span>
        </div>
        
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="whitespace-nowrap overflow-hidden"
            >
              <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1">
                BANDA<span className="text-teal-600">+</span>
              </h1>
              <p className="text-[10px] font-black text-teal-600/70 uppercase tracking-[0.2em]">{role}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Links Navigasi */}
      <nav className="mt-2 flex-1 flex flex-col gap-1.5 px-4 overflow-y-auto overflow-x-hidden scrollbar-hide">
        {currentLinks.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path;

          return (
            <Link
              key={link.name}
              to={link.path}
              title={isCollapsed ? link.name : ""}
              className="relative group"
            >
              {/* Petunjuk Aktif Latar Belakang */}
              {isActive && (
                <motion.div 
                  layoutId="activeSidebarIndicator"
                  className="absolute inset-0 bg-teal-50 rounded-2xl"
                  transition={springConfig}
                />
              )}

              <div className={`relative flex items-center gap-3.5 py-3.5 px-4 rounded-2xl font-medium transition-all duration-200 z-10 ${
                isActive 
                  ? 'text-teal-700 font-bold' 
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              } ${isCollapsed ? 'justify-center px-0' : ''}`}>
                
                <Icon className={`w-5 h-5 shrink-0 transition-all duration-300 ${
                  isActive ? 'text-teal-600 stroke-[2.5px]' : 'text-slate-400 group-hover:text-slate-600'
                }`} />
                
                <AnimatePresence mode="wait">
                  {!isCollapsed && (
                    <motion.span 
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="whitespace-nowrap overflow-hidden"
                    >
                      {link.name}
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* Titik Makluman Kecil (Contoh: Boleh disambung dengan state notification nanti) */}
                {link.name === 'Saringan Aduan' && !isCollapsed && (
                  <span className="absolute right-4 w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Butang Log Keluar Berasingan di Bawah */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <button 
          onClick={handleLogout}
          title={isCollapsed ? "Log Keluar" : ""}
          className={`group flex items-center gap-3.5 py-3 px-4 rounded-2xl font-medium text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-all duration-300 w-full ${isCollapsed ? 'justify-center px-0' : ''}`}
        >
          <div className="relative">
            <LogOut className="w-5 h-5 shrink-0 transition-transform duration-300 group-hover:-translate-x-1" />
          </div>
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.span 
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="whitespace-nowrap overflow-hidden group-hover:font-bold"
              >
                Log Keluar
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;