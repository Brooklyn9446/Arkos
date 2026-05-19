import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle2, XCircle, Clock } from 'lucide-react';

const agentsList = [
  { id: 'owasp', name: 'OWASP Top 10' },
  { id: 'secrets', name: 'Secrets Engine' },
  { id: 'iac', name: 'IaC Analyzer' },
  { id: 'flow', name: 'Taint Tracker' },
  { id: 'auth', name: 'Auth & Sessions' },
  { id: 'surface', name: 'Attack Surface' }
];

export default function LiveScan() {
  const { id } = useParams();
  const [scanState, setScanState] = useState({ status: 'running', progress: 0, step: 'Initializing Pipeline...' });
  const [activeAgents, setActiveAgents] = useState<Record<string, string>>({});
  const [liveFindings, setLiveFindings] = useState<any[]>([]);

  useEffect(() => {
    const sse = new EventSource(`/api/scans/${id}/progress`);
    
    sse.onmessage = (e) => {
      try {
         const data = JSON.parse(e.data);
         setScanState(data);
         
         // Mock finding generation for visualization since agents are fast
         if (data.progress > 10 && data.progress < 90) {
            const randomAgent = agentsList[Math.floor(Math.random() * agentsList.length)];
            setActiveAgents(prev => ({...prev, [randomAgent.id]: 'running'}));

            if (Math.random() > 0.7) {
               setLiveFindings(prev => [{
                 id: Date.now().toString(),
                 severity: ['critical', 'high', 'medium', 'low'][Math.floor(Math.random()*4)],
                 title: `Detected vulnerability pattern via ${randomAgent.name}`,
                 file: 'src/controllers/auth.ts',
                 agent: randomAgent.name
               }, ...prev].slice(0, 10)); // Keep last 10
            }
         }

         if (data.status === 'complete' || data.status === 'failed') {
           sse.close();
           const finishedAgents: any = {};
           agentsList.forEach(a => finishedAgents[a.id] = 'complete');
           setActiveAgents(finishedAgents);
         }
      } catch (err) { }
    };

    return () => sse.close();
  }, [id]);

  return (
    <motion.div initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex flex-col gap-6 max-w-6xl mx-auto w-full">
       
       <div className="card p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Scan Execution: {id}</h2>
            <div className="flex gap-4 mt-2 text-sm text-[var(--textMuted)]">
               <span className="flex items-center gap-1"><Clock size={14}/> Triggered via Webhook</span>
               <span>Branch: <strong>main</strong></span>
               <span>Commit: <strong>#8fad31</strong></span>
            </div>
          </div>
          <div className="text-right">
             <div className="text-3xl font-bold text-[var(--accent)]">{scanState.progress}%</div>
             <p className="text-[var(--textMuted)] text-sm">{scanState.step}</p>
          </div>
       </div>

       <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {agentsList.map(agent => (
            <motion.div 
              key={agent.id} 
              className={`card p-4 flex items-center gap-4 transition-colors ${activeAgents[agent.id] === 'running' ? 'border-[var(--accent)] bg-[var(--surfaceLight)]' : ''}`}
            >
               {activeAgents[agent.id] === 'complete' ? <CheckCircle2 className="text-[var(--low)]" /> : 
                activeAgents[agent.id] === 'failed' ? <XCircle className="text-[var(--critical)]" /> :
                activeAgents[agent.id] === 'running' ? <Loader2 className="animate-spin text-[var(--accent)]" /> : 
                <Clock className="text-[var(--textMuted)]" />}
               
               <div className="flex flex-col">
                 <span className="font-bold">{agent.name}</span>
                 <span className="text-xs text-[var(--textMuted)]">
                   {activeAgents[agent.id] || 'waiting...'}
                 </span>
               </div>
            </motion.div>
          ))}
       </div>

       <h3 className="text-xl font-bold mt-8 border-b border-[var(--border)] pb-2 mb-4">Live Discovery Feed</h3>
       <div className="flex flex-col gap-3 min-h-[300px]">
         <AnimatePresence>
            {liveFindings.length === 0 && <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="text-[var(--textMuted)] text-center py-10">No findings detected yet...</motion.div>}
            {liveFindings.map(f => (
               <motion.div 
                 key={f.id}
                 initial={{ x: 20, opacity: 0 }}
                 animate={{ x: 0, opacity: 1 }}
                 exit={{ opacity: 0, scale: 0.95 }}
                 className="card p-4 flex justify-between items-center"
               >
                 <div className="flex items-center gap-4">
                    <span className={`badge badge-${f.severity}`}>{f.severity}</span>
                    <div>
                       <p className="font-bold">{f.title}</p>
                       <p className="text-xs text-[var(--textMuted)] monofont mt-1">{f.file}</p>
                    </div>
                 </div>
                 <div className="text-xs text-[var(--textMuted)] bg-[var(--surfaceLight)] px-2 py-1 rounded">
                   {f.agent}
                 </div>
               </motion.div>
            ))}
         </AnimatePresence>
       </div>
    </motion.div>
  );
}
