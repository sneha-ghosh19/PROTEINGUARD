from fastapi import APIRouter
from app.schemas.common import HealthResponse
from app.core.config import settings

router = APIRouter()

@router.get("/health", response_model=HealthResponse, summary="Health Check")
async def get_health():
    """
    Returns API health status, service identifier, and version.
    """
    return HealthResponse(
        status="ok",
        service="ProteinGuard API",
        version=settings.VERSION
    )
