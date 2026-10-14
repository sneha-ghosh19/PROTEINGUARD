import re
from enum import Enum
from typing import Dict, Any, List, Optional, Tuple

class QuestionCategory(str, Enum):
    RELEVANT = "RELEVANT"
    RELEVANT_WITH_LIMITED_EVIDENCE = "RELEVANT_WITH_LIMITED_EVIDENCE"
    NEEDS_CLARIFICATION = "NEEDS_CLARIFICATION"
    OUT_OF_SCOPE = "OUT_OF_SCOPE"
    SAFETY_RESTRICTED = "SAFETY_RESTRICTED"

class QuestionClassifier:
    """
    Two-stage domain guardrail and question classification engine.
    Ensures that safety policies cannot be overridden by relevance,
    while permitting custom and exploratory scientific questions within scope.
    """

    # 1. High-priority safety patterns (Medical diagnosis, prescription, therapy, biological hazards)
    CLINICAL_DIAGNOSIS_PATTERNS = [
        r"\b(do i have|does the patient have|diagnose|diagnosis|cure|prescribe|prescription|medication|dosage|treatment plan|chemotherapy|drug regimen)\b",
        r"\b(should i take|can i treat|medical advice|clinical outcome for patient|patient prognosis)\b",
        r"\b(definitely cause (a |the )?disease|is this patient going to die)\b"
    ]

    BIOHAZARD_PATTERNS = [
        r"\b(biological weapon|weaponiz|enhance toxicity|synthesize poison|create pathogen|deadly virus transmission|lethal toxin engineering)\b"
    ]

    # 2. Out of scope patterns (entertainment, poetry, trivia, recipes, unrelated coding, general advice)
    OUT_OF_SCOPE_PATTERNS = [
        r"\b(poem|poetry|rhyme|haiku|romantic|love letter|story|fiction|song|rap)\b",
        r"\b(capital of france|capital of|who won the world cup|recipe for|bake a cake|weather in)\b",
        r"\b(write a python script to scrape|javascript react button component|fix my printer|relationship advice)\b",
        r"\b(horoscope|astrology|tell me a joke|riddle)\b"
    ]

    # 3. Ambiguity patterns (needs clarification)
    AMBIGUOUS_PATTERNS = [
        r"^(what about (it|that|this|the other one)\??)$",
        r"^(is it (good|bad|worse)\??)$",
        r"^(which residue\??)$",
        r"^(tell me more\??)$",
        r"^(why\??)$",
        r"^(compare\??)$",
        r"^(what happened\??)$"
    ]

    # 4. Relevant scientific domain patterns
    SCIENTIFIC_PATTERNS = [
        r"\b(mutations?|substitut\w*|missense|nonsense|frameshift|synonymous|variants?|alleles?|[a-zA-Z]\d+[a-zA-Z])\b",
        r"\b(proteins?|residues?|amino acids?|side chains?|peptides?|polypeptides?|domains?|motifs?)\b",
        r"\b(structur\w*|pdb|alphafold|rcsb|conformations?|folds?|packing|secondary structures?|alpha helix|beta sheets?|loops?)\b",
        r"\b(contacts?|nearby|spatial|distance|angstrom|\b\d+(\.\d+)?\s*(a|å|angstroms?)\b|neighbors?|interactions?|hydrogen bonds?|salt bridges?|hydrophobic)\b",
        r"\b(conserv\w*|evolution|entropy|shannon|homologs?|orthologs?|msa|alignments?|phylogen\w*)\b",
        r"\b(stabilit\w*|destabiliz\w*|thermostabilit\w*|delta delta g|ddg|folding|unfolding|denatur\w*)\b",
        r"\b(physicochemical|hydrophobicity|molecular weight|charges?|polarit\w*|isoelectric|volumes?|steric|clash\w*)\b",
        r"\b(mechanisms?|biochemical|functional|active sites?|binding sites?|catalytic|allosteric)\b",
        r"\b(limitations?|uncertaint\w*|missing|gaps?|information|unknown|evidence|experimental validation|in silico|predictions?|confidence|plddt)\b",
        r"\b(literature|pubmed|papers?|stud\w*|citations?|databases?|uniprot)\b",
        r"\b(compare|comparisons?|versus|vs|alternatives?)\b"
    ]

    def classify(
        self,
        question: str,
        evidence: Optional[Dict[str, Any]] = None,
        conversation_history: Optional[List[Dict[str, Any]]] = None
    ) -> Tuple[QuestionCategory, str]:
        """
        Classifies a user question into one of the 5 canonical categories.
        Returns (Category, Reason).
        """
        q = question.strip()
        q_lower = q.lower()

        # Step 1: Check High-Priority Safety Policies
        for pat in self.CLINICAL_DIAGNOSIS_PATTERNS:
            if re.search(pat, q_lower):
                return (
                    QuestionCategory.SAFETY_RESTRICTED,
                    "Question requests clinical diagnosis, medical treatment, or definitive disease outcome."
                )

        for pat in self.BIOHAZARD_PATTERNS:
            if re.search(pat, q_lower):
                return (
                    QuestionCategory.SAFETY_RESTRICTED,
                    "Question involves dangerous biological agent or weapon design."
                )

        # Step 2: Check Out-of-Scope Requests
        for pat in self.OUT_OF_SCOPE_PATTERNS:
            if re.search(pat, q_lower):
                return (
                    QuestionCategory.OUT_OF_SCOPE,
                    "Request is unrelated to molecular biology, protein mutations, or computational biochemistry."
                )

        # Step 3: Check Ambiguity (Needs Clarification)
        # Note: If there is preceding conversation history, a follow-up like "Why?" or "Explain the second mechanism" is NOT ambiguous!
        has_preceding_context = bool(conversation_history and len(conversation_history) > 0)
        is_follow_up_phrase = bool(re.search(r"\b(second|first|third|previous|last|earlier|that mechanism|you mentioned|why is that)\b", q_lower))

        for pat in self.AMBIGUOUS_PATTERNS:
            if re.match(pat, q_lower):
                if not has_preceding_context or (q_lower == "compare?" or q_lower == "which residue?"):
                    return (
                        QuestionCategory.NEEDS_CLARIFICATION,
                        "Question is underspecified or lacks a clear referent or mutation target."
                    )

        # Step 4: Check Limited Evidence Conditions
        # Examples: asking about structural contacts when structure is unavailable;
        # asking for experimental mutant crystal structure when only WT is available;
        # asking for patient-specific diagnostic certainty.
        if evidence:
            struc = evidence.get("structure") or {}
            struc_avail = (
                struc.get("structure_status") == "available"
                or struc.get("status") in ["mapped", "structure_available"]
                or bool(struc.get("pdb_id") and str(struc.get("pdb_id")).upper() not in ["N/A", "NONE", ""])
            )
            struc_mapped = struc.get("mutation_mapping") == "verified" or struc.get("status") == "mapped"
            
            # If asking specifically about 3D coordinates/contacts when structure is unavailable
            asking_for_structure = bool(re.search(r"\b(contact|spatial|3d|structure|pdb|coordinate|pocket|packing)\b", q_lower))
            if asking_for_structure and not struc_avail:
                return (
                    QuestionCategory.RELEVANT_WITH_LIMITED_EVIDENCE,
                    "Question asks about structural contacts, but experimental 3D structure is unavailable for this residue."
                )

            # If asking about mutant refolded crystal structure
            asking_for_mutant_pdb = bool(re.search(r"\b(mutant(\s+\w+)?\s+structure|refolded structure|crystallized mutant|experimental structure of the mutant)\b", q_lower))
            if asking_for_mutant_pdb:
                return (
                    QuestionCategory.RELEVANT_WITH_LIMITED_EVIDENCE,
                    "ProteinGuard operates on wild-type reference coordinates; no experimental mutant crystal structure is resolved."
                )

        # If asking about disease causation without clinical certainty
        if re.search(r"\b(cause a disease|pathogenic|disease association|clinical significance)\b", q_lower):
            return (
                QuestionCategory.RELEVANT_WITH_LIMITED_EVIDENCE,
                "Disease association questions require clinical databases and cannot be established solely by in silico predictions."
            )

        # Step 5: Check Relevance
        for pat in self.SCIENTIFIC_PATTERNS:
            if re.search(pat, q_lower):
                return (
                    QuestionCategory.RELEVANT,
                    "Question pertains to protein mutation analysis, sequence, structure, or biochemistry."
                )

        # If it has preceding context and asks a conversational follow-up
        if has_preceding_context and is_follow_up_phrase:
            return (
                QuestionCategory.RELEVANT,
                "Contextual follow-up question referencing active scientific conversation."
            )

        # Step 6: Fallback Default
        # If none of the scientific patterns match and length is sufficient, examine if it is a general biological question
        general_bio_words = ["gene", "dna", "rna", "cell", "organism", "biolog", "evolution", "homology", "docking", "crystal", "assay", "western", "pcr"]
        if any(w in q_lower for w in general_bio_words):
            return (
                QuestionCategory.RELEVANT,
                "Broad biological or molecular research query."
            )

        # If it doesn't match scientific terms and has general conversational words, classify as OUT_OF_SCOPE
        return (
            QuestionCategory.OUT_OF_SCOPE,
            "Question does not pertain to protein structure, sequence, or mutation analysis."
        )


