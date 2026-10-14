import React from 'react';
import { Cpu, FileSpreadsheet, Sparkles, MessageSquare, ShieldCheck } from 'lucide-react';

export const GemmaSection: React.FC = () => {
  const pipelineSteps = [
    {
      title: 'Scientific Analysis',
      subtitle: 'Physicochemical & structural calculations',
      icon: Cpu,
      color: 'border-cyan-500/40 text-cyan-400 bg-cyan-950/50',
    },
    {
      title: 'Structured Evidence',
      subtitle: 'Deterministic JSON evidence graph',
      icon: FileSpreadsheet,
      color: 'border-teal-500/40 text-teal-400 bg-teal-950/50',
    },
    {
      title: 'Gemma 4',
      subtitle: 'Open-weights explanation layer',
      icon: Sparkles,
      color: 'border-violet-500/50 text-violet-300 bg-violet-950/60 shadow-[0_0_15px_rgba(139,92,246,0.3)]',
    },
    {
      title: 'Human Explanation',
      subtitle: 'Grounded scientific reasoning report',
      icon: MessageSquare,
      color: 'border-emerald-500/40 text-emerald-400 bg-emerald-950/50',
    },
  ];

  return (
    <section className="py-24 relative overflow-hidden bg-slate-950/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-950/80 border border-violet-500/40 text-violet-300 text-xs font-mono">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            <span>Open Model Reasoning Architecture</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            AI That Explains the Evidence.
          </h2>

          <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
            ProteinGuard uses Gemma 4 as an explanation layer. Scientific calculations are performed by dedicated analysis modules, while Gemma 4 converts structured evidence into understandable scientific reasoning.
          </p>
        </div>

        {/* Visual Pipeline Graphic */}
        <div className="max-w-5xl mx-auto glass-card rounded-3xl p-6 sm:p-10 border border-violet-500/20 shadow-2xl">
          <h3 className="text-xs font-mono uppercase text-slate-400 tracking-wider text-center mb-8">
            Evidence Synthesis Pipeline
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
            {pipelineSteps.map((step) => {
              const IconComp = step.icon;
              return (
                <div key={step.title} className={`p-5 rounded-2xl border ${step.color} flex flex-col items-center text-center justify-between space-y-3 relative z-10`}>
                  <div className="w-12 h-12 rounded-xl border flex items-center justify-center bg-slate-900/80 border-white/10">
                    <IconComp className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white tracking-wide font-mono">
                      {step.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-1 leading-tight">
                      {step.subtitle}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pipeline Note */}
          <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-center gap-2 text-xs text-slate-400 text-center font-mono">
            <ShieldCheck className="w-4 h-4 text-violet-400 shrink-0" />
            <span>Gemma 4 explains evidence prepared by analytical modules; it does not independently originate biological ground truth.</span>
          </div>

        </div>
      </div>
    </section>
  );
};
