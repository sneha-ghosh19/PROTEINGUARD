"""
Amino Acid Property Reference Database
======================================
Scientifically curated property dataset for the 20 standard amino acids.

References:
1. Kyte J, Doolittle RF. A simple method for displaying the hydropathic character of a protein.
   J Mol Biol. 1982 May 5;157(1):105-32. (Kyte-Doolittle Hydrophobicity Scale)
2. Zamyatnin AA. Protein volume in solution. Prog Biophys Mol Biol. 1972;24:107-23. (Apparent Molar Volume in Å³)
3. CRC Handbook of Chemistry and Physics, 104th Edition (2023). (Molecular Weights & pKa derived charges at pH 7.4)
"""

from typing import Dict, Any, List, Optional

AMINO_ACID_DATA: Dict[str, Dict[str, Any]] = {
    "A": {
        "code": "A",
        "three_letter": "Ala",
        "name": "Alanine",
        "molecular_weight": 89.09,
        "charge": 0,
        "charge_label": "Neutral",
        "polarity": "nonpolar",
        "hydrophobicity": 1.8,  # Kyte-Doolittle
        "side_chain_class": "Aliphatic",
        "volume": 88.6,  # Zamyatnin Å³
        "aromatic": False,
        "description": "Small, nonpolar aliphatic side chain (methyl group)."
    },
    "R": {
        "code": "R",
        "three_letter": "Arg",
        "name": "Arginine",
        "molecular_weight": 174.20,
        "charge": 1,
        "charge_label": "Positive (+1)",
        "polarity": "polar",
        "hydrophobicity": -4.5,
        "side_chain_class": "Basic",
        "volume": 173.4,
        "aromatic": False,
        "description": "Positively charged, strongly basic guanidino group."
    },
    "N": {
        "code": "N",
        "three_letter": "Asn",
        "name": "Asparagine",
        "molecular_weight": 132.12,
        "charge": 0,
        "charge_label": "Neutral",
        "polarity": "polar",
        "hydrophobicity": -3.5,
        "side_chain_class": "Amide",
        "volume": 114.1,
        "aromatic": False,
        "description": "Uncharged polar side chain with carboxamide group."
    },
    "D": {
        "code": "D",
        "three_letter": "Asp",
        "name": "Aspartic acid",
        "molecular_weight": 133.10,
        "charge": -1,
        "charge_label": "Negative (-1)",
        "polarity": "polar",
        "hydrophobicity": -3.5,
        "side_chain_class": "Acidic",
        "volume": 111.1,
        "aromatic": False,
        "description": "Negatively charged acidic side chain (carboxylate)."
    },
    "C": {
        "code": "C",
        "three_letter": "Cys",
        "name": "Cysteine",
        "molecular_weight": 121.16,
        "charge": 0,
        "charge_label": "Neutral",
        "polarity": "nonpolar",
        "hydrophobicity": 2.5,
        "side_chain_class": "Sulfurous",
        "volume": 108.5,
        "aromatic": False,
        "description": "Thiol-containing side chain capable of disulfide bonding."
    },
    "Q": {
        "code": "Q",
        "three_letter": "Gln",
        "name": "Glutamine",
        "molecular_weight": 146.15,
        "charge": 0,
        "charge_label": "Neutral",
        "polarity": "polar",
        "hydrophobicity": -3.5,
        "side_chain_class": "Amide",
        "volume": 143.8,
        "aromatic": False,
        "description": "Uncharged polar side chain with extended carboxamide group."
    },
    "E": {
        "code": "E",
        "three_letter": "Glu",
        "name": "Glutamic acid",
        "molecular_weight": 147.13,
        "charge": -1,
        "charge_label": "Negative (-1)",
        "polarity": "polar",
        "hydrophobicity": -3.5,
        "side_chain_class": "Acidic",
        "volume": 138.4,
        "aromatic": False,
        "description": "Negatively charged acidic side chain with longer chain length."
    },
    "G": {
        "code": "G",
        "three_letter": "Gly",
        "name": "Glycine",
        "molecular_weight": 75.07,
        "charge": 0,
        "charge_label": "Neutral",
        "polarity": "nonpolar",
        "hydrophobicity": -0.4,
        "side_chain_class": "Aliphatic",
        "volume": 60.1,
        "aromatic": False,
        "description": "Smallest amino acid (hydrogen atom side chain); high conformational flexibility."
    },
    "H": {
        "code": "H",
        "three_letter": "His",
        "name": "Histidine",
        "molecular_weight": 155.16,
        "charge": 0,  # Ionizable at physiological pH, treated as 0 for baseline pH 7.4
        "charge_label": "Weakly Positive (pKa ~6.0)",
        "polarity": "polar",
        "hydrophobicity": -3.2,
        "side_chain_class": "Basic / Aromatic",
        "volume": 153.2,
        "aromatic": True,
        "description": "Imidazole ring side chain; key catalytic proton donor/acceptor."
    },
    "I": {
        "code": "I",
        "three_letter": "Ile",
        "name": "Isoleucine",
        "molecular_weight": 131.17,
        "charge": 0,
        "charge_label": "Neutral",
        "polarity": "nonpolar",
        "hydrophobicity": 4.5,
        "side_chain_class": "Aliphatic",
        "volume": 166.7,
        "aromatic": False,
        "description": "Branched-chain hydrophobic aliphatic side chain."
    },
    "L": {
        "code": "L",
        "three_letter": "Leu",
        "name": "Leucine",
        "molecular_weight": 131.17,
        "charge": 0,
        "charge_label": "Neutral",
        "polarity": "nonpolar",
        "hydrophobicity": 3.8,
        "side_chain_class": "Aliphatic",
        "volume": 166.7,
        "aromatic": False,
        "description": "Branched hydrophobic aliphatic side chain isomer."
    },
    "K": {
        "code": "K",
        "three_letter": "Lys",
        "name": "Lysine",
        "molecular_weight": 146.19,
        "charge": 1,
        "charge_label": "Positive (+1)",
        "polarity": "polar",
        "hydrophobicity": -3.9,
        "side_chain_class": "Basic",
        "volume": 168.6,
        "aromatic": False,
        "description": "Positively charged basic side chain with primary amino group."
    },
    "M": {
        "code": "M",
        "three_letter": "Met",
        "name": "Methionine",
        "molecular_weight": 149.21,
        "charge": 0,
        "charge_label": "Neutral",
        "polarity": "nonpolar",
        "hydrophobicity": 1.9,
        "side_chain_class": "Sulfurous",
        "volume": 162.9,
        "aromatic": False,
        "description": "Nonpolar thioether side chain; common initiation codon residue."
    },
    "F": {
        "code": "F",
        "three_letter": "Phe",
        "name": "Phenylalanine",
        "molecular_weight": 165.19,
        "charge": 0,
        "charge_label": "Neutral",
        "polarity": "nonpolar",
        "hydrophobicity": 2.8,
        "side_chain_class": "Aromatic",
        "volume": 189.9,
        "aromatic": True,
        "description": "Bulky nonpolar aromatic phenyl ring."
    },
    "P": {
        "code": "P",
        "three_letter": "Pro",
        "name": "Proline",
        "molecular_weight": 115.13,
        "charge": 0,
        "charge_label": "Neutral",
        "polarity": "nonpolar",
        "hydrophobicity": -1.6,
        "side_chain_class": "Cyclic",
        "volume": 112.7,
        "aromatic": False,
        "description": "Rigid cyclic imino acid creating secondary structure turns/kinks."
    },
    "S": {
        "code": "S",
        "three_letter": "Ser",
        "name": "Serine",
        "molecular_weight": 105.09,
        "charge": 0,
        "charge_label": "Neutral",
        "polarity": "polar",
        "hydrophobicity": -0.8,
        "side_chain_class": "Hydroxylated",
        "volume": 89.0,
        "aromatic": False,
        "description": "Polar hydroxylated side chain; key site for phosphorylation."
    },
    "T": {
        "code": "T",
        "three_letter": "Thr",
        "name": "Threonine",
        "molecular_weight": 119.12,
        "charge": 0,
        "charge_label": "Neutral",
        "polarity": "polar",
        "hydrophobicity": -0.7,
        "side_chain_class": "Hydroxylated",
        "volume": 116.1,
        "aromatic": False,
        "description": "Polar hydroxylated side chain with secondary methyl group."
    },
    "W": {
        "code": "W",
        "three_letter": "Trp",
        "name": "Tryptophan",
        "molecular_weight": 204.23,
        "charge": 0,
        "charge_label": "Neutral",
        "polarity": "nonpolar",
        "hydrophobicity": -0.9,
        "side_chain_class": "Aromatic",
        "volume": 227.8,
        "aromatic": True,
        "description": "Largest amino acid; bulky aromatic indole ring system."
    },
    "Y": {
        "code": "Y",
        "three_letter": "Tyr",
        "name": "Tyrosine",
        "molecular_weight": 181.19,
        "charge": 0,
        "charge_label": "Neutral",
        "polarity": "polar",
        "hydrophobicity": -1.3,
        "side_chain_class": "Aromatic",
        "volume": 193.6,
        "aromatic": True,
        "description": "Amphipathic aromatic phenol ring; target for phosphorylation."
    },
    "V": {
        "code": "V",
        "three_letter": "Val",
        "name": "Valine",
        "molecular_weight": 117.15,
        "charge": 0,
        "charge_label": "Neutral",
        "polarity": "nonpolar",
        "hydrophobicity": 4.2,
        "side_chain_class": "Aliphatic",
        "volume": 140.0,
        "aromatic": False,
        "description": "Branched-chain hydrophobic aliphatic residue."
    }
}

ALL_AMINO_ACID_CODES: List[str] = sorted(list(AMINO_ACID_DATA.keys()))

def get_amino_acid(code: str) -> Optional[Dict[str, Any]]:
    """Retrieve property dictionary for a 1-letter amino acid code."""
    if not code:
        return None
    return AMINO_ACID_DATA.get(code.strip().upper())
