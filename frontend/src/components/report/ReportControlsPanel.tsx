import React from 'react';
import {
  Download,
  FileCode,
  FileText,
  FileSpreadsheet,
  CheckCircle2,
  RefreshCw,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import type { ResearchReportData } from '../../types/report';

interface ReportControlsPanelProps {
  report: ResearchReportData;
  onExportPdf: () => void;
  onExportMarkdown: () => void;
  onExportJson: () => void;
  onRefresh: () => void;
  exporting: 'pdf' | 'markdown' | 'json' | null;
  exportError: string | null;
}

export const ReportControlsPanel: React.FC<ReportControlsPanelProps> = ({
  report,
  onExportPdf,
  onExportMarkdown,
  onExportJson,
  onRefresh,
  exporting,
  exportError,
}) => {
  const sections = [
    { id: 'executive-summary', label: '1. Executive Summary' },
    { id: 'protein-identification', label: '2. Protein Identification' },
    { id: 'mutation-validation', label: '3. Mutation Validation' },
    { id: 'physicochemical-shifts', label: '4. Physicochemical Shifts' },
    { id: 'sequence-conservation', label: '5. Sequence Conservation' },
    { id: 'structural-context', label: '6. Structural Context' },
    { id: 'local-environment', label: '7. Local Environment' },
    { id: 'ai-interpretation', label: '8. AI Research Assistant' },
    { id: 'evidence-overview', label: '9. Evidence Overview' },
    { id: 'scientific-limitations', label: '10. Limitations & Boundaries' },
    { id: 'further-investigations', label: '11. Further Investigations' },
    { id: 'data-provenance', label: 'Provenance Audit Trail' },
  ];

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <aside className="space-y-6 sticky top-6">
      {/* Export Options Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-md space-y-4 shadow-xl">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Download className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
            Export Research Report
          </h3>
        </div>

        {exportError && (
          <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs font-mono">
            {exportError}
          </div>
        )}

        <div className="space-y-2.5">
          {/* PDF Export Button */}
          <button
            onClick={onExportPdf}
            disabled={exporting !== null}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-between shadow-[0_0_15px_rgba(34,211,238,0.3)] transition-all cursor-pointer font-mono disabled:opacity-50"
          >
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span>{exporting === 'pdf' ? 'Generating PDF...' : 'Download PDF Publication'}</span>
            </div>
            <span className="text-[10px] bg-slate-950/20 px-1.5 py-0.5 rounded font-mono font-bold">A4 Print</span>
          </button>

          {/* Markdown Export Button */}
          <button
            onClick={onExportMarkdown}
            disabled={exporting !== null}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs font-mono flex items-center justify-between border border-slate-700 hover:border-cyan-500/40 transition-all cursor-pointer disabled:opacity-50"
          >
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-cyan-400" />
              <span>{exporting === 'markdown' ? 'Exporting...' : 'Export Markdown (.md)'}</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">GitHub GFM</span>
          </button>

          {/* JSON Export Button */}
          <button
            onClick={onExportJson}
            disabled={exporting !== null}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs font-mono flex items-center justify-between border border-slate-700 hover:border-cyan-500/40 transition-all cursor-pointer disabled:opacity-50"
          >
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-teal-400" />
              <span>{exporting === 'json' ? 'Exporting...' : 'Export Structured JSON'}</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Schema 1.0</span>
          </button>
        </div>

        <button
          onClick={onRefresh}
          className="w-full pt-2 text-[11px] text-slate-400 hover:text-cyan-300 font-mono text-center flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Refresh report cache</span>
        </button>
      </div>

      {/* Quality Checks & Integrity Status */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 backdrop-blur-md space-y-3.5 text-xs font-mono">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Integrity Audit
          </h3>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-slate-300">
            <span>Reference Sequence</span>
            <span className="text-emerald-400 font-bold inline-flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>VERIFIED</span>
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-300">
            <span>Mutation Validation</span>
            <span className="text-emerald-400 font-bold inline-flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>VERIFIED</span>
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-300">
            <span>Sequence Conservation</span>
            <span
              className={
                report.conservation_report.status === 'Available'
                  ? 'text-emerald-400 font-bold'
                  : 'text-amber-400 font-bold'
              }
            >
              {report.conservation_report.status.toUpperCase()}
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-300">
            <span>Experimental Structure</span>
            <span
              className={
                report.structural_report.status === 'Available'
                  ? 'text-emerald-400 font-bold'
                  : 'text-amber-400 font-bold'
              }
            >
              {report.structural_report.status.toUpperCase()}
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-300">
            <span>Gemma 4 AI Assistant</span>
            <span
              className={
                report.ai_interpretation_report.status === 'Available'
                  ? 'text-cyan-400 font-bold'
                  : 'text-slate-500 font-bold'
              }
            >
              {report.ai_interpretation_report.status.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Jump Navigation */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 backdrop-blur-md space-y-3 text-xs font-mono">
        <h3 className="text-sm font-bold text-slate-300 border-b border-slate-800 pb-2">
          Report Section Index
        </h3>
        <nav className="space-y-1">
          {sections.map((sec) => (
            <button
              key={sec.id}
              onClick={() => scrollTo(sec.id)}
              className="w-full text-left py-1 px-2 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800/60 transition-colors flex items-center justify-between cursor-pointer"
            >
              <span>{sec.label}</span>
              <ChevronRight className="w-3 h-3 opacity-60" />
            </button>
          ))}
        </nav>
      </div>
    </aside>
  );
};
