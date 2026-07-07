import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * HeroParticleField
 * ─────────────────
 * A lightweight, cursor-reactive particle background for the BANDA+ hero section.
 *
 * Implementation:
 *  - 40 small dots drawn on a <canvas> element, animated in a slow drift loop
 *  - A CSS radial gradient "spotlight" that follows the cursor (via inline style)
 *  - 6 soft SVG ray lines, gently pulsing with Framer Motion
 *  - respects prefers-reduced-motion: disables cursor reactivity & drift
 *  - On mobile (pointer: coarse) cursor tracking is disabled
 */

const PARTICLE_COUNT = 40;
const COLORS = ['#3b82f6', '#6366f1', '#f59e0b', '#93c5fd', '#c7d2fe'];

function randomBetween(a, b) {
  return a + Math.random() * (b - a);
}

function initParticles(w, h) {
  return Array.from({ length: PARTICLE_COUNT }, () => ({
    x: randomBetween(0, w),
    y: randomBetween(0, h),
    r: randomBetween(1, 2.8),
    vx: randomBetween(-0.12, 0.12),
    vy: randomBetween(-0.12, 0.12),
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    opacity: randomBetween(0.15, 0.55),
  }));
}

export default function HeroParticleField() {
  const shouldReduceMotion = useReducedMotion();
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const rafRef = useRef(null);
  const containerRef = useRef(null);

  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const isMobile = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;

  // Init canvas particles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { width, height } = canvas.getBoundingClientRect();
    canvas.width = width;
    canvas.height = height;
    particlesRef.current = initParticles(width, height);

    if (shouldReduceMotion) return;

    const ctx = canvas.getContext('2d');
    let running = true;

    function tick() {
      if (!running) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particlesRef.current.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -4) p.x = canvas.width + 4;
        if (p.x > canvas.width + 4) p.x = -4;
        if (p.y < -4) p.y = canvas.height + 4;
        if (p.y > canvas.height + 4) p.y = -4;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.fill();
        ctx.globalAlpha = 1;
      });
      rafRef.current = requestAnimationFrame(tick);
    }

    tick();
    return () => {
      running = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [shouldReduceMotion]);

  // Resize observer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const observer = new ResizeObserver(() => {
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = width;
      canvas.height = height;
      particlesRef.current = initParticles(width, height);
    });
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  // Cursor tracking (desktop only)
  const handleMouseMove = useCallback(
    (e) => {
      if (isMobile || shouldReduceMotion) return;
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setMousePos({ x, y });
    },
    [isMobile, shouldReduceMotion]
  );

  const rayAngles = [0, 30, 60, 90, 120, 150];

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="absolute inset-0 pointer-events-none overflow-hidden"
      aria-hidden="true"
    >
      {/* Canvas particle layer */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full opacity-70"
      />

      {/* Cursor-reactive radial spotlight */}
      {!shouldReduceMotion && (
        <div
          className="absolute inset-0 transition-opacity duration-300"
          style={{
            background: `radial-gradient(ellipse 55% 45% at ${mousePos.x}% ${mousePos.y}%, rgba(30,64,175,0.10) 0%, rgba(99,102,241,0.05) 40%, transparent 70%)`,
          }}
        />
      )}

      {/* Reduced-motion fallback: static central glow */}
      {shouldReduceMotion && (
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 65% 55% at 50% 50%, rgba(30,64,175,0.08) 0%, transparent 70%)',
          }}
        />
      )}

      {/* Animated SVG ray lines */}
      {!shouldReduceMotion && (
        <motion.svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
        >
          {rayAngles.map((angle, i) => {
            const rad = (angle * Math.PI) / 180;
            const x2 = 50 + 80 * Math.cos(rad);
            const y2 = 50 + 80 * Math.sin(rad);
            return (
              <motion.line
                key={i}
                x1="50"
                y1="50"
                x2={x2}
                y2={y2}
                stroke={i % 2 === 0 ? '#3b82f6' : '#f59e0b'}
                strokeWidth="0.12"
                initial={{ strokeOpacity: 0 }}
                animate={{
                  strokeOpacity: [0, 0.12, 0.04, 0.10, 0],
                  strokeDashoffset: [0, -20],
                }}
                transition={{
                  duration: 6 + i * 1.2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: i * 0.8,
                }}
                strokeDasharray="4 6"
              />
            );
          })}
        </motion.svg>
      )}

      {/* Ambient glow orbs */}
      <div
        className="absolute rounded-full blur-[100px] opacity-20"
        style={{
          width: '500px',
          height: '500px',
          top: '-10%',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'radial-gradient(circle, #1e3a8a 0%, #3730a3 60%, transparent 100%)',
        }}
      />
      <div
        className="absolute rounded-full blur-[80px] opacity-10"
        style={{
          width: '300px',
          height: '300px',
          bottom: '5%',
          right: '10%',
          background: 'radial-gradient(circle, #f59e0b 0%, transparent 70%)',
        }}
      />
    </div>
  );
}
