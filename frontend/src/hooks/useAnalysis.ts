import { useState, useEffect, useCallback } from 'react';
import type {
  FullAnalysisData,
  CompareMutationsResponse,
  BasicAnalysisResponse,
  ConservationData,
  StructureData,
} from '../types/analysis';
import { fetchFullAnalysis, fetchAnalysisById, compareMutations } from '../services/analysisApi';

interface UseAnalysisParams {
  analysisId?: string;
  accession?: string;
  position?: number;
  mutant?: string;
}

export function useAnalysis(params?: UseAnalysisParams) {
  const [data, setData] = useState<FullAnalysisData | null>(null);
  const [comparison, setComparison] = useState<CompareMutationsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [basicLoading, setBasicLoading] = useState<boolean>(true);
  const [conservationLoading, setConservationLoading] = useState<boolean>(true);
  const [structureLoading, setStructureLoading] = useState<boolean>(true);
  const [comparingLoading, setComparingLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadAnalysis = useCallback(async (
    targetId?: string,
    accession?: string,
    position?: number,
    mutant?: string
  ) => {
    setLoading(true);
    setBasicLoading(true);
    setConservationLoading(true);
    setStructureLoading(true);
    setError(null);

    try {
      let fullData: FullAnalysisData;
      if (targetId && targetId.trim() !== '') {
        fullData = await fetchAnalysisById(targetId);
      } else if (accession && position && mutant) {
        fullData = await fetchFullAnalysis(accession, position, mutant);
      } else {
        throw new Error('No valid analysis ID or mutation parameters supplied.');
      }

      setData(fullData);
      setBasicLoading(false);
      setConservationLoading(false);
      setStructureLoading(false);
      setLoading(false);
      return fullData;
    } catch (err: any) {
      setError(err.message || 'Failed to load analysis dashboard data.');
      setData(null);
      setBasicLoading(false);
      setConservationLoading(false);
      setStructureLoading(false);
      setLoading(false);
      return null;
    }
  }, []);

  const runMutationComparison = useCallback(async (mutantB: string) => {
    const acc = data?.protein?.accession || params?.accession;
    const pos = data?.mutation?.position || params?.position;
    const activeMut = data?.mutation?.mutant || params?.mutant;

    if (!acc || !pos || !activeMut) return null;
    setComparingLoading(true);
    try {
      const res = await compareMutations(acc, pos, activeMut, mutantB);
      setComparison(res);
      setComparingLoading(false);
      return res;
    } catch (err: any) {
      setComparingLoading(false);
      return null;
    }
  }, [data?.protein?.accession, data?.mutation?.position, data?.mutation?.mutant, params?.accession, params?.position, params?.mutant]);

  useEffect(() => {
    if (params?.analysisId) {
      loadAnalysis(params.analysisId);
    } else if (params?.accession && params?.position && params?.mutant) {
      loadAnalysis(undefined, params.accession, params.position, params.mutant);
    } else {
      setLoading(false);
      setBasicLoading(false);
      setConservationLoading(false);
      setStructureLoading(false);
    }
  }, [params?.analysisId, params?.accession, params?.position, params?.mutant, loadAnalysis]);

  const basic: BasicAnalysisResponse | null = data?.physicochemical_evidence || null;
  const conservation: ConservationData | null = data?.conservation_evidence || null;
  const structure: StructureData | null = data?.structural_evidence || null;

  return {
    data,
    basic,
    conservation,
    structure,
    comparison,
    loading,
    basicLoading,
    conservationLoading,
    structureLoading,
    comparingLoading,
    error,
    loadAnalysis,
    runMutationComparison,
  };
}
