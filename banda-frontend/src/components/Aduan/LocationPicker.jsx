import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PencilLine, Map as MapIcon, Navigation, MapPin, Loader2 } from 'lucide-react';
import Map, { Marker, NavigationControl } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';

const LocationPicker = ({
    locationMethod,
    handleLocationMethodChange,
    formData,
    setFormData,
    isLocating,
    viewState,
    setViewState,
    handleMapClick,
    MAPBOX_TOKEN
}) => {
    const mapRef = useRef(null);
    return (
        <div className="space-y-4">
            <div>
                <label className="text-sm font-bold text-slate-700">Location Setting Method</label>
                <p className="text-xs text-slate-500 mb-3">Select how you want to pinpoint the issue location.</p>
                <div className="grid grid-cols-3 gap-3">
                    <button type="button" onClick={() => handleLocationMethodChange('alamat')} className={`flex flex-col items-center justify-center gap-2 p-3 sm:p-4 rounded-2xl border-2 transition-all focus:outline-none focus:ring-4 focus:ring-blue-800/20 ${locationMethod === 'alamat' ? 'border-blue-800 bg-blue-50/50 text-blue-800 shadow-sm scale-[1.02]' : 'border-slate-200 hover:border-blue-200 bg-white text-slate-500 hover:bg-slate-50'}`}>
                        <PencilLine className={`w-5 h-5 sm:w-6 sm:h-6 ${locationMethod === 'alamat' ? 'text-blue-800' : 'text-slate-400'}`} />
                        <span className="text-[10px] sm:text-xs font-bold text-center leading-tight">Manual<br/>Address</span>
                    </button>
                    
                    <button type="button" onClick={() => handleLocationMethodChange('peta')} className={`flex flex-col items-center justify-center gap-2 p-3 sm:p-4 rounded-2xl border-2 transition-all focus:outline-none focus:ring-4 focus:ring-blue-800/20 ${locationMethod === 'peta' ? 'border-blue-800 bg-blue-50/50 text-blue-800 shadow-sm scale-[1.02]' : 'border-slate-200 hover:border-blue-200 bg-white text-slate-500 hover:bg-slate-50'}`}>
                        <MapIcon className={`w-5 h-5 sm:w-6 sm:h-6 ${locationMethod === 'peta' ? 'text-blue-800' : 'text-slate-400'}`} />
                        <span className="text-[10px] sm:text-xs font-bold text-center leading-tight">Pin on<br/>Map</span>
                    </button>

                    <button type="button" onClick={() => handleLocationMethodChange('gps')} className={`flex flex-col items-center justify-center gap-2 p-3 sm:p-4 rounded-2xl border-2 transition-all focus:outline-none focus:ring-4 focus:ring-blue-800/20 ${locationMethod === 'gps' ? 'border-blue-800 bg-blue-50/50 text-blue-800 shadow-sm scale-[1.02]' : 'border-slate-200 hover:border-blue-200 bg-white text-slate-500 hover:bg-slate-50'}`}>
                        <Navigation className={`w-5 h-5 sm:w-6 sm:h-6 ${locationMethod === 'gps' ? 'text-blue-800' : 'text-slate-400'}`} />
                        <span className="text-[10px] sm:text-xs font-bold text-center leading-tight">Use<br/>GPS</span>
                    </button>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {locationMethod === 'alamat' && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-1.5">
                        <label className="text-sm font-bold text-slate-700">Full Address</label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input type="text" required placeholder="e.g. No 12, Jalan Melawati..." value={formData.alamat_lokasi} onChange={(e) => setFormData({...formData, alamat_lokasi: e.target.value})} className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-800/20 focus:border-blue-800 transition-all shadow-sm" />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
            {(locationMethod === 'peta' || locationMethod === 'gps') && (
                <motion.div 
                    initial={{ opacity: 0, height: 0 }} 
                    animate={{ opacity: 1, height: 'auto' }} 
                    exit={{ opacity: 0, height: 0 }} 
                    onAnimationComplete={() => {
                        setTimeout(() => {
                            mapRef.current?.resize();
                            window.dispatchEvent(new Event('resize'));
                        }, 50);
                    }}
                    className="flex flex-col gap-3"
                >
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-bold text-slate-700">Interactive Map</label>
                        {isLocating && <span className="text-xs font-bold text-blue-800 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin"/> Locating...</span>}
                    </div>
                    <div className="w-full h-[300px] sm:h-[400px] rounded-2xl overflow-hidden border-2 border-slate-200 relative shadow-inner">
                        <Map ref={mapRef} {...viewState} onMove={evt => setViewState(evt.viewState)} onClick={handleMapClick} mapboxAccessToken={MAPBOX_TOKEN} mapStyle="mapbox://styles/mapbox/satellite-streets-v12" cursor={locationMethod === 'peta' || locationMethod === 'gps' ? 'crosshair' : 'grab'}>
                            <NavigationControl position="top-left" />
                            {formData.lat && formData.lng && <Marker longitude={formData.lng} latitude={formData.lat} color="#ef4444" />}
                        </Map>
                    </div>
                    {formData.alamat_lokasi && (
                        <p className="text-xs font-medium text-slate-500 p-3 bg-slate-50 rounded-xl border border-slate-200 flex gap-2 items-start"><span className="shrink-0 text-base">📌</span> <span><span className="font-bold text-slate-700">Detected Address:</span> {formData.alamat_lokasi}</span></p>
                    )}
                </motion.div>
            )}
            </AnimatePresence>
        </div>
    );
};

export default LocationPicker;
