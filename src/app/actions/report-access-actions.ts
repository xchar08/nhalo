'use server';

import { createClient } from '@/lib/supabase/server';

async function requireUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error('Unauthorized');
  return { supabase, user };
}

export async function createReportAction(title: string, content: string, jobId?: string) {
  const { supabase, user } = await requireUser();
  
  const { data, error } = await supabase
    .from('reports')
    .insert({
      user_id: user.id,
      title,
      content,
      // We could store the jobId in metadata if we added a jsonb column, 
      // but for now we just create the report document.
    })
    .select()
    .single();

  if (error) throw error;
  return { success: true, reportId: data.id };
}

export async function getReportAction(reportId: string) {
  const { supabase, user } = await requireUser();
  const userEmail = user.email;

  // 1. Try to fetch as owner
  let { data: report, error } = await supabase
    .from('reports')
    .select('*')
    .eq('id', reportId)
    .single();

  if (report) return { success: true, report, role: report.user_id === user.id ? 'owner' : 'view' };

  // 2. If not found or error, check shared access via RLS (The RLS policy should handle this actually)
  // But let's be explicit about the role.
  
  // Actually, simpler: just select. If RLS works, we get data.
  // The trick is knowing if we have edit access.
  
  const { data: share } = await supabase
    .from('report_shares')
    .select('role')
    .eq('report_id', reportId)
    .eq('user_email', userEmail)
    .single();

  if (share) {
     // Re-fetch report (it failed above if RLS was strict, or maybe it didn't)
     // Actually, if RLS is set up correctly, the first query returns result if shared.
     // But we want to know the ROLE explicitly.
     const { data: sharedReport } = await supabase.from('reports').select('*').eq('id', reportId).single();
     if (sharedReport) {
        return { success: true, report: sharedReport, role: share.role };
     }
  }

  return { success: false, error: 'Report not found or access denied' };
}

export async function shareReportAction(reportId: string, email: string, role: 'view' | 'edit') {
  const { supabase, user } = await requireUser();
  
  // Verify ownership
  const { data: report } = await supabase
    .from('reports')
    .select('user_id')
    .eq('id', reportId)
    .single();
    
  if (!report || report.user_id !== user.id) {
    throw new Error('Only the owner can share this report');
  }

  // Insert share
  const { error } = await supabase
    .from('report_shares')
    .upsert({
      report_id: reportId,
      user_email: email,
      role
    }, { onConflict: 'report_id,user_email' });

  if (error) throw error;
  return { success: true };
}

export async function getReportSharesAction(reportId: string) {
  const { supabase, user } = await requireUser();
  
   // Verify ownership
  const { data: report } = await supabase
    .from('reports')
    .select('user_id')
    .eq('id', reportId)
    .single();
    
  if (!report || report.user_id !== user.id) {
    throw new Error('Only the owner can view shares');
  }

  const { data: shares, error } = await supabase
    .from('report_shares')
    .select('*')
    .eq('report_id', reportId);

  if (error) throw error;
  return { success: true, shares };
}
