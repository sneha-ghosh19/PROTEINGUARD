import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ShieldCheck } from 'lucide-react';

export const ExampleMutationPreview: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 relative overflow-hidden bg-slate-950/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-950 border border-cyan-700/60 text-cyan-300 text-xs font-mono uppercase tracking-widest">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Strict Verification Guarantee</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Explore Verified Protein Mutations
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">
            ProteinGuard programmatically fetches reference sequences directly from UniProt REST API. Every position and substitution is validated before computational evaluation.
          </p>
        </div>

        {/* Central Verified Workflow Card */}
        <div className="max-w-2xl mx-auto glass-card rounded-3xl p-6 sm:p-8 border border-cyan-500/30 shadow-[0_0_40px_rgba(6,182,212,0.15)] relative">
          
          {/* Card Badge Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
              <span className="text-xs font-mono font-bold text-emerald-300 uppercase tracking-wider">
                Authoritative Sequence Pipeline
              </span>
            </div>
            <span className="text-xs font-mono text-slate-400">
              Source: UniProt &amp; RCSB PDB
            </span>
          </div>

          {/* Workflow Steps Preview */}
          <div className="space-y-4 mb-8 font-mono text-xs">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
              <span className="w-6 h-6 rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-bold flex items-center justify-center shrink-0">1</span>
              <div>
                <strong className="text-slate-200 block mb-0.5">Sequence &amp; Accession Retrieval</strong>
                <span className="text-slate-400">Retrieves exact canonical reference amino-acid sequence (e.g. P04637, P01308).</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
              <span className="w-6 h-6 rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-bold flex items-center justify-center shrink-0">2</span>
              <div>
                <strong className="text-slate-200 block mb-0.5">Strict Position &amp; Residue Verification</strong>
                <span className="text-slate-400">Verifies that sequence[position] matches expected wild-type residue before processing.</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
              <span className="w-6 h-6 rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-bold flex items-center justify-center shrink-0">3</span>
              <div>
                <strong className="text-slate-200 block mb-0.5">Multi-Dimensional Computational Evidence</strong>
                <span className="text-slate-400">Computes Shannon entropy conservation, 6.0 Å 3D contact networks, and property shifts.</span>
              </div>
            </div>
          </div>

          {/* Card Footer CTA */}
          <button
            onClick={() => navigate('/mutation-lab')}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-bold text-sm hover:from-cyan-400 hover:to-teal-400 shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Start Verified Protein Analysis</span>
            <ArrowRight className="w-4 h-4" />
          </button>

        </div>
      </div>
    </section>
  );
};
