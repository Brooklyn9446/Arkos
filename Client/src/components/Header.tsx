import React from "react";
import { Shield, RefreshCw } from "lucide-react";

interface HeaderProps {
  status: string;
  onRunAnalysis: () => void;
}

export const Header: React.FC<HeaderProps> = ({ status, onRunAnalysis }) => {
  return (
    <header className="h-16 border-b border-[var(--border)] bg-[var(--panel-bg)] flex items-center justify-between px-8 sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <div className="text-[var(--accent)]">
          <Shield size={24} strokeWidth={2.5} />
        </div>
        <div>
          <h1 className="text-sm font-bold tracking-[0.15em] uppercase text-[var(--text)]">Sentinel-X <span className="text-[var(--text-dim)] font-medium">Analyzer</span></h1>
          <div className="flex items-center gap-3 mt-1">
            <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-[var(--text-dim)]">
              <div className="w-2 h-2 rounded-full bg-[var(--low)] shadow-[0_0_8px_var(--low)]" /> OLLAMA: llama3
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-[var(--text-dim)]">
              <div className="w-2 h-2 rounded-full bg-[var(--accent)] shadow-[0_0_8px_var(--accent)]" /> 4 Workers
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button 
          onClick={() => window.location.reload()}
          className="p-2 hover:bg-[var(--border)] rounded-sm transition-colors text-[var(--text-dim)]"
          title="Reset Session"
        >
          <RefreshCw size={18} />
        </button>
        <button 
          disabled={status === "analyzing"}
          onClick={onRunAnalysis}
          className={`px-6 h-10 flex items-center gap-2 rounded-[4px] text-sm font-semibold transition-all ${
            status === "analyzing" 
            ? "bg-[var(--border)] text-[var(--text-dim)] cursor-not-allowed" 
            : "bg-[var(--accent)] text-white hover:opacity-90 active:scale-[0.98]"
          }`}
        >
          {status === "analyzing" ? "Analyzing Pipeline..." : "RUN ARCHITECT SCAN"}
        </button>
      </div>
    </header>
  );
};
