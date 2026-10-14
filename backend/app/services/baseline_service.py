import os
import csv
import re
import json
import logging
from typing import Dict, Any, List, Tuple, Optional
import numpy as np
from scipy.stats import spearmanr, pearsonr
from sklearn.linear_model import Ridge
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_squared_error
import joblib

from app.data.amino_acids import AMINO_ACID_DATA, get_amino_acid

logger = logging.getLogger(__name__)

# Standard Henikoff & Henikoff BLOSUM62 log-odds substitution scoring matrix
BLOSUM62_MATRIX: Dict[str, Dict[str, int]] = {
    'A': {'A': 4, 'R': -1, 'N': -2, 'D': -2, 'C': 0, 'Q': -1, 'E': -1, 'G': 0, 'H': -2, 'I': -1, 'L': -1, 'K': -1, 'M': -1, 'F': -2, 'P': -1, 'S': 1, 'T': 0, 'W': -3, 'Y': -2, 'V': 0},
    'R': {'A': -1, 'R': 5, 'N': 0, 'D': -2, 'C': -3, 'Q': 1, 'E': 0, 'G': -2, 'H': 0, 'I': -3, 'L': -2, 'K': 2, 'M': -1, 'F': -3, 'P': -2, 'S': -1, 'T': -1, 'W': -3, 'Y': -2, 'V': -3},
    'N': {'A': -2, 'R': 0, 'N': 6, 'D': 1, 'C': -3, 'Q': 0, 'E': 0, 'G': 0, 'H': 1, 'I': -3, 'L': -3, 'K': 0, 'M': -2, 'F': -3, 'P': -2, 'S': 1, 'T': 0, 'W': -4, 'Y': -2, 'V': -3},
    'D': {'A': -2, 'R': -2, 'N': 1, 'D': 6, 'C': -3, 'Q': 0, 'E': 2, 'G': -1, 'H': -1, 'I': -3, 'L': -4, 'K': -1, 'M': -3, 'F': -3, 'P': -1, 'S': 0, 'T': -1, 'W': -4, 'Y': -3, 'V': -3},
    'C': {'A': 0, 'R': -3, 'N': -3, 'D': -3, 'C': 9, 'Q': -3, 'E': -4, 'G': -3, 'H': -3, 'I': -1, 'L': -1, 'K': -3, 'M': -1, 'F': -2, 'P': -3, 'S': -1, 'T': -1, 'W': -2, 'Y': -2, 'V': -1},
    'Q': {'A': -1, 'R': 1, 'N': 0, 'D': 0, 'C': -3, 'Q': 5, 'E': 2, 'G': -2, 'H': 0, 'I': -3, 'L': -2, 'K': 1, 'M': 0, 'F': -3, 'P': -1, 'S': 0, 'T': -1, 'W': -2, 'Y': -1, 'V': -2},
    'E': {'A': -1, 'R': 0, 'N': 0, 'D': 2, 'C': -4, 'Q': 2, 'E': 5, 'G': -2, 'H': 0, 'I': -3, 'L': -3, 'K': 1, 'M': -2, 'F': -3, 'P': -1, 'S': 0, 'T': -1, 'W': -3, 'Y': -2, 'V': -2},
    'G': {'A': 0, 'R': -2, 'N': 0, 'D': -1, 'C': -3, 'Q': -2, 'E': -2, 'G': 6, 'H': -2, 'I': -4, 'L': -4, 'K': -2, 'M': -3, 'F': -3, 'P': -2, 'S': 0, 'T': -2, 'W': -2, 'Y': -3, 'V': -3},
    'H': {'A': -2, 'R': 0, 'N': 1, 'D': -1, 'C': -3, 'Q': 0, 'E': 0, 'G': -2, 'H': 8, 'I': -3, 'L': -3, 'K': -1, 'M': -2, 'F': -1, 'P': -2, 'S': -1, 'T': -2, 'W': -2, 'Y': 2, 'V': -3},
    'I': {'A': -1, 'R': -3, 'N': -3, 'D': -3, 'C': -1, 'Q': -3, 'E': -3, 'G': -4, 'H': -3, 'I': 4, 'L': 2, 'K': -3, 'M': 1, 'F': 0, 'P': -3, 'S': -2, 'T': -1, 'W': -3, 'Y': -1, 'V': 3},
    'L': {'A': -1, 'R': -2, 'N': -3, 'D': -4, 'C': -1, 'Q': -2, 'E': -3, 'G': -4, 'H': -3, 'I': 2, 'L': 4, 'K': -2, 'M': 2, 'F': 0, 'P': -3, 'S': -2, 'T': -1, 'W': -2, 'Y': -1, 'V': 1},
    'K': {'A': -1, 'R': 2, 'N': 0, 'D': -1, 'C': -3, 'Q': 1, 'E': 1, 'G': -2, 'H': -1, 'I': -3, 'L': -2, 'K': 5, 'M': -1, 'F': -3, 'P': -1, 'S': 0, 'T': -1, 'W': -3, 'Y': -2, 'V': -2},
    'M': {'A': -1, 'R': -1, 'N': -2, 'D': -3, 'C': -1, 'Q': 0, 'E': -2, 'G': -3, 'H': -2, 'I': 1, 'L': 2, 'K': -1, 'M': 5, 'F': 0, 'P': -2, 'S': -1, 'T': -1, 'W': -1, 'Y': -1, 'V': 1},
    'F': {'A': -2, 'R': -3, 'N': -3, 'D': -3, 'C': -2, 'Q': -3, 'E': -3, 'G': -3, 'H': -1, 'I': 0, 'L': 0, 'K': -3, 'M': 0, 'F': 6, 'P': -4, 'S': -2, 'T': -2, 'W': 1, 'Y': 3, 'V': -1},
    'P': {'A': -1, 'R': -2, 'N': -2, 'D': -1, 'C': -3, 'Q': -1, 'E': -1, 'G': -2, 'H': -2, 'I': -3, 'L': -3, 'K': -1, 'M': -2, 'F': -4, 'P': 7, 'S': -1, 'T': -1, 'W': -4, 'Y': -3, 'V': -2},
    'S': {'A': 1, 'R': -1, 'N': 1, 'D': 0, 'C': -1, 'Q': 0, 'E': 0, 'G': 0, 'H': -1, 'I': -2, 'L': -2, 'K': 0, 'M': -1, 'F': -2, 'P': -1, 'S': 4, 'T': 1, 'W': -3, 'Y': -2, 'V': -2},
    'T': {'A': 0, 'R': -1, 'N': 0, 'D': -1, 'C': -1, 'Q': -1, 'E': -1, 'G': -2, 'H': -2, 'I': -1, 'L': -1, 'K': -1, 'M': -1, 'F': -2, 'P': -1, 'S': 1, 'T': 5, 'W': -2, 'Y': -2, 'V': 0},
    'W': {'A': -3, 'R': -3, 'N': -4, 'D': -4, 'C': -2, 'Q': -2, 'E': -3, 'G': -2, 'H': -2, 'I': -3, 'L': -2, 'K': -3, 'M': -1, 'F': 1, 'P': -4, 'S': -3, 'T': -2, 'W': 11, 'Y': 2, 'V': -3},
    'Y': {'A': -2, 'R': -2, 'N': -2, 'D': -3, 'C': -2, 'Q': -1, 'E': -2, 'G': -3, 'H': 2, 'I': -1, 'L': -1, 'K': -2, 'M': -1, 'F': 3, 'P': -3, 'S': -2, 'T': -2, 'W': 2, 'Y': 7, 'V': -1},
    'V': {'A': 0, 'R': -3, 'N': -3, 'D': -3, 'C': -1, 'Q': -2, 'E': -2, 'G': -3, 'H': -3, 'I': 3, 'L': 1, 'K': -2, 'M': 1, 'F': -1, 'P': -2, 'S': -2, 'T': 0, 'W': -3, 'Y': -1, 'V': 4}
}

