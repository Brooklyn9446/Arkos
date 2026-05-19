import React from "react";
import { Terminal } from "lucide-react";

interface SourceInspectorProps {
  code: string;
  onCodeChange: (code: string) => void;
  isAnalyzing: boolean;
}

export const SourceInspector: React.FC<SourceInspectorProps> = ({ code, onCodeChange, isAnalyzing }) => {
  return (
    <div className="col-span-12 lg:col-span-5 bg-[var(--panel-bg)] flex flex-col relative overflow-hidden">
      {isAnalyzing && <div className="scanline" />}
      
      <div className="panel-header flex items-center justify-between">
        <span className="panel-title flex items-center gap-2">
          <Terminal size={14} /> Source Target
        </span>
      </div>
      <div className="flex-1 flex flex-col p-4 bg-[#0f1115]">
         <textarea
          value={code}
          onChange={(e) => onCodeChange(e.target.value)}
          className="flex-1 w-full bg-transparent border border-[var(--border)] rounded-[4px] p-4 font-mono text-sm resize-none focus:outline-none focus:border-[var(--accent)] text-[var(--text)]"
          placeholder="Paste source code or configuration files here..."
          spellCheck={false}
        />
      </div>
    </div>
  );
};
