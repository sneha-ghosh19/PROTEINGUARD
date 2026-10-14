export interface ConfigFeatures {
  mutation_analysis: boolean;
  structure_visualization: boolean;
  gemma_explanation: boolean;
}

export interface AppConfig {
  project_name: string;
  version: string;
  github_url: string;
  features: ConfigFeatures;
}

export interface HealthStatus {
  status: string;
  service: string;
  version: string;
}

// Future API Types (Screen 2+)
export interface MutationAnalysisRequest {
  protein_id: string;
  position: number;
  original_amino_acid: string;
  mutant_amino_acid: string;
}

export interface MutationAnalysisResponse {
  mutation: string;
  protein: Record<string, any>;
  amino_acid_change: Record<string, any>;
  conservation: Record<string, any>;
  structural_context: Record<string, any>;
  interaction_analysis: Record<string, any>;
  evidence: Record<string, any>;
  ai_explanation: Record<string, any>;
}
