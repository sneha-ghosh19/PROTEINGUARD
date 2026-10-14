import React from 'react';

interface QuickQuestionsProps {
  onSelectQuestion: (question: string) => void;
  disabled?: boolean;
}

const SUGGESTED_QUESTIONS = [
  'Why might this mutation matter structurally?',
  'Is this residue highly conserved across homologs?',
  'Which nearby residues could be relevant?',
  'What physicochemical properties change?',
  'What information is still missing?',
];

export const QuickQuestions: React.FC<QuickQuestionsProps> = ({ onSelectQuestion, disabled }) => {
  return (
    <div className="space-y-1.5 mb-3">
      <span className="text-[11px] font-mono text-slate-400 block uppercase tracking-wider">
        Suggested Research Questions:
      </span>
      <div className="flex flex-wrap gap-1.5">
        {SUGGESTED_QUESTIONS.map((q, idx) => (
          <button
            key={idx}
            onClick={() => onSelectQuestion(q)}
            disabled={disabled}
            className="text-xs font-mono px-2.5 py-1 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-cyan-500/50 text-slate-300 hover:text-cyan-300 rounded-lg transition-all text-left cursor-pointer disabled:opacity-50"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
};
