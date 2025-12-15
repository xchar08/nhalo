'use server';

import { createClient } from '@/lib/supabase/server';
import crypto from 'crypto';

export async function createApiKeyAction(labelInput: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'Unauthorized' };

  let finalLabel = labelInput.trim();

  // If no label provided, auto-generate "Untitled Key X"
  if (!finalLabel) {
    const { count } = await supabase
      .from('api_keys')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .ilike('label', 'Untitled Key%');

    const nextNum = (count || 0) + 1;
    finalLabel = `Untitled Key ${nextNum}`;
  }

  // 1. Generate Key
  const randomBytes = crypto.randomBytes(24).toString('hex');
  const plainTextKey = `sk_halo_${randomBytes}`;

  // 2. Hash Key
  const keyHash = crypto
    .createHash('sha256')
    .update(plainTextKey)
    .digest('hex');

  // 3. Insert
  const { error } = await supabase
    .from('api_keys')
    .insert({
      user_id: user.id,
      key_hash: keyHash, 
      label: finalLabel
    });

  if (error) return { success: false, error: error.message };

  return { success: true, apiKey: plainTextKey };
}

export async function renameApiKeyAction(id: string, newLabel: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'Unauthorized' };

  const { error } = await supabase
    .from('api_keys')
    .update({ label: newLabel })
    .eq('id', id)
    .eq('user_id', user.id); 

  if (error) return { success: false, error: error.message };
  return { success: true };
}
