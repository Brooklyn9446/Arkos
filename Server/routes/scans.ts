import { Router } from 'express';
import { supabase } from '../lib/supabase';
import { scanQueue } from '../queue';
import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';

const router = Router();

// Create scan job
router.post('/', asyncHandler(async (req, res) => {
  const { projectId, branch, commitHash } = req.body;
  if (!projectId) { res.status(400).json({ error: 'projectId is required' }); return; }

  const { data: scan, error } = await supabase
    .from('Scan')
    .insert([{ projectId, branch, commitHash, status: 'pending' }])
    .select()
    .single();

  if (error || !scan) {
    res.status(500).json({ error: 'Failed to create scan', details: error });
    return;
  }

  await scanQueue.add('run-scan', { scanId: scan.id, projectId });
  res.json({ message: 'Scan started', scanId: scan.id });
}));

// Shareable Link JWT Generation
router.get('/:id/share', asyncHandler(async (req, res) => {
  const secret = process.env.SHARE_SECRET || 'fallback_secret';
  const token = jwt.sign({ scanId: req.params.id, role: 'viewer' }, secret, { expiresIn: '7d' });
  res.json({ url: `${process.env.FRONTEND_URL}/report/${req.params.id}?token=${token}` });
}));

// Get scan with findings (Auth OR Valid JWT Viewer Token)
router.get('/:id', asyncHandler(async (req, res) => {
  const { token } = req.query;
  if (token) {
     const secret = process.env.SHARE_SECRET || 'fallback_secret';
     try {
       const decoded: any = jwt.verify(String(token), secret);
       if (decoded.scanId !== req.params.id) throw new Error("Invalid scan token");
     } catch (e) {
       res.status(403).json({ error: 'Invalid or expired share token' });
       return;
     }
  }

  // Fetch scan, project, and findings
  const { data: scan, error } = await supabase
    .from('Scan')
    .select(`
      *,
      project:Project(*),
      findings:Finding(*)
    `)
    .eq('id', req.params.id)
    .single();

  if (error || !scan) { res.status(404).json({ error: 'Scan not found' }); return; }
  res.json({ scan });
}));

// SSE exact pattern using Supabase Realtime Broadcasts
router.get('/:id/progress', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  
  const channel = supabase.channel(`scan:progress:${req.params.id}`);
  
  channel.on('broadcast', { event: 'progress' }, (payload) => {
    // The worker should broadcast payload.payload as string
    res.write(`data: ${payload.payload}\n\n`);
  }).subscribe();

  req.on('close', () => {
    supabase.removeChannel(channel);
  });
});

export default router;
