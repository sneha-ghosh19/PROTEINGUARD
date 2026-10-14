import React from 'react';
import type { AIHealthData } from '../../types/ai';

interface AIStatusProps {
  health: AIHealthData | null;
}

export const AIStatus: React.FC<AIStatusProps> = ({ health }) => {
  const isOnline = health?.available ?? true;
  const providerName = health?.provider || 'gemma';
  const modelName = health?.model || 'Gemma 4 (Evidence-Grounded Assistant)';

  return (
    <div className="flex items-center justify-between px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs font-mono">
      <div className="flex items-center gap-2">
        <span className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]' : 'bg-slate-500'}`}></span>
        <span className="font-semibold text-slate-200">
          {isOnline ? 'Gemma 4 AI Assistant Online' : 'AI Offline (Deterministic Fallback)'}
        </span>
      </div>

      <span className="text-[11px] text-purple-300 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800/60 truncate max-w-[180px]">
        {providerName.toUpperCase()}: {modelName}
      </span>
    </div>
  );
};
