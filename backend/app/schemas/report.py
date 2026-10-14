from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from app.schemas.analysis import DataIntegrityFlags, DataProvenanceItem
from app.schemas.mutation import BasicAnalysisResponse
from app.schemas.conservation import ConservationResponse
from app.schemas.structure import StructureResponse

class ExecutiveSummary(BaseModel):
    protein_name: str
    gene_name: Optional[str] = None
    protein_accession: str
    organism: str
    position: int
    original_residue: str
    mutant_residue: str
    notation: str
    analysis_date: str
    status: str  # "Complete", "Partially Available", "Evidence Unavailable"
    available_pillars_count: int
    total_pillars_count: int = 4
    neutral_summary: str

class ProteinIdentification(BaseModel):
    protein_name: str
    gene_name: Optional[str] = None
    protein_accession: str
    organism: str
    sequence_length: int
    source_database: str = "UniProt KB"
    source_url: Optional[str] = None
    retrieval_date: str
    validation_status: str = "VERIFIED"

class MutationValidation(BaseModel):
    original_residue: str
    original_name: str
    position: int
    mutant_residue: str
    mutant_name: str
    notation: str
    validation_result: str = "VERIFIED"
    reference_source: str = "UniProt KB Canonical Sequence"
    validation_timestamp: str
    sequence_numbering_type: str = "Reference Sequence (1-indexed)"
    structure_numbering_note: Optional[str] = None

class PropertyRow(BaseModel):
    property_name: str
    reference_value: str
    mutant_value: str
    delta_or_shift: str
    classification: str = "Neutral"

class PhysicochemicalReport(BaseModel):
    status: str = "Calculated"
    properties: List[PropertyRow] = []
    interpretation_note: str
    method: str = "Kyte-Doolittle Hydrophobicity & IUPAC Molecular Parameters"

class ConservationReport(BaseModel):
    status: str  # "Available" | "Unavailable"
    method: str = "Shannon Entropy from Homologous UniProt Alignments"
    entropy: Optional[float] = None
    classification: Optional[str] = None
    sequence_count: Optional[int] = None
    dominant_residue: Optional[str] = None
    dominant_percentage: Optional[float] = None
    aligned_samples_count: int = 0
    reason_unavailable: Optional[str] = None

class StructuralReport(BaseModel):
    status: str  # "Available" | "Unavailable"
    pdb_id: Optional[str] = None
    structure_url: Optional[str] = None
    chain_id: Optional[str] = None
    mapped_residue_number: Optional[int] = None
    secondary_structure: Optional[str] = None
    solvent_accessibility: Optional[str] = None
    experimental_method: Optional[str] = None
    resolution: Optional[str] = None
    mapping_method: str = "UniProt to RCSB PDB SIFTS Residue Coordinate Mapping"
    structure_nature_note: str = (
        "Structural context is derived from wild-type experimental coordinates. "
        "The mutated residue side-chain has not been experimentally determined or refolded."
    )
    reason_unavailable: Optional[str] = None

class SpatialContactItem(BaseModel):
    residue_name: str
    position: int
    chain_id: str
    atom_name: str
    distance_angstrom: float
    contact_type: str = "Spatial Neighbor"

class LocalEnvironmentReport(BaseModel):
    status: str  # "Available" | "Unavailable"
    radius_angstrom: float = 6.0
    contacts: List[SpatialContactItem] = []
    contact_count: int = 0
    method: str = "RCSB 3D Euclidean Atomic Distance within 6.0 Å Sphere"
    reason_unavailable: Optional[str] = None

class AIInterpretationReport(BaseModel):
    status: str  # "Available" | "Unavailable"
    provider: str = "Gemma 4"
    interpretation: Optional[str] = None
    supporting_evidence: List[str] = []
    uncertainties_and_questions: List[str] = []
    computational_role_note: str = (
        "AI interpretations are computational synthesis aids grounded in ProteinGuard "
        "evidence. They are not experimental outcomes or medical advice."
    )
    reason_unavailable: Optional[str] = None

class EvidencePillarOverviewItem(BaseModel):
    pillar_name: str
    status: str  # "Verified" | "Calculated" | "Inferred" | "Unavailable"
    source_or_method: str
    limitations: str

class ResearchReport(BaseModel):
    report_id: str
    analysis_id: str
    created_at: str
    schema_version: str = "1.0.0"
    status: str  # "Complete" | "Partially Available" | "Evidence Unavailable"
    executive_summary: ExecutiveSummary
    protein_identification: ProteinIdentification
    mutation_validation: MutationValidation
    physicochemical_report: PhysicochemicalReport
    conservation_report: ConservationReport
    structural_report: StructuralReport
    local_environment_report: LocalEnvironmentReport
    ai_interpretation_report: AIInterpretationReport
    evidence_overview: List[EvidencePillarOverviewItem]
    limitations: List[str]
    suggested_investigations: List[str]
    provenance: List[DataProvenanceItem]
    scientific_disclaimer: str

class GenerateReportRequest(BaseModel):
    include_ai_interpretation: bool = True

class ReportExportResponse(BaseModel):
    report_id: str
    analysis_id: str
    format: str  # "pdf" | "markdown" | "json"
    download_url: Optional[str] = None
    content: Optional[str] = None
