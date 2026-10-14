import React from 'react';
import { History, CheckCircle2 } from 'lucide-react';
import type { DataProvenanceItemData } from '../../types/report';

interface ProvenanceSectionProps {
  provenance: DataProvenanceItemData[];
}

export const ProvenanceSection: React.FC<ProvenanceSectionProps> = ({ provenance }) => {
  return (
    <section id="data-provenance" className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-800/60 flex items-center justify-center text-cyan-400">
            <History className="w-4 h-4" />
          </div>
          <h2 className="text-lg font-bold text-white tracking-wide">Data Provenance & Verification Audit Trail</h2>
        </div>
        <span className="text-xs font-mono text-cyan-400 font-semibold px-2.5 py-1 rounded-md bg-cyan-950/50 border border-cyan-800/40">
          Audit Trail
        </span>
      </div>

      <p className="text-xs text-slate-400 font-mono">
        Every observation in this report is traceable to its authoritative primary biological data source or calculation method:
      </p>

      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/50">
        <table className="w-full text-xs font-mono text-left">
          <thead className="bg-slate-900/90 text-slate-300 border-b border-slate-800 uppercase text-[10px] tracking-wider">
            <tr>
              <th className="py-2.5 px-3">Primary Source</th>
              <th className="py-2.5 px-3">Resource Identifier</th>
              <th className="py-2.5 px-3">Verification Timestamp</th>
              <th className="py-2.5 px-3">Retrieval & Computation Methodology</th>
              <th className="py-2.5 px-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {provenance.map((prov, idx) => (
              <tr key={idx} className="hover:bg-slate-900/40 transition-colors">
                <td className="py-2.5 px-3 text-white font-bold">{prov.source}</td>
                <td className="py-2.5 px-3 text-cyan-300 font-bold">{prov.identifier || 'N/A'}</td>
                <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                  {prov.retrieved_at ? new Date(prov.retrieved_at).toLocaleString() : 'Canonical'}
                </td>
                <td className="py-2.5 px-3 text-slate-300 text-[11px] font-sans">{prov.method || 'Direct Query'}</td>
                <td className="py-2.5 px-3 text-center">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{prov.status || 'VERIFIED'}</span>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};
