from fastapi import APIRouter, HTTPException, Query
from app.schemas.baseline import (
    ModelComparison,
    BaselinePredictRequest,
    BaselinePredictResponse
)
from app.services.baseline_service import baseline_service

router = APIRouter()

@router.post("/baseline/train", response_model=ModelComparison, summary="Train and evaluate regression baselines")
async def train_baseline(seed: int = Query(42, description="Random seed for residue-grouped split")):
    """
    Fits preprocessing and trains Ridge Regression and Random Forest Regressor
    on the validated SUMO1 DMS dataset using a residue-position-grouped split.
    """
    try:
        results = baseline_service.train_and_evaluate(split_seed=seed)
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Baseline training failed: {str(e)}")

@router.get("/baseline/metrics", response_model=ModelComparison, summary="Get baseline model evaluation metrics")
async def get_baseline_metrics():
    """
    Retrieves the latest evaluation metrics, model comparison, feature definitions,
    and split statistics on the held-out residue positions.
    """
    try:
        metrics = baseline_service.get_metrics()
        return metrics
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve metrics: {str(e)}")

@router.post("/baseline/predict", response_model=BaselinePredictResponse, summary="Predict DMS score for a mutation")
async def predict_mutation_score(request: BaselinePredictRequest):
    """
    Predicts the experimental DMS score for a single amino-acid substitution in SUMO1
    using the fitted regression baseline. Strictly validates mutation against reference sequence.
    """
    try:
        prediction = baseline_service.predict_mutation(
            mutant=request.mutant,
            accession=request.accession,
            model_type=request.model_type or "ridge"
        )
        return prediction
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")
