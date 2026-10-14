import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Dna, Sparkles, ShieldCheck } from 'lucide-react';
import { ProteinVisualizer } from './ProteinVisualizer';

export const Hero: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="relative pt-12 pb-16 lg:pt-20 lg:pb-24 overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[350px] h-[350px] bg-violet-500/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Heading, Subheading & CTAs */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            {/* Top Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-xs font-medium backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Open-Source Explainable Mutation Analysis</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15]">
              Understand What Changes When a Protein <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-violet-400 bg-clip-text text-transparent">Mutates.</span>
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg lg:text-xl text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              ProteinGuard is an open-source, explainable platform for exploring the biochemical and structural impact of amino-acid substitutions.
            </p>

            {/* Action Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <button
                onClick={() => navigate('/mutation-lab')}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 text-slate-950 font-bold text-base hover:opacity-95 shadow-[0_0_30px_rgba(6,182,212,0.4)] hover:shadow-[0_0_40px_rgba(6,182,212,0.6)] transition-all flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <span>Explore a Mutation</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            {/* Micro Feature Indicators */}
            <div className="pt-6 grid grid-cols-3 gap-2 border-t border-white/10 text-xs text-slate-400 font-mono">
              <div className="flex items-center gap-1.5 justify-center lg:justify-start">
                <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Zero Hallucination Grounding</span>
              </div>
              <div className="flex items-center gap-1.5 justify-center lg:justify-start">
                <Dna className="w-4 h-4 text-teal-400 shrink-0" />
                <span>Biochemical Mapping</span>
              </div>
              <div className="flex items-center gap-1.5 justify-center lg:justify-start">
                <Sparkles className="w-4 h-4 text-violet-400 shrink-0" />
                <span>Gemma 4 Reasoning</span>
              </div>
            </div>

          </div>

          {/* Right Column: Hero Visual Metaphor */}
          <div className="lg:col-span-5 flex justify-center">
            <ProteinVisualizer />
          </div>

        </div>
      </div>
    </section>
  );
};
