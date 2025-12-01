// ============================================================================
// FILE: src/lib/cron/monitor.ts
// ============================================================================
import { createClient } from '@supabase/supabase-js';
import { searchWeb } from '@/lib/crawlers/free-crawler';

/**
 * C.6 Watchdog Monitor
 * Scheduled job to check for new content on watched topics.
 * Designed to run via Vercel Cron.
 */

export async function runWatchdog() {
  console.log('[Watchdog] Starting monitor cycle...');

  // Initialize ADMIN client for background jobs (bypasses RLS)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // 1. Get active watchlists
  // Mock: usually fetch from 'user_watchlists' table
  const queries = ['transformer architectures', 'mRNA vaccine side effects'];

  for (const query of queries) {
    // 2. Search for fresh content
    const results = await searchWeb(`${query} latest research`);
    
    for (const res of results) {
      // 3. Check if exists
      const { data: existing } = await supabase
        .from('documents')
        .select('id')
        .eq('url', res.url)
        .single();

      if (!existing) {
        // 4. Ingest new doc (Simplified)
        const { data: newDoc, error } = await supabase
          .from('documents')
          .insert({
            url: res.url,
            title: res.title,
            domain: 'research', // inferred
            confidence_aggregate: 0.5,
            metadata: { snippet: res.snippet }
          })
          .select()
          .single();

        if (newDoc && !error) {
          // 5. Create Update Event
          // Notify users watching this topic
          // In a real app, you'd query a 'subscriptions' table to find WHO to notify.
          // For now, we notify a specific user or 'demo-user'
          await supabase.from('update_events').insert({
             user_id: 'YOUR_USER_ID_HERE', // <--- UPDATE THIS TO YOUR REAL ID FOR TESTING
             document_id: newDoc.id,
             event_type: 'new_content',
             is_read: false
          });
          console.log(`[Watchdog] New content found: ${res.title}`);
        }
      }
    }
  }
  
  return { success: true };
}
