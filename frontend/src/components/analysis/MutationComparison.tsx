import React, { useState, useEffect } from 'react';
import type { MutationCompareResponse } from '../../types/analysis';

interface MutationComparisonProps {
  accession: string;
  position: number;
  originalResidue: string;
  activeMutant: string;
  onCompare: (mutantB: string) => Promise<MutationCompareResponse | null>;
}

const AMINO_ACIDS_LIST = [
  { code: 'A', name: 'Alanine' },
  { code: 'R', name: 'Arginine' },
  { code: 'N', name: 'Asparagine' },
  { code: 'D', name: 'Aspartate' },
  { code: 'C', name: 'Cysteine' },
  { code: 'E', name: 'Glutamate' },
  { code: 'Q', name: 'Glutamine' },
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
  { code: 'V', name: 'Valine' },
];

export const MutationComparison: React.FC<MutationComparisonProps> = ({
  position,
  originalResidue,
  activeMutant,
  onCompare,
}) => {
  // Available alternatives excluding original and active mutant
  const alternatives = AMINO_ACIDS_LIST.filter(
    (aa) => aa.code !== originalResidue && aa.code !== activeMutant
  );

  const [selectedMutantB, setSelectedMutantB] = useState<string>(
    alternatives[0]?.code || 'D'
  );
  const [comparisonResult, setComparisonResult] = useState<MutationCompareResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (selectedMutantB) {
      handleRunComparison(selectedMutantB);
    }
  }, [selectedMutantB, activeMutant]);

  const handleRunComparison = async (mutantBCode: string) => {
    setLoading(true);
    try {
      const res = await onCompare(mutantBCode);
      setComparisonResult(res);
    } catch (err) {
      console.error('Failed to run mutation comparison:', err);
    } finally {
      setLoading(false);
    }
  };

  const mutA = comparisonResult?.mutation_a;
  const mutB = comparisonResult?.mutation_b;

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.5)]"></span>
            Mutation Playground Comparison
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Compare active substitution ({originalResidue}{position}{activeMutant}) against an alternative variant at Position {position}
          </p>
        </div>

        {/* Alternative Selector Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400 whitespace-nowrap">Compare with:</label>
          <select
            value={selectedMutantB}
            onChange={(e) => setSelectedMutantB(e.target.value)}
            disabled={loading}
            className="bg-slate-850 border border-slate-700 text-slate-200 text-xs font-mono rounded-lg px-3 py-1.5 focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            {alternatives.map((aa) => (
              <option key={aa.code} value={aa.code}>
                {originalResidue}{position}{aa.code} ({aa.name})
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="h-48 bg-slate-850/50 rounded-xl animate-pulse flex items-center justify-center text-xs text-slate-400">
          Calculating comparative physicochemical metrics...
        </div>
      ) : mutA && mutB ? (
        <div>
          {/* Side-by-Side Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Mutation A Card */}
            <div className="bg-slate-850/70 border border-cyan-900/50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 font-bold border border-cyan-800">
                  Active Mutation
                </span>
                <span className="text-sm font-mono font-bold text-slate-200">
                  {mutA.notation}
                </span>
              </div>
              <h4 className="text-base font-semibold text-cyan-400 mb-3">
                {originalResidue} → {mutA.mutant.code} ({mutA.mutant.name})
              </h4>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Molecular Weight</span>
                  <span className="font-mono text-slate-200">{mutA.properties.molecular_weight?.toFixed(2)} Da</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Net Charge</span>
                  <span className="font-mono text-slate-200">{mutA.properties.charge}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Polarity</span>
                  <span className="font-mono text-slate-200 capitalize">{mutA.properties.polarity}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Hydrophobicity</span>
                  <span className="font-mono text-slate-200">{mutA.properties.hydrophobicity}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Side-chain Class</span>
                  <span className="font-mono text-slate-200 capitalize">{mutA.properties.side_chain_class}</span>
                </div>
              </div>
            </div>

            {/* Mutation B Card */}
            <div className="bg-slate-850/70 border border-indigo-900/50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 font-bold border border-indigo-800">
                  Alternative Variant
                </span>
                <span className="text-sm font-mono font-bold text-slate-200">
                  {mutB.notation}
                </span>
              </div>
              <h4 className="text-base font-semibold text-indigo-400 mb-3">
                {originalResidue} → {mutB.mutant.code} ({mutB.mutant.name})
              </h4>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Molecular Weight</span>
                  <span className="font-mono text-slate-200">{mutB.properties.molecular_weight?.toFixed(2)} Da</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Net Charge</span>
                  <span className="font-mono text-slate-200">{mutB.properties.charge}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Polarity</span>
                  <span className="font-mono text-slate-200 capitalize">{mutB.properties.polarity}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Hydrophobicity</span>
                  <span className="font-mono text-slate-200">{mutB.properties.hydrophobicity}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Side-chain Class</span>
                  <span className="font-mono text-slate-200 capitalize">{mutB.properties.side_chain_class}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Shared Position Context Header */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span className="font-semibold text-slate-300">Shared Position Evidence:</span>
            <div className="flex items-center gap-4 font-mono text-[11px]">
              <span>Conservation: <strong className="text-purple-300 capitalize">{comparisonResult.shared_conservation?.classification || 'Available'}</strong></span>
              <span>•</span>
              <span>Environment: <strong className="text-teal-300 capitalize">{comparisonResult.shared_structure?.environment || 'Available'}</strong></span>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-xs text-slate-400">
          Select an alternative substitution above to run comparative analysis.
        </div>
      )}
    </div>
  );
};
