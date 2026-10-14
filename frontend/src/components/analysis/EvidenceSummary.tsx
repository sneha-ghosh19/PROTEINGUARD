import React from 'react';
import type { ConservationAnalysisResponse, StructureAnalysisResponse, BasicAnalysisResponse } from '../../types/analysis';

interface EvidenceSummaryProps {
  basic: BasicAnalysisResponse | null;
  conservation: ConservationAnalysisResponse | null;
  structure: StructureAnalysisResponse | null;
  loading: boolean;
}

export const EvidenceSummary: React.FC<EvidenceSummaryProps> = ({
  basic,
  conservation,
  structure,
  loading,
}) => {
  if (loading) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 backdrop-blur-sm animate-pulse">
        <div className="h-6 bg-slate-800 rounded w-1/4 mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-slate-800/50 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  // Count available evidence pillars
  let evaluatedCount = 0;
  if (basic) evaluatedCount++;
  if (conservation && (conservation.status === 'success' || conservation.classification)) evaluatedCount++;
  if (structure && (structure.status === 'success' || structure.status === 'mapped' || structure.pdb_id)) evaluatedCount++;
  if (structure && structure.nearby_residues && structure.nearby_residues.length > 0) evaluatedCount++;

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)]"></span>
            Independent Evidence Overview
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Multi-dimensional analytical evidence breakdown (non-weighted, uncombined)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Available Pillars:</span>
          <span className="px-3 py-1 bg-cyan-950/80 border border-cyan-700/60 text-cyan-300 font-mono font-bold text-sm rounded-lg">
            {evaluatedCount} / 4
          </span>
        </div>
      </div>

      {/* 4 Pillars Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* Pillar 1: Physicochemical */}
        <div className="bg-slate-850/70 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Pillar 1</span>
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            </div>
            <h4 className="text-sm font-bold text-slate-200 mb-1">Physicochemical Change</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              {basic
                ? `${basic.original.name} (${basic.original.code}) → ${basic.mutant.name} (${basic.mutant.code}) substitution.`
                : 'Evaluating property shifts...'}
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800 text-[11px] font-mono text-cyan-400">
            {basic?.changes?.side_chain_class?.changed ? 'Class Changed' : 'Property Shift Analyzed'}
          </div>
        </div>

        {/* Pillar 2: Conservation */}
        <div className="bg-slate-850/70 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Pillar 2</span>
              <span className={`w-2 h-2 rounded-full ${conservation ? 'bg-purple-400' : 'bg-slate-500'}`}></span>
            </div>
            <h4 className="text-sm font-bold text-slate-200 mb-1">Sequence Conservation</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              {conservation
                ? `Analyzed across ${conservation.sequence_count} homologous sequences.`
                : 'Homology alignment data.'}
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800 text-[11px] font-mono text-purple-300 capitalize">
            {conservation?.classification ? `${conservation.classification} conservation` : 'Data pending'}
          </div>
        </div>

        {/* Pillar 3: Structural Context */}
        <div className="bg-slate-850/70 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Pillar 3</span>
              <span className={`w-2 h-2 rounded-full ${structure?.pdb_id ? 'bg-teal-400' : 'bg-slate-500'}`}></span>
            </div>
            <h4 className="text-sm font-bold text-slate-200 mb-1">Structural Context</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              {structure?.pdb_id
                ? `Mapped to PDB ${structure.pdb_id} (${structure.secondary_structure || 'loop'}).`
                : '3D PDB mapping.'}
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800 text-[11px] font-mono text-teal-300 capitalize">
            {structure?.environment ? `${structure.environment} residue` : 'Data pending'}
          </div>
        </div>

        {/* Pillar 4: Local Environment */}
        <div className="bg-slate-850/70 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Pillar 4</span>
              <span className={`w-2 h-2 rounded-full ${structure?.nearby_residues?.length ? 'bg-indigo-400' : 'bg-slate-500'}`}></span>
            </div>
            <h4 className="text-sm font-bold text-slate-200 mb-1">Local Environment</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              {structure?.nearby_residues?.length
                ? `${structure.nearby_residues.length} spatial contacts identified within 6.0 Å.`
                : 'Atomic contact neighborhood.'}
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800 text-[11px] font-mono text-indigo-300">
            {structure?.nearby_residues?.length ? `${structure.nearby_residues.length} Contacts` : 'None mapped'}
          </div>
        </div>
      </div>

      <div className="p-3 bg-slate-800/40 rounded-lg border border-slate-700/50 text-xs text-slate-400 flex items-start gap-2">
        <svg className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 101-18 0 9 9 0 0118 0z" />
        </svg>
        <span>
          <strong className="text-slate-300">Methodological Standard:</strong> ProteinGuard maintains strict separation of evidence pillars. We do not aggregate scores into a single &quot;pathogenicity probability&quot; to prevent misinterpretation and ensure transparent scientific review.
        </span>
      </div>
    </div>
  );
};
