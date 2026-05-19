import { Router } from 'express';
import { supabase } from '../lib/supabase';
import asyncHandler from 'express-async-handler';

const router = Router();

// List all projects
router.get('/', asyncHandler(async (req, res) => {
  const { data: projects, error } = await supabase
    .from('Project')
    .select(`
      *,
      scans:Scan(count)
    `)
    .order('createdAt', { ascending: false });

  if (error) {
    res.status(500).json({ error: 'Failed to fetch projects' });
    return;
  }

  // Map the Supabase response to match the expected _count format if necessary,
  // or just return as is if the frontend can handle the `scans` array of `{count}`.
  const mappedProjects = projects.map(p => ({
    ...p,
    _count: { scans: p.scans && p.scans.length > 0 ? p.scans[0].count : 0 }
  }));

  res.json({ projects: mappedProjects });
}));

// Create project
router.post('/', asyncHandler(async (req, res) => {
  const { name, repoUrl, language, organizationId } = req.body;

  if (!name || !organizationId) {
    res.status(400).json({ error: 'name and organizationId are required' });
    return;
  }

  const { data: project, error } = await supabase
    .from('Project')
    .insert([{ name, repoUrl, language, organizationId }])
    .select()
    .single();

  if (error || !project) {
    res.status(500).json({ error: 'Failed to create project', details: error });
    return;
  }

  res.json({ project });
}));

// Project Dashboard Stats
router.get('/:id/dashboard', asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { data: project, error: projError } = await supabase
    .from('Project')
    .select(`
      *,
      scans:Scan(*)
    `)
    .eq('id', id)
    .order('createdAt', { foreignTable: 'Scan', ascending: false })
    .limit(5, { foreignTable: 'Scan' })
    .single();

  if (projError || !project) {
    res.status(404).json({ error: 'Project not found' });
    return;
  }

  // Supabase doesn't easily do nested relation filtering where in one query for open findings
  // So we get all scans for this project (not just top 5) to find all open findings
  const { data: allScans } = await supabase.from('Scan').select('id').eq('projectId', id);
  const scanIds = allScans ? allScans.map(s => s.id) : [];

  let findings: any[] = [];
  if (scanIds.length > 0) {
    const { data: openFindings } = await supabase
      .from('Finding')
      .select('*')
      .in('scanId', scanIds)
      .eq('status', 'open');
    if (openFindings) findings = openFindings;
  }

  const findingsByCategory = findings.reduce((acc: any, f) => {
    acc[f.category] = (acc[f.category] || 0) + 1;
    return acc;
  }, {});

  const findingsBySeverity = findings.reduce((acc: any, f) => {
    acc[f.severity] = (acc[f.severity] || 0) + 1;
    return acc;
  }, {});

  const owaspRadar = findings.reduce((acc: any, f) => {
    if (f.owaspCategory) {
      acc[f.owaspCategory] = (acc[f.owaspCategory] || 0) + 1;
    }
    return acc;
  }, {});

  const recentScans = project.scans || [];
  const riskScore = recentScans[0]?.riskScore || 0;
  const riskTrend = [...recentScans].map(s => s.riskScore || 0).reverse();

  res.json({
    riskScore,
    riskTrend,
    findingsByCategory,
    findingsBySeverity,
    owaspRadar,
    recentScans,
    topVulnerableFiles: [] // Mocked for now
  });
}));

export default router;
