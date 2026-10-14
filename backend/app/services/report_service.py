from typing import Dict, Optional, Any
from app.services.analysis_service import analysis_service
from app.services.ai.service import ai_service
from app.services.report_assembler import report_assembler
from app.services.report_exporter import report_exporter
from app.services.pdf_generator import pdf_generator
from app.schemas.report import ResearchReport

class AnalysisNotFoundException(Exception):
    pass

REPORT_STORE: Dict[str, ResearchReport] = {}

class ReportService:
    """
    Central business logic service for Screen 5 Mutation Research Reports.
    Retrieves canonical analysis records, coordinates optional AI interpretation layer,
    assembles reports, caches generated reports by analysis_id, and handles multi-format exports.
    """

    async def get_or_generate_report(
        self,
        analysis_id: str,
        include_ai: bool = True,
        force_regenerate: bool = False
    ) -> ResearchReport:
        clean_id = analysis_id.strip()
        if not force_regenerate and clean_id in REPORT_STORE:
            return REPORT_STORE[clean_id]

        # Retrieve canonical analysis
        analysis = analysis_service.get_analysis_by_id(clean_id)
        if not analysis:
            raise AnalysisNotFoundException(f"Analysis '{clean_id}' not found.")

        # Attempt AI interpretation retrieval if requested
        ai_data: Optional[Dict[str, Any]] = analysis.ai_explanation
        if not ai_data and include_ai:
            try:
                acc = analysis.protein.accession
                pos = analysis.mutation["position"]
                mut = analysis.mutation["mutant"]
                ai_data = await ai_service.generate_report(acc, pos, mut)
            except Exception:
                # Failure of upstream AI does not invalidate scientific analysis
                ai_data = None

        report = report_assembler.assemble_report(analysis, ai_data=ai_data)
        REPORT_STORE[clean_id] = report
        return report

    async def export_pdf(self, analysis_id: str) -> bytes:
        report = await self.get_or_generate_report(analysis_id)
        return pdf_generator.generate_pdf(report)

    async def export_markdown(self, analysis_id: str) -> str:
        report = await self.get_or_generate_report(analysis_id)
        return report_exporter.export_markdown(report)

    async def export_json(self, analysis_id: str) -> str:
        report = await self.get_or_generate_report(analysis_id)
        return report_exporter.export_json(report)

report_service = ReportService()
