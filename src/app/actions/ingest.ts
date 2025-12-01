// ============================================================================
// FILE: src/app/actions/ingest.ts
// ============================================================================
'use server';

import { createClient } from '@supabase/supabase-js';

// Server-side client for secure ingestion
// Note: Ensure SUPABASE_SERVICE_ROLE_KEY is in your .env.local
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Ingests a documented source into Supabase.
 * Intended to be called after a successful crawl/grade cycle.
 */
export async function ingestDocument(doc: any) {
  // Basic upsert to avoid duplicates on URL
  const { error } = await supabase
    .from('documents')
    .upsert({
      id: doc.id,
      url: doc.url,
      title: doc.title,
      domain: doc.domain,
      math_density: doc.mathDensity,
      metadata: doc.metadata,
      confidence_aggregate: doc.sourceTrustScore // Initial value
    });

  if (error) {
    console.error('Ingest error:', error);
    return { success: false, error };
  }

  // If we had vector generation, we would insert chunks into 'document_chunks' here
  
  return { success: true };
}
