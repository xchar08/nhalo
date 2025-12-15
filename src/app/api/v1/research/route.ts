import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey, apiError } from '@/lib/api-auth';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  // 1. Validate API Key
  const auth = await validateApiKey(req);
  if ('error' in auth) {
    // FIX: Force TS to know this is a string
    return apiError(auth.error as string);
  }
  
  const userId = auth.user_id;

  // 2. Parse Request Body
  let body;
  try {
    body = await req.json();
  } catch (e) {
    return apiError('Invalid JSON body', 400);
  }

  const { query, breadth = 2, deepMode = false } = body;

  if (!query) return apiError('Missing "query" field', 400);

  // 3. Create Session
  const { data: session, error: sessionError } = await supabaseAdmin
    .from('research_sessions')
    .insert({
      user_id: userId,
      query: query
    })
    .select()
    .single();

  if (sessionError || !session) {
    // FIX: Provide fallback string
    return NextResponse.json(
      { success: false, error: sessionError?.message || 'Failed to create session' }, 
      { status: 500 }
    );
  }

  // 4. Create Job
  const { data: job, error: jobError } = await supabaseAdmin
    .from('research_jobs')
    .insert({
      user_id: userId,
      session_id: session.id,
      status: 'queued',
      deep_mode: deepMode,
      breadth: breadth,
      input_text: query
    })
    .select()
    .single();

  if (jobError || !job) {
    // FIX: Provide fallback string
    return NextResponse.json(
      { success: false, error: jobError?.message || 'Failed to create job' }, 
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    jobId: job.id,
    sessionId: session.id,
    status: 'queued',
    message: 'Job started successfully'
  }, { status: 202 });
}
