from fastapi import APIRouter
from app.schemas.common import ConfigResponse, ConfigFeatures
from app.core.config import settings

router = APIRouter()

@router.get("/config", response_model=ConfigResponse, summary="Public Configuration")
async def get_config():
    """
    Exposes safe public configuration and feature flag statuses.
    """
    return ConfigResponse(
        project_name=settings.PROJECT_NAME,
        version=settings.VERSION,
        github_url=settings.GITHUB_URL,
        features=ConfigFeatures(
            mutation_analysis=settings.FEATURE_FLAGS.get("mutation_analysis", False),
            structure_visualization=settings.FEATURE_FLAGS.get("structure_visualization", False),
            gemma_explanation=settings.FEATURE_FLAGS.get("gemma_explanation", False)
        )
    )
