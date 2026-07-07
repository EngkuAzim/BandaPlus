import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, FileText, MapPin, Send, Loader2, Image as ImageIcon, Map as MapIcon, ChevronRight, ChevronLeft, CheckCircle, Navigation, MapPinned, PencilLine, BrainCircuit, X, Video, FileImage, Plus, Mic } from 'lucide-react';
import { toast } from 'sonner';
import Sidebar from './Sidebar';
import exifr from 'exifr';
import Map, { Marker, NavigationControl } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import echo from './echo';
import ImageUploader from './components/Aduan/ImageUploader';
import LocationPicker from './components/Aduan/LocationPicker';

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

  const displayCategory = (c) => ({
      'Jalan Berlubang': 'Pothole',
      'Banjir': 'Flood',
      'Anjing Liar / Haiwan Terbiar': 'Stray Animal',
      'Haiwan Liar': 'Stray Animal',
      'Pembuangan Sampah Haram': 'Illegal Dumping',
      'Lampu Jalan Rosak': 'Faulty Streetlight',
      'Longkang Tersumbat/Pecah': 'Clogged Drain',
      'Longkang Tersumbat': 'Clogged Drain',
      'Pokok Tumbang': 'Fallen Tree',
      'Infrastruktur Awam': 'Public Infrastructure',
      'Lain-lain': 'Others'
    })[c] || c;
  
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
  const [additionalFiles, setAdditionalFiles] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = React.useRef(null);
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

    return () => {
      if (scanId) echo.leaveChannel(`scans.${scanId}`);
    };
  }, [navigate, scanId]);

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
        toast.success('Location Found!', { description: 'Address has been autofilled automatically.' });
      }
    } catch (error) {
      toast.error('Map Error', { description: 'Failed to convert coordinates to address.' });
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
      
      // Start a timeout for the AI response in case AI service is offline/broken
      const timeoutId = setTimeout(() => {
        setIsScanning(false);
        toast.info('AI Service Offline', { description: 'AI analysis is currently unavailable. Please select the category manually and proceed.' });
        echo.leaveChannel(`scans.${id}`);
      }, 15000); // 15 seconds timeout
      
      // Listen to the WebSocket channel for this specific scan ID
      echo.channel(`scans.${id}`)
        .listen('.ScanCompleted', (e) => {
          clearTimeout(timeoutId);
          console.log("WebSocket Broadcast Received!", e);
          handleScanCompleted(e.scanData);
          echo.leaveChannel(`scans.${id}`);
        });

    } catch (error) {
      setIsScanning(false);
      toast.info('AI Service Offline', { description: 'AI analysis is currently unavailable. Please select the category manually and proceed.' });
    }
  };

  const handleScanCompleted = (scanData) => {
    try {
      setIsScanning(false);
      
      if (scanData.image_path) {
          const apiUrl = import.meta.env.VITE_API_URL || 'http://banda-api.test';
          setImagePreview(`${apiUrl}/storage/${scanData.image_path}`);
      }
      
      if (scanData.predictions && scanData.predictions.length > 0) {
          const sorted = [...scanData.predictions].sort((a, b) => b.confidence - a.confidence);
          setAiPredictions(sorted);
          const topPrediction = sorted[0].class;
          
          let matchedValue = "Lain-lain";
          const kerosakanMap = {
              "Pothole": "Jalan Berlubang",
              "Fallen Tree": "Pokok Tumbang",
              "Flood": "Banjir",
              "Stray Dog": "Haiwan Liar",
              "Illegal Dumping": "Pembuangan Sampah Haram",
              "Broken Streetlight": "Lampu Jalan Rosak",
              "Clogged Drain": "Longkang Tersumbat/Pecah",
              "Public Infrastructure": "Infrastruktur Awam"
          };
          
          if (kerosakanMap[topPrediction]) {
              matchedValue = kerosakanMap[topPrediction];
          } else {
              const validOptions = [
                "Jalan Berlubang", "Banjir", "Haiwan Liar", "Pembuangan Sampah Haram",
                "Lampu Jalan Rosak", "Longkang Tersumbat/Pecah", "Pokok Tumbang", "Infrastruktur Awam", "Lain-lain"
              ];
              if (validOptions.includes(topPrediction)) {
                  matchedValue = topPrediction;
              }
          }

          setFormData(prev => ({ ...prev, jenis_kerosakan: matchedValue }));
          toast.success('AI Analysis Complete!', { description: `AI detected: ${displayCategory(matchedValue)}` });
      } else {
          toast.info('AI Analysis Complete', { description: 'Please select a category manually.' });
      }
    } catch (error) {
      console.error("Error processing scan data:", error);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image Too Large', { description: 'Maximum size is 5MB.'});
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
          toast.error('Access Denied', { description: 'Please allow location access.' });
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

  const handleAdditionalFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Filter and validate files
    const validFiles = files.filter(file => {
      if (additionalFiles.length >= 3) return false; // Max 3
      
      const isVideo = file.type.startsWith('video/');
      const isImage = file.type.startsWith('image/');
      
      if (isVideo && file.size > 30 * 1024 * 1024) {
        toast.error('Video Too Large', { description: `${file.name} exceeds 30MB limit.` });
        return false;
      }
      
      if (isImage && file.size > 5 * 1024 * 1024) {
        toast.error('Image Too Large', { description: `${file.name} exceeds 5MB limit.` });
        return false;
      }
      
      return isVideo || isImage;
    });

    if (additionalFiles.length + validFiles.length > 3) {
      toast.error('Limit Reached', { description: 'You can only upload up to 3 additional files.' });
      validFiles.splice(3 - additionalFiles.length);
    }

    setAdditionalFiles(prev => [...prev, ...validFiles]);
  };

  const removeAdditionalFile = (indexToRemove) => {
    setAdditionalFiles(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const clearImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (scanId) echo.leaveChannel(`scans.${scanId}`);
    setScanId(null);
    setAiPredictions(null);
    setIsScanning(false);
    setAdditionalFiles([]);
  };

  const toggleVoiceInput = () => {
    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Voice input is not supported on this browser. Please type your description.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'ms-MY'; // Allow Malay or English speech
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onresult = (event) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + ' ';
        }
      }
      if (finalTranscript) {
        setFormData(prev => ({
          ...prev,
          keterangan_aduan: prev.keterangan_aduan ? prev.keterangan_aduan + ' ' + finalTranscript.trim() : finalTranscript.trim()
        }));
      }
    };
    
    recognition.onerror = (event) => {
      setIsListening(false);
      if(event.error !== 'no-speech') {
        toast.error("Voice input error: " + event.error);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
    recognitionRef.current = recognition;
    setIsListening(true);
  };

  const handleNext = () => {
    if (currentStep === 1 && !selectedImage) {
        return toast.error("Please upload a photo first");
    }
    if (currentStep === 2) {
        if (!formData.jenis_kerosakan || !formData.id_zon || !formData.alamat_lokasi) {
            return toast.error("Please complete all required details");
        }
    }
    setCurrentStep(prev => Math.min(prev + 1, totalSteps));
  };

  const handlePrev = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedImage && !scanId) return toast.error('Photo Required');

    setIsSubmitting(true);
    const submitData = new FormData();
    submitData.append('jenis_kerosakan', formData.jenis_kerosakan);
    submitData.append('id_zon', formData.id_zon);
    
    // Combine specific location into alamat_lokasi if provided
    const finalAddress = specificLocation 
        ? `${formData.alamat_lokasi} (${specificLocation})`
        : formData.alamat_lokasi;
        
    // If they used map but reverse geocoding failed/empty, provide a fallback so backend doesn't reject
    const addressToSubmit = finalAddress || (formData.lat ? `Map Location: ${formData.lat}, ${formData.lng}` : '');
    submitData.append('alamat_lokasi', addressToSubmit);
    
    submitData.append('keterangan_aduan', formData.keterangan_aduan);
    
    if (scanId) {
        submitData.append('scan_id', scanId);
    } else if (selectedImage) {
        submitData.append('gambar_bukti', selectedImage);
    }
    
    // Append additional files
    additionalFiles.forEach((file) => {
      submitData.append('evidences[]', file);
    });
    
    if (formData.lat && formData.lng) {
      submitData.append('lat', formData.lat);
      submitData.append('lng', formData.lng);
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(`/api/aduan`, submitData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Report Submitted Successfully!');
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (error) {
      toast.error('Failed to Submit Report');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="mb-8 relative max-w-3xl mx-auto">
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-200 -translate-y-1/2 rounded-full z-0"></div>
        <div 
            className="absolute top-1/2 left-0 h-1 bg-blue-600 -translate-y-1/2 rounded-full z-0 transition-all duration-500 ease-in-out" 
            style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
        ></div>
        
        <div className="relative z-10 flex justify-between">
            {[1, 2, 3].map((step) => (
                <div key={step} className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-4 transition-colors duration-300 ${
                        currentStep > step ? 'bg-blue-800 border-blue-800 text-white' : 
                        currentStep === step ? 'bg-white border-blue-800 text-blue-800' : 'bg-white border-slate-200 text-slate-400'
                    }`}>
                        {currentStep > step ? <CheckCircle className="w-5 h-5" /> : step}
                    </div>
                    <span className={`mt-2 text-xs font-bold ${currentStep >= step ? 'text-blue-800' : 'text-slate-400'}`}>
                        {step === 1 ? 'Photo Evidence' : step === 2 ? 'Location & Details' : 'Review'}
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
          <h2 className="text-2xl font-black text-slate-900">Submit a New Report</h2>
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
                  <ImageUploader 
                      imagePreview={imagePreview}
                      isScanning={isScanning}
                      handleImageChange={handleImageChange}
                      clearImage={clearImage}
                      aiPredictions={aiPredictions}
                      displayCategory={displayCategory}
                  />
                )}

                {/* STEP 2: LOCATION & DETAILS */}
                {currentStep === 2 && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* LEFT COLUMN: IMAGE PREVIEW (4 cols) */}
                    <div className="lg:col-span-4 hidden md:block">
                        <div className="sticky top-8 space-y-4">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <ImageIcon className="w-5 h-5 text-blue-800" /> Reference Photo
                            </h3>
                            <div className="rounded-3xl overflow-hidden border-2 border-slate-200 shadow-sm aspect-square bg-slate-100 relative group">
                                {imagePreview ? (
                                    <img src={imagePreview} className="w-full h-full object-cover" alt="Rujukan" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-400 font-medium">No Photo</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: LOCATION & FORM (8 cols) */}
                    <div className="lg:col-span-8 flex flex-col gap-8">
                        
                        {/* COMBINED FORM & LOCATION SECTION */}
                        <div className="flex flex-col gap-6 bg-slate-50 p-6 sm:p-8 rounded-3xl border border-slate-200">
                            
                            <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
                                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm shrink-0 border border-slate-100">
                                    <FileText className="w-5 h-5 text-blue-800" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-slate-900">Basic Info & Location</h3>
                                    <p className="text-xs text-slate-500">Fill in the details and mark the exact location of the issue.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-5">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-slate-700">Issue Category</label>
                                    <select required value={formData.jenis_kerosakan} onChange={(e) => setFormData({...formData, jenis_kerosakan: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-800/20 focus:border-blue-800 transition-all shadow-sm">
                                        <option value="" disabled>Select Category...</option>
                                        <option value="Jalan Berlubang">Pothole</option>
                                        <option value="Banjir">Flood</option>
                                        <option value="Anjing Liar / Haiwan Terbiar">Stray Animal</option>
                                        <option value="Pembuangan Sampah Haram">Illegal Dumping</option>
                                        <option value="Lampu Jalan Rosak">Faulty Streetlight</option>
                                        <option value="Longkang Tersumbat/Pecah">Clogged Drain</option>
                                        <option value="Pokok Tumbang">Fallen Tree</option>
                                        <option value="Infrastruktur Awam">Public Infrastructure</option>
                                        <option value="Lain-lain">Others</option>
                                    </select>
                                    <p className="text-[11px] text-slate-500">You can keep the AI suggestion or choose another category.</p>
                                </div>
                            </div>

                            <hr className="border-slate-200 my-2" />

                            <LocationPicker
                                locationMethod={locationMethod}
                                handleLocationMethodChange={handleLocationMethodChange}
                                formData={formData}
                                setFormData={setFormData}
                                isLocating={isLocating}
                                viewState={viewState}
                                setViewState={setViewState}
                                handleMapClick={handleMapClick}
                                MAPBOX_TOKEN={MAPBOX_TOKEN}
                            />

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-slate-700">MPAJ Zone</label>
                                    <select required value={formData.id_zon} onChange={(e) => setFormData({...formData, id_zon: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-800/20 focus:border-blue-800 transition-all shadow-sm">
                                        <option value="" disabled>Select Your Zone...</option>
                                        <option value="1">Zone 1</option>
                                        <option value="2">Zone 2</option>
                                        <option value="3">Zone 3</option>
                                        <option value="4">Zone 4</option>
                                        <option value="5">Zone 5</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-slate-700">Specific Landmark</label>
                                    <input type="text" value={specificLocation} onChange={(e) => setSpecificLocation(e.target.value)} placeholder="e.g. In front of ABC Restaurant..." className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-800/20 focus:border-blue-800 transition-all shadow-sm" />
                                </div>
                            </div>
                            
                            <hr className="border-slate-200 my-2" />
                            
                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-slate-700">Additional Details</label>
                                <textarea value={formData.keterangan_aduan} onChange={(e) => setFormData({...formData, keterangan_aduan: e.target.value})} placeholder="Describe the issue in more detail..." className="w-full min-h-[100px] px-4 py-3.5 bg-white border border-slate-200 rounded-xl resize-none outline-none focus:ring-2 focus:ring-blue-800/20 focus:border-blue-800 transition-all shadow-sm"></textarea>
                                
                                <button
                                    type="button"
                                    onClick={toggleVoiceInput}
                                    className={`mt-2 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm border ${
                                        isListening 
                                            ? 'bg-rose-50 text-rose-600 border-rose-200 animate-pulse' 
                                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                    }`}
                                >
                                    <Mic className={`w-4 h-4 ${isListening ? 'animate-bounce' : ''}`} />
                                    {isListening ? 'Listening...' : 'Start Voice Input'}
                                </button>
                            </div>

                            <hr className="border-slate-200 my-2" />
                            
                            {/* Additional Evidence (Optional) */}
                            <div className="space-y-3">
                                <label className="text-sm font-bold text-slate-700 flex justify-between items-center">
                                    <span>Additional Evidence (Optional)</span>
                                    <span className="text-xs text-slate-400 font-medium">{additionalFiles.length}/3 Files</span>
                                </label>
                                
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    {additionalFiles.map((file, idx) => {
                                        const isVideo = file.type.startsWith('video/');
                                        return (
                                            <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border-2 border-slate-200 group bg-slate-100">
                                                {isVideo ? (
                                                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-800">
                                                        <Video className="w-8 h-8 mb-2 text-slate-300" />
                                                        <span className="text-[10px] truncate w-full px-2 text-center text-slate-300">{file.name}</span>
                                                    </div>
                                                ) : (
                                                    <img src={URL.createObjectURL(file)} alt={`Extra Evidence ${idx + 1}`} className="w-full h-full object-cover" />
                                                )}
                                                
                                                <button 
                                                    type="button" 
                                                    onClick={() => removeAdditionalFile(idx)}
                                                    className="absolute top-2 right-2 w-7 h-7 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-rose-500 hover:bg-rose-500 hover:text-white transition-colors shadow-sm"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        );
                                    })}
                                    
                                    {additionalFiles.length < 3 && (
                                        <label className="aspect-square rounded-2xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center cursor-pointer hover:border-blue-800 hover:bg-blue-50/50 transition-colors bg-white">
                                            <Plus className="w-8 h-8 text-blue-800 mb-1" />
                                            <span className="text-xs font-bold text-slate-500">Add File</span>
                                            <input type="file" multiple accept="image/jpeg, image/png, image/webp, video/mp4, video/quicktime, video/webm" className="hidden" onChange={handleAdditionalFileChange} />
                                        </label>
                                    )}
                                </div>
                                <p className="text-[11px] text-slate-400">Max 3 files. Images up to 5MB. Videos (MP4, MOV, WEBM) up to 30MB.</p>
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
                        <h3 className="text-2xl font-black text-slate-900">Final Review</h3>
                        <p className="text-slate-500">Please verify that the details below are correct before submitting.</p>
                    </div>

                    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm aspect-video">
                            <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
                        </div>
                        <div className="space-y-4">
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Category</p>
                                <p className="text-lg font-bold text-slate-900">{displayCategory(formData.jenis_kerosakan)}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Zone</p>
                                <p className="text-sm font-bold text-slate-900">Zon {formData.id_zon}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Location</p>
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
                        <ChevronLeft className="w-5 h-5" /> Back
                    </button>
                    
                    {currentStep < totalSteps ? (
                        <button 
                            type="button" 
                            onClick={handleNext}
                            disabled={isScanning || (currentStep === 1 && !selectedImage)}
                            className="bg-blue-800 hover:bg-blue-900 text-white font-bold py-3 px-8 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-800/30 transition-all disabled:opacity-50 disabled:shadow-none"
                        >
                            Next <ChevronRight className="w-5 h-5" />
                        </button>
                    ) : (
                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-500/30 transition-all"
                        >
                            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                            Submit Report
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