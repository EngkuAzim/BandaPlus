import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  // Simple protection: Check if the user is logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      // If no token is found, kick them back to login!
      navigate('/login');
    } else {
      setIsLoading(false);
      // Future step: Fetch the user's name and details from Laravel here!
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  if (isLoading) return <div className="p-10 text-center">Memuatkan...</div>;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-blue-600">BANDA+</h1>
          <p className="text-sm text-gray-500 mt-1">Komuniti</p>
        </div>
        <nav className="mt-6">
          <a href="#" className="block px-6 py-3 bg-blue-50 text-blue-700 font-medium border-r-4 border-blue-600">
            Utama
          </a>
          <a href="#" className="block px-6 py-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
            Lapor Aduan
          </a>
          <a href="#" className="block px-6 py-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
            Sejarah Aduan
          </a>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Papan Pemuka</h2>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Selamat Datang, Pengguna</span>
            <button 
              onClick={handleLogout}
              className="px-4 py-2 text-sm text-red-600 border border-red-600 rounded hover:bg-red-50 transition-colors"
            >
              Log Keluar
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <div className="bg-white rounded-lg shadow p-6 border border-gray-100">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Ringkasan Aduan Anda</h3>
            <p className="text-gray-500">
              Kawasan ini akan memaparkan status aduan terkini anda (cth: Baru, Sedang Diproses, Selesai).
            </p>
            {/* We will put the YOLOv8 form and stats here later! */}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;