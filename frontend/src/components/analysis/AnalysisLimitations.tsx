import React from 'react';

export const AnalysisLimitations: React.FC = () => {
  return (
    <div className="bg-slate-900/60 border border-amber-900/40 rounded-xl p-6 backdrop-blur-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
          <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-100">
            Scientific Interpretation Boundaries &amp; Limitations
          </h3>
          <p className="text-xs text-slate-400">
            Crucial methodological parameters governing this computational output
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
        <ul className="space-y-2.5">
          <li className="flex items-start gap-2">
            <span className="text-amber-400 font-bold">•</span>
            <span>
              <strong className="text-slate-200">Homology Dependency:</strong> Sequence conservation metrics are relative to the retrieved UniProt homologous sequence set and alignment parameters.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-400 font-bold">•</span>
            <span>
              <strong className="text-slate-200">Wild-Type Reference Coordinates:</strong> Structural context relies strictly on wild-type experimental PDB structures. The mutant structure has not been experimentally determined here.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-400 font-bold">•</span>
            <span>
              <strong className="text-slate-200">Non-Clinical Research Notice:</strong> ProteinGuard predictions provide biochemical evidence for hypothesis generation and must not be used for medical diagnosis or clinical treatment.
            </span>
          </li>
        </ul>

        <ul className="space-y-2.5">
          <li className="flex items-start gap-2">
            <span className="text-amber-400 font-bold">•</span>
            <span>
              <strong className="text-slate-200">Physicochemical Limits:</strong> In silico property shifts (e.g. weight, charge, hydrophobicity) do not independently confirm protein destabilization or functional disruption.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-400 font-bold">•</span>
            <span>
              <strong className="text-slate-200">Deterministic Computation:</strong> All metrics on this screen are produced by deterministic, documented algorithms (Shannon entropy, spatial contact radii).
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-400 font-bold">•</span>
            <span>
              <strong className="text-slate-200">Experimental Requirement:</strong> Any computational hypothesis generated on Screen 3 requires laboratory validation (e.g. biophysical assays, X-ray, NMR, Cryo-EM).
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
};
