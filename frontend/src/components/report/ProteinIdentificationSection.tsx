import React from 'react';
import { Database, ExternalLink, CheckCircle2 } from 'lucide-react';
import type { ProteinIdentificationData } from '../../types/report';

interface ProteinIdentificationSectionProps {
  protein: ProteinIdentificationData;
}

export const ProteinIdentificationSection: React.FC<ProteinIdentificationSectionProps> = ({ protein }) => {
  return (
    <section id="protein-identification" className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal-950/80 border border-teal-800/60 flex items-center justify-center text-teal-400">
            <Database className="w-4 h-4" />
          </div>
          <h2 className="text-lg font-bold text-white tracking-wide">2. Protein Identification & Reference Sequence</h2>
        </div>
        <span className="text-xs font-mono text-teal-400 font-semibold px-2.5 py-1 rounded-md bg-teal-950/50 border border-teal-800/40">
          Section 2 of 11
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
        <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Recommended Name</span>
            <span className="text-white font-bold">{protein.protein_name}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Gene Symbol</span>
            <span className="text-slate-200 font-semibold">{protein.gene_name || 'Not specified'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">UniProt Accession</span>
            <span className="text-cyan-300 font-bold flex items-center gap-1.5">
              {protein.protein_accession}
              {protein.source_url && (
                <a
                  href={protein.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:text-cyan-300"
                  title="Open in UniProt KB"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Taxonomic Organism</span>
            <span className="text-slate-200 italic">{protein.organism}</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Canonical Sequence Length</span>
            <span className="text-white font-bold">{protein.sequence_length} amino acids</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Authoritative Source</span>
            <span className="text-slate-200">{protein.source_database}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Retrieval Provenance</span>
            <span className="text-slate-300">{new Date(protein.retrieval_date).toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Validation Status</span>
            <span className="text-emerald-400 font-bold inline-flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{protein.validation_status}</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
