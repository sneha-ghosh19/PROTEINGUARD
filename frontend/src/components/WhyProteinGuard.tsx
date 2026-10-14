import React from 'react';
import { FlaskConical, Box, Sparkles } from 'lucide-react';

export const WhyProteinGuard: React.FC = () => {
  return (
    <section id="technology" className="py-20 relative overflow-hidden bg-slate-950/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-xs font-mono uppercase tracking-widest text-cyan-400">
            Core Architecture
          </h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Why ProteinGuard?
          </p>
          <p className="text-slate-400 text-base sm:text-lg">
            A modular multi-layered approach to evaluate how amino-acid changes alter molecular landscapes.
          </p>
        </div>

        {/* 3 Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Card 1 — Biochemical Context */}
          <div className="glass-card rounded-2xl p-8 flex flex-col justify-between hover:border-cyan-500/40 relative group">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-xl bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 group-hover:border-cyan-400 transition-all duration-300">
                <FlaskConical className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white tracking-wide">
                Biochemical Context
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Compare amino-acid properties such as charge, polarity, hydrophobicity, size, and other physicochemical characteristics.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-2 text-xs font-mono text-cyan-400/80">
              <span>Physicochemical Metrics</span>
            </div>
          </div>

          {/* Card 2 — Structural Context */}
          <div className="glass-card rounded-2xl p-8 flex flex-col justify-between hover:border-teal-500/40 relative group">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-xl bg-teal-950/80 border border-teal-500/30 flex items-center justify-center text-teal-400 group-hover:scale-110 group-hover:border-teal-400 transition-all duration-300">
                <Box className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white tracking-wide">
                Structural Context
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Explore the local structural environment and molecular context surrounding a mutated residue.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-2 text-xs font-mono text-teal-400/80">
              <span>Spatial Micro-environment</span>
            </div>
          </div>

          {/* Card 3 — Explainable AI */}
          <div className="glass-card rounded-2xl p-8 flex flex-col justify-between hover:border-violet-500/40 relative group">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-xl bg-violet-950/80 border border-violet-500/30 flex items-center justify-center text-violet-400 group-hover:scale-110 group-hover:border-violet-400 transition-all duration-300">
                <Sparkles className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white tracking-wide">
                Explainable AI
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Gemma 4 will transform computational evidence into understandable, evidence-grounded explanations.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs font-mono text-violet-400/80">
              <span>Reasoning Layer</span>
              <span className="text-[10px] text-slate-500">(Calculations via modules)</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
