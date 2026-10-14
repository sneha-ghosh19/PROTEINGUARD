from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field

class BaselineMetrics(BaseModel):
    model_name: str
    spearman_rho: float
    pearson_r: float
    mse: float
    train_samples: int
    test_samples: int
    train_positions: int
    test_positions: int
    notes: Optional[str] = None

class ModelComparison(BaseModel):
    assay_id: str
    dataset_filename: str
    uniprot_id: str
    target_sequence_length: int
    split_seed: int
    train_positions_count: int
    test_positions_count: int
    feature_names: List[str]
    primary_model: BaselineMetrics
    comparison_model: BaselineMetrics
    summary: str
    disclaimer: str

class BaselinePredictRequest(BaseModel):
    accession: str = Field(default="P63165", description="UniProt accession (e.g. P63165 for SUMO1)")
    mutant: str = Field(..., description="Single-substitution notation, e.g. S2Y")
    model_type: Optional[str] = Field(default="ridge", description="'ridge' (primary baseline) or 'random_forest'")

class BaselinePredictResponse(BaseModel):
    accession: str
    mutant: str
    wildtype_aa: str
    position: int
    mutant_aa: str
    predicted_dms_score: float
    predicted_functional_class: str
    score_explanation: str
    model_used: str
    model_version: str = "0.1.0"
    assay_id: str
    uncertainty_std: Optional[float] = None
    provenance: Dict[str, Any]
    scientific_disclaimer: str
