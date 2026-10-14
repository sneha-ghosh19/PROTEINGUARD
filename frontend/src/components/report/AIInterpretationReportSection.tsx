import React from 'react';
import { Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { AIInterpretationReportData } from '../../types/report';

interface AIInterpretationReportSectionProps {
  aiReport: AIInterpretationReportData;
}

export const AIInterpretationReportSection: React.FC<AIInterpretationReportSectionProps> = ({ aiReport }) => {
  const isAvailable = aiReport.status === 'Available' && !!aiReport.interpretation;

  return (
    <section id="ai-interpretation" className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-800/60 flex items-center justify-center text-cyan-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <h2 className="text-lg font-bold text-white tracking-wide">8. Evidence-Grounded AI Research Interpretation</h2>
        </div>
        <span className="text-xs font-mono text-cyan-400 font-semibold px-2.5 py-1 rounded-md bg-cyan-950/50 border border-cyan-800/40">
          Section 8 of 11
        </span>
      </div>

      <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
        <span>Assistant Provider:</span>
        <strong className="text-cyan-300">{aiReport.provider}</strong>
      </div>

      {isAvailable ? (
        <div className="space-y-4">
          {/* Main Interpretation Text */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-cyan-900/30 text-sm text-slate-200 leading-relaxed font-sans">
            <p>{aiReport.interpretation}</p>
          </div>

          {/* Supporting Evidence List */}
          {aiReport.supporting_evidence.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold text-slate-300 block">
                Supporting Grounded Observations:
              </span>
              <ul className="space-y-1.5 font-sans text-xs text-slate-300">
                {aiReport.supporting_evidence.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-slate-950/40 border border-slate-800/60">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Uncertainties and Open Questions */}
          {aiReport.uncertainties_and_questions.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold text-amber-300 block">
                Identified Uncertainties & Hypotheses:
              </span>
              <ul className="space-y-1.5 font-sans text-xs text-slate-300">
                {aiReport.uncertainties_and_questions.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-amber-950/20 border border-amber-900/30">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Role Boundary Disclaimer */}
          <p className="text-[11px] font-sans text-slate-400 italic">
            {aiReport.computational_role_note}
          </p>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-400 text-xs font-mono flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
          <div>
            <strong className="text-slate-300 block mb-0.5">AI interpretation unavailable:</strong>
            <p className="text-slate-400 font-sans text-xs">
              {aiReport.reason_unavailable || 'AI interpretation was not generated or assistant service is currently offline.'}
            </p>
          </div>
        </div>
      )}
    </section>
  );
};