FEATURE_NAMES = [
    "delta_molecular_weight",
    "abs_delta_molecular_weight",
    "delta_hydrophobicity",
    "abs_delta_hydrophobicity",
    "delta_charge",
    "abs_delta_charge",
    "delta_volume",
    "abs_delta_volume",
    "polarity_change",
    "aromatic_change",
    "wt_hydrophobicity",
    "wt_volume",
    "wt_charge",
    "mut_hydrophobicity",
    "mut_volume",
    "mut_charge",
    "blosum62_score",
    "normalized_position"
]

SCIENTIFIC_DISCLAIMER = (
    "EXPERIMENTAL COMPUTATIONAL RESEARCH BASELINE ONLY. "
    "This statistical regression model estimates deep mutational scanning scores for SUMO1 variants. "
    "It does NOT provide clinical pathogenicity diagnoses, disease risk predictions, or medical advice."
)


def compute_metrics_safe(y_true: np.ndarray, y_pred: np.ndarray) -> Tuple[float, float, float, Optional[str]]:
    """
    Computes Spearman rho, Pearson r, and MSE with explicit handling for:
    - Empty arrays or sample size < 2
    - Constant predictions (std == 0)
    - Constant ground truth (std == 0)
    - NaN/Inf inputs
    """
    notes = []
    if len(y_true) < 2 or len(y_pred) < 2:
        return 0.0, 0.0, 0.0, "Sample size < 2; correlation is undefined."

    if np.any(np.isnan(y_true)) or np.any(np.isnan(y_pred)):
        return 0.0, 0.0, 0.0, "Input contains NaN values; metrics cannot be evaluated."

    mse = float(mean_squared_error(y_true, y_pred))

    std_true = float(np.std(y_true))
    std_pred = float(np.std(y_pred))

    if std_pred == 0.0 or std_true == 0.0:
        notes.append("Constant prediction or constant ground truth encountered; correlation set to 0.0.")
        return 0.0, 0.0, mse, "; ".join(notes)

    try:
        sp_res = spearmanr(y_true, y_pred)
        sp_val = float(sp_res.statistic if hasattr(sp_res, 'statistic') else sp_res[0])
        if np.isnan(sp_val):
            sp_val = 0.0
            notes.append("Spearman returned NaN; fallback to 0.0.")
    except Exception as e:
        sp_val = 0.0
        notes.append(f"Spearman calculation failed: {str(e)}")

    try:
        pe_val = float(pearsonr(y_true, y_pred)[0])
        if np.isnan(pe_val):
            pe_val = 0.0
            notes.append("Pearson returned NaN; fallback to 0.0.")
    except Exception as e:
        pe_val = 0.0
        notes.append(f"Pearson calculation failed: {str(e)}")

    return round(sp_val, 4), round(pe_val, 4), round(mse, 4), ("; ".join(notes) if notes else None)


