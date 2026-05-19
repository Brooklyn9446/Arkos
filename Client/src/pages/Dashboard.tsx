import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, PieChart, Pie, Cell } from 'recharts';
import { ShieldAlert, TrendingDown, Target, Activity } from 'lucide-react';

const mockTrendData = Array.from({length: 10}, (_, i) => ({ name: `Scan ${i+1}`, score: 65 + Math.random() * 20 }));
const mockRadarData = [
  { subject: 'A01', A: 5 }, { subject: 'A02', A: 2 }, { subject: 'A03', A: 8 }, 
  { subject: 'A04', A: 1 }, { subject: 'A05', A: 4 }, { subject: 'A06', A: 6 }
];
const pieData = [
  { name: 'Critical', value: 2, color: 'var(--critical)' },
  { name: 'High', value: 8, color: 'var(--high)' },
  { name: 'Medium', value: 10, color: 'var(--medium)' },
];

export default function Dashboard() {
  const [stats, setStats] = useState<any>({
    riskScore: 72, riskDelta: -5, openFindings: 20, scansThisMonth: 14, mttr: 4.2
  });

  const getScoreColor = (score: number) => {
    if (score < 30) return 'text-[var(--low)]';
    if (score < 60) return 'text-[var(--medium)]';
    if (score < 80) return 'text-[var(--high)]';
    return 'text-[var(--critical)]';
  };

  return (
    <div className="flex flex-col gap-6 fade-in">
      <h2 className="text-3xl font-bold mb-2">Security Intelligence Dashboard</h2>

      {/* TOP ROW */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card p-6 flex flex-col justify-between">
           <div className="flex justify-between items-center text-[var(--textMuted)]">
              <span>Overall Risk Score</span> <Target size={18} />
           </div>
           <div className="mt-4 flex items-end justify-between">
              <span className={`text-5xl font-bold ${getScoreColor(stats.riskScore)}`}>{stats.riskScore}</span>
              <span className="text-[var(--low)] flex items-center text-sm"><TrendingDown size={14} className="mr-1"/> {stats.riskDelta}%</span>
           </div>
        </div>

        <div className="card p-6 flex flex-col justify-between">
           <div className="flex justify-between items-center text-[var(--textMuted)]">
              <span>Open Findings</span> <ShieldAlert size={18} />
           </div>
           <div className="mt-4 flex items-end gap-2">
              <span className="text-4xl font-bold">{stats.openFindings}</span>
              <div className="flex gap-1 mb-1">
                 <span className="badge badge-critical">2</span>
                 <span className="badge badge-high">8</span>
                 <span className="badge badge-medium">10</span>
              </div>
           </div>
        </div>

        <div className="card p-6 flex flex-col justify-between">
           <div className="flex justify-between items-center text-[var(--textMuted)]">
              <span>Scans This Month</span> <Activity size={18} />
           </div>
           <div className="mt-4">
              <span className="text-4xl font-bold text-[var(--text)]">{stats.scansThisMonth}</span>
           </div>
        </div>

        <div className="card p-6 flex flex-col justify-between">
           <div className="flex justify-between items-center text-[var(--textMuted)]">
              <span>Mean Time to Resolve</span>
           </div>
           <div className="mt-4">
              <span className="text-4xl font-bold text-[var(--text)]">{stats.mttr}</span><span className="text-[var(--textMuted)] ml-2">days</span>
           </div>
        </div>
      </div>

      {/* MIDDLE ROW CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[350px]">
         <div className="card p-6 flex flex-col col-span-1">
            <h3 className="text-[var(--textMuted)] text-sm uppercase font-bold mb-4">Risk Trend</h3>
            <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={mockTrendData}>
                  <defs>
                     <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.5}/>
                        <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/>
                     </linearGradient>
                  </defs>
                  <XAxis dataKey="name" hide />
                  <Tooltip contentStyle={{backgroundColor: 'var(--surfaceLight)', border: 'none', borderRadius: '8px'}}/>
                  <Area type="monotone" dataKey="score" stroke="var(--accent)" fillOpacity={1} fill="url(#colorScore)" />
               </AreaChart>
            </ResponsiveContainer>
         </div>

         <div className="card p-6 flex flex-col col-span-1">
            <h3 className="text-[var(--textMuted)] text-sm uppercase font-bold mb-4">OWASP Coverage</h3>
            <ResponsiveContainer width="100%" height="100%">
               <RadarChart cx="50%" cy="50%" outerRadius="70%" data={mockRadarData}>
                  <PolarGrid stroke="var(--border)" />
                  <PolarAngleAxis dataKey="subject" tick={{fill: 'var(--textMuted)', fontSize: 10}} />
                  <Radar name="Findings" dataKey="A" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.5} />
               </RadarChart>
            </ResponsiveContainer>
         </div>

         <div className="card p-6 flex flex-col col-span-1">
            <h3 className="text-[var(--textMuted)] text-sm uppercase font-bold mb-4">Severity Distribution</h3>
            <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                     {pieData.map((entry, index) => ( <Cell key={`cell-${index}`} fill={entry.color} /> ))}
                  </Pie>
                  <Tooltip contentStyle={{backgroundColor: 'var(--surfaceLight)', border: 'none', borderRadius: '8px'}}/>
               </PieChart>
            </ResponsiveContainer>
         </div>
      </div>
    </div>
  );
}
