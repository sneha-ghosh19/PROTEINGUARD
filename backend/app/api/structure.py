from fastapi import APIRouter, HTTPException, status
from fastapi.responses import PlainTextResponse
from app.schemas.structure import StructureRequest, StructureResponse
from app.services.structure import structure_service
from app.services.rcsb import rcsb_service
from app.services.alphafold import alphafold_service
from app.services.uniprot import ProteinNotFoundException

router = APIRouter()

@router.post("/structure/analyze", response_model=StructureResponse, summary="Analyze Structural Context")
def analyze_structure(req: StructureRequest):
    """
    Search RCSB PDB for experimental structures mapped to UniProt accession and compute 3D spatial contacts and environment metrics.
    Falls back to AlphaFold DB if no experimental structure is deposited.
    """
    try:
        data = structure_service.analyze_structural_context(req.protein_accession, req.position)
        return data
    except ProteinNotFoundException:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Protein accession '{req.protein_accession}' not found."
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Unable to perform structural context analysis right now."
        )

@router.get("/structure/{pdb_id}/coordinates", summary="Retrieve verified molecular coordinates")
def get_structure_coordinates(pdb_id: str, format: str = "pdb"):
    """
    Serves authoritative RCSB PDB or AlphaFold DB coordinate data with server-side validation.
    """
    clean_id = pdb_id.strip()
    if clean_id.startswith("AF-") or "AF-" in clean_id:
        data = alphafold_service.fetch_coordinates(clean_id, format)
        source_name = "AlphaFold DB"
    else:
        data = rcsb_service.fetch_structure_coordinates(clean_id, format)
        source_name = "RCSB PDB"

    if not data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Coordinates for structure '{pdb_id}' could not be retrieved from {source_name}."
        )
    return PlainTextResponse(data, media_type="text/plain")


