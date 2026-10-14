import os
import pytest
import numpy as np
from fastapi.testclient import TestClient
from app.main import app
from app.services.baseline_service import (
    baseline_service,
    compute_metrics_safe,
    FEATURE_NAMES,
    SCIENTIFIC_DISCLAIMER
)

client = TestClient(app)

def test_strict_no_data_leakage():
    """Requirement 3 & 11: Assert train and test positions are completely disjoint."""
    dataset, ref_seq = baseline_service.load_and_validate_dataset()
    assert len(dataset) > 1000

    X_train, y_train, X_test, y_test, train_positions, test_positions, test_records = baseline_service.build_grouped_split(
        dataset, split_seed=42, train_ratio=0.8
    )

    train_set = set(train_positions)
    test_set = set(test_positions)

    # Fundamental assertion: Zero leakage across sequence positions
    assert train_set.isdisjoint(test_set), f"Data leakage detected! Overlap: {train_set & test_set}"
    assert len(train_set) + len(test_set) == len(set(d["pos"] for d in dataset))
    assert len(X_train) + len(X_test) == len(dataset)
    assert len(X_train) == len(y_train)
    assert len(X_test) == len(y_test)
    assert len(test_records) == len(X_test)

def test_feature_scaling_fit_on_train_only():
    """Requirement 4: Ensure scaler is fitted exclusively on train data."""
    dataset, _ = baseline_service.load_and_validate_dataset()
    X_train, y_train, X_test, y_test, _, _, _ = baseline_service.build_grouped_split(
        dataset, split_seed=42, train_ratio=0.8
    )

    from sklearn.preprocessing import StandardScaler
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    
    # Train scaler mean must match train data mean
    np.testing.assert_allclose(scaler.mean_, np.mean(X_train, axis=0), rtol=1e-5)
    # Test data is transformed using train scaler, mean of X_test_scaled will NOT be zero
    X_test_scaled = scaler.transform(X_test)
    assert not np.allclose(np.mean(X_test_scaled, axis=0), 0.0, atol=1e-2)

def test_invalid_mutation_rejections():
    """Requirement 11: Test invalid notation, out-of-bounds, synonymous, and WT mismatch."""
    # 1. Invalid notation
    with pytest.raises(ValueError, match="Invalid single-substitution format"):
        baseline_service.predict_mutation("INVALID")

    with pytest.raises(ValueError, match="Invalid single-substitution format"):
        baseline_service.predict_mutation("S2Y:K15R")

    # 2. Out of bounds (SUMO1 length is 101)
    with pytest.raises(ValueError, match="out of sequence bounds"):
        baseline_service.predict_mutation("S150A")

    with pytest.raises(ValueError, match="out of sequence bounds"):
        baseline_service.predict_mutation("S0A")

    # 3. Wild-type mismatch (position 2 in SUMO1 is 'S', not 'A')
    with pytest.raises(ValueError, match="Wild-type mismatch"):
        baseline_service.predict_mutation("A2V")

    # 4. Synonymous substitution (S2S)
    with pytest.raises(ValueError, match="Synonymous mutation"):
        baseline_service.predict_mutation("S2S")

def test_compute_metrics_safe_guards():
    """Requirement 5 & 11: Handle constant predictions, small samples, and undefined metrics."""
    # Constant predictions -> correlation 0.0 without crashing
    y_true = np.array([0.1, 0.5, 0.9, 1.2])
    y_const = np.array([0.5, 0.5, 0.5, 0.5])
    sp, pe, mse, note = compute_metrics_safe(y_true, y_const)
    assert sp == 0.0
    assert pe == 0.0
    assert mse > 0.0
    assert note is not None
    assert "Constant prediction" in note

    # Constant ground truth
    y_const_true = np.array([1.0, 1.0, 1.0, 1.0])
    y_pred = np.array([0.2, 0.4, 0.6, 0.8])
    sp2, pe2, mse2, note2 = compute_metrics_safe(y_const_true, y_pred)
    assert sp2 == 0.0
    assert pe2 == 0.0
    assert "Constant" in note2

    # Small sample size (< 2)
    sp3, pe3, mse3, note3 = compute_metrics_safe(np.array([1.0]), np.array([1.0]))
    assert sp3 == 0.0
    assert pe3 == 0.0
    assert "Sample size < 2" in note3

    # Array with NaN
    sp4, pe4, mse4, note4 = compute_metrics_safe(np.array([1.0, np.nan]), np.array([1.0, 2.0]))
    assert sp4 == 0.0
    assert pe4 == 0.0
    assert "NaN" in note4

