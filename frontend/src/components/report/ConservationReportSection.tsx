import React from 'react';
import { GitBranch, AlertCircle } from 'lucide-react';
import type { ConservationReportData } from '../../types/report';

interface ConservationReportSectionProps {
  conservation: ConservationReportData;
}

export const ConservationReportSection: React.FC<ConservationReportSectionProps> = ({ conservation }) => {
  const isAvailable = conservation.status === 'Available';

  return (
    <section id="sequence-conservation" className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
            <GitBranch className="w-4 h-4" />
          </div>
          <h2 className="text-lg font-bold text-white tracking-wide">5. Sequence Conservation (Shannon Entropy)</h2>
        </div>
        <span className="text-xs font-mono text-emerald-400 font-semibold px-2.5 py-1 rounded-md bg-emerald-950/50 border border-emerald-800/40">
          Section 5 of 11
        </span>
      </div>

      <p className="text-xs text-slate-400 font-mono">
        Methodology: <strong className="text-slate-300">{conservation.method}</strong>
      </p>

      {isAvailable ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/80 space-y-1">
            <span className="text-slate-400 text-[10px] uppercase tracking-wider block">Shannon Entropy (H)</span>
            <span className="text-xl font-black text-cyan-300 block">
              {conservation.entropy !== null && conservation.entropy !== undefined
                ? conservation.entropy.toFixed(2)
                : 'N/A'}
            </span>
            <span className="text-[10px] text-slate-400">Normalized bits (0 = invariant)</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/80 space-y-1">
            <span className="text-slate-400 text-[10px] uppercase tracking-wider block">Classification</span>
            <span className="text-base font-bold text-emerald-400 block">
              {conservation.classification || 'Conserved'}
            </span>
            <span className="text-[10px] text-emerald-500 font-semibold">Derived from entropy cutoff</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/80 space-y-1">
            <span className="text-slate-400 text-[10px] uppercase tracking-wider block">Ortholog Alignment</span>
            <span className="text-base font-bold text-white block">
              {conservation.sequence_count} sequences
            </span>
            <span className="text-[10px] text-slate-400">UniProt homologous set</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/80 space-y-1">
            <span className="text-slate-400 text-[10px] uppercase tracking-wider block">Dominant Residue</span>
            <span className="text-base font-bold text-cyan-300 block">
              {conservation.dominant_residue} ({conservation.dominant_percentage}%)
            </span>
            <span className="text-[10px] text-slate-400">Frequency at alignment column</span>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-900/40 text-amber-300/90 text-xs font-mono flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-amber-200 block mb-0.5">Conservation analysis unavailable:</strong>
            <p className="text-slate-300 font-sans text-xs">
              {conservation.reason_unavailable || 'Homologous sequence alignment data could not be retrieved.'}
            </p>
          </div>
        </div>
      )}
    </section>
  );
};
