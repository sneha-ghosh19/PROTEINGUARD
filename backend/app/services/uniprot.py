import urllib.request
import urllib.parse
import json
import logging
from typing import Dict, Any, List, Optional

logger = logging.getLogger(__name__)

class ProteinNotFoundException(Exception):
    def __init__(self, accession: str):
        self.accession = accession
        super().__init__(f"Protein not found for accession or identifier '{accession}'.")

class UniProtServiceException(Exception):
    def __init__(self, message: str):
        super().__init__(message)

class UniProtService:
    BASE_URL = "https://rest.uniprot.org/uniprotkb"

    def fetch_by_accession(self, accession: str) -> Dict[str, Any]:
        """
        Fetch normalized protein entry from UniProt REST API by accession (e.g., P04637).
        """
        clean_acc = accession.strip().upper()
        if not clean_acc:
            raise ProteinNotFoundException("Empty accession")

        url = f"{self.BASE_URL}/{clean_acc}.json"
        
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
                    return self._normalize_uniprot_entry(data)
                else:
                    raise ProteinNotFoundException(clean_acc)
        except urllib.error.HTTPError as e:
            if e.code in (400, 404):
                # Try search as fallback for gene symbol/keywords
                try:
                    search_result = self.search_proteins(clean_acc, limit=1)
                    if search_result and len(search_result) > 0:
                        return search_result[0]
                except Exception:
                    pass
                raise ProteinNotFoundException(clean_acc)
            else:
                logger.error(f"UniProt HTTP error {e.code} for accession {clean_acc}: {e.reason}")
                raise UniProtServiceException(f"UniProt service returned status {e.code}")
        except ProteinNotFoundException:
            raise
        except Exception as e:
            logger.error(f"Failed to fetch protein {clean_acc}: {str(e)}")
            raise UniProtServiceException("Unable to connect to UniProt REST API right now.")

    def search_proteins(self, query_str: str, limit: int = 5) -> List[Dict[str, Any]]:
        """
        Search UniProt database by protein name, gene symbol, or accession.
        """
        clean_q = query_str.strip()
        if not clean_q:
            return []

        query_param = f"(gene:{clean_q}) OR (protein_name:{clean_q}) OR (accession:{clean_q}) OR ({clean_q})"
        params = urllib.parse.urlencode({
            "query": query_param,
            "format": "json",
            "size": limit
        })

        url = f"{self.BASE_URL}/search?{params}"
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
                    return [self._normalize_uniprot_entry(item) for item in results]
                return []
        except Exception as e:
            logger.warning(f"UniProt search query error for '{clean_q}': {str(e)}")
            return []

    def _normalize_uniprot_entry(self, entry: Dict[str, Any]) -> Dict[str, Any]:
        """
        Extract and normalize essential UniProt fields.
        """
        accession = entry.get("primaryAccession", "")
        
        protein_description = entry.get("proteinDescription", {})
        recommended_name = protein_description.get("recommendedName", {})
        full_name_obj = recommended_name.get("fullName", {})
        protein_name = full_name_obj.get("value", "") if isinstance(full_name_obj, dict) else ""
        
        if not protein_name:
            submission_names = protein_description.get("submissionNames", [])
            if submission_names and len(submission_names) > 0:
                protein_name = submission_names[0].get("fullName", {}).get("value", "")

        if not protein_name:
            protein_name = f"Protein {accession}"

        genes = entry.get("genes", [])
        gene_name = ""
        if genes and len(genes) > 0:
            primary_gene = genes[0].get("geneName", {})
            gene_name = primary_gene.get("value", "")

        organism_obj = entry.get("organism", {})
        organism_name = organism_obj.get("scientificName", "")
        if not organism_name:
            organism_name = organism_obj.get("commonName", "Unknown Organism")

        sequence_obj = entry.get("sequence", {})
        sequence = sequence_obj.get("value", "")
        length = sequence_obj.get("length", len(sequence))

        comments = entry.get("comments", [])
        description = ""
        for comment in comments:
            if comment.get("commentType") == "FUNCTION":
                texts = comment.get("texts", [])
                if texts:
                    description = texts[0].get("value", "")
                    break

        if not description:
            description = f"Amino acid sequence of {protein_name} ({organism_name})."

        pdb_xrefs = []
        for xref in entry.get("uniProtKBCrossReferences", []):
            if xref.get("database") == "PDB":
                props = {item.get("key"): item.get("value") for item in xref.get("properties", []) if "key" in item}
                pdb_xrefs.append({
                    "pdb_id": xref.get("id"),
                    "method": props.get("Method", "Unknown"),
                    "resolution": props.get("Resolution", "-"),
                    "chains": props.get("Chains", "")
                })

        return {
            "accession": accession,
            "protein_name": protein_name,
            "gene_name": gene_name or "N/A",
            "organism": organism_name,
            "length": length,
            "sequence": sequence,
            "description": description,
            "source": "UniProt",
            "pdb_cross_references": pdb_xrefs
        }

    def fetch_pdb_cross_references(self, accession: str) -> List[Dict[str, Any]]:
        """
        Fetch all experimental PDB cross-references deposited for this protein accession.
        """
        entry = self.fetch_by_accession(accession)
        return entry.get("pdb_cross_references", [])

uniprot_service = UniProtService()
