import React from 'react';
import { Info } from 'lucide-react';

export const DisclaimerBanner: React.FC = () => {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 my-8">
      <div className="flex items-start sm:items-center gap-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-400 text-xs sm:text-sm backdrop-blur-sm shadow-md">
        <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5 sm:mt-0" />
        <p className="leading-relaxed">
          <strong className="text-slate-300 font-semibold">Scientific Disclaimer:</strong> ProteinGuard provides computational research insights and does not replace experimental validation, clinical diagnosis, or professional medical advice.
        </p>
      </div>
    </div>
  );
};
