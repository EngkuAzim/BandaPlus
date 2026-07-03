import React from 'react';
import { motion } from 'framer-motion';
import { UploadCloud, Image as ImageIcon, Loader2 } from 'lucide-react';

const ImageUploader = ({
    imagePreview,
    isScanning,
    handleImageChange,
    clearImage
}) => {
    return (
        <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center mb-4">
                <ImageIcon className="w-8 h-8 text-teal-600" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">Upload Photo Evidence</h3>
            <p className="text-slate-500 mb-8 max-w-md">
                Upload a photo of damaged roads or public infrastructure. BANDA+ AI will automatically scan and categorize the issue.
            </p>

            <div className="w-full max-w-lg aspect-square">
                {!imagePreview ? (
                <label className="w-full h-full border-2 border-dashed border-slate-300 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:border-teal-500 hover:bg-teal-50/50 transition-colors group">
                    <UploadCloud className="w-12 h-12 text-teal-600 mb-4 group-hover:scale-110 transition-transform" />
                    <p className="font-bold text-slate-700 text-lg">Click to Upload Photo</p>
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
                        <span className="text-white font-bold tracking-widest text-sm uppercase">Analyzing...</span>
                        </motion.div>
                    </div>
                    )}

                    {!isScanning && (
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
                        <button type="button" onClick={clearImage} className="bg-rose-500 hover:bg-rose-600 transition-colors text-white font-bold py-2 px-6 rounded-xl shadow-lg">Cancel & Change Photo</button>
                    </div>
                    )}
                </div>
                )}
            </div>
        </div>
    );
};

export default ImageUploader;
