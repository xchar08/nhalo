'use server';

import { createClient } from '@/lib/supabase/server';
import { markdownToLatex } from '@/lib/latex/md-to-latex';

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');
  return { supabase, user };
}

export async function downloadResearchReportAction(id: string, type: 'job' | 'branch') {
  try {
    const { supabase, user } = await requireUser();
    let markdown = '';
    let title = 'Research Report';
    let sources: any[] = [];

    if (type === 'job') {
      const { data: job, error } = await supabase
        .from('research_jobs')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error || !job) throw new Error('Job not found');
      
      const result = job.result as any;
      markdown = result?.unifiedReport || '';
      title = `Research: ${job.input_text?.slice(0, 50) || 'Untitled'}`;
      sources = result?.sources || [];

    } else if (type === 'branch') {
      const { data: branch, error } = await supabase
        .from('research_branches')
        .select('*')
        .eq('branch_id', id)
        .eq('user_id', user.id)
        .single();

      if (error || !branch) throw new Error('Branch not found');

      markdown = branch.report || '';
      title = `Deep Dive: ${branch.seed_text?.slice(0, 50) || 'Untitled'}`;
      // Branch sources are a bit harder to track in current schema unless we parse them or fetch linked docs
      // For now, we'll leave sources empty for branches or parse them from context if needed.
    }

    if (!markdown) throw new Error('No report content found');

    const latex = markdownToLatex(title, markdown, sources);
    
    return { success: true, latex, filename: `report-${id.slice(0, 8)}.tex` };
  } catch (e: any) {
    console.error('Report Generation Failed', e);
    return { success: false, error: e.message };
  }
}
