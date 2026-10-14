import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Sparkles, ArrowLeft, Clock } from 'lucide-react';

export const ReportPlaceholder: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#070a12] text-slate-100 flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center py-20 px-4">
        <div className="max-w-xl w-full glass-card rounded-3xl p-8 sm:p-10 text-center space-y-6 border border-cyan-500/30">
          <div className="w-16 h-16 rounded-2xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400 mx-auto">
            <Sparkles className="w-8 h-8 animate-pulse" />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
            <Clock className="w-3.5 h-3.5" />
            <span>Planned Module — Screen 5</span>
          </div>

          <h1 className="text-3xl font-extrabold text-white">Gemma 4 Explanation Report</h1>
          <p className="text-slate-300 text-sm">Grounded scientific explanation synthesis and downloadable PDF/JSON report export will be available in Screen 5.</p>

          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm border border-slate-600 inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Landing Page</span>
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );
};