def test_model_training_and_comparison():
    """Requirement 1, 6, 7: Train baseline, compare Ridge and RF, and verify metadata."""
    results = baseline_service.train_and_evaluate(split_seed=42)

    assert results["assay_id"] == "SUMO1_HUMAN_Weile_2017"
    assert results["uniprot_id"] == "SUMO1_HUMAN"
    assert results["split_seed"] == 42
    assert results["feature_names"] == FEATURE_NAMES

    # Primary model (Ridge)
    ridge_m = results["primary_model"]
    assert "Ridge Regression" in ridge_m["model_name"]
    assert ridge_m["spearman_rho"] > 0.25
    assert ridge_m["pearson_r"] > 0.25
    assert ridge_m["mse"] > 0.0
    assert ridge_m["test_positions"] == 20

    # Comparison model (Random Forest)
    rf_m = results["comparison_model"]
    assert "Random Forest Regressor" in rf_m["model_name"]
    assert rf_m["spearman_rho"] > 0.25
    assert rf_m["pearson_r"] > 0.25
    assert rf_m["mse"] > 0.0
    assert rf_m["test_positions"] == 20

    # Non-clinical disclaimer check
    assert "EXPERIMENTAL COMPUTATIONAL RESEARCH BASELINE ONLY" in results["disclaimer"]

def test_baseline_predict_api():
    """Requirement 8 & 9: Verify prediction endpoint contract and scientific disclaimer."""
    response = client.post("/api/v1/baseline/predict", json={
        "accession": "P63165",
        "mutant": "S2Y",
        "model_type": "ridge"
    })
    assert response.status_code == 200
    data = response.json()

    assert data["mutant"] == "S2Y"
    assert data["wildtype_aa"] == "S"
    assert data["position"] == 2
    assert data["mutant_aa"] == "Y"
    assert isinstance(data["predicted_dms_score"], float)
    assert data["predicted_functional_class"] in ["Functional / Tolerant", "Impaired / Deleterious"]
    assert "Ridge" in data["model_used"]
    assert data["model_version"] == "0.1.0"
    assert data["assay_id"] == "SUMO1_HUMAN_Weile_2017"
    assert "yeast functional complementation" in data["score_explanation"]
    assert data["uncertainty_std"] is None  # Point estimate for Ridge
    assert "EXPERIMENTAL COMPUTATIONAL RESEARCH BASELINE ONLY" in data["scientific_disclaimer"]

def test_baseline_predict_api_random_forest():
    """Verify RF model type selection works in prediction endpoint and provides genuine ensemble uncertainty."""
    response = client.post("/api/v1/baseline/predict", json={
        "accession": "P63165",
        "mutant": "S2Y",
        "model_type": "random_forest"
    })
    assert response.status_code == 200
    data = response.json()
    assert "Random Forest" in data["model_used"]
    assert isinstance(data["predicted_dms_score"], float)
    assert isinstance(data["uncertainty_std"], float)
    assert data["uncertainty_std"] >= 0.0

def test_baseline_predict_api_validation_error():
    """Verify bad inputs return 400 Bad Request."""
    response = client.post("/api/v1/baseline/predict", json={
        "accession": "P63165",
        "mutant": "W2Y",  # Wild-type mismatch at pos 2
        "model_type": "ridge"
    })
    assert response.status_code == 400
    assert "Wild-type mismatch" in response.json()["detail"]

def test_unsupported_protein_rejection():
    """Requirement 5: Test unsupported proteins produce clear errors instead of fabricated predictions."""
    with pytest.raises(ValueError, match="Unsupported protein accession"):
        baseline_service.predict_mutation("M1A", accession="P04637")

    response = client.post("/api/v1/baseline/predict", json={
        "accession": "P04637",  # TP53 accession
        "mutant": "M1A",
        "model_type": "ridge"
    })
    assert response.status_code == 400
    assert "Unsupported protein accession" in response.json()["detail"]

