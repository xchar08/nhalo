// ============================================================================
// FILE: src/lib/feed/digest.ts
// ============================================================================
import { SupabaseClient } from '@supabase/supabase-js';

export interface DigestItem {
  topic: string;
  documentIds: string[];
  summary: string;
}

interface UpdateEventWithDoc {
  document_id: string;
  documents: {
    title: string;
    metadata: Record<string, unknown>;
  } | null;
}

// Accept the client as a parameter so the Server Action can pass the authenticated one
export async function generateSmartDigest(userId: string, supabase: SupabaseClient): Promise<DigestItem[]> {
  
  // 1. Real Query with JOIN
  const { data, error } = await supabase
    .from('update_events')
    .select('document_id, documents(title, metadata)') 
    .eq('user_id', userId)
    .eq('is_read', false)
    .limit(50);

  if (error) {
    console.error("Feed fetch error:", error);
    return [];
  }

  if (!data || data.length === 0) return [];

  const events = data as unknown as UpdateEventWithDoc[];
  const clusters = new Map<string, UpdateEventWithDoc[]>();
  
  // 2. Cluster Logic
  events.forEach(ev => {
    const title = ev.documents?.title || 'Unknown';
    const key = title.split(' ')[0] || 'General'; 
    if (!clusters.has(key)) clusters.set(key, []);
    clusters.get(key)?.push(ev);
  });

  // 3. Format Output
  const results: DigestItem[] = [];
  for (const [key, items] of clusters) {
    results.push({
      topic: `${items.length} new updates: ${key}`,
      documentIds: items.map(i => i.document_id),
      summary: `Latest: ${items.map(i => i.documents?.title).slice(0, 2).join(', ')}`
    });
  }

  // Ensure plain object return
  return JSON.parse(JSON.stringify(results));
}
