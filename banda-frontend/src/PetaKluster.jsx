import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import { motion } from 'framer-motion';
import { Loader2, Map as MapIcon, BrainCircuit, AlertTriangle, Layers, Navigation, Activity } from 'lucide-react';
import Sidebar from './Sidebar';

function HeatmapLayer({ points }) {
  const map = useMap();
  useEffect(() => {
    if (!points || points.length === 0) return;
    const heat = L.heatLayer(points, {
      radius: 25,
      blur: 15,
      maxZoom: 17,
      gradient: {0.4: 'blue', 0.6: 'cyan', 0.7: 'lime', 0.8: 'yellow', 1.0: 'red'}
    }).addTo(map);

    return () => { map.removeLayer(heat); };
  }, [map, points]);
  return null;
}

// Rekaan Ikon Penanda BANDA+ Tersuai (Elakkan ralat imej default Leaflet)
const createCustomIcon = (status) => {
  let color = status === 'Baru' ? '#ef4444' : (status === 'Dalam Tindakan' ? '#f59e0b' : '#10b981');
  let pulse = status === 'Baru' ? 'animate-ping absolute inset-0 opacity-50' : 'hidden';
  
  return L.divIcon({
    className: 'custom-leaflet-icon',
    html: `
      <div class="relative flex items-center justify-center w-6 h-6">
        <div class="${pulse} rounded-full" style="background-color: ${color};"></div>
        <div class="relative z-10 w-4 h-4 rounded-full border-2 border-white shadow-md" style="background-color: ${color};"></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
  });
};

function PetaKluster() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [aduans, setAduans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Koordinat lalai: Majlis Perbandaran Ampang Jaya (MPAJ)
  const ampangJayaCenter = [3.1496, 101.7624];

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }

    const fetchMapData = async (isInitial = true) => {
      try {
        if (isInitial) setIsLoading(true);
        const userRes = await axios.get('http://localhost:8000/api/user', { headers: { Authorization: `Bearer ${token}` } });
        setUserData(userRes.data);

        if (userRes.data.peranan !== 'pentadbir') {
          navigate('/dashboard'); return;
        }

        const aduanRes = await axios.get('http://localhost:8000/api/pegawai/aduan-geo', { headers: { Authorization: `Bearer ${token}` } });
        
        // Tapis hanya aduan yang mempunyai koordinat GPS dan setel pembolehubah yang betul
        const aduanDenganGPS = aduanRes.data
          .filter(a => a.lat && a.lng)
          .map(a => ({ ...a, lon: a.lng, weight: a.skor_ai }));
        setAduans(aduanDenganGPS);

      } catch (error) {
        console.error("Gagal memuat turun data peta:", error);
      } finally {
        if (isInitial) setIsLoading(false);
      }
    };
    fetchMapData(true);
    const interval = setInterval(() => fetchMapData(false), 10000);
    return () => clearInterval(interval);
  }, [navigate]);

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      <Sidebar userData={userData} />

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-8 py-5 bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <MapIcon className="w-6 h-6 text-teal-600" /> Pemetaan Kluster AI
            </h2>
            <p className="text-sm text-slate-500 font-medium mt-1">Pemantauan taburan kerosakan fasiliti (Radius 20m)</p>
          </div>
          
          <div className="flex items-center gap-3 mt-4 sm:mt-0 bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl">
            <BrainCircuit className="w-5 h-5 text-teal-600 animate-pulse" />
            <span className="text-sm font-bold text-slate-700">Enjin Smart Vision Aktif</span>
          </div>
        </header>

        <main className="flex-1 relative flex">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-50/80 z-50 backdrop-blur-sm">
              <Loader2 className="w-12 h-12 animate-spin text-teal-600" />
            </div>
          ) : (
            <>
              {/* Bahagian Peta Kiri */}
              <div className="flex-1 h-full relative z-0">
                <MapContainer center={ampangJayaCenter} zoom={13} className="w-full h-full" zoomControl={false}>
                  {/* Menggunakan stail peta CartoDB Positron untuk rupa enterpris yang bersih */}
                  <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                  />
                  
                  {/* Heatmap Layer */}
                  <HeatmapLayer points={aduans.map(a => [a.lat, a.lon, (a.weight / 100) || 0.5])} />

                  {aduans.map(aduan => (
                    <Marker 
                      key={aduan.id} 
                      position={[aduan.lat, aduan.lon]} 
                      icon={createCustomIcon(aduan.status)}
                    >
                      <Popup className="custom-popup rounded-2xl overflow-hidden border-none shadow-xl">
                        <div className="p-1 -m-1">
                          <img 
                            src={`http://localhost:8000/storage/${aduan.gambar_bukti}`} 
                            alt="Bukti Kerosakan" 
                            className="w-full h-32 object-cover rounded-t-xl mb-2 bg-slate-100"
                            onError={(e) => e.target.src = 'https://via.placeholder.com/300x200?text=Tiada+Imej'}
                          />
                          <div className="p-2">
                            <span className="text-[10px] font-black uppercase text-teal-600 bg-teal-50 px-2 py-0.5 rounded">{aduan.status}</span>
                            <h4 className="font-bold text-slate-800 mt-2 leading-tight">{aduan.jenis}</h4>
                            <p className="text-xs text-slate-500 mt-1 line-clamp-2">Skor AI: <span className="font-bold text-teal-600">{aduan.weight}%</span></p>
                            {aduan.anak_aduan_count > 0 && (
                              <div className="mt-2 flex items-center gap-1 bg-purple-100 text-purple-700 px-2 py-1 rounded text-[10px] font-bold">
                                <Layers className="w-3 h-3" />
                                {aduan.anak_aduan_count} Aduan dalam Kluster
                              </div>
                            )}
                            <button onClick={() => navigate('/urus-aduan')} className="mt-3 w-full bg-slate-900 text-white text-xs font-bold py-2 rounded-lg hover:bg-teal-600 transition-colors">
                              Saring Kerosakan Ini
                            </button>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>

              {/* Panel Maklumat Kluster Kanan (Terapung) */}
              <motion.div 
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="w-80 bg-white border-l border-slate-200 h-full flex flex-col shadow-2xl z-10 overflow-y-auto"
              >
                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                  <h3 className="font-black text-slate-900 flex items-center gap-2 mb-4"><Layers className="w-5 h-5 text-teal-600" /> Analitik Ruang</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white border border-slate-200 p-3 rounded-xl text-center shadow-sm">
                      <h4 className="text-2xl font-black text-rose-500">{aduans.filter(a => a.status === 'Baru').length}</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Aduan Aktif</p>
                    </div>
                    <div className="bg-white border border-slate-200 p-3 rounded-xl text-center shadow-sm">
                      <h4 className="text-2xl font-black text-slate-800">{Math.floor(aduans.length / 2)}</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Potensi Kluster</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 flex-1">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Amaran Kluster (Radius 20m)</h4>
                  
                  <div className="space-y-4">
                    {aduans.filter(a => a.anak_aduan_count > 0).map((kluster, idx) => {
                      const totalAduan = 1 + kluster.anak_aduan_count;
                      const isHighRisk = kluster.label_prioriti === 'Tinggi' || totalAduan >= 3;
                      
                      return (
                        <div key={kluster.id} className={`${isHighRisk ? 'bg-rose-50 border-rose-100' : 'bg-amber-50 border-amber-100'} border p-4 rounded-2xl relative overflow-hidden`}>
                          {isHighRisk && <div className="absolute top-0 right-0 w-16 h-16 bg-rose-500/10 rounded-full -mr-8 -mt-8"></div>}
                          <div className="flex items-start gap-3 relative z-10">
                            {isHighRisk ? <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" /> : <Navigation className="w-5 h-5 text-amber-500 shrink-0" />}
                            <div>
                              <h5 className={`font-bold text-sm ${isHighRisk ? 'text-rose-900' : 'text-amber-900'}`}>
                                {isHighRisk ? 'Kluster Berisiko Tinggi' : 'Pertindihan Dikesan'}
                              </h5>
                              <p className={`text-xs font-medium mt-1 ${isHighRisk ? 'text-rose-700/80' : 'text-amber-700/80'}`}>
                                {totalAduan} aduan {kluster.jenis} dikesan berdekatan {kluster.alamat_lokasi}.
                              </p>
                              <div className="mt-3 flex items-center gap-2">
                                <span className={`text-[10px] px-2 py-1 rounded font-black uppercase ${isHighRisk ? 'bg-rose-200 text-rose-800' : 'bg-amber-200 text-amber-800'}`}>
                                  Prioriti: {kluster.label_prioriti || 'Sederhana'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    
                    {aduans.filter(a => a.anak_aduan_count > 0).length === 0 && (
                      <div className="text-center p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                        <p className="text-xs font-bold text-slate-400">Tiada kluster dikesan setakat ini.</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-8 p-4 bg-slate-900 text-white rounded-2xl text-xs leading-relaxed opacity-80">
                    <span className="font-bold text-teal-400 block mb-1">Nota Algoritma:</span>
                    Algoritma clustering BANDA+ akan memusatkan semua titik aduan yang berada di dalam radius 20 meter kepada satu Titik Induk (Parent Node) sebelum diserahkan kepada Kontraktor.
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default PetaKluster;