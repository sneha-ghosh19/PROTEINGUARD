import React from 'react';
import type { AIReportData } from '../../types/ai';

interface ResearchReportModalProps {
  report: AIReportData | null;
  loading: boolean;
  onClose: () => void;
}

export const ResearchReportModal: React.FC<ResearchReportModalProps> = ({
  report,
  loading,
  onClose,
}) => {
  if (!report && !loading) return null;

  const handleDownloadMarkdown = () => {
    if (!report) return;
    const content = `# ${report.title}
Date: ${report.analysis_date}
Protein Accession: ${report.protein_accession}
Mutation: ${report.mutation_notation}

## 1. Overview
${report.overview}

## 2. Physicochemical Changes
${report.physicochemical_summary}

## 3. Evolutionary Conservation
${report.conservation_summary}

## 4. Structural Context
${report.structural_summary}

## 5. AI Interpretation
${report.ai_interpretation || 'N/A'}

## 6. Limitations & Boundaries
${report.limitations.map((l) => `- ${l}`).join('\n')}

---
Disclaimer: ProteinGuard provides computational and educational analysis. It does not provide clinical diagnosis or medical recommendations.
`;
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ProteinGuard_${report.mutation_notation}_Report.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-cyan-500/40 rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block">
              Grounded AI Synthesis Report
            </span>
            <h3 className="text-xl font-bold text-white font-mono">
              {report?.title || 'Generating Research Report...'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center font-bold text-sm cursor-pointer"
          >
            ✕
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-sm text-slate-400 space-y-3">
            <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p>Synthesizing structured computational evidence into formal report...</p>
          </div>
        ) : report ? (
          <div className="space-y-4 text-xs font-sans leading-relaxed text-slate-300">
            {/* Metadata Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[11px]">
              <div>
                <span className="text-slate-500 block">Accession</span>
                <span className="text-cyan-300 font-bold">{report.protein_accession}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Mutation</span>
                <span className="text-white font-bold">{report.mutation_notation}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Date</span>
                <span className="text-slate-300">{report.analysis_date}</span>
              </div>
            </div>

            {/* Sections */}
            <div>
              <h4 className="font-bold text-slate-100 font-mono uppercase text-[11px] mb-1 text-cyan-400">
                1. Mutation Overview
              </h4>
              <p className="bg-slate-850/60 p-3 rounded-lg border border-slate-800">{report.overview}</p>
            </div>

            <div>
              <h4 className="font-bold text-slate-100 font-mono uppercase text-[11px] mb-1 text-cyan-400">
                2. Physicochemical Shifts
              </h4>
              <p className="bg-slate-850/60 p-3 rounded-lg border border-slate-800">{report.physicochemical_summary}</p>
            </div>

            <div>
              <h4 className="font-bold text-slate-100 font-mono uppercase text-[11px] mb-1 text-purple-400">
                3. Evolutionary Conservation
              </h4>
              <p className="bg-slate-850/60 p-3 rounded-lg border border-slate-800">{report.conservation_summary}</p>
            </div>

            <div>
              <h4 className="font-bold text-slate-100 font-mono uppercase text-[11px] mb-1 text-teal-400">
                4. Structural Micro-Environment
              </h4>
              <p className="bg-slate-850/60 p-3 rounded-lg border border-slate-800">{report.structural_summary}</p>
            </div>

            {report.ai_interpretation && (
              <div>
                <h4 className="font-bold text-slate-100 font-mono uppercase text-[11px] mb-1 text-amber-400">
                  5. Evidence Interpretation
                </h4>
                <p className="bg-slate-850/60 p-3 rounded-lg border border-slate-800">{report.ai_interpretation}</p>
              </div>
            )}

            <div>
              <h4 className="font-bold text-slate-100 font-mono uppercase text-[11px] mb-1 text-amber-400">
                6. Methodological Limitations
              </h4>
              <ul className="bg-slate-850/60 p-3 rounded-lg border border-slate-800 space-y-1 list-disc list-inside text-[11px] text-slate-400">
                {report.limitations.map((lim, idx) => (
                  <li key={idx}>{lim}</li>
                ))}
              </ul>
            </div>

            {/* Footer & Actions */}
            <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-[10px] text-slate-500 italic">
                Non-clinical computational output for educational and hypothesis generation use.
              </span>
              <button
                onClick={handleDownloadMarkdown}
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg hover:from-cyan-400 hover:to-teal-400 transition-all cursor-pointer whitespace-nowrap"
              >
                Download Markdown Report ↗
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
