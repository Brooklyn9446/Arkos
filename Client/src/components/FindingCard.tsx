import React from "react";
import { Terminal } from "lucide-react";
import { motion } from "framer-motion";
import { Finding, Severity } from "../types";

interface FindingCardProps {
  finding: Finding;
  index: number;
}

export const FindingCard: React.FC<FindingCardProps> = ({ finding, index }) => {
  const getSeverityClass = (sev: Severity) => {
    switch (sev) {
      case "Critical": return "sev-crit";
      case "High": return "sev-high";
      case "Medium": return "sev-med";
      case "Low": return "sev-low";
      default: return "";
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      key={index} 
      className="card p-4 overflow-hidden hover:shadow-[0_0_20px_rgba(0,255,65,0.2)] transition-all cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-2">
         <h4 className="text-[14px] font-bold text-[var(--text-primary)] group-hover:text-[var(--neon)] transition-colors font-display">{finding.vulnerability_type}</h4>
         <div className={`sev-badge ${getSeverityClass(finding.severity)}`}>
          {finding.severity}
        </div>
      </div>
      <p className="text-xs text-[var(--text-sec)] leading-relaxed mb-3">{finding.description}</p>
      <div className="flex items-center gap-4">
        <span className="text-[10px] font-mono text-[var(--neon)] uppercase flex items-center gap-1">
          <Terminal size={10} /> {finding.file}:{finding.line_range}
        </span>
      </div>
      
      <div className="mt-4 pt-4 border-t border-[var(--neon-border)] hidden group-hover:block transition-all bg-[var(--crater)] p-4 rounded-[4px] border-l-4 border-l-[var(--neon)]">
         <div className="mb-3">
            <p className="text-[10px] font-bold uppercase text-[var(--text-sec)] mb-1 font-mono">Reasoning</p>
            <p className="text-xs font-mono text-[var(--neon-dim)] opacity-90">{finding.reasoning}</p>
         </div>
         <div>
            <p className="text-[10px] font-bold uppercase text-[var(--neon)] mb-1 font-mono">Suggested Fix</p>
            <p className="text-xs text-[var(--text-primary)] opacity-90 font-mono">{finding.suggested_fix}</p>
         </div>
      </div>
    </motion.div>
  );
};
