// ============================================================================
// FILE: src/app/api/research-jobs/run/route.ts
// ============================================================================
import { NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { runResearchJobAdmin } from '@/app/actions/analyze-pdr';

export async function POST(req: Request) {
  const expected = process.env.CRON_WORKER_BEARER || '';
  const auth = req.headers.get('authorization') || '';
  const token = auth.toLowerCase().startsWith('bearer ') ? auth.slice(7) : '';

  if (!expected || token !== expected) {
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

  const { data: job, error } = await admin
    .from('research_jobs')
    .select('id')
    .eq('status', 'queued')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  if (!job) return NextResponse.json({ success: true, message: 'No queued jobs' });

  const res = await runResearchJobAdmin(String(job.id));
  return NextResponse.json(res);
}
