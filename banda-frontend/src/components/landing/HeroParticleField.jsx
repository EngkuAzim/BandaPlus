import React from 'react';

/**
 * HeroParticleField (Simplified & Lightweight)
 * ─────────────────────────────────────────────
 * Replaces heavy canvas/JS particle loops with a subtle, trustworthy municipal background:
 *  - Soft radial gradients
 *  - Faint structural grid
 *  - Subtle blue & gold glow accents
 *  - Zero CPU/GPU overhead, instant rendering
 */
export default function HeroParticleField() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Subtle structural grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a05_1px,transparent_1px),linear-gradient(to_bottom,#0f172a05_1px,transparent_1px)] bg-[size:48px_48px] opacity-70" />

      {/* Top center soft blue radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/4 w-[800px] h-[500px] bg-gradient-to-tr from-blue-600/10 via-indigo-600/5 to-transparent rounded-full blur-3xl" />

      {/* Subtle gold accent glow on top right */}
      <div className="absolute top-24 right-[15%] w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-3xl" />

      {/* Soft blue glow on bottom left */}
      <div className="absolute bottom-10 left-[10%] w-[500px] h-[300px] bg-blue-500/5 rounded-full blur-3xl" />

      {/* Bottom fade gradient to smoothly transition into Compartment 2 */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-50 via-slate-50/80 to-transparent" />
    </div>
  );
}
