// ============================================================================
// FILE: src/app/actions/feed.ts
// ============================================================================
'use server';

import { generateSmartDigest, DigestItem } from '@/lib/feed/digest';
import { createClient } from '@/lib/supabase/server'; 

export interface FeedResult {
  success: boolean;
  digest: DigestItem[];
  error?: string;
}

export async function getSmartDigestAction(): Promise<FeedResult> {
  try {
    const supabase = await createClient();
    
    // 1. Strict Auth Check
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.warn('[Feed Action] Unauthorized access attempt.');
      return { success: false, digest: [], error: 'Unauthorized' };
    }
    
    // 2. Fetch Data for Authenticated User Only
    console.log(`[Feed Action] Fetching digest for user: ${user.id}`);
    
    // UPDATE: Pass the 'supabase' client here!
    const digest = await generateSmartDigest(user.id, supabase);
    
    return { success: true, digest };

  } catch (error) {
    console.error('[Feed Action] Critical Error:', error);
    return { success: false, digest: [], error: 'Internal Server Error' };
  }
}
