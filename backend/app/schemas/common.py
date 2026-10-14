from pydantic import BaseModel, Field
from typing import Optional

class HealthResponse(BaseModel):
    status: str = Field("ok", json_schema_extra={"example": "ok"})
    service: str = Field("ProteinGuard API", json_schema_extra={"example": "ProteinGuard API"})
    version: str = Field("0.1.0", json_schema_extra={"example": "0.1.0"})

class ConfigFeatures(BaseModel):
    mutation_analysis: bool = Field(True)
    structure_visualization: bool = Field(True)
    gemma_explanation: bool = Field(True)

class ConfigResponse(BaseModel):
    project_name: str = Field("ProteinGuard")
    version: str = Field("0.1.0")
    github_url: str = Field("https://github.com/sneha-ghosh19/PROTEINGUARD")
    features: ConfigFeatures

class DataProvenance(BaseModel):
    source: str = Field(..., description="Data source e.g. UniProt REST API, RCSB PDB, Shannon Entropy Calculation")
    identifier: Optional[str] = Field(None, description="Database ID or accession")
    retrieved_at: Optional[str] = Field(None, description="ISO timestamp of data retrieval")
    verified: bool = Field(True, description="Whether data has been verified against authoritative reference")
    method: Optional[str] = Field(None, description="Analytical algorithm or method")
    status: str = Field("VERIFIED", description="VERIFIED, UNVERIFIED, NOT_AVAILABLE, INVALID, CALCULATED, INFERRED")

class VerifiedMutation(BaseModel):
    protein_accession: str
    position: int
    reference_residue: str
    mutant_residue: str
    notation: str
    verified: bool = True
    validation_message: Optional[str] = None
    provenance: DataProvenance
