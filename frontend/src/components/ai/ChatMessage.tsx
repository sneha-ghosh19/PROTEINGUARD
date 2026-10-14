import React from 'react';
import type { ChatMessage as ChatMessageType, AIAction } from '../../types/ai';

interface ChatMessageProps {
  message: ChatMessageType;
  onExecuteAction?: (action: AIAction) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, onExecuteAction }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} mb-4`}>
      {/* Message Author Tag */}
      <div className="flex items-center gap-1.5 mb-1 px-1">
        <span className="text-[10px] font-mono uppercase text-slate-400">
          {isUser ? 'User' : 'ProteinGuard AI'}
        </span>
        <span className="text-[10px] text-slate-500 font-mono">• {message.timestamp}</span>
      </div>

      {/* Bubble Body */}
      <div
        className={`max-w-[90%] rounded-2xl p-4 text-xs font-sans leading-relaxed shadow-lg ${
          isUser
            ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-slate-950 font-medium rounded-tr-none'
            : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
        }`}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>

        {/* Evidence Pills */}
        {!isUser && message.evidence_items && message.evidence_items.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-1">
            <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold block">
              Retrieved Computational Evidence:
            </span>
            <div className="space-y-1">
              {message.evidence_items.map((item, idx) => (
                <div key={idx} className="flex items-start gap-1.5 text-[11px] text-slate-300">
                  <span className="font-mono text-cyan-400 font-bold">• [{item.category}]:</span>
                  <span>{item.statement}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Limitations Notice */}
        {!isUser && message.limitations && message.limitations.length > 0 && (
          <div className="mt-2 text-[10px] text-amber-300/80 italic border-l-2 border-amber-500/40 pl-2">
            Limit: {message.limitations[0]}
          </div>
        )}

        {/* 3D Viewer Action Buttons Triggered by AI */}
        {!isUser && message.actions && message.actions.length > 0 && onExecuteAction && (
          <div className="mt-3 pt-2 flex flex-wrap gap-2">
            {message.actions.map((act, idx) => {
              let label = 'Trigger 3D Action';
              if (act.type === 'show_contacts') label = 'Show 6Å Contacts in 3D';
              if (act.type === 'focus_residue') label = 'Focus Camera on Mutation';
              if (act.type === 'highlight_residues') label = 'Highlight Site in Viewer';

              return (
                <button
                  key={idx}
                  onClick={() => onExecuteAction(act)}
                  className="px-2.5 py-1 bg-cyan-950 hover:bg-cyan-900 border border-cyan-700/60 text-cyan-300 font-mono text-[11px] rounded-md transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span>{label}</span>
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {!isUser && (
        <span className="text-[9px] font-mono text-slate-500 mt-1 px-1">
          Grounding: Grounded in ProteinGuard structured analysis JSON
        </span>
      )}
    </div>
  );
};