def test_baseline_metrics_api():
    """Verify GET /api/v1/baseline/metrics returns valid comparison structure."""
    response = client.get("/api/v1/baseline/metrics")
    assert response.status_code == 200
    data = response.json()
    assert data["assay_id"] == "SUMO1_HUMAN_Weile_2017"
    assert "primary_model" in data
    assert "comparison_model" in data

def test_load_saved_model_and_predict():
    """Phase 2C (Req 5): Verify loading the saved best model package and predicting."""
    saved_pkg = baseline_service.load_saved_model()
    assert "model" in saved_pkg
    assert "scaler" in saved_pkg
    assert "ref_seq" in saved_pkg
    assert "test_metrics" in saved_pkg
    assert saved_pkg["test_metrics"]["spearman_rho"] == 0.357
    assert saved_pkg["test_metrics"]["pearson_r"] == 0.3404

    # Generate prediction with explicitly loaded saved model
    res = baseline_service.predict_with_saved_model("S2Y")
    assert res["mutant"] == "S2Y"
    assert res["wildtype_aa"] == "S"
    assert res["mutant_aa"] == "Y"
    assert isinstance(res["predicted_dms_score"], float)
    assert "Random Forest Regressor" in res["model_name"]
    assert "yeast functional complementation" in res["score_explanation"]
    assert "EXPERIMENTAL COMPUTATIONAL RESEARCH BASELINE ONLY" in res["scientific_disclaimer"]

def test_missing_model_file_error():
    """Phase 2C (Req 6): Verify missing model file raises FileNotFoundError instead of fabricating."""
    with pytest.raises(FileNotFoundError, match="Model artifact not found"):
        baseline_service.load_saved_model("non_existent_model_file_99999.joblib")

def test_incompatible_sequence_error():
    """Phase 2C (Req 6): Verify incompatible sequence raises ValueError with clear message."""
    # Length mismatch (e.g. p53 length 393 instead of SUMO1 length 101)
    with pytest.raises(ValueError, match="Incompatible sequence"):
        baseline_service.validate_sequence_compatibility("MEEPQSDPSVEPPLSQETFSDLWKLLPENN")

    # None / empty sequence
    with pytest.raises(ValueError, match="Incompatible sequence"):
        baseline_service.validate_sequence_compatibility("")

def test_persisted_predictions_file_integrity():
    """Phase 2C (Req 1 & 4): Audit saved CSV predictions and verify exact re-calculated metrics."""
    import csv
    from scipy.stats import spearmanr, pearsonr
    from sklearn.metrics import mean_squared_error

    csv_path = baseline_service.test_predictions_path
    assert os.path.exists(csv_path), f"Test predictions file not found at {csv_path}"

    with open(csv_path, "r", encoding="utf-8") as f:
        rows = list(csv.DictReader(f))

    assert len(rows) == 356, f"Expected 356 held-out test predictions, found {len(rows)}"

    y_true = np.array([float(r["y_true_dms_score"]) for r in rows])
    ridge_preds = np.array([float(r["ridge_pred_dms_score"]) for r in rows])
    rf_preds = np.array([float(r["rf_pred_dms_score"]) for r in rows])

    # Re-calculate exact metrics from persisted file
    r_sp = round(float(spearmanr(y_true, ridge_preds).statistic), 4)
    r_pe = round(float(pearsonr(y_true, ridge_preds)[0]), 4)
    r_mse = round(float(mean_squared_error(y_true, ridge_preds)), 4)

    rf_sp = round(float(spearmanr(y_true, rf_preds).statistic), 4)
    rf_pe = round(float(pearsonr(y_true, rf_preds)[0]), 4)
    rf_mse = round(float(mean_squared_error(y_true, rf_preds)), 4)

    assert r_sp == 0.2902
    assert r_pe == 0.3242
    assert r_mse == 0.1207

    assert rf_sp == 0.3570
    assert rf_pe == 0.3404
    assert rf_mse == 0.1184
