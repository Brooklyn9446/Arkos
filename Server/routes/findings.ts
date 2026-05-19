import { Router } from 'express';
import { supabase } from '../lib/supabase';
import asyncHandler from 'express-async-handler';
import { fixGeneratorAgent } from '../lib/securityGraph'; // Dynamic invoke

const router = Router();

// Get paginated and filtered findings
router.get('/', asyncHandler(async (req, res) => {
  const { projectId, severity, status, category, search, page = '1', limit = '50' } = req.query;
  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  let query = supabase.from('Finding').select('*', { count: 'exact' });

  if (projectId) {
    const { data: scans } = await supabase.from('Scan').select('id').eq('projectId', String(projectId));
    if (scans && scans.length > 0) {
      query = query.in('scanId', scans.map(s => s.id));
    } else {
      res.json({ findings: [], total: 0, page: Number(page), limit: take });
      return;
    }
  }
  if (severity) query = query.eq('severity', String(severity));
  if (status) query = query.eq('status', String(status));
  if (category) query = query.eq('category', String(category));
  if (search) {
    query = query.or(`title.ilike.%${String(search)}%,codeSnippet.ilike.%${String(search)}%`);
  }

  query = query.order('lastSeenAt', { ascending: false }).range(skip, skip + take - 1);

  const { data: findings, count, error } = await query;

  if (error) {
    res.status(500).json({ error: 'Failed to fetch findings' });
    return;
  }

  res.json({ findings, total: count || 0, page: Number(page), limit: take });
}));

// Update finding status
router.patch('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, acceptedReason } = req.body;

  const data: any = {};
  if (status) data.status = status;
  if (acceptedReason) data.acceptedReason = acceptedReason;
  if (status === 'fixed' || status === 'accepted' || status === 'false_positive') {
    data.resolvedAt = new Date().toISOString();
  } else if (status === 'open') {
    data.resolvedAt = null;
  }

  const { data: updated, error } = await supabase
    .from('Finding')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error || !updated) {
    res.status(500).json({ error: 'Failed to update finding' });
    return;
  }

  res.json({ finding: updated });
}));

// Trigger Fix Generator dynamically
router.get('/:id/fix', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const { data: finding, error } = await supabase
    .from('Finding')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !finding) { res.status(404).json({ error: 'Finding not found' }); return; }

  // Check if fix is already cached dynamically in DB
  if (finding.remediationDiff) {
     res.json({ diff: finding.remediationDiff, explanation: finding.remediation, confidence: 'high' });
     return;
  }

  try {
    const result = await fixGeneratorAgent.invoke({ finding });
    await supabase
      .from('Finding')
      .update({ remediationDiff: result.diff, remediation: result.explanation })
      .eq('id', id);

    res.json(result);
  } catch(error) {
    res.status(500).json({ error: 'Failed to generate fix' });
  }
}));

export default router;
