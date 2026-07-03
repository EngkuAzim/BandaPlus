import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Settings, Save, BrainCircuit, Map, Bell, 
  ShieldCheck, Loader2, Server, Power
} from 'lucide-react';
import { toast } from 'sonner';
import Sidebar from './Sidebar';
import axios from 'axios';

function TetapanSistem() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // State untuk nilai tetapan (Boleh disambung ke Database kelak)
  const [form, setForm] = useState({
    aiAktif: true,
    aiTahapKeyakinan: 70, // 70% confidence score YOLOv8
    klusterRadius: 20,    // 20 meter radius
    geoFencingRadius: 50, // 50 meter radius kontraktor
    notifikasiAktif: true,
    modPenyelenggaraan: false
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }

    const verifyAdmin = async () => {
      try {
        const res = await axios.get(`/api/user`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.data.peranan !== 'pentadbir') {
          navigate('/dashboard');
        } else {
          setUserData(res.data);
          // Di sini anda boleh buat panggilan API untuk GET tetapan dari database nanti
          // const settingsRes = await axios.get('/api/admin/settings');
          // setForm(settingsRes.data);
        }
      } catch (error) {
        navigate('/login');
      } finally {
        setIsLoading(false);
      }
    };
    verifyAdmin();
  }, [navigate]);

  const handleSave = async () => {
    setIsSaving(true);
    // Simulasi kelewatan menyimpan data
    setTimeout(() => {
      setIsSaving(false);
      toast.success('Settings Saved Successfully!', {
        description: 'BANDA+ system parameters have been updated.'
      });
    }, 1000);

    // Kod sebenar apabila API Backend siap:
    // try {
    //   await axios.put(`/api/admin/settings`, form, { headers: { Authorization: `Bearer ${token}` } });
    // } catch (err) { ... }
  };

  // Komponen Butang Toggle Switch
  const ToggleSwitch = ({ checked, onChange }) => (
    <button 
      type="button"
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 ${checked ? 'bg-teal-600' : 'bg-slate-200'}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center bg-slate-50"><Loader2 className="w-10 h-10 animate-spin text-teal-600" /></div>;
  }

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      <Sidebar userData={userData} />

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <header className="flex items-center justify-between px-8 py-5 bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">System Settings</h2>
            <p className="text-sm text-slate-500 font-medium mt-1">Configure AI parameters and BANDA+ geo-spatial rules</p>
          </div>
          <button 
            onClick={handleSave} 
            disabled={isSaving}
            className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-teal-200 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Configuration
          </button>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto p-8">
          <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-5xl mx-auto space-y-6">
            
            {/* PANEL 1: AI SMART VISION (YOLOv8) */}
            <motion.section variants={itemVariants} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
                <BrainCircuit className="w-5 h-5 text-teal-600" />
                <h3 className="font-bold text-slate-800">Smart Vision Engine (YOLOv8)</h3>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Enable Automatic AI Detection</h4>
                    <p className="text-xs text-slate-500 mt-1">Use YOLOv8 model to automatically analyze complaint photos before admin screening.</p>
                  </div>
                  <ToggleSwitch checked={form.aiAktif} onChange={() => setForm({...form, aiAktif: !form.aiAktif})} />
                </div>
                
                <div className="pt-4 border-t border-slate-100">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-bold text-slate-900">Confidence Score Threshold</label>
                    <span className="text-sm font-black text-teal-600 bg-teal-50 px-3 py-1 rounded-lg">{form.aiTahapKeyakinan}%</span>
                  </div>
                  <p className="text-xs text-slate-500 mb-4">Complaint images scoring below this threshold will be flagged as 'Low Priority' or 'Unclear'.</p>
                  <input 
                    type="range" min="50" max="95" step="5"
                    value={form.aiTahapKeyakinan} 
                    onChange={(e) => setForm({...form, aiTahapKeyakinan: Number(e.target.value)})}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                    disabled={!form.aiAktif}
                  />
                  <div className="flex justify-between text-xs font-bold text-slate-400 mt-2">
                    <span>50% (Lenient)</span><span>95% (Strict)</span>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* PANEL 2: GEO-SPATIAL & KLUSTER */}
            <motion.section variants={itemVariants} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
                <Map className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-slate-800">Geo-Spatial Parameters</h3>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="text-sm font-bold text-slate-900">Complaint Cluster Radius (Meters)</label>
                  <p className="text-xs text-slate-500 mt-1 mb-3">Logical radius for grouping duplicate complaints under a single parent complaint.</p>
                  <div className="relative">
                    <input 
                      type="number" min="5" max="100"
                      value={form.klusterRadius} onChange={(e) => setForm({...form, klusterRadius: Number(e.target.value)})}
                      className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-teal-500 outline-none font-bold text-slate-700"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">m</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-bold text-slate-900">Contractor Geo-Fencing Validation (Meters)</label>
                  <p className="text-xs text-slate-500 mt-1 mb-3">Maximum allowed distance from the original GPS location for contractors to submit job completion proof.</p>
                  <div className="relative">
                    <input 
                      type="number" min="10" max="200"
                      value={form.geoFencingRadius} onChange={(e) => setForm({...form, geoFencingRadius: Number(e.target.value)})}
                      className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-teal-500 outline-none font-bold text-slate-700"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">m</span>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* PANEL 3: TETAPAN UMUM & KESELAMATAN */}
            <motion.section variants={itemVariants} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
                <Server className="w-5 h-5 text-slate-600" />
                <h3 className="font-bold text-slate-800">Core System Settings</h3>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Bell className="w-5 h-5" /></div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Email Notifications</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Send automated emails to community reporters when their report status changes.</p>
                    </div>
                  </div>
                  <ToggleSwitch checked={form.notifikasiAktif} onChange={() => setForm({...form, notifikasiAktif: !form.notifikasiAktif})} />
                </div>
                
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-rose-50 text-rose-600 rounded-lg"><Power className="w-5 h-5" /></div>
                    <div>
                      <h4 className="text-sm font-bold text-rose-600">Maintenance Mode</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Temporarily restrict external user access. Only MPAJ admins can log in.</p>
                    </div>
                  </div>
                  <ToggleSwitch checked={form.modPenyelenggaraan} onChange={() => setForm({...form, modPenyelenggaraan: !form.modPenyelenggaraan})} />
                </div>
              </div>
            </motion.section>

          </motion.div>
        </main>
      </div>
    </div>
  );
}

export default TetapanSistem;