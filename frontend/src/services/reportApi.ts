import type { ResearchReportData } from '../types/report';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export async function fetchReport(analysisId: string): Promise<ResearchReportData> {
  const cleanId = analysisId.trim();
  const response = await fetch(`${API_BASE_URL}/reports/${encodeURIComponent(cleanId)}`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Report for analysis '${analysisId}' could not be retrieved.`);
  }

  return await response.json();
}

export async function generateReport(
  analysisId: string,
  includeAi = true
): Promise<ResearchReportData> {
  const cleanId = analysisId.trim();
  const response = await fetch(`${API_BASE_URL}/reports/${encodeURIComponent(cleanId)}/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ include_ai_interpretation: includeAi }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Failed to generate report for '${analysisId}'.`);
  }

  return await response.json();
}

export async function downloadReportPdf(analysisId: string): Promise<Blob> {
  const cleanId = analysisId.trim();
  const response = await fetch(`${API_BASE_URL}/reports/${encodeURIComponent(cleanId)}/export/pdf`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Failed to export PDF report for '${analysisId}'.`);
  }

  return await response.blob();
}

export async function downloadReportMarkdown(analysisId: string): Promise<string> {
  const cleanId = analysisId.trim();
  const response = await fetch(`${API_BASE_URL}/reports/${encodeURIComponent(cleanId)}/export/markdown`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Failed to export Markdown report for '${analysisId}'.`);
  }

  return await response.text();
}

export async function downloadReportJson(analysisId: string): Promise<string> {
  const cleanId = analysisId.trim();
  const response = await fetch(`${API_BASE_URL}/reports/${encodeURIComponent(cleanId)}/export/json`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Failed to export JSON report for '${analysisId}'.`);
  }

  return await response.text();
}

export function triggerFileDownload(content: Blob | string, filename: string, mimeType: string) {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
