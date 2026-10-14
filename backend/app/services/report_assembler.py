import datetime
from typing import Optional, Dict, Any, List
from app.schemas.analysis import FullAnalysisResponse, DataProvenanceItem
from app.schemas.report import (
    ResearchReport,
    ExecutiveSummary,
    ProteinIdentification,
    MutationValidation,
    PhysicochemicalReport,
    PropertyRow,
    ConservationReport,
    StructuralReport,
    LocalEnvironmentReport,
    SpatialContactItem,
    AIInterpretationReport,
    EvidencePillarOverviewItem,
)
from app.data.amino_acids import get_amino_acid

SCIENTIFIC_DISCLAIMER_TEXT = (
    "ProteinGuard provides computational and educational analysis of amino-acid substitutions. "
    "Its outputs are not medical diagnoses, treatment recommendations, or definitive clinical interpretations. "
    "Computational observations and predictions require appropriate scientific validation. "
    "The absence of evidence in this report does not establish the absence of a biological effect."
)

class ReportAssembler:
    """
    Assembles a comprehensive, transparent, and evidence-grounded ResearchReport
    from an existing verified FullAnalysisResponse object and optional AI interpretation.
    """

    def assemble_report(
        self,
        analysis: FullAnalysisResponse,
        ai_data: Optional[Dict[str, Any]] = None
    ) -> ResearchReport:
        now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
        clean_acc = analysis.protein.accession.strip().upper()
        pos = analysis.mutation["position"]
        orig_res = analysis.mutation["original"]
        mut_res = analysis.mutation["mutant"]
        notation = analysis.mutation.get("notation", f"{orig_res}{pos}{mut_res}")

        # 1. Executive Summary
        available_pillars = analysis.available_pillars_count
        overall_status = "Complete" if available_pillars >= 3 else (
            "Partially Available" if available_pillars >= 1 else "Evidence Unavailable"
        )

        p_name = getattr(analysis.protein, "protein_name", None) or getattr(analysis.protein, "name", "Unknown Protein")
        g_name = getattr(analysis.protein, "gene_name", None) or getattr(analysis.protein, "gene", None)
        p_org = getattr(analysis.protein, "organism", "Unknown Organism")
        p_len = getattr(analysis.protein, "length", 0)

        neutral_summary = (
            f"This report summarizes the available computational evidence for the selected amino-acid substitution "
            f"{notation} in {p_name} ({clean_acc}). "
            f"{available_pillars} of 4 computational evidence pillars were successfully resolved."
        )

        exec_summary = ExecutiveSummary(
            protein_name=p_name,
            gene_name=g_name,
            protein_accession=clean_acc,
            organism=p_org,
            position=pos,
            original_residue=orig_res,
            mutant_residue=mut_res,
            notation=notation,
            analysis_date=now_iso,
            status=overall_status,
            available_pillars_count=available_pillars,
            total_pillars_count=4,
            neutral_summary=neutral_summary,
        )

        # 2. Protein Identification
        protein_ident = ProteinIdentification(
            protein_name=p_name,
            gene_name=g_name,
            protein_accession=clean_acc,
            organism=p_org,
            sequence_length=p_len,
            source_database="UniProt KB",
            source_url=f"https://www.uniprot.org/uniprotkb/{clean_acc}",
            retrieval_date=now_iso,
            validation_status="VERIFIED",
        )

        # 3. Mutation Validation
        orig_aa = get_amino_acid(orig_res)
        mut_aa = get_amino_acid(mut_res)
        structure_note = None
        if analysis.structural_evidence and analysis.structural_evidence.pdb_id:
            struct_pos = (
                getattr(analysis.structural_evidence, "mapped_pdb_residue", None)
                or getattr(analysis.structural_evidence, "mapped_residue_number", None)
                or pos
            )
            chain = getattr(analysis.structural_evidence, "chain", None) or getattr(analysis.structural_evidence, "chain_id", "A")
            structure_note = (
                f"Reference position {pos} maps to residue {struct_pos} on Chain {chain} "
                f"in PDB structure {analysis.structural_evidence.pdb_id}."
            )

        mutation_valid = MutationValidation(
            original_residue=orig_res,
            original_name=orig_aa.get("name", "Unknown"),
            position=pos,
            mutant_residue=mut_res,
            mutant_name=mut_aa.get("name", "Unknown"),
            notation=notation,
            validation_result="VERIFIED against canonical UniProt sequence",
            reference_source="UniProt KB Canonical Sequence",
            validation_timestamp=now_iso,
            sequence_numbering_type="Reference Sequence (1-indexed)",
            structure_numbering_note=structure_note,
        )

        # 4. Physicochemical Report
        physico_rows: List[PropertyRow] = []
        interp_notes = []
        if analysis.physicochemical_evidence:
            pe = analysis.physicochemical_evidence
            orig_data = pe.original
            mut_data = pe.mutant
            shifts = pe.property_shifts

            # MW
            mw_diff = round(float(mut_data.molecular_weight - orig_data.molecular_weight), 2)
            physico_rows.append(PropertyRow(
                property_name="Molecular Weight (Da)",
                reference_value=f"{orig_data.molecular_weight:.1f}",
                mutant_value=f"{mut_data.molecular_weight:.1f}",
                delta_or_shift=f"{mw_diff:+.1f} Da",
                classification="Shift" if abs(mw_diff) > 20 else "Neutral"
            ))

            # Charge
            charge_change = int(mut_data.charge - orig_data.charge)
            physico_rows.append(PropertyRow(
                property_name="Net Charge (pH 7.4)",
                reference_value=str(orig_data.charge),
                mutant_value=str(mut_data.charge),
                delta_or_shift=f"{charge_change:+d}" if charge_change != 0 else "Unchanged (0)",
                classification="Altered" if charge_change != 0 else "Neutral"
            ))

            # Polarity
            polarity_change = orig_data.polarity.lower() != mut_data.polarity.lower()
            physico_rows.append(PropertyRow(
                property_name="Polarity",
                reference_value=orig_data.polarity.capitalize(),
                mutant_value=mut_data.polarity.capitalize(),
                delta_or_shift=f"{orig_data.polarity} → {mut_data.polarity}" if polarity_change else "Unchanged",
                classification="Altered" if polarity_change else "Neutral"
            ))

            # Hydrophobicity
            hydro_diff = round(float(mut_data.hydrophobicity - orig_data.hydrophobicity), 2)
            physico_rows.append(PropertyRow(
                property_name="Kyte-Doolittle Hydrophobicity",
                reference_value=f"{orig_data.hydrophobicity:.1f}",
                mutant_value=f"{mut_data.hydrophobicity:.1f}",
                delta_or_shift=f"{hydro_diff:+.1f}",
                classification="Shift" if abs(hydro_diff) >= 1.0 else "Neutral"
            ))

            # Volume
            vol_diff = round(float(mut_data.volume - orig_data.volume), 1)
            physico_rows.append(PropertyRow(
                property_name="Van der Waals Volume (Å³)",
                reference_value=f"{orig_data.volume:.1f}",
                mutant_value=f"{mut_data.volume:.1f}",
                delta_or_shift=f"{vol_diff:+.1f} Å³",
                classification="Shift" if abs(vol_diff) >= 15 else "Neutral"
            ))

            # Side-chain class
            side_change = orig_data.side_chain_class.lower() != mut_data.side_chain_class.lower()
            physico_rows.append(PropertyRow(
                property_name="Side-Chain Classification",
                reference_value=orig_data.side_chain_class,
                mutant_value=mut_data.side_chain_class,
                delta_or_shift=f"{orig_data.side_chain_class} → {mut_data.side_chain_class}" if side_change else "Conserved",
                classification="Altered" if side_change else "Neutral"
            ))

            if charge_change != 0:
                interp_notes.append(f"Net charge changes by {charge_change:+d}.")
            if polarity_change:
                interp_notes.append(f"Polarity shifts from {orig_data.polarity} to {mut_data.polarity}.")
            if abs(hydro_diff) >= 1.0:
                interp_notes.append(f"Significant hydrophobicity delta of {hydro_diff:+.1f} on the Kyte-Doolittle scale.")
            if not interp_notes:
                interp_notes.append("Conservative substitution with largely preserved molecular properties.")

        physico_report = PhysicochemicalReport(
            status="Calculated",
            properties=physico_rows,
            interpretation_note=" ".join(interp_notes),
            method="Kyte-Doolittle Hydrophobicity Scale & IUPAC Molecular Parameters",
        )

        # 5. Sequence Conservation Report
        ce = analysis.conservation_evidence
        if ce and getattr(ce, "status", "") == "success":
            cons_report = ConservationReport(
                status="Available",
                method="Shannon Entropy (H = -sum p_i log2 p_i) across UniProt Orthologs",
                entropy=round(ce.entropy, 2) if ce.entropy is not None else None,
                classification=ce.classification,
                sequence_count=ce.sequence_count,
                dominant_residue=ce.dominant_residue,
                dominant_percentage=round(ce.dominant_percentage, 1) if ce.dominant_percentage is not None else None,
                aligned_samples_count=len(ce.aligned_samples) if ce.aligned_samples else 0,
            )
        else:
            cons_report = ConservationReport(
                status="Unavailable",
                method="Shannon Entropy from Homologous UniProt Alignments",
                reason_unavailable="Homologous sequence alignment data was not retrieved or sequence coverage was insufficient.",
            )

        # 6. Structural Context Report
        se = analysis.structural_evidence
        if se and se.pdb_id and getattr(se, "status", "") in ["success", "mapped"]:
            sec_struct = se.secondary_structure.capitalize() if se.secondary_structure else "Loop / Coil"
            solv_acc = getattr(se, "solvent_accessibility", None) or getattr(se, "environment", "Uncalculated")
            struct_pos = (
                getattr(se, "mapped_pdb_residue", None)
                or getattr(se, "mapped_residue_number", None)
                or pos
            )
            chain = getattr(se, "chain", None) or getattr(se, "chain_id", "A")

            struct_report = StructuralReport(
                status="Available",
                pdb_id=se.pdb_id,
                structure_url=f"https://www.rcsb.org/structure/{se.pdb_id}",
                chain_id=chain,
                mapped_residue_number=struct_pos,
                secondary_structure=sec_struct,
                solvent_accessibility=str(solv_acc),
                experimental_method=se.experimental_method or "X-ray Diffraction",
                resolution=se.resolution or "Not specified",
                mapping_method="UniProt SIFTS Residue Coordinate Mapping",
            )
        else:
            struct_report = StructuralReport(
                status="Unavailable",
                reason_unavailable=(
                    getattr(se, "message", None)
                    if se and getattr(se, "message", None)
                    else "No suitable experimental PDB structure could be mapped to this sequence position."
                ),
            )

        # 7. Local Structural Environment and Residue Contacts
        contacts_list: List[SpatialContactItem] = []
        if se and getattr(se, "nearby_residues", None):
            for item in se.nearby_residues:
                r_name = getattr(item, "name", None) or getattr(item, "residue_name", "UNK")
                r_pos = getattr(item, "position", 0)
                r_chain = getattr(item, "chain_id", None) or getattr(se, "chain", "A")
                r_atom = getattr(item, "atom_name", "CA")
                dist = getattr(item, "distance_angstroms", None) or getattr(item, "distance_angstrom", 0.0)
                c_type = getattr(item, "contact_type", "Spatial Neighbor")

                contacts_list.append(SpatialContactItem(
                    residue_name=r_name,
                    position=r_pos,
                    chain_id=str(r_chain),
                    atom_name=r_atom,
                    distance_angstrom=round(float(dist), 2),
                    contact_type=c_type,
                ))

        if contacts_list:
            local_env_report = LocalEnvironmentReport(
                status="Available",
                radius_angstrom=6.0,
                contacts=contacts_list,
                contact_count=len(contacts_list),
                method="RCSB 3D Euclidean Atomic Distance within 6.0 Å Sphere",
            )
        else:
            local_env_report = LocalEnvironmentReport(
                status="Unavailable",
                contacts=[],
                contact_count=0,
                reason_unavailable=(
                    "Local structural environment unavailable because a verified residue-to-structure "
                    "mapping could not be established."
                ),
            )

        # 8. Gemma AI Interpretation Report
        ai_report_status = "Unavailable"
        ai_text = None
        supporting_items: List[str] = []
        uncertainties: List[str] = []
        ai_reason_unavail = "AI interpretation unavailable (Assistant uninvoked or service offline)."

        if ai_data:
            if isinstance(ai_data, dict):
                ai_text = ai_data.get("ai_interpretation") or ai_data.get("overview") or ai_data.get("answer")
                if ai_text:
                    ai_report_status = "Available"
                    ai_reason_unavail = None
                ev = ai_data.get("evidence_items") or []
                if isinstance(ev, list):
                    for item in ev:
                        if isinstance(item, dict):
                            supporting_items.append(f"{item.get('category', 'Evidence')}: {item.get('statement', '')}")
                        elif isinstance(item, str):
                            supporting_items.append(item)
                lims = ai_data.get("limitations") or []
                if isinstance(lims, list):
                    uncertainties.extend([str(l) for l in lims])

        ai_interp_report = AIInterpretationReport(
            status=ai_report_status,
            provider="Gemma 4 (Evidence-Grounded Assistant)",
            interpretation=ai_text,
            supporting_evidence=supporting_items,
            uncertainties_and_questions=uncertainties,
            reason_unavailable=ai_reason_unavail,
        )

        # 9. Evidence Overview (4 isolated pillars)
        evidence_overview: List[EvidencePillarOverviewItem] = [
            EvidencePillarOverviewItem(
                pillar_name="Physicochemical Property Shifts",
                status="Calculated",
                source_or_method="Kyte-Doolittle Hydrophobicity & IUPAC Molecular Parameters",
                limitations="Describes single-amino-acid molecular shifts; does not establish macroscopic folding or kinetics.",
            ),
            EvidencePillarOverviewItem(
                pillar_name="Sequence Conservation (Shannon Entropy)",
                status="Calculated" if cons_report.status == "Available" else "Unavailable",
                source_or_method="UniProt Ortholog Multiple Sequence Alignment" if cons_report.status == "Available" else "N/A",
                limitations="Dependent on taxonomic sampling and depth of available ortholog sequences.",
            ),
            EvidencePillarOverviewItem(
                pillar_name="Structural Context & Environment",
                status="Verified" if struct_report.status == "Available" else "Unavailable",
                source_or_method=f"RCSB PDB ({struct_report.pdb_id})" if struct_report.status == "Available" else "N/A",
                limitations="Coordinates derived from wild-type experimental structure; mutant side-chain is unmodeled.",
            ),
            EvidencePillarOverviewItem(
                pillar_name="3D Microenvironment Contacts (6.0 Å)",
                status="Calculated" if local_env_report.status == "Available" else "Unavailable",
                source_or_method="3D Euclidean Inter-Atomic Distance Matrix" if local_env_report.status == "Available" else "N/A",
                limitations="Reflects static crystallographic contacts; does not account for solution dynamics.",
            ),
        ]

        # 10. Applicable Limitations
        applied_limitations: List[str] = [
            "ProteinGuard provides computational and educational research evidence and does not diagnose disease or prescribe therapy.",
            "Physicochemical property shifts describe molecular changes but do not prove a disruption in overall protein function.",
        ]
        if struct_report.status == "Available":
            applied_limitations.append(
                f"Structural context is derived from wild-type PDB {struct_report.pdb_id}. "
                "The mutant side-chain conformation has not been experimentally determined or energy-minimized."
            )
        else:
            applied_limitations.append(
                "No verified experimental PDB structure was available for this residue position."
            )

        if cons_report.status == "Available":
            applied_limitations.append(
                f"Conservation calculations are based on {cons_report.sequence_count} homologous sequences. "
                "Different alignment depths or taxonomic subsets may yield slightly varied entropy values."
            )
        else:
            applied_limitations.append(
                "Homologous sequence conservation data was not available for this analysis."
            )

        if ai_interp_report.status == "Available":
            applied_limitations.append(
                "AI interpretation is generated via Gemma 4 as a research aid and is grounded in the calculated evidence, "
                "not independent clinical or experimental authority."
            )

        # 11. Suggested Further Investigations (Logical evidence-grounded next steps)
        suggested_investigations: List[str] = []
        if struct_report.status != "Available":
            suggested_investigations.append(
                "Locate or predict a structural model (e.g. via AlphaFold DB or homology modeling) to evaluate 3D context."
            )
        else:
            suggested_investigations.append(
                f"Evaluate molecular dynamics (MD) simulations to assess local conformational relaxation around position {pos} in PDB {struct_report.pdb_id}."
            )

        if cons_report.status == "Available" and cons_report.classification == "Highly conserved":
            suggested_investigations.append(
                f"Residue {orig_res} at position {pos} is highly conserved. Cross-reference functional domain databases (e.g. Pfam, InterPro) for active-site or ligand-binding roles."
            )
        else:
            suggested_investigations.append(
                "Broaden taxonomic sequence retrieval to improve ortholog alignment depth and conservation confidence."
            )

        if physico_rows:
            charge_changed = any("Altered" in r.classification for r in physico_rows if "Charge" in r.property_name)
            if charge_changed:
                suggested_investigations.append(
                    "Perform electrostatic surface potential analysis and in vitro binding assays to check for disrupted salt bridges."
                )
            else:
                suggested_investigations.append(
                    "Perform circular dichroism (CD) or thermal shift assays (TSA) to determine if substitution impacts protein thermal stability (ΔTm)."
                )

        suggested_investigations.append(
            "Review curated experimental mutation literature (e.g. PubMed, ClinVar) for functional characterization of substitutions at this locus."
        )

        # Provenance: retain canonical provenance items
        provenance_list: List[DataProvenanceItem] = list(analysis.provenance) if analysis.provenance else []
        provenance_list.append(
            DataProvenanceItem(
                source="ProteinGuard Report Assembler",
                identifier=f"report_{analysis.analysis_id}",
                retrieved_at=now_iso,
                verified=True,
                method="Canonical multi-pillar evidence synthesis and boundary evaluation",
                status="VERIFIED"
            )
        )

        report_id = f"REP-{analysis.analysis_id}"

        return ResearchReport(
            report_id=report_id,
            analysis_id=analysis.analysis_id,
            created_at=now_iso,
            schema_version="1.0.0",
            status=overall_status,
            executive_summary=exec_summary,
            protein_identification=protein_ident,
            mutation_validation=mutation_valid,
            physicochemical_report=physico_report,
            conservation_report=cons_report,
            structural_report=struct_report,
            local_environment_report=local_env_report,
            ai_interpretation_report=ai_interp_report,
            evidence_overview=evidence_overview,
            limitations=applied_limitations,
            suggested_investigations=suggested_investigations,
            provenance=provenance_list,
            scientific_disclaimer=SCIENTIFIC_DISCLAIMER_TEXT,
        )

report_assembler = ReportAssembler()
