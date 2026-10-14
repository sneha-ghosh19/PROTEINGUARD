export type RepresentationType = 'cartoon' | 'surface' | 'ball_and_stick';
export type ColorMode = 'chain' | 'secondary_structure' | 'element' | 'residue';

export interface StructureViewerState {
  representation: RepresentationType;
  colorBy: ColorMode;
  highlightMutant: boolean;
  showContacts: boolean;
  focusedResidue: number | null;
  selectedResidue: SelectedResidueInfo | null;
}

export interface SelectedResidueInfo {
  name: string;
  code: string;
  position: number;
  chain: string;
  distanceFromMutation: number;
  secondaryStructure?: string;
  solventAccessibility?: string;
}

export interface StructureMetaData {
  pdb_id: string | null;
  chain_id: string | null;
  resolution?: string | null;
  experimental_method?: string | null;
  mapped_residue_number: number | null;
  secondary_structure: string;
  environment: string;
  relative_solvent_accessibility: number | null;
  nearby_residue_count: number;
}
