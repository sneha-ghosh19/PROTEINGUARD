import type { ProteinData, ProteinSearchResponse } from '../types/protein';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export async function fetchProteinByAccession(accession: string): Promise<ProteinData> {
  const clean = accession.trim();
  const response = await fetch(`${API_BASE_URL}/proteins/${encodeURIComponent(clean)}`);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData.detail || `Protein '${clean}' not found. Check the UniProt accession and try again.`;
    throw new Error(message);
  }
  
  return await response.json();
}

export async function searchProteins(query: string): Promise<ProteinSearchResponse> {
  const clean = query.trim();
  const response = await fetch(`${API_BASE_URL}/proteins/search?query=${encodeURIComponent(clean)}`);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Unable to retrieve protein search results.');
  }

  return await response.json();
}
