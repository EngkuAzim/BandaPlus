import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FilePlus, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';
import Sidebar from './Sidebar'; // Import the new component!

function Dashboard() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState(null);

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  const initial = userData?.name ? userData.name.charAt(0).toUpperCase() : 'A';

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      
      {/* Our New Reusable Component! */}
      <Sidebar userData={userData} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Top Header */}
        <header className="flex items-center justify-between px-8 py-5 bg-white border-b border-gray-200 shadow-sm z-10">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Papan Pemuka</h2>
            <p className="text-sm text-slate-500 font-medium">
              Selamat datang kembali, <span className="font-bold text-slate-700">{userData?.name || 'Pengguna'}</span>
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-700 font-bold border border-cyan-200">
              {initial}
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-8">
          
          {/* Status Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center gap-5">
              <div className="w-14 h-14 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-600">
                <AlertCircle className="w-7 h-7" />
              </div>
              <div>
                <p className="text-slate-500 font-medium text-sm">Aduan Baru</p>
                <h4 className="text-3xl font-black text-slate-800">2</h4>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center gap-5">
              <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                <Clock className="w-7 h-7" />
              </div>
              <div>
                <p className="text-slate-500 font-medium text-sm">Sedang Diproses</p>
                <h4 className="text-3xl font-black text-slate-800">1</h4>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center gap-5">
              <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <p className="text-slate-500 font-medium text-sm">Selesai</p>
                <h4 className="text-3xl font-black text-slate-800">5</h4>
              </div>
            </div>
          </div>

          {/* Main Action Area */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-800">Tindakan Pantas</h3>
            </div>
            <div className="p-10 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                <FilePlus className="w-10 h-10 text-cyan-500" />
              </div>
              <h4 className="text-xl font-bold text-slate-800 mb-2">Lapor Kerosakan Infrastruktur</h4>
              <p className="text-slate-500 max-w-md mb-6">
                Muat naik gambar kerosakan jalan, lampu jalan, atau kemudahan awam. Sistem AI BANDA+ akan mengklasifikasikan aduan anda secara automatik.
              </p>
              <button className="bg-blue-950 hover:bg-cyan-600 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg hover:shadow-cyan-500/30 flex items-center gap-2">
                <FilePlus className="w-5 h-5" />
                Mula Lapor Aduan
              </button>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}

export default Dashboard;