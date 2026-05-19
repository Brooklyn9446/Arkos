import { Router } from 'express';
import crypto from 'crypto';
import asyncHandler from 'express-async-handler';
import { scanQueue } from '../queue';
import { supabase } from '../lib/supabase';

const router = Router();

const GITHUB_SECRET = process.env.GITHUB_WEBHOOK_SECRET || '';

router.post('/github', asyncHandler(async (req, res) => {
  const signature = req.headers['x-hub-signature-256'] as string;
  const event = req.headers['x-github-event'] as string;

  if (GITHUB_SECRET && signature) {
    const hmac = crypto.createHmac('sha256', GITHUB_SECRET);
    const digest = 'sha256=' + hmac.update(JSON.stringify(req.body)).digest('hex');
    
    if (signature !== digest) {
      res.status(401).json({ error: 'Webhook signature validation failed' });
      return;
    }
  }

  // Handle push or pull_request
  if (event === 'push' || event === 'pull_request') {
    const repoUrl = req.body.repository?.clone_url;
    const branch = req.body.ref?.replace('refs/heads/', '') || 'main';
    const commitHash = req.body.after || req.body.pull_request?.head?.sha;

    // Find project by repoUrl
    const { data: project } = await supabase.from('Project').select('id').eq('repoUrl', repoUrl).single();
    if (project) {
      const { data: scan, error } = await supabase.from('Scan').insert([{
        projectId: project.id,
        branch,
        commitHash,
        status: 'pending',
        triggeredBy: 'webhook'
      }]).select().single();

      if (scan && !error) {
        await scanQueue.add('run-scan', { scanId: scan.id, projectId: project.id });
        res.json({ message: 'Push received, scan queued', scanId: scan.id });
        return;
      }
    }
  }
  
  res.json({ message: 'Event ignored' });
}));

export default router;
