import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { 
  HardHat, MapPin, Camera, CheckCircle2, AlertCircle,
  Loader2, ArrowLeft, Mic, MicOff, Send, Clock, CalendarClock, History, Save, ChevronRight, Check, Image as ImageIcon, Volume2, X
} from 'lucide-react';
import { toast } from 'sonner';
import Sidebar from './Sidebar';

// Utility for native Web Speech API
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

// App-Themed Swipe Button
function SwipeButton({ onSwipe, text }) {
  const containerRef = useRef(null);
  const [width, setWidth] = useState(0);
  const [swiped, setSwiped] = useState(false);
  const controls = useAnimation();

  useEffect(() => {
    if (containerRef.current) setWidth(containerRef.current.offsetWidth);
  }, []);

  const handleDragEnd = async (e, info) => {
    if (info.offset.x >= width - 80) {
      setSwiped(true);
      onSwipe();
    } else {
      controls.start({ x: 0 });
    }
  };

  if (swiped) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-bold shadow-sm border border-blue-700">
        <Check className="w-5 h-5 mr-2" /> Job Accepted
      </motion.div>
    );
  }

  return (
    <div ref={containerRef} className="relative h-14 bg-slate-900 rounded-2xl flex items-center justify-center overflow-hidden border border-slate-700 shadow-lg">
      <span className="text-blue-400 font-bold text-sm ml-6">{text}</span>
      {width > 0 && (
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: width - 56 }}
          dragElastic={0.05}
          onDragEnd={handleDragEnd}
          animate={controls}
          className="absolute left-1 w-12 h-12 bg-blue-600 rounded-xl shadow-lg flex items-center justify-center cursor-grab active:cursor-grabbing border border-blue-400"
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </motion.div>
      )}
    </div>
  );
}

