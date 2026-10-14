import React, { useState } from 'react';
import type { ProteinData } from '../../types/protein';
import type { BaselinePredictResponse } from '../../types/mutation';
import { predictBaselineMutation } from '../../services/mutationApi';
import {
  Cpu,
  AlertTriangle,
  Info,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  Minus,
  RefreshCw,
  Layers,
  FlaskConical,
  HelpCircle
} from 'lucide-react';

interface BaselinePredictorCardProps {
  protein: ProteinData | null;
  selectedPosition: number | null;
  originalResidue: string | null;
  mutantResidue: string;
  onLoadSumo1: () => void;
}

export const BaselinePredictorCard: React.FC<BaselinePredictorCardProps> = ({
  protein,
  selectedPosition,
  originalResidue,
  mutantResidue,
  onLoadSumo1
}) => {
  const [modelType, setModelType] = useState<'random_forest' | 'ridge'>('random_forest');
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<BaselinePredictResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isSumo1 = protein?.accession.toUpperCase() === 'P63165';

  // Validation
  const isValidPosition =
    protein && selectedPosition && selectedPosition >= 1 && selectedPosition <= protein.length;
  
  const seqResidueAtPos =
    protein && selectedPosition && isValidPosition
      ? protein.sequence[selectedPosition - 1]?.toUpperCase()
      : null;

  const isResidueMatching =
    seqResidueAtPos && originalResidue
      ? seqResidueAtPos === originalResidue.toUpperCase()
      : false;

  const isSynonymous =
    originalResidue && mutantResidue
      ? originalResidue.toUpperCase() === mutantResidue.toUpperCase()
      : false;

  let validationError: string | null = null;
  if (!isSumo1) {
    validationError = 'Model is restricted exclusively to SUMO1 (P63165).';
  } else if (!selectedPosition || !isValidPosition) {
    validationError = `Position must be between 1 and ${protein?.length || 101}.`;
  } else if (!isResidueMatching) {
    validationError = `Sequence mismatch: position ${selectedPosition} contains '${seqResidueAtPos}', not '${originalResidue}'.`;
  } else if (isSynonymous) {
    validationError = `Synonymous mutation: wild-type '${originalResidue}' and mutant '${mutantResidue}' are identical.`;
  }

  const handlePredict = async () => {
    if (validationError || !protein || !selectedPosition || !originalResidue || !mutantResidue) {
      return;
    }

    setLoading(true);
    setError(null);
    const mutantNotation = `${originalResidue.toUpperCase()}${selectedPosition}${mutantResidue.toUpperCase()}`;

    try {
      const res = await predictBaselineMutation(protein.accession, mutantNotation, modelType);
      setPrediction(res);
    } catch (err: any) {
      setError(err?.message || 'Failed to generate baseline prediction.');
      setPrediction(null);
    } finally {
      setLoading(false);
    }
  };

  const getFunctionalBadge = (_functionalClass: string, score: number) => {
    if (score < -0.6) {
      return {
        label: 'Strong Depletion (Reduced Fitness)',
        color: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
        icon: <TrendingDown className="w-4 h-4 text-rose-400" />
      };
    }
    if (score < -0.2) {
      return {
        label: 'Moderate Depletion',
        color: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
        icon: <TrendingDown className="w-4 h-4 text-orange-400" />
      };
    }
    if (score < 0.1) {
      return {
        label: 'Neutral / Wildtype-like Fitness',
        color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
        icon: <Minus className="w-4 h-4 text-cyan-400" />
      };
    }
    return {
      label: 'Enhanced Fitness (Enriched)',
      color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      icon: <TrendingUp className="w-4 h-4 text-emerald-400" />
    };
  };

  return (
    <div className="glass-card rounded-2xl p-6 sm:p-8 border border-cyan-500/30 space-y-6 shadow-xl relative overflow-hidden">
      {/* Background ambient gradient glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-cyan-950/80 border border-cyan-500/30 text-cyan-400">
              <Cpu className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-white tracking-wide">
              Verified DMS Regression Baseline
            </h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              v0.1.0
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Quantitative fitness prediction using the audited, held-out validated ProteinGym regression model.
          </p>
        </div>

        {/* Assay restriction badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-cyan-500/20 text-xs font-mono text-cyan-300 self-start sm:self-auto">
          <FlaskConical className="w-3.5 h-3.5 text-cyan-400" />
          <span>Assay: SUMO1_HUMAN_Weile_2017</span>
        </div>
      </div>

      {/* Scope Restriction Warning for Non-SUMO1 */}
      {!isSumo1 ? (
        <div className="rounded-xl p-5 bg-amber-950/30 border border-amber-500/30 space-y-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1.5">
              <h4 className="text-sm font-semibold text-amber-200">
                Assay-Specific Model Restriction
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                The baseline predictor was trained and held-out validated specifically on <strong>human SUMO1</strong> (UniProt <strong>P63165</strong>, 101 aa). Deep mutational scanning assays quantify assay-specific phenotypic fitness; running this model on other proteins (e.g. {protein?.protein_name || protein?.accession || 'arbitrary proteins'}) would yield biologically invalid scores.
              </p>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={onLoadSumo1}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-slate-950 font-semibold text-xs transition shadow-md flex items-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Load SUMO1 (P63165) to Run Predictor
            </button>
            <span className="text-xs text-slate-400 font-mono">
              Current loaded protein: {protein?.accession} ({protein?.protein_name || 'Unknown'})
            </span>
          </div>
        </div>
      ) : (
        /* Valid SUMO1 active section */
        <div className="space-y-6">
          {/* Controls: Model Selection & Predict Trigger */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            
            {/* Model Architecture Selector */}
            <div className="md:col-span-7 space-y-1.5">
              <label className="text-xs font-mono uppercase text-slate-400 block flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                Select Verified Baseline Model
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setModelType('random_forest')}
                  className={`p-3 rounded-xl border text-left transition ${
                    modelType === 'random_forest'
                      ? 'bg-cyan-950/60 border-cyan-400/80 text-white shadow-sm shadow-cyan-900/50'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold">Random Forest</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-900/50 text-cyan-300">
                      Top Baseline
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Ensemble (100 trees), test ρ = 0.3570, provides tree disagreement std.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setModelType('ridge')}
                  className={`p-3 rounded-xl border text-left transition ${
                    modelType === 'ridge'
                      ? 'bg-cyan-950/60 border-cyan-400/80 text-white shadow-sm shadow-cyan-900/50'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold">Ridge Regression</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                      Linear L2
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Regularized linear model, test ρ = 0.2902, deterministic point estimate.
                  </p>
                </button>
              </div>
            </div>

            {/* Action Button & Target Mutation Preview */}
            <div className="md:col-span-5 flex flex-col justify-end space-y-2">
              <div className="text-xs text-slate-400 flex items-center justify-between font-mono">
                <span>Target Variant:</span>
                <span className="text-cyan-300 font-bold">
                  {originalResidue || '?'}{selectedPosition || '?'}{mutantResidue || '?'}
                </span>
              </div>

              <button
                type="button"
                onClick={handlePredict}
                disabled={Boolean(validationError) || loading}
                className={`w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition shadow-lg flex items-center justify-center gap-2 ${
                  validationError
                    ? 'bg-slate-800/80 text-slate-500 cursor-not-allowed border border-slate-700'
                    : 'bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 cursor-pointer hover:shadow-cyan-500/20 active:scale-[0.99]'
                }`}
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Predicting DMS Fitness...</span>
                  </>
                ) : (
                  <>
                    <Cpu className="w-4 h-4" />
                    <span>Predict DMS Fitness Score</span>
                  </>
                )}
              </button>
            </div>

          </div>

          {/* Validation Error Message */}
          {validationError && (
            <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Backend Error */}
          {error && (
            <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Prediction Output Card */}
          {prediction && (
            <div className="rounded-xl p-5 bg-slate-900/80 border border-cyan-500/30 space-y-5 animate-fadeIn">
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-4 border-b border-slate-800">
                {/* Score */}
                <div className="space-y-1">
                  <span className="text-[11px] font-mono uppercase text-slate-400 block">
                    Predicted DMS Score
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold font-mono text-cyan-300">
                      {prediction.predicted_dms_score > 0 ? '+' : ''}
                      {prediction.predicted_dms_score.toFixed(4)}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 block">
                    Assay: {prediction.assay_id}
                  </span>
                </div>

                {/* Qualitative Fitness Class */}
                <div className="space-y-1">
                  <span className="text-[11px] font-mono uppercase text-slate-400 block">
                    Assay Fitness Impact
                  </span>
                  <div>
                    {(() => {
                      const badge = getFunctionalBadge(
                        prediction.predicted_functional_class,
                        prediction.predicted_dms_score
                      );
                      return (
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border ${badge.color}`}
                        >
                          {badge.icon}
                          <span>{badge.label}</span>
                        </span>
                      );
                    })()}
                  </div>
                  <span className="text-[10px] text-slate-500 block">
                    Model: {prediction.model_used}
                  </span>
                </div>

                {/* Uncertainty */}
                <div className="space-y-1">
                  <span className="text-[11px] font-mono uppercase text-slate-400 block flex items-center gap-1">
                    Tree Ensemble Disagreement
                    <HelpCircle className="w-3 h-3 text-slate-500" />
                  </span>
                  <div className="text-sm font-mono font-bold text-slate-200">
                    {prediction.uncertainty_std !== null ? (
                      <span className="text-cyan-300">
                        ±{prediction.uncertainty_std.toFixed(4)}
                      </span>
                    ) : (
                      <span className="text-slate-500">Not Applicable (Ridge)</span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 leading-tight">
                    {prediction.uncertainty_std !== null
                      ? 'Std across 100 decision trees (model variation), NOT a calibrated confidence interval.'
                      : 'Ridge regression provides a deterministic point estimate without tree variance.'}
                  </p>
                </div>
              </div>

              {/* Explanation & Interpretation */}
              <div className="space-y-2">
                <h5 className="text-xs font-bold uppercase text-slate-300 tracking-wider flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-cyan-400" />
                  Fitness Score Interpretation
                </h5>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                  {prediction.score_explanation}
                </p>
              </div>

              {/* Strict Scientific & Clinical Disclaimers */}
              <div className="rounded-lg p-3.5 bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-start gap-2 text-slate-400 text-[11px] leading-relaxed">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Scientific Disclaimer:</strong> {prediction.scientific_disclaimer}
                  </span>
                </div>

                <div className="flex items-start gap-2 text-slate-400 text-[11px] leading-relaxed border-t border-slate-900 pt-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Model Provenance & Held-Out Validation:</strong> Trained on 1,344 single substitutions across 76 residue positions; evaluated on 356 variants across 20 held-out positions (split seed 42, zero residue leakage). Test Spearman ρ = 0.3570 (Random Forest), ρ = 0.2902 (Ridge).
                  </span>
                </div>
              </div>

            </div>
          )}

        </div>
      )}

      {/* Gemma AI Research Separation Note */}
      <div className="text-[11px] text-slate-500 border-t border-slate-800/80 pt-3 flex items-center justify-between">
        <span>
          Note: Gemma AI literature queries and research insights remain fully distinct from regression model scores.
        </span>
        <span className="font-mono text-cyan-500/70 text-[10px]">P63165 Ref: 101 aa</span>
      </div>
    </div>
  );
};
