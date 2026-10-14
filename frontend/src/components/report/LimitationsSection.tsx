import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface LimitationsSectionProps {
  limitations: string[];
}

export const LimitationsSection: React.FC<LimitationsSectionProps> = ({ limitations }) => {
  return (
    <section id="scientific-limitations" className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-950/80 border border-amber-800/60 flex items-center justify-center text-amber-400">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <h2 className="text-lg font-bold text-white tracking-wide">10. Scientific Limitations & Boundaries</h2>
        </div>
        <span className="text-xs font-mono text-amber-400 font-semibold px-2.5 py-1 rounded-md bg-amber-950/50 border border-amber-800/40">
          Section 10 of 11
        </span>
      </div>

      <div className="p-4 rounded-xl bg-amber-950/15 border border-amber-900/30 text-xs font-sans text-amber-200/90 leading-relaxed space-y-2">
        <p className="font-semibold text-amber-300">
          Computational evidence describes the information available from the selected data sources and methods. It does not, by itself, establish the biological or clinical effect of the substitution.
        </p>
      </div>

      <ul className="space-y-2 font-sans text-xs text-slate-300">
        {limitations.map((lim, idx) => (
          <li key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950/40 border border-slate-800/80">
            <span className="text-amber-400 font-bold shrink-0 mt-0.5">•</span>
            <span className="leading-relaxed">{lim}</span>
          </li>
        ))}
      </ul>
    </section>
  );
};
