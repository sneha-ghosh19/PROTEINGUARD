from fastapi import APIRouter, HTTPException, status
from app.schemas.mutation import (
    MutationValidateRequest, MutationValidateResponse,
    BasicAnalysisRequest, BasicAnalysisResponse,
    PlaygroundRequest, PlaygroundResponse
)
from app.services.uniprot import uniprot_service, ProteinNotFoundException
from app.services.mutation_service import mutation_service, InvalidMutationException
from app.data.amino_acids import get_amino_acid

router = APIRouter()

@router.post("/mutations/validate", response_model=MutationValidateResponse, summary="Validate Mutation Input against Reference Sequence")
async def validate_mutation(req: MutationValidateRequest):
    """
    Validate sequence position, check wildtype residue against UniProt reference sequence, and verify substitution.
    """
    try:
        res = mutation_service.validate_mutation_against_protein(
            accession=req.protein_accession,
            position=req.position,
            mutant_aa=req.mutant_amino_acid
        )
        return MutationValidateResponse(
            valid=True,
            mutation=res["mutation"],
            protein_accession=res["protein_accession"],
            position=res["position"],
            original=res["original"],
            mutant=res["mutant"]
        )
    except ProteinNotFoundException:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Protein '{req.protein_accession}' not found in UniProt."
        )
    except InvalidMutationException as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unable to validate mutation against reference sequence: {str(e)}"
        )

@router.post("/mutations/analyze-basic", response_model=BasicAnalysisResponse, summary="Analyze Basic Physicochemical Change")
async def analyze_basic(req: BasicAnalysisRequest):
    """
    Compare physicochemical properties between wildtype and mutant residue.
    """
    try:
        mutation_service.validate_substitution(req.original, req.mutant)
    except InvalidMutationException as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

    orig_code = req.original.upper()
    mut_code = req.mutant.upper()

    analysis = mutation_service.analyze_basic_mutation(orig_code, mut_code)
    
    return BasicAnalysisResponse(
        mutation=f"{orig_code}->{mut_code}",
        original=analysis["original"],
        mutant=analysis["mutant"],
        property_shifts=analysis["property_shifts"]
    )

@router.post("/mutations/playground", response_model=PlaygroundResponse, summary="Mutation Playground (All 19 Substitutions)")
async def mutation_playground(req: PlaygroundRequest):
    """
    Generate all 19 possible amino acid substitutions at a specific position with pre-evaluated property changes.
    """
    try:
        protein = uniprot_service.fetch_by_accession(req.protein_accession)
    except ProteinNotFoundException:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Protein '{req.protein_accession}' not found."
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Unable to fetch protein data."
        )

    sequence = protein["sequence"]
    if not mutation_service.validate_position(sequence, req.position):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Position {req.position} is outside this protein's sequence length of {protein['length']}."
        )

    orig_code = mutation_service.get_original_residue(sequence, req.position)
    orig_detail = get_amino_acid(orig_code)

    substitutions = mutation_service.generate_playground(orig_code, req.position)

    return PlaygroundResponse(
        protein_accession=protein["accession"],
        position=req.position,
        original=orig_detail,
        substitutions_count=len(substitutions),
        substitutions=substitutions
    )
