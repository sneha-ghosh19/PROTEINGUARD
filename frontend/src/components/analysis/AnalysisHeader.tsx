import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Activity } from 'lucide-react';
import type { BasicAnalysisResponse } from '../../types/analysis';

interface AnalysisHeaderProps {
  accession: string;
  position: number;
  mutant: string;
  basic: BasicAnalysisResponse | null;
  loading?: boolean;
}

export const AnalysisHeader: React.FC<AnalysisHeaderProps> = ({
  accession,
  position,
  mutant,
  basic,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 animate-pulse backdrop-blur-sm">
        <div className="h-4 bg-slate-800 rounded w-1/4 mb-4"></div>
        <div className="h-8 bg-slate-800 rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-slate-800 rounded w-1/3"></div>
      </div>
    );
  }

  const proteinName = basic?.protein?.name || `Protein ${accession}`;
  const geneName = basic?.protein?.gene || 'Unspecified Gene';
  const organism = basic?.protein?.organism || 'Reference Organism';
  const originalName = basic?.original?.name || 'Reference Residue';
  const mutantName = basic?.mutant?.name || 'Mutant Residue';
  const originalCode = basic?.original?.code || '?';
  const notation = basic?.mutation || `${originalCode}${position}${mutant}`;

  return (
    <div className="bg-slate-900/60 border border-cyan-500/30 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden backdrop-blur-md">
      {/* Background Subtle Glow */}
      <div className="absolute top-0 right-0 w-[350px] h-[350px] bg-cyan-500/10 blur-[90px] rounded-full pointer-events-none" />

      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
        <Link to="/" className="hover:text-cyan-400 transition-colors">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
        <Link to="/mutation-lab" className="hover:text-cyan-400 transition-colors">Mutation Lab</Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
        <span className="text-cyan-300 font-semibold">Analysis Dashboard</span>
      </div>

      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        {/* Left Protein Metadata */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/30 text-cyan-300 text-[10px] font-mono uppercase font-bold tracking-wider">
              {organism}
            </span>
            <span className="text-xs font-mono text-slate-400">
              Gene: <strong className="text-white font-semibold">{geneName}</strong>
            </span>
            <span className="text-xs font-mono text-slate-400">• Accession: <strong className="text-cyan-300">{accession}</strong></span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            {proteinName}
          </h1>

          <p className="text-xs text-slate-400 font-mono">
            Sequence Position {position} • Sequence-based &amp; Structural Evidence Analysis
          </p>
        </div>

        {/* Right Active Mutation Callout Box & Quick Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <div className="flex items-center gap-4 bg-slate-950/90 p-4 rounded-2xl border border-cyan-500/40 shadow-lg">
            <div className="w-12 h-12 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Activity className="w-6 h-6 animate-pulse" />
            </div>

            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">Active Mutation</span>
              <div className="text-2xl font-black text-white font-mono">{notation}</div>
              <div className="text-xs text-cyan-300 font-mono">
                {originalName} → <span className="text-teal-300 font-bold">{mutantName}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Link
              to={`/structure?protein=${accession}&position=${position}&mutant=${mutant}`}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-semibold transition-all border border-slate-700 hover:border-cyan-500/40 flex items-center justify-center gap-1.5"
            >
              <span>Explore 3D Model</span>
            </Link>
            <Link
              to={`/report/${accession}-${position}-${mutant}`}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 text-xs font-mono font-bold transition-all shadow-[0_0_15px_rgba(34,211,238,0.3)] flex items-center justify-center gap-1.5"
            >
              <span>Research Report →</span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};
