import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// 1. Setup Admin Client to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! 
);

export async function validateApiKey(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { error: 'Missing or malformed Authorization header (Bearer sk_...)' };
  }

  const plainApiKey = authHeader.replace('Bearer ', '').trim();

  // 2. Hash the incoming key to match DB
  const incomingKeyHash = crypto
    .createHash('sha256')
    .update(plainApiKey)
    .digest('hex');

  // 3. Query using ADMIN client (ignores RLS)
  const { data, error } = await supabaseAdmin
    .from('api_keys')
    .select('user_id, id')
    .eq('key_hash', incomingKeyHash)
    .single();

  if (error || !data) {
    console.error("API Auth Failed:", error?.message);
    return { error: 'Invalid API Key' };
  }

  // 4. Update usage stats (fire and forget)
  supabaseAdmin
    .from('api_keys')
    .update({ last_used_at: new Date().toISOString() })
    .eq('id', data.id)
    .then();

  return { user_id: data.user_id };
}

export function apiError(message: string, status = 401) {
  return NextResponse.json(
    { success: false, error: { message, type: 'auth_error' } },
    { status }
  );
}
