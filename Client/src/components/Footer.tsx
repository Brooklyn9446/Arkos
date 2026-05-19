import React from "react";

export const Footer: React.FC = () => {
  return (
    <footer className="h-8 bg-[var(--panel-bg)] border-t border-[var(--border)] flex items-center justify-between px-6 text-[9px] font-mono text-[var(--text-dim)] uppercase tracking-[0.2em]">
      <div className="flex items-center gap-6">
        <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-[var(--low)]" /> AI: CONNECTED</span>
        <span className="flex items-center gap-1.5">INTEGRITY SCRIBED: 0x4F2A</span>
      </div>
      <div>
        Sentinel-X Logic Engine // Confidential
      </div>
    </footer>
  );
};
