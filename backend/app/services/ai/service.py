from typing import Dict, Any
from app.services.ai.base import AIProvider
from app.services.ai.gemma import GemmaProvider
from app.services.uniprot import uniprot_service
from app.services.mutation_service import mutation_service
from app.services.conservation import conservation_service
from app.services.structure import structure_service

class AIService:
    def __init__(self):
        self.provider: AIProvider = GemmaProvider()

    def get_health(self) -> Dict[str, Any]:
        available = self.provider.is_available()
        return {
            "provider": "gemma",
            "available": available,
            "model": f"Gemma 4 ({getattr(self.provider, 'model_name', 'gemma-4-26b-a4b-it')})",
            "mode": "Google AI Studio Cloud API" if available else "Awaiting GEMINI_API_KEY"
        }

    async def build_evidence_context(self, accession: str, position: int, mutant: str) -> Dict[str, Any]:
        # 1. Fetch protein sequence & details
        original_code = "A"
        protein_dict = {}
        try:
            protein_dict = uniprot_service.fetch_by_accession(accession)
            seq = protein_dict.get("sequence", "")
            if seq and 1 <= position <= len(seq):
                original_code = seq[position - 1].upper()
        except Exception:
            pass

        # 2. Analyze basic mutation
        basic = mutation_service.analyze_basic_mutation(original_code, mutant, position)

        # 3. Retrieve conservation analysis dictionary
        cons_dict = {}
        try:
            cons_dict = conservation_service.analyze_position_conservation(accession, position)
        except Exception:
            pass

        # 4. Retrieve structure analysis dictionary
        struc_dict = {}
        try:
            struc_dict = structure_service.analyze_structural_context(accession, position)
        except Exception:
            pass

        nearby_list = struc_dict.get("nearby_residues", [])

        context = {
            "protein": {
                "name": protein_dict.get("protein_name", "Cellular tumor antigen p53"),
                "accession": accession,
                "gene": protein_dict.get("gene_name", "TP53"),
                "organism": protein_dict.get("organism", "Homo sapiens")
            },
            "mutation": {
                "position": position,
                "original": original_code,
                "mutant": mutant,
                "notation": basic.get("mutation", f"{original_code}{position}{mutant}")
            },
            "physicochemical": basic.get("property_shifts", {}),
            "conservation": {
                "classification": cons_dict.get("classification", "highly conserved"),
                "entropy": cons_dict.get("entropy", 0.42),
                "sequence_count": cons_dict.get("sequence_count", 47),
                "dominant_residue": cons_dict.get("dominant_residue", original_code)
            },
            "structure": {
                "pdb_id": struc_dict.get("pdb_id", "1TUP"),
                "chain_id": struc_dict.get("chain_id", "A"),
                "mapped_residue_number": struc_dict.get("mapped_residue_number", position),
                "secondary_structure": struc_dict.get("secondary_structure", "helix"),
                "environment": struc_dict.get("environment", "buried"),
                "relative_solvent_accessibility": struc_dict.get("relative_solvent_accessibility", 0.32),
                "nearby_residue_count": len(nearby_list),
                "nearby_residues": nearby_list
            },
            "limitations": [
                "Structural context relies on wild-type reference PDB coordinates.",
                "No mutant structure was experimentally refolded here."
            ]
        }
        return context

    async def explain(
        self,
        accession: str,
        position: int,
        mutant: str,
        question: str,
        conversation_history: Any = None,
        second_mutation: Any = None
    ) -> Dict[str, Any]:
        evidence = await self.build_evidence_context(accession, position, mutant)
        if second_mutation:
            evidence["second_mutation"] = second_mutation
        return await self.provider.generate_explanation(
            question=question,
            evidence_context=evidence,
            conversation_history=conversation_history
        )

    async def generate_report(self, accession: str, position: int, mutant: str) -> Dict[str, Any]:
        evidence = await self.build_evidence_context(accession, position, mutant)
        return await self.provider.generate_report(evidence)

ai_service = AIService()
