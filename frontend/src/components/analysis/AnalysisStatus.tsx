import React from 'react';
import { CheckCircle2, Loader2, Sparkles } from 'lucide-react';

interface AnalysisStatusProps {
  basicLoading?: boolean;
  conservationLoading?: boolean;
  structureLoading?: boolean;
  basicComplete?: boolean;
  conservationComplete?: boolean;
  structureComplete?: boolean;
  hasPhysicochemical?: boolean;
  hasConservation?: boolean;
  hasStructure?: boolean;
}

export const AnalysisStatus: React.FC<AnalysisStatusProps> = ({
  basicLoading = false,
  conservationLoading = false,
  structureLoading = false,
  basicComplete = true,
  conservationComplete = false,
  structureComplete = false,
  hasPhysicochemical,
  hasConservation,
  hasStructure,
}) => {
  const isPhysComplete = hasPhysicochemical !== undefined ? hasPhysicochemical : basicComplete && !basicLoading;
  const isConsComplete = hasConservation !== undefined ? hasConservation : conservationComplete && !conservationLoading;
  const isStrucComplete = hasStructure !== undefined ? hasStructure : structureComplete && !structureLoading;

  const isAllComplete = isPhysComplete && isConsComplete && isStrucComplete;

  return (
    <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs font-mono flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-cyan-400" />
        <span className="text-slate-200 font-semibold">
          {isAllComplete
            ? 'Analysis Complete'
            : 'Preparing Analysis Pipeline...'}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        {/* Physicochemical Stream */}
        <div className="flex items-center gap-1.5">
          {isPhysComplete ? (
            <span className="flex items-center gap-1 text-emerald-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>✓ Physicochemical</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 text-amber-400">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Physicochemical</span>
            </span>
          )}
        </div>

        {/* Conservation Stream */}
        <div className="flex items-center gap-1.5">
          {isConsComplete ? (
            <span className="flex items-center gap-1 text-purple-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>✓ Conservation</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 text-amber-400">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Conservation</span>
            </span>
          )}
        </div>

        {/* Structural Context Stream */}
        <div className="flex items-center gap-1.5">
          {isStrucComplete ? (
            <span className="flex items-center gap-1 text-teal-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>✓ Structural Context</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 text-amber-400">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Structural Context</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
