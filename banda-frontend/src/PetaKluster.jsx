import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Map, { 
  NavigationControl, 
  FullscreenControl, 
  GeolocateControl, 
  Marker, 
  Popup,
  Layer
} from 'react-map-gl/mapbox';
// mapbox-gl CSS loaded via CDN in index.html
import { motion } from 'framer-motion';
import { Loader2, Map as MapIcon, BrainCircuit, AlertTriangle, Layers, Navigation } from 'lucide-react';
import Sidebar from './Sidebar';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

// 3D Building Layer — vibrant purple/blue gradient
const buildingLayer = {
  id: '3d-buildings',
  source: 'composite',
  'source-layer': 'building',
  filter: ['==', 'extrude', 'true'],
  type: 'fill-extrusion',
  minzoom: 14,
  paint: {
    'fill-extrusion-color': [
      'interpolate', ['linear'], ['get', 'height'],
      0,   '#1e1b4b',
      20,  '#3730a3',
      50,  '#6d28d9',
      100, '#a855f7'
    ],
    'fill-extrusion-height': [
      'interpolate', ['linear'], ['zoom'],
      14, 0, 14.5, ['get', 'height']
    ],
    'fill-extrusion-base': [
      'interpolate', ['linear'], ['zoom'],
      14, 0, 14.5, ['get', 'min_height']
    ],
    'fill-extrusion-opacity': 0.85
  }
};

// Marker Color Logic based on Prioriti
const getMarkerColor = (prioriti) => {
  switch (prioriti) {
    case 'SANGAT TINGGI': return '#ef4444'; // Red
    case 'SEDERHANA': return '#f97316';     // Orange
    case 'RENDAH': return '#22c55e';        // Green
    default: return '#3b82f6';              // Blue fallback
  }
};

// Simple initial letter icon based on complaint type
const getComplaintIcon = (jenis) => {
  if (!jenis) return 'A';
  return jenis.charAt(0).toUpperCase(); 
};