class BaselineModelService:
    """
    Manages data preparation, feature extraction, residue-grouped splitting,
    training, evaluation, and inference for the SUMO1 DMS regression baseline.
    """
    def __init__(self):
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        self.raw_data_dir = os.path.join(base_dir, "data", "raw")
        self.models_dir = os.path.join(base_dir, "data", "models")
        os.makedirs(self.models_dir, exist_ok=True)

        self.assay_filename = "SUMO1_HUMAN_Weile_2017.csv"
        self.ref_filename = "DMS_substitutions.csv"
        self.model_artifact_path = os.path.join(self.models_dir, "sumo1_baseline.joblib")
        self.best_model_path = os.path.join(self.models_dir, "sumo1_best_model.joblib")
        self.metadata_path = os.path.join(self.models_dir, "sumo1_baseline_metadata.json")
        self.test_predictions_path = os.path.join(self.models_dir, "sumo1_test_predictions.csv")

    def get_reference_sequence(self) -> str:
        ref_path = os.path.join(self.raw_data_dir, self.ref_filename)
        if not os.path.exists(ref_path):
            raise FileNotFoundError(f"Reference metadata file not found at {ref_path}")

        with open(ref_path, "r", encoding="utf-8") as f:
            for row in csv.DictReader(f):
                if row.get("DMS_filename") == self.assay_filename:
                    return row["target_seq"]

        raise ValueError(f"Assay {self.assay_filename} not found in reference metadata.")

    def extract_features(self, wt_aa: str, mut_aa: str, pos: int, seq_len: int) -> List[float]:
        wt_data = get_amino_acid(wt_aa)
        mut_data = get_amino_acid(mut_aa)

        if not wt_data or not mut_data:
            raise ValueError(f"Invalid amino acid codes: wt='{wt_aa}', mut='{mut_aa}'")

        delta_mw = mut_data["molecular_weight"] - wt_data["molecular_weight"]
        delta_hydro = mut_data["hydrophobicity"] - wt_data["hydrophobicity"]
        delta_charge = mut_data["charge"] - wt_data["charge"]
        delta_vol = mut_data["volume"] - wt_data["volume"]

        polarity_change = 0.0 if wt_data["polarity"] == mut_data["polarity"] else 1.0
        aromatic_change = 0.0 if wt_data["aromatic"] == mut_data["aromatic"] else 1.0

        blosum_val = float(BLOSUM62_MATRIX.get(wt_aa, {}).get(mut_aa, -4))

        return [
            float(delta_mw),
            float(abs(delta_mw)),
            float(delta_hydro),
            float(abs(delta_hydro)),
            float(delta_charge),
            float(abs(delta_charge)),
            float(delta_vol),
            float(abs(delta_vol)),
            polarity_change,
            aromatic_change,
            float(wt_data["hydrophobicity"]),
            float(wt_data["volume"]),
            float(wt_data["charge"]),
            float(mut_data["hydrophobicity"]),
            float(mut_data["volume"]),
            float(mut_data["charge"]),
            blosum_val,
            float(pos) / float(seq_len)
        ]

    def load_and_validate_dataset(self) -> Tuple[List[Dict[str, Any]], str]:
        ref_seq = self.get_reference_sequence()
        assay_path = os.path.join(self.raw_data_dir, self.assay_filename)

        if not os.path.exists(assay_path):
            raise FileNotFoundError(f"Assay dataset file not found at {assay_path}")

        mut_pattern = re.compile(r"^([A-Z])(\d+)([A-Z])$")
        validated_data = []

        with open(assay_path, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for idx, row in enumerate(reader):
                mut = row.get("mutant", "").strip()
                score_str = row.get("DMS_score", "").strip()

                # Filter multi-mutants
                if ":" in mut or ";" in mut or "," in mut:
                    continue

                m = mut_pattern.match(mut)
                if not m:
                    continue

                wt_aa, pos_str, mut_aa = m.groups()
                pos = int(pos_str)

                # Strictly validate 1-based index against reference sequence
                if pos < 1 or pos > len(ref_seq):
                    continue
                if ref_seq[pos - 1] != wt_aa:
                    continue
                if wt_aa == mut_aa:
                    continue

                try:
                    score = float(score_str)
                    if np.isnan(score):
                        continue
                except ValueError:
                    continue

                feat = self.extract_features(wt_aa, mut_aa, pos, len(ref_seq))

                validated_data.append({
                    "mutant": mut,
                    "wt_aa": wt_aa,
                    "pos": pos,
                    "mut_aa": mut_aa,
                    "score": score,
                    "features": feat
                })

        return validated_data, ref_seq

    def build_grouped_split(
        self,
        dataset: List[Dict[str, Any]],
        split_seed: int = 42,
        train_ratio: float = 0.8
    ) -> Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray, List[int], List[int], List[Dict[str, Any]]]:
        """
        Creates a residue-position-grouped train/test split.
        Asserts that train positions and test positions are strictly disjoint.
        """
        all_positions = sorted(list(set(d["pos"] for d in dataset)))

        # Deterministic shuffle
        rng = np.random.RandomState(split_seed)
        shuffled_positions = list(all_positions)
        rng.shuffle(shuffled_positions)

        n_train_pos = int(len(shuffled_positions) * train_ratio)
        train_pos_set = set(shuffled_positions[:n_train_pos])
        test_pos_set = set(shuffled_positions[n_train_pos:])

        # Strict data leakage assertion
        leakage = train_pos_set.intersection(test_pos_set)
        assert len(leakage) == 0, f"DATA LEAKAGE DETECTED! Overlapping positions: {leakage}"

        X_train, y_train = [], []
        X_test, y_test = [], []
        test_records = []

        for item in dataset:
            if item["pos"] in train_pos_set:
                X_train.append(item["features"])
                y_train.append(item["score"])
            elif item["pos"] in test_pos_set:
                X_test.append(item["features"])
                y_test.append(item["score"])
                test_records.append(item)

        return (
            np.array(X_train, dtype=np.float64),
            np.array(y_train, dtype=np.float64),
            np.array(X_test, dtype=np.float64),
            np.array(y_test, dtype=np.float64),
            sorted(list(train_pos_set)),
            sorted(list(test_pos_set)),
            test_records
        )

    def train_and_evaluate(self, split_seed: int = 42) -> Dict[str, Any]:
        """
        Fits preprocessing (StandardScaler) on training data only.
        Trains Ridge regression and Random Forest regressor on the same split.
        Saves artifacts, best model, test predictions CSV, and returns evaluation metrics.
        """
        dataset, ref_seq = self.load_and_validate_dataset()
        if len(dataset) < 100:
            raise RuntimeError(f"Insufficient validated data for training: {len(dataset)} samples.")

        X_train, y_train, X_test, y_test, train_positions, test_positions, test_records = self.build_grouped_split(
            dataset, split_seed=split_seed
        )

        # Preprocessing: StandardScaler fitted ONLY on training features
        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled = scaler.transform(X_test)

        # 1. Primary Model: Ridge Regression (L2 regularization)
        ridge = Ridge(alpha=10.0, random_state=split_seed)
        ridge.fit(X_train_scaled, y_train)
        ridge_preds = ridge.predict(X_test_scaled)

        ridge_sp, ridge_pe, ridge_mse, ridge_note = compute_metrics_safe(y_test, ridge_preds)

        # 2. Comparison Model: Shallow Random Forest Regressor
        rf = RandomForestRegressor(n_estimators=100, max_depth=4, random_state=split_seed)
        rf.fit(X_train_scaled, y_train)
        rf_preds = rf.predict(X_test_scaled)

        rf_sp, rf_pe, rf_mse, rf_note = compute_metrics_safe(y_test, rf_preds)

        # 3. Save detailed held-out test predictions to CSV
        with open(self.test_predictions_path, "w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow([
                "mutant",
                "position",
                "wt_aa",
                "mut_aa",
                "y_true_dms_score",
                "ridge_pred_dms_score",
                "rf_pred_dms_score"
            ])
            for i, rec in enumerate(test_records):
                writer.writerow([
                    rec["mutant"],
                    rec["pos"],
                    rec["wt_aa"],
                    rec["mut_aa"],
                    round(float(y_test[i]), 6),
                    round(float(ridge_preds[i]), 6),
                    round(float(rf_preds[i]), 6)
                ])

        # 4. Save full dual-model baseline artifact
        artifacts = {
            "scaler": scaler,
            "ridge_model": ridge,
            "rf_model": rf,
            "ref_seq": ref_seq,
            "split_seed": split_seed,
            "feature_names": FEATURE_NAMES
        }
        joblib.dump(artifacts, self.model_artifact_path)

        # 5. Save best-performing baseline package (Random Forest)
        best_artifacts = {
            "best_model_name": "Random Forest Regressor (n_estimators=100, max_depth=4)",
            "model": rf,
            "scaler": scaler,
            "ref_seq": ref_seq,
            "split_seed": split_seed,
            "feature_names": FEATURE_NAMES,
            "test_metrics": {
                "spearman_rho": rf_sp,
                "pearson_r": rf_pe,
                "mse": rf_mse,
                "test_positions": len(test_positions),
                "test_samples": len(y_test)
            },
            "disclaimer": SCIENTIFIC_DISCLAIMER
        }
        joblib.dump(best_artifacts, self.best_model_path)

        metadata = {
            "assay_id": "SUMO1_HUMAN_Weile_2017",
            "dataset_filename": self.assay_filename,
            "uniprot_id": "SUMO1_HUMAN",
            "target_sequence_length": len(ref_seq),
            "split_seed": split_seed,
            "train_positions_count": len(train_positions),
            "test_positions_count": len(test_positions),
            "train_positions": train_positions,
            "test_positions": test_positions,
            "feature_names": FEATURE_NAMES,
            "best_model": {
                "model_name": "Random Forest Regressor (n_estimators=100, max_depth=4)",
                "spearman_rho": rf_sp,
                "pearson_r": rf_pe,
                "mse": rf_mse
            },
            "primary_model": {
                "model_name": "Ridge Regression (alpha=10.0)",
                "spearman_rho": ridge_sp,
                "pearson_r": ridge_pe,
                "mse": ridge_mse,
                "train_samples": len(y_train),
                "test_samples": len(y_test),
                "train_positions": len(train_positions),
                "test_positions": len(test_positions),
                "notes": ridge_note
            },
            "comparison_model": {
                "model_name": "Random Forest Regressor (n_estimators=100, max_depth=4)",
                "spearman_rho": rf_sp,
                "pearson_r": rf_pe,
                "mse": rf_mse,
                "train_samples": len(y_train),
                "test_samples": len(y_test),
                "train_positions": len(train_positions),
                "test_positions": len(test_positions),
                "notes": rf_note
            },
            "summary": (
                f"Evaluated on {len(test_positions)} unseen residue positions ({len(y_test)} variants). "
                f"Ridge achieved Spearman rho={ridge_sp}, Pearson r={ridge_pe}, MSE={ridge_mse}. "
                f"Random Forest achieved Spearman rho={rf_sp}, Pearson r={rf_pe}, MSE={rf_mse}."
            ),
            "disclaimer": SCIENTIFIC_DISCLAIMER
        }

        with open(self.metadata_path, "w", encoding="utf-8") as f:
            json.dump(metadata, f, indent=2)

        return metadata

    def get_metrics(self) -> Dict[str, Any]:
        if not os.path.exists(self.metadata_path):
            return self.train_and_evaluate(split_seed=42)

        with open(self.metadata_path, "r", encoding="utf-8") as f:
            return json.load(f)

    def load_saved_model(self, model_path: Optional[str] = None) -> Dict[str, Any]:
        """
        Explicitly loads a saved model artifact from disk.
        Raises FileNotFoundError if the file does not exist (never fabricates).
        """
        path = model_path or self.best_model_path
        if not os.path.exists(path):
            raise FileNotFoundError(
                f"Model artifact not found at '{path}'. Model training must be executed before loading."
            )
        return joblib.load(path)

    def validate_sequence_compatibility(self, candidate_seq: str) -> None:
        """
        Asserts that a candidate protein sequence is compatible with the SUMO1 model.
        """
        ref_seq = self.get_reference_sequence()
        if not candidate_seq or len(candidate_seq) != len(ref_seq) or candidate_seq != ref_seq:
            raise ValueError(
                f"Incompatible sequence: candidate sequence length {len(candidate_seq) if candidate_seq else 0} "
                f"does not match SUMO1 reference length {len(ref_seq)}."
            )

    def predict_with_saved_model(self, mutant: str, model_path: Optional[str] = None) -> Dict[str, Any]:
        """
        Generates a prediction using an explicitly loaded saved model package.
        Validates mutation format and reference residue before calculating features.
        """
        saved_pkg = self.load_saved_model(model_path)
        ref_seq = saved_pkg["ref_seq"]
        scaler = saved_pkg["scaler"]
        model = saved_pkg["model"]

        m = re.match(r"^([A-Z])(\d+)([A-Z])$", mutant.strip().upper())
        if not m:
            raise ValueError(f"Invalid single-substitution format '{mutant}'. Expected format e.g. 'S2Y'.")

        wt_aa, pos_str, mut_aa = m.groups()
        pos = int(pos_str)

        if pos < 1 or pos > len(ref_seq):
            raise ValueError(f"Position {pos} is out of sequence bounds (1..{len(ref_seq)}).")

        expected_wt = ref_seq[pos - 1]
        if wt_aa != expected_wt:
            raise ValueError(
                f"Wild-type mismatch at position {pos}: notation states '{wt_aa}', but reference sequence is '{expected_wt}'."
            )

        if wt_aa == mut_aa:
            raise ValueError(f"Synonymous mutation '{wt_aa}{pos}{mut_aa}' cannot be evaluated.")

        feats = self.extract_features(wt_aa, mut_aa, pos, len(ref_seq))
        feats_scaled = scaler.transform(np.array([feats], dtype=np.float64))

        pred_score = float(model.predict(feats_scaled)[0])
        func_class = "Functional / Tolerant" if pred_score >= 0.3 else "Impaired / Deleterious"

        uncertainty_std = None
        if hasattr(model, "estimators_"):
            tree_preds = [float(tree.predict(feats_scaled)[0]) for tree in model.estimators_]
            uncertainty_std = round(float(np.std(tree_preds)), 4)

        score_explanation = (
            "In the Weile et al. 2017 yeast functional complementation assay, DMS scores reflect relative growth rescue. "
            "Scores >= 0.3 indicate functional / wild-type-like complementation; scores < 0.3 indicate impaired complementation. "
            "This measurement reflects in vitro cellular assay fitness and does NOT establish clinical pathogenicity."
        )

        return {
            "accession": "P63165",
            "mutant": f"{wt_aa}{pos}{mut_aa}",
            "wildtype_aa": wt_aa,
            "position": pos,
            "mutant_aa": mut_aa,
            "predicted_dms_score": round(pred_score, 4),
            "predicted_functional_class": func_class,
            "score_explanation": score_explanation,
            "model_used": saved_pkg.get("best_model_name", "Random Forest Regressor (depth=4)"),
            "model_name": saved_pkg.get("best_model_name", "Random Forest Regressor (depth=4)"),
            "model_version": "0.1.0",
            "assay_id": "SUMO1_HUMAN_Weile_2017",
            "uncertainty_std": uncertainty_std,
            "model_loaded_from": model_path or self.best_model_path,
            "scientific_disclaimer": SCIENTIFIC_DISCLAIMER
        }

    def predict_mutation(self, mutant: str, accession: str = "P63165", model_type: str = "ridge") -> Dict[str, Any]:
        """
        Predicts continuous DMS score for a single amino-acid substitution.
        Validates notation strictly against SUMO1 reference sequence.
        """
        # Validate supported protein accession
        supported_accessions = {"P63165", "SUMO1_HUMAN", "SUMO1"}
        if accession.strip().upper() not in supported_accessions:
            raise ValueError(
                f"Unsupported protein accession '{accession}'. The current baseline predictor is calibrated "
                f"exclusively for human SUMO1 (UniProt P63165 / SUMO1_HUMAN, assay SUMO1_HUMAN_Weile_2017)."
            )

        # Load or train artifacts
        if not os.path.exists(self.model_artifact_path):
            self.train_and_evaluate(split_seed=42)

        artifacts = joblib.load(self.model_artifact_path)
        ref_seq = artifacts["ref_seq"]
        scaler = artifacts["scaler"]
        model = artifacts["ridge_model"] if model_type.lower() == "ridge" else artifacts["rf_model"]

        m = re.match(r"^([A-Z])(\d+)([A-Z])$", mutant.strip().upper())
        if not m:
            raise ValueError(f"Invalid single-substitution format '{mutant}'. Expected format e.g. 'S2Y'.")

        wt_aa, pos_str, mut_aa = m.groups()
        pos = int(pos_str)

        if pos < 1 or pos > len(ref_seq):
            raise ValueError(f"Position {pos} is out of sequence bounds (1..{len(ref_seq)}).")

        expected_wt = ref_seq[pos - 1]
        if wt_aa != expected_wt:
            raise ValueError(
                f"Wild-type mismatch at position {pos}: notation states '{wt_aa}', but reference sequence is '{expected_wt}'."
            )

        if wt_aa == mut_aa:
            raise ValueError(f"Synonymous mutation '{wt_aa}{pos}{mut_aa}' cannot be evaluated.")

        feats = self.extract_features(wt_aa, mut_aa, pos, len(ref_seq))
        feats_scaled = scaler.transform(np.array([feats], dtype=np.float64))

        predicted_score = float(model.predict(feats_scaled)[0])

        # Binarization rule based on Weile 2017 manual cutoff (0.3)
        functional_class = "Functional / Tolerant" if predicted_score >= 0.3 else "Impaired / Deleterious"

        # Calculate uncertainty only if genuinely available (RF tree ensemble standard deviation)
        uncertainty_std = None
        if hasattr(model, "estimators_"):
            tree_preds = [float(tree.predict(feats_scaled)[0]) for tree in model.estimators_]
            uncertainty_std = round(float(np.std(tree_preds)), 4)

        score_explanation = (
            "In the Weile et al. 2017 yeast functional complementation assay, DMS scores reflect relative growth rescue. "
            "Scores >= 0.3 indicate functional / wild-type-like complementation; scores < 0.3 indicate impaired complementation. "
            "This measurement reflects in vitro cellular assay fitness and does NOT establish clinical pathogenicity."
        )

        return {
            "accession": accession,
            "mutant": f"{wt_aa}{pos}{mut_aa}",
            "wildtype_aa": wt_aa,
            "position": pos,
            "mutant_aa": mut_aa,
            "predicted_dms_score": round(predicted_score, 4),
            "predicted_functional_class": functional_class,
            "score_explanation": score_explanation,
            "model_used": "Ridge Regression (alpha=10.0)" if model_type.lower() == "ridge" else "Random Forest Regressor (depth=4)",
            "model_version": "0.1.0",
            "assay_id": "SUMO1_HUMAN_Weile_2017",
            "uncertainty_std": uncertainty_std,
            "provenance": {
                "source_assay": "SUMO1_HUMAN_Weile_2017.csv",
                "method": "Residue-Grouped Regression Baseline",
                "features_used": len(FEATURE_NAMES)
            },
            "scientific_disclaimer": SCIENTIFIC_DISCLAIMER
        }


baseline_service = BaselineModelService()
