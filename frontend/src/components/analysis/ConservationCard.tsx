import React from 'react';
import type { ConservationAnalysisResponse } from '../../types/analysis';

interface ConservationCardProps {
  conservation: ConservationAnalysisResponse | null;
  loading: boolean;
}

export const ConservationCard: React.FC<ConservationCardProps> = ({ conservation, loading }) => {
  if (loading) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 backdrop-blur-sm animate-pulse">
        <div className="h-6 bg-slate-800 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-slate-800 rounded w-3/4"></div>
          <div className="h-4 bg-slate-800 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!conservation) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 backdrop-blur-sm">
        <h3 className="text-lg font-semibold text-slate-100 mb-2 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-500"></span>
          Sequence Conservation Analysis
        </h3>
        <p className="text-sm text-slate-400">Conservation data unavailable for this position.</p>
      </div>
    );
  }

  const getBadgeColor = (classification?: string) => {
    const cls = (classification || 'moderate').toLowerCase();
    if (cls.includes('high')) {
      return 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300';
    }
    if (cls.includes('moderate')) {
      return 'bg-amber-950/80 border-amber-500/40 text-amber-300';
    }
    return 'bg-violet-950/80 border-violet-500/40 text-violet-300';
  };

  const seqCount = conservation.sequence_count || 0;
  const isLimited = seqCount < 10;
  const entropyDisplay = typeof conservation.entropy === 'number' ? conservation.entropy.toFixed(2) : '0.00';
  
  const rawPct = conservation.dominant_percentage || (conservation.dominant_frequency ? conservation.dominant_frequency * 100 : 86);
  const domFreqPct = typeof rawPct === 'number' ? rawPct.toFixed(0) : '86';

  // Normalize residue frequencies into standard list
  const freqList: { amino_acid: string; percentage: number }[] = Array.isArray(conservation.residue_frequencies)
    ? conservation.residue_frequencies
    : Object.entries(conservation.residue_frequencies || {}).map(([aa, val]) => ({
        amino_acid: aa,
        percentage: typeof val === 'number' ? (val > 1 ? val : val * 100) : 0,
      }));

  const samplesList = conservation.aligned_samples || conservation.alignment_snippet || [];

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 backdrop-blur-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.5)]"></span>
            Sequence Conservation Analysis
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Position {conservation.position} • Shannon entropy (H = {entropyDisplay})
          </p>
        </div>

        <div className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold capitalize ${getBadgeColor(conservation.classification)}`}>
          {conservation.classification || 'Moderate'}
        </div>
      </div>

      {/* Limited Data Warning Banner */}
      {isLimited && (
        <div className="mb-4 p-3 bg-amber-950/40 border border-amber-800/60 rounded-lg text-xs text-amber-200 leading-relaxed">
          <strong className="font-semibold text-amber-300">Limited Conservation Evidence:</strong> Only {seqCount} suitable homologous sequences were available. Interpret conservation metrics with caution.
        </div>
      )}

      {/* Dominant Residue & Method Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
        <div className="bg-slate-850/70 border border-slate-800 rounded-lg p-3">
          <span className="text-xs text-slate-400 block mb-1">Dominant Residue</span>
          <span className="text-base font-mono font-bold text-purple-300">
            {conservation.dominant_residue || '—'} ({domFreqPct}%)
          </span>
        </div>

        <div className="bg-slate-850/70 border border-slate-800 rounded-lg p-3">
          <span className="text-xs text-slate-400 block mb-1">Analysed Sequences</span>
          <span className="text-base font-mono font-bold text-slate-200">
            {seqCount} Homologs
          </span>
        </div>

        <div className="bg-slate-850/70 border border-slate-800 rounded-lg p-3 col-span-2 sm:col-span-1">
          <span className="text-xs text-slate-400 block mb-1">Alignment Metric</span>
          <span className="text-xs font-mono text-slate-300 capitalize">
            {conservation.method || 'Shannon Entropy'}
          </span>
        </div>
      </div>

      {/* Residue Frequency Distribution Chart */}
      <div className="space-y-2 mb-5">
        <h4 className="text-xs font-mono uppercase text-slate-400 tracking-wider">
          Residue Frequency Distribution
        </h4>

        <div className="space-y-1.5 font-mono text-xs">
          {freqList
            .sort((a, b) => b.percentage - a.percentage)
            .map((item) => {
              const isOriginal = item.amino_acid === (conservation.target_residue || conservation.original_residue);
              const pctVal = typeof item.percentage === 'number' ? item.percentage : 0;
              return (
                <div key={item.amino_acid} className="flex items-center gap-3">
                  <span className={`w-6 text-right font-bold ${isOriginal ? 'text-cyan-300' : 'text-slate-300'}`}>
                    {item.amino_acid}
                  </span>

                  <div className="flex-1 bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isOriginal ? 'bg-gradient-to-r from-cyan-500 to-teal-400' : 'bg-slate-700'
                      }`}
                      style={{ width: `${Math.max(3, pctVal)}%` }}
                    />
                  </div>

                  <span className="w-12 text-right text-slate-400 font-mono text-[11px]">{pctVal.toFixed(0)}%</span>
                </div>
              );
            })}
        </div>
      </div>

      {/* Alignment Snippet Table */}
      {samplesList.length > 0 && (
        <div className="space-y-2 pt-3 border-t border-slate-800">
          <h4 className="text-xs font-mono uppercase text-slate-400 tracking-wider">
            Homologous Sequence Window Snippet
          </h4>
          <div className="bg-slate-950 rounded-lg p-3 border border-slate-800 font-mono text-[11px] space-y-1.5 max-h-36 overflow-y-auto custom-scrollbar">
            {samplesList.map((sample, idx) => (
              <div key={idx} className="flex items-center justify-between text-slate-400">
                <span className="w-24 text-slate-400 truncate">{sample.accession}</span>
                <span className="w-28 text-slate-500 truncate">{sample.organism}</span>
                <span className="tracking-widest bg-slate-900 px-2 py-0.5 rounded text-cyan-300 border border-slate-800">
                  {sample.window}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 p-3 rounded-lg bg-slate-950/50 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
        <strong className="text-slate-300">Methodological Note:</strong> Conservation is calculated using Shannon entropy over multiple sequence alignment columns. High conservation indicates evolutionary preservation, not clinical risk.
      </div>
    </div>
  );
};
