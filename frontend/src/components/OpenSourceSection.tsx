import React from 'react';
import { Code2, Users, FileCheck, RefreshCw } from 'lucide-react';

export const OpenSourceSection: React.FC = () => {
  const highlights = [
    { label: 'Open Source', desc: 'Fully permissively licensed codebase', icon: Code2 },
    { label: 'Community Contributions', desc: 'Modular bioinformatics extensions', icon: Users },
    { label: 'Transparent Evaluation', desc: 'No black-box hidden scoring algorithms', icon: FileCheck },
    { label: 'Reproducible Analysis', desc: 'Deterministic evidence pipelines', icon: RefreshCw },
  ];

  return (
    <section id="open-source" className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="glass-card rounded-3xl p-8 sm:p-12 border border-cyan-500/20 bg-gradient-to-br from-slate-900/90 via-[#0b101d]/90 to-slate-950/90 relative overflow-hidden">
          
          {/* Subtle Glow */}
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
                <Code2 className="w-3.5 h-3.5" />
                <span>Open Science & Transparency</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Built in the Open.
              </h2>

              <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
                ProteinGuard is designed as an open-source scientific platform where developers, bioinformaticians, researchers and students can contribute analysis modules, datasets, evaluation tools and interface improvements.
              </p>
            </div>

            {/* Right 4 Pill Highlights Grid */}
            <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {highlights.map((item) => {
                const IconComp = item.icon;
                return (
                  <div
                    key={item.label}
                    className="p-4 rounded-2xl bg-slate-900/80 border border-white/5 hover:border-cyan-500/30 transition-all space-y-2"
                  >
                    <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                      <IconComp className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-bold text-white font-mono">
                      {item.label}
                    </h3>
                    <p className="text-xs text-slate-400 leading-normal">
                      {item.desc}
                    </p>
                  </div>
                );
              })}
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