class ResponsePolicyEngine:
    """
    Applies deterministic policy responses for non-standard categories
    (SAFETY_RESTRICTED, OUT_OF_SCOPE, NEEDS_CLARIFICATION)
    and formats limitations for RELEVANT_WITH_LIMITED_EVIDENCE.
    """

    @staticmethod
    def get_safety_restricted_response(question: str, evidence: Dict[str, Any]) -> Dict[str, Any]:
        mut_info = evidence.get("mutation", {})
        pos = mut_info.get("position", "")
        notation = mut_info.get("notation", "")
        
        return {
            "answer": (
                "### 🛡️ Scientific & Clinical Safety Boundary\n\n"
                "**ProteinGuard is an in silico computational biology research tool and educational platform.** "
                "It evaluates molecular properties, sequence conservation, and wild-type structural environments for hypothesis generation.\n\n"
                "• **No Clinical Diagnoses:** ProteinGuard cannot provide clinical diagnoses, diagnose disease, predict individualized patient clinical outcomes, or prescribe medications.\n"
                "• **Computational Prediction Limits:** Computational stability or conservation shifts are observational indicators and do **not** constitute clinical proof of pathogenicity or disease causation.\n"
                "• **Recommended Action:** For medical inquiries or clinical variant interpretations, consult a board-certified medical geneticist or licensed clinical laboratory with accredited experimental assays (e.g., ACMG/AMP variant classification guidelines)."
            ),
            "evidence_items": [
                {"category": "Safety Policy", "statement": "Strict non-clinical in silico research boundary enforced."}
            ],
            "limitations": [
                "ProteinGuard computational outputs cannot be used for medical diagnosis or clinical treatment.",
                "Clinical pathogenicity requires standardized clinical genetics evaluation and experimental functional assays."
            ],
            "actions": [],
            "grounded": True,
            "provider": "gemma-safety-guard",
            "category": QuestionCategory.SAFETY_RESTRICTED.value,
            "follow_up_suggestions": [
                f"How does {notation or 'this substitution'} affect side-chain physicochemical properties?",
                f"What does the sequence conservation score indicate for position {pos}?",
                "Which wild-type structural contacts surround this position within 6.0 Å?"
            ],
            "sources": ["ProteinGuard Scientific Policy (Research & Educational Use Only)"]
        }

    @staticmethod
    def get_out_of_scope_response(question: str, evidence: Dict[str, Any]) -> Dict[str, Any]:
        mut_info = evidence.get("mutation", {})
        notation = mut_info.get("notation", "the selected mutation")
        pos = mut_info.get("position", "")
        orig = mut_info.get("original", "")
        mut = mut_info.get("mutant", "")

        return {
            "answer": (
                "### ℹ️ Domain Scope Notice\n\n"
                "ProteinGuard's AI Research Assistant is specialized strictly for **protein biochemistry, molecular mutation analysis, and structural biology**.\n\n"
                "The requested topic is outside the scope of this scientific platform. ProteinGuard is designed to analyze:\n"
                "1. **Physicochemical Shifts:** Molecular weight, hydrophobicity, side-chain charge, and steric volume.\n"
                "2. **Sequence Conservation:** Homolog alignments and Shannon entropy constraints.\n"
                "3. **3D Structural Context:** Wild-type spatial contact neighborhoods (<6.0 Å), secondary structure, and solvent accessibility.\n"
                "4. **Comparative Variant Profiling:** In silico comparisons across alternative amino acid substitutions.\n\n"
                "Please ask a question regarding the active protein analysis."
            ),
            "evidence_items": [
                {"category": "Domain Boundary", "statement": "Inquiry outside computational structural biology and mutation analysis."}
            ],
            "limitations": [
                "Assistant only answers questions within protein biochemistry, sequence conservation, and structural biology."
            ],
            "actions": [],
            "grounded": True,
            "provider": "gemma-domain-guard",
            "category": QuestionCategory.OUT_OF_SCOPE.value,
            "follow_up_suggestions": [
                f"How could {notation} alter protein stability?",
                f"What is the evolutionary conservation of residue {orig}{pos}?",
                f"Which structural contacts occur within 6.0 Å of position {pos}?"
            ],
            "sources": []
        }

    @staticmethod
    def get_needs_clarification_response(question: str, evidence: Dict[str, Any]) -> Dict[str, Any]:
        mut_info = evidence.get("mutation", {})
        notation = mut_info.get("notation", "the active variant")
        pos = mut_info.get("position", "")

        return {
            "answer": (
                "### ❓ Clarification Needed\n\n"
                f"Your question about {notation} is brief or ambiguous. To provide an evidence-grounded scientific answer, please clarify:\n\n"
                f"• Are you asking about **physicochemical changes** (e.g. side-chain volume or hydrophobicity)?\n"
                f"• Are you asking about **evolutionary conservation** across homologous sequences?\n"
                f"• Are you asking about **spatial contacts** in the 3D wild-type structure (<6.0 Å)?\n"
                f"• Or would you like to **compare {notation}** with an alternative substitution at position {pos}?"
            ),
            "evidence_items": [
                {"category": "Clarification", "statement": "Specific scientific parameter or comparison needed."}
            ],
            "limitations": [
                "Clarification required to avoid speculative or ambiguous computational interpretation."
            ],
            "actions": [],
            "grounded": True,
            "provider": "gemma-clarification",
            "category": QuestionCategory.NEEDS_CLARIFICATION.value,
            "follow_up_suggestions": [
                f"How could {notation} affect protein stability?",
                f"What does the conservation score mean for position {pos}?",
                f"Which structural contacts are verified around position {pos}?"
            ],
            "sources": []
        }

question_classifier = QuestionClassifier()
response_policy_engine = ResponsePolicyEngine()
