import React from 'react';
import type { PlaygroundResponse, PlaygroundItem } from '../../types/mutation';
import { Sparkles, ArrowUpRight, ArrowDownRight, Minus, MousePointerClick } from 'lucide-react';

interface MutationPlaygroundProps {
  playground: PlaygroundResponse;
  activeMutantCode: string;
  onSelectSub: (mutCode: string, origCode: string) => void;
}

export const MutationPlayground: React.FC<MutationPlaygroundProps> = ({
  playground,
  activeMutantCode,
  onSelectSub
}) => {
  const { position, original, substitutions } = playground;

  const renderTrendIcon = (change: string) => {
    if (change === 'increase' || change === 'more_positive') {
      return <ArrowUpRight className="w-3 h-3 text-emerald-400" />;
    }
    if (change === 'decrease' || change === 'more_negative') {
      return <ArrowDownRight className="w-3 h-3 text-rose-400" />;
    }
    return <Minus className="w-3 h-3 text-slate-500" />;
  };

  return (
    <div className="glass-card rounded-2xl p-6 sm:p-8 border border-violet-500/30 space-y-6 shadow-xl relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-950/80 border border-violet-500/40 text-violet-300 text-xs font-mono">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            <span>Interactive Substitution Exploration</span>
          </div>
          <h3 className="text-2xl font-extrabold text-white tracking-tight mt-2">
            Mutation Playground
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Explore all 19 possible amino-acid substitutions at position <strong>{position}</strong> (Wildtype: {original.code} — {original.name}).
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-900/80 px-3 py-2 rounded-xl border border-white/5">
          <MousePointerClick className="w-4 h-4 text-cyan-400" />
          <span>Click any card to inspect full profile</span>
        </div>
      </div>

      {/* 19 Substitution Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 font-mono text-xs">
        {substitutions.map((item: PlaygroundItem) => {
          const isSelected = item.mutant.code === activeMutantCode;
          const mwShift = item.property_shifts.molecular_weight;
          const hShift = item.property_shifts.hydrophobicity;
          const vShift = item.property_shifts.volume;

          return (
            <button
              key={item.mutation}
              onClick={() => onSelectSub(item.mutant.code, original.code)}
              className={`p-3.5 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between space-y-3.5 relative group ${
                isSelected
                  ? 'bg-gradient-to-br from-cyan-950/90 to-teal-950/90 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.35)] scale-[1.02] z-10'
                  : 'bg-slate-900/70 border-white/5 hover:border-cyan-500/40 hover:bg-slate-800/80 hover:-translate-y-0.5'
              }`}
            >
              {/* Card Header: Notation & AA Name */}
              <div className="flex items-center justify-between">
                <div>
                  <span className={`font-bold text-base block ${isSelected ? 'text-cyan-300' : 'text-white'}`}>
                    {item.mutation}
                  </span>
                  <span className="text-[10px] text-slate-400 block truncate">
                    {item.mutant.name}
                  </span>
                </div>
                
                {isSelected && (
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                )}
              </div>

              {/* Property Summary Micro Metrics */}
              <div className="pt-2 border-t border-white/5 grid grid-cols-3 gap-1 text-[10px] text-slate-400">
                <div className="flex flex-col items-center">
                  <span>MW</span>
                  <span className="flex items-center gap-0.5 font-bold mt-0.5">
                    {renderTrendIcon(mwShift.change)}
                  </span>
                </div>
                <div className="flex flex-col items-center border-x border-white/5">
                  <span>Hydro</span>
                  <span className="flex items-center gap-0.5 font-bold mt-0.5">
                    {renderTrendIcon(hShift.change)}
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <span>Vol</span>
                  <span className="flex items-center gap-0.5 font-bold mt-0.5">
                    {renderTrendIcon(vShift.change)}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
