import React from 'react';

const DetectionViewModal = ({ complaint, onClose }) => {
    if (!complaint) return null;

    // Determine status for UI representation
    // Assuming 'processing' could be explicit or implicit (like 'Dalam Tindakan')
    const isProcessing = complaint.status === 'processing' || complaint.status === 'Dalam Tindakan' || (!complaint.ai_predictions && complaint.status !== 'verified');
    
    // Parse predictions safely handling both stringified JSON and array formats
    let predictions = [];
    if (typeof complaint.ai_predictions === 'string') {
        try {
            predictions = JSON.parse(complaint.ai_predictions);
        } catch (e) {
            console.error("Failed to parse ai_predictions", e);
        }
    } else if (Array.isArray(complaint.ai_predictions)) {
        predictions = complaint.ai_predictions;
    }

    // Helper to format confidence cleanly
    const formatConfidence = (conf) => {
        // If confidence is 0.87, multiply by 100. If it's already 87, keep it.
        const percentage = typeof conf === 'number' && conf <= 1 ? conf * 100 : conf;
        return Number(percentage).toFixed(2);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/80 backdrop-blur-sm transition-opacity">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
                
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                            AI Analysis Report
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Complaint ID: {complaint.id_aduan || complaint.complaint_id || 'N/A'}
                        </p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    {isProcessing ? (
                        <div className="flex flex-col items-center justify-center py-24 space-y-6">
                            <div className="relative">
                                {/* Sleek animated Tailwind rings */}
                                <div className="w-24 h-24 border-4 border-emerald-100 dark:border-emerald-900/30 rounded-full"></div>
                                <div className="absolute top-0 left-0 w-24 h-24 border-4 border-emerald-500 rounded-full border-t-transparent animate-spin"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <svg className="w-8 h-8 text-emerald-500 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="text-center space-y-2">
                                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                                    Processing Image...
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                                    Our YOLOv8 worker is currently analyzing the road conditions for anomalies. Please wait while the engine runs.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {/* Images Comparison (Side-by-side) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-medium text-gray-700 dark:text-gray-300">Original Image</h4>
                                        <span className="text-xs px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-md font-medium tracking-wide">
                                            Source
                                        </span>
                                    </div>
                                    <div className="rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 aspect-video relative group">
                                        <img 
                                            src={complaint.gambar_bukti ? (complaint.gambar_bukti.startsWith('http') ? complaint.gambar_bukti : `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/storage/${complaint.gambar_bukti}`) : '/placeholder-image.jpg'} 
                                            alt="Original" 
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-medium text-gray-700 dark:text-gray-300">AI Detection</h4>
                                        <span className="text-xs px-2.5 py-1 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 rounded-md font-medium tracking-wide flex items-center gap-1.5 border border-emerald-200 dark:border-emerald-800">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                            Verified
                                        </span>
                                    </div>
                                    <div className="rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 border-2 border-emerald-500/30 aspect-video relative group shadow-[0_0_20px_rgba(16,185,129,0.15)]">
                                        <img 
                                            src={complaint.detected_image_path ? (complaint.detected_image_path.startsWith('http') ? complaint.detected_image_path : `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/${complaint.detected_image_path}`) : '/placeholder-image.jpg'} 
                                            alt="AI Processed" 
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Predictions List Badge/Bars */}
                            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5 border border-gray-100 dark:border-gray-700">
                                <h4 className="text-sm font-bold text-gray-800 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Detected Objects
                                </h4>
                                
                                {predictions.length > 0 ? (
                                    <div className="space-y-4">
                                        {predictions.map((pred, idx) => (
                                            <div key={idx} className="bg-white dark:bg-gray-800/80 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-700 transition-all hover:border-emerald-500/30 hover:shadow-md">
                                                <div className="flex justify-between items-center mb-2.5">
                                                    <span className="font-semibold text-gray-800 dark:text-gray-200 capitalize tracking-tight text-base">
                                                        {pred.class || pred.name || 'Unknown Object'}
                                                    </span>
                                                    <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2.5 py-1 rounded-md border border-emerald-100 dark:border-emerald-800/50">
                                                        {formatConfidence(pred.confidence)}%
                                                    </span>
                                                </div>
                                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                                                    <div 
                                                        className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-full rounded-full transition-all duration-1000 ease-out" 
                                                        style={{ width: `${formatConfidence(pred.confidence)}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm bg-white dark:bg-gray-800/50 rounded-lg border border-dashed border-gray-200 dark:border-gray-700">
                                        No objects detected or prediction data unavailable.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DetectionViewModal;
