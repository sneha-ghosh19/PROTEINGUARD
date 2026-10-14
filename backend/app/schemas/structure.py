from pydantic import BaseModel, Field
from typing import List, Optional

class StructureRequest(BaseModel):
    protein_accession: str = Field(..., json_schema_extra={"example": "P04637"})
    position: int = Field(..., json_schema_extra={"example": 98})

class NearbyResidue(BaseModel):
    position: int = Field(..., json_schema_extra={"example": 45})
    code: str = Field(..., json_schema_extra={"example": "R"})
    name: str = Field(..., json_schema_extra={"example": "Arginine"})
    three_letter: str = Field(..., json_schema_extra={"example": "Arg"})
    distance_angstroms: float = Field(..., json_schema_extra={"example": 3.8})
    distance_angstrom: Optional[float] = None
    chain_id: Optional[str] = "A"
    contact_type: str = Field(..., json_schema_extra={"example": "Backbone / Side-chain contact"})

class StructureResponse(BaseModel):
    protein_accession: str
    protein_name: Optional[str] = None
    position: int
    target_residue: str
    status: str = Field(..., description="mapped, structure_available, unmapped, or not_found", json_schema_extra={"example": "mapped"})
    structure_status: Optional[str] = Field("available", description="available | unavailable | failed")
    protein_identity: Optional[str] = Field("verified", description="verified | unverified")
    chain_mapping: Optional[str] = Field("verified", description="verified | unavailable")
    mutation_mapping: Optional[str] = Field("verified", description="verified | unavailable")
    mapping_status: Optional[str] = Field("verified", description="verified, unverified, unavailable, unmapped")
    pdb_id: Optional[str] = Field(None, json_schema_extra={"example": "1TUP"})
    chain: Optional[str] = Field(None, json_schema_extra={"example": "A"})
    chain_id: Optional[str] = Field(None, json_schema_extra={"example": "A"})
    mapped_pdb_residue: Optional[int] = Field(None, json_schema_extra={"example": 98})
    mapped_residue_number: Optional[int] = Field(None, json_schema_extra={"example": 98})
    structure_source: Optional[str] = Field("RCSB PDB / UniProt SIFTS")
    resolution: Optional[str] = Field(None, json_schema_extra={"example": "2.2 Å"})
    experimental_method: Optional[str] = Field(None, json_schema_extra={"example": "X-ray Diffraction"})
    title: Optional[str] = Field(None, json_schema_extra={"example": "Crystal structure of p53"})
    secondary_structure: str = Field(..., json_schema_extra={"example": "Alpha helix"})
    environment: str = Field(..., description="Buried or Exposed", json_schema_extra={"example": "Buried"})
    solvent_accessibility: Optional[str] = Field(None, json_schema_extra={"example": "18.5%"})
    nearby_residue_count: int = Field(default=0)
    nearby_residues: List[NearbyResidue]
    available_structures: List[str]
    disclaimer: str
    is_predicted: Optional[bool] = Field(False, description="True if structure is an in silico AlphaFold model")
    predicted_source: Optional[str] = Field(None, description="AlphaFold DB v4 or None")