function SenaraiPembaikan() {
  const [userData, setUserData] = useState(null);
  const [tugasanList, setTugasanList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mobile App State
  const [selectedTask, setSelectedTask] = useState(null);
  const [view, setView] = useState('list'); // 'list', 'details'

  // Timeline / Log State
  const [newLogText, setNewLogText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSendingLog, setIsSendingLog] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  
  const recognitionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Bukti State
  const [file, setFile] = useState(null);
  const [isSavingStatus, setIsSavingStatus] = useState(false);
  const [statusKerja, setStatusKerja] = useState('');
  
  // UI States
  const [showTutupKes, setShowTutupKes] = useState(false);

  const displayStatus = (s) => ({ 'Baru': 'New', 'Dalam Tindakan': 'In Progress', 'Selesai': 'Completed', 'Ditolak': 'Rejected', 'KIV': 'On Hold', 'Dalam Proses': 'In Progress' })[s] || s;
  
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

  // Derived state to check if job is already accepted
  const hasAccepted = selectedTask?.log_kemajuan?.some(log => log.nota.includes('Kerja telah diterima') || log.nota.includes('Job officially accepted') || log.nota.includes('accepted'));

  useEffect(() => {
    fetchData(true);

    // Initialize Speech Recognition
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'ms-MY'; // High accuracy Malay

      recognition.onresult = (event) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            currentTranscript += event.results[i][0].transcript + ' ';
          }
        }
        if (currentTranscript) {
          setNewLogText(prev => prev + currentTranscript);
        }
      };

      recognition.onerror = (event) => {
        console.error("Speech Rec Error:", event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const fetchData = async (isInitial = true) => {
    try {
      const token = localStorage.getItem('token');
      
      if (isInitial) {
        setIsLoading(true);
        const userRes = await axios.get(`/api/user`, { headers: { Authorization: `Bearer ${token}` } });
        setUserData(userRes.data);
      }

      const tugasanRes = await axios.get(`/api/kontraktor/tugasan?t=${Date.now()}`, { 
        headers: { Authorization: `Bearer ${token}`, 'Cache-Control': 'no-cache' } 
      });
      setTugasanList(tugasanRes.data);
      
      setSelectedTask(prev => {
        if (prev) return tugasanRes.data.find(t => t.id_arahan === prev.id_arahan) || prev;
        return prev;
      });
    } catch (error) {
      console.error('Gagal memuat turun data tugasan.', error);
    } finally {
      if (isInitial) setIsLoading(false);
    }
  };

  const handleOpenTask = (task) => {
    setSelectedTask(task);
    setStatusKerja(task.status_kerja);
    setFile(null);
    setNewLogText('');
    setAudioBlob(null);
    setShowTutupKes(false);
    setView('details');
  };

  // --- FEATURE 1: Echo listener for live log updates when a task is open ---
  useEffect(() => {
    if (!selectedTask) return;

    let echoInstance = null;
    import('./echo').then(({ default: echo }) => {
      echoInstance = echo;
      echo.private(`arahan-kerja.${selectedTask.id_arahan}`)
        .listen('.LogKemajuan', (e) => {
          // New log or message arrived — refresh the task data silently
          fetchData(false);
        });
    });

    return () => {
      if (echoInstance) {
        echoInstance.leave(`arahan-kerja.${selectedTask.id_arahan}`);
      }
    };
  }, [selectedTask?.id_arahan]);

  const toggleRecording = async () => {
    if (isRecording) {
      // STOP RECORDING
      if (recognitionRef.current) recognitionRef.current.stop();
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop()); // Stop microphone use completely
      }
      setIsRecording(false);
      toast.info('Recording stopped.');
    } else {
      // START RECORDING
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        // Setup MediaRecorder
        const mediaRecorder = new MediaRecorder(stream);
        audioChunksRef.current = [];
        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunksRef.current.push(e.data);
        };
        mediaRecorder.onstop = () => {
          const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          setAudioBlob(blob);
        };
        mediaRecorder.start();
        mediaRecorderRef.current = mediaRecorder;

        // Setup Web Speech API if supported
        if (SpeechRecognition && recognitionRef.current) {
          recognitionRef.current.start();
        } else if (!SpeechRecognition) {
          toast.warning('Text transcription not supported by this browser. Recording audio only.');
        }

        setIsRecording(true);
        toast.success('Recording started...', { description: 'Please speak into your microphone...' });
      } catch (err) {
        console.error("Mic Access Error: ", err);
        toast.error('Failed to access microphone. Please allow access.');
      }
    }
  };

  const submitLog = async () => {
    if (!newLogText.trim() && !audioBlob) return;
    setIsSendingLog(true);
    const token = localStorage.getItem('token');
    try {
      const formData = new FormData();
      formData.append('nota', newLogText || 'Voice recording log.');
      if (audioBlob) {
        formData.append('audio', audioBlob, 'rakaman_suara.webm');
      }

      await axios.post(
        `/api/kontraktor/tugasan/${selectedTask.id_arahan}/log`,
        formData,
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } }
      );
      toast.success('Progress logged successfully!');
      setNewLogText('');
      setAudioBlob(null);
      fetchData(); // Reload data to get new timeline
    } catch (error) {
      toast.error('Failed to send progress log.');
    } finally {
      setIsSendingLog(false);
    }
  };

  const updateStatusAndProof = async (e) => {
    e.preventDefault();
    setIsSavingStatus(true);
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    try {
      // Dapatkan lokasi GPS semasa untuk validasi backend (geo-fencing)
      let userLat = 0;
      let userLon = 0;
      
      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
        });
        userLat = position.coords.latitude;
        userLon = position.coords.longitude;
      } catch (geoError) {
        // Jika gagal dapatkan lokasi (contoh: pengguna block location), kita boleh hantar 0 
        // tetapi backend mungkin akan reject jika ia melebihi 50 meter.
        toast.warning('Please allow GPS location access for on-site verification.');
        setIsSavingStatus(false);
        return; // Hentikan proses jika tiada GPS
      }

      // 1. Update status
      await axios.put(
        `/api/kontraktor/tugasan/${selectedTask.id_arahan}`, 
        { status_kerja: statusKerja, nota_kontraktor: '' }, 
        { headers }
      );

      // 2. Upload Bukti if provided
      if (file) {
        const formData = new FormData();
        formData.append('gambar_selepas', file);
        formData.append('lat_kontraktor', userLat);
        formData.append('lon_kontraktor', userLon);
        
        await axios.post(
          `/api/kontraktor/tugasan/${selectedTask.id_arahan}/bukti`, 
          formData, 
          { headers: { ...headers, 'Content-Type': 'multipart/form-data' } }
        );
      }

      toast.success('Job status updated successfully!');
      setShowTutupKes(false);
      fetchData(); 
    } catch (error) {
      toast.error('Failed to save status/proof.', {
        description: error.response?.data?.message || 'Please check image format and try again.'
      });
      
      // Jika bukti gagal (cth: lokasi tidak sah), kita kembalikan status ke Dalam Proses supaya mereka boleh cuba lagi
      if (error.response?.status === 422 && error.response?.data?.message?.includes('Lokasi tidak sah')) {
          await axios.put(
            `/api/kontraktor/tugasan/${selectedTask.id_arahan}`, 
            { status_kerja: 'Dalam Proses', nota_kontraktor: '' }, 
            { headers }
          );
          fetchData();
      }
    } finally {
      setIsSavingStatus(false);
    }
  };

  return (
    <div className="flex h-[100dvh] bg-slate-50 font-sans">
      <Sidebar userData={userData} />

      <div className="flex-1 flex flex-col relative overflow-hidden bg-slate-50 md:rounded-l-3xl shadow-2xl">
        
        {/* VIEW 1: LIST OF TASKS (App Theme Style) */}
        <AnimatePresence>
          {view === 'list' && (
            <motion.div 
              initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}
              className="absolute inset-0 flex flex-col overflow-hidden w-full lg:max-w-2xl mx-auto bg-slate-50"
            >
              {/* App Theme Header */}
              <header className="px-6 pt-10 pb-6 bg-slate-900 text-white shadow-lg sticky top-0 z-10 lg:rounded-b-3xl">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-slate-900 border border-blue-400 shadow-md">
                    <HardHat className="w-6 h-6" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-black tracking-tight text-white">Repair Jobs</h1>
                    <p className="text-blue-300 text-sm font-medium">Manage on-site work orders and progress</p>
                  </div>
                </div>
              </header>

              <main className="flex-1 overflow-y-auto px-4 pb-24 space-y-4 pt-4">
                {isLoading ? (
                  <div className="flex justify-center p-12"><Loader2 className="w-10 h-10 animate-spin text-blue-800" /></div>
                ) : tugasanList.length === 0 ? (
                  <div className="text-center p-10 mt-10 bg-white border border-slate-200 rounded-3xl">
                    <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-emerald-200" />
                    <p className="font-bold text-slate-500">Great job! No pending repair jobs.</p>
                  </div>
                ) : (
                  tugasanList.map(task => (
                    <div 
                      key={task.id_arahan} 
                      onClick={() => handleOpenTask(task)}
                      className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 cursor-pointer active:scale-95 transition-all hover:shadow-md hover:border-blue-300"
                    >
                      <div className="flex justify-between items-center mb-3">
                        <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider ${
                          task.status_kerja === 'Selesai' ? 'bg-emerald-100 text-emerald-700' :
                          task.status_kerja === 'Dalam Proses' ? 'bg-amber-100 text-amber-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {displayStatus(task.status_kerja)}
                        </span>
                        <span className="text-xs font-bold text-slate-400">#{task.id_arahan}</span>
                      </div>
                      
                      <h3 className="text-lg font-black text-slate-800 leading-tight mb-2">
                        {displayCategory(task.aduan?.jenis_kerosakan) || 'General Maintenance'}
                      </h3>
                      
                      <div className="flex items-center gap-2 text-slate-500 text-xs font-medium mb-4 bg-slate-50 p-2 rounded-xl border border-slate-100">
                        <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                        <span className="truncate">{task.aduan?.alamat_lokasi}</span>
                      </div>

                      <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                        <div className="text-slate-500 text-xs font-bold flex items-center gap-1.5">
                          <CalendarClock className="w-4 h-4" />
                          {task.tarikh_jangkaan_siap ? new Date(task.tarikh_jangkaan_siap).toLocaleDateString('ms-MY') : 'No Date Set'}
                        </div>
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </main>
              
              {/* Mobile Bottom Nav Spacer */}
              <div className="h-20 lg:hidden bg-slate-50 fixed bottom-0 left-0 right-0 z-0" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* VIEW 2: TASK DETAILS & TIMELINE (App Theme Style) */}
        <AnimatePresence>
          {view === 'details' && selectedTask && (
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: "spring", stiffness: 350, damping: 35 }}
              className="absolute inset-0 bg-slate-50 flex flex-col z-50 w-full lg:max-w-2xl mx-auto shadow-2xl lg:border-x border-slate-200"
            >
              {/* Top Nav Bar */}
              <header className="px-4 py-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between shadow-lg sticky top-0 z-20">
                <button onClick={() => setView('list')} className="flex items-center text-white bg-slate-800 p-2 rounded-xl active:bg-slate-700 transition-colors">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="font-black text-white text-lg">Job #{selectedTask.id_arahan}</div>
                <div className="w-9" /> {/* Balancer */}
              </header>

              <main className="flex-1 overflow-y-auto pb-10">
                {/* Image & Comprehensive Details from Community & Pegawai */}
                <div className="bg-white rounded-b-[2rem] shadow-sm border-b border-slate-200 mb-6 overflow-hidden">
                  {/* Photo Bukti Aduan */}
                  {selectedTask.aduan?.gambar_bukti ? (
                    <div className="w-full h-48 bg-slate-200 relative">
                      <img src={`/storage/${selectedTask.aduan.gambar_bukti}`} alt="Kerosakan" className="w-full h-full object-cover" />
                      <div className="absolute top-4 right-4 bg-black/60 backdrop-blur text-white text-[10px] font-bold px-3 py-1 rounded-full border border-white/20">
                        Community Report
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-32 bg-slate-100 flex flex-col items-center justify-center text-slate-400 border-b border-slate-200">
                      <ImageIcon className="w-8 h-8 mb-1 opacity-50" />
                      <span className="text-xs font-bold">No report photo attached</span>
                    </div>
                  )}

                  {/* Extra Evidence */}
                  {selectedTask.aduan?.evidences && selectedTask.aduan.evidences.length > 0 && (
                      <div className="bg-slate-50 border-b border-slate-200 p-4">
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Additional Evidence</h4>
                          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                              {selectedTask.aduan.evidences.map((ev, idx) => (
                                  <div key={idx} className="w-24 h-24 shrink-0 rounded-2xl overflow-hidden bg-white border-2 border-slate-200 relative shadow-sm">
                                      {ev.file_type === 'video' ? (
                                          <video src={`/storage/${ev.file_path}`} controls className="w-full h-full object-cover bg-slate-900" />
                                      ) : (
                                          <a href={`/storage/${ev.file_path}`} target="_blank" rel="noreferrer">
                                              <img src={`/storage/${ev.file_path}`} className="w-full h-full object-cover hover:scale-105 transition-transform" alt={`Extra Evidence ${idx+1}`} />
                                          </a>
                                      )}
                                  </div>
                              ))}
                          </div>
                      </div>
                  )}

                  <div className="px-6 py-6">
                    <h3 className="text-2xl font-black text-slate-900 leading-tight mb-2">{displayCategory(selectedTask.aduan?.jenis_kerosakan)}</h3>
                    
                    {/* Location & Zon */}
                    <div className="flex flex-col gap-2 mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex items-start gap-2 text-slate-600 text-sm font-medium">
                        <MapPin className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                        <p>{selectedTask.aduan?.alamat_lokasi}</p>
                      </div>
                      {selectedTask.aduan?.zon && (
                        <div className="flex items-center gap-2 mt-2">
                          <span className="px-3 py-1 rounded-lg bg-blue-100 text-blue-800 text-[10px] font-black uppercase border border-blue-200">
                            Zone: {selectedTask.aduan.zon}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Keterangan Komuniti */}
                    <div className="mb-4">
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                        Community Description
                      </h4>
                      <p className="text-sm text-slate-700 leading-relaxed font-medium bg-slate-50 p-4 rounded-2xl border border-slate-200">
                        {selectedTask.aduan?.keterangan_aduan || 'No additional description provided by reporter.'}
                      </p>
                    </div>

                    {/* Arahan Pegawai */}
                    <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200">
                      <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                        <HardHat className="w-3 h-3" /> Mandatory Officer Instructions
                      </p>
                      <p className="text-sm font-medium text-amber-900 leading-relaxed">
                        {selectedTask.nota_pegawai || 'Proceed with repairs according to BANDA+ standard quality specifications.'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* SLIDE TO ACCEPT */}
                {selectedTask.status_kerja !== 'Selesai' && !hasAccepted && (
                  <div className="px-6 mb-8">
                    <SwipeButton 
                      text="Slide to Accept Job" 
                      onSwipe={async () => {
                        const token = localStorage.getItem('token');
                        await axios.post(
                          `/api/kontraktor/tugasan/${selectedTask.id_arahan}/log`,
                          { nota: 'Job officially accepted by contractor.' },
                          { headers: { Authorization: `Bearer ${token}` } }
                        );
                        toast.success('Job accepted successfully!');
                        fetchData();
                      }} 
                    />
                  </div>
                )}

                {/* Section 2: Kemaskini Timeline (Voice to Text Feature) */}
                <div className="px-6 mb-8">
                  <div className="flex items-center gap-2 mb-4">
                    <History className="w-5 h-5 text-blue-800" />
                    <h4 className="font-black text-slate-800 text-lg">On-Site Progress Log</h4>
                  </div>

                  {/* Add New Log Input */}
                  {selectedTask.status_kerja !== 'Selesai' && (
                    <div className="mb-6">
                      <div className="bg-white p-2.5 rounded-3xl border-2 border-slate-200 shadow-sm flex items-end gap-2 focus-within:border-blue-800 transition-colors">
                        <div className="flex-1 pl-3 pb-2 pt-2">
                          <textarea 
                            rows="2"
                            value={newLogText}
                            onChange={(e) => setNewLogText(e.target.value)}
                            placeholder="Type note or use voice recording..."
                            className="w-full text-sm font-medium bg-transparent outline-none resize-none placeholder-slate-400 text-slate-800"
                          />
                        </div>
                        
                        <button 
                          type="button"
                          onClick={toggleRecording}
                          className={`p-3.5 rounded-2xl transition-all flex-shrink-0 ${isRecording ? 'bg-rose-500 text-white animate-pulse shadow-md shadow-rose-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                        >
                          {isRecording ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                        </button>

                        <button 
                          type="button"
                          onClick={submitLog}
                          disabled={(!newLogText.trim() && !audioBlob) || isSendingLog}
                          className="p-3.5 rounded-2xl bg-slate-900 text-white transition-all flex-shrink-0 disabled:opacity-50 hover:bg-blue-800"
                        >
                          {isSendingLog ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-0.5" />}
                        </button>
                      </div>

                      {/* Audio Attachment Preview */}
                      {audioBlob && (
                        <div className="mt-3 flex items-center justify-between bg-blue-50 p-3 rounded-2xl border border-blue-200">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white"><Volume2 className="w-4 h-4" /></div>
                            <span className="text-sm font-bold text-blue-800">Audio Recording Ready</span>
                          </div>
                          <button onClick={() => setAudioBlob(null)} className="p-2 hover:bg-blue-100 rounded-full text-blue-800">
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Timeline Render */}
                  <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:h-full before:w-[2px] before:bg-slate-200">
                    {(!selectedTask.log_kemajuan || selectedTask.log_kemajuan.length === 0) ? (
                      <p className="text-center text-xs font-bold text-slate-400 py-4 bg-white rounded-2xl border border-slate-100">No progress logs recorded yet.</p>
                    ) : (
                      selectedTask.log_kemajuan.slice().reverse().map((log, idx) => (
                        <div key={idx} className="relative flex items-start">
                          <div className={`w-10 h-10 rounded-full border-4 border-slate-50 flex items-center justify-center shrink-0 z-10 shadow-sm mt-0.5 ${log.role === 'pegawai' ? 'bg-amber-100 text-amber-600' : 'bg-blue-50 text-blue-800'}`}>
                            {log.role === 'pegawai' ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                          </div>
                          <div className={`p-4 rounded-3xl border ml-3 flex-1 shadow-sm ${log.role === 'pegawai' ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-200'}`}>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                              {new Date(log.tarikh).toLocaleString('ms-MY', { dateStyle: 'medium', timeStyle: 'short' })}
                              {log.role === 'pegawai' && <span className="ml-2 text-amber-600">OFFICER</span>}
                            </p>
                            <p className="text-sm font-medium text-slate-800 leading-relaxed mb-2">{log.nota}</p>
                            {log.audio && (
                              <audio controls src={`/storage/${log.audio}`} className="w-full h-10 mt-2 outline-none" />
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Section 3: Final Submission (Hidden behind a button) */}
                {selectedTask.status_kerja !== 'Selesai' && !showTutupKes && (
                  <div className="px-6 mb-10">
                    <button 
                      onClick={() => {
                        setShowTutupKes(true);
                        setStatusKerja('Selesai');
                      }}
                      className="w-full bg-rose-50 border-2 border-rose-200 text-rose-600 font-black text-lg py-4 rounded-3xl active:bg-rose-100 transition-colors shadow-sm"
                    >
                      Complete & Close Job
                    </button>
                  </div>
                )}

                {showTutupKes && selectedTask.status_kerja !== 'Selesai' && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="px-6 mb-10">
                    <h4 className="font-black text-slate-800 text-lg mb-4 flex items-center gap-2">
                      <Camera className="w-5 h-5 text-blue-800" /> Upload Final Proof
                    </h4>
                    
                    <form onSubmit={updateStatusAndProof} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-5">
                      <div>
                        <div className={`relative border-2 border-dashed rounded-2xl p-8 text-center overflow-hidden transition-colors cursor-pointer ${file ? 'border-blue-600 bg-blue-50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100'}`}>
                          <input 
                            type="file" accept="image/*" capture="environment"
                            onChange={(e) => setFile(e.target.files[0])}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                            required={!selectedTask.gambar_selepas}
                          />
                          
                          {file ? (
                            <div className="flex flex-col items-center gap-2">
                              <CheckCircle2 className="w-12 h-12 text-blue-600" />
                              <p className="text-sm font-bold text-blue-800 break-all">{file.name}</p>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-3">
                              <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
                                <Camera className="w-8 h-8" />
                              </div>
                              <div>
                                <p className="text-base font-black text-slate-800">Take Photo (GPS Camera Required)</p>
                                <p className="text-xs font-bold text-slate-400 mt-1">Photo with GPS verification required before closing</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <button 
                        type="submit" 
                        disabled={isSavingStatus} 
                        className="w-full bg-slate-900 text-white hover:bg-blue-800 font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-2 text-lg disabled:opacity-50 shadow-lg shadow-slate-200"
                      >
                        {isSavingStatus ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />} Confirm Job Completion
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setShowTutupKes(false)}
                        className="w-full bg-slate-100 text-slate-600 font-bold py-3.5 rounded-2xl active:bg-slate-200 transition-colors text-sm"
                      >
                        Cancel
                      </button>
                    </form>
                  </motion.div>
                )}
              </main>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}

export default SenaraiPembaikan;
