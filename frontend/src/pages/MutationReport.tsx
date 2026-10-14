import React from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useMutationReport } from '../hooks/useMutationReport';
import { ReportHeader } from '../components/report/ReportHeader';
import { ReportExecutiveSummary } from '../components/report/ReportExecutiveSummary';
import { ProteinIdentificationSection } from '../components/report/ProteinIdentificationSection';
import { MutationValidationSection } from '../components/report/MutationValidationSection';
import { PhysicochemicalReportSection } from '../components/report/PhysicochemicalReportSection';
import { ConservationReportSection } from '../components/report/ConservationReportSection';
import { StructuralContextReportSection } from '../components/report/StructuralContextReportSection';
import { LocalEnvironmentReportSection } from '../components/report/LocalEnvironmentReportSection';
import { AIInterpretationReportSection } from '../components/report/AIInterpretationReportSection';
import { EvidenceOverviewSection } from '../components/report/EvidenceOverviewSection';
import { LimitationsSection } from '../components/report/LimitationsSection';
import { InvestigationSuggestionsSection } from '../components/report/InvestigationSuggestionsSection';
import { ProvenanceSection } from '../components/report/ProvenanceSection';
import { ReportControlsPanel } from '../components/report/ReportControlsPanel';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { AlertOctagon, ArrowLeft, Loader2 } from 'lucide-react';

export const MutationReport: React.FC = () => {
  const { analysisId } = useParams<{ analysisId?: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Support route param, query param, or formatted param
  const idFromQuery = searchParams.get('id') || searchParams.get('analysis_id');
  const targetId = analysisId || idFromQuery || undefined;

  const {
    report,
    loading,
    error,
    isNotFound,
    exporting,
    exportError,
    refreshReport,
    exportPdf,
    exportMarkdown,
    exportJson,
  } = useMutationReport(targetId);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950 print:bg-white print:text-slate-900">
      {/* Background glow highlights (hidden on print) */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-950/20 via-slate-950 to-slate-950 print:hidden"></div>

      <div className="print:hidden">
        <Navbar />
      </div>

      <main className="relative z-10 flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Loading Skeleton */}
        {loading && (
          <div className="max-w-3xl mx-auto my-16 space-y-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-cyan-950/80 border border-cyan-800/60 flex items-center justify-center text-cyan-400 mx-auto">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Synthesizing Research Report...
              </h2>
              <p className="text-sm text-slate-400 font-mono">
                Compiling multi-pillar computational evidence, Shannon entropy, and 3D contact matrix for {targetId || 'active analysis'}.
              </p>
            </div>
            <div className="w-48 h-1.5 bg-slate-800 rounded-full mx-auto overflow-hidden">
              <div className="w-full h-full bg-cyan-400 animate-[pulse_1.5s_infinite]"></div>
            </div>
          </div>
        )}

        {/* Not Found / Error View */}
        {!loading && (error || !report) && (
          <div className="bg-slate-900/80 border border-rose-900/60 rounded-3xl p-8 sm:p-12 text-center max-w-2xl mx-auto my-12 space-y-6 shadow-2xl backdrop-blur-md">
            <div className="w-16 h-16 rounded-2xl bg-rose-950/80 border border-rose-800/60 flex items-center justify-center text-rose-400 mx-auto">
              <AlertOctagon className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white tracking-tight">
                {isNotFound ? 'Analysis Not Found' : 'Report Retrieval Failed'}
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed font-sans">
                {error || `Analysis record '${targetId}' could not be located. Please verify the analysis ID or return to Mutation Lab to initiate a verified analysis.`}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => navigate('/mutation-lab')}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-bold text-xs uppercase tracking-wider inline-flex items-center gap-2 shadow-[0_0_20px_rgba(34,211,238,0.4)] transition-all cursor-pointer font-mono"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Mutation Lab</span>
              </button>

              <button
                onClick={() => refreshReport(true)}
                className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs font-mono transition-all border border-slate-700 cursor-pointer"
              >
                Retry Loading
              </button>
            </div>
          </div>
        )}

        {/* Successful Report Preview */}
        {!loading && report && (
          <div className="space-y-6">
            <ReportHeader
              report={report}
              onRefresh={() => refreshReport(true)}
              onExportPdf={exportPdf}
              exporting={exporting}
            />

            {/* Responsive 2-Column Grid on Desktop */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Complete Report Document (8 Cols) */}
              <div className="lg:col-span-8 space-y-6 print:w-full">
                <ReportExecutiveSummary summary={report.executive_summary} />
                <ProteinIdentificationSection protein={report.protein_identification} />
                <MutationValidationSection mutation={report.mutation_validation} />
                <PhysicochemicalReportSection physico={report.physicochemical_report} />
                <ConservationReportSection conservation={report.conservation_report} />
                <StructuralContextReportSection structural={report.structural_report} />
                <LocalEnvironmentReportSection localEnv={report.local_environment_report} />
                <AIInterpretationReportSection aiReport={report.ai_interpretation_report} />
                <EvidenceOverviewSection overview={report.evidence_overview} />
                <LimitationsSection limitations={report.limitations} />
                <InvestigationSuggestionsSection suggestions={report.suggested_investigations} />
                <ProvenanceSection provenance={report.provenance} />

                {/* Mandatory Scientific Disclaimer Banner */}
                <div className="p-4 bg-red-950/20 border border-red-900/40 rounded-xl text-xs text-red-200/90 leading-relaxed font-sans">
                  <strong className="text-red-300 block mb-1">SCIENTIFIC DISCLAIMER:</strong>
                  {report.scientific_disclaimer}
                </div>
              </div>

              {/* Right Column: Controls, Quality Audit & Quick Actions (4 Cols) */}
              <div className="lg:col-span-4 print:hidden">
                <ReportControlsPanel
                  report={report}
                  onExportPdf={exportPdf}
                  onExportMarkdown={exportMarkdown}
                  onExportJson={exportJson}
                  onRefresh={() => refreshReport(true)}
                  exporting={exporting}
                  exportError={exportError}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  );
};
