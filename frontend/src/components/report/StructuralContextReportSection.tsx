import React from 'react';
import { Box, ExternalLink, AlertTriangle } from 'lucide-react';
import type { StructuralReportData } from '../../types/report';

interface StructuralContextReportSectionProps {
  structural: StructuralReportData;
}

export const StructuralContextReportSection: React.FC<StructuralContextReportSectionProps> = ({ structural }) => {
  const isAvailable = structural.status === 'Available';

  return (
    <section id="structural-context" className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-800/60 flex items-center justify-center text-cyan-400">
            <Box className="w-4 h-4" />
          </div>
          <h2 className="text-lg font-bold text-white tracking-wide">6. Structural Context & Secondary Structure</h2>
        </div>
        <span className="text-xs font-mono text-cyan-400 font-semibold px-2.5 py-1 rounded-md bg-cyan-950/50 border border-cyan-800/40">
          Section 6 of 11
        </span>
      </div>

      <p className="text-xs text-slate-400 font-mono">
        Coordinate Mapping: <strong className="text-slate-300">{structural.mapping_method}</strong>
      </p>

      {isAvailable ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/80 space-y-1">
              <span className="text-slate-400 text-[10px] uppercase tracking-wider block">PDB Structure</span>
              <span className="text-lg font-bold text-white flex items-center gap-1.5">
                {structural.pdb_id} (Chain {structural.chain_id || 'A'})
                {structural.structure_url && (
                  <a
                    href={structural.structure_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:text-cyan-300"
                    title="Open structure in RCSB PDB"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </span>
              <span className="text-[10px] text-slate-400">Mapped Residue {structural.mapped_residue_number}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/80 space-y-1">
              <span className="text-slate-400 text-[10px] uppercase tracking-wider block">Secondary Structure</span>
              <span className="text-base font-bold text-teal-300 block capitalize">
                {structural.secondary_structure || 'Loop / Coil'}
              </span>
              <span className="text-[10px] text-slate-400">DSSP / PDB header annotation</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/80 space-y-1">
              <span className="text-slate-400 text-[10px] uppercase tracking-wider block">Solvent Exposure</span>
              <span className="text-base font-bold text-amber-300 block capitalize">
                {structural.solvent_accessibility || 'Buried'}
              </span>
              <span className="text-[10px] text-slate-400">Relative accessibility</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/80 space-y-1">
              <span className="text-slate-400 text-[10px] uppercase tracking-wider block">Experimental Method</span>
              <span className="text-base font-bold text-slate-200 block truncate">
                {structural.experimental_method || 'X-ray'}
              </span>
              <span className="text-[10px] text-slate-400">{structural.resolution || 'Resolution N/A'}</span>
            </div>
          </div>

          {/* Reference Structure Standard Disclaimer */}
          <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-900/40 text-xs text-cyan-200/80 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <p className="font-sans leading-relaxed text-[11px]">
              <strong className="text-cyan-300">Reference Structure Standard:</strong> {structural.structure_nature_note}
            </p>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-900/40 text-amber-300/90 text-xs font-mono flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-amber-200 block mb-0.5">Structural context unavailable:</strong>
            <p className="text-slate-300 font-sans text-xs">
              {structural.reason_unavailable || 'No suitable experimental structure was resolved or mapped for this position.'}
            </p>
          </div>
        </div>
      )}
    </section>
  );
};
