import React from 'react';
import type { BasicAnalysisResponse } from '../../types/analysis';

interface PhysicochemicalCardProps {
  analysis: BasicAnalysisResponse | null;
  loading: boolean;
}

export const PhysicochemicalCard: React.FC<PhysicochemicalCardProps> = ({ analysis, loading }) => {
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

  if (!analysis) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 backdrop-blur-sm">
        <h3 className="text-lg font-semibold text-slate-100 mb-2 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-500"></span>
          Physicochemical Change
        </h3>
        <p className="text-sm text-slate-400">Physicochemical analysis unavailable.</p>
      </div>
    );
  }

  const { original, mutant, property_shifts } = analysis;

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)]"></span>
          Physicochemical Changes
        </h3>
        <span className="text-xs font-mono px-2.5 py-1 bg-cyan-950/80 border border-cyan-800 text-cyan-300 font-bold rounded-md">
          {original.code} → {mutant.code}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* Original Side-chain */}
        <div className="bg-slate-850/70 border border-slate-800 rounded-lg p-3">
          <span className="text-xs text-slate-400 block mb-1">Original Residue</span>
          <span className="text-lg font-mono font-bold text-white">{original.code}</span>
          <span className="text-xs text-slate-400 block font-mono">{original.name}</span>
        </div>

        {/* Mutant Side-chain */}
        <div className="bg-slate-850/70 border border-slate-800 rounded-lg p-3">
          <span className="text-xs text-slate-400 block mb-1">Mutant Residue</span>
          <span className="text-lg font-mono font-bold text-cyan-300">{mutant.code}</span>
          <span className="text-xs text-teal-300 block font-mono">{mutant.name}</span>
        </div>
      </div>

      {/* Property Matrix Table */}
      <div className="space-y-2 text-xs font-mono">
        <div className="grid grid-cols-3 text-slate-400 font-semibold pb-1 border-b border-slate-800 text-[11px]">
          <span>Property</span>
          <span className="text-center">Shift</span>
          <span className="text-right">Mutant Value</span>
        </div>

        <div className="grid grid-cols-3 py-1.5 border-b border-slate-800/60 items-center">
          <span className="text-slate-300">Molecular Weight</span>
          <span className="text-center text-cyan-400">
            {property_shifts?.molecular_weight?.display || property_shifts?.molecular_weight?.change || '—'}
          </span>
          <span className="text-right font-bold text-slate-200">{mutant.molecular_weight} Da</span>
        </div>

        <div className="grid grid-cols-3 py-1.5 border-b border-slate-800/60 items-center">
          <span className="text-slate-300">Hydrophobicity</span>
          <span className="text-center text-teal-400">
            {property_shifts?.hydrophobicity?.display || property_shifts?.hydrophobicity?.change || '—'}
          </span>
          <span className="text-right font-bold text-slate-200">{mutant.hydrophobicity}</span>
        </div>

        <div className="grid grid-cols-3 py-1.5 border-b border-slate-800/60 items-center">
          <span className="text-slate-300">Net Charge</span>
          <span className="text-center text-slate-400">
            {property_shifts?.charge?.change === 'unchanged' ? 'Neutral' : property_shifts?.charge?.change}
          </span>
          <span className="text-right font-bold text-slate-200">{mutant.charge_label}</span>
        </div>

        <div className="grid grid-cols-3 py-1.5 items-center">
          <span className="text-slate-300">Side-chain Class</span>
          <span className="text-center text-indigo-400 capitalize">
            {analysis.changes?.side_chain_class?.changed ? 'Class Shift' : 'Maintained'}
          </span>
          <span className="text-right font-bold text-slate-200 capitalize">{mutant.side_chain_class}</span>
        </div>
      </div>
    </div>
  );
};
