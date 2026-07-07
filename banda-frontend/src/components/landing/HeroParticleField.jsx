import React, { useEffect } from 'react';
import { motion, useMotionValue, useSpring, useMotionTemplate } from 'framer-motion';

export default function HeroParticleField() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { stiffness: 100, damping: 30, mass: 1 };
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);

  // A very subtle blue/indigo glow that follows the cursor, 
  // mimicking the clean, minimal interaction of antigravity.google
  const glowBackground = useMotionTemplate`radial-gradient(1000px circle at calc(50% + ${springX}px) calc(50% + ${springY}px), rgba(37, 99, 235, 0.05), transparent 50%)`;

  useEffect(() => {
    const handleMouseMove = (e) => {
      // Small parallax offset for the background glow
      const x = (e.clientX / window.innerWidth - 0.5) * 60;
      const y = (e.clientY / window.innerHeight - 0.5) * 60;
      
      mouseX.set(x);
      mouseY.set(y);
    };

    if (window.matchMedia('(pointer: fine)').matches) {
      window.addEventListener('mousemove', handleMouseMove);
    }
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <motion.div
        className="absolute inset-0"
        style={{ background: glowBackground }}
      />
      
      {/* Edge glows (very soft) */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-50/50 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-50/50 rounded-full blur-[120px] translate-y-1/4 -translate-x-1/4"></div>
    </div>
  );
}
