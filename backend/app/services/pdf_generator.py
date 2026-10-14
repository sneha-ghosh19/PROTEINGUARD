import io
from typing import List
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    KeepTogether,
    HRFlowable
)
from reportlab.pdfgen import canvas
from app.schemas.report import ResearchReport

class NumberedCanvas(canvas.Canvas):
    """
    Two-pass canvas to dynamically compute total page count and add
    professional header and footer to every page.
    """
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count: int):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748b"))

        # Running Header (pages > 1)
        if self._pageNumber > 1:
            self.drawString(36, 815, "ProteinGuard 🧬 — Mutation Research Report")
            self.drawRightString(559, 815, f"Report ID: {getattr(self, 'report_id_str', 'Analysis Report')}")
            self.setStrokeColor(colors.HexColor("#cbd5e1"))
            self.setLineWidth(0.5)
            self.line(36, 808, 559, 808)

        # Running Footer (all pages)
        self.setStrokeColor(colors.HexColor("#cbd5e1"))
        self.setLineWidth(0.5)
        self.line(36, 35, 559, 35)

        self.drawString(36, 24, "Strictly for Research & Education • NOT FOR CLINICAL USE • Evidence Grounded")
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(559, 24, page_str)
        self.restoreState()


class PDFGenerator:
    """
    Generates publication-grade, multi-page A4 PDF documents from a canonical ResearchReport.
    """

    def generate_pdf(self, report: ResearchReport) -> bytes:
        buffer = io.BytesIO()

        # Margins: 36 pt (0.5 in), usable width = 595.27 - 72 = 523.27 pt
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            leftMargin=36,
            rightMargin=36,
            topMargin=44,
            bottomMargin=44,
            title=f"ProteinGuard Report - {report.mutation_validation.notation}",
            author="ProteinGuard Computational Biology Platform",
            subject="Mutation Research & Evidence Summary Report",
        )

        styles = getSampleStyleSheet()

        # Custom high-contrast, clean typography styles
        title_style = ParagraphStyle(
            "DocTitle",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=18,
            leading=22,
            textColor=colors.HexColor("#0f172a"),
            spaceAfter=3,
        )
        subtitle_style = ParagraphStyle(
            "DocSubTitle",
            parent=styles["Normal"],
            fontName="Helvetica",
            fontSize=9.5,
            leading=13,
            textColor=colors.HexColor("#0891b2"),
            spaceAfter=10,
        )
        h2_style = ParagraphStyle(
            "H2Style",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=11,
            leading=14,
            textColor=colors.HexColor("#0f172a"),
            spaceBefore=10,
            spaceAfter=4,
        )
        body_style = ParagraphStyle(
            "BodyDark",
            parent=styles["Normal"],
            fontName="Helvetica",
            fontSize=8.5,
            leading=11.5,
            textColor=colors.HexColor("#334155"),
        )
        body_bold = ParagraphStyle(
            "BodyBold",
            parent=body_style,
            fontName="Helvetica-Bold",
            textColor=colors.HexColor("#0f172a"),
        )
        badge_style = ParagraphStyle(
            "BadgeStyle",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=7.5,
            leading=9,
            textColor=colors.HexColor("#0369a1"),
        )
        disclaimer_style = ParagraphStyle(
            "DisclaimerStyle",
            parent=styles["Normal"],
            fontName="Helvetica-Oblique",
            fontSize=7.5,
            leading=10.5,
            textColor=colors.HexColor("#64748b"),
        )

        story = []

        # Header Title Box
        story.append(Paragraph("PROTEINGUARD 🧬 — MUTATION RESEARCH REPORT", title_style))
        story.append(Paragraph("Evidence-Grounded Computational Assessment of Amino-Acid Substitution", subtitle_style))

        # Metadata banner table
        meta_data = [
            [
                Paragraph(f"<b>Report ID:</b> {report.report_id}", body_style),
                Paragraph(f"<b>Status:</b> <font color='#0891b2'><b>{report.status.upper()}</b></font>", body_style),
                Paragraph(f"<b>Date:</b> {report.created_at[:10]}", body_style),
            ],
            [
                Paragraph(f"<b>Protein:</b> {report.protein_identification.protein_name}", body_style),
                Paragraph(f"<b>Accession:</b> {report.protein_identification.protein_accession}", body_style),
                Paragraph(f"<b>Mutation:</b> <font color='#0f766e'><b>{report.mutation_validation.notation}</b></font>", body_style),
            ]
        ]
        meta_table = Table(meta_data, colWidths=[180, 170, 173])
        meta_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#f8fafc")),
            ("BOX", (0, 0), (-1, -1), 0.75, colors.HexColor("#e2e8f0")),
            ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#f1f5f9")),
            ("TOPPADDING", (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ("LEFTPADDING", (0, 0), (-1, -1), 8),
            ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ]))
        story.append(meta_table)
        story.append(Spacer(1, 10))

        # 1. Executive Summary
        story.append(Paragraph("1. Executive Summary", h2_style))
        story.append(Paragraph(report.executive_summary.neutral_summary, body_style))
        story.append(Spacer(1, 4))
        exec_details = [
            [
                Paragraph("<b>Gene Symbol</b>", body_style),
                Paragraph(report.executive_summary.gene_name or "N/A", body_style),
                Paragraph("<b>Organism</b>", body_style),
                Paragraph(report.executive_summary.organism, body_style),
            ],
            [
                Paragraph("<b>Reference Residue</b>", body_style),
                Paragraph(f"{report.mutation_validation.original_name} ({report.executive_summary.original_residue})", body_style),
                Paragraph("<b>Substituted Residue</b>", body_style),
                Paragraph(f"{report.mutation_validation.mutant_name} ({report.executive_summary.mutant_residue})", body_style),
            ],
            [
                Paragraph("<b>Evidence Availability</b>", body_style),
                Paragraph(f"{report.executive_summary.available_pillars_count} of 4 Pillars Active", body_style),
                Paragraph("<b>Sequence Verification</b>", body_style),
                Paragraph("VERIFIED (Canonical UniProt)", body_style),
            ]
        ]
        exec_table = Table(exec_details, colWidths=[130, 131, 130, 132])
        exec_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#ffffff")),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ("LEFTPADDING", (0, 0), (-1, -1), 6),
            ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ]))
        story.append(exec_table)
        story.append(Spacer(1, 10))

        # 2 & 3. Protein Identification & Mutation Validation
        story.append(Paragraph("2. Protein Identification & Reference Validation", h2_style))
        prot_data = [
            [Paragraph("<b>Canonical Source:</b>", body_style), Paragraph(report.protein_identification.source_database, body_style), Paragraph("<b>Sequence Length:</b>", body_style), Paragraph(f"{report.protein_identification.sequence_length} aa", body_style)],
            [Paragraph("<b>Validation Status:</b>", body_style), Paragraph(f"<font color='#059669'><b>{report.mutation_validation.validation_result}</b></font>", body_style), Paragraph("<b>Numbering System:</b>", body_style), Paragraph(report.mutation_validation.sequence_numbering_type, body_style)],
        ]
        if report.mutation_validation.structure_numbering_note:
            prot_data.append([
                Paragraph("<b>Structure Mapping:</b>", body_style),
                Paragraph(report.mutation_validation.structure_numbering_note, body_style),
                Paragraph("<b>Source URL:</b>", body_style),
                Paragraph(report.protein_identification.source_url or "N/A", body_style),
            ])
        prot_table = Table(prot_data, colWidths=[120, 141, 120, 142])
        prot_table.setStyle(TableStyle([
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#f8fafc")),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ("LEFTPADDING", (0, 0), (-1, -1), 6),
            ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ]))
        story.append(prot_table)
        story.append(Spacer(1, 10))

        # 4. Physicochemical Changes Table
        story.append(Paragraph("3. Physicochemical Property Shifts", h2_style))
        phys_rows = [
            [
                Paragraph("<b>Property Metric</b>", body_bold),
                Paragraph(f"<b>Reference ({report.mutation_validation.original_residue})</b>", body_bold),
                Paragraph(f"<b>Mutant ({report.mutation_validation.mutant_residue})</b>", body_bold),
                Paragraph("<b>Calculated Difference</b>", body_bold),
                Paragraph("<b>Classification</b>", body_bold),
            ]
        ]
        for p in report.physicochemical_report.properties:
            phys_rows.append([
                Paragraph(p.property_name, body_style),
                Paragraph(p.reference_value, body_style),
                Paragraph(p.mutant_value, body_style),
                Paragraph(p.delta_or_shift, body_style),
                Paragraph(p.classification, badge_style),
            ])
        phys_table = Table(phys_rows, colWidths=[140, 95, 95, 110, 83])
        phys_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#f1f5f9")),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ("LEFTPADDING", (0, 0), (-1, -1), 5),
            ("RIGHTPADDING", (0, 0), (-1, -1), 5),
        ]))
        story.append(phys_table)
        if report.physicochemical_report.interpretation_note:
            story.append(Spacer(1, 3))
            story.append(Paragraph(f"<b>Interpretation:</b> {report.physicochemical_report.interpretation_note}", body_style))
        story.append(Spacer(1, 10))

        # 5. Sequence Conservation
        story.append(Paragraph("4. Sequence Conservation (Shannon Entropy)", h2_style))
        cr = report.conservation_report
        if cr.status == "Available":
            cons_data = [
                [
                    Paragraph("<b>Entropy (H):</b>", body_style),
                    Paragraph(f"{cr.entropy} (Normalized bits)", body_style),
                    Paragraph("<b>Classification:</b>", body_style),
                    Paragraph(f"<b>{cr.classification}</b>", body_style),
                ],
                [
                    Paragraph("<b>Ortholog Sequences:</b>", body_style),
                    Paragraph(f"{cr.sequence_count} sequences aligned", body_style),
                    Paragraph("<b>Dominant Residue:</b>", body_style),
                    Paragraph(f"{cr.dominant_residue} ({cr.dominant_percentage}%)", body_style),
                ]
            ]
            cons_table = Table(cons_data, colWidths=[130, 131, 130, 132])
            cons_table.setStyle(TableStyle([
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
                ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#f8fafc")),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
            ]))
            story.append(cons_table)
        else:
            story.append(Paragraph(f"<i>Conservation analysis unavailable: {cr.reason_unavailable}</i>", body_style))
        story.append(Spacer(1, 10))

        # 6 & 7. Structural Context & Local Environment
        story.append(Paragraph("5. Structural Context & 6.0 Å Spatial Contacts", h2_style))
        sr = report.structural_report
        if sr.status == "Available":
            struct_data = [
                [
                    Paragraph("<b>PDB Structure:</b>", body_style),
                    Paragraph(f"{sr.pdb_id} (Chain {sr.chain_id})", body_style),
                    Paragraph("<b>Secondary Structure:</b>", body_style),
                    Paragraph(sr.secondary_structure or "N/A", body_style),
                ],
                [
                    Paragraph("<b>Method & Resolution:</b>", body_style),
                    Paragraph(f"{sr.experimental_method} • {sr.resolution}", body_style),
                    Paragraph("<b>Solvent Exposure:</b>", body_style),
                    Paragraph(sr.solvent_accessibility or "N/A", body_style),
                ]
            ]
            struct_table = Table(struct_data, colWidths=[130, 131, 130, 132])
            struct_table.setStyle(TableStyle([
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
                ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#f8fafc")),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
            ]))
            story.append(struct_table)
            story.append(Spacer(1, 4))
            story.append(Paragraph(f"<i>Notice: {sr.structure_nature_note}</i>", disclaimer_style))
        else:
            story.append(Paragraph(f"<i>Structural context unavailable: {sr.reason_unavailable}</i>", body_style))

        # Local environment contacts table
        story.append(Spacer(1, 6))
        ler = report.local_environment_report
        if ler.status == "Available" and ler.contacts:
            story.append(Paragraph(f"<b>Nearby Spatial Contacts within 6.0 Å ({ler.contact_count} residues detected):</b>", body_style))
            contact_rows = [
                [
                    Paragraph("<b>Residue</b>", body_bold),
                    Paragraph("<b>Position</b>", body_bold),
                    Paragraph("<b>Chain</b>", body_bold),
                    Paragraph("<b>Atom</b>", body_bold),
                    Paragraph("<b>Distance (Å)</b>", body_bold),
                ]
            ]
            # Show top 8 contacts to fit cleanly
            for c in ler.contacts[:8]:
                contact_rows.append([
                    Paragraph(c.residue_name, body_style),
                    Paragraph(str(c.position), body_style),
                    Paragraph(c.chain_id, body_style),
                    Paragraph(c.atom_name, body_style),
                    Paragraph(f"{c.distance_angstrom:.2f} Å", body_style),
                ])
            c_table = Table(contact_rows, colWidths=[105, 95, 95, 105, 123])
            c_table.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#f1f5f9")),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
                ("TOPPADDING", (0, 0), (-1, -1), 3),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
                ("LEFTPADDING", (0, 0), (-1, -1), 5),
                ("RIGHTPADDING", (0, 0), (-1, -1), 5),
            ]))
            story.append(c_table)
        else:
            story.append(Paragraph(f"<i>{ler.reason_unavailable}</i>", body_style))
        story.append(Spacer(1, 10))

        # 8. Gemma AI Interpretation
        story.append(Paragraph("6. Evidence-Grounded AI Research Interpretation", h2_style))
        air = report.ai_interpretation_report
        if air.status == "Available" and air.interpretation:
            story.append(Paragraph(f"<b>Gemma 4 Synthesis:</b> {air.interpretation}", body_style))
            if air.supporting_evidence:
                story.append(Spacer(1, 3))
                story.append(Paragraph("<b>Supporting Evidence Observations:</b>", body_bold))
                for ev in air.supporting_evidence:
                    story.append(Paragraph(f"• {ev}", body_style))
        else:
            story.append(Paragraph(f"<i>AI interpretation unavailable: {air.reason_unavailable}</i>", body_style))
        story.append(Spacer(1, 2))
        story.append(Paragraph(f"<i>{air.computational_role_note}</i>", disclaimer_style))
        story.append(Spacer(1, 10))

        # 9. Evidence Overview Table
        story.append(Paragraph("7. Independent 4-Pillar Evidence Summary", h2_style))
        overview_rows = [
            [
                Paragraph("<b>Evidence Pillar</b>", body_bold),
                Paragraph("<b>Status</b>", body_bold),
                Paragraph("<b>Source / Method</b>", body_bold),
                Paragraph("<b>Key Limitations</b>", body_bold),
            ]
        ]
        for item in report.evidence_overview:
            overview_rows.append([
                Paragraph(item.pillar_name, body_style),
                Paragraph(item.status, badge_style),
                Paragraph(item.source_or_method, body_style),
                Paragraph(item.limitations, body_style),
            ])
        ov_table = Table(overview_rows, colWidths=[130, 75, 140, 178])
        ov_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#f1f5f9")),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ("LEFTPADDING", (0, 0), (-1, -1), 5),
            ("RIGHTPADDING", (0, 0), (-1, -1), 5),
        ]))
        story.append(ov_table)
        story.append(Spacer(1, 10))

        # 10 & 11. Limitations & Suggested Investigations
        story.append(Paragraph("8. Scientific Limitations & Boundaries", h2_style))
        for lim in report.limitations:
            story.append(Paragraph(f"• {lim}", body_style))
        story.append(Spacer(1, 8))

        story.append(Paragraph("9. Suggested Further Investigations", h2_style))
        for inv in report.suggested_investigations:
            story.append(Paragraph(f"→ {inv}", body_style))
        story.append(Spacer(1, 10))

        # Provenance Table
        story.append(Paragraph("10. Data Provenance & Verification Audit Trail", h2_style))
        prov_rows = [
            [
                Paragraph("<b>Source</b>", body_bold),
                Paragraph("<b>Identifier</b>", body_bold),
                Paragraph("<b>Methodology</b>", body_bold),
                Paragraph("<b>Status</b>", body_bold),
            ]
        ]
        for p in report.provenance:
            prov_rows.append([
                Paragraph(p.source, body_style),
                Paragraph(p.identifier or "N/A", body_style),
                Paragraph(p.method or "Direct query", body_style),
                Paragraph(p.status or "VERIFIED", badge_style),
            ])
        prov_table = Table(prov_rows, colWidths=[120, 120, 203, 80])
        prov_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#f1f5f9")),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
            ("TOPPADDING", (0, 0), (-1, -1), 3),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
            ("LEFTPADDING", (0, 0), (-1, -1), 4),
            ("RIGHTPADDING", (0, 0), (-1, -1), 4),
        ]))
        story.append(prov_table)
        story.append(Spacer(1, 12))

        # Scientific Disclaimer Box
        disc_table = Table(
            [[Paragraph(f"<b>SCIENTIFIC DISCLAIMER:</b> {report.scientific_disclaimer}", disclaimer_style)]],
            colWidths=[523]
        )
        disc_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#fef2f2")),
            ("BOX", (0, 0), (-1, -1), 0.75, colors.HexColor("#fca5a5")),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ("LEFTPADDING", (0, 0), (-1, -1), 8),
            ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ]))
        story.append(disc_table)

        # Build PDF using NumberedCanvas
        doc.build(story, canvasmaker=NumberedCanvas)
        buffer.seek(0)
        return buffer.getvalue()

pdf_generator = PDFGenerator()
