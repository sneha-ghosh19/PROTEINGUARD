import datetime
from typing import Dict, Optional, Any
from app.services.uniprot import uniprot_service, ProteinNotFoundException
from app.services.mutation_service import mutation_service, InvalidMutationException
from app.services.conservation import conservation_service
from app.services.structure import structure_service
from app.data.amino_acids import get_amino_acid
from app.schemas.analysis import FullAnalysisResponse, DataIntegrityFlags, DataProvenanceItem

# In-memory storage for analysis records
ANALYSIS_STORE: Dict[str, FullAnalysisResponse] = {}

class AnalysisService:
    """
    Central orchestration service for ProteinGuard analysis objects.
    Validates mutations against live UniProt reference sequences, compiles all 4 evidence pillars,
    calculates dynamic pillar counts, and manages data provenance.
    """

    def generate_analysis_id(self, accession: str, position: int, mutant: str) -> str:
        clean_acc = accession.strip().upper()
        clean_mut = mutant.strip().upper()
        return f"{clean_acc}-{position}-{clean_mut}"

    def build_or_retrieve_analysis(self, accession: str, position: int, mutant: str) -> FullAnalysisResponse:
        analysis_id = self.generate_analysis_id(accession, position, mutant)
        if analysis_id in ANALYSIS_STORE:
            return ANALYSIS_STORE[analysis_id]

        clean_acc = accession.strip().upper()
        clean_mut = mutant.strip().upper()
        now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()

        # 1. Retrieve verified protein sequence
        protein = uniprot_service.fetch_by_accession(clean_acc)
        sequence = protein["sequence"]

        # 2. Validate position within reference sequence
        if not mutation_service.validate_position(sequence, position):
            raise InvalidMutationException(
                f"Position {position} is outside reference sequence length of {protein['length']}."
            )

        # 3. Extract verified reference amino acid from sequence
        orig_code = mutation_service.get_original_residue(sequence, position)

        # 4. Validate substitution
        mutation_service.validate_substitution(orig_code, clean_mut)

        notation = f"{orig_code}{position}{clean_mut}"

        # 5. Pillar 1: Physicochemical Analysis
        physico = mutation_service.analyze_basic_mutation(orig_code, clean_mut)

        # 6. Pillar 2: Sequence Conservation Analysis
        try:
            cons = conservation_service.analyze_position_conservation(clean_acc, position)
        except Exception:
            cons = None

        # 7. Pillar 3 & 4: Structural Context & Spatial Environment
        try:
            struct = structure_service.analyze_structural_context(clean_acc, position)
        except Exception:
            struct = None

        # Determine dynamic pillar count (1 to 4)
        pillar_count = 0
        if physico is not None:
            pillar_count += 1
        if cons is not None and getattr(cons, 'status', '') == 'success':
            pillar_count += 1
        if struct is not None and getattr(struct, 'status', '') in ['success', 'mapped']:
            pillar_count += 1
        if struct is not None and getattr(struct, 'nearby_residues', None) and len(struct.nearby_residues) > 0:
            pillar_count += 1

        structure_mapped = bool(struct and getattr(struct, 'status', '') in ['success', 'mapped'])

        # Data integrity flags
        integrity = DataIntegrityFlags(
            protein_verified=True,
            sequence_verified=True,
            position_verified=True,
            reference_residue_verified=True,
            mutation_notation_validated=True,
            structure_mapped=structure_mapped
        )

        # Provenance records
        provenance = [
            DataProvenanceItem(
                source="UniProt KB",
                identifier=clean_acc,
                retrieved_at=now_iso,
                verified=True,
                method="Dynamic HTTP API query for canonical sequence",
                status="VERIFIED"
            ),
            DataProvenanceItem(
                source="Reference Sequence Verification",
                identifier=f"{clean_acc}:pos_{position}",
                retrieved_at=now_iso,
                verified=True,
                method=f"Confirmed position {position} residue == '{orig_code}'",
                status="VERIFIED"
            ),
            DataProvenanceItem(
                source="Physicochemical Property Matrix",
                identifier=notation,
                retrieved_at=now_iso,
                verified=True,
                method="Kyte-Doolittle & IUPAC property delta calculation",
                status="CALCULATED"
            )
        ]

        if cons and getattr(cons, 'status', '') == 'success':
            provenance.append(
                DataProvenanceItem(
                    source="EBI Clustal Omega / Alignment",
                    identifier=f"{clean_acc}_align",
                    retrieved_at=now_iso,
                    verified=True,
                    method=f"Shannon entropy calculation across {cons.sequence_count} sequences",
                    status="CALCULATED"
                )
            )

        if struct and getattr(struct, 'pdb_id', None):
            provenance.append(
                DataProvenanceItem(
                    source="RCSB PDB",
                    identifier=struct.pdb_id,
                    retrieved_at=now_iso,
                    verified=structure_mapped,
                    method=f"3D coordinate mapping for Chain {struct.chain_id}",
                    status="VERIFIED" if structure_mapped else "UNVERIFIED"
                )
            )

        limitations = [
            "Conservation estimates depend on the selected homologous sequence set and alignment depth.",
            "Structural context is derived from reference wildtype experimental PDB structures. The mutated residue side-chain has not been refolded or energy-minimized.",
            "Physicochemical property shifts describe molecular changes but do not by themselves establish clinical pathogenicity or functional loss.",
            "ProteinGuard is intended strictly for research and educational exploration and does not provide medical diagnosis or treatment advice."
        ]

        analysis_obj = FullAnalysisResponse(
            analysis_id=analysis_id,
            status="completed" if pillar_count >= 3 else "partial",
            protein=protein,
            mutation={
                "position": position,
                "original": orig_code,
                "mutant": clean_mut,
                "notation": notation,
                "original_name": get_amino_acid(orig_code)["name"],
                "mutant_name": get_amino_acid(clean_mut)["name"],
                "verified": True,
                "provenance": {
                    "source": "UniProt Reference Sequence",
                    "identifier": clean_acc,
                    "retrieved_at": now_iso,
                    "verified": True,
                    "method": f"Validated residue {orig_code} at index {position}",
                    "status": "VERIFIED"
                }
            },
            data_integrity=integrity,
            available_pillars_count=max(1, pillar_count),
            physicochemical_evidence=physico,
            conservation_evidence=cons,
            structural_evidence=struct,
            provenance=provenance,
            limitations=limitations,
            ai_explanation=None
        )

        ANALYSIS_STORE[analysis_id] = analysis_obj
        return analysis_obj

    def get_analysis_by_id(self, analysis_id: str) -> Optional[FullAnalysisResponse]:
        clean_id = analysis_id.strip()
        if clean_id in ANALYSIS_STORE:
            return ANALYSIS_STORE[clean_id]

        # Fallback: parse analysis_id formatted as ACCESSION-POS-MUTANT (e.g. P04637-98-V)
        parts = clean_id.split("-")
        if len(parts) == 3 and parts[1].isdigit():
            acc, pos_str, mut = parts[0], parts[1], parts[2]
            try:
                return self.build_or_retrieve_analysis(acc, int(pos_str), mut)
            except Exception:
                return None
        return None

analysis_service = AnalysisService()