function PetaKluster() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [aduans, setAduans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [popupInfo, setPopupInfo] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }

    const fetchMapData = async (isInitial = true) => {
      try {
        if (isInitial) setIsLoading(true);
        const userRes = await axios.get(`${import.meta.env.VITE_API_URL}/user`, { headers: { Authorization: `Bearer ${token}` } });
        setUserData(userRes.data);

        if (userRes.data.peranan !== 'pentadbir') {
          navigate('/dashboard'); return;
        }

        const aduanRes = await axios.get(`${import.meta.env.VITE_API_URL}/pegawai/aduan-geo`, { headers: { Authorization: `Bearer ${token}` } });
        
        const aduanDenganGPS = aduanRes.data
          .filter(a => a.lat && a.lon);
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

      <div className="flex-1 flex flex-col" style={{ minHeight: 0, height: '100vh' }}>
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-8 py-5 bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <MapIcon className="w-6 h-6 text-violet-600" /> Pemetaan Kluster AI (3D)
            </h2>
            <p className="text-sm text-slate-500 font-medium mt-1">Pemantauan taburan kerosakan fasiliti (Radius 500m)</p>
          </div>
          
          <div className="flex items-center gap-3 mt-4 sm:mt-0 bg-violet-50 border border-violet-200 px-4 py-2 rounded-xl">
            <BrainCircuit className="w-5 h-5 text-violet-600 animate-pulse" />
            <span className="text-sm font-bold text-violet-900">Mapbox 3D Engine Aktif</span>
          </div>
        </header>

        <main className="relative flex" style={{ flex: 1, minHeight: 0 }}>
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-50/80 z-50 backdrop-blur-sm">
              <Loader2 className="w-12 h-12 animate-spin text-violet-600" />
            </div>
          ) : (
            <>
              {/* Bahagian Peta Kiri */}
              <div style={{ flex: 1, position: 'relative' }}>
                <Map
                  mapboxAccessToken={MAPBOX_TOKEN}
                  initialViewState={{
                    longitude: 101.763,
                    latitude: 3.140,
                    zoom: 15,
                    pitch: 62,
                    bearing: -17
                  }}
                  mapStyle="mapbox://styles/mapbox/navigation-night-v1"
                  style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
                  fog={{ color: '#0a0a1a', 'horizon-blend': 0.05 }}
                >
                  <Layer {...buildingLayer} />
                  <NavigationControl position="top-right" />
                  <FullscreenControl position="top-right" />
                  <GeolocateControl position="top-right" />

                  {aduans.map(aduan => (
                    <Marker 
                      key={aduan.id} 
                      longitude={parseFloat(aduan.lon)} 
                      latitude={parseFloat(aduan.lat)} 
                      anchor="bottom"
                      onClick={e => {
                        e.originalEvent.stopPropagation();
                        setPopupInfo(aduan);
                      }}
                    >
                      <div className="cursor-pointer flex flex-col items-center" style={{ transform: 'translateY(0)', transition: 'transform 0.15s ease' }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px) scale(1.15)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0) scale(1)'}
                      >
                        <div 
                          style={{
                            width: 36, height: 36, borderRadius: '50%',
                            background: getMarkerColor(aduan.label_prioriti),
                            border: '3px solid rgba(255,255,255,0.9)',
                            boxShadow: `0 0 0 4px ${getMarkerColor(aduan.label_prioriti)}55, 0 4px 12px rgba(0,0,0,0.4)`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'white', fontWeight: 900, fontSize: 12
                          }}
                        >
                          {getComplaintIcon(aduan.jenis)}
                        </div>
                        <div style={{ width: 2, height: 14, background: getMarkerColor(aduan.label_prioriti), opacity: 0.9 }} />
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: getMarkerColor(aduan.label_prioriti), opacity: 0.5 }} />
                      </div>
                    </Marker>
                  ))}

                  {popupInfo && (
                    <Popup
                      anchor="top"
                      longitude={Number(popupInfo.lon)}
                      latitude={Number(popupInfo.lat)}
                      onClose={() => setPopupInfo(null)}
                      className="custom-mapbox-popup z-50"
                      maxWidth="300px"
                      closeButton={false}
                    >
                      <div className="p-1">
                        <img 
                          src={`${import.meta.env.VITE_API_URL.replace('/api', '')}/storage/${popupInfo.gambar_bukti}`} 
                          alt="Bukti Kerosakan" 
                          className="w-full h-32 object-cover rounded-t-lg mb-2 bg-slate-100"
                          onError={(e) => e.target.src = 'https://via.placeholder.com/300x200?text=Tiada+Imej'}
                        />
                        <div className="px-2 pb-2 pt-1">
                          <span 
                            className="text-[10px] font-black uppercase px-2 py-0.5 rounded text-white"
                            style={{ backgroundColor: getMarkerColor(popupInfo.label_prioriti) }}
                          >
                            {popupInfo.label_prioriti || 'Sederhana'}
                          </span>
                          <h4 className="font-bold text-slate-800 mt-2 leading-tight">{popupInfo.jenis}</h4>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2">Skor AI: <span className="font-bold text-slate-900">{popupInfo.weight}%</span></p>
                          {popupInfo.anak_aduan_count > 0 && (
                            <div className="mt-2 flex items-center gap-1 bg-purple-100 text-purple-700 px-2 py-1 rounded text-[10px] font-bold">
                              <Layers className="w-3 h-3" />
                              {popupInfo.anak_aduan_count} Aduan dalam Kluster
                            </div>
                          )}
                          <button onClick={() => navigate('/urus-aduan')} className="mt-3 w-full bg-slate-900 text-white text-xs font-bold py-2 rounded-lg hover:bg-violet-600 transition-colors">
                            Lihat Butiran
                          </button>
                        </div>
                      </div>
                    </Popup>
                  )}
                </Map>
              </div>

              {/* Panel Maklumat Kluster Kanan (Terapung) */}
              <motion.div 
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="w-80 bg-white border-l border-slate-200 h-full flex flex-col shadow-2xl z-10 overflow-y-auto"
              >
                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                  <h3 className="font-black text-slate-900 flex items-center gap-2 mb-4"><Layers className="w-5 h-5 text-violet-600" /> Analitik Ruang 3D</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white border border-slate-200 p-3 rounded-xl text-center shadow-sm">
                      <h4 className="text-2xl font-black text-rose-500">{aduans.filter(a => a.status === 'Baru' || a.status === 'Dalam Tindakan').length}</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Aduan Aktif</p>
                    </div>
                    <div className="bg-white border border-slate-200 p-3 rounded-xl text-center shadow-sm">
                      <h4 className="text-2xl font-black text-slate-800">{aduans.filter(a => a.anak_aduan_count > 0).length}</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Kluster Dikesan</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 flex-1">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Amaran Kluster (Radius 500m)</h4>
                  
                  <div className="space-y-4">
                    {aduans.filter(a => a.anak_aduan_count > 0).map((kluster) => {
                      const totalAduan = 1 + kluster.anak_aduan_count;
                      const isHighRisk = kluster.label_prioriti === 'SANGAT TINGGI' || totalAduan >= 3;
                      
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
                                  Prioriti: {kluster.label_prioriti || 'SEDERHANA'}
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
                    <span className="font-bold text-violet-400 block mb-1">Nota Algoritma:</span>
                    Algoritma clustering BANDA+ memusatkan semua titik aduan di dalam radius 500 meter kepada satu Titik Induk (Parent Node) menggunakan pangkalan data reruang MySQL. Bangunan 3D dijana secara dinamik oleh Mapbox.
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