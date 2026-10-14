from typing import Optional
from fastapi import APIRouter, HTTPException, status, Response
from fastapi.responses import PlainTextResponse
from app.schemas.report import ResearchReport, GenerateReportRequest
from app.services.report_service import report_service, AnalysisNotFoundException

router = APIRouter(prefix="/reports", tags=["Research Reports"])

@router.get("/{analysis_id}", response_model=ResearchReport, summary="Retrieve Mutation Research Report")
async def get_report(analysis_id: str):
    """
    Retrieve or assemble a complete scientific Research Report for an existing analysis ID.
    Grounds all outputs in canonical analysis data and verified databases.
    """
    try:
        return await report_service.get_or_generate_report(analysis_id, include_ai=True)
    except AnalysisNotFoundException as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate report: {str(e)}"
        )

@router.post("/{analysis_id}/generate", response_model=ResearchReport, summary="Generate / Refresh Research Report")
async def generate_report_endpoint(analysis_id: str, payload: Optional[GenerateReportRequest] = None):
    """
    Assemble and cache a new or refreshed research report for an analysis ID.
    Preserves evidence status and attaches full provenance.
    """
    include_ai = payload.include_ai_interpretation if payload else True
    try:
        return await report_service.get_or_generate_report(
            analysis_id,
            include_ai=include_ai,
            force_regenerate=True
        )
    except AnalysisNotFoundException as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to assemble report: {str(e)}"
        )

@router.post("/{analysis_id}/export/pdf", summary="Export Report as PDF")
@router.get("/{analysis_id}/export/pdf", summary="Download Report as PDF")
async def export_pdf_endpoint(analysis_id: str):
    """
    Export the scientific research report as a formatted A4 PDF publication.
    """
    clean_id = analysis_id.strip()
    try:
        pdf_bytes = await report_service.export_pdf(clean_id)
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="proteinguard_report_{clean_id}.pdf"',
                "Content-Type": "application/pdf"
            }
        )
    except AnalysisNotFoundException as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to export PDF: {str(e)}"
        )

@router.get("/{analysis_id}/export/markdown", summary="Export Report as Markdown")
async def export_markdown_endpoint(analysis_id: str):
    """
    Export the scientific research report as structured GitHub-flavored Markdown.
    """
    clean_id = analysis_id.strip()
    try:
        md_content = await report_service.export_markdown(clean_id)
        return PlainTextResponse(
            content=md_content,
            media_type="text/markdown",
            headers={
                "Content-Disposition": f'attachment; filename="proteinguard_report_{clean_id}.md"'
            }
        )
    except AnalysisNotFoundException as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to export Markdown: {str(e)}"
        )

@router.get("/{analysis_id}/export/json", summary="Export Report as Structured JSON")
async def export_json_endpoint(analysis_id: str):
    """
    Export the complete canonical report and provenance as machine-readable JSON.
    """
    clean_id = analysis_id.strip()
    try:
        json_content = await report_service.export_json(clean_id)
        return Response(
            content=json_content,
            media_type="application/json",
            headers={
                "Content-Disposition": f'attachment; filename="proteinguard_report_{clean_id}.json"',
                "Content-Type": "application/json"
            }
        )
    except AnalysisNotFoundException as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to export JSON: {str(e)}"
        )
