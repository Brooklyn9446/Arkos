import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, Activity, ShieldAlert, FileText, Settings, Code } from 'lucide-react';

import Dashboard from './pages/Dashboard';
import ProjectDetail from './pages/ProjectDetail.tsx';
import LiveScan from './pages/LiveScan.tsx';
import GlobalFindings from './pages/GlobalFindings.tsx';
import FindingDetail from './pages/FindingDetail.tsx';
import ExecutiveReport from './pages/ExecutiveReport.tsx';
import PolicyManagement from './pages/PolicyManagement.tsx';
import CodeAnalyzer from './pages/CodeAnalyzer.tsx';
import { SentinelBrand } from './components/SentinelLogo';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex text-[var(--text-primary)] bg-[var(--void)] font-body">
        {/* Sidebar */}
        <aside className="w-64 bg-[var(--abyss)] border-r border-[var(--neon-border)] flex flex-col items-center py-6 text-white text-sm">
          <div className="mb-6">
            <a href="/" className="flex items-center gap-3 no-underline hover:opacity-95">
              <SentinelBrand size={40} />
            </a>
          </div>
          <nav className="w-full px-4 flex flex-col gap-1">
            <Link to="/" className="flex items-center gap-3 p-3 hover:bg-[var(--crater)] hover:border-l-2 hover:border-l-[var(--neon)] rounded transition-all"><LayoutDashboard size={18} /> Dashboard</Link>
            <Link to="/code-analyzer" className="flex items-center gap-3 p-3 hover:bg-[var(--crater)] hover:border-l-2 hover:border-l-[var(--neon)] rounded transition-all"><Code size={18} /> Code Analyzer</Link>
            <Link to="/findings" className="flex items-center gap-3 p-3 hover:bg-[var(--crater)] hover:border-l-2 hover:border-l-[var(--neon)] rounded transition-all"><ShieldAlert size={18} /> Findings</Link>
            <Link to="/settings/policies" className="flex items-center gap-3 p-3 hover:bg-[var(--crater)] hover:border-l-2 hover:border-l-[var(--neon)] rounded transition-all"><Settings size={18} /> Policies</Link>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto bg-[var(--void)] p-8 bg-[linear-gradient(to_bottom,rgba(0,255,65,0.02),rgba(0,255,65,0.01))]">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/projects/:id" element={<ProjectDetail />} />
            <Route path="/scan/:id" element={<LiveScan />} />
            <Route path="/code-analyzer" element={<CodeAnalyzer />} />
            <Route path="/findings" element={<GlobalFindings />} />
            <Route path="/findings/:id" element={<FindingDetail />} />
            <Route path="/report/:scanId" element={<ExecutiveReport />} />
            <Route path="/settings/policies" element={<PolicyManagement />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
