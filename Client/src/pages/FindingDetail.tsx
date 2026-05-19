import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { AlertTriangle, Tag, CheckCircle, Clock, ShieldAlert, Cpu } from 'lucide-react';

export default function FindingDetail() {
  const { id } = useParams();
  const [fixData, setFixData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const requestAutoFix = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/findings/${id}/fix`);
      const data = await res.json();
      setFixData(data);
    } catch(e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => navigator.clipboard.writeText(text);

  return (
    <motion.div initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex flex-col lg:flex-row gap-6">
       
       {/* LEFT COLUMN */}
       <div className="flex-1 flex flex-col gap-6">
          <div className="card p-6">
             <div className="flex items-center gap-3 mb-4">
                <span className="badge badge-critical text-sm px-3 py-1">Critical</span>
                <span className="text-[var(--textMuted)] monofont text-sm">src/auth/jwt.ts:42</span>
             </div>
             
             <h2 className="text-3xl font-bold mb-4">Hardcoded JWT Secret in Auth Middleware</h2>
             <ReactMarkdown className="prose prose-invert max-w-none text-[var(--textMuted)] leading-relaxed mb-6">
                The application utilizes a hardcoded symmetric key (`"my-super-secret-key"`) for validating and signing JSON Web Tokens.
                If this codebase is compromised or leaked, an attacker can trivially forge valid administrative session packets.
             </ReactMarkdown>
             
             <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-[var(--surfaceLight)] p-4 rounded-lg">
                   <h4 className="text-[var(--textMuted)] text-xs uppercase font-bold mb-2 flex items-center"><Target size={14} className="mr-2" /> CVSS</h4>
                   <p className="font-bold text-xl">9.8 <span className="text-sm font-normal text-[var(--critical)]">Critical</span></p>
                   <p className="text-xs text-[var(--textMuted)] mt-1">CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H</p>
                </div>
                <div className="bg-[var(--surfaceLight)] p-4 rounded-lg">
                   <h4 className="text-[var(--textMuted)] text-xs uppercase font-bold mb-2 flex items-center"><Tag size={14} className="mr-2" /> Compliance</h4>
                   <p className="text-sm">PCI-DSS: Req 8.2</p>
                   <p className="text-sm">SOC 2: CC6.1</p>
                </div>
             </div>

             <div className="mt-8 pt-6 border-t border-[var(--border)] flex justify-between items-center">
                 <select className="bg-[var(--surfaceLight)] border border-[var(--border)] text-[var(--text)] text-sm rounded-md focus:ring-[var(--accent)] focus:border-[var(--accent)] block p-2">
                    <option value="open">Status: Open</option>
                    <option value="false_positive">Status: False Positive</option>
                    <option value="accepted">Status: Risk Accepted</option>
                 </select>
                 <button className="bg-[var(--accent)] text-white px-4 py-2 rounded font-bold text-sm hover:opacity-90 transition-opacity">
                    Update Workflow
                 </button>
             </div>
          </div>
       </div>

       {/* RIGHT COLUMN */}
       <div className="flex-1 flex flex-col gap-6">
          <div className="card p-6 h-full flex flex-col">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2"><Cpu className="text-[var(--accent)]"/> Remediation Panel</h3>
                {!fixData && (
                   <button onClick={requestAutoFix} disabled={loading} className="bg-[var(--accent)] text-white px-4 py-2 rounded text-sm font-bold shadow-lg shadow-indigo-500/20 hover:opacity-90">
                      {loading ? 'Generative AI Running...' : 'Generate AI Fix'}
                   </button>
                )}
             </div>

             {!fixData && !loading && (
                <div className="flex-1 flex flex-col items-center justify-center text-[var(--textMuted)] border-2 border-dashed border-[var(--border)] rounded-lg p-10 mt-4">
                   <ShieldAlert size={48} className="mb-4 opacity-50"/>
                   <p className="text-center max-w-sm">Invoke the Fix Generator Agent to securely patch this vulnerability and review the unified diff.</p>
                </div>
             )}

             {loading && (
                <div className="flex-1 flex items-center justify-center">
                   <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="w-12 h-12 border-4 border-[var(--border)] border-t-[var(--accent)] rounded-full"/>
                </div>
             )}

             {fixData && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4">
                   <div className="flex justify-between items-center bg-[var(--surfaceLight)] p-3 rounded-lg border border-[var(--border)]">
                      <span className="text-sm flex items-center gap-2"><CheckCircle size={16} className="text-[var(--low)]"/> AI Confidence: <strong className="text-[var(--low)] capitalize">{fixData.confidence}</strong></span>
                   </div>
                   
                   <p className="text-sm leading-relaxed text-[var(--text)]">{fixData.explanation}</p>
                   
                   <div className="bg-[#1e1e1e] p-4 rounded-lg font-mono text-xs overflow-x-auto border border-slate-800 shadow-inner">
                      {fixData.diff.split('\n').map((line: string, i: number) => (
                         <div key={i} className={line.startsWith('+') ? 'bg-green-900/20 text-green-400' : line.startsWith('-') ? 'bg-red-900/20 text-red-400' : 'text-slate-400'}>
                             {line.replace(/^(\+|-)/, '$1 ')}
                         </div>
                      ))}
                   </div>
                   
                   <div className="flex justify-end gap-2 mt-4">
                      <button onClick={() => copyToClipboard(fixData.explanation)} className="bg-[var(--surfaceLight)] hover:bg-[var(--border)] px-4 py-2 rounded text-sm transition-colors border border-[var(--border)]">Copy Report Docs</button>
                      <button onClick={() => copyToClipboard(fixData.diff)} className="bg-[var(--low)] hover:opacity-80 text-black font-bold px-4 py-2 rounded text-sm transition-opacity shadow-lg shadow-green-500/20">Copy Diff Patch</button>
                   </div>
                </motion.div>
             )}
          </div>
       </div>

    </motion.div>
  );
}
// Stub component needed for missing icon
function Target(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>; }
