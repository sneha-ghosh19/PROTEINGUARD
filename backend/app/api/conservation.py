from fastapi import APIRouter, HTTPException, status
from app.schemas.conservation import ConservationRequest, ConservationResponse
from app.services.conservation import conservation_service
from app.services.uniprot import ProteinNotFoundException

router = APIRouter()

@router.post("/conservation/analyze", response_model=ConservationResponse, summary="Analyze Position Conservation")
async def analyze_conservation(req: ConservationRequest):
    """
    Perform multiple sequence alignment analysis and compute Shannon entropy for position conservation.
    """
    try:
        data = conservation_service.analyze_position_conservation(req.protein_accession, req.position)
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
            detail="Unable to perform sequence conservation analysis right now."
        )
