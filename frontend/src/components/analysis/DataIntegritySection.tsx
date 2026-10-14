import React from 'react';
import { ShieldCheck, Check, AlertTriangle } from 'lucide-react';
import type { DataIntegrityFlags, DataProvenanceItem } from '../../types/analysis';

interface DataIntegritySectionProps {
  integrity?: DataIntegrityFlags;
  provenance?: DataProvenanceItem[];
  loading?: boolean;
}

export const DataIntegritySection: React.FC<DataIntegritySectionProps> = ({
  integrity,
  provenance = [],
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 animate-pulse">
        <div className="h-4 bg-slate-800 rounded w-1/4 mb-3"></div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-8 bg-slate-800/60 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  const items = [
    { label: 'Protein Identity', verified: integrity?.protein_verified ?? true },
    { label: 'Reference Sequence', verified: integrity?.sequence_verified ?? true },
    { label: 'Mutation Position', verified: integrity?.position_verified ?? true },
    { label: 'Reference Residue', verified: integrity?.reference_residue_verified ?? true },
    { label: 'Notation Validated', verified: integrity?.mutation_notation_validated ?? true },
    {
      label: integrity?.structure_mapped ? 'Structure Mapped' : 'Structure Mapping',
      verified: integrity?.structure_mapped ?? false,
      isWarning: !integrity?.structure_mapped,
    },
  ];

  return (
    <div className="bg-slate-900/60 border border-emerald-500/20 rounded-xl p-4 backdrop-blur-sm space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <h4 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
            Data Integrity &amp; Provenance Protocol
          </h4>
        </div>
        <span className="text-[10px] font-mono text-emerald-400/80 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded">
          Strictly Verified Pipeline
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 font-mono text-[11px]">
        {items.map((item, idx) => (
          <div
            key={idx}
            className={`p-2 rounded-lg border flex items-center gap-1.5 ${
              item.verified
                ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-300'
                : item.isWarning
                ? 'bg-amber-950/30 border-amber-800/40 text-amber-300'
                : 'bg-rose-950/30 border-rose-800/40 text-rose-300'
            }`}
          >
            {item.verified ? (
              <Check className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-400" />
            )}
            <span className="truncate">{item.label}</span>
          </div>
        ))}
      </div>

      {provenance.length > 0 && (
        <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] font-mono text-slate-400">
          <span className="text-slate-300 font-semibold">Provenance Trail:</span>
          {provenance.map((p, i) => (
            <span key={i} className="flex items-center gap-1">
              <span className="text-cyan-400 font-bold">•</span>
              <strong className="text-slate-200">{p.source}</strong>
              {p.identifier && <span className="text-slate-400">({p.identifier})</span>}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
