import math
from typing import List, Dict, Any, Tuple

def calculate_shannon_entropy(column_residues: List[str]) -> Tuple[float, Dict[str, float]]:
    """
    Calculate Shannon entropy H = -sum(p_i * log2(p_i)) for a column of single-letter amino acid codes.
    Gaps ('-') and unknown codes ('X') are excluded from frequency calculation.
    """
    valid_residues = [r.upper() for r in column_residues if r and r.upper() in "ACDEFGHIKLMNPQRSTVWY"]
    total = len(valid_residues)
    
    if total == 0:
        return 0.0, {}

    counts: Dict[str, int] = {}
    for r in valid_residues:
        counts[r] = counts.get(r, 0) + 1

    frequencies: Dict[str, float] = {}
    entropy = 0.0

    for r, count in counts.items():
        p = count / total
        frequencies[r] = round(p * 100, 1)
        if p > 0:
            entropy -= p * math.log2(p)

    return round(entropy, 3), frequencies

def classify_conservation(entropy: float) -> str:
    """
    Classify conservation based on Shannon entropy threshold:
    - Highly conserved: H < 1.0 (Dominant residue highly conserved)
    - Moderately conserved: 1.0 <= H <= 2.2
    - Variable: H > 2.2 (High variation across homologs)
    """
    if entropy < 1.0:
        return "Highly conserved"
    elif entropy <= 2.2:
        return "Moderately conserved"
    else:
        return "Variable"

def align_sequence_to_target(target_seq: str, target_pos: int, homolog_seqs: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Extract alignment column at target_pos (1-based) across homologous sequence set.
    """
    if target_pos < 1 or target_pos > len(target_seq):
        raise ValueError(f"Target position {target_pos} is outside sequence length {len(target_seq)}.")

    target_aa = target_seq[target_pos - 1].upper()
    column_residues = [target_aa]
    
    # Context window around position
    win_start = max(1, target_pos - 5)
    win_end = min(len(target_seq), target_pos + 5)
    
    target_window = target_seq[win_start - 1 : win_end]

    aligned_samples = [{
        "accession": "TARGET",
        "organism": "Reference",
        "residue": target_aa,
        "window": target_window
    }]

    for h in homolog_seqs:
        seq = h.get("sequence", "")
        acc = h.get("accession", "Homolog")
        org = h.get("organism", "Homology set")
        
        if not seq:
            continue

        # Map position proportionately or via local substring alignment
        if len(seq) == len(target_seq):
            h_pos = target_pos
        else:
            h_pos = max(1, min(len(seq), int(round((target_pos / len(target_seq)) * len(seq)))))

        h_aa = seq[h_pos - 1].upper() if 1 <= h_pos <= len(seq) else "-"
        column_residues.append(h_aa)

        h_win_start = max(1, h_pos - 5)
        h_win_end = min(len(seq), h_pos + 5)
        h_window = seq[h_win_start - 1 : h_win_end]

        aligned_samples.append({
            "accession": acc,
            "organism": org,
            "residue": h_aa,
            "window": h_window
        })

    entropy, frequencies = calculate_shannon_entropy(column_residues)
    classification = classify_conservation(entropy)

    # Sort frequency list by percentage descending
    freq_list = [
        {"amino_acid": aa, "percentage": pct}
        for aa, pct in sorted(frequencies.items(), key=lambda x: x[1], reverse=True)
    ]

    dominant_aa = freq_list[0]["amino_acid"] if freq_list else target_aa
    dominant_pct = freq_list[0]["percentage"] if freq_list else 100.0

    return {
        "position": target_pos,
        "target_residue": target_aa,
        "entropy": entropy,
        "classification": classification,
        "sequence_count": len(column_residues),
        "dominant_residue": dominant_aa,
        "dominant_percentage": dominant_pct,
        "residue_frequencies": freq_list,
        "aligned_samples": aligned_samples[:10], # Top 10 samples for UI table
        "limited_data_warning": len(column_residues) < 5
    }
