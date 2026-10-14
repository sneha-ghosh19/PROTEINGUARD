import urllib.request
import json
import logging
from typing import Dict, Any, Optional
from app.core.cache import evidence_cache

logger = logging.getLogger(__name__)

class AlphaFoldService:
    """
    Interfaces with EMBL-EBI AlphaFold Database (AFDB) to retrieve high-accuracy
    in silico predicted 3D molecular structures as a verified computational fallback
    when no experimental structures are available in RCSB PDB.
    """
    AF_API_URL = "https://alphafold.ebi.ac.uk/api/prediction"
    AF_FILES_URL = "https://alphafold.ebi.ac.uk/files"

    def fetch_prediction(self, accession: str) -> Optional[Dict[str, Any]]:
        clean_acc = accession.strip().upper()
        cache_key = f"af:pred:{clean_acc}"
        cached = evidence_cache.get(cache_key)
        if cached is not None:
            return cached

        url = f"{self.AF_API_URL}/{clean_acc}"
        req = urllib.request.Request(
            url,
            headers={
                "User-Agent": "ProteinGuard/0.1.0 (Computational Biology Workstation)",
                "Accept": "application/json"
            }
        )

        try:
            with urllib.request.urlopen(req, timeout=8) as resp:
                if resp.status == 200:
                    data = json.loads(resp.read().decode('utf-8'))
                    if data and isinstance(data, list) and len(data) > 0:
                        entry = data[0]
                        entry_id = entry.get("entryId") or f"AF-{clean_acc}-F1"
                        global_plddt = entry.get("globalPlddt", 85.0)
                        
                        result = {
                            "entry_id": entry_id,
                            "pdb_url": entry.get("pdbUrl") or f"{self.AF_FILES_URL}/{entry_id}-model_v6.pdb",
                            "cif_url": entry.get("cifUrl") or f"{self.AF_FILES_URL}/{entry_id}-model_v6.cif",
                            "global_plddt": float(global_plddt) if global_plddt is not None else 85.0,
                            "uniprot_accession": clean_acc,
                            "uniprot_id": entry.get("uniprotId", clean_acc),
                            "protein_name": entry.get("uniprotDescription", ""),
                            "is_predicted": True,
                            "source": "AlphaFold DB v4 (In Silico Prediction)"
                        }
                        evidence_cache.set(cache_key, result)
                        return result
        except Exception as e:
            logger.info(f"AlphaFold DB prediction query for {clean_acc}: {str(e)}")

        evidence_cache.set(cache_key, None)
        return None

    def fetch_coordinates(self, entry_id: str, file_format: str = "pdb") -> Optional[str]:
        clean_id = entry_id.strip()
        ext = "pdb" if file_format.lower() == "pdb" else "cif"
        
        # Format filename: e.g. AF-Q86WV8-F1-model_v6.pdb
        if not clean_id.endswith("-model_v6"):
            filename = f"{clean_id}-model_v6.{ext}"
        else:
            filename = f"{clean_id}.{ext}"

        url = f"{self.AF_FILES_URL}/{filename}"
        req = urllib.request.Request(
            url,
            headers={"User-Agent": "ProteinGuard/0.1.0"}
        )

        try:
            with urllib.request.urlopen(req, timeout=12) as resp:
                if resp.status == 200:
                    return resp.read().decode('utf-8')
        except Exception as e:
            logger.warning(f"Failed to fetch AlphaFold coordinates from {url}: {str(e)}")

        return None

alphafold_service = AlphaFoldService()
