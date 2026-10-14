import type { AIExplainResponse, AIHealthData, AIReportData } from '../types/ai';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export async function askAI(
  accession: string,
  position: number,
  mutant: string,
  question: string
): Promise<AIExplainResponse> {
  const response = await fetch(`${API_BASE_URL}/ai/explain`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      accession,
      position,
      mutant,
      question,
    }),
  });

  if (!response.ok) {
    throw new Error(`AI explanation request failed with status ${response.status}`);
  }

  return await response.json();
}

export async function fetchAIHealth(): Promise<AIHealthData> {
  try {
    const response = await fetch(`${API_BASE_URL}/ai/health`);
    if (!response.ok) {
      return { provider: 'gemma', available: false, model: 'Gemma 4', mode: 'Offline' };
    }
    return await response.json();
  } catch {
    return { provider: 'gemma', available: false, model: 'Gemma 4', mode: 'Offline' };
  }
}

export async function generateAIReport(
  accession: string,
  position: number,
  mutant: string
): Promise<AIReportData> {
  const response = await fetch(`${API_BASE_URL}/ai/report`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      accession,
      position,
      mutant,
      include_ai_interpretation: true,
    }),
  });

  if (!response.ok) {
    throw new Error(`Report generation failed with status ${response.status}`);
  }

  return await response.json();
}
