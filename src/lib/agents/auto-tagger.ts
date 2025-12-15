// ============================================================================
// FILE: src/lib/agents/auto-tagger.ts
// ============================================================================
import { createClient } from '@/lib/supabase/server';

export async function autoTagJob(jobId: string, reportText: string) {
  const supabase = await createClient();
  const apiKey = process.env.CEREBRAS_API_KEY;

  if (!apiKey) {
    console.error("Missing CEREBRAS_API_KEY");
    return;
  }

  // Use the SAME model that works in your summarizer
  const MODEL_NAME = 'llama3.1-8b'; 

  const response = await fetch('https://api.cerebras.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL_NAME,
      messages: [
        {
          role: 'user',
          content: `
            Analyze the following research report and extract:
            1. Key ontology concepts (topics, fields) - schema: 'health'|'tech'|'politics'|'general'
            2. Specific entities (Companies, People, Laws, Drugs)

            Return ONLY valid JSON in this format:
            {
              "topics": [{ "label": "...", "scheme": "...", "confidence": 0.9, "evidence": "..." }],
              "entities": [{ "name": "...", "type": "company"|"person"|"law"|"drug", "aliases": ["..."], "confidence": 0.9, "evidence": "..." }]
            }

            REPORT TEXT:
            ${reportText.slice(0, 15000)}
          `
        }
      ],
      response_format: { type: 'json_object' }
    }),
  });

  if (!response.ok) {
    console.error('Cerebras API Error:', await response.text());
    return;
  }

  const json = await response.json();
  const content = json.choices?.[0]?.message?.content;
  
  if (!content) return;

  let data;
  try {
    data = JSON.parse(content);
  } catch (e) {
    console.error('Failed to parse auto-tagger JSON:', e);
    return;
  }

  const results = { concepts: 0, entities: 0 };

  // Process Topics
  if (Array.isArray(data?.topics)) {
    for (const topic of data.topics) {
        const { data: concept } = await supabase
            .from('concepts')
            .upsert(
                { label: topic.label, scheme: topic.scheme || 'general' },
                { onConflict: 'label, scheme' }
            )
            .select('id')
            .single();

        if (concept) {
            await supabase.from('taggings').insert({
                target_id: jobId,
                target_type: 'job',
                concept_id: concept.id,
                confidence: topic.confidence || 0.8,
                evidence: { snippet: topic.evidence || '' },
                source: 'model-v1'
            });
            results.concepts++;
        }
    }
  }

  // Process Entities
  if (Array.isArray(data?.entities)) {
    for (const ent of data.entities) {
        const { data: entity } = await supabase
            .from('entities')
            .upsert(
                { name: ent.name, type: ent.type || 'other', aliases: ent.aliases || [] },
                { onConflict: 'name, type' }
            )
            .select('id')
            .single();

        if (entity) {
            await supabase.from('taggings').insert({
                target_id: jobId,
                target_type: 'job',
                entity_id: entity.id,
                confidence: ent.confidence || 0.8,
                evidence: { snippet: ent.evidence || '' },
                source: 'model-v1'
            });
            results.entities++;
        }
    }
  }

  return results;
}
