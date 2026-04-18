import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Filter, Plus, Edit2, Trash2, X, Save, 
  Loader2, Users, ShieldAlert, HardHat, Building2, UserCircle 
} from 'lucide-react';
import { toast } from 'sonner';
import Sidebar from './Sidebar';

function UrusPengguna() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // State Carian & Tapisan
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('Semua');

  // State Modal (Tambah / Kemas Kini)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    id: '', name: '', email: '', password: '', peranan: 'komuniti', no_telefon: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }

    const fetchUsers = async () => {
      try {
        // Dapatkan data admin yang sedang login
        const userRes = await axios.get('http://localhost:8000/api/user', { headers: { Authorization: `Bearer ${token}` } });
        setUserData(userRes.data);

        // Halang akses jika bukan pentadbir
        if (userRes.data.peranan !== 'pentadbir') {
          navigate('/dashboard'); return;
        }

        // Tarik senarai semua pengguna
        const res = await axios.get('http://localhost:8000/api/admin/users', { headers: { Authorization: `Bearer ${token}` } });
        setUsersList(res.data);
      } catch (error) {
        toast.error('Gagal memuat turun data pengguna.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, [navigate]);

  // Menguruskan Rupa Lencana Peranan (Role Badges)
  const getRoleBadge = (peranan) => {
    switch (peranan) {
      case 'pentadbir': return <span className="flex items-center gap-1.5 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold"><ShieldAlert className="w-3 h-3" /> Pentadbir</span>;
      case 'pegawai': return <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold"><Building2 className="w-3 h-3" /> Pegawai</span>;
      case 'kontraktor': return <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold"><HardHat className="w-3 h-3" /> Kontraktor</span>;
      case 'komuniti': default: return <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold"><UserCircle className="w-3 h-3" /> Komuniti</span>;
    }
  };

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditMode(true);
      setFormData({ id: user.id, name: user.name, email: user.email, password: '', peranan: user.peranan, no_telefon: user.no_telefon || '' });
    } else {
      setEditMode(false);
      setFormData({ id: '', name: '', email: '', password: '', peranan: 'komuniti', no_telefon: '' });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      if (editMode) {
        // Update Pengguna sedia ada
        const res = await axios.put(`http://localhost:8000/api/admin/users/${formData.id}`, formData, { headers: { Authorization: `Bearer ${token}` } });
        setUsersList(usersList.map(u => u.id === formData.id ? res.data.user : u));
        toast.success('Pengguna berjaya dikemaskini!');
      } else {
        // Tambah Pengguna baharu
        const res = await axios.post('http://localhost:8000/api/admin/users', formData, { headers: { Authorization: `Bearer ${token}` } });
        setUsersList([res.data.user, ...usersList]);
        toast.success('Pengguna baharu berjaya ditambah!');
      }
      setIsModalOpen(false);
    } catch (error) {
      toast.error('Ralat semasa menyimpan data.');
    } finally {
      setIsSaving(false);
    }
  };

  // Logik Tapisan
  const filteredUsers = usersList.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'Semua' || user.peranan === filterRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      <Sidebar userData={userData} />

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-8 py-5 bg-white border-b border-slate-200 sticky top-0 z-10 gap-4 shadow-sm">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Direktori Pengguna</h2>
            <p className="text-sm text-slate-500 font-medium mt-1">Urus akaun kakitangan, kontraktor dan komuniti BANDA+</p>
          </div>
          <button onClick={() => handleOpenModal()} className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-teal-200 transition-all flex items-center gap-2">
            <Plus className="w-5 h-5" /> Tambah Akaun Baru
          </button>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto p-8">
          {isLoading ? (
            <div className="flex items-center justify-center h-full"><Loader2 className="w-10 h-10 animate-spin text-teal-600" /></div>
          ) : (
            <div className="max-w-7xl mx-auto space-y-8">
              
              {/* Kad Ringkasan Statistik */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="p-3 bg-slate-100 text-slate-600 rounded-xl"><Users className="w-6 h-6" /></div>
                  <div><p className="text-xs font-bold text-slate-400 uppercase">Jumlah</p><h4 className="text-2xl font-black">{usersList.length}</h4></div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="p-3 bg-purple-100 text-purple-600 rounded-xl"><ShieldAlert className="w-6 h-6" /></div>
                  <div><p className="text-xs font-bold text-slate-400 uppercase">Pentadbir</p><h4 className="text-2xl font-black">{usersList.filter(u => u.peranan === 'pentadbir').length}</h4></div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="p-3 bg-blue-100 text-blue-600 rounded-xl"><Building2 className="w-6 h-6" /></div>
                  <div><p className="text-xs font-bold text-slate-400 uppercase">Pegawai</p><h4 className="text-2xl font-black">{usersList.filter(u => u.peranan === 'pegawai').length}</h4></div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="p-3 bg-amber-100 text-amber-600 rounded-xl"><HardHat className="w-6 h-6" /></div>
                  <div><p className="text-xs font-bold text-slate-400 uppercase">Kontraktor</p><h4 className="text-2xl font-black">{usersList.filter(u => u.peranan === 'kontraktor').length}</h4></div>
                </div>
              </div>

              {/* Bahagian Jadual Data */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-4 justify-between items-center">
                  <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="text" placeholder="Cari nama atau emel..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-500 transition-colors" />
                  </div>
                  <div className="relative w-full sm:w-auto">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} className="w-full sm:w-auto pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-teal-500 appearance-none font-medium text-slate-700 cursor-pointer">
                      <option value="Semua">Semua Peranan</option>
                      <option value="pentadbir">Pentadbir</option>
                      <option value="pegawai">Pegawai Jabatan</option>
                      <option value="kontraktor">Kontraktor</option>
                      <option value="komuniti">Komuniti Awam</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-white border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                        <th className="p-5">Profil Pengguna</th>
                        <th className="p-5">Hubungan</th>
                        <th className="p-5">Peranan (Akses)</th>
                        <th className="p-5">Tarikh Daftar</th>
                        <th className="p-5 text-right">Tindakan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredUsers.map(user => (
                        <tr key={user.id} className="hover:bg-slate-50/80 transition-colors group">
                          <td className="p-5">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-teal-100 to-teal-50 flex items-center justify-center text-teal-700 font-bold border border-teal-200 uppercase">
                                {user.name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-bold text-slate-900">{user.name}</p>
                                <p className="text-xs text-slate-500 font-medium">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-5 font-medium text-sm text-slate-600">{user.no_telefon || '-'}</td>
                          <td className="p-5">{getRoleBadge(user.peranan)}</td>
                          <td className="p-5 text-sm text-slate-500">{new Date(user.created_at).toLocaleDateString('ms-MY')}</td>
                          <td className="p-5 text-right">
                            <button onClick={() => handleOpenModal(user)} className="text-slate-400 hover:text-teal-600 p-2 bg-white hover:bg-teal-50 rounded-lg transition-colors border border-transparent hover:border-teal-100">
                              <Edit2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {filteredUsers.length === 0 && (
                        <tr><td colSpan="5" className="p-12 text-center text-slate-400 font-medium flex flex-col items-center"><Users className="w-12 h-12 mb-3 opacity-20" /> Tiada pengguna dijumpai.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Modal Tambah / Kemaskini Pengguna */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
              <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col">
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                  <h3 className="text-lg font-black text-slate-900">{editMode ? 'Kemas Kini Profil' : 'Daftar Pengguna Baharu'}</h3>
                  <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:bg-slate-200 p-1.5 rounded-full transition-colors"><X className="w-5 h-5" /></button>
                </div>
                
                <form onSubmit={handleSave} className="p-6 space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-600 uppercase ml-1">Nama Penuh</label>
                    <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full mt-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-teal-500 outline-none transition-colors" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-600 uppercase ml-1">Alamat Emel</label>
                      <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full mt-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-teal-500 outline-none transition-colors" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-600 uppercase ml-1">No Telefon</label>
                      <input type="text" value={formData.no_telefon} onChange={(e) => setFormData({...formData, no_telefon: e.target.value})} className="w-full mt-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-teal-500 outline-none transition-colors" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 uppercase ml-1">Tetapan Peranan Sistem</label>
                    <select value={formData.peranan} onChange={(e) => setFormData({...formData, peranan: e.target.value})} className="w-full mt-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-teal-500 outline-none font-bold text-slate-700 transition-colors">
                      <option value="komuniti">Komuniti (Pengguna Biasa)</option>
                      <option value="kontraktor">Kontraktor (Akses Arahan Kerja)</option>
                      <option value="pegawai">Pegawai Jabatan (Akses Bajet)</option>
                      <option value="pentadbir">Pentadbir Sistem (Akses Penuh)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 uppercase ml-1">Katalaluan {editMode && <span className="text-slate-400 normal-case font-normal">(Biar kosong jika tidak mahu tukar)</span>}</label>
                    <input type="password" required={!editMode} value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} placeholder="********" className="w-full mt-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-teal-500 outline-none transition-colors" />
                  </div>

                  <div className="pt-4 mt-6 border-t border-slate-100 flex gap-3">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors">Batal</button>
                    <button type="submit" disabled={isSaving} className="flex-[2] py-3.5 px-4 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl transition-all shadow-md flex justify-center items-center gap-2">
                      {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} Simpan Rekod
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}

export default UrusPengguna;