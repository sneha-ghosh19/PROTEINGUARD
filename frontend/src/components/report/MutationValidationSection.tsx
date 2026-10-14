import React from 'react';
import { CheckCircle2, ArrowRight, Info } from 'lucide-react';
import type { MutationValidationData } from '../../types/report';

interface MutationValidationSectionProps {
  mutation: MutationValidationData;
}

export const MutationValidationSection: React.FC<MutationValidationSectionProps> = ({ mutation }) => {
  return (
    <section id="mutation-validation" className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <h2 className="text-lg font-bold text-white tracking-wide">3. Mutation Validation & Sequence Alignment</h2>
        </div>
        <span className="text-xs font-mono text-emerald-400 font-semibold px-2.5 py-1 rounded-md bg-emerald-950/50 border border-emerald-800/40">
          Section 3 of 11
        </span>
      </div>

      {/* Visual Substitution Badge */}
      <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-center font-mono">
            <span className="text-[10px] text-slate-400 block uppercase">Reference</span>
            <span className="text-lg font-black text-white">{mutation.original_residue}</span>
            <span className="text-[10px] text-slate-400 block">{mutation.original_name}</span>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
              Pos {mutation.position}
            </span>
            <ArrowRight className="w-5 h-5 text-slate-500 my-1" />
          </div>

          <div className="px-3.5 py-2 rounded-xl bg-cyan-950/40 border border-cyan-800/60 text-center font-mono">
            <span className="text-[10px] text-cyan-400 block uppercase">Substituted</span>
            <span className="text-lg font-black text-cyan-300">{mutation.mutant_residue}</span>
            <span className="text-[10px] text-cyan-400 block">{mutation.mutant_name}</span>
          </div>
        </div>

        <div className="text-right font-mono text-xs space-y-1">
          <span className="text-slate-400 block text-[11px]">Validated Standard Notation</span>
          <span className="text-2xl font-black text-emerald-400 tracking-wider">
            {mutation.notation}
          </span>
          <span className="text-[10px] text-emerald-500 block font-semibold">
            ✓ Confirmed against canonical sequence
          </span>
        </div>
      </div>

      {/* Numbering and Mapping Details */}
      <div className="p-3.5 rounded-xl bg-slate-950/30 border border-slate-800/80 text-xs font-mono space-y-2">
        <div className="flex items-start gap-2 text-slate-300">
          <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p>
              <strong className="text-white">Sequence Coordinate Space:</strong> {mutation.sequence_numbering_type}
            </p>
            {mutation.structure_numbering_note && (
              <p className="text-slate-400">
                <strong className="text-teal-300">PDB Structural Mapping:</strong> {mutation.structure_numbering_note}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
