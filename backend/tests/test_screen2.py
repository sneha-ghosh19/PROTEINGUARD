import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.data.amino_acids import get_amino_acid, ALL_AMINO_ACID_CODES
from app.services.mutation_service import mutation_service, InvalidMutationException

client = TestClient(app)

def test_amino_acid_data_completeness():
    """Verify all 20 standard amino acids are defined with required properties."""
    assert len(ALL_AMINO_ACID_CODES) == 20
    for code in ALL_AMINO_ACID_CODES:
        aa = get_amino_acid(code)
        assert aa is not None
        assert aa["code"] == code
        assert "molecular_weight" in aa
        assert "charge" in aa
        assert "polarity" in aa
        assert "hydrophobicity" in aa
        assert "side_chain_class" in aa
        assert "volume" in aa

def test_position_validation():
    """Test 1-based position boundary conditions."""
    sequence = "MEEPQSDPSV" # Length 10
    assert mutation_service.validate_position(sequence, 1) is True
    assert mutation_service.validate_position(sequence, 10) is True
    assert mutation_service.validate_position(sequence, 0) is False
    assert mutation_service.validate_position(sequence, 11) is False
    assert mutation_service.validate_position(sequence, -5) is False

def test_original_residue_extraction():
    """Test extracting wildtype amino acid from sequence."""
    sequence = "MEEPQSDPSV"
    assert mutation_service.get_original_residue(sequence, 1) == "M"
    assert mutation_service.get_original_residue(sequence, 5) == "Q"
    assert mutation_service.get_original_residue(sequence, 10) == "V"

    with pytest.raises(InvalidMutationException):
        mutation_service.get_original_residue(sequence, 15)

def test_substitution_validation():
    """Test valid vs same-residue substitution rules."""
    # Valid substitution
    mutation_service.validate_substitution("A", "V")
    
    # Same residue substitution (invalid)
    with pytest.raises(InvalidMutationException) as exc_info:
        mutation_service.validate_substitution("A", "A")
    assert "identical" in str(exc_info.value)

    # Invalid code
    with pytest.raises(InvalidMutationException):
        mutation_service.validate_substitution("A", "Z")

def test_playground_generation():
    """Test that playground generates exactly 19 substitutions."""
    substitutions = mutation_service.generate_playground("A", 98)
    assert len(substitutions) == 19
    mutant_codes = [item["mutant"]["code"] for item in substitutions]
    assert "A" not in mutant_codes
    assert "V" in mutant_codes

def test_api_health():
    """Verify health endpoint."""
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

def test_api_protein_fetch_valid():
    """Verify fetching p53 protein (P04637)."""
    response = client.get("/api/v1/proteins/P04637")
    assert response.status_code == 200
    data = response.json()
    assert data["accession"] == "P04637"
    assert data["gene_name"] == "TP53"
    assert data["length"] == 393
    assert len(data["sequence"]) == 393

def test_api_protein_fetch_invalid():
    """Verify 404 for invalid accession."""
    response = client.get("/api/v1/proteins/INVALIDACCESSIONXYZ999")
    assert response.status_code == 404

def test_api_mutation_validation():
    """Verify POST /api/v1/mutations/validate endpoint."""
    # P04637 residue 98 is Proline ('P')
    response = client.post("/api/v1/mutations/validate", json={
        "protein_accession": "P04637",
        "position": 98,
        "mutant_amino_acid": "V"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["valid"] is True
    assert data["mutation"] == "P98V"
    assert data["original"]["code"] == "P"
    assert data["mutant"]["code"] == "V"

def test_api_mutation_validation_same_residue():
    """Verify error on same residue mutation (P -> P at position 98 of P04637)."""
    response = client.post("/api/v1/mutations/validate", json={
        "protein_accession": "P04637",
        "position": 98,
        "mutant_amino_acid": "P"
    })
    assert response.status_code == 400

def test_api_mutation_validation_invalid_position():
    """Verify error when position > sequence length."""
    response = client.post("/api/v1/mutations/validate", json={
        "protein_accession": "P04637",
        "position": 500,
        "mutant_amino_acid": "V"
    })
    assert response.status_code == 400

def test_api_playground():
    """Verify POST /api/v1/mutations/playground endpoint."""
    response = client.post("/api/v1/mutations/playground", json={
        "protein_accession": "P04637",
        "position": 98
    })
    assert response.status_code == 200
    data = response.json()
    assert data["position"] == 98
    assert data["original"]["code"] == "P"
    assert data["substitutions_count"] == 19
    assert len(data["substitutions"]) == 19
