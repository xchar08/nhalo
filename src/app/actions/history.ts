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

/**
 * Fetch user's past research sessions.
 */
export async function getUserHistory() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, projects: [] };

  const { data, error } = await supabase
    .from('research_sessions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) return { success: false, projects: [] };

  return { success: true, projects: data as ResearchProject[] };
}

/**
 * Save a new research query to history.
 */
export async function saveResearchSession(query: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;

  const { data } = await supabase
    .from('research_sessions')
    .insert({
        user_id: user.id,
        query: query,
        metadata: {} 
    })
    .select()
    .single();
    
  return data;
}

/**
 * Delete a single research session by ID.
 */
export async function deleteResearchSession(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'Unauthorized' };

  const { error } = await supabase
    .from('research_sessions')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id); // Ensure ownership

  if (error) {
      console.error("Delete failed:", error);
      return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Wipe ALL history for the current user.
 */
export async function wipeUserHistory() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'Unauthorized' };

  const { error } = await supabase
    .from('research_sessions')
    .delete()
    .eq('user_id', user.id);

  if (error) {
      console.error("Wipe failed:", error);
      return { success: false, error: error.message };
  }

  return { success: true };
}
