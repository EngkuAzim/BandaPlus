import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, FilePlus, History, LogOut, Settings, Users, ClipboardList, Map } from 'lucide-react';

const Sidebar = ({ userData }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Default to komuniti if role is missing
  const role = userData?.peranan || 'komuniti';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  // Define navigation links based on the user's role
  const navigationConfig = {
    komuniti: [
      { name: 'Utama', path: '/dashboard', icon: Home },
      { name: 'Lapor Aduan', path: '/lapor-aduan', icon: FilePlus },
      { name: 'Sejarah Aduan', path: '/sejarah', icon: History },
    ],
    pentadbir: [
      { name: 'Utama', path: '/dashboard', icon: Home },
      { name: 'Pengurusan Aduan', path: '/urus-aduan', icon: ClipboardList },
      { name: 'Pengguna Sistem', path: '/pengguna', icon: Users },
      { name: 'Tetapan', path: '/tetapan', icon: Settings },
    ],
    pegawai: [
      { name: 'Utama', path: '/dashboard', icon: Home },
      { name: 'Tugasan Semasa', path: '/tugasan', icon: Map },
      { name: 'Laporan Siasatan', path: '/siasatan', icon: ClipboardList },
    ],
    kontraktor: [
      { name: 'Utama', path: '/dashboard', icon: Home },
      { name: 'Kerja Pembaikan', path: '/pembaikan', icon: ClipboardList },
      { name: 'Sejarah Kerja', path: '/sejarah-kerja', icon: History },
    ]
  };

  // Get the specific links for the current user's role
  const currentLinks = navigationConfig[role] || navigationConfig.komuniti;

  return (
    <aside className="w-64 bg-blue-950 shadow-xl border-r border-blue-900 flex flex-col h-full">
      <div className="p-8">
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white/10 backdrop-blur-md rounded-lg flex items-center justify-center text-white text-sm border border-white/20">🏛️</div>
          <span className="text-2xl font-black text-white tracking-tight">BANDA<span className="text-cyan-400">+</span></span>
        </Link>
        <p className="text-sm text-blue-300 mt-2 font-medium px-1 capitalize">
          {role} Ampang
        </p>
      </div>
      
      <nav className="mt-4 flex-1">
        {currentLinks.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path;

          return (
            <Link
              key={link.name}
              to={link.path}
              className={`flex items-center gap-3 px-8 py-4 font-medium transition-all ${
                isActive 
                  ? 'bg-blue-900/50 text-cyan-400 font-bold border-r-4 border-cyan-400' 
                  : 'text-blue-300 hover:bg-blue-900/30 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              {link.name}
            </Link>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-6 border-t border-blue-900/50">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 text-blue-300 hover:text-rose-400 transition-colors font-medium w-full px-2"
        >
          <LogOut className="w-5 h-5" />
          Log Keluar
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;