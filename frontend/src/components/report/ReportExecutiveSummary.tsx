import React from 'react';
import { Activity } from 'lucide-react';
import type { ExecutiveSummaryData } from '../../types/report';

interface ReportExecutiveSummaryProps {
  summary: ExecutiveSummaryData;
}

export const ReportExecutiveSummary: React.FC<ReportExecutiveSummaryProps> = ({ summary }) => {
  return (
    <section id="executive-summary" className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md space-y-5">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-800/60 flex items-center justify-center text-cyan-400">
            <Activity className="w-4 h-4" />
          </div>
          <h2 className="text-lg font-bold text-white tracking-wide">1. Executive Summary</h2>
        </div>
        <span className="text-xs font-mono text-cyan-400 font-semibold px-2.5 py-1 rounded-md bg-cyan-950/50 border border-cyan-800/40">
          Section 1 of 11
        </span>
      </div>

      {/* Neutral Scientific Summary Text */}
      <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-sm text-slate-200 leading-relaxed font-sans">
        <p>{summary.neutral_summary}</p>
      </div>

      {/* Structured Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
        <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/80 space-y-1">
          <span className="text-slate-400 text-[10px] uppercase tracking-wider block">Target Protein</span>
          <span className="text-white font-bold block truncate" title={summary.protein_name}>
            {summary.protein_name}
          </span>
          <span className="text-cyan-400 text-[11px] font-semibold">{summary.protein_accession}</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/80 space-y-1">
          <span className="text-slate-400 text-[10px] uppercase tracking-wider block">Substitution</span>
          <span className="text-white font-bold block text-base text-cyan-300">
            {summary.notation}
          </span>
          <span className="text-slate-400 text-[11px]">
            {summary.original_residue} (pos {summary.position}) → {summary.mutant_residue}
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/80 space-y-1">
          <span className="text-slate-400 text-[10px] uppercase tracking-wider block">Organism / Gene</span>
          <span className="text-white font-bold block truncate">{summary.gene_name || 'N/A'}</span>
          <span className="text-slate-400 text-[11px] italic truncate block">{summary.organism}</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/80 space-y-1">
          <span className="text-slate-400 text-[10px] uppercase tracking-wider block">Resolved Pillars</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-lg font-black text-cyan-300">{summary.available_pillars_count}</span>
            <span className="text-slate-400 text-xs">/ {summary.total_pillars_count} active</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-semibold block">Canonical Validation</span>
        </div>
      </div>
    </section>
  );
};
