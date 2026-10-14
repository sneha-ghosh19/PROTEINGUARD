import { useState, useCallback } from 'react';
import type { ProteinData } from '../types/protein';
import { fetchProteinByAccession } from '../services/proteinApi';

// Session cache to prevent re-fetching the same accession
const proteinCache = new Map<string, ProteinData>();

export function useProtein() {
  const [protein, setProtein] = useState<ProteinData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadProtein = useCallback(async (accession: string) => {
    const cleanAcc = accession.trim().toUpperCase();
    if (!cleanAcc) {
      setError('Enter a protein accession or search term.');
      return null;
    }

    // Check session cache first
    if (proteinCache.has(cleanAcc)) {
      const cached = proteinCache.get(cleanAcc)!;
      setProtein(cached);
      setError(null);
      return cached;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await fetchProteinByAccession(cleanAcc);
      proteinCache.set(cleanAcc, data);
      setProtein(data);
      setLoading(false);
      return data;
    } catch (err: any) {
      setError(err.message || 'Unable to retrieve protein data right now. Please try again.');
      setProtein(null);
      setLoading(false);
      return null;
    }
  }, []);

  const clearProtein = useCallback(() => {
    setProtein(null);
    setError(null);
  }, []);

  return { protein, loading, error, loadProtein, clearProtein };
}
