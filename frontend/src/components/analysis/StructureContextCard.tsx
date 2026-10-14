import React from 'react';
import type { StructureAnalysisResponse } from '../../types/analysis';

interface StructureContextCardProps {
  structure: StructureAnalysisResponse | null;
  loading: boolean;
  onExplore3D?: () => void;
}

export const StructureContextCard: React.FC<StructureContextCardProps> = ({
  structure,
  loading,
  onExplore3D,
}) => {
  if (loading) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 backdrop-blur-sm animate-pulse">
        <div className="h-6 bg-slate-800 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-slate-800 rounded w-3/4"></div>
          <div className="h-4 bg-slate-800 rounded w-1/2"></div>
          <div className="h-4 bg-slate-800 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (!structure) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 backdrop-blur-sm">
        <h3 className="text-lg font-semibold text-slate-100 mb-2 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-500"></span>
          Structural Context
        </h3>
        <p className="text-sm text-slate-400">Structural analysis data unavailable.</p>
      </div>
    );
  }

  const isAvailable = structure.status === 'success' || structure.status === 'mapped' || !!structure.pdb_id;
  const chainId = structure.chain_id || structure.chain || 'A';
  const mappedRes = structure.mapped_residue_number || structure.mapped_pdb_residue;
  const contactCount = Array.isArray(structure.nearby_residues) ? structure.nearby_residues.length : 0;
  const hasRsa = typeof structure.relative_solvent_accessibility === 'number';

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 backdrop-blur-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${isAvailable ? 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)]' : 'bg-amber-400'}`}></span>
            Structural Context
          </h3>
          {structure.pdb_id && (
            <a
              href={`https://www.rcsb.org/structure/${structure.pdb_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-1 hover:underline"
            >
              RCSB PDB: {structure.pdb_id} ↗
            </a>
          )}
        </div>

        {!isAvailable ? (
          <div className="bg-slate-800/40 rounded-lg p-4 text-sm text-slate-300 border border-slate-700/50 mb-4">
            <p className="font-medium text-amber-300 mb-1">Notice</p>
            <p className="text-slate-400">{structure.message || 'No structural mapping available.'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-slate-850/70 border border-slate-800 rounded-lg p-3">
              <span className="text-xs text-slate-400 block mb-1">PDB Reference</span>
              <span className="text-base font-mono font-bold text-cyan-300">
                {structure.pdb_id || 'N/A'} <span className="text-xs font-normal text-slate-400">(Chain {chainId})</span>
              </span>
            </div>

            <div className="bg-slate-850/70 border border-slate-800 rounded-lg p-3">
              <span className="text-xs text-slate-400 block mb-1">Mapped Residue</span>
              <span className="text-base font-mono font-bold text-slate-200">
                Pos {mappedRes ?? 'N/A'}
              </span>
            </div>

            <div className="bg-slate-850/70 border border-slate-800 rounded-lg p-3">
              <span className="text-xs text-slate-400 block mb-1">Secondary Structure</span>
              <span className="text-sm font-semibold text-teal-300 capitalize">
                {structure.secondary_structure || 'Unknown'}
              </span>
            </div>

            <div className="bg-slate-850/70 border border-slate-800 rounded-lg p-3">
              <span className="text-xs text-slate-400 block mb-1">Solvent Exposure</span>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-semibold capitalize ${structure.environment === 'buried' ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {structure.environment || 'Unavailable'}
                </span>
                {hasRsa && (
                  <span className="text-xs text-slate-400 font-mono">
                    ({((structure.relative_solvent_accessibility as number) * 100).toFixed(0)}%)
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Scientific Disclaimer */}
        <div className="bg-cyan-950/20 border border-cyan-900/40 rounded-lg p-3 mb-4 text-xs text-cyan-200/80 leading-relaxed">
          <span className="font-semibold text-cyan-300 block mb-0.5">Scientific Boundary Notice:</span>
          Structural context is derived from wild-type experimental coordinates. The mutated structure has not been experimentally determined or computationally refolded here.
        </div>
      </div>

      {isAvailable && (
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            {contactCount} spatial contacts within 6.0 Å
          </span>
          <button
            onClick={onExplore3D}
            className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-medium text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-[0_0_12px_rgba(8,145,178,0.3)] cursor-pointer"
          >
            <span>Explore in 3D</span>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};
