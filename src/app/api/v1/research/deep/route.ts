import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey, apiError } from '@/lib/api-auth';
import { createClient } from '@supabase/supabase-js';

// 1. Setup Admin Client (Bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  // 2. Validate API Key
  const auth = await validateApiKey(req);
  if ('error' in auth) {
    return apiError(auth.error as string, 401);
  }
  const userId = auth.user_id;

  try {
    const body = await req.json();
    const { 
      parentNodeId, 
      seedType, 
      seedText, 
      seedUrl, 
      depth = 1, 
      breadth = 4, 
      sessionId 
    } = body;

    // 3. Validation
    if (!parentNodeId || !seedText || !sessionId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 4. Generate a unique Branch ID
    const branchId = `b_${Date.now()}_api_${Math.random().toString(16).slice(2, 6)}`;

    // 5. Insert directly into DB (Replacing diveDeeperAction)
    const { error } = await supabaseAdmin
      .from('research_branches')
      .insert({
        user_id: userId,
        session_id: sessionId,
        branch_id: branchId,
        parent_node_id: parentNodeId,
        seed_type: seedType,
        seed_text: seedText,
        seed_url: seedUrl,
        depth: depth,
        breadth: breadth,
        context: '', // Init empty
        report: ''   // Init empty
      });

    if (error) {
      console.error("Deep dive insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 6. Return Success 
    // Note: We return "Queued" status. The background worker will pick up 
    // the new branch row and process it.
    return NextResponse.json({
      success: true,
      branchId,
      status: 'queued',
      message: 'Deep dive branch created successfully'
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
