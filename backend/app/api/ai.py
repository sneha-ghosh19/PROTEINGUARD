from fastapi import APIRouter, HTTPException, status
from app.schemas.ai import (
    AIExplainRequest,
    AIExplainResponse,
    AIReportRequest,
    AIReportResponse
)
from app.services.ai.service import ai_service

router = APIRouter(prefix="/ai", tags=["AI Research Assistant"])

@router.get("/health", status_code=status.HTTP_200_OK)
def get_ai_health():
    """
    Check Gemma 4 AI Assistant health and availability status.
    """
    return ai_service.get_health()

@router.post("/explain", response_model=AIExplainResponse, status_code=status.HTTP_200_OK)
async def explain_mutation(payload: AIExplainRequest):
    """
    Generate an evidence-grounded scientific explanation and 3D viewer actions for a user question.
    """
    try:
        conv_hist = [m.model_dump() for m in payload.conversation_history] if payload.conversation_history else None
        res = await ai_service.explain(
            accession=payload.accession,
            position=payload.position,
            mutant=payload.mutant,
            question=payload.question,
            conversation_history=conv_hist,
            second_mutation=payload.second_mutation
        )
        return res
    except PermissionError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e)
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except LookupError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except TimeoutError as e:
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail=str(e)
        )
    except Exception as e:
        err_msg = str(e)
        if "quota" in err_msg.lower() or "rate limit" in err_msg.lower():
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=err_msg
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate AI explanation: {err_msg}"
        )

@router.post("/report", response_model=AIReportResponse, status_code=status.HTTP_200_OK)
async def generate_report(payload: AIReportRequest):
    """
    Generate a complete evidence-grounded scientific mutation analysis report.
    """
    try:
        res = await ai_service.generate_report(
            accession=payload.accession,
            position=payload.position,
            mutant=payload.mutant
        )
        return res
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate research report: {str(e)}"
        )
