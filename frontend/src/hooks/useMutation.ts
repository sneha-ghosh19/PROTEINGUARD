import { useState, useCallback } from 'react';
import type { BasicAnalysisResponse, PlaygroundResponse } from '../types/mutation';
import { validateMutation, fetchBasicAnalysis, fetchMutationPlayground } from '../services/mutationApi';

export function useMutation() {
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null);
  const [originalResidue, setOriginalResidue] = useState<string | null>(null);
  const [mutantResidue, setMutantResidue] = useState<string>('V');
  const [analysis, setAnalysis] = useState<BasicAnalysisResponse | null>(null);
  const [playground, setPlayground] = useState<PlaygroundResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const selectPosition = useCallback((pos: number, seq: string) => {
    if (pos < 1 || pos > seq.length) {
      setError(`Position ${pos} is outside this protein's sequence length of ${seq.length}.`);
      return false;
    }
    const orig = seq[pos - 1].toUpperCase();
    setSelectedPosition(pos);
    setOriginalResidue(orig);
    setError(null);
    setAnalysis(null);
    setPlayground(null);

    // Pick default mutant different from orig
    const defaultMutant = orig === 'V' ? 'A' : 'V';
    setMutantResidue(defaultMutant);
    return true;
  }, []);

  const runAnalysis = useCallback(async (accession: string, pos: number, mutAA: string) => {
    setLoading(true);
    setError(null);

    try {
      // 1. Validate mutation
      const valResponse = await validateMutation(accession, pos, mutAA);
      
      // 2. Fetch basic physicochemical analysis
      const anaResponse = await fetchBasicAnalysis(valResponse.original.code, valResponse.mutant.code);
      setAnalysis(anaResponse);

      // 3. Load Playground (all 19 substitutions)
      const playResponse = await fetchMutationPlayground(accession, pos);
      setPlayground(playResponse);

      setLoading(false);
      return anaResponse;
    } catch (err: any) {
      setError(err.message || 'Mutation analysis failed.');
      setAnalysis(null);
      setLoading(false);
      return null;
    }
  }, []);

  const selectPlaygroundSub = useCallback(async (mutCode: string, origCode: string) => {
    setMutantResidue(mutCode);
    try {
      const anaResponse = await fetchBasicAnalysis(origCode, mutCode);
      setAnalysis(anaResponse);
    } catch (err: any) {
      setError(err.message || 'Failed to update mutation analysis.');
    }
  }, []);

  return {
    selectedPosition,
    originalResidue,
    mutantResidue,
    setMutantResidue,
    analysis,
    playground,
    loading,
    error,
    setError,
    selectPosition,
    runAnalysis,
    selectPlaygroundSub
  };
}
