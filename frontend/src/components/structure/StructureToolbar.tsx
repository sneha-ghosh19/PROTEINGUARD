import React from 'react';
import type { RepresentationType, ColorMode } from '../../types/structure';

interface StructureToolbarProps {
  representation: RepresentationType;
  colorBy: ColorMode;
  highlightMutant: boolean;
  showContacts: boolean;
  onRepresentationChange: (rep: RepresentationType) => void;
  onColorModeChange: (mode: ColorMode) => void;
  onToggleHighlight: () => void;
  onToggleContacts: () => void;
  onFocusMutation: () => void;
  onResetView: () => void;
}

export const StructureToolbar: React.FC<StructureToolbarProps> = ({
  representation,
  colorBy,
  highlightMutant,
  showContacts,
  onRepresentationChange,
  onColorModeChange,
  onToggleHighlight,
  onToggleContacts,
  onFocusMutation,
  onResetView,
}) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs font-mono backdrop-blur-md">
      {/* Representation Selector */}
      <div className="flex items-center gap-2">
        <span className="text-slate-400 font-semibold">Style:</span>
        <div className="flex items-center bg-slate-950 rounded-lg p-1 border border-slate-800">
          <button
            onClick={() => onRepresentationChange('cartoon')}
            className={`px-2.5 py-1 rounded-md text-[11px] transition-colors cursor-pointer ${
              representation === 'cartoon' ? 'bg-cyan-600 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Cartoon
          </button>
          <button
            onClick={() => onRepresentationChange('surface')}
            className={`px-2.5 py-1 rounded-md text-[11px] transition-colors cursor-pointer ${
              representation === 'surface' ? 'bg-cyan-600 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Surface
          </button>
          <button
            onClick={() => onRepresentationChange('ball_and_stick')}
            className={`px-2.5 py-1 rounded-md text-[11px] transition-colors cursor-pointer ${
              representation === 'ball_and_stick' ? 'bg-cyan-600 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Ball &amp; Stick
          </button>
        </div>
      </div>

      {/* Color Mode Selector */}
      <div className="flex items-center gap-2">
        <span className="text-slate-400 font-semibold">Color:</span>
        <select
          value={colorBy}
          onChange={(e) => onColorModeChange(e.target.value as ColorMode)}
          className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-2.5 py-1 focus:outline-none focus:border-cyan-500 cursor-pointer"
        >
          <option value="secondary_structure">Secondary Structure</option>
          <option value="chain">Chain</option>
          <option value="element">Element</option>
          <option value="residue">Residue Type</option>
        </select>
      </div>

      {/* Toggles & View Action Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleHighlight}
          className={`px-2.5 py-1 rounded-lg border text-[11px] transition-colors cursor-pointer ${
            highlightMutant
              ? 'bg-amber-950/80 border-amber-500/50 text-amber-300 font-bold'
              : 'bg-slate-850 border-slate-700 text-slate-400 hover:text-slate-200'
          }`}
        >
          {highlightMutant ? '★ Site Highlighted' : 'Highlight Site'}
        </button>

        <button
          onClick={onToggleContacts}
          className={`px-2.5 py-1 rounded-lg border text-[11px] transition-colors cursor-pointer ${
            showContacts
              ? 'bg-teal-950/80 border-teal-500/50 text-teal-300 font-bold'
              : 'bg-slate-850 border-slate-700 text-slate-400 hover:text-slate-200'
          }`}
        >
          {showContacts ? 'Show Contacts (6Å)' : 'Hide Contacts'}
        </button>

        <button
          onClick={onFocusMutation}
          className="px-2.5 py-1 bg-cyan-950 border border-cyan-800 text-cyan-300 rounded-lg hover:bg-cyan-900 transition-colors cursor-pointer"
        >
          Focus Site
        </button>

        <button
          onClick={onResetView}
          className="px-2.5 py-1 bg-slate-800 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors cursor-pointer"
        >
          Reset View
        </button>
      </div>
    </div>
  );
};
