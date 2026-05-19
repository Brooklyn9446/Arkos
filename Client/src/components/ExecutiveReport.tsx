import React from "react";
import { Download } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface ExecutiveReportProps {
  report: string;
}

export const ExecutiveReport: React.FC<ExecutiveReportProps> = ({ report }) => {
  return (
    <div className="mt-8 border border-[var(--border)] bg-[#0b0c0e] overflow-hidden rounded-[4px]">
      <div className="panel-header bg-[var(--panel-bg)] flex items-center justify-between">
        <h2 className="panel-title text-[var(--text)]">Final Executive Logic</h2>
        <button className="text-[var(--text-dim)] hover:text-white transition-colors">
          <Download size={14} />
        </button>
      </div>
      <div className="p-8 text-[12px] font-mono leading-relaxed text-[#a5b4fc] prose prose-invert max-w-none">
         <ReactMarkdown>{report}</ReactMarkdown>
      </div>
    </div>
  );
};
