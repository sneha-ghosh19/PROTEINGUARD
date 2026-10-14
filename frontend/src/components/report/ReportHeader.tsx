import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FileText,
  ArrowLeft,
  Download,
  Box,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import type { ResearchReportData } from '../../types/report';

interface ReportHeaderProps {
  report: ResearchReportData;
  onRefresh: () => void;
  onExportPdf: () => void;
  exporting: 'pdf' | 'markdown' | 'json' | null;
}

export const ReportHeader: React.FC<ReportHeaderProps> = ({
  report,
  onRefresh,
  onExportPdf,
  exporting,
}) => {
  const navigate = useNavigate();

  const isComplete = report.status === 'Complete';
  const isPartial = report.status === 'Partially Available';

  return (
    <div className="space-y-4 mb-6">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs font-mono text-slate-400">
        <Link to="/" className="hover:text-cyan-400 transition-colors">Home</Link>
        <span>/</span>
        <Link to="/mutation-lab" className="hover:text-cyan-400 transition-colors">Mutation Lab</Link>
        <span>/</span>
        <button
          onClick={() => navigate(`/analysis/${report.analysis_id}`)}
          className="hover:text-cyan-400 transition-colors cursor-pointer"
        >
          Analysis Dashboard
        </button>
        <span>/</span>
        <button
          onClick={() => navigate(`/structure?protein=${report.protein_identification.protein_accession}&position=${report.mutation_validation.position}&mutant=${report.mutation_validation.mutant_residue}`)}
          className="hover:text-cyan-400 transition-colors cursor-pointer"
        >
          3D Explorer
        </button>
        <span>/</span>
        <span className="text-cyan-300 font-semibold">Research Report</span>
      </nav>

      {/* Main Header Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-md flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800/60 text-cyan-300 text-xs font-mono font-bold">
              <FileText className="w-3.5 h-3.5" />
              <span>{report.report_id}</span>
            </div>

            {/* Dynamic Status Label */}
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold border ${
                isComplete
                  ? 'bg-emerald-950/80 border-emerald-800/60 text-emerald-300'
                  : isPartial
                  ? 'bg-amber-950/80 border-amber-800/60 text-amber-300'
                  : 'bg-rose-950/80 border-rose-800/60 text-rose-300'
              }`}
            >
              {isComplete ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5" />
              )}
              <span>{report.status.toUpperCase()}</span>
            </div>

            <span className="text-xs text-slate-400 font-mono">
              Generated: {new Date(report.created_at).toLocaleDateString()}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <span>Mutation Research Report:</span>
            <span className="text-cyan-400 font-mono underline decoration-cyan-500/50">
              {report.mutation_validation.notation}
            </span>
          </h1>

          <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
            An evidence-grounded computational assessment of amino-acid substitution in{' '}
            <strong className="text-white">{report.protein_identification.protein_name}</strong> ({report.protein_identification.protein_accession}).
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={() => navigate(`/analysis/${report.analysis_id}`)}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-semibold transition-all inline-flex items-center gap-2 border border-slate-700 cursor-pointer shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 text-cyan-400" />
            <span>Analysis Dashboard</span>
          </button>

          <button
            onClick={() => navigate(`/structure?protein=${report.protein_identification.protein_accession}&position=${report.mutation_validation.position}&mutant=${report.mutation_validation.mutant_residue}`)}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-semibold transition-all inline-flex items-center gap-2 border border-slate-700 cursor-pointer shadow-sm"
          >
            <Box className="w-4 h-4 text-teal-400" />
            <span>3D Explorer</span>
          </button>

          <button
            onClick={onRefresh}
            title="Refresh canonical report from backend"
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all border border-slate-700 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={onExportPdf}
            disabled={exporting === 'pdf'}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-bold text-xs uppercase tracking-wider inline-flex items-center gap-2 shadow-[0_0_20px_rgba(34,211,238,0.35)] transition-all cursor-pointer font-mono disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{exporting === 'pdf' ? 'Generating PDF...' : 'Download PDF'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
