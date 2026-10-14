from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from app.schemas.protein import ProteinResponse
from app.schemas.mutation import BasicAnalysisResponse
from app.schemas.conservation import ConservationResponse
from app.schemas.structure import StructureResponse

class DataIntegrityFlags(BaseModel):
    protein_verified: bool = True
    sequence_verified: bool = True
    position_verified: bool = True
    reference_residue_verified: bool = True
    mutation_notation_validated: bool = True
    structure_mapped: bool = False

class DataProvenanceItem(BaseModel):
    source: str
    identifier: Optional[str] = None
    retrieved_at: Optional[str] = None
    verified: bool = True
    method: Optional[str] = None
    status: Optional[str] = "VERIFIED"

class CreateAnalysisRequest(BaseModel):
    protein_accession: str = Field(..., json_schema_extra={"example": "P04637"})
    position: int = Field(..., json_schema_extra={"example": 98})
    mutant_residue: str = Field(..., json_schema_extra={"example": "V"})

class FullAnalysisResponse(BaseModel):
    analysis_id: str
    status: str = "completed" # created | validating | processing | completed | partial | failed | invalid
    protein: ProteinResponse
    mutation: Dict[str, Any] # position, original, mutant, notation e.g. P98V, verified, provenance
    data_integrity: DataIntegrityFlags
    available_pillars_count: int = 1
    physicochemical_evidence: BasicAnalysisResponse
    conservation_evidence: Optional[ConservationResponse] = None
    structural_evidence: Optional[StructureResponse] = None
    provenance: List[DataProvenanceItem] = []
    limitations: List[str]
    ai_explanation: Optional[Dict[str, Any]] = None # Reserved for Screen 4

class CompareMutationsRequest(BaseModel):
    protein_accession: str = Field(..., json_schema_extra={"example": "P04637"})
    position: int = Field(..., json_schema_extra={"example": 98})
    mutant_a: str = Field(..., json_schema_extra={"example": "V"})
    mutant_b: str = Field(..., json_schema_extra={"example": "D"})

class CompareMutationsResponse(BaseModel):
    protein_accession: str
    position: int
    original: Dict[str, Any]
    mutation_a: BasicAnalysisResponse
    mutation_b: BasicAnalysisResponse
    shared_conservation: Optional[ConservationResponse] = None
    shared_structure: Optional[StructureResponse] = None

