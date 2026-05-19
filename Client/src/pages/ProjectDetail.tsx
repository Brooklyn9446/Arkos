import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const startScan = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/scans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: id, branch: 'main' })
      });
      const data = await res.json();
      navigate(`/scan/${data.scanId}`);
    } catch(e) {
      console.error(e);
      setLoading(false);
    }
  };

  return (
    <div className="text-white">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Project Overview</h2>
        <button 
          onClick={startScan} 
          disabled={loading}
          className="bg-accent px-4 py-2 rounded font-bold hover:bg-accent/80"
        >
          {loading ? 'Starting...' : 'Trigger New Scan'}
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-6 rounded mb-8">
        <h3 className="text-xl mb-2">Scan History</h3>
        <p className="text-slate-400">No scans have been initiated yet.</p>
        {/* Real implementation would list previous scans */}
      </div>
    </div>
  );
}
