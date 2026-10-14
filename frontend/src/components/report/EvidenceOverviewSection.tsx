import React from 'react';
import { Layers } from 'lucide-react';
import type { EvidencePillarOverviewItemData } from '../../types/report';

interface EvidenceOverviewSectionProps {
  overview: EvidencePillarOverviewItemData[];
}

export const EvidenceOverviewSection: React.FC<EvidenceOverviewSectionProps> = ({ overview }) => {
  return (
    <section id="evidence-overview" className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-800/60 flex items-center justify-center text-cyan-400">
            <Layers className="w-4 h-4" />
          </div>
          <h2 className="text-lg font-bold text-white tracking-wide">9. Independent 4-Pillar Evidence Summary</h2>
        </div>
        <span className="text-xs font-mono text-cyan-400 font-semibold px-2.5 py-1 rounded-md bg-cyan-950/50 border border-cyan-800/40">
          Section 9 of 11
        </span>
      </div>

      <p className="text-xs text-slate-400 font-mono">
        Strict separation of evidence pillars. ProteinGuard does not compute artificial composite scores.
      </p>

      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/50">
        <table className="w-full text-xs font-mono text-left">
          <thead className="bg-slate-900/90 text-slate-300 border-b border-slate-800 uppercase text-[10px] tracking-wider">
            <tr>
              <th className="py-3 px-4">Evidence Pillar</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4">Source / Methodology</th>
              <th className="py-3 px-4">Boundary / Key Limitations</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/70">
            {overview.map((pillar, idx) => {
              const isVerified = pillar.status === 'Verified' || pillar.status === 'Calculated';
              return (
                <tr key={idx} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-3 px-4 text-white font-bold">{pillar.pillar_name}</td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isVerified
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                          : 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                      }`}
                    >
                      {pillar.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-300">{pillar.source_or_method}</td>
                  <td className="py-3 px-4 text-slate-400 text-[11px] font-sans">{pillar.limitations}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
};
