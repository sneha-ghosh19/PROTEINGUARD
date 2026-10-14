from pydantic import BaseModel, Field
from typing import List, Optional

class ProteinResponse(BaseModel):
    accession: str = Field(..., description="UniProt Accession ID, e.g., P04637", json_schema_extra={"example": "P04637"})
    protein_name: str = Field(..., description="Recommended protein name", json_schema_extra={"example": "Cellular tumor antigen p53"})
    gene_name: str = Field(..., description="Gene symbol", json_schema_extra={"example": "TP53"})
    organism: str = Field(..., description="Organism scientific name", json_schema_extra={"example": "Homo sapiens"})
    length: int = Field(..., description="Sequence length in amino acids", json_schema_extra={"example": 393})
    sequence: str = Field(..., description="Full amino acid sequence", json_schema_extra={"example": "MEEPQSDPSV..."})
    description: str = Field(..., description="Function description or summary", json_schema_extra={"example": "Acts as a tumor suppressor..."})
    source: str = Field(default="UniProt", json_schema_extra={"example": "UniProt"})

class ProteinSearchResponse(BaseModel):
    query: str
    total_count: int
    results: List[ProteinResponse]
