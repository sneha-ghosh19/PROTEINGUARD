import type {
  MutationValidateResponse,
  BasicAnalysisResponse,
  PlaygroundResponse,
  BaselinePredictResponse,
  BaselineModelComparison
} from '../types/mutation';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export async function validateMutation(
  proteinAccession: string,
  position: number,
  mutantAminoAcid: string
): Promise<MutationValidateResponse> {
  const response = await fetch(`${API_BASE_URL}/mutations/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      protein_accession: proteinAccession,
      position: position,
      mutant_amino_acid: mutantAminoAcid
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Mutation validation failed.');
  }

  return await response.json();
}

export async function fetchBasicAnalysis(
  originalCode: string,
  mutantCode: string
): Promise<BasicAnalysisResponse> {
  const response = await fetch(`${API_BASE_URL}/mutations/analyze-basic`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      original: originalCode,
      mutant: mutantCode
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to compute basic mutation analysis.');
  }

  return await response.json();
}

export async function fetchMutationPlayground(
  proteinAccession: string,
  position: number
): Promise<PlaygroundResponse> {
  const response = await fetch(`${API_BASE_URL}/mutations/playground`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      protein_accession: proteinAccession,
      position: position
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to load mutation playground.');
  }

  return await response.json();
}

export async function predictBaselineMutation(
  accession: string,
  mutant: string,
  modelType: 'ridge' | 'random_forest' = 'random_forest'
): Promise<BaselinePredictResponse> {
  const response = await fetch(`${API_BASE_URL}/baseline/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      accession: accession,
      mutant: mutant,
      model_type: modelType
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Baseline prediction failed with status ${response.status}`);
  }

  return await response.json();
}

export async function fetchBaselineMetrics(): Promise<BaselineModelComparison> {
  const response = await fetch(`${API_BASE_URL}/baseline/metrics`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Failed to fetch baseline metrics with status ${response.status}`);
  }

  return await response.json();
}

