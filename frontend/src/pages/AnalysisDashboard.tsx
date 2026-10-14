import React from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAnalysis } from '../hooks/useAnalysis';
import { AnalysisHeader } from '../components/analysis/AnalysisHeader';
import { DataIntegritySection } from '../components/analysis/DataIntegritySection';
import { AnalysisStatus } from '../components/analysis/AnalysisStatus';
import { PhysicochemicalCard } from '../components/mutation/PhysicochemicalCard';
import { ConservationCard } from '../components/analysis/ConservationCard';
import { StructureContextCard } from '../components/analysis/StructureContextCard';
import { ResidueEnvironment } from '../components/analysis/ResidueEnvironment';
import { EvidenceSummary } from '../components/analysis/EvidenceSummary';
import { AnalysisLimitations } from '../components/analysis/AnalysisLimitations';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { AlertOctagon, ArrowLeft } from 'lucide-react';

export const AnalysisDashboard: React.FC = () => {
  const { analysisId } = useParams<{ analysisId?: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Extract from location state if coming directly from Screen 2 (Mutation Lab)
  const stateData = location.state as {
    accession?: string;
    position?: number;
    mutant?: string;
  } | null;

  // Query or route params (NO hardcoded biological default fallbacks!)
  const idFromQuery = searchParams.get('id') || searchParams.get('analysis_id');
  const targetId = analysisId || idFromQuery;

  const accessionParam = stateData?.accession || searchParams.get('protein') || searchParams.get('accession') || undefined;
  const positionParam = stateData?.position || (searchParams.get('position') ? Number(searchParams.get('position')) : undefined);
  const mutantParam = stateData?.mutant || searchParams.get('mutant') || undefined;

  const hasValidInputs = Boolean(targetId || (accessionParam && positionParam && mutantParam));

  const {
    data,
    basic,
    conservation,
    structure,
    loading,
    basicLoading,
    conservationLoading,
    structureLoading,
    error,
  } = useAnalysis(
    hasValidInputs
      ? {
          analysisId: targetId || undefined,
          accession: accessionParam,
          position: positionParam,
          mutant: mutantParam,
        }
      : undefined
  );

  const effectiveAcc = data?.protein?.accession || accessionParam || '';
  const effectivePos = data?.mutation?.position || positionParam || 0;
  const effectiveMutant = data?.mutation?.mutant || mutantParam || '';

  const handleExplore3D = () => {
    if (effectiveAcc && effectivePos && effectiveMutant) {
      navigate(
        `/structure?protein=${effectiveAcc}&pdb=${structure?.pdb_id || ''}&position=${effectivePos}&mutant=${effectiveMutant}`
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Background radial highlights */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-950/20 via-slate-950 to-slate-950"></div>

      {/* Main Content Area */}
      <main className="relative z-10 flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Navigation Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-slate-400 mb-6 font-mono">
          <button
            onClick={() => navigate('/')}
            className="hover:text-cyan-400 transition-colors"
          >
            Home
          </button>
          <span>/</span>
          <button
            onClick={() => navigate('/mutation-lab')}
            className="hover:text-cyan-400 transition-colors"
          >
            Mutation Lab
          </button>
          <span>/</span>
          <span className="text-slate-200 font-medium">Analysis Dashboard</span>
        </nav>

        {/* Invalid input or error view (NO hardcoded fake cards underneath) */}
        {(!hasValidInputs || error) && !loading ? (
          <div className="bg-slate-900/80 border border-rose-900/60 rounded-3xl p-8 sm:p-12 text-center max-w-2xl mx-auto my-12 space-y-6 shadow-2xl backdrop-blur-md">
            <div className="w-16 h-16 rounded-2xl bg-rose-950/80 border border-rose-800/60 flex items-center justify-center text-rose-400 mx-auto">
              <AlertOctagon className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white tracking-tight">
                {error ? 'Analysis Failed' : 'Analysis Not Found'}
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed font-sans">
                {error || 'No analysis ID or protein mutation was selected. Please return to the Mutation Lab to search for a verified protein and validate an amino-acid mutation.'}
              </p>
            </div>
            <div>
              <button
                onClick={() => navigate('/mutation-lab')}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-bold text-xs uppercase tracking-wider inline-flex items-center gap-2 shadow-[0_0_20px_rgba(34,211,238,0.4)] transition-all cursor-pointer font-mono"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Mutation Lab</span>
              </button>
            </div>
          </div>
        ) : (
          <ErrorBoundary fallbackTitle="Analysis Dashboard Render Exception">
            <div className="space-y-6">
              {/* Top Header Card */}
              <AnalysisHeader
                accession={effectiveAcc}
                position={effectivePos}
                mutant={effectiveMutant}
                basic={basic}
                loading={basicLoading}
              />

              {/* Data Integrity & Provenance Section */}
              <DataIntegritySection
                integrity={data?.data_integrity}
                provenance={data?.provenance}
                loading={loading}
              />

              {/* Async Analysis Status Progress Bar */}
              <AnalysisStatus
                basicLoading={basicLoading}
                conservationLoading={conservationLoading}
                structureLoading={structureLoading}
                basicComplete={!!basic}
                conservationComplete={!!conservation && conservation.status === 'success'}
                structureComplete={!!structure && (structure.status === 'success' || structure.status === 'mapped')}
              />

              {/* 2-Column Main Evidence Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 my-6">
                {/* Left Column: Physicochemical & Conservation */}
                <div className="space-y-6">
                  <ErrorBoundary fallbackTitle="Physicochemical Analysis Error">
                    <PhysicochemicalCard analysis={basic} loading={basicLoading} />
                  </ErrorBoundary>
                  <ErrorBoundary fallbackTitle="Sequence Conservation Error">
                    <ConservationCard conservation={conservation} loading={conservationLoading} />
                  </ErrorBoundary>
                </div>

                {/* Right Column: Structural Context & Spatial Environment Map */}
                <div className="space-y-6">
                  <ErrorBoundary fallbackTitle="Structural Context Error">
                    <StructureContextCard
                      structure={structure}
                      loading={structureLoading}
                      onExplore3D={handleExplore3D}
                    />
                  </ErrorBoundary>
                  <ErrorBoundary fallbackTitle="Residue Environment Map Error">
                    <ResidueEnvironment
                      contacts={structure?.nearby_residues || []}
                      targetResidue={basic?.original?.code || data?.mutation?.original || '?'}
                      targetPosition={effectivePos}
                      loading={structureLoading}
                    />
                  </ErrorBoundary>
                </div>
              </div>

              {/* Full Width: Independent Evidence Summary */}
              <ErrorBoundary fallbackTitle="Evidence Summary Error">
                <EvidenceSummary
                  basic={basic}
                  conservation={conservation}
                  structure={structure}
                  loading={loading}
                />
              </ErrorBoundary>

              {/* Mandatory Interpretation Boundaries & Scientific Limitations */}
              <AnalysisLimitations />
            </div>
          </ErrorBoundary>
        )}
      </main>
    </div>
  );
};
