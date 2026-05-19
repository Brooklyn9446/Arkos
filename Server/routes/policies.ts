import { Router } from 'express';
import { supabase } from '../lib/supabase';
import asyncHandler from 'express-async-handler';

const router = Router();

router.get('/', asyncHandler(async (req, res) => {
  const { data: policies, error } = await supabase.from('Policy').select('*');
  if (error) { res.status(500).json({ error: 'Failed to fetch policies' }); return; }
  res.json({ policies });
}));

router.post('/', asyncHandler(async (req, res) => {
  const { name, description, rules, organizationId } = req.body;
  const { data: policy, error } = await supabase
    .from('Policy')
    .insert([{ name, description, rules, organizationId }])
    .select()
    .single();

  if (error || !policy) { res.status(500).json({ error: 'Failed to create policy' }); return; }
  res.json({ policy });
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  const { error } = await supabase.from('Policy').delete().eq('id', req.params.id);
  if (error) { res.status(500).json({ error: 'Failed to delete policy' }); return; }
  res.json({ success: true });
}));

export default router;
