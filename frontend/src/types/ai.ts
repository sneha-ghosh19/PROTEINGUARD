export interface AIAction {
  type: 'highlight_residues' | 'focus_residue' | 'reset_view' | 'show_contacts';
  residues?: Array<{ chain: string; position: number }>;
  target_position?: number;
}

export interface AIEvidenceItem {
  category: string;
  statement: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  evidence_items?: AIEvidenceItem[];
  limitations?: string[];
  actions?: AIAction[];
  provider?: string;
  timestamp: string;
}

export interface AIExplainResponse {
  answer: string;
  evidence_items: AIEvidenceItem[];
  limitations: string[];
  actions: AIAction[];
  grounded: boolean;
  provider: string;
}

export interface AIHealthData {
  provider: string;
  available: boolean;
  model: string;
  mode: string;
}

export interface AIReportData {
  title: string;
  analysis_date: string;
  protein_accession: string;
  mutation_notation: string;
  overview: string;
  physicochemical_summary: string;
  conservation_summary: string;
  structural_summary: string;
  ai_interpretation?: string;
  limitations: string[];
}
