from fastapi import APIRouter, HTTPException, Query, status
from app.schemas.protein import ProteinResponse, ProteinSearchResponse
from app.services.uniprot import uniprot_service, ProteinNotFoundException, UniProtServiceException

router = APIRouter()

@router.get("/proteins/search", response_model=ProteinSearchResponse, summary="Search Proteins")
async def search_proteins(query: str = Query(..., min_length=1, description="Gene symbol, protein name, or accession")):
    """
    Search UniProt database by gene symbol, protein name, or accession ID.
    """
    clean_q = query.strip()
    if not clean_q:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Enter a protein accession or search term."
        )

    try:
        results = uniprot_service.search_proteins(clean_q, limit=5)
        return ProteinSearchResponse(
            query=clean_q,
            total_count=len(results),
            results=results
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Unable to retrieve protein search results right now. Please try again."
        )

@router.get("/proteins/{accession}", response_model=ProteinResponse, summary="Get Protein by Accession")
async def get_protein(accession: str):
    """
    Fetch normalized protein metadata and sequence from UniProt by Accession ID (e.g. P04637).
    """
    clean_acc = accession.strip()
    if not clean_acc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Enter a protein accession or search term."
        )

    try:
        data = uniprot_service.fetch_by_accession(clean_acc)
        return data
    except ProteinNotFoundException:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Protein not found for accession '{clean_acc}'. Check the UniProt accession and try again."
        )
    except UniProtServiceException as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Unable to retrieve protein data right now. Please try again."
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while fetching protein data."
        )
