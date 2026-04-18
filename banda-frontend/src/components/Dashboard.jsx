import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Calendar, Bell, Loader2 } from 'lucide-react';
import Sidebar from '../Sidebar';

// Import komponen dashboard khusus
import UserDashboard from './UserDashboard';
import AdminDashboard from './AdminDashboard';
import PegawaiDashboard from './PegawaiDashboard';    
import KontraktorDashboard from './KontraktorDashboard';

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
        const userRes = await axios.get('http://localhost:8000/api/user', { headers: { Authorization: `Bearer ${token}` } });
        const user = userRes.data;
        setUserData(user);

        const statsUrl = (user.peranan === 'pentadbir' || user.peranan === 'pegawai') 
          ? 'http://localhost:8000/api/admin/dashboard/stats' 
          : 'http://localhost:8000/api/dashboard/stats';

        const statsRes = await axios.get(statsUrl, { headers: { Authorization: `Bearer ${token}` } });
        setStats(statsRes.data);
        
      } catch (error) {
        if (error.response && error.response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('userRole');
          navigate('/login');
        } else {
          console.error("Gagal mendapatkan data dashboard:", error);
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [navigate]);

  if (isLoading || !userData) {
    return (
      <div className="flex h-screen bg-slate-50 items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-teal-600" />
      </div>
    );
  }

  const formattedDate = currentTime.toLocaleDateString('ms-MY', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const initial = userData?.name ? userData.name.charAt(0).toUpperCase() : 'A';

  // Logik Penentuan Paparan Berdasarkan Peranan
  const renderDashboardContent = () => {
    switch (userData.peranan) {
      case 'pentadbir':
        return <AdminDashboard userData={userData} stats={stats} />;
      case 'pegawai':
        return <PegawaiDashboard userData={userData} stats={stats} />;
      case 'kontraktor':
        return <KontraktorDashboard userData={userData} stats={stats} />;

      case 'komuniti':
      default:
        // Panggil fail UserDashboard.jsx dan berikan data kepadanya
        return <UserDashboard userData={userData} stats={stats} />;
    }
  };

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
          {renderDashboardContent()}
        </main>
      </div>
    </div>
  );
}

export default Dashboard;