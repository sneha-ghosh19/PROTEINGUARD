from fastapi import APIRouter, HTTPException, status
from app.schemas.analysis import (
    FullAnalysisResponse,
    CreateAnalysisRequest,
    CompareMutationsRequest,
    CompareMutationsResponse
)
from app.services.analysis_service import analysis_service
from app.services.uniprot import uniprot_service, ProteinNotFoundException
from app.services.mutation_service import mutation_service, InvalidMutationException
from app.services.conservation import conservation_service
from app.services.structure import structure_service
from app.data.amino_acids import get_amino_acid

router = APIRouter()

@router.post("/analysis/create", response_model=FullAnalysisResponse, summary="Create Validated Analysis Record")
@router.post("/analysis", response_model=FullAnalysisResponse, summary="Create Validated Analysis Record")
def create_analysis(req: CreateAnalysisRequest):
    """
    Validate and construct an end-to-end scientific analysis record for a mutation.
    Returns the complete analysis object including analysis_id, evidence pillars, dynamic pillar count, and data integrity flags.
    """
    try:
        return analysis_service.build_or_retrieve_analysis(
            accession=req.protein_accession,
            position=req.position,
            mutant=req.mutant_residue
        )
    except ProteinNotFoundException as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Protein '{req.protein_accession}' not found in UniProt KB."
        )
    except InvalidMutationException as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Mutation Validation Error: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate analysis: {str(e)}"
        )

@router.get("/analysis/{analysis_id_or_accession}", response_model=FullAnalysisResponse, summary="Get Analysis Record by ID")
def get_analysis_by_id_endpoint(analysis_id_or_accession: str):
    """
    Retrieve an existing analysis record by analysis_id (e.g. 'P04637-98-V' or UUID).
    """
    analysis_obj = analysis_service.get_analysis_by_id(analysis_id_or_accession)
    if not analysis_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Analysis '{analysis_id_or_accession}' not found. Please return to Mutation Lab to initiate a verified analysis."
        )
    return analysis_obj

@router.get("/analysis/{accession}/{position}/{mutant}", response_model=FullAnalysisResponse, summary="Get Full Analysis Evidence Dashboard")
def get_full_analysis(accession: str, position: int, mutant: str):
    """
    Synthesize complete deterministic scientific evidence graph for a validated protein mutation.
    """
    try:
        return analysis_service.build_or_retrieve_analysis(accession, position, mutant)
    except ProteinNotFoundException:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Protein '{accession}' not found."
        )
    except InvalidMutationException as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to load analysis: {str(e)}"
        )

@router.post("/mutations/compare", response_model=CompareMutationsResponse, summary="Compare Two Substitutions at the Same Position")
def compare_mutations(req: CompareMutationsRequest):
    """
    Compare two different substitutions at the same position side by side using verified reference sequence.
    """
    clean_acc = req.protein_accession.strip().upper()
    mut_a = req.mutant_a.strip().upper()
    mut_b = req.mutant_b.strip().upper()

    try:
        protein = uniprot_service.fetch_by_accession(clean_acc)
    except ProteinNotFoundException:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Protein '{clean_acc}' not found."
        )

    sequence = protein["sequence"]
    if not mutation_service.validate_position(sequence, req.position):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Position {req.position} is outside sequence length of {protein['length']}."
        )

    orig_code = mutation_service.get_original_residue(sequence, req.position)
    orig_detail = get_amino_acid(orig_code)

    mutation_a_analysis = mutation_service.analyze_basic_mutation(orig_code, mut_a)
    mutation_b_analysis = mutation_service.analyze_basic_mutation(orig_code, mut_b)

    # Shared position evidence
    try:
        shared_cons = conservation_service.analyze_position_conservation(clean_acc, req.position)
    except Exception:
        shared_cons = None

    try:
        shared_struct = structure_service.analyze_structural_context(clean_acc, req.position)
    except Exception:
        shared_struct = None

    return CompareMutationsResponse(
        protein_accession=clean_acc,
        position=req.position,
        original=orig_detail,
        mutation_a=mutation_a_analysis,
        mutation_b=mutation_b_analysis,
        shared_conservation=shared_cons,
        shared_structure=shared_struct
    )
