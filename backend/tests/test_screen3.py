import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.alignment import calculate_shannon_entropy, classify_conservation
from app.services.conservation import conservation_service
from app.services.structure import structure_service

client = TestClient(app)

def test_shannon_entropy_calculation():
    """Verify Shannon entropy calculation H = -sum(p * log2 p)."""
    # Column with 100% identical residue -> H = 0.0
    col_identical = ["A", "A", "A", "A", "A"]
    entropy, freqs = calculate_shannon_entropy(col_identical)
    assert entropy == 0.0
    assert freqs["A"] == 100.0
    assert classify_conservation(entropy) == "Highly conserved"

    # Column with 50% A and 50% V -> H = - (0.5*log2(0.5) + 0.5*log2(0.5)) = 1.0
    col_mixed = ["A", "A", "V", "V"]
    entropy_mix, freqs_mix = calculate_shannon_entropy(col_mixed)
    assert round(entropy_mix, 1) == 1.0
    assert classify_conservation(entropy_mix) == "Moderately conserved"

def test_conservation_service_analysis():
    """Verify conservation service logic for p53 (P04637) position 98."""
    result = conservation_service.analyze_position_conservation("P04637", 98)
    assert result["protein_accession"] == "P04637"
    assert result["position"] == 98
    assert "entropy" in result
    assert "classification" in result
    assert "residue_frequencies" in result
    assert len(result["aligned_samples"]) > 0

def test_structure_service_analysis():
    """Verify structural context analysis for p53 (P04637) position 98."""
    result = structure_service.analyze_structural_context("P04637", 98)
    assert result["protein_accession"] == "P04637"
    assert result["position"] == 98
    assert result["status"] == "mapped"
    assert result["pdb_id"] in ["3D06", "1TUP"]
    assert "secondary_structure" in result
    assert "environment" in result
    assert len(result["nearby_residues"]) > 0
    # Check that nearby residues are sorted by distance ascending
    distances = [r["distance_angstroms"] for r in result["nearby_residues"]]
    assert distances == sorted(distances)

def test_api_full_analysis():
    """Verify GET /api/v1/analysis/{accession}/{position}/{mutant} endpoint."""
    response = client.get("/api/v1/analysis/P04637/98/V")
    assert response.status_code == 200
    data = response.json()
    assert data["protein"]["accession"] == "P04637"
    assert data["mutation"]["notation"] == "P98V"
    assert "physicochemical_evidence" in data
    assert "conservation_evidence" in data
    assert "structural_evidence" in data
    assert len(data["limitations"]) > 0
    assert data["ai_explanation"] is None

def test_api_mutation_comparison():
    """Verify POST /api/v1/mutations/compare endpoint for P98V vs P98D."""
    response = client.post("/api/v1/mutations/compare", json={
        "protein_accession": "P04637",
        "position": 98,
        "mutant_a": "V",
        "mutant_b": "D"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["protein_accession"] == "P04637"
    assert data["position"] == 98
    assert data["mutation_a"]["mutation"] == "P->V"
    assert data["mutation_b"]["mutation"] == "P->D"
    assert data["shared_conservation"] is not None
    assert data["shared_structure"] is not None
