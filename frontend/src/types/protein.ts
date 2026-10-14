export interface ProteinData {
  accession: string;
  protein_name: string;
  gene_name: string;
  organism: string;
  length: number;
  sequence: string;
  description: string;
  source: string;
}

export interface ProteinSearchResponse {
  query: string;
  total_count: number;
  results: ProteinData[];
}
