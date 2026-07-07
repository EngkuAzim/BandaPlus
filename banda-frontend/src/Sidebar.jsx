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
  Camera,
  LayoutDashboard,
  ShieldAlert,
  Search,
  MapPin,
  FileText
} from 'lucide-react';
import NotificationBell from './components/NotificationBell';
import bandaLogoFull from './assets/banda-logo-full.png';
import bandaLogoIcon from './assets/banda-logo-icon.png';

const Sidebar = ({ userData }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const role = userData?.peranan || localStorage.getItem('userRole') || 'komuniti';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  // Konfigurasi Navigasi Lengkap Berdasarkan 4 Peranan BANDA+
  const navigationConfig = {
    komuniti: [
      { name: 'Dashboard', path: '/dashboard', icon: Home },
      { name: 'Submit Report', path: '/lapor-aduan', icon: FilePlus },
      { name: 'Report History', path: '/sejarah', icon: History },
      { name: 'My Profile', path: '/profil', icon: UserCircle },
    ],
    pentadbir: [
      { name: 'Dashboard', path: '/dashboard', icon: Home },
      { name: 'Review & Assign', path: '/urus-aduan', icon: Search },
      { name: 'User Management', path: '/urus-pengguna', icon: Users },
      { name: 'AI Cluster Map', path: '/peta-kluster', icon: Map },
      { name: 'Performance Report', path: '/laporan-prestasi', icon: FileText },
      { name: 'System Settings', path: '/tetapan', icon: Settings },
    ],
    pegawai: [
      { name: 'Dashboard', path: '/dashboard', icon: Home },
      { name: 'Work Orders', path: '/arahan-kerja', icon: Building2 },
      { name: 'Task Reports', path: '/laporan-tugasan', icon: ClipboardList },
      { name: 'Budget Log', path: '/bajet', icon: Wallet },
    ],
    kontraktor: [
      { name: 'Dashboard', path: '/dashboard', icon: Home },
      { name: 'Job Management', path: '/pembaikan', icon: HardHat },
    ]
  };

  const currentLinks = navigationConfig[role] || navigationConfig.komuniti;

  // Konfigurasi Fizik Framer Motion untuk pergerakan lebih "smooth"
  const springConfig = { type: "spring", stiffness: 300, damping: 26 };

  return (
    <>
      {/* Desktop Sidebar (Hidden on Mobile) */}
      <motion.aside 
        animate={{ width: isCollapsed ? 84 : 290 }}
        transition={springConfig}
        className="hidden md:flex bg-white shadow-[10px_0_40px_-15px_rgba(0,0,0,0.05)] border-r border-slate-100 flex-col h-full relative z-40 selection:bg-blue-800/20 shrink-0"
      >
        {/* Butang Lipat Sidebar (Desktop Sahaja) */}
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3.5 top-10 bg-white border border-slate-200 shadow-md rounded-full p-1.5 text-slate-400 hover:text-blue-800 hover:border-blue-200 transition-colors z-50 flex items-center justify-center"
      >
        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </motion.button>

      {/* Brand Logo & Peranan */}
      <div className={`pt-8 pb-6 px-6 flex items-center ${isCollapsed ? 'justify-center px-0' : 'gap-3'} transition-all duration-300 relative overflow-hidden`}>
        {/* Latar Belakang Abstrak Halus di bawah Logo */}
        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-blue-50/50 to-transparent -z-10"></div>
        
        {isCollapsed ? (
          <img src={bandaLogoIcon} alt="BANDA+ Icon" className="w-10 h-10 object-contain shrink-0" />
        ) : (
          <AnimatePresence mode="wait">
            <motion.div 
              initial={{ opacity: 0, x: -10 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col overflow-hidden"
            >
              <img src={bandaLogoFull} alt="BANDA+ Logo" className="h-10 object-contain mb-1" />
              <p className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] pl-1">{role}</p>
            </motion.div>
          </AnimatePresence>
        )}

        <div className={`transition-all duration-300 ${isCollapsed ? 'hidden' : 'ml-auto'}`}>
          <NotificationBell />
        </div>
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
                  className="absolute inset-0 bg-blue-50 rounded-2xl"
                  transition={springConfig}
                />
              )}

              <div className={`relative flex items-center gap-3.5 py-3.5 px-4 rounded-2xl font-medium transition-all duration-200 z-10 ${
                isActive 
                  ? 'text-blue-900 font-bold' 
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              } ${isCollapsed ? 'justify-center px-0' : ''}`}>
                
                <Icon className={`w-5 h-5 shrink-0 transition-all duration-300 ${
                  isActive ? 'text-blue-800 stroke-[2.5px]' : 'text-slate-400 group-hover:text-slate-600'
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
                {link.path === '/urus-aduan' && !isCollapsed && (
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
          title={isCollapsed ? "Log Out" : ""}
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
                Log Out
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>

    {/* Mobile Bottom Navigation (Visible only on Mobile) */}
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-between items-center px-6 py-3 z-[100] shadow-[0_-10px_40px_rgba(0,0,0,0.05)] pb-[env(safe-area-inset-bottom)]">
      {currentLinks.map((link) => {
        const Icon = link.icon;
        const isActive = location.pathname === link.path;
        return (
          <Link key={link.name} to={link.path} className="flex flex-col items-center gap-1 relative">
            {isActive && (
              <motion.div layoutId="mobileActiveIndicator" className="absolute -top-3 w-1.5 h-1.5 rounded-full bg-amber-500" />
            )}
            <Icon className={`w-6 h-6 transition-all duration-300 ${isActive ? 'text-blue-800 stroke-[2.5px]' : 'text-slate-400'}`} />
            <span className={`text-[10px] font-bold ${isActive ? 'text-blue-900' : 'text-slate-500'}`}>{link.name.split(' ')[0]}</span>
          </Link>
        );
      })}
      
      {/* Mobile Logout */}
      <button onClick={handleLogout} className="flex flex-col items-center gap-1">
        <LogOut className="w-6 h-6 text-slate-400" />
        <span className="text-[10px] font-bold text-slate-500">Log Out</span>
      </button>
    </div>
    </>
  );
};

export default Sidebar;