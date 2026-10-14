import React from 'react';
import { Search, Edit3, Cpu, CheckCircle2 } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Select Protein',
      desc: 'Input UniProt ID, PDB accession, or upload sequence FASTA.',
      icon: Search,
      accent: 'from-cyan-500 to-teal-500',
    },
    {
      num: '02',
      title: 'Choose Mutation',
      desc: 'Specify position and target amino-acid substitution.',
      icon: Edit3,
      accent: 'from-teal-500 to-emerald-500',
    },
    {
      num: '03',
      title: 'Analyze Evidence',
      desc: 'Evaluate physicochemical shifts, conservation & 3D environment.',
      icon: Cpu,
      accent: 'from-emerald-500 to-violet-500',
    },
    {
      num: '04',
      title: 'Understand the Result',
      desc: 'Gemma 4 synthesizes evidence into clear scientific explanations.',
      icon: CheckCircle2,
      accent: 'from-violet-500 to-cyan-500',
    },
  ];

  return (
    <section id="how-it-works" className="py-24 relative overflow-hidden">
      {/* Background Subtle Gradient */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[500px] bg-cyan-950/20 blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
          <h2 className="text-xs font-mono uppercase tracking-widest text-cyan-400">
            Workflow Pipeline
          </h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            How It Works
          </p>
          <p className="text-slate-400 text-base sm:text-lg">
            From amino-acid sequence modification to grounded scientific insight in four clear steps.
          </p>
        </div>

        {/* 4-Step Responsive Pipeline */}
        <div className="relative">
          {/* Desktop Connecting Line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500/30 via-teal-500/30 to-violet-500/30 -translate-y-6 z-0" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
            {steps.map((step) => {
              const StepIcon = step.icon;
              return (
                <div
                  key={step.num}
                  className="glass-card rounded-2xl p-6 flex flex-col justify-between hover:translate-y-1 transition-all duration-300 relative group"
                >
                  <div className="space-y-4">
                    {/* Top Step Badge & Icon */}
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-2xl font-black bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">
                        {step.num}
                      </span>
                      <div className="w-10 h-10 rounded-lg bg-slate-900 border border-white/10 flex items-center justify-center text-cyan-400 group-hover:border-cyan-400/50 transition-colors">
                        <StepIcon className="w-5 h-5" />
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-white tracking-tight">
                      {step.title}
                    </h3>

                    <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                      {step.desc}
                    </p>
                  </div>

                  {/* Bottom Accent Bar */}
                  <div className={`mt-6 h-1 w-full rounded-full bg-gradient-to-r ${step.accent} opacity-60 group-hover:opacity-100 transition-opacity`} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Pipeline Summary Note */}
        <div className="mt-16 text-center">
          <p className="inline-block px-6 py-3 rounded-full bg-slate-900/80 border border-white/10 text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
            ProteinGuard combines sequence information, amino-acid properties, conservation and structural context before generating an explanation.
          </p>
        </div>

      </div>
    </section>
  );
};
