import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Beaker, ArrowLeft, Clock } from 'lucide-react';

export const MutationLabPlaceholder: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const exampleParam = searchParams.get('example');

  return (
    <div className="min-h-screen bg-[#070a12] text-slate-100 flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center py-20 px-4">
        <div className="max-w-xl w-full glass-card rounded-3xl p-8 sm:p-10 text-center space-y-6 border border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.15)] relative overflow-hidden">
          
          <div className="w-16 h-16 rounded-2xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400 mx-auto shadow-lg">
            <Beaker className="w-8 h-8 animate-pulse" />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
            <Clock className="w-3.5 h-3.5" />
            <span>Planned Module — Screen 2</span>
          </div>

          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Mutation Lab
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            The interactive Mutation Selection & Analysis Playground will be built in <strong className="text-cyan-400 font-semibold">Screen 2</strong>.
          </p>

          {exampleParam && (
            <div className="p-4 rounded-xl bg-slate-900/90 border border-cyan-500/30 text-xs font-mono text-cyan-300 text-left space-y-1">
              <span className="text-slate-400 uppercase tracking-widest block text-[10px]">Loaded Example Parameter:</span>
              <div className="font-bold text-sm text-white">Dengue Capsid Protein (A98V)</div>
              <div className="text-slate-400">Position 98: Ala → Val</div>
            </div>
          )}

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm border border-slate-600 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Landing Page</span>
            </button>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
};
