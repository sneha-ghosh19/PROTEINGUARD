import React from 'react';
import { Microscope, ArrowUpRight } from 'lucide-react';

interface InvestigationSuggestionsSectionProps {
  suggestions: string[];
}

export const InvestigationSuggestionsSection: React.FC<InvestigationSuggestionsSectionProps> = ({ suggestions }) => {
  return (
    <section id="further-investigations" className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal-950/80 border border-teal-800/60 flex items-center justify-center text-teal-400">
            <Microscope className="w-4 h-4" />
          </div>
          <h2 className="text-lg font-bold text-white tracking-wide">11. Suggested Further Investigations</h2>
        </div>
        <span className="text-xs font-mono text-teal-400 font-semibold px-2.5 py-1 rounded-md bg-teal-950/50 border border-teal-800/40">
          Section 11 of 11
        </span>
      </div>

      <p className="text-xs text-slate-400 font-sans">
        Logical evidence-grounded next steps to resolve remaining uncertainties and validate computational findings:
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-sans">
        {suggestions.map((sug, idx) => (
          <div
            key={idx}
            className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800 hover:border-cyan-500/30 transition-colors flex items-start gap-2.5"
          >
            <div className="w-5 h-5 rounded-md bg-cyan-950 border border-cyan-800/50 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
            <p className="text-slate-200 leading-relaxed">{sug}</p>
          </div>
        ))}
      </div>
    </section>
  );
};
