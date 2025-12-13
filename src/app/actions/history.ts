// ============================================================================
// FILE: src/app/actions/history.ts
// ============================================================================
'use server';

import { createClient } from '@/lib/supabase/server';

export interface ResearchProject {
  id: string;
  query: string;
  created_at: string;
  claim_count: number;
}

export async function getUserHistory() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, projects: [] as ResearchProject[] };

  const { data, error } = await supabase
    .from('research_sessions')
    .select('id, query, created_at, metadata')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) return { success: false, projects: [] as ResearchProject[] };

  const projects: ResearchProject[] = (data || []).map((row: any) => ({
    id: row.id,
    query: row.query,
    created_at: row.created_at,
    claim_count: Number(row.metadata?.claim_count ?? 0),
  }));

  return { success: true, projects };
}

export async function saveResearchSession(query: string, metadata: Record<string, any> = {}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from('research_sessions')
    .insert({
      user_id: user.id,
      query,
      metadata,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteResearchSession(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'Unauthorized' };

  const { error } = await supabase
    .from('research_sessions')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function wipeUserHistory() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'Unauthorized' };

  const { error } = await supabase
    .from('research_sessions')
    .delete()
    .eq('user_id', user.id);

  if (error) return { success: false, error: error.message };
  return { success: true };
}
