import React from 'react';
import { motion } from 'framer-motion';
import { UploadCloud, Image as ImageIcon, Loader2, Sparkles, AlertCircle } from 'lucide-react';

const ImageUploader = ({
    imagePreview,
    isScanning,
    handleImageChange,
    clearImage,
    aiPredictions,
    displayCategory
}) => {
    const hasPredictions = aiPredictions && aiPredictions.length > 0;
    const topPrediction = hasPredictions ? aiPredictions[0] : null;

    return (
        <div className="flex flex-col items-center text-center w-full">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
                <ImageIcon className="w-8 h-8 text-blue-800" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">Upload Photo Evidence</h3>
            <p className="text-slate-500 mb-8 max-w-md">
                Upload a photo of damaged roads or public infrastructure. BANDA+ AI will automatically scan and categorize the issue.
            </p>

            <div className="w-full max-w-lg aspect-square">
                {!imagePreview ? (
                <label className="w-full h-full border-2 border-dashed border-slate-300 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-800 hover:bg-blue-50/50 transition-colors group">
                    <UploadCloud className="w-12 h-12 text-blue-800 mb-4 group-hover:scale-110 transition-transform" />
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
                        className="absolute left-0 right-0 h-0.5 bg-blue-400 shadow-[0_0_15px_4px_rgba(59,130,246,0.8)]"
                        animate={{ top: ["0%", "100%", "0%"] }}
                        transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
                        />
                        <motion.div
                        animate={{ scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="flex flex-col items-center z-20"
                        >
                        <div className="w-16 h-16 rounded-full bg-blue-500/20 border-2 border-blue-400 flex items-center justify-center mb-3">
                            <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
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

            {/* Clean AI Result Card */}
            {!isScanning && hasPredictions && (
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-lg mt-6 bg-white border border-slate-200 rounded-3xl p-6 text-left shadow-sm hover:shadow-md transition-shadow"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-800 flex items-center justify-center">
                                <Sparkles className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-black text-slate-900 text-xl leading-tight">AI Result</h4>
                                {topPrediction && (
                                    <p className="text-slate-600 font-bold capitalize">
                                        {displayCategory ? displayCategory(topPrediction.class) : topPrediction.class}
                                    </p>
                                )}
                            </div>
                        </div>
                        {topPrediction && (() => {
                            const pct = Math.round(topPrediction.confidence * 100);
                            let badgeText, badgeColor;
                            if (pct >= 70) {
                                badgeText = 'High confidence';
                                badgeColor = 'bg-blue-100 text-blue-800 border-blue-200';
                            } else if (pct >= 40) {
                                badgeText = 'Needs confirmation';
                                badgeColor = 'bg-amber-100 text-amber-700 border-amber-200';
                            } else {
                                badgeText = 'Please confirm';
                                badgeColor = 'bg-rose-100 text-rose-700 border-rose-200';
                            }
                            return (
                                <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border ${badgeColor}`}>
                                    {badgeText}
                                </span>
                            );
                        })()}
                    </div>
                    
                    <div className="mb-5">
                        {topPrediction && (() => {
                            const pct = Math.round(topPrediction.confidence * 100);
                            let msg, Icon;
                            if (pct >= 70) {
                                msg = 'AI detected this from your photo.';
                                Icon = Sparkles;
                            } else if (pct >= 40) {
                                msg = 'AI detected a possible issue. Please confirm the category.';
                                Icon = AlertCircle;
                            } else {
                                msg = 'AI found a possible match, but user confirmation is required.';
                                Icon = AlertCircle;
                            }
                            return (
                                <div className={`flex items-start gap-2 p-3 rounded-xl border ${pct >= 70 ? 'bg-slate-50 border-slate-100' : 'bg-slate-50 border-slate-200'}`}>
                                    <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${pct >= 70 ? 'text-blue-800' : 'text-slate-500'}`} />
                                    <p className="text-sm text-slate-600 font-medium">{msg}</p>
                                </div>
                            );
                        })()}
                    </div>

                    <div className="space-y-2 border-t border-slate-100 pt-4">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Top Predictions</p>
                        {aiPredictions.slice(0, 3).map((pred, idx) => (
                            <div key={idx} className="flex justify-between items-center px-2">
                                <span className="font-semibold text-slate-700 text-sm capitalize">
                                    {displayCategory ? displayCategory(pred.class) : pred.class}
                                </span>
                                <span className="font-bold text-slate-500 text-sm">
                                    {Math.round(pred.confidence * 100)}%
                                </span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default ImageUploader;

