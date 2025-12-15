import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey, apiError } from '@/lib/api-auth';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  // 1. Validate API Key
  const auth = await validateApiKey(req);
  if ('error' in auth) {
    // FIX: Force TS to know this is a string
    return apiError(auth.error as string);
  }

  const { jobId } = await params;

  // 2. Fetch Job
  const { data: job, error } = await supabaseAdmin
    .from('research_jobs')
    .select('id, status, result, error, created_at, updated_at')
    .eq('id', jobId)
    .eq('user_id', auth.user_id)
    .single();

  if (error || !job) {
    return NextResponse.json(
      { success: false, error: 'Job not found or access denied' },
      { status: 404 }
    );
  }

  // 3. Return Status
  return NextResponse.json({
    success: true,
    status: job.status,
    data: job.result,
    error: job.error,
    timestamps: {
      created: job.created_at,
      updated: job.updated_at
    }
  });
}
