import type { ProteinData } from './protein';
import type { BasicAnalysisResponse as BaseBasicAnalysisResponse, AminoAcidDetail } from './mutation';

export interface BasicAnalysisResponse extends BaseBasicAnalysisResponse {
  protein_accession?: string;
  position?: number;
  protein?: {
    name?: string;
    gene?: string;
    organism?: string;
    accession?: string;
  };
  changes?: {
    side_chain_class?: {
      changed: boolean;
    };
  };
}

export type { AminoAcidDetail };

export interface ResidueFrequency {
  amino_acid: string;
  percentage: number;
}

export interface AlignedSample {
  accession: string;
  organism: string;
  residue: string;
  window: string;
}

export interface ConservationData {
  status?: string;
  protein_accession: string;
  gene_name: string;
  position: number;
  target_residue: string;
  original_residue?: string;
  method: string;
  entropy: number;
  classification: string;
  sequence_count: number;
  dominant_residue: string;
  dominant_percentage: number;
  dominant_frequency?: number;
  residue_frequencies: ResidueFrequency[];
  aligned_samples: AlignedSample[];
  alignment_snippet?: AlignedSample[];
  limited_data_warning: boolean;
}

export type ConservationAnalysisResponse = ConservationData;

export interface SpatialContact {
  position: number;
  code?: string;
  name?: string;
  residue_name: string;
  chain_id: string;
  atom_name: string;
  three_letter?: string;
  distance_angstrom: number;
  distance_angstroms?: number;
  contact_type?: string;
  mapped_position?: number;
}

export interface StructureData {
  status: string; // 'success' | 'mapped' | 'structure_available' | 'unmapped' | 'not_found'
  structure_status?: 'available' | 'unavailable' | 'failed';
  protein_identity?: 'verified' | 'unverified';
  chain_mapping?: 'verified' | 'unavailable';
  mutation_mapping?: 'verified' | 'unavailable';
  message?: string;
  protein_accession: string;
  protein_name?: string;
  position: number;
  target_residue: string;
  pdb_id: string | null;
  chain_id: string | null;
  chain?: string | null;
  mapped_residue_number: number | null;
  mapped_pdb_residue?: number | null;
  mapping_status?: string | null;
  structure_source?: string | null;
  resolution?: string | null;
  experimental_method?: string | null;
  title?: string | null;
  secondary_structure: string;
  environment: string; // 'buried' | 'exposed' | 'unavailable'
  relative_solvent_accessibility: number | null;
  solvent_accessibility?: string | null;
  nearby_residues: SpatialContact[];
  available_structures?: string[];
  disclaimer?: string;
  is_predicted?: boolean;
  predicted_source?: string | null;
}

export type StructureAnalysisResponse = StructureData;

export interface DataIntegrityFlags {
  protein_verified: boolean;
  sequence_verified: boolean;
  position_verified: boolean;
  reference_residue_verified: boolean;
  mutation_notation_validated: boolean;
  structure_mapped: boolean;
}

export interface DataProvenanceItem {
  source: string;
  identifier?: string;
  retrieved_at?: string;
  verified: boolean;
  method?: string;
  status?: string;
}

export interface FullAnalysisData {
  analysis_id: string;
  status: 'created' | 'validating' | 'validated' | 'processing' | 'completed' | 'partial' | 'failed' | 'invalid' | string;
  protein: ProteinData;
  mutation: {
    position: number;
    original: string;
    mutant: string;
    notation: string;
    original_name: string;
    mutant_name: string;
    verified?: boolean;
    provenance?: DataProvenanceItem;
  };
  data_integrity?: DataIntegrityFlags;
  available_pillars_count?: number;
  physicochemical_evidence: BasicAnalysisResponse;
  conservation_evidence: ConservationData | null;
  structural_evidence: StructureData | null;
  provenance?: DataProvenanceItem[];
  limitations: string[];
  ai_explanation?: any | null; // Reserved for Screen 4
}

export interface MutationVariantCompare {
  notation: string;
  original: AminoAcidDetail;
  mutant: AminoAcidDetail;
  properties: {
    molecular_weight: number;
    charge: number;
    polarity: string;
    hydrophobicity: number;
    side_chain_class: string;
  };
}

export interface MutationCompareResponse {
  position: number;
  original: string;
  mutation_a: MutationVariantCompare;
  mutation_b: MutationVariantCompare;
  shared_conservation: ConservationData | null;
  shared_structure: StructureData | null;
}

export type CompareMutationsResponse = MutationCompareResponse;
