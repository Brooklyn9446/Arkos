import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import { supabase } from './lib/supabase';
import { securityPipeline } from './lib/securityGraph';
import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { exec } from 'child_process';
import util from 'util';

const execAsync = util.promisify(exec);

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', { maxRetriesPerRequest: null });

connection.on('error', (err: any) => {
  if (err.code === 'ECONNREFUSED') console.warn('[Worker] Waiting for Redis connection...');
});

// Helper for Supabase broadcast
async function publishProgress(scanId: string, data: any) {
  const channel = supabase.channel(`scan:progress:${scanId}`);
  // To send a broadcast, we must subscribe first, but for simplicity, we can just call send
  // Note: supabase-js v2 requires you to be subscribed to send broadcasts.
  return new Promise((resolve) => {
    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        channel.send({
          type: 'broadcast',
          event: 'progress',
          payload: JSON.stringify(data)
        }).then(() => {
          supabase.removeChannel(channel);
          resolve(null);
        });
      }
    });
  });
}

export const worker = new Worker('scanQueue', async (job) => {
  const { projectId, scanId } = job.data;

  // Publish start event
  await publishProgress(scanId, { status: 'running', progress: 0, step: 'Initializing Scan' });

  // Retrieve project
  const { data: project } = await supabase.from('Project').select('*').eq('id', projectId).single();
  if (!project) throw new Error("Project not found");

  // Mark scan as running
  await supabase.from('Scan').update({ status: 'running' }).eq('id', scanId);

  // Pull code and map dependencies
  let code = '';
  let dependencyTree = { nodes: [] as any[], edges: [] as any[] };
  let tmpDir = '';

  if (project.repoUrl) {
    try {
      await publishProgress(scanId, { status: 'running', progress: 5, step: 'Cloning Repository...' });
      tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'scan-'));
      await execAsync(`git clone ${project.repoUrl} ${tmpDir}`);

      await publishProgress(scanId, { status: 'running', progress: 10, step: 'Mapping Dependencies...' });

      const nodes: any[] = [];
      const edges: any[] = [];
      const nodeSet = new Set<string>();

      // Function to recursively read and filter files
      async function walkDir(dir: string) {
        const files = await fs.readdir(dir, { withFileTypes: true });
        for (const file of files) {
          const fullPath = path.join(dir, file.name);
          const relativePath = path.relative(tmpDir, fullPath).replace(/\\/g, '/');

          if (['node_modules', 'dist', 'lib', 'build', '.git', '.github'].includes(file.name)) continue;

          if (file.isDirectory()) {
            await walkDir(fullPath);
          } else {
            if (file.name.match(/\.(js|jsx|ts|tsx|py|go|java)$/i)) {
              try {
                const content = await fs.readFile(fullPath, 'utf8');
                code += `\n// File: ${relativePath}\n${content}\n`;

                if (!nodeSet.has(relativePath)) {
                  nodes.push({ id: relativePath, label: file.name });
                  nodeSet.add(relativePath);
                }

                // Simple regex to find imports
                const importRegex = /(?:import|require)\s*\(?['"]([^'"]+)['"]\)?/g;
                let match;
                while ((match = importRegex.exec(content)) !== null) {
                  const imported = match[1];
                  if (imported.startsWith('.')) {
                    // Try to guess target path
                    let targetPath = path.join(path.dirname(relativePath), imported).replace(/\\/g, '/');
                    if (!path.extname(targetPath)) targetPath += '.ts';

                    if (!nodeSet.has(targetPath)) {
                      nodes.push({ id: targetPath, label: path.basename(targetPath) });
                      nodeSet.add(targetPath);
                    }
                    edges.push({ source: relativePath, target: targetPath });
                  }
                }
              } catch (e) {
                console.warn(`Could not read file ${relativePath}`);
              }
            }
          }
        }
      }

      await walkDir(tmpDir);

      dependencyTree = { nodes, edges };
      await publishProgress(scanId, { status: 'running', progress: 15, step: 'Dependencies Mapped', dependencyTree });

    } catch (e) {
      console.error('Error processing repo:', e);
      throw e;
    } finally {
      if (tmpDir) await fs.rm(tmpDir, { recursive: true, force: true });
    }
  } else {
    // Simulate pulling code
    code = `// MOCK CODE FOR SCANNING \n function test() { eval(req.body.test); }`;
  }

  // Publish analysis event
  await publishProgress(scanId, { status: 'running', progress: 10, step: 'Running LangGraph Agents', code });

  // Start Pipeline
  const result = await securityPipeline.invoke({ code });

  await publishProgress(scanId, { status: 'running', progress: 90, step: 'Persisting Findings' });

  let critical = 0, high = 0, medium = 0, low = 0;

  // Process findings
  const findingsList = result.findings || [];
  for (const finding of findingsList) {
    const fingerprintString = `${finding.file}:${finding.line_range}:${finding.vulnerability_type}:${finding.description}`;
    const fingerprint = crypto.createHash('sha256').update(fingerprintString).digest('hex');

    const lowerSev = (finding.severity || 'info').toLowerCase();
    if (lowerSev === 'critical') critical++;
    else if (lowerSev === 'high') high++;
    else if (lowerSev === 'medium') medium++;
    else if (lowerSev === 'low') low++;

    // Check if finding exists
    const { data: existing } = await supabase
      .from('Finding')
      .select('id')
      .eq('fingerprint', fingerprint)
      // Supabase lacks complex relational filtering without a join, so we first fetch the scanIds
      // Actually, fingerprint should be unique per scan or project.
      .single();

    if (existing) {
      await supabase
        .from('Finding')
        .update({ lastSeenAt: new Date().toISOString() })
        .eq('id', existing.id);
    } else {
      await supabase.from('Finding').insert([{
        scanId,
        fingerprint,
        title: finding.vulnerability_type,
        description: finding.description,
        severity: lowerSev,
        category: finding.category || 'owasp',
        agent: finding.agent || 'owaspAgent',
        filePath: finding.file,
        remediation: finding.suggested_fix,
      }]);
    }
  }

  // Calculate Risk Score
  const maxPossibleScore = (critical + high + medium + low) * 10 || 1;
  const score = ((critical * 10 + high * 7 + medium * 4 + low * 1) / maxPossibleScore) * 100;

  await supabase
    .from('Scan')
    .update({ status: 'complete', riskScore: score, completedAt: new Date().toISOString() })
    .eq('id', scanId);

  await publishProgress(scanId, { status: 'complete', progress: 100, step: 'Scan Finished' });

  return { success: true, score };
}, { connection });





