import React, { useState } from 'react';
import { Search, Loader2, AlertCircle } from 'lucide-react';

interface ProteinSearchProps {
  onSearch: (accession: string) => void;
  loading: boolean;
  error: string | null;
}

export const ProteinSearch: React.FC<ProteinSearchProps> = ({ onSearch, loading, error }) => {
  const [inputVal, setInputVal] = useState<string>('P04637');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputVal.trim()) {
      onSearch(inputVal.trim());
    }
  };

  const handleExampleClick = (acc: string) => {
    setInputVal(acc);
    onSearch(acc);
  };

  return (
    <div className="glass-card rounded-2xl p-6 sm:p-8 border border-cyan-500/30 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            1. Select Target Protein
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Search by UniProt accession ID, gene name, or protein keyword.
          </p>
        </div>

        {/* Example Pills */}
        <div className="flex flex-wrap gap-2 text-xs font-mono">
          <span className="text-slate-500 text-[11px] self-center">Quick Examples:</span>
          <button
            onClick={() => handleExampleClick('P04637')}
            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-300 hover:border-cyan-400 transition-all cursor-pointer"
          >
            P04637 (p53)
          </button>
          <button
            onClick={() => handleExampleClick('P01308')}
            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-teal-300 hover:border-teal-400 transition-all cursor-pointer"
          >
            P01308 (Insulin)
          </button>
          <button
            onClick={() => handleExampleClick('Q9BYF1')}
            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-violet-300 hover:border-violet-400 transition-all cursor-pointer"
          >
            Q9BYF1 (ACE2)
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Enter UniProt accession or gene (e.g. P04637, TP53)"
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500 font-mono text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !inputVal.trim()}
          className="px-7 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-bold text-sm hover:from-cyan-400 hover:to-teal-400 shadow-[0_0_20px_rgba(6,182,212,0.3)] disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Fetching UniProt...</span>
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              <span>Fetch Protein</span>
            </>
          )}
        </button>
      </form>

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <strong className="font-semibold block text-rose-200">Protein Lookup Notice</strong>
            <span>{error}</span>
          </div>
        </div>
      )}
    </div>
  );
};
