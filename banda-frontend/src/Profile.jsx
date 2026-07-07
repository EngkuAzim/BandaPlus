import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Save, Loader2, ShieldCheck, Building, Map, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import Sidebar from './Sidebar';

function Profile() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isFetchingPostcode, setIsFetchingPostcode] = useState(false); // New state for API loading
  const [userData, setUserData] = useState(null);
  const displayRole = (r) => ({ 'komuniti': 'Community User', 'admin': 'MPAJ Admin', 'pentadbir': 'MPAJ Admin', 'pegawai': 'Department Officer', 'kontraktor': 'Contractor' })[r?.toLowerCase()] || r || 'Community User';

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    no_telefon: '',
    alamat_1: '',
    alamat_2: '',
    poskod: '',
    bandar: '',
    negeri: ''
  });

  // Fetch initial user data
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response = await axios.get(`/api/user`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setUserData(response.data);
        
        setFormData({
          name: response.data.name || '',
          email: response.data.email || '',
          no_telefon: response.data.no_telefon || '',
          alamat_1: response.data.alamat_1 || '',
          alamat_2: response.data.alamat_2 || '',
          poskod: response.data.poskod || '',
          bandar: response.data.bandar || '',
          negeri: response.data.negeri || ''
        });
        
        setIsLoading(false);
      } catch (error) {
        navigate('/login');
      }
    };
    fetchUser();
  }, [navigate]);

  // LIVE MALAYSIA POSTCODE API LOGIC
  const handlePostcodeChange = async (e) => {
    // Only allow numbers
    const val = e.target.value.replace(/\D/g, '');
    
    // Update the input field immediately
    setFormData(prev => ({ ...prev, poskod: val }));

    // If exactly 5 digits, trigger the API
    if (val.length === 5) {
      setIsFetchingPostcode(true);
      try {
        // Using Zippopotam API for Malaysia (MY)
        const response = await axios.get(`https://api.zippopotam.us/MY/${val}`);
        
        // Zippopotam returns an array of places, we take the first one
        const place = response.data.places[0];
        
        setFormData(prev => ({
          ...prev,
          bandar: place['place name'], // e.g., "Ampang"
          negeri: place['state']       // e.g., "Selangor"
        }));

        toast.success(`Area Detected: ${place['place name']}, ${place['state']}`, {
          icon: <MapPin className="w-4 h-4 text-blue-800" />
        });
      } catch (error) {
        // If API returns 404 (Postcode not found)
        toast.error('Postcode Not Found', {
          description: 'Please enter city and state manually.'
        });
      } finally {
        setIsFetchingPostcode(false);
      }
    }
  };

  // Handle Save
  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const token = localStorage.getItem('token');
      
      // Send the data to your new Laravel endpoint!
      await axios.put(`/api/profil`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Profile Updated!', { 
        description: 'Your address information has been saved successfully.' 
      });
    } catch (error) {
      toast.error('Failed to Save', { 
        description: 'Please try again later.' 
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen bg-slate-50 font-sans">
        <div className="w-72 bg-white border-r border-slate-200 animate-pulse"></div>
        <div className="flex-1 p-8 space-y-6">
          <div className="h-40 bg-slate-200 rounded-2xl animate-pulse"></div>
          <div className="h-96 bg-slate-200 rounded-2xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 font-sans selection:bg-blue-800/20">
      <Sidebar userData={userData} />

      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Top Header */}
        <header className="flex items-center justify-between px-8 py-5 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">User Profile</h2>
            <p className="text-sm text-slate-500 font-medium mt-1">Manage your personal details and contact address</p>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto p-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="max-w-4xl mx-auto space-y-6"
          >
            {/* Top Profile Banner */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex items-center gap-6 relative overflow-hidden">
              <div className="w-24 h-24 rounded-full bg-blue-50 border-2 border-blue-100 text-blue-800 flex items-center justify-center font-black text-3xl shadow-inner z-10">
                {formData.name.charAt(0).toUpperCase()}
              </div>
              <div className="z-10">
                <h3 className="text-2xl font-black text-slate-900">{formData.name}</h3>
                <div className="flex items-center gap-3 mt-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-bold border border-blue-100 capitalize">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Account Type: {displayRole(userData?.peranan)}
                  </span>
                  <span className="text-slate-500 text-sm font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Active
                  </span>
                </div>
              </div>
              {/* Decorative background blob */}
              <div className="absolute -right-10 -top-10 w-64 h-64 bg-blue-50 rounded-full blur-3xl pointer-events-none"></div>
            </div>

            {/* Profile Form */}
            <form onSubmit={handleSave} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              
              {/* SECTION 1: Locked Info */}
              <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                <h4 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-800" />
                  Basic Information (Locked)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Name (Disabled) */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-500">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input 
                        type="text" disabled value={formData.name}
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 font-medium cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* Email (Disabled) */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-500">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input 
                        type="email" disabled value={formData.email}
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 font-medium cursor-not-allowed"
                      />
                    </div>
                  </div>

                </div>
              </div>

              {/* SECTION 2: Editable Address */}
              <div className="p-8">
                <h4 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-800" />
                  Address & Contact Details
                </h4>
                
                <div className="space-y-6">
                  {/* Phone (Editable) */}
                  <div className="space-y-2 md:w-1/2 md:pr-3">
                    <label className="text-sm font-bold text-slate-700">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input 
                        type="tel" required value={formData.no_telefon}
                        onChange={(e) => setFormData({...formData, no_telefon: e.target.value})}
                        className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-blue-800/30 focus:border-blue-800 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <hr className="border-slate-100" />

                  {/* Address Lines */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Address Line 1</label>
                    <input 
                      type="text" placeholder="House No., Street Name..." value={formData.alamat_1}
                      onChange={(e) => setFormData({...formData, alamat_1: e.target.value})}
                      className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-blue-800/30 focus:border-blue-800 outline-none transition-all"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Address Line 2 <span className="text-slate-400 font-normal">(Optional)</span></label>
                    <input 
                      type="text" placeholder="Residential Area, Apartment..." value={formData.alamat_2}
                      onChange={(e) => setFormData({...formData, alamat_2: e.target.value})}
                      className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-blue-800/30 focus:border-blue-800 outline-none transition-all"
                    />
                  </div>

                  {/* Postcode, City, State */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Postcode</label>
                      <div className="relative">
                        <Map className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input 
                          type="text" maxLength="5" placeholder="E.g: 68000" required
                          value={formData.poskod} onChange={handlePostcodeChange}
                          className="w-full pl-12 pr-12 py-3.5 bg-white border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-blue-800/30 focus:border-blue-800 outline-none transition-all"
                        />
                        {/* Tiny Loading Spinner inside Input */}
                        {isFetchingPostcode && (
                           <div className="absolute right-4 top-1/2 -translate-y-1/2">
                               <Loader2 className="w-5 h-5 text-blue-800 animate-spin" />
                           </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">City</label>
                      <div className="relative">
                        <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input 
                          type="text" required value={formData.bandar}
                          onChange={(e) => setFormData({...formData, bandar: e.target.value})}
                          className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-blue-800/30 focus:border-blue-800 outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">State</label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <select 
                          required value={formData.negeri}
                          onChange={(e) => setFormData({...formData, negeri: e.target.value})}
                          className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-blue-800/30 focus:border-blue-800 outline-none transition-all appearance-none"
                        >
                          <option value="">Select State</option>
                          {/* Zippopotam returns states like 'Selangor', 'Johor', 'Kuala Lumpur', etc. */}
                          <option value="Johor">Johor</option>
                          <option value="Kedah">Kedah</option>
                          <option value="Kelantan">Kelantan</option>
                          <option value="Melaka">Melaka</option>
                          <option value="Negeri Sembilan">Negeri Sembilan</option>
                          <option value="Pahang">Pahang</option>
                          <option value="Perak">Perak</option>
                          <option value="Perlis">Perlis</option>
                          <option value="Pulau Pinang">Pulau Pinang</option>
                          <option value="Sabah">Sabah</option>
                          <option value="Sarawak">Sarawak</option>
                          <option value="Selangor">Selangor</option>
                          <option value="Terengganu">Terengganu</option>
                          <option value="W.P. Kuala Lumpur">W.P. Kuala Lumpur</option>
                          <option value="W.P. Labuan">W.P. Labuan</option>
                          <option value="W.P. Putrajaya">W.P. Putrajaya</option>
                        </select>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Action Footer */}
              <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end">
                <button 
                  type="submit" disabled={isSaving}
                  className="bg-blue-800 hover:bg-blue-900 text-white font-bold py-3.5 px-8 rounded-xl transition-all shadow-lg shadow-blue-800/20 hover:-translate-y-0.5 flex items-center gap-2 disabled:opacity-70 disabled:hover:-translate-y-0"
                >
                  {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>

            </form>
          </motion.div>
        </main>
      </div>
    </div>
  );
}

export default Profile;