import pytest
import httpx
from unittest.mock import patch, AsyncMock
from fastapi.testclient import TestClient
from app.main import app
from app.core.config import settings
from app.services.ai.service import ai_service

client = TestClient(app)

MOCK_CANDIDATE_RESPONSE = {
    "candidates": [
        {
            "content": {
                "parts": [
                    {
                        "text": "The A98V substitution replaces Alanine with Valine at position 98 in p53. "
                                "This introduces a +51.4 A3 volume increase into a buried helix, which may cause "
                                "local steric perturbations with adjacent residues."
                    }
                ],
                "role": "model"
            },
            "finishReason": "STOP"
        }
    ]
}

MOCK_EVIDENCE = {
    "protein": {
        "name": "Cellular tumor antigen p53",
        "accession": "P04637",
        "gene": "TP53",
        "organism": "Homo sapiens"
    },
    "mutation": {
        "position": 98,
        "original": "A",
        "mutant": "V",
        "notation": "A98V"
    },
    "physicochemical": {
        "molecular_weight": {"original": 89.09, "mutant": 117.15, "diff": 28.06, "display": "+28.06 Da"},
        "volume": {"original": 88.6, "mutant": 140.0, "diff": 51.4, "change": "increase"},
        "hydrophobicity": {"original": 1.8, "mutant": 4.2, "diff": 2.4, "change": "increase"},
        "charge": {"original": "Neutral", "mutant": "Neutral", "change": "unchanged"}
    },
    "conservation": {
        "classification": "conserved",
        "entropy": 0.42,
        "sequence_count": 47,
        "dominant_residue": "A"
    },
    "structure": {
        "pdb_id": "1TUP",
        "chain_id": "A",
        "mapped_residue_number": 98,
        "secondary_structure": "helix",
        "environment": "buried",
        "relative_solvent_accessibility": 0.12,
        "nearby_residue_count": 8,
        "nearby_residues": [
            {"residue_name": "LEU", "residue_number": 95, "distance": 4.2},
            {"residue_name": "ILE", "residue_number": 102, "distance": 5.1}
        ]
    },
    "limitations": [
        "Structural context relies on wild-type reference PDB coordinates.",
        "No mutant structure was experimentally refolded here."
    ]
}

@pytest.fixture(autouse=True)
def mock_evidence_context():
    """Fast autouse fixture to mock external UniProt / RCSB network fetches."""
    with patch.object(ai_service, "build_evidence_context", new=AsyncMock(return_value=MOCK_EVIDENCE.copy())):
        yield

def test_ai_health():
    """Verify AI health endpoint returns provider, status and model information."""
    response = client.get("/api/v1/ai/health")
    assert response.status_code == 200
    data = response.json()
    assert data["provider"] == "gemma"
    assert "available" in data
    assert "gemma-4" in data["model"]
    assert "mode" in data

def test_ai_explain_missing_api_key(monkeypatch):
    """Verify that a missing API key returns a clear 400 error and no silent fake fallback."""
    monkeypatch.setattr(settings, "GEMINI_API_KEY", None)
    monkeypatch.delenv("GEMINI_API_KEY", raising=False)
    # Also clear provider's instance key
    monkeypatch.setattr(ai_service.provider, "api_key", None)
    
    payload = {
        "accession": "P04637",
        "position": 98,
        "mutant": "V",
        "question": "Why might A98V matter structurally?"
    }
    response = client.post("/api/v1/ai/explain", json=payload)
    assert response.status_code == 400
    detail = response.json().get("detail", "")
    assert "GEMINI_API_KEY" in detail
    assert "not configured" in detail.lower()

def test_ai_explain_api_quota_error(monkeypatch):
    """Verify that a 429 quota exhausted error from Google AI Studio is surfaced properly."""
    monkeypatch.setattr(settings, "GEMINI_API_KEY", "test-key-mock")
    monkeypatch.setattr(ai_service.provider, "api_key", "test-key-mock")
    
    mock_resp = httpx.Response(
        status_code=429,
        json={"error": {"code": 429, "message": "Resource exhausted: quota exceeded", "status": "RESOURCE_EXHAUSTED"}},
        request=httpx.Request("POST", "https://generativelanguage.googleapis.com")
    )

    with patch.object(httpx.AsyncClient, "post", new=AsyncMock(return_value=mock_resp)):
        payload = {
            "accession": "P04637",
            "position": 98,
            "mutant": "V",
            "question": "Why might A98V matter structurally?"
        }
        response = client.post("/api/v1/ai/explain", json=payload)
        assert response.status_code == 429
        assert "quota" in response.json().get("detail", "").lower()

