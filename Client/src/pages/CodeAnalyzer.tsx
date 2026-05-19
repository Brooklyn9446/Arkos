import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, Github, Loader2, ArrowRight } from 'lucide-react';
import { ReactFlow, MiniMap, Controls, Background, useNodesState, useEdgesState, Node, Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

export default function CodeAnalyzer() {
  const [repoUrl, setRepoUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [statusText, setStatusText] = useState('');
  
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  
  const navigate = useNavigate();
  const eventSourceRef = useRef<EventSource | null>(null);

  const startAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoUrl) return;

    setIsScanning(true);
    setStatusText('Initializing workspace...');

    try {
      // 1. Create a quick project
      const projectRes = await fetch('http://localhost:3000/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: repoUrl.split('/').pop() || 'QuickScan',
          repoUrl,
          organizationId: '123e4567-e89b-12d3-a456-426614174000', // dummy
          language: 'TypeScript'
        })
      });
      
      const { project } = await projectRes.json();
      if (!project) throw new Error("Failed to create project");

      setStatusText('Queueing scan...');

      // 2. Start Scan
      const scanRes = await fetch('http://localhost:3000/api/scans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.id,
          branch: 'main'
        })
      });

      const { scanId } = await scanRes.json();

      // 3. Listen for SSE Progress to get the dependency tree
      setStatusText('Cloning repository...');
      
      const eventSource = new EventSource(`http://localhost:3000/api/scans/${scanId}/progress`);
      eventSourceRef.current = eventSource;

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.step) setStatusText(data.step);

        if (data.dependencyTree) {
          // Layout nodes simply for now (circle or grid)
          const newNodes = data.dependencyTree.nodes.map((n: any, i: number) => ({
            id: n.id,
            position: { x: Math.random() * 600, y: Math.random() * 400 },
            data: { label: n.label },
            type: 'default',
            style: {
              background: 'var(--surfaceLight)',
              color: 'var(--text)',
              border: '1px solid var(--accent)',
              borderRadius: '8px',
              padding: '10px'
            }
          }));
          
          const newEdges = data.dependencyTree.edges.map((e: any) => ({
            id: `e-${e.source}-${e.target}`,
            source: e.source,
            target: e.target,
            animated: true,
            style: { stroke: 'var(--accent)' }
          }));

          setNodes(newNodes);
          setEdges(newEdges);
        }

        if (data.status === 'complete' || data.progress === 100) {
          eventSource.close();
          setTimeout(() => navigate(`/scan/${scanId}`), 2000);
        }
      };

      eventSource.onerror = () => {
        eventSource.close();
      };

    } catch (err) {
      console.error(err);
      setStatusText('Failed to start analysis.');
      setIsScanning(false);
    }
  };

  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  return (
    <div className="flex flex-col gap-6 fade-in h-full">
      <div className="flex items-center gap-3 mb-2">
        <Target size={32} className="text-[var(--accent)]" />
        <h2 className="text-3xl font-bold">Code Analyzer</h2>
      </div>

      {!isScanning ? (
        <div className="card p-8 max-w-2xl mx-auto mt-10 w-full relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--void)] via-[var(--accent)] to-[var(--void)] opacity-50"></div>
          
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Github /> Analyze GitHub Repository
          </h3>
          <p className="text-[var(--textMuted)] mb-6 text-sm">
            Enter a public GitHub repository URL. Sentinel AI will clone the repository, map the dependency tree, and execute a comprehensive security scan.
          </p>

          <form onSubmit={startAnalysis} className="flex flex-col gap-4">
            <div>
              <label className="text-xs text-[var(--textMuted)] uppercase font-bold mb-2 block">Repository URL</label>
              <input 
                type="url" 
                required
                value={repoUrl}
                onChange={e => setRepoUrl(e.target.value)}
                placeholder="https://github.com/username/repo" 
                className="w-full bg-[var(--crater)] border border-[var(--border)] rounded p-3 text-[var(--text)] focus:border-[var(--accent)] focus:outline-none transition-colors"
              />
            </div>
            
            <button type="submit" className="btn btn-primary w-full flex items-center justify-center gap-2 mt-2 py-3">
              Start Analysis <ArrowRight size={18} />
            </button>
          </form>
        </div>
      ) : (
        <div className="flex flex-col h-[calc(100vh-200px)] border border-[var(--border)] rounded-xl overflow-hidden bg-[var(--crater)] relative">
          <div className="absolute top-4 left-4 z-10 flex items-center gap-3 bg-[var(--surfaceLight)] p-3 rounded-lg shadow-lg border border-[var(--border)]">
            <Loader2 className="animate-spin text-[var(--accent)]" size={24} />
            <div>
              <div className="text-sm font-bold">{statusText}</div>
              <div className="text-xs text-[var(--textMuted)]">Mapping Dependencies...</div>
            </div>
          </div>
          
          <ReactFlow 
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            fitView
            className="bg-[var(--void)]"
            defaultEdgeOptions={{ type: 'smoothstep' }}
          >
            <Background color="var(--border)" gap={20} />
            <Controls />
            <MiniMap 
              nodeColor="var(--accent)"
              maskColor="rgba(0, 0, 0, 0.8)"
              style={{ backgroundColor: 'var(--crater)' }}
            />
          </ReactFlow>
        </div>
      )}
    </div>
  );
}
