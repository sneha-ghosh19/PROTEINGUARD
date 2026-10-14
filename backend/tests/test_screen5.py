import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.analysis_service import analysis_service
from app.schemas.report import ResearchReport

client = TestClient(app)

def test_screen5_valid_report_retrieval():
    """Test A: Valid complete analysis loads report with all sections populated."""
    # Ensure analysis exists
    analysis = analysis_service.build_or_retrieve_analysis("P04637", 98, "V")
    assert analysis.analysis_id == "P04637-98-V"

    response = client.get("/api/v1/reports/P04637-98-V")
    assert response.status_code == 200
    data = response.json()

    assert data["report_id"] == "REP-P04637-98-V"
    assert data["analysis_id"] == "P04637-98-V"
    assert data["mutation_validation"]["notation"] == "P98V"
    assert data["mutation_validation"]["original_residue"] == "P"
    assert data["mutation_validation"]["mutant_residue"] == "V"
    assert data["protein_identification"]["protein_accession"] == "P04637"
    assert data["executive_summary"]["protein_name"] == data["protein_identification"]["protein_name"]

    # Verify sections
    assert len(data["physicochemical_report"]["properties"]) > 0
    assert data["conservation_report"]["status"] in ["Available", "Unavailable"]
    assert data["structural_report"]["status"] in ["Available", "Unavailable"]
    assert len(data["evidence_overview"]) == 4
    assert len(data["limitations"]) > 0
    assert len(data["suggested_investigations"]) > 0
    assert len(data["provenance"]) > 0
    assert "ProteinGuard" in data["scientific_disclaimer"]

def test_screen5_generate_or_refresh_report():
    """Test report generation endpoint POST /api/v1/reports/{analysis_id}/generate."""
    payload = {"include_ai_interpretation": True}
    response = client.post("/api/v1/reports/P04637-98-V/generate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["analysis_id"] == "P04637-98-V"
    assert data["mutation_validation"]["notation"] == "P98V"

def test_screen5_pdf_export():
    """Test PDF export endpoint returns valid A4 PDF binary with %PDF- header."""
    response = client.get("/api/v1/reports/P04637-98-V/export/pdf")
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/pdf"
    assert response.content.startswith(b"%PDF-")
    assert len(response.content) > 1000

    # Also test POST variant
    post_res = client.post("/api/v1/reports/P04637-98-V/export/pdf")
    assert post_res.status_code == 200
    assert post_res.content.startswith(b"%PDF-")

def test_screen5_markdown_export():
    """Test Markdown export endpoint returns structured Markdown with expected sections."""
    response = client.get("/api/v1/reports/P04637-98-V/export/markdown")
    assert response.status_code == 200
    md = response.text
    assert "# ProteinGuard Research Report: P98V" in md
    assert "## 1. Executive Summary" in md
    assert "## 3. Physicochemical Property Shifts" in md
    assert "## 7. Independent 4-Pillar Evidence Summary" in md
    assert "## ⚠️ Scientific Disclaimer" in md

def test_screen5_json_export():
    """Test JSON export endpoint returns valid machine-readable JSON matching schema."""
    response = client.get("/api/v1/reports/P04637-98-V/export/json")
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/json"
    data = response.json()
    assert data["analysis_id"] == "P04637-98-V"
    assert data["mutation_validation"]["notation"] == "P98V"
    assert "provenance" in data

def test_screen5_nonexistent_analysis():
    """Test D: Nonexistent analysis ID returns 404."""
    response = client.get("/api/v1/reports/NONEXISTENT-999-Z")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()

def test_screen5_export_consistency():
    """Test F: Verification that PDF, Markdown, JSON, and GET report all share consistent notation & data."""
    rep_res = client.get("/api/v1/reports/P04637-98-V").json()
    json_res = client.get("/api/v1/reports/P04637-98-V/export/json").json()
    md_res = client.get("/api/v1/reports/P04637-98-V/export/markdown").text

    assert rep_res["analysis_id"] == json_res["analysis_id"] == "P04637-98-V"
    assert rep_res["mutation_validation"]["notation"] == json_res["mutation_validation"]["notation"] == "P98V"
    assert "P98V" in md_res
    assert rep_res["protein_identification"]["protein_accession"] == "P04637"
