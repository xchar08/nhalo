import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey, apiError } from '@/lib/api-auth';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ branchId: string }> }
) {
  // 1. Validate API Key
  const auth = await validateApiKey(req);
  if ('error' in auth) return apiError(auth.error as string);

  const { branchId } = await params;

  // 2. Fetch Branch
  // We check if 'report' is empty to determine status (simplistic check)
  const { data: branch, error } = await supabaseAdmin
    .from('research_branches')
    .select('*')
    .eq('branch_id', branchId)
    .eq('user_id', auth.user_id)
    .single();

  if (error || !branch) {
    return NextResponse.json(
      { success: false, error: 'Branch not found or access denied' },
      { status: 404 }
    );
  }

  // 3. Determine Status based on content
  // (Branches don't have a 'status' column, so we check if the report exists)
  const isComplete = branch.report && branch.report.length > 50;
  
  return NextResponse.json({
    success: true,
    status: isComplete ? 'succeeded' : 'processing',
    data: {
      report: branch.report,
      context: branch.context,
      breadth: branch.breadth,
      depth: branch.depth
    },
    timestamps: {
      created: branch.created_at,
      updated: branch.updated_at
    }
  });
}
