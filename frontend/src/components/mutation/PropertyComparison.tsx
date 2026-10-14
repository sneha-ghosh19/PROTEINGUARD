import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { BasicAnalysisResponse } from '../../types/mutation';
import { ArrowUpRight, ArrowDownRight, Minus, FlaskConical, Scale, Zap, Activity, Box } from 'lucide-react';

interface PropertyComparisonProps {
  analysis: BasicAnalysisResponse;
  accession?: string;
  position?: number;
  onAnalyze?: () => void;
}

export const PropertyComparison: React.FC<PropertyComparisonProps> = ({
  analysis,
  accession: propAccession,
  position: propPosition,
  onAnalyze
}) => {
  const navigate = useNavigate();
  const { original, mutant, property_shifts } = analysis;

  const accession = propAccession || (analysis as any).protein?.accession || (analysis as any).protein_accession || (analysis as any).accession || '';
  const position = propPosition || (analysis as any).position || 0;
  const analysisId = accession && position ? `${accession}-${position}-${mutant.code}` : '';

  const handleAnalyzeNavigation = () => {
    if (onAnalyze) {
      onAnalyze();
    } else if (analysisId) {
      navigate(`/analysis/${analysisId}`);
    } else if (accession && position) {
      navigate(`/analysis?protein=${accession}&position=${position}&mutant=${mutant.code}`);
    }
  };

  const renderTrendBadge = (change: string, display?: string) => {
    if (change === 'increase' || change === 'more_positive') {
      return (
        <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
          <ArrowUpRight className="w-4 h-4" />
          <span>{display || 'Increase'}</span>
        </span>
      );
    }
    if (change === 'decrease' || change === 'more_negative') {
      return (
        <span className="inline-flex items-center gap-1 text-rose-400 font-bold">
          <ArrowDownRight className="w-4 h-4" />
          <span>{display || 'Decrease'}</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-slate-400 font-semibold">
        <Minus className="w-4 h-4" />
        <span>Unchanged</span>
      </span>
    );
  };

  return (
    <div className="glass-card rounded-2xl p-6 sm:p-8 border border-cyan-500/30 space-y-6 shadow-xl relative overflow-hidden">
      {/* Header Notation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-xs font-mono uppercase">
            <span>Validated Mutation Analysis</span>
          </div>
          <h3 className="text-3xl font-black text-white font-mono mt-2">
            {analysis.mutation}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Physicochemical shift evaluation comparing wildtype vs mutant side-chains.
          </p>
        </div>

        {/* Wildtype vs Mutant Comparison Badge */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex items-center gap-4 bg-slate-900/90 p-4 rounded-2xl border border-white/10">
            <div className="text-center">
              <span className="text-[10px] text-slate-400 uppercase block font-mono">Original</span>
              <span className="text-xl font-bold text-white font-mono">{original.code}</span>
              <span className="text-[11px] text-slate-400 block">{original.name}</span>
            </div>

            <div className="text-cyan-400 text-lg font-bold">→</div>

            <div className="text-center">
              <span className="text-[10px] text-cyan-400 uppercase block font-mono">Mutant</span>
              <span className="text-xl font-bold text-cyan-300 font-mono">{mutant.code}</span>
              <span className="text-[11px] text-teal-300 block">{mutant.name}</span>
            </div>
          </div>

          <button
            onClick={handleAnalyzeNavigation}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-[0_0_20px_rgba(34,211,238,0.4)] transition-all cursor-pointer whitespace-nowrap"
          >
            <span>Analyze Mutation</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </div>

      {/* Property Shifts Matrix Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-mono text-xs">
        
        {/* Molecular Weight */}
        <div className="p-4 rounded-xl bg-slate-900/70 border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-cyan-400" />
              <span>Molecular Weight</span>
            </span>
            {renderTrendBadge(property_shifts.molecular_weight.change, property_shifts.molecular_weight.display)}
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-white/5 text-slate-300">
            <span>{original.molecular_weight} Da</span>
            <span>→</span>
            <span className="font-bold text-white">{mutant.molecular_weight} Da</span>
          </div>
        </div>

        {/* Hydrophobicity */}
        <div className="p-4 rounded-xl bg-slate-900/70 border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-1.5">
              <FlaskConical className="w-3.5 h-3.5 text-teal-400" />
              <span>Hydrophobicity (KD)</span>
            </span>
            {renderTrendBadge(property_shifts.hydrophobicity.change, property_shifts.hydrophobicity.display)}
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-white/5 text-slate-300">
            <span>{original.hydrophobicity}</span>
            <span>→</span>
            <span className="font-bold text-white">{mutant.hydrophobicity}</span>
          </div>
        </div>

        {/* Side-chain Volume */}
        <div className="p-4 rounded-xl bg-slate-900/70 border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-1.5">
              <Box className="w-3.5 h-3.5 text-violet-400" />
              <span>Side-chain Volume</span>
            </span>
            {renderTrendBadge(property_shifts.volume.change, property_shifts.volume.display)}
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-white/5 text-slate-300">
            <span>{original.volume} Å³</span>
            <span>→</span>
            <span className="font-bold text-white">{mutant.volume} Å³</span>
          </div>
        </div>

        {/* Net Charge */}
        <div className="p-4 rounded-xl bg-slate-900/70 border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Net Charge (pH 7.4)</span>
            </span>
            {renderTrendBadge(property_shifts.charge.change)}
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-white/5 text-slate-300">
            <span>{original.charge_label}</span>
            <span>→</span>
            <span className="font-bold text-white">{mutant.charge_label}</span>
          </div>
        </div>

        {/* Polarity */}
        <div className="p-4 rounded-xl bg-slate-900/70 border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>Polarity</span>
            </span>
            <span className="capitalize font-semibold text-slate-300">
              {property_shifts.polarity.change === 'unchanged' ? 'Unchanged' : property_shifts.polarity.change.replace('shift_to_', 'Shift to ')}
            </span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-white/5 text-slate-300 capitalize">
            <span>{original.polarity}</span>
            <span>→</span>
            <span className="font-bold text-white">{mutant.polarity}</span>
          </div>
        </div>

        {/* Side-chain Class */}
        <div className="p-4 rounded-xl bg-slate-900/70 border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-1.5">
              <FlaskConical className="w-3.5 h-3.5 text-emerald-400" />
              <span>Chemical Class</span>
            </span>
            <span className="text-[11px] text-slate-400">Classification</span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-white/5 text-slate-300">
            <span>{original.side_chain_class}</span>
            <span>→</span>
            <span className="font-bold text-white">{mutant.side_chain_class}</span>
          </div>
        </div>

      </div>
    </div>
  );
};
