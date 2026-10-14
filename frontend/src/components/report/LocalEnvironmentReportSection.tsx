import React from 'react';
import { Compass, AlertCircle } from 'lucide-react';
import type { LocalEnvironmentReportData } from '../../types/report';

interface LocalEnvironmentReportSectionProps {
  localEnv: LocalEnvironmentReportData;
}

export const LocalEnvironmentReportSection: React.FC<LocalEnvironmentReportSectionProps> = ({ localEnv }) => {
  const isAvailable = localEnv.status === 'Available' && localEnv.contacts.length > 0;

  return (
    <section id="local-environment" className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal-950/80 border border-teal-800/60 flex items-center justify-center text-teal-400">
            <Compass className="w-4 h-4" />
          </div>
          <h2 className="text-lg font-bold text-white tracking-wide">7. Local Structural Environment & Residue Contacts</h2>
        </div>
        <span className="text-xs font-mono text-teal-400 font-semibold px-2.5 py-1 rounded-md bg-teal-950/50 border border-teal-800/40">
          Section 7 of 11
        </span>
      </div>

      <p className="text-xs text-slate-400 font-mono">
        Distance Sphere: <strong className="text-cyan-300">{localEnv.radius_angstrom.toFixed(1)} Å Euclidean Radius</strong> • {localEnv.method}
      </p>

      {isAvailable ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Spatial Contact Neighbors Identified:</span>
            <span className="text-cyan-400 font-bold">{localEnv.contact_count} residues</span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/50 max-h-72 overflow-y-auto">
            <table className="w-full text-xs font-mono text-left">
              <thead className="bg-slate-900/90 text-slate-300 border-b border-slate-800 uppercase text-[10px] tracking-wider sticky top-0">
                <tr>
                  <th className="py-2.5 px-3">Neighbor Residue</th>
                  <th className="py-2.5 px-3">Position</th>
                  <th className="py-2.5 px-3">Chain</th>
                  <th className="py-2.5 px-3">Atom</th>
                  <th className="py-2.5 px-3 text-right">Distance (Å)</th>
                  <th className="py-2.5 px-3">Contact Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {localEnv.contacts.map((contact, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-2.5 px-3 text-white font-bold">{contact.residue_name}</td>
                    <td className="py-2.5 px-3 text-slate-300">{contact.position}</td>
                    <td className="py-2.5 px-3 text-slate-300">{contact.chain_id}</td>
                    <td className="py-2.5 px-3 text-slate-400">{contact.atom_name}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-cyan-300">
                      {contact.distance_angstrom.toFixed(2)} Å
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 text-[11px]">{contact.contact_type}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-900/40 text-amber-300/90 text-xs font-mono flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-amber-200 block mb-0.5">Local microenvironment unavailable:</strong>
            <p className="text-slate-300 font-sans text-xs">
              {localEnv.reason_unavailable || 'Local structural environment unavailable because a verified residue-to-structure mapping could not be established.'}
            </p>
          </div>
        </div>
      )}
    </section>
  );
};
