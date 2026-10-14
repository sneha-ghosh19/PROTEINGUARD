import React, { useState, useRef, useEffect } from 'react';
import { askAI, fetchAIHealth, generateAIReport } from '../../services/aiApi';
import type { ChatMessage as ChatMessageType, AIHealthData, AIAction, AIReportData } from '../../types/ai';
import { AIStatus } from './AIStatus';
import { QuickQuestions } from './QuickQuestions';
import { ChatMessage } from './ChatMessage';
import { ResearchReportModal } from './ResearchReportModal';

interface AIResearchAssistantProps {
  accession: string;
  position: number;
  mutant: string;
  onExecute3DAction?: (action: AIAction) => void;
}

export const AIResearchAssistant: React.FC<AIResearchAssistantProps> = ({
  accession,
  position,
  mutant,
  onExecute3DAction,
}) => {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [inputQuestion, setInputQuestion] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [health, setHealth] = useState<AIHealthData | null>(null);
  const [reportModalOpen, setReportModalOpen] = useState<boolean>(false);
  const [reportData, setReportData] = useState<AIReportData | null>(null);
  const [reportLoading, setReportLoading] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetchAIHealth().then((h) => setHealth(h));

    // Welcome initial message
    const welcomeMsg: ChatMessageType = {
      id: 'welcome-1',
      role: 'assistant',
      content: `Hello! I am ProteinGuard AI, your evidence-grounded research assistant for substitution ${accession} (Pos ${position} → ${mutant}). Ask me questions about the structural context, sequence conservation, or physicochemical shifts calculated for this mutation.`,
      evidence_items: [
        { category: 'Model', statement: 'Gemma 4 Evidence-Grounded Engine' },
        { category: 'Grounding', statement: 'Anchored directly to ProteinGuard analysis JSON' },
      ],
      limitations: ['Computational research tool — not for clinical diagnosis.'],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages([welcomeMsg]);
  }, [accession, position, mutant]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendQuestion = async (qText: string) => {
    if (!qText.trim() || loading) return;

    const userMsg: ChatMessageType = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: qText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuestion('');
    setLoading(true);

    try {
      const res = await askAI(accession, position, mutant, qText.trim());

      const aiMsg: ChatMessageType = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: res.answer,
        evidence_items: res.evidence_items,
        limitations: res.limitations,
        actions: res.actions,
        provider: res.provider,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);

      // Automatically execute first 3D viewer action if returned by AI
      if (res.actions && res.actions.length > 0 && onExecute3DAction) {
        onExecute3DAction(res.actions[0]);
      }
    } catch (err: any) {
      const errMsg: ChatMessageType = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `I encountered an issue analyzing the evidence: ${err.message || 'Server error'}. The 3D viewer and Screen 3 computational evidence remain available.`,
        limitations: ['AI service temporary error.'],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    setReportModalOpen(true);
    setReportLoading(true);
    try {
      const rep = await generateAIReport(accession, position, mutant);
      setReportData(rep);
    } catch (err) {
      console.error('Failed to generate report:', err);
    } finally {
      setReportLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 backdrop-blur-md flex flex-col justify-between h-[520px] shadow-2xl">
      {/* Header & Status */}
      <div className="space-y-3 pb-3 border-b border-slate-800 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.6)]"></span>
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
              Gemma 4 AI Assistant
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleGenerateReport}
              className="px-2.5 py-1 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-mono font-bold text-[11px] rounded-lg transition-all shadow-md cursor-pointer"
            >
              Summary Report 📄
            </button>
            <button
              onClick={handleClearChat}
              className="text-[11px] font-mono text-slate-400 hover:text-slate-200 px-2 py-1 rounded bg-slate-950 border border-slate-800 cursor-pointer"
              title="Reset Conversation"
            >
              Clear
            </button>
          </div>
        </div>

        <AIStatus health={health} />
      </div>

      {/* Scrollable Chat Messages Area */}
      <div className="flex-1 overflow-y-auto py-3 space-y-3 custom-scrollbar pr-1">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} onExecuteAction={onExecute3DAction} />
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 py-2">
            <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
            <span>ProteinGuard AI is evaluating evidence context...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Footer Controls & Quick Questions */}
      <div className="pt-2 border-t border-slate-800 shrink-0">
        <QuickQuestions onSelectQuestion={handleSendQuestion} disabled={loading} />

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendQuestion(inputQuestion);
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputQuestion}
            onChange={(e) => setInputQuestion(e.target.value)}
            placeholder={`Ask about ${accession}:${position} (${mutant})...`}
            disabled={loading}
            className="flex-1 bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none transition-colors"
          />
          <button
            type="submit"
            disabled={loading || !inputQuestion.trim()}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 text-slate-950 font-bold text-xs rounded-xl transition-colors shadow-md disabled:cursor-not-allowed cursor-pointer"
          >
            Send
          </button>
        </form>
      </div>

      {/* Report Modal */}
      {reportModalOpen && (
        <ResearchReportModal
          report={reportData}
          loading={reportLoading}
          onClose={() => setReportModalOpen(false)}
        />
      )}
    </div>
  );
};
