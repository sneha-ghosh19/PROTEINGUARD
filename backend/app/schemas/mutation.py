from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional

class MutationValidateRequest(BaseModel):
    protein_accession: str = Field(..., description="UniProt Accession ID, e.g. P04637", json_schema_extra={"example": "P04637"})
    position: int = Field(..., description="1-based position in the sequence", json_schema_extra={"example": 98})
    mutant_amino_acid: str = Field(..., description="Single-letter code for mutant AA, e.g. V", json_schema_extra={"example": "V"})

class AminoAcidDetail(BaseModel):
    code: str = Field(..., json_schema_extra={"example": "A"})
    name: str = Field(..., json_schema_extra={"example": "Alanine"})
    three_letter: str = Field(..., json_schema_extra={"example": "Ala"})
    molecular_weight: float = Field(..., json_schema_extra={"example": 89.09})
    charge: int = Field(..., json_schema_extra={"example": 0})
    charge_label: str = Field(..., json_schema_extra={"example": "Neutral"})
    polarity: str = Field(..., json_schema_extra={"example": "nonpolar"})
    hydrophobicity: float = Field(..., json_schema_extra={"example": 1.8})
    side_chain_class: str = Field(..., json_schema_extra={"example": "Aliphatic"})
    volume: float = Field(..., json_schema_extra={"example": 88.6})

class MutationValidateResponse(BaseModel):
    valid: bool = Field(default=True, json_schema_extra={"example": True})
    mutation: str = Field(..., description="Standard notation e.g. A98V", json_schema_extra={"example": "A98V"})
    protein_accession: str = Field(..., json_schema_extra={"example": "P04637"})
    position: int = Field(..., json_schema_extra={"example": 98})
    original: AminoAcidDetail
    mutant: AminoAcidDetail

class BasicAnalysisRequest(BaseModel):
    original: str = Field(..., description="1-letter code of wildtype AA", json_schema_extra={"example": "A"})
    mutant: str = Field(..., description="1-letter code of mutant AA", json_schema_extra={"example": "V"})

class PropertyShiftMetric(BaseModel):
    original: Any
    mutant: Any
    diff: Optional[Any] = None
    change: str = Field(..., description="increase, decrease, unchanged, more_positive, etc.")
    display: Optional[str] = None

class PropertyShifts(BaseModel):
    molecular_weight: PropertyShiftMetric
    charge: PropertyShiftMetric
    polarity: PropertyShiftMetric
    hydrophobicity: PropertyShiftMetric
    volume: PropertyShiftMetric

class BasicAnalysisResponse(BaseModel):
    mutation: str = Field(..., json_schema_extra={"example": "A98V"})
    original: AminoAcidDetail
    mutant: AminoAcidDetail
    property_shifts: PropertyShifts

class PlaygroundRequest(BaseModel):
    protein_accession: str = Field(..., json_schema_extra={"example": "P04637"})
    position: int = Field(..., json_schema_extra={"example": 98})

class PlaygroundItem(BaseModel):
    mutation: str = Field(..., json_schema_extra={"example": "A98V"})
    mutant: AminoAcidDetail
    property_shifts: PropertyShifts

class PlaygroundResponse(BaseModel):
    protein_accession: str
    position: int
    original: AminoAcidDetail
    substitutions_count: int = Field(default=19)
    substitutions: List[PlaygroundItem]
