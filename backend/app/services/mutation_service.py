from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from app.data.amino_acids import AMINO_ACID_DATA, ALL_AMINO_ACID_CODES, get_amino_acid
from app.services.uniprot import uniprot_service, ProteinNotFoundException

class InvalidMutationException(Exception):
    def __init__(self, message: str, actual_residue: Optional[str] = None, position: Optional[int] = None):
        self.message = message
        self.actual_residue = actual_residue
        self.position = position
        super().__init__(message)

class MutationService:
    def validate_position(self, sequence: str, position: int) -> bool:
        """
        Check if 1-based position is valid for sequence.
        """
        if not sequence:
            return False
        return 1 <= position <= len(sequence)

    def get_original_residue(self, sequence: str, position: int) -> str:
        """
        Extract the original 1-letter amino acid code at a 1-based position.
        """
        if not self.validate_position(sequence, position):
            raise InvalidMutationException(
                f"Position {position} is outside sequence length of {len(sequence)}.",
                position=position
            )
        return sequence[position - 1].upper()

    def validate_substitution(self, original_aa: str, mutant_aa: str) -> None:
        """
        Validate that mutant amino acid code exists and differs from wildtype.
        """
        orig = original_aa.strip().upper()
        mut = mutant_aa.strip().upper()

        if orig not in AMINO_ACID_DATA:
            raise InvalidMutationException(f"Invalid original amino acid code '{original_aa}'.")

        if mut not in AMINO_ACID_DATA:
            raise InvalidMutationException(f"Invalid mutant amino acid code '{mutant_aa}'.")

        if orig == mut:
            raise InvalidMutationException(
                f"Amino acid code '{mut}' is identical to original residue at this position. Please select a different amino acid."
            )

    def validate_mutation_against_protein(
        self,
        accession: str,
        position: int,
        mutant_aa: str,
        specified_orig_aa: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Strictly validate a mutation against the actual retrieved UniProt reference sequence.
        Checks:
        1. Accession exists.
        2. Position is within sequence length.
        3. Reference sequence[position - 1] matches specified original residue.
        4. Mutant AA is valid and differs from reference residue.
        """
        protein_entry = uniprot_service.fetch_by_accession(accession)
        sequence = protein_entry.get("sequence", "")

        if not sequence:
            raise InvalidMutationException(f"Unable to retrieve verified reference sequence for accession '{accession}'.")

        if not self.validate_position(sequence, position):
            raise InvalidMutationException(
                f"Position {position} is outside reference sequence bounds (1 to {len(sequence)}).",
                position=position
            )

        actual_ref_aa = sequence[position - 1].upper()
        actual_name = get_amino_acid(actual_ref_aa).get("name", actual_ref_aa)

        # Check reference residue mismatch if user specified original AA
        if specified_orig_aa:
            spec_aa = specified_orig_aa.strip().upper()
            if spec_aa != actual_ref_aa:
                spec_name = get_amino_acid(spec_aa).get("name", spec_aa)
                raise InvalidMutationException(
                    f"Reference residue mismatch: Position {position} contains {actual_ref_aa} ({actual_name}) in reference sequence {accession}, not {spec_aa} ({spec_name}).",
                    actual_residue=actual_ref_aa,
                    position=position
                )

        self.validate_substitution(actual_ref_aa, mutant_aa)

        orig_data = get_amino_acid(actual_ref_aa)
        mut_data = get_amino_acid(mutant_aa.upper())
        notation = f"{actual_ref_aa}{position}{mut_data['code']}"

        return {
            "valid": True,
            "mutation": notation,
            "protein_accession": accession,
            "position": position,
            "original": orig_data,
            "mutant": mut_data,
            "verified": True,
            "provenance": {
                "source": "UniProt REST API Reference Sequence",
                "identifier": accession,
                "retrieved_at": datetime.now(timezone.utc).isoformat(),
                "verified": True,
                "method": "Exact Sequence Position Alignment",
                "status": "VERIFIED"
            }
        }

    def analyze_basic_mutation(self, original_code: str, mutant_code: str, position: Optional[int] = None) -> Dict[str, Any]:
        """
        Calculate deterministic physicochemical property shifts between original and mutant residues.
        """
        orig_data = get_amino_acid(original_code)
        mut_data = get_amino_acid(mutant_code)

        if not orig_data or not mut_data:
            raise InvalidMutationException("Unknown amino acid code for comparison.")

        notation = f"{orig_data['code']}{position}{mut_data['code']}" if position else f"{orig_data['code']}->{mut_data['code']}"

        mw_orig = orig_data["molecular_weight"]
        mw_mut = mut_data["molecular_weight"]
        mw_diff = round(mw_mut - mw_orig, 2)
        mw_change = "increase" if mw_diff > 0 else ("decrease" if mw_diff < 0 else "unchanged")

        c_orig = orig_data["charge"]
        c_mut = mut_data["charge"]
        c_diff = c_mut - c_orig
        if c_orig == c_mut:
            charge_change = "unchanged"
        elif c_mut > c_orig:
            charge_change = "more_positive"
        else:
            charge_change = "more_negative"

        p_orig = orig_data["polarity"]
        p_mut = mut_data["polarity"]
        polarity_change = "unchanged" if p_orig == p_mut else f"shift_to_{p_mut}"

        h_orig = orig_data["hydrophobicity"]
        h_mut = mut_data["hydrophobicity"]
        h_diff = round(h_mut - h_orig, 2)
        if abs(h_diff) < 0.1:
            h_change = "unchanged"
        elif h_diff > 0:
            h_change = "increase"
        else:
            h_change = "decrease"

        v_orig = orig_data["volume"]
        v_mut = mut_data["volume"]
        v_diff = round(v_mut - v_orig, 1)
        if abs(v_diff) < 2.0:
            v_change = "unchanged"
        elif v_diff > 0:
            v_change = "increase"
        else:
            v_change = "decrease"

        return {
            "mutation": notation,
            "original": orig_data,
            "mutant": mut_data,
            "property_shifts": {
                "molecular_weight": {
                    "original": mw_orig,
                    "mutant": mw_mut,
                    "diff": mw_diff,
                    "change": mw_change,
                    "display": f"{'+' if mw_diff > 0 else ''}{mw_diff} Da"
                },
                "charge": {
                    "original": orig_data["charge_label"],
                    "mutant": mut_data["charge_label"],
                    "diff": c_diff,
                    "change": charge_change
                },
                "polarity": {
                    "original": p_orig,
                    "mutant": p_mut,
                    "change": polarity_change
                },
                "hydrophobicity": {
                    "original": h_orig,
                    "mutant": h_mut,
                    "diff": h_diff,
                    "change": h_change,
                    "display": f"{'+' if h_diff > 0 else ''}{h_diff}"
                },
                "volume": {
                    "original": v_orig,
                    "mutant": v_mut,
                    "diff": v_diff,
                    "change": v_change,
                    "display": f"{'+' if v_diff > 0 else ''}{v_diff} Å³"
                }
            },
            "verified": True,
            "provenance": {
                "source": "Amino Acid Property Database (Kyte-Doolittle / IUPAC)",
                "verified": True,
                "status": "CALCULATED"
            }
        }

    def generate_playground(self, original_aa: str, position: int) -> List[Dict[str, Any]]:
        orig = original_aa.upper()
        substitutions = []

        for code in ALL_AMINO_ACID_CODES:
            if code == orig:
                continue

            analysis = self.analyze_basic_mutation(orig, code, position)
            substitutions.append({
                "mutation": f"{orig}{position}{code}",
                "mutant": analysis["mutant"],
                "property_shifts": analysis["property_shifts"]
            })

        return substitutions

mutation_service = MutationService()
