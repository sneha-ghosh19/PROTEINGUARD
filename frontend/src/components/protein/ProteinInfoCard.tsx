import React from 'react';
import type { ProteinData } from '../../types/protein';
import { ExternalLink, Info } from 'lucide-react';

interface ProteinInfoCardProps {
  protein: ProteinData;
}

export const ProteinInfoCard: React.FC<ProteinInfoCardProps> = ({ protein }) => {
  return (
    <div className="glass-card rounded-2xl p-6 border border-cyan-500/25 space-y-5 relative overflow-hidden">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/30 text-cyan-300 text-[10px] font-mono uppercase font-bold tracking-wider">
              {protein.organism}
            </span>
            <span className="text-xs font-mono text-slate-400">
              Gene: <strong className="text-white font-semibold">{protein.gene_name}</strong>
            </span>
          </div>

          <h3 className="text-2xl font-extrabold text-white tracking-tight">
            {protein.protein_name}
          </h3>
        </div>

        {/* Accession Badge & External UniProt Link */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-900/90 px-3.5 py-2 rounded-xl border border-white/10 text-right">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">UniProt Accession</span>
            <span className="font-mono text-base font-bold text-cyan-300">{protein.accession}</span>
          </div>

          <a
            href={`https://www.uniprot.org/uniprotkb/${protein.accession}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-cyan-400 transition-colors"
            title="Open entry in UniProt KB"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Metric Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
        <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
          <span className="text-slate-400 text-[11px] block">Sequence Length</span>
          <span className="text-white font-bold text-sm mt-0.5 block">{protein.length} aa</span>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
          <span className="text-slate-400 text-[11px] block">Database Source</span>
          <span className="text-teal-300 font-bold text-sm mt-0.5 block">{protein.source}</span>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
          <span className="text-slate-400 text-[11px] block">Gene Symbol</span>
          <span className="text-cyan-300 font-bold text-sm mt-0.5 block">{protein.gene_name}</span>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
          <span className="text-slate-400 text-[11px] block">Taxonomy</span>
          <span className="text-slate-300 font-bold text-sm mt-0.5 truncate block">{protein.organism}</span>
        </div>
      </div>

      {/* Description Snippet */}
      {protein.description && (
        <div className="p-3.5 rounded-xl bg-slate-900/40 border border-white/5 text-xs text-slate-300 flex items-start gap-2.5 leading-relaxed">
          <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <p className="line-clamp-2">{protein.description}</p>
        </div>
      )}
    </div>
  );
};
