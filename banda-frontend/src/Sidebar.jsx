import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, FilePlus, History, LogOut, Settings, Users, ClipboardList, Map, ChevronLeft, ChevronRight, Bell, UserCircle } from 'lucide-react';
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

  // Navigation config based on roles
  const navigationConfig = {
    komuniti: [
    { name: 'Utama', path: '/dashboard', icon: Home },
    { name: 'Lapor Aduan', path: '/lapor-aduan', icon: FilePlus },
    { name: 'Sejarah Aduan', path: '/sejarah', icon: History },
    { name: 'Profil Saya', path: '/profil', icon: UserCircle }, // <--- Add this line!
  ],
    kontraktor: [
      { name: 'Utama', path: '/dashboard', icon: Home },
      { name: 'Kerja Pembaikan', path: '/pembaikan', icon: ClipboardList },
      { name: 'Sejarah Kerja', path: '/sejarah-kerja', icon: History },
    ],
    pentadbir: [
      { name: 'Utama', path: '/dashboard', icon: Home },
      { name: 'Urus Aduan', path: '/urus-aduan', icon: ClipboardList },
      { name: 'Pengguna', path: '/pengguna', icon: Users },
      { name: 'Tetapan', path: '/tetapan', icon: Settings },
    ]
  };

  const currentLinks = navigationConfig[role] || navigationConfig.komuniti;

  return (
    <motion.aside 
      animate={{ width: isCollapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="bg-white shadow-lg border-r border-slate-200 flex flex-col h-full relative z-20"
    >
      {/* Collapse Toggle */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-8 bg-white border border-slate-200 shadow-sm rounded-full p-1 text-slate-500 hover:text-teal-600 transition-colors z-50"
      >
        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      {/* Brand Logo */}
      <div className={`p-6 flex items-center ${isCollapsed ? 'justify-center px-0' : 'gap-3'} transition-all`}>
        <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white text-sm shadow-md shrink-0">
          🏛️
        </div>
        {!isCollapsed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="whitespace-nowrap overflow-hidden">
            <span className="text-2xl font-black text-slate-900 tracking-tight">BANDA<span className="text-teal-600">+</span></span>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{role}</p>
          </motion.div>
        )}
      </div>
      
      {/* Navigation Links */}
      <nav className="mt-4 flex-1 flex flex-col gap-1 px-3">
        {currentLinks.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path;

          return (
            <Link
              key={link.name}
              to={link.path}
              title={isCollapsed ? link.name : ""}
              className={`flex items-center gap-3 py-3 px-3 rounded-xl font-medium transition-all ${
                isActive 
                  ? 'bg-teal-50 text-teal-700 shadow-sm' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-teal-600'
              } ${isCollapsed ? 'justify-center' : ''}`}
            >
              <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-teal-600' : 'text-slate-400'}`} />
              {!isCollapsed && <span className="whitespace-nowrap">{link.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Sidebar Footer / Logout */}
      <div className="p-4 border-t border-slate-100">
        <button 
          onClick={handleLogout}
          title={isCollapsed ? "Log Keluar" : ""}
          className={`flex items-center gap-3 py-3 px-3 rounded-xl font-medium text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors w-full ${isCollapsed ? 'justify-center' : ''}`}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!isCollapsed && <span className="whitespace-nowrap">Log Keluar</span>}
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;