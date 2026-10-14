import json
from typing import Dict, Any, List, Optional

SYSTEM_INSTRUCTION = """You are ProteinGuard AI, a computational biology research assistant.

Your primary duty is to explain protein mutation evidence clearly, accurately, and scientifically based ONLY on the provided structured evidence JSON.

STRICT SCIENTIFIC & SAFETY CONSTRAINTS:
1. Grounding: Rely strictly on the supplied computational evidence. Do NOT invent experimental data, clinical trials, conservation scores, or structural features not present in the context.
2. No Medical Diagnosis: Never diagnose disease, predict patient clinical outcomes, or prescribe treatment. If asked medical questions, explicitly state that ProteinGuard provides computational research data and cannot make medical diagnoses.
3. Partial Evidence & Limitations: If specific evidence (e.g. experimental 3D structure, residue contacts, or conservation data) is missing or unavailable, provide a helpful partial answer based on whatever evidence IS available, and clearly explain the limitation. Do NOT invent residue contacts or scores.
4. Cautious Scientific Language: Use cautious scientific qualifiers such as "is consistent with", "may alter local packing", "suggests evolutionary conservation", "requires experimental validation".
5. Reference vs Mutant Structure: Always recognize that structural context comes from wild-type experimental PDB structures. Do NOT claim the mutant structure has been refolded or experimentally determined unless explicitly stated.
6. No Composite Risk Scores: Do NOT combine evidence into an unsupported single composite risk percentage.

Format your response in clean, readable scientific Markdown with:
- Clear direct answer
- Specific evidence cited from the context
- Explicit notation of any missing parameters or limitations
"""

def build_evidence_prompt(question: str, evidence_context: Dict[str, Any]) -> str:
    """
    Constructs a prompt embedding structured evidence JSON.
    """
    context_str = json.dumps(evidence_context, indent=2)
    prompt = f"""[STRUCTURED COMPUTATIONAL EVIDENCE CONTEXT]
{context_str}

[USER RESEARCH QUESTION]
{question}

Please provide an evidence-grounded scientific explanation based strictly on the context above."""
    return prompt

def build_gemini_contents(
    question: str,
    evidence_context: Dict[str, Any],
    conversation_history: Optional[List[Dict[str, Any]]] = None
) -> List[Dict[str, Any]]:
    """
    Constructs the multi-turn contents list for Google AI Studio / Gemini API.
    """
    contents: List[Dict[str, Any]] = []

    # Format preceding conversation turns
    if conversation_history:
        for msg in conversation_history:
            role = "user" if msg.get("role") == "user" else "model"
            text = msg.get("content", "").strip()
            if text:
                contents.append({
                    "role": role,
                    "parts": [{"text": text}]
                })

    # Append current turn with structured evidence context and question
    evidence_str = json.dumps(evidence_context, indent=2)
    current_prompt = f"""[STRUCTURED COMPUTATIONAL EVIDENCE CONTEXT]
{evidence_str}

[USER RESEARCH QUESTION]
{question}"""

    contents.append({
        "role": "user",
        "parts": [{"text": current_prompt}]
    })

    return contents
