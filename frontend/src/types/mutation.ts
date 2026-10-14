export interface AminoAcidDetail {
  code: string;
  name: string;
  three_letter: string;
  molecular_weight: number;
  charge: number;
  charge_label: string;
  polarity: string;
  hydrophobicity: number;
  side_chain_class: string;
  volume: number;
}

export interface PropertyShiftMetric {
  original: any;
  mutant: any;
  diff?: number;
  change: string; // 'increase' | 'decrease' | 'unchanged' | 'more_positive' | 'more_negative' etc.
  display?: string;
}

export interface PropertyShifts {
  molecular_weight: PropertyShiftMetric;
  charge: PropertyShiftMetric;
  polarity: PropertyShiftMetric;
  hydrophobicity: PropertyShiftMetric;
  volume: PropertyShiftMetric;
}

export interface MutationValidateResponse {
  valid: boolean;
  mutation: string;
  protein_accession: string;
  position: number;
  original: AminoAcidDetail;
  mutant: AminoAcidDetail;
}

export interface BasicAnalysisResponse {
  mutation: string;
  original: AminoAcidDetail;
  mutant: AminoAcidDetail;
  property_shifts: PropertyShifts;
}

export interface PlaygroundItem {
  mutation: string;
  mutant: AminoAcidDetail;
  property_shifts: PropertyShifts;
}

export interface PlaygroundResponse {
  protein_accession: string;
  position: number;
  original: AminoAcidDetail;
  substitutions_count: number;
  substitutions: PlaygroundItem[];
}

export interface BaselinePredictRequest {
  accession: string;
  mutant: string;
  model_type?: 'ridge' | 'random_forest';
}

export interface BaselinePredictResponse {
  accession: string;
  mutant: string;
  wildtype_aa: string;
  position: number;
  mutant_aa: string;
  predicted_dms_score: number;
  predicted_functional_class: string;
  score_explanation: string;
  model_used: string;
  model_version: string;
  assay_id: string;
  uncertainty_std: number | null;
  provenance: Record<string, any>;
  scientific_disclaimer: string;
}

export interface BaselineMetrics {
  model_name: string;
  spearman_rho: number;
  pearson_r: number;
  mse: number;
  train_samples: number;
  test_samples: number;
  train_positions: number;
  test_positions: number;
  notes?: string;
}

export interface BaselineModelComparison {
  assay_id: string;
  dataset_filename: string;
  uniprot_id: string;
  target_sequence_length: number;
  split_seed: number;
  train_positions_count: number;
  test_positions_count: number;
  feature_names: string[];
  primary_model: BaselineMetrics;
  comparison_model: BaselineMetrics;
  summary: string;
  disclaimer: string;
}

