import React from 'react';
import { FlaskConical, Scale, Zap, Droplets, Info } from 'lucide-react';
import type { PhysicochemicalReportData } from '../../types/report';

interface PhysicochemicalReportSectionProps {
  physico: PhysicochemicalReportData;
}

export const PhysicochemicalReportSection: React.FC<PhysicochemicalReportSectionProps> = ({ physico }) => {
  return (
    <section id="physicochemical-shifts" className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-950/80 border border-indigo-800/60 flex items-center justify-center text-indigo-400">
            <FlaskConical className="w-4 h-4" />
          </div>
          <h2 className="text-lg font-bold text-white tracking-wide">4. Physicochemical Property Shifts</h2>
        </div>
        <span className="text-xs font-mono text-indigo-400 font-semibold px-2.5 py-1 rounded-md bg-indigo-950/50 border border-indigo-800/40">
          Section 4 of 11
        </span>
      </div>

      <p className="text-xs text-slate-400 font-mono">
        Methodology: <strong className="text-slate-300">{physico.method}</strong>
      </p>

      {/* Property Comparison Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/50">
        <table className="w-full text-xs font-mono text-left">
          <thead className="bg-slate-900/90 text-slate-300 border-b border-slate-800 uppercase text-[11px] tracking-wider">
            <tr>
              <th className="py-3 px-4">Physicochemical Property</th>
              <th className="py-3 px-4">Reference Residue</th>
              <th className="py-3 px-4">Mutant Residue</th>
              <th className="py-3 px-4">Calculated Shift / Delta</th>
              <th className="py-3 px-4 text-center">Classification</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/70">
            {physico.properties.map((prop, idx) => {
              const isShift = prop.classification === 'Shift' || prop.classification === 'Altered';
              return (
                <tr key={idx} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-3 px-4 text-white font-semibold flex items-center gap-2">
                    {prop.property_name.includes('Weight') && <Scale className="w-3.5 h-3.5 text-cyan-400" />}
                    {prop.property_name.includes('Charge') && <Zap className="w-3.5 h-3.5 text-amber-400" />}
                    {prop.property_name.includes('Hydrophobicity') && <Droplets className="w-3.5 h-3.5 text-blue-400" />}
                    <span>{prop.property_name}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-300">{prop.reference_value}</td>
                  <td className="py-3 px-4 text-cyan-300 font-bold">{prop.mutant_value}</td>
                  <td className="py-3 px-4 text-slate-200 font-bold">{prop.delta_or_shift}</td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isShift
                          ? 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                          : 'bg-slate-800/80 text-slate-300 border border-slate-700'
                      }`}
                    >
                      {prop.classification}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Grounded Property Shift Interpretation */}
      {physico.interpretation_note && (
        <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/80 text-xs text-slate-300 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-white block mb-0.5 font-mono">Biochemical Interpretation:</strong>
            <p className="font-sans text-xs leading-relaxed text-slate-300">{physico.interpretation_note}</p>
          </div>
        </div>
      )}
    </section>
  );
};
