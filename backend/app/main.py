from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api import health, config, proteins, mutations, analysis, conservation, structure, ai, reports, baseline

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Explainable Amino-Acid Mutation Analysis Platform API",
    openapi_url="/api/v1/openapi.json",
    docs_url="/api/v1/docs",
    redoc_url="/api/v1/redoc"
)

# CORS configuration
origins = settings.cors_origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers under /api/v1 prefix
app.include_router(health.router, prefix="/api/v1", tags=["Health"])
app.include_router(config.router, prefix="/api/v1", tags=["Configuration"])
app.include_router(proteins.router, prefix="/api/v1", tags=["Proteins"])
app.include_router(mutations.router, prefix="/api/v1", tags=["Mutations"])
app.include_router(analysis.router, prefix="/api/v1", tags=["Analysis Dashboard"])
app.include_router(conservation.router, prefix="/api/v1", tags=["Conservation Engine"])
app.include_router(structure.router, prefix="/api/v1", tags=["Structure Engine"])
app.include_router(ai.router, prefix="/api/v1", tags=["AI Research Assistant"])
app.include_router(reports.router, prefix="/api/v1", tags=["Research Reports"])
app.include_router(baseline.router, prefix="/api/v1", tags=["Baseline Evaluation"])

@app.get("/")
async def root():
    return {
        "message": "Welcome to ProteinGuard API v1",
        "health_check": "/api/v1/health",
        "docs": "/api/v1/docs"
    }