def test_ai_explain_api_unauthorized_error(monkeypatch):
    """Verify that a 401 unauthorized error is surfaced cleanly."""
    monkeypatch.setattr(settings, "GEMINI_API_KEY", "invalid-key")
    monkeypatch.setattr(ai_service.provider, "api_key", "invalid-key")
    
    mock_resp = httpx.Response(
        status_code=401,
        json={"error": {"code": 401, "message": "API key not valid", "status": "UNAUTHENTICATED"}},
        request=httpx.Request("POST", "https://generativelanguage.googleapis.com")
    )

    with patch.object(httpx.AsyncClient, "post", new=AsyncMock(return_value=mock_resp)):
        payload = {
            "accession": "P04637",
            "position": 98,
            "mutant": "V",
            "question": "Why might A98V matter structurally?"
        }
        response = client.post("/api/v1/ai/explain", json=payload)
        assert response.status_code == 401
        assert "authentication failed" in response.json().get("detail", "").lower()

def test_ai_explain_successful_generation_with_history(monkeypatch):
    """Verify successful generation with conversation history and evidence grounding."""
    monkeypatch.setattr(settings, "GEMINI_API_KEY", "test-valid-key")
    monkeypatch.setattr(ai_service.provider, "api_key", "test-valid-key")
    
    mock_resp = httpx.Response(
        status_code=200,
        json=MOCK_CANDIDATE_RESPONSE,
        request=httpx.Request("POST", "https://generativelanguage.googleapis.com")
    )

    with patch.object(httpx.AsyncClient, "post", new=AsyncMock(return_value=mock_resp)):
        payload = {
            "accession": "P04637",
            "position": 98,
            "mutant": "V",
            "question": "How does this substitution affect stability?",
            "conversation_history": [
                {"role": "user", "content": "What is the wild-type residue at position 98?"},
                {"role": "assistant", "content": "The wild-type residue is Alanine (A)."}
            ]
        }
        response = client.post("/api/v1/ai/explain", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "A98V substitution replaces Alanine with Valine" in data["answer"]
        assert data["grounded"] is True
        assert len(data["evidence_items"]) > 0
        assert len(data["limitations"]) > 0
        assert len(data["actions"]) > 0
        assert data["category"] == "RELEVANT"
        assert "google-ai-studio:gemma-4" in data["provider"]

def test_ai_explain_suggested_question_1_structural_impact(monkeypatch):
    """Suggested Q1: Structural effect inquiry."""
    monkeypatch.setattr(settings, "GEMINI_API_KEY", "test-valid-key")
    monkeypatch.setattr(ai_service.provider, "api_key", "test-valid-key")
    mock_resp = httpx.Response(
        status_code=200,
        json=MOCK_CANDIDATE_RESPONSE,
        request=httpx.Request("POST", "https://generativelanguage.googleapis.com")
    )

    with patch.object(httpx.AsyncClient, "post", new=AsyncMock(return_value=mock_resp)):
        payload = {
            "accession": "P04637",
            "position": 98,
            "mutant": "V",
            "question": "Why might A98V matter structurally?"
        }
        response = client.post("/api/v1/ai/explain", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert any(act["type"] == "focus_residue" for act in data["actions"])
        assert data["category"] == "RELEVANT"

def test_ai_explain_suggested_question_2_conservation(monkeypatch):
    """Suggested Q2: Conservation & Shannon entropy inquiry."""
    monkeypatch.setattr(settings, "GEMINI_API_KEY", "test-valid-key")
    monkeypatch.setattr(ai_service.provider, "api_key", "test-valid-key")
    mock_resp = httpx.Response(
        status_code=200,
        json=MOCK_CANDIDATE_RESPONSE,
        request=httpx.Request("POST", "https://generativelanguage.googleapis.com")
    )

    with patch.object(httpx.AsyncClient, "post", new=AsyncMock(return_value=mock_resp)):
        payload = {
            "accession": "P04637",
            "position": 98,
            "mutant": "V",
            "question": "What does the evolutionary conservation score indicate for position 98?"
        }
        response = client.post("/api/v1/ai/explain", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert any(item["category"] == "Conservation" for item in data["evidence_items"])

def test_ai_explain_suggested_question_3_nearby_residues(monkeypatch):
    """Suggested Q3: 6.0 Angstrom spatial contact neighborhood inquiry."""
    monkeypatch.setattr(settings, "GEMINI_API_KEY", "test-valid-key")
    monkeypatch.setattr(ai_service.provider, "api_key", "test-valid-key")
    mock_resp = httpx.Response(
        status_code=200,
        json=MOCK_CANDIDATE_RESPONSE,
        request=httpx.Request("POST", "https://generativelanguage.googleapis.com")
    )

    with patch.object(httpx.AsyncClient, "post", new=AsyncMock(return_value=mock_resp)):
        payload = {
            "accession": "P04637",
            "position": 98,
            "mutant": "V",
            "question": "Which nearby residues could interact with position 98 within 6.0 Angstroms?"
        }
        response = client.post("/api/v1/ai/explain", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert any(act["type"] == "show_contacts" for act in data["actions"])

def test_ai_explain_suggested_question_4_physicochemical(monkeypatch):
    """Suggested Q4: Physicochemical properties & shifts."""
    monkeypatch.setattr(settings, "GEMINI_API_KEY", "test-valid-key")
    monkeypatch.setattr(ai_service.provider, "api_key", "test-valid-key")
    mock_resp = httpx.Response(
        status_code=200,
        json=MOCK_CANDIDATE_RESPONSE,
        request=httpx.Request("POST", "https://generativelanguage.googleapis.com")
    )

    with patch.object(httpx.AsyncClient, "post", new=AsyncMock(return_value=mock_resp)):
        payload = {
            "accession": "P04637",
            "position": 98,
            "mutant": "V",
            "question": "How does A98V affect side-chain physicochemical properties and hydrophobicity?"
        }
        response = client.post("/api/v1/ai/explain", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert any(item["category"] == "Physicochemical" for item in data["evidence_items"])

def test_ai_explain_suggested_question_5_limitations(monkeypatch):
    """Suggested Q5: Missing information and scientific boundaries."""
    monkeypatch.setattr(settings, "GEMINI_API_KEY", "test-valid-key")
    monkeypatch.setattr(ai_service.provider, "api_key", "test-valid-key")
    mock_resp = httpx.Response(
        status_code=200,
        json=MOCK_CANDIDATE_RESPONSE,
        request=httpx.Request("POST", "https://generativelanguage.googleapis.com")
    )

    with patch.object(httpx.AsyncClient, "post", new=AsyncMock(return_value=mock_resp)):
        payload = {
            "accession": "P04637",
            "position": 98,
            "mutant": "V",
            "question": "What are the scientific limitations and missing experimental assays for A98V?"
        }
        response = client.post("/api/v1/ai/explain", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert len(data["limitations"]) >= 2

def test_ai_explain_custom_question_limited_evidence(monkeypatch):
    """Custom scientific question where evidence is limited (e.g. asking for mutant crystal structure)."""
    monkeypatch.setattr(settings, "GEMINI_API_KEY", "test-valid-key")
    monkeypatch.setattr(ai_service.provider, "api_key", "test-valid-key")
    mock_resp = httpx.Response(
        status_code=200,
        json={
            "candidates": [
                {
                    "content": {
                        "parts": [
                            {
                                "text": "ProteinGuard utilizes wild-type reference coordinates (PDB 1TUP). "
                                        "No experimental crystal structure of the mutant A98V has been resolved."
                            }
                        ]
                    }
                }
            ]
        },
        request=httpx.Request("POST", "https://generativelanguage.googleapis.com")
    )

    with patch.object(httpx.AsyncClient, "post", new=AsyncMock(return_value=mock_resp)):
        payload = {
            "accession": "P04637",
            "position": 98,
            "mutant": "V",
            "question": "Can I view the experimental mutant crystal structure of A98V?"
        }
        response = client.post("/api/v1/ai/explain", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["category"] == "RELEVANT_WITH_LIMITED_EVIDENCE"
        assert any("wild-type" in lim.lower() or "mutant" in lim.lower() for lim in data["limitations"])

def test_ai_explain_unrelated_out_of_scope():
    """Unrelated request outside structural biology is intercepted by domain guardrail."""
    payload = {
        "accession": "P04637",
        "position": 98,
        "mutant": "V",
        "question": "Write a poem about the Eiffel Tower and Paris."
    }
    response = client.post("/api/v1/ai/explain", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["category"] == "OUT_OF_SCOPE"
    assert "outside the scope" in data["answer"].lower() or "domain scope notice" in data["answer"].lower()

def test_ai_explain_safety_filter():
    """Safety restricted medical advice/prescription query is intercepted by clinical guardrail."""
    payload = {
        "accession": "P04637",
        "position": 98,
        "mutant": "V",
        "question": "Does this mutation cause cancer and what chemotherapy should I prescribe to cure the patient?"
    }
    response = client.post("/api/v1/ai/explain", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["category"] == "SAFETY_RESTRICTED"
    assert "cannot provide clinical diagnoses" in data["answer"].lower() or "research tool" in data["answer"].lower()
    assert data["provider"] == "gemma-safety-guard"

def test_ai_report_generation():
    """Verify structured mutation analysis research report generation."""
    payload = {
        "accession": "P04637",
        "position": 98,
        "mutant": "V",
        "include_ai_interpretation": True
    }
    response = client.post("/api/v1/ai/report", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "title" in data
    assert data["protein_accession"] == "P04637"
    assert "physicochemical_summary" in data
    assert "conservation_summary" in data
    assert "structural_summary" in data
    assert "ai_interpretation" in data
    assert len(data["limitations"]) > 0
