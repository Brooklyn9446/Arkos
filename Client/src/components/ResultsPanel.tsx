import React from "react";
import { Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Finding, Severity } from "../types";
import { FindingCard } from "./FindingCard";
import { ExecutiveReport } from "./ExecutiveReport";

interface ResultsPanelProps {
  status: string;
  currentStep?: string;
  progress: number;
  findings: Finding[];
  report: string | null;
  filterSeverity: Severity | "All";
  setFilterSeverity: (sev: Severity | "All") => void;
}

export const ResultsPanel: React.FC<ResultsPanelProps> = ({
  status,
  currentStep,
  progress,
  findings,
  report,
  filterSeverity,
  setFilterSeverity
}) => {
  const filteredFindings = findings.filter(f => 
    filterSeverity === "All" ? true : f.severity === filterSeverity
  );

  return (
    <div className="col-span-12 lg:col-span-7 flex flex-col bg-[var(--panel-bg)] overflow-hidden">
      {/* Progress / Status Bar */}
      <div className="h-14 border-b border-[var(--border)] flex items-center px-6 justify-between">
        <div className="flex items-center gap-4 flex-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-dim)] w-32">{currentStep}</span>
          <div className="flex-1 h-1 bg-[#0f1115] overflow-hidden max-w-sm">
            <motion.div 
              className="h-full bg-[var(--accent)]"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <div className="text-[10px] font-mono text-[var(--text-dim)] uppercase">
          Node: {status === "analyzing" ? "Working..." : "Standby"}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {status === "idle" && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              className="h-full flex flex-col items-center justify-center text-center p-12 space-y-4"
            >
              <Lock size={64} strokeWidth={1} />
              <div>
                <h3 className="text-xl font-bold uppercase tracking-widest">System Standby</h3>
                <p className="text-xs max-w-xs mx-auto mt-2">Ready for architectural security analysis.</p>
              </div>
            </motion.div>
          )}

          {status === "completed" && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col h-full"
            >
              {/* Summary Cards */}
              <div className="grid grid-cols-4 gap-px bg-[var(--border)] border-b border-[var(--border)]">
                <div className="bg-[#0f1115] p-6">
                  <p className="panel-title mb-2">Findings</p>
                  <p className="text-3xl font-mono leading-none font-bold">{findings.length}</p>
                </div>
                <div className="bg-[#0f1115] p-6">
                  <p className="panel-title mb-2 text-[var(--critical)]">Critical</p>
                  <p className="text-3xl font-mono leading-none font-bold text-[var(--critical)]">
                    {findings.filter(f => f.severity === "Critical").length.toString().padStart(2, '0')}
                  </p>
                </div>
                <div className="bg-[#0f1115] p-6">
                  <p className="panel-title mb-2 text-[var(--high)]">High Risk</p>
                  <p className="text-3xl font-mono leading-none font-bold text-[var(--high)]">
                    {findings.filter(f => f.severity === "High").length.toString().padStart(2, '0')}
                  </p>
                </div>
                <div className="bg-[#0f1115] p-6">
                  <p className="panel-title mb-2">Agents</p>
                  <p className="text-3xl font-mono leading-none font-bold text-[var(--accent)]">04</p>
                </div>
              </div>

              {/* Findings List */}
              <div className="flex-1 overflow-y-auto p-6 bg-[var(--panel-bg)]">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="panel-title text-[var(--text)]">Vulnerabilities Discovered</h2>
                  <div className="flex gap-1">
                    {(["All", "Critical", "High", "Medium", "Low"] as const).map(sev => (
                      <button
                        key={sev}
                        onClick={() => setFilterSeverity(sev)}
                        className={`px-3 py-1 text-[9px] font-bold border rounded-[3px] tracking-wider uppercase transition-all ${
                          filterSeverity === sev ? "bg-[var(--accent)] text-white border-[var(--accent)]" : "bg-transparent text-[var(--text-dim)] border-[var(--border)] hover:border-[var(--text-dim)]"
                        }`}
                      >
                        {sev}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-[1px] bg-[var(--border)] border border-[var(--border)]">
                  {filteredFindings.map((finding, idx) => (
                    <FindingCard key={idx} finding={finding} index={idx} />
                  ))}
                </div>
                
                {/* Executive Report Panel */}
                {report && <ExecutiveReport report={report} />}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
