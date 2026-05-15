import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Plus, Trash2, ToggleLeft, ToggleRight, Hospital,
  Shield, GraduationCap, Flame, HelpCircle, Loader2, Search,
  X, CheckCircle, AlertCircle, Info
} from 'lucide-react';
import { toast } from 'sonner';
import Sidebar from './Sidebar';

const API = `${import.meta.env.VITE_API_URL}`;

const KATEGORI_CONFIG = {
  hospital:    { label: 'Hospital',     icon: Hospital,       color: '#ef4444', bg: 'bg-red-100',    text: 'text-red-700',    border: 'border-red-300' },
  balai_polis: { label: 'Balai Polis',  icon: Shield,         color: '#3b82f6', bg: 'bg-blue-100',   text: 'text-blue-700',   border: 'border-blue-300' },
  sekolah:     { label: 'Sekolah',      icon: GraduationCap,  color: '#8b5cf6', bg: 'bg-violet-100', text: 'text-violet-700', border: 'border-violet-300' },
  bomba:       { label: 'Bomba',        icon: Flame,          color: '#f97316', bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300' },
  lain:        { label: 'Lain-lain',    icon: HelpCircle,     color: '#6b7280', bg: 'bg-slate-100',  text: 'text-slate-700',  border: 'border-slate-300' },
};

const SLA_RADIUS = { inner: 500, outer: 1500 };

function UrusPOI() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [pois, setPois] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nama: '', kategori: 'hospital', lat: '', lng: '', preview: '' });
  const [isSaving, setIsSaving] = useState(false);

  // Mapbox geocoder search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeout = useRef(null);

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  // ─── Fetch ──────────────────────────────────────────────────────────────────
  const fetchPois = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/admin/pois`, { headers });
      setPois(res.data);
    } catch (e) {
      toast.error('Gagal memuatkan senarai POI.');
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        const userRes = await axios.get(`${API}/user`, { headers });
        setUserData(userRes.data);
        if (userRes.data.peranan !== 'pentadbir') {
          navigate('/dashboard');
          return;
        }
        await fetchPois();
      } catch {
        navigate('/login');
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  // ─── Geocoder Search (Nominatim - Free, No Key) ─────────────────────────────
  const handleSearch = (query) => {
    setSearchQuery(query);
    clearTimeout(searchTimeout.current);
    if (query.length < 3) { setSearchResults([]); return; }
    setIsSearching(true);
    searchTimeout.current = setTimeout(async () => {
      try {
        const res = await axios.get(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&countrycodes=my`,
          { headers: { 'Accept-Language': 'ms' } }
        );
        setSearchResults(res.data);
      } catch {
        toast.error('Carian gagal.');
      } finally {
        setIsSearching(false);
      }
    }, 600);
  };

  const selectResult = (result) => {
    setForm(prev => ({
      ...prev,
      nama: result.display_name.split(',')[0],
      lat: parseFloat(result.lat).toFixed(7),
      lng: parseFloat(result.lon).toFixed(7),
      preview: result.display_name,
    }));
    setSearchQuery('');
    setSearchResults([]);
    toast.success(`Lokasi dijumpai: ${result.display_name.split(',')[0]}`);
  };

  // ─── CRUD ────────────────────────────────────────────────────────────────────
  const handleStore = async (e) => {
    e.preventDefault();
    if (!form.lat || !form.lng) {
      toast.error('Sila cari dan pilih lokasi dahulu.');
      return;
    }
    setIsSaving(true);
    try {
      await axios.post(`${API}/admin/pois`, {
        nama: form.nama,
        kategori: form.kategori,
        lat: form.lat,
        lng: form.lng,
      }, { headers });
      toast.success(`POI "${form.nama}" berjaya ditambah!`);
      setForm({ nama: '', kategori: 'hospital', lat: '', lng: '', preview: '' });
      setShowForm(false);
      await fetchPois();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan POI.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle = async (poi) => {
    try {
      await axios.patch(`${API}/admin/pois/${poi.id}/toggle`, {}, { headers });
      toast.success(`"${poi.nama}" ${poi.is_aktif ? 'dinyahaktifkan' : 'diaktifkan'}.`);
      await fetchPois();
    } catch {
      toast.error('Gagal mengubah status.');
    }
  };

  const handleDelete = async (poi) => {
    if (!window.confirm(`Padam POI "${poi.nama}" secara kekal?`)) return;
    try {
      await axios.delete(`${API}/admin/pois/${poi.id}`, { headers });
      toast.success(`"${poi.nama}" berjaya dipadam.`);
      await fetchPois();
    } catch {
      toast.error('Gagal memadam POI.');
    }
  };

  // ─── Helpers ─────────────────────────────────────────────────────────────────
  const grouped = Object.keys(KATEGORI_CONFIG).reduce((acc, kat) => {
    acc[kat] = pois.filter(p => p.kategori === kat);
    return acc;
  }, {});

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <Loader2 className="w-10 h-10 text-violet-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-950 text-white font-sans">
      <Sidebar userData={userData} />

      <main className="flex-1 ml-64 p-8 overflow-y-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-white flex items-center gap-3">
              <MapPin className="w-8 h-8 text-violet-400" />
              Pengurusan Titik Kepentingan (POI)
            </h1>
            <p className="text-slate-400 mt-1">
              POI aktif digunakan secara langsung oleh algoritma <span className="text-violet-400 font-semibold">S_Lokasi</span> untuk mengira skor keutamaan aduan.
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-500 rounded-xl font-bold shadow-lg transition-colors"
          >
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showForm ? 'Batal' : 'Tambah POI Baharu'}
          </motion.button>
        </motion.div>

        {/* SLA Info Banner */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          className="mb-6 p-4 bg-violet-950/50 border border-violet-800/60 rounded-2xl flex items-start gap-3">
          <Info className="w-5 h-5 text-violet-400 mt-0.5 shrink-0" />
          <div className="text-sm text-slate-300">
            <span className="font-bold text-violet-300">Bagaimana POI Mempengaruhi Skor?</span>
            {' '}Aduan dalam radius <span className="font-bold text-green-400">&lt;= {SLA_RADIUS.inner}m</span> dari POI aktif mendapat <strong>S_Lokasi = 100</strong>.
            Radius <span className="font-bold text-yellow-400">&lt;= {SLA_RADIUS.outer}m</span> mendapat <strong>S_Lokasi = 70</strong>. Lebih jauh mendapat <strong>S_Lokasi = 40</strong>.
          </div>
        </motion.div>

        {/* Add Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-6">
                <h2 className="text-lg font-bold text-white mb-4">Tambah POI Baharu</h2>
                <form onSubmit={handleStore} className="space-y-4">
                  {/* Search */}
                  <div className="relative">
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                      Cari Lokasi
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        placeholder="Taip nama tempat... contoh: Hospital Ampang"
                        className="w-full pl-9 pr-4 py-2.5 bg-slate-800 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
                      />
                      {isSearching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-400 animate-spin" />}
                    </div>
                    {/* Search Results Dropdown */}
                    <AnimatePresence>
                      {searchResults.length > 0 && (
                        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                          className="absolute z-50 top-full mt-1 w-full bg-slate-800 border border-slate-600 rounded-xl overflow-hidden shadow-2xl">
                          {searchResults.map((r, i) => (
                            <button key={i} type="button" onClick={() => selectResult(r)}
                              className="w-full text-left px-4 py-3 hover:bg-slate-700 transition-colors border-b border-slate-700 last:border-0">
                              <p className="text-sm font-semibold text-white">{r.display_name.split(',')[0]}</p>
                              <p className="text-xs text-slate-400 truncate">{r.display_name}</p>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Preview selected location */}
                  {form.preview && (
                    <div className="p-3 bg-green-950/40 border border-green-700/50 rounded-xl flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
                      <div>
                        <p className="text-xs text-green-300 font-semibold">{form.preview.split(',')[0]}</p>
                        <p className="text-xs text-slate-400">Lat: {form.lat}, Lng: {form.lng}</p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    {/* Nama */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                        Nama POI <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text" required
                        value={form.nama}
                        onChange={(e) => setForm(p => ({ ...p, nama: e.target.value }))}
                        placeholder="cth: Hospital Ampang"
                        className="w-full px-3 py-2.5 bg-slate-800 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
                      />
                    </div>
                    {/* Kategori */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                        Kategori <span className="text-red-400">*</span>
                      </label>
                      <select
                        value={form.kategori}
                        onChange={(e) => setForm(p => ({ ...p, kategori: e.target.value }))}
                        className="w-full px-3 py-2.5 bg-slate-800 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-violet-500 transition-colors"
                      >
                        {Object.entries(KATEGORI_CONFIG).map(([key, val]) => (
                          <option key={key} value={key}>{val.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Manual Coordinates (readonly, filled by geocoder) */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Latitud</label>
                      <input type="number" step="any" value={form.lat}
                        onChange={(e) => setForm(p => ({ ...p, lat: e.target.value }))}
                        placeholder="cth: 3.1280000"
                        className="w-full px-3 py-2.5 bg-slate-800/50 border border-slate-600 rounded-xl text-slate-300 placeholder-slate-600 focus:outline-none focus:border-violet-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Longitud</label>
                      <input type="number" step="any" value={form.lng}
                        onChange={(e) => setForm(p => ({ ...p, lng: e.target.value }))}
                        placeholder="cth: 101.7630000"
                        className="w-full px-3 py-2.5 bg-slate-800/50 border border-slate-600 rounded-xl text-slate-300 placeholder-slate-600 focus:outline-none focus:border-violet-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <motion.button type="submit" disabled={isSaving}
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      className="flex items-center gap-2 px-6 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-60 rounded-xl font-bold transition-colors">
                      {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                      Simpan POI
                    </motion.button>
                    <button type="button" onClick={() => setShowForm(false)}
                      className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-xl font-medium transition-colors">
                      Batal
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats Bar */}
        <div className="grid grid-cols-5 gap-3 mb-6">
          {Object.entries(KATEGORI_CONFIG).map(([key, cfg]) => {
            const Icon = cfg.icon;
            const count = grouped[key]?.length || 0;
            const active = grouped[key]?.filter(p => p.is_aktif).length || 0;
            return (
              <motion.div key={key} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900 border border-slate-700/50 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="w-4 h-4" style={{ color: cfg.color }} />
                  <span className="text-xs text-slate-400 font-semibold">{cfg.label}</span>
                </div>
                <p className="text-2xl font-black" style={{ color: cfg.color }}>{count}</p>
                <p className="text-xs text-slate-500">{active} aktif</p>
              </motion.div>
            );
          })}
        </div>

        {/* POI List — grouped by kategori */}
        <div className="space-y-6">
          {Object.entries(KATEGORI_CONFIG).map(([key, cfg]) => {
            const list = grouped[key] || [];
            if (list.length === 0) return null;
            const Icon = cfg.icon;
            return (
              <motion.section key={key} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="flex items-center gap-2 mb-3">
                  <div className={`p-1.5 rounded-lg ${cfg.bg}`}>
                    <Icon className={`w-4 h-4 ${cfg.text}`} />
                  </div>
                  <h3 className="font-bold text-white">{cfg.label}</h3>
                  <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">{list.length}</span>
                </div>
                <div className="grid gap-3">
                  {list.map((poi) => (
                    <motion.div key={poi.id}
                      layout
                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                      className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                        poi.is_aktif
                          ? 'bg-slate-900 border-slate-700/50'
                          : 'bg-slate-950 border-slate-800/50 opacity-60'
                      }`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${poi.is_aktif ? 'bg-green-400' : 'bg-slate-600'}`} />
                        <div>
                          <p className="font-semibold text-white">{poi.nama}</p>
                          <p className="text-xs text-slate-500">
                            {parseFloat(poi.lat).toFixed(5)}, {parseFloat(poi.lng).toFixed(5)}
                            {' · '}
                            <span className={poi.is_aktif ? 'text-green-400' : 'text-slate-500'}>
                              {poi.is_aktif ? 'Aktif — Digunakan dalam analitik' : 'Tidak Aktif'}
                            </span>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* SLA Radius badge */}
                        {poi.is_aktif && (
                          <span className="hidden sm:flex items-center gap-1 text-xs text-violet-300 bg-violet-950/50 border border-violet-800/40 px-2 py-1 rounded-lg">
                            <AlertCircle className="w-3 h-3" />
                            R: {SLA_RADIUS.inner}m / {SLA_RADIUS.outer}m
                          </span>
                        )}
                        {/* Toggle */}
                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                          onClick={() => handleToggle(poi)}
                          title={poi.is_aktif ? 'Nyahaktifkan' : 'Aktifkan'}
                          className={`p-2 rounded-lg transition-colors ${poi.is_aktif ? 'text-green-400 hover:bg-green-950/40' : 'text-slate-500 hover:bg-slate-800'}`}>
                          {poi.is_aktif ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                        </motion.button>
                        {/* Delete */}
                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                          onClick={() => handleDelete(poi)}
                          title="Padam"
                          className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.section>
            );
          })}

          {pois.length === 0 && !isLoading && (
            <div className="text-center py-16 text-slate-600">
              <MapPin className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-semibold">Tiada POI didaftarkan lagi.</p>
              <p className="text-sm mt-1">Klik "Tambah POI Baharu" untuk mula.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default UrusPOI;
