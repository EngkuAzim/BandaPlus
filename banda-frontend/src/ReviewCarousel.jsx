import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, MessageSquare } from 'lucide-react';
import axios from 'axios';

const ReviewCarousel = () => {
    // Starts empty! No mock data.
    const [reviews, setReviews] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    // 1. Fetch REAL reviews from Laravel API
    useEffect(() => {
        const fetchReviews = async () => {
            try {
                // You will build this endpoint in Laravel later!
                const response = await axios.get(`/api/public/reviews`);
                if (response.data && response.data.length > 0) {
                    setReviews(response.data);
                }
            } catch (error) {
                // Silently fail if endpoint doesn't exist yet
                console.log("Menunggu API ulasan disiapkan...");
            }
        };
        fetchReviews();
    }, []);

    // 2. The Auto-Sliding Logic (Runs every 6 seconds)
    useEffect(() => {
        // Don't run the timer if we have 0 or 1 review
        if (reviews.length <= 1) return;

        const timer = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % reviews.length);
        }, 6000); 

        return () => clearInterval(timer);
    }, [reviews.length]);

    // 3. FALLBACK: What to show while waiting for real people to input data
    if (reviews.length === 0) {
        return (
            <div className="relative z-10 mt-auto bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 max-w-md shadow-2xl">
                <div className="flex items-center gap-4 mb-3">
                    <MessageSquare className="w-8 h-8 text-blue-400" />
                    <h3 className="text-white font-bold text-lg">Community Voices</h3>
                </div>
                <p className="text-slate-400 text-sm font-medium leading-relaxed">
                    This section displays real feedback and reviews from Ampang Jaya residents regarding the BANDA+ system.
                </p>
            </div>
        );
    }

    const currentReview = reviews[currentIndex];

    // 4. THE ANIMATED SLIDER (When real data exists)
    return (
        <div className="relative z-10 mt-auto max-w-md h-44"> 
            {/* Fixed height (h-44) ensures the layout doesn't jump during animation */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="absolute inset-0 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col"
                >
                    <div className="flex gap-1 mb-3">
                        {/* Dynamically render stars based on actual input */}
                        {[...Array(currentReview.rating || 5)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                        ))}
                    </div>
                    <p className="text-slate-300 font-medium leading-relaxed mb-4 text-sm line-clamp-3">
                        "{currentReview.text}"
                    </p>
                    <div className="flex items-center gap-3 mt-auto">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white font-bold text-xs uppercase">
                            {currentReview.author.charAt(0)}
                        </div>
                        <span className="text-white text-sm font-bold">
                            {currentReview.author}, {currentReview.location}
                        </span>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default ReviewCarousel;