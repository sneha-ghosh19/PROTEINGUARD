import React from 'react';
import type { SpatialContact } from '../../types/analysis';

interface ResidueEnvironmentProps {
  contacts: SpatialContact[];
  targetResidue: string;
  targetPosition: number;
  loading: boolean;
}

export const ResidueEnvironment: React.FC<ResidueEnvironmentProps> = ({
  contacts,
  targetResidue,
  targetPosition,
  loading,
}) => {
  if (loading) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 backdrop-blur-sm animate-pulse">
        <div className="h-6 bg-slate-800 rounded w-1/3 mb-4"></div>
        <div className="h-40 bg-slate-800/50 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.5)]"></span>
            Residue Environment Map
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            2D schematic representation of spatial contacts within 6.0 Å
          </p>
        </div>
        <span className="text-xs font-mono px-2.5 py-1 bg-slate-800 rounded-md text-teal-300 border border-slate-700">
          {contacts.length} Nearby Residues
        </span>
      </div>

      {contacts.length === 0 ? (
        <div className="bg-slate-850/50 border border-slate-800 rounded-lg p-6 text-center text-sm text-slate-400">
          No spatial contact data available for position {targetPosition} in reference structure.
        </div>
      ) : (
        <div>
          {/* 2D Schematic Diagram */}
          <div className="relative bg-slate-950/80 border border-slate-800/80 rounded-xl p-6 mb-4 flex items-center justify-center min-h-[220px] overflow-hidden">
            {/* Background grid design */}
            <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-30 pointer-events-none"></div>

            {/* Central Target Residue Node */}
            <div className="relative z-10 flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-teal-600 p-0.5 shadow-[0_0_20px_rgba(20,184,166,0.4)] flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-slate-950 flex flex-col items-center justify-center">
                  <span className="text-lg font-mono font-bold text-cyan-300">{targetResidue}{targetPosition}</span>
                  <span className="text-[10px] text-slate-400">Target</span>
                </div>
              </div>
            </div>

            {/* Orbiting Contact Nodes */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {contacts.slice(0, 8).map((contact, idx) => {
                const total = Math.min(contacts.length, 8);
                const angle = (idx * (360 / total) * Math.PI) / 180;
                const radius = 80; // pixels from center
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                const dist = contact.distance_angstrom || contact.distance_angstroms || 0;

                return (
                  <div
                    key={`${contact.residue_name}-${contact.position}-${idx}`}
                    className="absolute pointer-events-auto transition-transform hover:scale-110"
                    style={{
                      transform: `translate(${x}px, ${y}px)`,
                    }}
                  >
                    <div className="group relative flex flex-col items-center">
                      <div className="px-2 py-1 rounded-md bg-slate-850 border border-teal-500/40 text-xs font-mono text-slate-200 shadow-lg flex items-center gap-1">
                        <span className="text-teal-400 font-semibold">{contact.residue_name}</span>
                        <span>{contact.position}</span>
                      </div>
                      <span className="text-[9px] font-mono text-cyan-400/80 bg-slate-900/90 px-1 rounded mt-0.5">
                        {dist.toFixed(1)}Å
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Contact Details List */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {contacts.map((c, i) => {
              const dist = c.distance_angstrom || c.distance_angstroms || 0;
              return (
                <div
                  key={i}
                  className="bg-slate-850/60 border border-slate-800 hover:border-teal-900/50 rounded-lg p-2.5 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-semibold text-slate-200">
                      {c.residue_name}{c.position}
                    </span>
                    <span className="text-xs font-mono text-teal-400 font-medium">
                      {dist.toFixed(1)} Å
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Chain {c.chain_id} • Atom {c.atom_name}
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-[11px] text-slate-400 mt-3 text-center italic">
            Note: 2D representation highlights spatial proximity and does not reflect exact 3D Cartesian coordinates.
          </p>
        </div>
      )}
    </div>
  );
};
