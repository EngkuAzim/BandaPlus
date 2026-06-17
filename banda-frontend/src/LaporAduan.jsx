import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, FileText, MapPin, Send, Loader2, Image as ImageIcon, Map as MapIcon, ChevronRight, ChevronLeft, CheckCircle, Navigation, MapPinned, PencilLine } from 'lucide-react';
import { toast } from 'sonner';
import Sidebar from './Sidebar';
import exifr from 'exifr';
import Map, { Marker, NavigationControl } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';

function LaporAduan() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  
  // WIZARD STATE
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const [formData, setFormData] = useState({
    jenis_kerosakan: '',
    id_zon: '', 
    alamat_lokasi: '',
    keterangan_aduan: '',
    lat: null, 
    lng: null, 
  });
  
  const [locationMethod, setLocationMethod] = useState('alamat'); // 'alamat', 'peta', 'gps'
  const [specificLocation, setSpecificLocation] = useState('');
  const [viewState, setViewState] = useState({
    longitude: 101.7486,
    latitude: 3.2104,
    zoom: 13
  });
  const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
  
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [scanId, setScanId] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [aiPredictions, setAiPredictions] = useState(null);
  const pollingIntervalRef = React.useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) navigate('/login');
    axios.get(`/api/user`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setUserData(res.data)).catch(() => navigate('/login'));

    // Try to silently get GPS for map default view
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setViewState(prev => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            zoom: 14
          }));
        },
        () => {
          // Fallback to default MPAJ coordinates already set in state
        }
      );
    }

    return () => stopPolling();
  }, [navigate]);

  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };

  const fetchAddressFromCoords = async (lat, lng) => {
    setIsLocating(true);
    try {
      const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      if (response.data && response.data.display_name) {
        setFormData(prev => ({ 
          ...prev, 
          alamat_lokasi: response.data.display_name,
          lat: lat,
          lng: lng
        }));
        toast.success('Lokasi Ditemui!', { description: 'Alamat telah diisi secara automatik.' });
      }
    } catch (error) {
      toast.error('Ralat Peta', { description: 'Gagal menukar koordinat kepada alamat.' });
    } finally {
      setIsLocating(false);
    }
  };

  const uploadForScan = async (file) => {
    setIsScanning(true);
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('/api/aduan/pre-upload', formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      
      const id = res.data.scan_id;
      setScanId(id);
      
      pollingIntervalRef.current = setInterval(() => checkScanStatus(id), 2000);
    } catch (error) {
      setIsScanning(false);
      toast.error('Gagal Memuat Naik AI', { description: 'Sila cuba lagi.' });
    }
  };

  const checkScanStatus = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`/api/aduan/scan-status/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.data.status === 'completed') {
        stopPolling();
        setIsScanning(false);
        setAiPredictions(res.data.predictions);
        
        if (res.data.image_path) {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://banda-api.test';
            setImagePreview(`${apiUrl}/storage/${res.data.image_path}`);
        }
        
        if (res.data.predictions && res.data.predictions.length > 0) {
            const sorted = [...res.data.predictions].sort((a, b) => b.confidence - a.confidence);
            const topPrediction = sorted[0].class;
            
            let matchedValue = "Lain-lain";
            const kerosakanMap = {
                "Pothole": "Jalan Berlubang",
                "Fallen Tree": "Pokok Tumbang",
                "Flood": "Banjir",
                "Stray Dog": "Anjing Liar / Haiwan Terbiar",
                "Illegal Dumping": "Pembuangan Sampah Haram",
                "Broken Streetlight": "Lampu Jalan Rosak",
                "Clogged Drain": "Longkang Tersumbat/Pecah",
                "Public Infrastructure": "Infrastruktur Awam"
            };
            
            if (kerosakanMap[topPrediction]) {
                matchedValue = kerosakanMap[topPrediction];
            } else {
                const validOptions = [
                  "Jalan Berlubang", "Banjir", "Anjing Liar / Haiwan Terbiar", "Pembuangan Sampah Haram",
                  "Lampu Jalan Rosak", "Longkang Tersumbat/Pecah", "Pokok Tumbang", "Infrastruktur Awam", "Lain-lain"
                ];
                if (validOptions.includes(topPrediction)) {
                    matchedValue = topPrediction;
                }
            }

            setFormData(prev => ({ ...prev, jenis_kerosakan: matchedValue }));
            toast.success('Analisis AI Selesai!', { description: `AI dikesan: ${matchedValue}` });
        } else {
            toast.info('Analisis AI Selesai', { description: 'Sila pilih kategori secara manual.' });
        }
      }
    } catch (error) {
      console.error("Polling error:", error);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Gambar Terlalu Besar', { description: 'Maksimum 5MB.'});
        return;
      }
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
      
      uploadForScan(file);

      try {
        const gpsData = await exifr.gps(file);
        if (gpsData && gpsData.latitude && gpsData.longitude) {
          fetchAddressFromCoords(gpsData.latitude, gpsData.longitude);
        }
      } catch (error) {
        console.error('Ralat membaca EXIF:', error);
      }
    }
  };

  const getCurrentLocation = () => {
    setIsLocating(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            setViewState({ latitude: lat, longitude: lng, zoom: 15 });
            fetchAddressFromCoords(lat, lng);
        },
        () => {
          setIsLocating(false);
          toast.error('Akses Ditolak', { description: 'Sila benarkan akses lokasi.' });
        }
      );
    }
  };

  const handleMapClick = (e) => {
    if (locationMethod !== 'peta' && locationMethod !== 'gps') return;
    const { lng, lat } = e.lngLat;
    setFormData(prev => ({ ...prev, lat, lng }));
    fetchAddressFromCoords(lat, lng);
  };

  const handleLocationMethodChange = (method) => {
    setLocationMethod(method);
    if (method === 'gps') {
        getCurrentLocation();
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setScanId(null);
    setAiPredictions(null);
    stopPolling();
    setIsScanning(false);
  };

  const handleNext = () => {
    if (currentStep === 1 && !selectedImage) {
        return toast.error("Sila muat naik gambar terlebih dahulu");
    }
    if (currentStep === 2) {
        if (!formData.jenis_kerosakan || !formData.id_zon || !formData.alamat_lokasi) {
            return toast.error("Sila lengkapkan semua butiran yang diperlukan");
        }
    }
    setCurrentStep(prev => Math.min(prev + 1, totalSteps));
  };

  const handlePrev = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedImage && !scanId) return toast.error('Gambar Diperlukan');

    setIsSubmitting(true);
    const submitData = new FormData();
    submitData.append('jenis_kerosakan', formData.jenis_kerosakan);
    submitData.append('id_zon', formData.id_zon);
    
    // Combine specific location into alamat_lokasi if provided
    const finalAddress = specificLocation 
        ? `${formData.alamat_lokasi} (${specificLocation})`
        : formData.alamat_lokasi;
        
    // If they used map but reverse geocoding failed/empty, provide a fallback so backend doesn't reject
    const addressToSubmit = finalAddress || (formData.lat ? `Lokasi Peta: ${formData.lat}, ${formData.lng}` : '');
    submitData.append('alamat_lokasi', addressToSubmit);
    
    submitData.append('keterangan_aduan', formData.keterangan_aduan);
    
    if (scanId) {
        submitData.append('scan_id', scanId);
    } else if (selectedImage) {
        submitData.append('gambar_bukti', selectedImage);
    }
    
    if (formData.lat && formData.lng) {
      submitData.append('lat', formData.lat);
      submitData.append('lng', formData.lng);
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(`/api/aduan`, submitData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Aduan Berjaya Dihantar!');
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (error) {
      toast.error('Gagal Menghantar Aduan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="mb-8 relative max-w-3xl mx-auto">
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-200 -translate-y-1/2 rounded-full z-0"></div>
        <div 
            className="absolute top-1/2 left-0 h-1 bg-teal-500 -translate-y-1/2 rounded-full z-0 transition-all duration-500 ease-in-out" 
            style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
        ></div>
        
        <div className="relative z-10 flex justify-between">
            {[1, 2, 3].map((step) => (
                <div key={step} className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-4 transition-colors duration-300 ${
                        currentStep > step ? 'bg-teal-500 border-teal-500 text-white' : 
                        currentStep === step ? 'bg-white border-teal-500 text-teal-600' : 'bg-white border-slate-200 text-slate-400'
                    }`}>
                        {currentStep > step ? <CheckCircle className="w-5 h-5" /> : step}
                    </div>
                    <span className={`mt-2 text-xs font-bold ${currentStep >= step ? 'text-teal-700' : 'text-slate-400'}`}>
                        {step === 1 ? 'Gambar Bukti' : step === 2 ? 'Butiran Lokasi' : 'Semakan'}
                    </span>
                </div>
            ))}
        </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      <Sidebar userData={userData} />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <header className="flex items-center justify-between px-8 py-5 bg-white border-b border-slate-200">
          <h2 className="text-2xl font-black text-slate-900">Lapor Aduan Baru</h2>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto">
            
            {renderStepIndicator()}

            <motion.div 
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8"
            >
              <form onSubmit={(e) => { e.preventDefault(); if (currentStep === 3) handleSubmit(e); }}>
                
                {/* STEP 1: UPLOAD & AI SCAN */}
                {currentStep === 1 && (
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center mb-4">
                        <ImageIcon className="w-8 h-8 text-teal-600" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 mb-2">Muat Naik Gambar</h3>
                    <p className="text-slate-500 mb-8 max-w-md">
                        Muat naik gambar kerosakan atau isu infrastruktur. AI kami akan mengimbas gambar anda secara automatik.
                    </p>

                    <div className="w-full max-w-lg aspect-square">
                      {!imagePreview ? (
                        <label className="w-full h-full border-2 border-dashed border-slate-300 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:border-teal-500 hover:bg-teal-50/50 transition-colors group">
                          <UploadCloud className="w-12 h-12 text-teal-600 mb-4 group-hover:scale-110 transition-transform" />
                          <p className="font-bold text-slate-700 text-lg">Klik Untuk Muat Naik</p>
                          <p className="text-sm text-slate-400 mt-2">Format: JPG, PNG (Max 5MB)</p>
                          <input type="file" accept="image/jpeg, image/png" className="hidden" onChange={handleImageChange} />
                        </label>
                      ) : (
                        <div className="relative w-full h-full rounded-3xl overflow-hidden border border-slate-200 group shadow-inner">
                          <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                          
                          {isScanning && (
                            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-10 flex flex-col items-center justify-center overflow-hidden">
                              <motion.div 
                                className="absolute left-0 right-0 h-0.5 bg-teal-400 shadow-[0_0_15px_4px_rgba(45,212,191,0.8)]"
                                animate={{ top: ["0%", "100%", "0%"] }}
                                transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
                              />
                              <motion.div
                                animate={{ scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] }}
                                transition={{ repeat: Infinity, duration: 1.5 }}
                                className="flex flex-col items-center z-20"
                              >
                                <div className="w-16 h-16 rounded-full bg-teal-500/20 border-2 border-teal-400 flex items-center justify-center mb-3">
                                  <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
                                </div>
                                <span className="text-white font-bold tracking-widest text-sm uppercase">Menganalisis...</span>
                              </motion.div>
                            </div>
                          )}

                          {!isScanning && (
                            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
                               <button type="button" onClick={clearImage} className="bg-rose-500 hover:bg-rose-600 transition-colors text-white font-bold py-2 px-6 rounded-xl shadow-lg">Batal & Tukar Gambar</button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* STEP 2: LOCATION & DETAILS */}
                {currentStep === 2 && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* LEFT COLUMN: IMAGE PREVIEW (4 cols) */}
                    <div className="lg:col-span-4 hidden md:block">
                        <div className="sticky top-8 space-y-4">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <ImageIcon className="w-5 h-5 text-teal-600" /> Gambar Rujukan
                            </h3>
                            <div className="rounded-3xl overflow-hidden border-2 border-slate-200 shadow-sm aspect-square bg-slate-100 relative group">
                                {imagePreview ? (
                                    <img src={imagePreview} className="w-full h-full object-cover" alt="Rujukan" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-400 font-medium">Tiada Gambar</div>
                                )}
                            </div>
                            <p className="text-xs text-slate-500 text-center">Jadikan gambar ini panduan untuk melengkapkan laporan kerosakan.</p>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: LOCATION & FORM (8 cols) */}
                    <div className="lg:col-span-8 flex flex-col gap-8">
                        
                        {/* COMBINED FORM & LOCATION SECTION */}
                        <div className="flex flex-col gap-6 bg-slate-50 p-6 sm:p-8 rounded-3xl border border-slate-200">
                            
                            <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
                                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm shrink-0 border border-slate-100">
                                    <FileText className="w-5 h-5 text-teal-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-slate-900">Maklumat Asas & Lokasi</h3>
                                    <p className="text-xs text-slate-500">Lengkapkan butiran dan tandakan lokasi kerosakan.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-slate-700">Kategori Kerosakan</label>
                                    <select required value={formData.jenis_kerosakan} onChange={(e) => setFormData({...formData, jenis_kerosakan: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm">
                                    <option value="" disabled>Pilih Kategori...</option>
                                    <option value="Jalan Berlubang">Jalan Berlubang</option>
                                    <option value="Banjir">Banjir</option>
                                    <option value="Anjing Liar / Haiwan Terbiar">Anjing Liar / Haiwan Terbiar</option>
                                    <option value="Pembuangan Sampah Haram">Pembuangan Sampah Haram</option>
                                    <option value="Lampu Jalan Rosak">Lampu Jalan Rosak</option>
                                    <option value="Longkang Tersumbat/Pecah">Longkang Tersumbat/Pecah</option>
                                    <option value="Pokok Tumbang">Pokok Tumbang</option>
                                    <option value="Infrastruktur Awam">Infrastruktur Awam (Taman/Surau)</option>
                                    <option value="Lain-lain">Lain-lain</option>
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-slate-700">Zon MPAJ</label>
                                    <select required value={formData.id_zon} onChange={(e) => setFormData({...formData, id_zon: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm">
                                    <option value="" disabled>Pilih Zon Anda...</option>
                                    <option value="1">Zon 1 (Taman Melawati)</option>
                                    <option value="2">Zon 2 (Klang Gates / Ukay Perdana)</option>
                                    <option value="3">Zon 3 (Bukit Antarabangsa)</option>
                                    <option value="4">Zon 4 (Ukay Bistari)</option>
                                    <option value="5">Zon 5 (Ampang Jaya)</option>
                                    </select>
                                </div>
                            </div>

                            <hr className="border-slate-200 my-2" />

                            {/* LOCATION SETTINGS INSERTED HERE */}
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-bold text-slate-700">Kaedah Tetapan Lokasi</label>
                                    <p className="text-xs text-slate-500 mb-3">Pilih cara untuk menetapkan lokasi kerosakan.</p>
                                    <div className="grid grid-cols-3 gap-3">
                                        <button type="button" onClick={() => handleLocationMethodChange('alamat')} className={`flex flex-col items-center justify-center gap-2 p-3 sm:p-4 rounded-2xl border-2 transition-all focus:outline-none focus:ring-4 focus:ring-teal-500/20 ${locationMethod === 'alamat' ? 'border-teal-500 bg-teal-50/50 text-teal-700 shadow-sm scale-[1.02]' : 'border-slate-200 hover:border-teal-200 bg-white text-slate-500 hover:bg-slate-50'}`}>
                                            <PencilLine className={`w-5 h-5 sm:w-6 sm:h-6 ${locationMethod === 'alamat' ? 'text-teal-600' : 'text-slate-400'}`} />
                                            <span className="text-[10px] sm:text-xs font-bold text-center leading-tight">Alamat<br/>Manual</span>
                                        </button>
                                        
                                        <button type="button" onClick={() => handleLocationMethodChange('peta')} className={`flex flex-col items-center justify-center gap-2 p-3 sm:p-4 rounded-2xl border-2 transition-all focus:outline-none focus:ring-4 focus:ring-teal-500/20 ${locationMethod === 'peta' ? 'border-teal-500 bg-teal-50/50 text-teal-700 shadow-sm scale-[1.02]' : 'border-slate-200 hover:border-teal-200 bg-white text-slate-500 hover:bg-slate-50'}`}>
                                            <MapIcon className={`w-5 h-5 sm:w-6 sm:h-6 ${locationMethod === 'peta' ? 'text-teal-600' : 'text-slate-400'}`} />
                                            <span className="text-[10px] sm:text-xs font-bold text-center leading-tight">Tanda<br/>Peta</span>
                                        </button>

                                        <button type="button" onClick={() => handleLocationMethodChange('gps')} className={`flex flex-col items-center justify-center gap-2 p-3 sm:p-4 rounded-2xl border-2 transition-all focus:outline-none focus:ring-4 focus:ring-teal-500/20 ${locationMethod === 'gps' ? 'border-teal-500 bg-teal-50/50 text-teal-700 shadow-sm scale-[1.02]' : 'border-slate-200 hover:border-teal-200 bg-white text-slate-500 hover:bg-slate-50'}`}>
                                            <Navigation className={`w-5 h-5 sm:w-6 sm:h-6 ${locationMethod === 'gps' ? 'text-teal-600' : 'text-slate-400'}`} />
                                            <span className="text-[10px] sm:text-xs font-bold text-center leading-tight">Guna<br/>GPS</span>
                                        </button>
                                    </div>
                                </div>

                                <AnimatePresence mode="wait">
                                    {locationMethod === 'alamat' && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-1.5">
                                            <label className="text-sm font-bold text-slate-700">Alamat Penuh</label>
                                            <div className="relative">
                                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                                <input type="text" required placeholder="Cth: No 12, Jalan Melawati..." value={formData.alamat_lokasi} onChange={(e) => setFormData({...formData, alamat_lokasi: e.target.value})} className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm" />
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <AnimatePresence mode="wait">
                                {(locationMethod === 'peta' || locationMethod === 'gps') && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex flex-col gap-3">
                                        <div className="flex items-center justify-between">
                                            <label className="text-sm font-bold text-slate-700">Peta Interaktif</label>
                                            {isLocating && <span className="text-xs font-bold text-teal-600 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin"/> Mengesan...</span>}
                                        </div>
                                        <div className="w-full h-[300px] sm:h-[400px] rounded-2xl overflow-hidden border-2 border-slate-200 relative shadow-inner">
                                            <Map {...viewState} onMove={evt => setViewState(evt.viewState)} onClick={handleMapClick} mapboxAccessToken={MAPBOX_TOKEN} mapStyle="mapbox://styles/mapbox/satellite-streets-v12" cursor={locationMethod === 'peta' || locationMethod === 'gps' ? 'crosshair' : 'grab'}>
                                                <NavigationControl position="top-left" />
                                                {formData.lat && formData.lng && <Marker longitude={formData.lng} latitude={formData.lat} color="#ef4444" />}
                                            </Map>
                                        </div>
                                        {formData.alamat_lokasi && (
                                            <p className="text-xs font-medium text-slate-500 p-3 bg-slate-50 rounded-xl border border-slate-200 flex gap-2 items-start"><span className="shrink-0 text-base">📌</span> <span><span className="font-bold text-slate-700">Alamat Dikesan:</span> {formData.alamat_lokasi}</span></p>
                                        )}
                                    </motion.div>
                                )}
                                </AnimatePresence>
                            </div>

                            <hr className="border-slate-200 my-2" />

                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-slate-700">Lokasi Spesifik (Pilihan)</label>
                                <input type="text" value={specificLocation} onChange={(e) => setSpecificLocation(e.target.value)} placeholder="Cth: Depan restoran Mamak..." className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm" />
                            </div>
                            
                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-slate-700">Keterangan Lanjut (Pilihan)</label>
                                <textarea value={formData.keterangan_aduan} onChange={(e) => setFormData({...formData, keterangan_aduan: e.target.value})} placeholder="Terangkan isu ini..." className="w-full min-h-[100px] px-4 py-3.5 bg-white border border-slate-200 rounded-xl resize-none outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm"></textarea>
                            </div>
                        </div>
                    </div>
                  </div>
                )}

                {/* STEP 3: REVIEW & SUBMIT */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-8 h-8 text-emerald-600" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900">Semakan Terakhir</h3>
                        <p className="text-slate-500">Sila pastikan maklumat di bawah tepat sebelum menghantar.</p>
                    </div>

                    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm aspect-video">
                            <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
                        </div>
                        <div className="space-y-4">
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Kategori</p>
                                <p className="text-lg font-bold text-slate-900">{formData.jenis_kerosakan}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Zon</p>
                                <p className="text-sm font-bold text-slate-900">Zon {formData.id_zon}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Lokasi</p>
                                <p className="text-sm font-medium text-slate-700 line-clamp-2">{formData.alamat_lokasi}</p>
                            </div>
                        </div>
                    </div>
                  </div>
                )}

                {/* NAVIGATION BUTTONS */}
                <div className="mt-10 flex items-center justify-between pt-6 border-t border-slate-100">
                    <button 
                        type="button" 
                        onClick={handlePrev}
                        disabled={currentStep === 1}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${currentStep === 1 ? 'opacity-0 pointer-events-none' : 'text-slate-500 hover:bg-slate-100'}`}
                    >
                        <ChevronLeft className="w-5 h-5" /> Kembali
                    </button>
                    
                    {currentStep < totalSteps ? (
                        <button 
                            type="button" 
                            onClick={handleNext}
                            disabled={isScanning || (currentStep === 1 && !selectedImage)}
                            className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-8 rounded-xl flex items-center gap-2 shadow-lg shadow-teal-500/30 transition-all disabled:opacity-50 disabled:shadow-none"
                        >
                            Seterusnya <ChevronRight className="w-5 h-5" />
                        </button>
                    ) : (
                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-500/30 transition-all"
                        >
                            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                            Hantar Laporan Aduan
                        </button>
                    )}
                </div>

              </form>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default LaporAduan;