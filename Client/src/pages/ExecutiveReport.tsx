import React, { useRef } from 'react';
import { useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { useReactToPrint } from 'react-to-print';
import { Printer, Copy, AlertTriangle } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts';

export default function ExecutiveReport() {
   const { scanId } = useParams();
   const reportRef = useRef<HTMLDivElement>(null);

   const handlePrint = useReactToPrint({
      content: () => reportRef.current,
      documentTitle: `Sentinel_Report_${scanId}`
   });

   const generateShareLink = async () => {
      try {
         const res = await fetch(`/api/scans/${scanId}/share`);
         const { url } = await res.json();
         navigator.clipboard.writeText(url);
         alert("Read-only Share Link copied to clipboard!");
      } catch (e) {
         alert("Error generating link.");
      }
   };

   const copyLink = () => generateShareLink();

   const mockRadar = [{ subject: 'A01 Injection', A: 4 }, { subject: 'A03 Auth', A: 2 }, { subject: 'A06 Comp', A: 7 }];

   return (
      <div className="max-w-4xl mx-auto flex flex-col gap-6 fade-in">
         <div className="flex justify-between items-center bg-[var(--surface)] border border-[var(--border)] p-4 rounded-xl shadow-lg">
            <div className="flex flex-col">
               <h2 className="text-xl font-bold">Executive Report Actions</h2>
               <span className="text-sm text-[var(--textMuted)]">Scan ID: {scanId}</span>
            </div>
            <div className="flex gap-3">
               <button onClick={() => handlePrint()} className="bg-[var(--surfaceLight)] border border-[var(--border)] px-4 py-2 rounded flex items-center gap-2 hover:bg-[var(--border)] transition-colors"><Printer size={16} /> Export PDF</button>
               <button onClick={copyLink} className="bg-[var(--accent)] text-white px-4 py-2 rounded flex items-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-indigo-500/20"><Copy size={16} /> Copy Shareable Link</button>
            </div>
         </div>

         <div ref={reportRef} className="bg-white text-slate-900 border border-[var(--border)] p-12 rounded-xl shadow-2xl relative print:m-0 print:p-8 print:shadow-none">
            <div className="flex justify-between items-start border-b border-slate-200 pb-8 mb-8">
               <div>
                  <h1 className="text-4xl font-extrabold text-slate-900 mb-2">Sentinel Security Audit</h1>
                  <p className="text-slate-500">Continuous Intelligence Platform • Automated Report</p>
               </div>
               <div className="text-right">
                  <div className="text-sm text-slate-500 font-bold uppercase tracking-wider mb-1">Overall Risk Score</div>
                  <div className="text-6xl font-black text-red-500">84</div>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-12 mb-12">
               <div>
                  <h3 className="text-xl font-bold mb-4 flex items-center"><AlertTriangle className="text-red-500 mr-2" /> Executive Summary</h3>
                  <ReactMarkdown className="prose prose-slate max-w-none text-sm text-slate-600">
                     The Sentinel AI multi-agent scanning pipeline completed execution. **High** and **Critical** vulnerabilities were identified, primarily stemming from hardcoded credentials in the authentication microservices and exposed Docker configurations. Immediate remediation of the `src/auth/jwt.ts` secret is strongly recommended to prevent session hijacking.
                  </ReactMarkdown>
               </div>

               <div className="border border-slate-200 rounded-lg p-6 bg-slate-50 flex flex-col items-center">
                  <h3 className="text-sm uppercase font-bold text-slate-500 mb-4 w-full text-center">Threat Surface Topography</h3>
                  <div className="w-full h-48">
                     <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={mockRadar}>
                           <PolarGrid stroke="#cbd5e1" />
                           <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10 }} />
                           <Radar name="Findings" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} />
                        </RadarChart>
                     </ResponsiveContainer>
                  </div>
               </div>
            </div>

            <h3 className="text-xl font-bold mb-4 border-b border-slate-200 pb-2">Critical Remediation Targets</h3>
            <table className="w-full text-left text-sm mb-12">
               <thead>
                  <tr className="bg-slate-100 uppercase text-xs text-slate-500">
                     <th className="p-3 rounded-tl-lg">Severity</th>
                     <th className="p-3">Title</th>
                     <th className="p-3 rounded-tr-lg text-right">CVSS</th>
                  </tr>
               </thead>
               <tbody>
                  <tr className="border-b border-slate-100">
                     <td className="p-3 font-bold text-red-500">CRITICAL</td>
                     <td className="p-3 font-medium text-slate-800">Hardcoded JWT Secret in Middleware</td>
                     <td className="p-3 text-right font-mono">9.8</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                     <td className="p-3 font-bold text-orange-500">HIGH</td>
                     <td className="p-3 font-medium text-slate-800">Docker Privileged Container Escape</td>
                     <td className="p-3 text-right font-mono">8.3</td>
                  </tr>
               </tbody>
            </table>

            <div className="text-center text-slate-400 text-xs mt-16 pt-8 border-t border-slate-100">
               Generated by Sentinel AI Security Analyzer • {new Date().toLocaleDateString()}
            </div>
         </div>
      </div>
   );
}
