export interface ExecutiveSummaryData {
  protein_name: string;
  gene_name?: string | null;
  protein_accession: string;
  organism: string;
  position: number;
  original_residue: string;
  mutant_residue: string;
  notation: string;
  analysis_date: string;
  status: 'Complete' | 'Partially Available' | 'Evidence Unavailable' | string;
  available_pillars_count: number;
  total_pillars_count: number;
  neutral_summary: string;
}

export interface ProteinIdentificationData {
  protein_name: string;
  gene_name?: string | null;
  protein_accession: string;
  organism: string;
  sequence_length: number;
  source_database: string;
  source_url?: string | null;
  retrieval_date: string;
  validation_status: string;
}

export interface MutationValidationData {
  original_residue: string;
  original_name: string;
  position: number;
  mutant_residue: string;
  mutant_name: string;
  notation: string;
  validation_result: string;
  reference_source: string;
  validation_timestamp: string;
  sequence_numbering_type: string;
  structure_numbering_note?: string | null;
}

export interface PropertyRowData {
  property_name: string;
  reference_value: string;
  mutant_value: string;
  delta_or_shift: string;
  classification: string;
}

export interface PhysicochemicalReportData {
  status: string;
  properties: PropertyRowData[];
  interpretation_note: string;
  method: string;
}

export interface ConservationReportData {
  status: 'Available' | 'Unavailable' | string;
  method: string;
  entropy?: number | null;
  classification?: string | null;
  sequence_count?: number | null;
  dominant_residue?: string | null;
  dominant_percentage?: number | null;
  aligned_samples_count: number;
  reason_unavailable?: string | null;
}

export interface StructuralReportData {
  status: 'Available' | 'Unavailable' | string;
  pdb_id?: string | null;
  structure_url?: string | null;
  chain_id?: string | null;
  mapped_residue_number?: number | null;
  secondary_structure?: string | null;
  solvent_accessibility?: string | null;
  experimental_method?: string | null;
  resolution?: string | null;
  mapping_method: string;
  structure_nature_note: string;
  reason_unavailable?: string | null;
}

export interface SpatialContactItemData {
  residue_name: string;
  position: number;
  chain_id: string;
  atom_name: string;
  distance_angstrom: number;
  contact_type: string;
}

export interface LocalEnvironmentReportData {
  status: 'Available' | 'Unavailable' | string;
  radius_angstrom: number;
  contacts: SpatialContactItemData[];
  contact_count: number;
  method: string;
  reason_unavailable?: string | null;
}

export interface AIInterpretationReportData {
  status: 'Available' | 'Unavailable' | string;
  provider: string;
  interpretation?: string | null;
  supporting_evidence: string[];
  uncertainties_and_questions: string[];
  computational_role_note: string;
  reason_unavailable?: string | null;
}

export interface EvidencePillarOverviewItemData {
  pillar_name: string;
  status: 'Verified' | 'Calculated' | 'Inferred' | 'Unavailable' | string;
  source_or_method: string;
  limitations: string;
}

export interface DataProvenanceItemData {
  source: string;
  identifier?: string | null;
  retrieved_at?: string | null;
  verified: boolean;
  method?: string | null;
  status?: string | null;
}

export interface ResearchReportData {
  report_id: string;
  analysis_id: string;
  created_at: string;
  schema_version: string;
  status: 'Complete' | 'Partially Available' | 'Evidence Unavailable' | string;
  executive_summary: ExecutiveSummaryData;
  protein_identification: ProteinIdentificationData;
  mutation_validation: MutationValidationData;
  physicochemical_report: PhysicochemicalReportData;
  conservation_report: ConservationReportData;
  structural_report: StructuralReportData;
  local_environment_report: LocalEnvironmentReportData;
  ai_interpretation_report: AIInterpretationReportData;
  evidence_overview: EvidencePillarOverviewItemData[];
  limitations: string[];
  suggested_investigations: string[];
  provenance: DataProvenanceItemData[];
  scientific_disclaimer: string;
}
