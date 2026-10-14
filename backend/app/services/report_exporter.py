import json
from app.schemas.report import ResearchReport

class ReportExporter:
    """
    Converts a canonical ResearchReport into structured Markdown or machine-readable JSON formats.
    """

    def export_markdown(self, report: ResearchReport) -> str:
        es = report.executive_summary
        pi = report.protein_identification
        mv = report.mutation_validation
        pr = report.physicochemical_report
        cr = report.conservation_report
        sr = report.structural_report
        lr = report.local_environment_report
        air = report.ai_interpretation_report

        md_lines = [
            f"# ProteinGuard Research Report: {mv.notation}",
            "",
            "> **Explainable Amino-Acid Mutation Analysis Platform**",
            "> *An evidence-grounded computational assessment of an amino-acid substitution.*",
            "",
            f"- **Report Identifier:** `{report.report_id}`",
            f"- **Analysis Identifier:** `{report.analysis_id}`",
            f"- **Date Generated:** {report.created_at}",
            f"- **Overall Status:** **{report.status.upper()}** ({es.available_pillars_count}/4 Evidence Pillars Resolved)",
            "",
            "---",
            "",
            "## 1. Executive Summary",
            "",
            f"{es.neutral_summary}",
            "",
            "| Parameter | Value |",
            "|---|---|",
            f"| **Target Protein** | {pi.protein_name} |",
            f"| **UniProt Accession** | [{pi.protein_accession}]({pi.source_url}) |",
            f"| **Gene Symbol** | {pi.gene_name or 'N/A'} |",
            f"| **Organism** | *{pi.organism}* |",
            f"| **Sequence Length** | {pi.sequence_length} aa |",
            f"| **Reference Position** | {mv.position} |",
            f"| **Wild-Type Residue** | {mv.original_name} (`{mv.original_residue}`) |",
            f"| **Substituted Residue** | {mv.mutant_name} (`{mv.mutant_residue}`) |",
            f"| **Mutation Notation** | **`{mv.notation}`** |",
            f"| **Sequence Validation** | {mv.validation_result} |",
            "",
            "---",
            "",
            "## 2. Protein Identification & Validation",
            "",
            f"- **Source Database:** {pi.source_database}",
            f"- **Database URL:** {pi.source_url}",
            f"- **Retrieval Timestamp:** {pi.retrieval_date}",
            f"- **Validation Result:** {mv.validation_result}",
            f"- **Numbering System:** {mv.sequence_numbering_type}",
        ]

        if mv.structure_numbering_note:
            md_lines.append(f"- **Structure Mapping Note:** {mv.structure_numbering_note}")

        md_lines.extend([
            "",
            "---",
            "",
            "## 3. Physicochemical Property Shifts",
            "",
            f"*Method:* {pr.method}",
            "",
            "| Property Metric | Reference Residue | Mutant Residue | Calculated Difference | Classification |",
            "|---|---|---|---|---|",
        ])

        for p in pr.properties:
            md_lines.append(f"| {p.property_name} | {p.reference_value} | {p.mutant_value} | {p.delta_or_shift} | {p.classification} |")

        if pr.interpretation_note:
            md_lines.extend([
                "",
                f"**Interpretation:** {pr.interpretation_note}",
            ])

        md_lines.extend([
            "",
            "---",
            "",
            "## 4. Sequence Conservation (Shannon Entropy)",
            "",
        ])

        if cr.status == "Available":
            md_lines.extend([
                f"- **Alignment Method:** {cr.method}",
                f"- **Normalized Shannon Entropy ($H$):** `{cr.entropy}`",
                f"- **Classification:** **{cr.classification}**",
                f"- **Orthologous Sequences Analyzed:** {cr.sequence_count}",
                f"- **Dominant Residue at Position:** `{cr.dominant_residue}` ({cr.dominant_percentage}%)",
                f"- **Aligned Sequence Window Depth:** {cr.aligned_samples_count}",
            ])
        else:
            md_lines.append(f"**Conservation analysis unavailable:** *{cr.reason_unavailable}*")

        md_lines.extend([
            "",
            "---",
            "",
            "## 5. Structural Context & Spatial Environment",
            "",
        ])

        if sr.status == "Available":
            md_lines.extend([
                f"- **Experimental Structure:** [{sr.pdb_id}]({sr.structure_url}) (Chain {sr.chain_id})",
                f"- **Mapped Structure Residue:** {sr.mapped_residue_number}",
                f"- **Secondary Structure:** {sr.secondary_structure}",
                f"- **Solvent Exposure:** {sr.solvent_accessibility}",
                f"- **Experimental Method:** {sr.experimental_method}",
                f"- **Resolution:** {sr.resolution}",
                f"- **Mapping Method:** {sr.mapping_method}",
                "",
                f"> ⚠️ **Structural Boundary:** {sr.structure_nature_note}",
            ])
        else:
            md_lines.append(f"**Structural context unavailable:** *{sr.reason_unavailable}*")

        md_lines.extend([
            "",
            "### 3D Spatial Atomic Contacts (6.0 Å Sphere)",
            "",
        ])

        if lr.status == "Available" and lr.contacts:
            md_lines.extend([
                f"*Identified {lr.contact_count} neighboring residues within {lr.radius_angstrom} Å Euclidean distance.*",
                "",
                "| Residue | Position | Chain | Atom | Distance (Å) | Contact Type |",
                "|---|---|---|---|---|---|",
            ])
            for c in lr.contacts:
                md_lines.append(f"| {c.residue_name} | {c.position} | {c.chain_id} | {c.atom_name} | {c.distance_angstrom:.2f} Å | {c.contact_type} |")
        else:
            md_lines.append(f"*{lr.reason_unavailable}*")

        md_lines.extend([
            "",
            "---",
            "",
            "## 6. Gemma 4 AI Research Interpretation",
            "",
        ])

        if air.status == "Available" and air.interpretation:
            md_lines.extend([
                f"**Synthesized Interpretation:**",
                f"{air.interpretation}",
                "",
            ])
            if air.supporting_evidence:
                md_lines.append("**Supporting Evidence Items:**")
                for item in air.supporting_evidence:
                    md_lines.append(f"- {item}")
                md_lines.append("")
            if air.uncertainties_and_questions:
                md_lines.append("**Uncertainties & Open Questions:**")
                for u in air.uncertainties_and_questions:
                    md_lines.append(f"- {u}")
                md_lines.append("")
        else:
            md_lines.append(f"**AI interpretation unavailable:** *{air.reason_unavailable}*")
            md_lines.append("")

        md_lines.append(f"> *{air.computational_role_note}*")

        md_lines.extend([
            "",
            "---",
            "",
            "## 7. Independent 4-Pillar Evidence Summary",
            "",
            "| Evidence Pillar | Status | Source or Method | Limitations |",
            "|---|---|---|---|",
        ])

        for ev in report.evidence_overview:
            md_lines.append(f"| {ev.pillar_name} | **{ev.status}** | {ev.source_or_method} | {ev.limitations} |")

        md_lines.extend([
            "",
            "---",
            "",
            "## 8. Scientific Limitations & Boundaries",
            "",
        ])
        for lim in report.limitations:
            md_lines.append(f"- {lim}")

        md_lines.extend([
            "",
            "---",
            "",
            "## 9. Suggested Further Investigations",
            "",
        ])
        for inv in report.suggested_investigations:
            md_lines.append(f"- 🔬 {inv}")

        md_lines.extend([
            "",
            "---",
            "",
            "## 10. Data Provenance & Verification Audit Trail",
            "",
            "| Source | Identifier | Verification Status | Method |",
            "|---|---|---|---|",
        ])
        for prov in report.provenance:
            md_lines.append(f"| {prov.source} | `{prov.identifier or 'N/A'}` | **{prov.status or 'VERIFIED'}** | {prov.method or 'Direct API'} |")

        md_lines.extend([
            "",
            "---",
            "",
            "## ⚠️ Scientific Disclaimer",
            "",
            f"> {report.scientific_disclaimer}",
            "",
        ])

        return "\n".join(md_lines)

    def export_json(self, report: ResearchReport) -> str:
        return json.dumps(report.model_dump(), indent=2)

report_exporter = ReportExporter()
