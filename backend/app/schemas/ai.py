from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class ConversationMessage(BaseModel):
    role: str = Field(..., description="'user' or 'assistant'")
    content: str = Field(..., description="Message text content")

class AIExplainRequest(BaseModel):
    accession: str = Field(..., description="UniProt accession ID")
    position: int = Field(..., description="Residue position (1-indexed)")
    mutant: str = Field(..., description="Single-letter mutant code")
    question: str = Field(..., description="User research question")
    analysis_id: Optional[str] = Field(None, description="Canonical analysis identifier if available")
    conversation_history: Optional[List[ConversationMessage]] = Field(default=[], description="Preceding active conversation messages")
    second_mutation: Optional[str] = Field(None, description="Optional second mutation for comparison (e.g. 'A98T' or 'V')")

class AIAction(BaseModel):
    type: str = Field(..., description="Action type: highlight_residues, focus_residue, reset_view, show_contacts")
    residues: Optional[List[Dict[str, Any]]] = None
    target_position: Optional[int] = None

class AIEvidenceItem(BaseModel):
    category: str
    statement: str

class AIExplainResponse(BaseModel):
    answer: str
    evidence_items: List[AIEvidenceItem] = []
    limitations: List[str] = []
    actions: List[AIAction] = []
    grounded: bool = True
    provider: str = "gemma"
    category: str = Field(default="RELEVANT", description="Question classification category")
    follow_up_suggestions: List[str] = []
    sources: List[str] = []
    diagnostic_metadata: Optional[Dict[str, Any]] = None

class AIReportRequest(BaseModel):
    accession: str
    position: int
    mutant: str
    include_ai_interpretation: bool = True

class AIReportResponse(BaseModel):
    title: str
    analysis_date: str
    protein_accession: str
    mutation_notation: str
    overview: str
    physicochemical_summary: str
    conservation_summary: str
    structural_summary: str
    ai_interpretation: Optional[str] = None
    limitations: List[str]
