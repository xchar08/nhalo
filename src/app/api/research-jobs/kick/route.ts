// ============================================================================
// FILE: src/app/api/research-jobs/kick/route.ts
// ============================================================================
import { NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import { runResearchJobAdmin } from '@/app/actions/analyze-pdr';

export async function POST() {
  // User-authenticated (no bearer secrets exposed to client)
  const supabase = await createClient();
  const { data: userRes, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userRes.user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json(
      { success: false, error: 'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY' },
      { status: 500 }
    );
  }

  const admin = createAdminClient(supabaseUrl, serviceKey);

  // Kick the oldest queued job for this user
  const { data: job, error: jobErr } = await admin
    .from('research_jobs')
    .select('id')
    .eq('user_id', userRes.user.id)
    .eq('status', 'queued')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (jobErr) return NextResponse.json({ success: false, error: jobErr.message }, { status: 500 });
  if (!job) return NextResponse.json({ success: true, message: 'No queued jobs to kick' });

  const res = await runResearchJobAdmin(String(job.id));
  return NextResponse.json({ success: true, kicked: true, result: res });
}
