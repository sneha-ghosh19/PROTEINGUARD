import urllib.request
import urllib.parse
import json
import logging
from typing import Dict, Any, List
from app.services.uniprot import uniprot_service
from app.services.alignment import align_sequence_to_target
from app.core.cache import evidence_cache

logger = logging.getLogger(__name__)

class ConservationService:
    """
    Retrieves homologous protein sequence sets and computes Shannon entropy conservation metrics.
    """
    def analyze_position_conservation(self, accession: str, position: int) -> Dict[str, Any]:
        cache_key = f"{accession}:{position}:conservation:v1"
        cached = evidence_cache.get(cache_key)
        if cached:
            return cached

        # Fetch reference target protein
        target = uniprot_service.fetch_by_accession(accession)
        sequence = target["sequence"]
        gene_name = target.get("gene_name", "")

        # Collect homologous sequence set
        homologs = self._fetch_homologous_sequences(accession, gene_name, target["organism"])

        # Execute alignment & Shannon entropy computation
        results = align_sequence_to_target(sequence, position, homologs)
        
        analysis = {
            "protein_accession": accession,
            "gene_name": gene_name,
            "position": position,
            "target_residue": results["target_residue"],
            "method": "Multiple Sequence Alignment (UniProt Ortholog Set)",
            "entropy": results["entropy"],
            "classification": results["classification"],
            "sequence_count": results["sequence_count"],
            "dominant_residue": results["dominant_residue"],
            "dominant_percentage": results["dominant_percentage"],
            "residue_frequencies": results["residue_frequencies"],
            "aligned_samples": results["aligned_samples"],
            "limited_data_warning": results["limited_data_warning"]
        }

        evidence_cache.set(cache_key, analysis)
        return analysis

    def _fetch_homologous_sequences(self, accession: str, gene_name: str, organism: str) -> List[Dict[str, Any]]:
        """
        Query UniProt for reviewed homologous proteins in the same gene family across species.
        """
        if not gene_name or gene_name == "N/A":
            return []

        query = f"(gene_exact:{gene_name}) AND reviewed:true NOT (accession:{accession})"
        params = urllib.parse.urlencode({
            "query": query,
            "format": "json",
            "size": 15
        })

        url = f"https://rest.uniprot.org/uniprotkb/search?{params}"
        req = urllib.request.Request(
            url,
            headers={
                "User-Agent": "ProteinGuard/0.1.0 (Educational Mutation Analysis Platform)",
                "Accept": "application/json"
            }
        )

        try:
            with urllib.request.urlopen(req, timeout=10) as response:
                if response.status == 200:
                    data = json.loads(response.read().decode('utf-8'))
                    results = data.get("results", [])
                    homologs = []
                    for entry in results:
                        acc = entry.get("primaryAccession", "")
                        seq_obj = entry.get("sequence", {})
                        seq = seq_obj.get("value", "")
                        org = entry.get("organism", {}).get("scientificName", "Homolog")
                        if seq and acc != accession:
                            homologs.append({
                                "accession": acc,
                                "organism": org,
                                "sequence": seq
                            })
                    return homologs
                return []
        except Exception as e:
            logger.warning(f"Failed to fetch homologs for gene {gene_name}: {str(e)}")
            return []

conservation_service = ConservationService()
