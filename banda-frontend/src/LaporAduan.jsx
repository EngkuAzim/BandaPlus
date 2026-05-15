import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { UploadCloud, FileText, MapPin, Send, Loader2, AlertCircle, X, Image as ImageIcon, Map } from 'lucide-react';
import { toast } from 'sonner';
import Sidebar from './Sidebar';
import exifr from 'exifr';

function LaporAduan() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  
  const [formData, setFormData] = useState({
    jenis_kerosakan: '',
    id_zon: '', 
    alamat_lokasi: '',
    keterangan_aduan: '',
    lat: null, 
    lng: null, 
  });
  
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) navigate('/login');
    axios.get(`/api/user`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setUserData(res.data)).catch(() => navigate('/login'));
  }, [navigate]);

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

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Gambar Terlalu Besar', { description: 'Maksimum 5MB.'});
        return;
      }
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));

      try {
        const gpsData = await exifr.gps(file);
        
        if (gpsData && gpsData.latitude && gpsData.longitude) {
          fetchAddressFromCoords(gpsData.latitude, gpsData.longitude);
        } else {
          toast.info('Tiada Data GPS', { description: 'Gambar ini tiada data lokasi. Sila gunakan butang peta.' });
        }
      } catch (error) {
        console.error('Ralat membaca EXIF:', error);
        toast.info('Ralat GPS', { description: 'Tidak dapat membaca data lokasi gambar ini.' });
      }
    }
  };

  const getCurrentLocation = () => {
    setIsLocating(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchAddressFromCoords(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          setIsLocating(false);
          toast.error('Akses Ditolak', { description: 'Sila benarkan akses lokasi pada pelayar web anda.' });
        }
      );
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setFormData(prev => ({...prev, lat: null, lng: null, alamat_lokasi: ''}));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedImage) return toast.error('Gambar Diperlukan');

    setIsSubmitting(true);
    const submitData = new FormData();
    submitData.append('jenis_kerosakan', formData.jenis_kerosakan);
    submitData.append('id_zon', formData.id_zon);
    submitData.append('alamat_lokasi', formData.alamat_lokasi);
    submitData.append('keterangan_aduan', formData.keterangan_aduan);
    submitData.append('gambar_bukti', selectedImage);
    
    if (formData.lat && formData.lng) {
      submitData.append('lat', formData.lat);
      submitData.append('lng', formData.lng);
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(`/api/aduan`, submitData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Aduan Berjaya Dihantar!');
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (error) {
      toast.error('Gagal Menghantar Aduan');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      <Sidebar userData={userData} />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <header className="flex items-center justify-between px-8 py-5 bg-white border-b border-slate-200">
          <h2 className="text-2xl font-black text-slate-900">Lapor Aduan</h2>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto p-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
            <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row">
              
              {/* IMAGE UPLOAD SECTION */}
              <div className="w-full md:w-5/12 bg-slate-50 p-8 border-r border-slate-200 flex flex-col">
                <h4 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-teal-600" /> Gambar Bukti
                </h4>
                <div className="flex-1 flex flex-col items-center justify-center">
                  {!imagePreview ? (
                    <label className="w-full h-full min-h-[300px] border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-teal-500 hover:bg-teal-50/50 transition-colors group">
                      <UploadCloud className="w-8 h-8 text-teal-600 mb-4" />
                      <p className="font-bold text-slate-700">Muat Naik Gambar</p>
                      <input type="file" accept="image/jpeg, image/png" className="hidden" onChange={handleImageChange} />
                    </label>
                  ) : (
                    <div className="relative w-full h-full min-h-[300px] rounded-2xl overflow-hidden border border-slate-200 group">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                         <button type="button" onClick={clearImage} className="bg-rose-500 text-white font-bold py-2 px-4 rounded-lg">Batal</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* DETAILS SECTION */}
              <div className="w-full md:w-7/12 p-8 flex flex-col">
                <h4 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-teal-600" /> Butiran Kerosakan
                </h4>
                
                <div className="space-y-6 flex-1">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Kategori Kerosakan</label>
                    <select required value={formData.jenis_kerosakan} onChange={(e) => setFormData({...formData, jenis_kerosakan: e.target.value})} className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl outline-none">
                      <option value="" disabled>Pilih Kategori...</option>
                      <option value="Jalan Berlubang">Jalan Berlubang</option>
                      <option value="Lampu Jalan Rosak">Lampu Jalan Rosak</option>
                      <option value="Longkang Tersumbat/Pecah">Longkang Tersumbat/Pecah</option>
                      <option value="Pokok Tumbang">Pokok Tumbang</option>
                      <option value="Infrastruktur Awam">Infrastruktur Awam (Taman/Surau)</option>
                      <option value="Lain-lain">Lain-lain</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Zon MPAJ</label>
                    <select required value={formData.id_zon} onChange={(e) => setFormData({...formData, id_zon: e.target.value})} className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl outline-none">
                      <option value="" disabled>Pilih Zon Anda...</option>
                      <option value="1">Zon 1 (Taman Melawati)</option>
                      <option value="2">Zon 2 (Klang Gates / Ukay Perdana)</option>
                      <option value="3">Zon 3 (Bukit Antarabangsa)</option>
                      <option value="4">Zon 4 (Ukay Bistari)</option>
                      <option value="5">Zon 5 (Ampang Jaya)</option>
                    </select>
                  </div>

                  {/* ALAMAT & MAP BUTTON */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-end">
                       <label className="text-sm font-bold text-slate-700">Alamat Kejadian</label>
                       <button type="button" onClick={getCurrentLocation} disabled={isLocating} className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1 bg-teal-50 px-3 py-1.5 rounded-lg transition-colors">
                         {isLocating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Map className="w-3 h-3" />}
                         Guna Lokasi Semasa
                       </button>
                    </div>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input type="text" required placeholder="Contoh: Hadapan SMK Taman Melawati..." value={formData.alamat_lokasi} onChange={(e) => setFormData({...formData, alamat_lokasi: e.target.value})} className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl outline-none" />
                    </div>
                  </div>

                  <div className="space-y-2 flex-1 flex flex-col">
                    <label className="text-sm font-bold text-slate-700">Keterangan Lanjut</label>
                    <textarea value={formData.keterangan_aduan} onChange={(e) => setFormData({...formData, keterangan_aduan: e.target.value})} className="w-full flex-1 min-h-[120px] px-4 py-3.5 bg-white border border-slate-200 rounded-xl resize-none outline-none"></textarea>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
                  <button type="submit" disabled={isSubmitting} className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-3.5 px-8 rounded-xl flex items-center gap-2">
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    Hantar Aduan
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </main>
      </div>
    </div>
  );
}

export default LaporAduan;