import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import { ProteinSearch } from '../components/protein/ProteinSearch';
import { ProteinInfoCard } from '../components/protein/ProteinInfoCard';
import { SequenceViewer } from '../components/protein/SequenceViewer';
import { MutationSelector } from '../components/mutation/MutationSelector';
import { PropertyComparison } from '../components/mutation/PropertyComparison';
import { MutationPlayground } from '../components/mutation/MutationPlayground';
import { BaselinePredictorCard } from '../components/mutation/BaselinePredictorCard';
import { useProtein } from '../hooks/useProtein';
import { useMutation } from '../hooks/useMutation';
import { Beaker, Dna } from 'lucide-react';

export const MutationLab: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { protein, loading: proteinLoading, error: proteinError, loadProtein } = useProtein();
  const {
    selectedPosition,
    originalResidue,
    mutantResidue,
    setMutantResidue,
    analysis,
    playground,
    loading: mutationLoading,
    error: mutationError,
    selectPosition,
    runAnalysis,
    selectPlaygroundSub
  } = useMutation();

  useEffect(() => {
    const accParam = searchParams.get('accession') || 'P04637';
    loadProtein(accParam).then((protData) => {
      if (protData && protData.sequence.length >= 98) {
        selectPosition(98, protData.sequence);
        runAnalysis(protData.accession, 98, 'V');
      }
    });
  }, [searchParams, loadProtein, selectPosition, runAnalysis]);

  const handleSearchProtein = async (accession: string) => {
    const protData = await loadProtein(accession);
    if (protData) {
      const initialPos = Math.min(98, protData.sequence.length);
      selectPosition(initialPos, protData.sequence);
      const defaultMutant = protData.sequence[initialPos - 1].toUpperCase() === 'V' ? 'A' : 'V';
      runAnalysis(protData.accession, initialPos, defaultMutant);
    }
  };

  const handlePositionSelect = (pos: number) => {
    if (protein) {
      const valid = selectPosition(pos, protein.sequence);
      if (valid) {
        const orig = protein.sequence[pos - 1].toUpperCase();
        const defaultMutant = orig === 'V' ? 'A' : 'V';
        runAnalysis(protein.accession, pos, defaultMutant);
      }
    }
  };

  const handleAnalyzeClick = () => {
    if (protein && selectedPosition && mutantResidue) {
      runAnalysis(protein.accession, selectedPosition, mutantResidue);
      navigate(`/analysis/${protein.accession}-${selectedPosition}-${mutantResidue}`);
    }
  };

  const handleLoadSumo1 = async () => {
    const protData = await loadProtein('P63165');
    if (protData) {
      selectPosition(2, protData.sequence);
      setMutantResidue('Y');
      runAnalysis(protData.accession, 2, 'Y');
    }
  };

  return (
    <div className="min-h-screen bg-[#070a12] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      <Navbar />

      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-10">
        
        {/* Page Title & Subtitle */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-medium backdrop-blur-md">
            <Beaker className="w-3.5 h-3.5 text-cyan-400" />
            <span>Core Scientific Workspace</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            MUTATION <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-violet-400 bg-clip-text text-transparent">LAB</span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Explore amino-acid substitutions, sequence positions, and deterministic physicochemical property shifts.
          </p>
        </div>

        {/* Step 1: Protein Search */}
        <ProteinSearch
          onSearch={handleSearchProtein}
          loading={proteinLoading}
          error={proteinError}
        />

        {/* Progressive Disclosure: Content appears once protein is loaded */}
        {protein ? (
          <div className="space-y-10 animate-fadeIn">
            {/* Step 2: Protein Information Card */}
            <ProteinInfoCard protein={protein} />

            {/* Sequence Viewer & Mutation Selector Split / Stack Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Sequence Viewer (Left 7 Cols) */}
              <div className="lg:col-span-7">
                <SequenceViewer
                  sequence={protein.sequence}
                  selectedPosition={selectedPosition}
                  onSelectPosition={handlePositionSelect}
                />
              </div>

              {/* Mutation Selector (Right 5 Cols) */}
              <div className="lg:col-span-5">
                <MutationSelector
                  sequenceLength={protein.length}
                  selectedPosition={selectedPosition}
                  originalResidue={originalResidue}
                  mutantResidue={mutantResidue}
                  onPositionChange={(pos) => handlePositionSelect(pos)}
                  onMutantChange={(mut) => {
                    setMutantResidue(mut);
                    if (protein && selectedPosition) {
                      runAnalysis(protein.accession, selectedPosition, mut);
                    }
                  }}
                  onAnalyze={handleAnalyzeClick}
                  loading={mutationLoading}
                  error={mutationError}
                />
              </div>

            </div>

            {/* Step 4: Validated Mutation Preview / Property Comparison */}
            {analysis && (
              <div className="animate-fadeIn">
                <PropertyComparison
                  analysis={analysis}
                  accession={protein.accession}
                  position={selectedPosition || undefined}
                  onAnalyze={handleAnalyzeClick}
                />
              </div>
            )}

            {/* Step 4B: Verified DMS Regression Baseline Predictor */}
            <div className="animate-fadeIn">
              <BaselinePredictorCard
                protein={protein}
                selectedPosition={selectedPosition}
                originalResidue={originalResidue}
                mutantResidue={mutantResidue}
                onLoadSumo1={handleLoadSumo1}
              />
            </div>

            {/* Step 5: Mutation Playground (All 19 Substitutions) */}
            {playground && (
              <div className="animate-fadeIn">
                <MutationPlayground
                  playground={playground}
                  activeMutantCode={mutantResidue}
                  onSelectSub={(mutCode, origCode) => selectPlaygroundSub(mutCode, origCode)}
                />
              </div>
            )}

          </div>
        ) : (
          /* Empty Search State */
          <div className="glass-card rounded-3xl p-12 text-center max-w-xl mx-auto space-y-4 border border-slate-800">
            <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center text-cyan-400 mx-auto">
              <Dna className="w-8 h-8 animate-pulse" />
            </div>
            <h3 className="text-xl font-bold text-white">Find a Protein to Begin</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Enter a UniProt accession (e.g. <strong>P04637</strong> for p53, <strong>P01308</strong> for Insulin) or gene symbol above to start exploring amino-acid substitutions.
            </p>
          </div>
        )}

        <DisclaimerBanner />
      </main>

      <Footer />
    </div>
  );
};
