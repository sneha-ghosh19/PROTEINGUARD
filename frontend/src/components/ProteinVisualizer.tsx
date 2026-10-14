import React, { useState } from 'react';
import { Activity, RefreshCw } from 'lucide-react';

export const ProteinVisualizer: React.FC = () => {
  const [activeResidue, setActiveResidue] = useState<'wild' | 'mutant'>('mutant');

  return (
    <div className="relative w-full max-w-lg mx-auto aspect-square rounded-2xl glass-card p-6 flex flex-col justify-between overflow-hidden shadow-2xl border border-cyan-500/20 group">
      {/* Background Radial Glow */}
      <div className="absolute inset-0 bg-radial-gradient opacity-80 pointer-events-none" />

      {/* Decorative Grid Overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />

      {/* Visual Header / Indicator Badge */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
          <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>Biochemical Metaphor Model</span>
        </div>

        <button
          onClick={() => setActiveResidue(prev => prev === 'wild' ? 'mutant' : 'wild')}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-400 transition-colors bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-lg border border-white/10"
          title="Toggle mutation view"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Toggle State</span>
        </button>
      </div>

      {/* Abstract Molecular Network SVG */}
      <div className="relative z-10 my-4 flex items-center justify-center flex-1">
        <svg className="w-full h-full max-h-72" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Subtle Outer Orbit Rings */}
          <circle cx="200" cy="200" r="160" stroke="rgba(6, 182, 212, 0.1)" strokeWidth="1.5" strokeDasharray="4 6" />
          <circle cx="200" cy="200" r="110" stroke="rgba(139, 92, 246, 0.12)" strokeWidth="1" strokeDasharray="6 8" />

          {/* Connected Backbone Chains */}
          <path
            d="M 60,280 Q 120,100 200,200 T 340,120"
            stroke="url(#backboneGradient)"
            strokeWidth="3.5"
            strokeLinecap="round"
            className="opacity-80"
          />
          <path
            d="M 100,120 Q 200,320 300,180"
            stroke="url(#secondaryGradient)"
            strokeWidth="2.5"
            strokeDasharray="5 5"
            className="opacity-50"
          />

          {/* Gradients */}
          <defs>
            <linearGradient id="backboneGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="50%" stopColor="#14b8a6" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
            <linearGradient id="secondaryGradient" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Standard Residue Nodes (Wildtype network) */}
          <g className="opacity-70">
            {/* Residue L45 */}
            <circle cx="80" cy="250" r="7" fill="#06b6d4" />
            <text x="80" y="272" textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="monospace">L45</text>

            {/* Residue K62 */}
            <circle cx="130" cy="140" r="6" fill="#14b8a6" />
            <text x="130" y="125" textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="monospace">K62</text>

            {/* Residue E114 */}
            <circle cx="270" cy="240" r="8" fill="#8b5cf6" />
            <text x="270" y="262" textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="monospace">E114</text>

            {/* Residue Y140 */}
            <circle cx="330" cy="130" r="7" fill="#38bdf8" />
            <text x="330" y="115" textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="monospace">Y140</text>
          </g>

          {/* Interaction Vectors / Hydrogen bond proxies */}
          <line x1="200" y1="200" x2="130" y2="140" stroke="#06b6d4" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
          <line x1="200" y1="200" x2="270" y2="240" stroke="#8b5cf6" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
          <line x1="200" y1="200" x2="80" y2="250" stroke="#14b8a6" strokeWidth="1" opacity="0.4" />

          {/* Highlighting Pulse Ring for Mutated Residue 98 */}
          <circle cx="200" cy="200" r="28" fill="none" stroke="#06b6d4" strokeWidth="1.5" className="animate-ping opacity-30" />
          <circle cx="200" cy="200" r="20" fill="none" stroke="#00f2fe" strokeWidth="2" opacity="0.7" />

          {/* Highlighted Residue Center */}
          <circle
            cx="200"
            cy="200"
            r="12"
            fill={activeResidue === 'mutant' ? '#00f2fe' : '#38bdf8'}
            filter="url(#glow)"
            className="cursor-pointer transition-colors duration-500"
            onClick={() => setActiveResidue(prev => prev === 'wild' ? 'mutant' : 'wild')}
          />
        </svg>

        {/* Center Floating Mutation Marker Overlay */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="mt-14 px-3.5 py-1.5 rounded-lg bg-[#070a14]/90 border border-cyan-400/50 shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center gap-2 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="font-mono font-bold text-sm text-cyan-200">
              {activeResidue === 'mutant' ? 'A98 → V98' : 'Wildtype A98'}
            </span>
          </div>
        </div>
      </div>

      {/* Visual Metaphor Flow Steps */}
      <div className="relative z-10 pt-4 border-t border-white/10 grid grid-cols-4 gap-1 text-center font-mono text-[11px]">
        <div className="flex flex-col items-center">
          <span className="text-slate-500 text-[9px] uppercase">Stage 1</span>
          <span className="text-slate-300 font-medium mt-0.5">Protein</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-slate-500 text-[9px] uppercase">Stage 2</span>
          <span className="text-slate-300 font-medium mt-0.5">Pos 98</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-cyan-400 text-[9px] uppercase font-bold">Stage 3</span>
          <span className="text-cyan-300 font-bold mt-0.5">A → V</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-slate-500 text-[9px] uppercase">Stage 4</span>
          <span className="text-slate-300 font-medium mt-0.5">Impact</span>
        </div>
      </div>
    </div>
  );
};
