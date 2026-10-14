from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class ConservationRequest(BaseModel):
    protein_accession: str = Field(..., json_schema_extra={"example": "P04637"})
    position: int = Field(..., json_schema_extra={"example": 98})

class ResidueFrequency(BaseModel):
    amino_acid: str = Field(..., json_schema_extra={"example": "A"})
    percentage: float = Field(..., json_schema_extra={"example": 86.0})

class AlignedSample(BaseModel):
    accession: str = Field(..., json_schema_extra={"example": "P04637"})
    organism: str = Field(..., json_schema_extra={"example": "Homo sapiens"})
    residue: str = Field(..., json_schema_extra={"example": "P"})
    window: str = Field(..., json_schema_extra={"example": "PLSSSVPSQK"})

class ConservationResponse(BaseModel):
    protein_accession: str
    gene_name: str
    position: int
    target_residue: str
    method: str = Field(default="Multiple Sequence Alignment (UniProt Ortholog Set)")
    entropy: float = Field(..., description="Shannon entropy H = -sum(p * log2 p)", json_schema_extra={"example": 0.42})
    classification: str = Field(..., description="Highly conserved, Moderately conserved, or Variable", json_schema_extra={"example": "Highly conserved"})
    sequence_count: int = Field(..., json_schema_extra={"example": 15})
    dominant_residue: str = Field(..., json_schema_extra={"example": "P"})
    dominant_percentage: float = Field(..., json_schema_extra={"example": 86.0})
    residue_frequencies: List[ResidueFrequency]
    aligned_samples: List[AlignedSample]
    limited_data_warning: bool = Field(default=False)
