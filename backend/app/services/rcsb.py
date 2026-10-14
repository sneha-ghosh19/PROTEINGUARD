import urllib.request
import urllib.parse
import json
import re
import logging
from typing import Dict, Any, List, Optional
from app.services.uniprot import uniprot_service

logger = logging.getLogger(__name__)

class RCSBService:
    """
    Interfaces with RCSB PDB REST API and UniProt cross-references to dynamically discover,
    validate, and map 3D molecular structures for specific protein sequences and mutation sites.
    """
    RCSB_DATA_URL = "https://data.rcsb.org/rest/v1/core"

    def __init__(self):
        self._candidate_cache: Dict[str, List[Dict[str, Any]]] = {}
        self._mapping_cache: Dict[str, Dict[str, Any]] = {}
        self._entry_cache: Dict[str, Dict[str, Any]] = {}

    def fetch_candidate_structures_for_position(self, accession: str, position: int) -> List[Dict[str, Any]]:
        """
        Dynamically finds deposited PDB structures covering the specified sequence position
        using authoritative UniProt PDB cross-references.
        """
        clean_acc = accession.strip().upper()
        cache_key = f"{clean_acc}:{position}"
        if cache_key in self._candidate_cache:
            return self._candidate_cache[cache_key]

        pdb_xrefs = uniprot_service.fetch_pdb_cross_references(clean_acc)
        if not pdb_xrefs:
            self._candidate_cache[cache_key] = []
            return []

        candidates = []
        for xref in pdb_xrefs:
            pdb_id = xref.get("pdb_id")
            if not pdb_id:
                continue
            method = xref.get("method", "Unknown")
            res_str = xref.get("resolution", "-")
            chains_str = xref.get("chains", "")

            # Parse resolution float for sorting
            m_res = re.search(r'([\d\.]+)', res_str)
            res_val = float(m_res.group(1)) if m_res else 999.0

            # Parse chain ranges (e.g. "A/B/C=94-312" or "A=1-141, B=1-141")
            for part in chains_str.split(','):
                part = part.strip()
                if '=' in part:
                    c_part, r_part = part.split('=', 1)
                    chains = [c.strip() for c in c_part.split('/') if c.strip()]
                    m_r = re.search(r'(-?\d+)\s*-\s*(-?\d+)', r_part)
                    if m_r:
                        start = int(m_r.group(1))
                        end = int(m_r.group(2))
                        if start <= position <= end:
                            candidates.append({
                                "pdb_id": pdb_id.upper(),
                                "chain": chains[0] if chains else "A",
                                "start": start,
                                "end": end,
                                "method": method,
                                "resolution_val": res_val,
                                "resolution": res_str if res_str != "-" else "N/A"
                            })

        # Rank candidates: prioritize high-resolution X-ray and Cryo-EM over NMR or coarse structures
        candidates.sort(key=lambda x: (
            0 if ("X-ray" in x["method"] or "Electron" in x["method"] or "EM" in x["method"]) else 1,
            x["resolution_val"]
        ))

        self._candidate_cache[cache_key] = candidates
        return candidates

    def map_uniprot_to_structure(self, accession: str, position: int, pdb_id: str) -> Dict[str, Any]:
        """
        Maps a UniProt sequence position to the author's structure residue numbering and chain
        using RCSB PDB entity alignment and SIFTS data.
        """
        clean_acc = accession.strip().upper()
        clean_pdb = pdb_id.strip().upper()
        map_cache_key = f"{clean_acc}:{position}:{clean_pdb}"
        if map_cache_key in self._mapping_cache:
            return self._mapping_cache[map_cache_key]

        url_entry = f"{self.RCSB_DATA_URL}/entry/{clean_pdb}"
        req = urllib.request.Request(url_entry, headers={"User-Agent": "ProteinGuard/0.1.0", "Accept": "application/json"})

        try:
            with urllib.request.urlopen(req, timeout=3) as resp:
                entry = json.loads(resp.read().decode('utf-8'))
        except Exception as e:
            logger.warning(f"Failed to fetch RCSB entry {clean_pdb}: {str(e)}")
            return {"status": "unmapped", "reason": f"Unable to fetch structure {clean_pdb} from RCSB PDB."}

        polymer_entity_ids = entry.get("rcsb_entry_container_identifiers", {}).get("polymer_entity_ids", [])
        if not polymer_entity_ids:
            return {"status": "unmapped", "reason": f"No polymer entities found for {clean_pdb}."}

        matched_entity = None
        matched_region = None
        auth_chain = None
        asym_id = None

        for entity_id in polymer_entity_ids[:3]:
            url_entity = f"{self.RCSB_DATA_URL}/polymer_entity/{clean_pdb}/{entity_id}"
            req_e = urllib.request.Request(url_entity, headers={"User-Agent": "ProteinGuard/0.1.0", "Accept": "application/json"})
            try:
                with urllib.request.urlopen(req_e, timeout=3) as resp_e:
                    entity_data = json.loads(resp_e.read().decode('utf-8'))
            except Exception:
                continue

            aligns = entity_data.get("rcsb_polymer_entity_align", [])
            for align in aligns:
                if align.get("reference_database_accession") == clean_acc:
                    for region in align.get("aligned_regions", []):
                        ref_beg = region.get("ref_beg_seq_id")
                        length = region.get("length")
                        if ref_beg is not None and length is not None and (ref_beg <= position <= ref_beg + length - 1):
                            matched_entity = entity_data
                            matched_region = region
                            idents = entity_data.get("rcsb_polymer_entity_container_identifiers", {})
                            asym_ids = idents.get("asym_ids", [])
                            auth_asym_ids = idents.get("auth_asym_ids", [])
                            if asym_ids:
                                asym_id = asym_ids[0]
                                auth_chain = auth_asym_ids[0] if auth_asym_ids else asym_id
                            break
            if matched_entity:
                break

        if not matched_entity or not asym_id:
            return {"status": "unmapped", "reason": f"Residue position {position} not aligned to {clean_pdb}."}

        # Query polymer instance to retrieve exact author residue number mapping
        url_instance = f"{self.RCSB_DATA_URL}/polymer_entity_instance/{clean_pdb}/{asym_id}"
        req_inst = urllib.request.Request(url_instance, headers={"User-Agent": "ProteinGuard/0.1.0", "Accept": "application/json"})
        try:
            with urllib.request.urlopen(req_inst, timeout=3) as resp_inst:
                instance_data = json.loads(resp_inst.read().decode('utf-8'))
        except Exception as e:
            logger.warning(f"Failed to fetch polymer instance {clean_pdb}/{asym_id}: {str(e)}")
            return {"status": "unmapped", "reason": f"Could not retrieve residue mapping for chain {auth_chain}."}

        inst_idents = instance_data.get("rcsb_polymer_entity_instance_container_identifiers", {})
        auth_mapping = inst_idents.get("auth_to_entity_poly_seq_mapping", [])

        ref_beg = matched_region.get("ref_beg_seq_id")
        entity_beg = matched_region.get("entity_beg_seq_id", 1)
        entity_idx = position - ref_beg + entity_beg - 1

        if 0 <= entity_idx < len(auth_mapping):
            raw_mapped_residue = auth_mapping[entity_idx]
            try:
                mapped_residue_int = int(re.sub(r'[^\d-]', '', raw_mapped_residue))
            except Exception:
                mapped_residue_int = position

            seq = matched_entity.get("entity_poly", {}).get("pdbx_seq_one_letter_code_can", "")
            residue_char = seq[entity_idx] if entity_idx < len(seq) else None

            return {
                "status": "verified",
                "pdb_id": clean_pdb,
                "chain": auth_chain,
                "mapped_residue": mapped_residue_int,
                "structure_residue": residue_char,
                "entity_index": entity_idx + 1
            }

        return {"status": "unmapped", "reason": f"Position {position} falls outside the resolved coordinates of {clean_pdb}."}

    def fetch_pdb_entry_summary(self, pdb_id: str) -> Dict[str, Any]:
        """
        Fetch PDB entry metadata from RCSB REST API.
        """
        clean_pdb = pdb_id.strip().upper()
        url = f"{self.RCSB_DATA_URL}/entry/{clean_pdb}"
        
        req = urllib.request.Request(
            url,
            headers={
                "User-Agent": "ProteinGuard/0.1.0",
                "Accept": "application/json"
            }
        )

        try:
            with urllib.request.urlopen(req, timeout=10) as response:
                if response.status == 200:
                    data = json.loads(response.read().decode('utf-8'))
                    entry_info = data.get("rcsb_entry_info", {})
                    resolution = entry_info.get("resolution_combined", [None])[0]
                    method = data.get("exptl", [{}])[0].get("method", "X-ray Diffraction")
                    title = data.get("struct", {}).get("title", f"PDB Entry {clean_pdb}")
                    return {
                        "pdb_id": clean_pdb,
                        "title": title,
                        "experimental_method": method,
                        "resolution": f"{resolution} Å" if resolution else "N/A",
                        "source": "RCSB PDB API"
                    }
        except Exception as e:
            logger.warning(f"Failed to fetch PDB summary for {clean_pdb}: {str(e)}")
        
        return {
            "pdb_id": clean_pdb,
            "title": f"PDB Entry {clean_pdb}",
            "experimental_method": "X-ray Diffraction",
            "resolution": "N/A",
            "source": "RCSB PDB API"
        }

    def fetch_structure_coordinates(self, pdb_id: str, file_format: str = "cif") -> Optional[str]:
        """
        Retrieves real molecular coordinates from RCSB PDB for a verified structure ID.
        """
        clean_pdb = pdb_id.strip().upper()
        ext = "cif" if file_format.lower() in ("cif", "mmcif") else "pdb"
        url = f"https://files.rcsb.org/download/{clean_pdb}.{ext}"
        req = urllib.request.Request(url, headers={"User-Agent": "ProteinGuard/0.1.0"})
        try:
            with urllib.request.urlopen(req, timeout=10) as response:
                if response.status == 200:
                    return response.read().decode('utf-8')
        except Exception as e:
            logger.warning(f"Failed to fetch {ext} coordinates for {clean_pdb}: {str(e)}")
        return None

rcsb_service = RCSBService()

