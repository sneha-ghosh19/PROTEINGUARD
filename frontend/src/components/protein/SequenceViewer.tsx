import React, { useState } from 'react';
import { MousePointer, Hash, Target } from 'lucide-react';

interface SequenceViewerProps {
  sequence: string;
  selectedPosition: number | null;
  onSelectPosition: (position: number) => void;
}

export const SequenceViewer: React.FC<SequenceViewerProps> = ({
  sequence,
  selectedPosition,
  onSelectPosition
}) => {
  const [jumpInput, setJumpInput] = useState<string>('');

  const handleJumpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pos = parseInt(jumpInput, 10);
    if (!isNaN(pos) && pos >= 1 && pos <= sequence.length) {
      onSelectPosition(pos);
    }
  };

  const lineLength = 50;
  const lines: { startPos: number; text: string }[] = [];
  for (let i = 0; i < sequence.length; i += lineLength) {
    lines.push({
      startPos: i + 1,
      text: sequence.slice(i, i + lineLength)
    });
  }

  return (
    <div className="glass-card rounded-2xl p-6 border border-cyan-500/20 space-y-4">
      {/* Header & Position Jump Box */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <MousePointer className="w-4 h-4 text-cyan-400" />
            <span>Amino-Acid Sequence</span>
            <span className="text-xs font-mono font-normal text-slate-400">({sequence.length} residues)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Click any residue below to select it for mutation analysis.
          </p>
        </div>

        {/* Jump to Position Form */}
        <form onSubmit={handleJumpSubmit} className="flex items-center gap-2">
          <div className="relative">
            <Hash className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="number"
              min={1}
              max={sequence.length}
              value={jumpInput}
              onChange={(e) => setJumpInput(e.target.value)}
              placeholder="Pos (e.g. 98)"
              className="w-28 pl-7 pr-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-semibold border border-slate-600 transition-colors cursor-pointer"
          >
            Go
          </button>
        </form>
      </div>

      {/* Selected Position Banner */}
      {selectedPosition && (
        <div className="p-3 rounded-xl bg-cyan-950/70 border border-cyan-500/40 text-xs font-mono text-cyan-200 flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>
              Active Selection: Position <strong>{selectedPosition}</strong> → Residue{' '}
              <strong className="text-white bg-cyan-500/30 px-1.5 py-0.5 rounded border border-cyan-400">
                {sequence[selectedPosition - 1]}
              </strong>
            </span>
          </div>
          <span className="text-[10px] text-cyan-400">Click another residue to switch</span>
        </div>
      )}

      {/* Formatted Sequence Blocks Container */}
      <div className="bg-[#050811] p-4 rounded-xl border border-white/5 overflow-x-auto font-mono text-xs space-y-3 max-h-80 overflow-y-auto custom-scrollbar">
        {lines.map((line) => (
          <div key={line.startPos} className="flex items-start gap-4">
            <span className="w-10 text-right text-slate-500 text-[11px] select-none shrink-0 pt-0.5">
              {line.startPos}
            </span>

            <div className="flex flex-wrap gap-x-3 gap-y-1">
              {Array.from({ length: Math.ceil(line.text.length / 10) }).map((_, blockIdx) => {
                const blockStart = blockIdx * 10;
                const blockText = line.text.slice(blockStart, blockStart + 10);
                return (
                  <span key={blockIdx} className="inline-flex">
                    {blockText.split('').map((char, charIdx) => {
                      const absolutePos = line.startPos + blockStart + charIdx;
                      const isSelected = selectedPosition === absolutePos;
                      return (
                        <button
                          key={absolutePos}
                          onClick={() => onSelectPosition(absolutePos)}
                          className={`w-6 h-7 rounded text-center transition-all cursor-pointer font-bold ${
                            isSelected
                              ? 'bg-cyan-400 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.8)] scale-110 z-10'
                              : 'hover:bg-slate-800 text-slate-300 hover:text-cyan-300'
                          }`}
                          title={`Position ${absolutePos}: ${char}`}
                        >
                          {char}
                        </button>
                      );
                    })}
                  </span>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
