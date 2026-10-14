import React from 'react';
import { Edit3, AlertTriangle, CheckCircle } from 'lucide-react';

interface MutationSelectorProps {
  sequenceLength: number;
  selectedPosition: number | null;
  originalResidue: string | null;
  mutantResidue: string;
  onPositionChange: (pos: number) => void;
  onMutantChange: (mut: string) => void;
  onAnalyze?: () => void;
  loading: boolean;
  error: string | null;
}

const AMINO_ACID_OPTIONS = [
  { code: 'A', name: 'Alanine' },
  { code: 'R', name: 'Arginine' },
  { code: 'N', name: 'Asparagine' },
  { code: 'D', name: 'Aspartic acid' },
  { code: 'C', name: 'Cysteine' },
  { code: 'Q', name: 'Glutamine' },
  { code: 'E', name: 'Glutamic acid' },
  { code: 'G', name: 'Glycine' },
  { code: 'H', name: 'Histidine' },
  { code: 'I', name: 'Isoleucine' },
  { code: 'L', name: 'Leucine' },
  { code: 'K', name: 'Lysine' },
  { code: 'M', name: 'Methionine' },
  { code: 'F', name: 'Phenylalanine' },
  { code: 'P', name: 'Proline' },
  { code: 'S', name: 'Serine' },
  { code: 'T', name: 'Threonine' },
  { code: 'W', name: 'Tryptophan' },
  { code: 'Y', name: 'Tyrosine' },
  { code: 'V', name: 'Valine' }
];

export const MutationSelector: React.FC<MutationSelectorProps> = ({
  sequenceLength,
  selectedPosition,
  originalResidue,
  mutantResidue,
  onPositionChange,
  onMutantChange,
  onAnalyze: _onAnalyze,
  loading: _loading,
  error
}) => {
  const isSameResidue = originalResidue === mutantResidue;

  return (
    <div className="glass-card rounded-2xl p-6 sm:p-8 border border-cyan-500/30 space-y-6 shadow-xl">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Edit3 className="w-5 h-5 text-cyan-400" />
          <span>3. Select Substitution</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Specify target position and mutant amino acid replacement.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Position Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-mono uppercase text-slate-400 block">
            Position (1 - {sequenceLength})
          </label>
          <input
            type="number"
            min={1}
            max={sequenceLength}
            value={selectedPosition || ''}
            onChange={(e) => onPositionChange(parseInt(e.target.value, 10) || 1)}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-sm focus:outline-none focus:border-cyan-400"
          />
        </div>

        {/* Original AA (Auto-determined) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono uppercase text-slate-400 block">
              Original Residue (Verified)
            </label>
            <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800">
              ✓ UniProt
            </span>
          </div>
          <div className="px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-cyan-300 font-mono text-sm flex items-center justify-between">
            <span>{originalResidue ? `${originalResidue} — ${AMINO_ACID_OPTIONS.find(a => a.code === originalResidue)?.name}` : 'Select position'}</span>
            <CheckCircle className="w-4 h-4 text-cyan-400 opacity-60" />
          </div>
        </div>

        {/* Mutant AA Dropdown */}
        <div className="space-y-1.5">
          <label className="text-xs font-mono uppercase text-slate-400 block">
            Mutate To
          </label>
          <select
            value={mutantResidue}
            onChange={(e) => onMutantChange(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-sm focus:outline-none focus:border-cyan-400 cursor-pointer"
          >
            {AMINO_ACID_OPTIONS.map((aa) => (
              <option key={aa.code} value={aa.code}>
                {aa.code} — {aa.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Same Residue Error Warning */}
      {isSameResidue && (
        <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>This is not a mutation. Please select a different target amino acid.</span>
        </div>
      )}

      {/* Error Message */}
      {error && !isSameResidue && (
        <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs">
          {error}
        </div>
      )}

    </div>
  );
};
