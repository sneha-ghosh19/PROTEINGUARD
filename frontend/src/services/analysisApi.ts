import type { FullAnalysisData, ConservationData, StructureData, CompareMutationsResponse } from '../types/analysis';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export async function createAnalysis(
  accession: string,
  position: number,
  mutant: string
): Promise<FullAnalysisData> {
  const cleanAcc = accession.trim().toUpperCase();
  const cleanMut = mutant.trim().toUpperCase();
  const response = await fetch(`${API_BASE_URL}/analysis/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      protein_accession: cleanAcc,
      position: position,
      mutant_residue: cleanMut,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to initialize analysis pipeline.');
  }

  return await response.json();
}

export async function fetchAnalysisById(analysisId: string): Promise<FullAnalysisData> {
  const cleanId = analysisId.trim();
  const response = await fetch(`${API_BASE_URL}/analysis/${encodeURIComponent(cleanId)}`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Analysis '${analysisId}' not found.`);
  }

  return await response.json();
}

export async function fetchFullAnalysis(
  accession: string,
  position: number,
  mutant: string
): Promise<FullAnalysisData> {
  const cleanAcc = accession.trim().toUpperCase();
  const cleanMut = mutant.trim().toUpperCase();
  const response = await fetch(
    `${API_BASE_URL}/analysis/${encodeURIComponent(cleanAcc)}/${position}/${encodeURIComponent(cleanMut)}`
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to retrieve full analysis evidence.');
  }

  return await response.json();
}

export async function fetchConservationAnalysis(
  accession: string,
  position: number
): Promise<ConservationData> {
  const response = await fetch(`${API_BASE_URL}/conservation/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ protein_accession: accession, position: position })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Conservation analysis unavailable.');
  }

  return await response.json();
}

export async function fetchStructureAnalysis(
  accession: string,
  position: number
): Promise<StructureData> {
  const response = await fetch(`${API_BASE_URL}/structure/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ protein_accession: accession, position: position })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Structural context analysis unavailable.');
  }

  return await response.json();
}

export async function compareMutations(
  accession: string,
  position: number,
  mutantA: string,
  mutantB: string
): Promise<CompareMutationsResponse> {
  const response = await fetch(`${API_BASE_URL}/mutations/compare`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      protein_accession: accession,
      position: position,
      mutant_a: mutantA,
      mutant_b: mutantB
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to compute mutation comparison.');
  }

  return await response.json();
}
