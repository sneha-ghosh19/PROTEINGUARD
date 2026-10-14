import { useState, useEffect, useCallback } from 'react';
import type { ResearchReportData } from '../types/report';
import {
  fetchReport,
  generateReport,
  downloadReportPdf,
  downloadReportMarkdown,
  downloadReportJson,
  triggerFileDownload,
} from '../services/reportApi';

export interface UseMutationReportReturn {
  report: ResearchReportData | null;
  loading: boolean;
  error: string | null;
  isNotFound: boolean;
  exporting: 'pdf' | 'markdown' | 'json' | null;
  exportError: string | null;
  refreshReport: (includeAi?: boolean) => Promise<void>;
  exportPdf: () => Promise<void>;
  exportMarkdown: () => Promise<void>;
  exportJson: () => Promise<void>;
}

export function useMutationReport(analysisId: string | undefined): UseMutationReportReturn {
  const [report, setReport] = useState<ResearchReportData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isNotFound, setIsNotFound] = useState<boolean>(false);
  const [exporting, setExporting] = useState<'pdf' | 'markdown' | 'json' | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);

  const loadReport = useCallback(async () => {
    if (!analysisId) {
      setLoading(false);
      setError('No analysis identifier provided.');
      setIsNotFound(true);
      return;
    }

    setLoading(true);
    setError(null);
    setIsNotFound(false);

    try {
      const data = await fetchReport(analysisId);
      setReport(data);
    } catch (err: any) {
      const msg = err.message || 'Failed to retrieve analysis report.';
      setError(msg);
      if (msg.toLowerCase().includes('not found') || msg.toLowerCase().includes('404')) {
        setIsNotFound(true);
      }
    } finally {
      setLoading(false);
    }
  }, [analysisId]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  const refreshReport = async (includeAi = true) => {
    if (!analysisId) return;
    setLoading(true);
    setError(null);
    try {
      const refreshed = await generateReport(analysisId, includeAi);
      setReport(refreshed);
    } catch (err: any) {
      setError(err.message || 'Failed to regenerate report.');
    } finally {
      setLoading(false);
    }
  };

  const exportPdf = async () => {
    if (!analysisId || !report) return;
    setExporting('pdf');
    setExportError(null);
    try {
      const blob = await downloadReportPdf(analysisId);
      const filename = `proteinguard_${report.mutation_validation.notation}_report.pdf`;
      triggerFileDownload(blob, filename, 'application/pdf');
    } catch (err: any) {
      setExportError(err.message || 'PDF export failed. You may retry or export Markdown/JSON.');
    } finally {
      setExporting(null);
    }
  };

  const exportMarkdown = async () => {
    if (!analysisId || !report) return;
    setExporting('markdown');
    setExportError(null);
    try {
      const text = await downloadReportMarkdown(analysisId);
      const filename = `proteinguard_${report.mutation_validation.notation}_report.md`;
      triggerFileDownload(text, filename, 'text/markdown');
    } catch (err: any) {
      setExportError(err.message || 'Markdown export failed.');
    } finally {
      setExporting(null);
    }
  };

  const exportJson = async () => {
    if (!analysisId || !report) return;
    setExporting('json');
    setExportError(null);
    try {
      const text = await downloadReportJson(analysisId);
      const filename = `proteinguard_${report.mutation_validation.notation}_report.json`;
      triggerFileDownload(text, filename, 'application/json');
    } catch (err: any) {
      setExportError(err.message || 'JSON export failed.');
    } finally {
      setExporting(null);
    }
  };

  return {
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
  };
}
