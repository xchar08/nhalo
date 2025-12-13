// ============================================================================
// FILE: src/lib/ai/fast-summarizer.ts
// ============================================================================
import OpenAI from 'openai';
import { RateLimiter } from '@/lib/ingest/rate-limiter';

const client = new OpenAI({
  apiKey: process.env.CEREBRAS_API_KEY || 'demo',
  baseURL: 'https://api.cerebras.ai/v1',
});

// Conservative default: 12 requests/minute per instance for LLM calls
const llmLimiter = new RateLimiter(12, 60_000);

function safeSlice(s: string, n: number) {
  if (!s) return '';
  return s.length <= n ? s : s.slice(0, n);
}

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function callWithRetry<T>(fn: () => Promise<T>, opts?: { retries?: number }) {
  const retries = Math.max(0, Math.min(3, opts?.retries ?? 2));

  let lastErr: any = null;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      await llmLimiter.waitForToken();
      return await fn();
    } catch (e: any) {
      lastErr = e;
      const status = e?.status ?? e?.response?.status;
      if (status !== 429 || attempt === retries) break;

      // exponential backoff: 1s, 2s, 4s
      await sleep(1000 * Math.pow(2, attempt));
    }
  }
  throw lastErr;
}

export async function fastSummarize(text: string, query: string): Promise<string> {
  if (!process.env.CEREBRAS_API_KEY) return `[Raw Excerpt]: ${safeSlice(text, 800)}...`;
  if (!text || text.length < 100) return '';

  try {
    const completion = await callWithRetry(
      () =>
        client.chat.completions.create({
          model: 'llama3.1-8b',
          temperature: 0.15,
          max_tokens: 520,
          messages: [
            {
              role: 'system',
              content:
                'Summarize for research. Output compact bullets. Include: key claims, numbers, constraints, limitations, and what to verify. No hype.',
            },
            { role: 'user', content: `Query:\n${query}\n\nContent:\n${safeSlice(text, 14000)}` },
          ],
        }),
      { retries: 2 }
    );

    return (completion.choices[0]?.message?.content || '').trim();
  } catch (e: any) {
    console.error('Cerebras Summary Failed:', e?.status, e?.message);
    return `[Raw Excerpt]: ${safeSlice(text, 800)}...`;
  }
}

export async function writeBetterReport(instruction: string, context: string): Promise<string> {
  if (!process.env.CEREBRAS_API_KEY) return `No Cerebras key.\n${instruction}\n\n${safeSlice(context, 2000)}...`;

  try {
    const completion = await callWithRetry(
      () =>
        client.chat.completions.create({
          model: 'llama3.1-8b',
          temperature: 0.25,
          max_tokens: 1500,
          messages: [
            {
              role: 'system',
              content:
                'You are an expert technical research writer. Write concise, comprehensive, defensive reports. Separate evidence from assumptions. Use Markdown tables where useful.',
            },
            { role: 'user', content: `Instruction:\n${instruction}\n\nContext:\n${safeSlice(context, 22000)}` },
          ],
        }),
      { retries: 2 }
    );

    return (completion.choices[0]?.message?.content || '').trim();
  } catch (e: any) {
    console.error('Cerebras Writer Failed:', e?.status, e?.message);
    return 'Failed to generate improved report.';
  }
}

export async function answerWithContext(question: string, context: string): Promise<string> {
  if (!process.env.CEREBRAS_API_KEY) return 'No Cerebras API Key provided for Q&A.';

  try {
    const completion = await callWithRetry(
      () =>
        client.chat.completions.create({
          model: 'llama3.1-8b',
          temperature: 0.2,
          max_tokens: 900,
          messages: [
            {
              role: 'system',
              content:
                'Answer using ONLY the provided context. If missing, say so and suggest what to search next. Be concise.',
            },
            { role: 'user', content: `Context:\n${safeSlice(context, 22000)}\n\nQuestion:\n${question}` },
          ],
        }),
      { retries: 2 }
    );

    return completion.choices[0]?.message?.content || 'No answer generated.';
  } catch (e: any) {
    console.error('Cerebras Q&A Failed:', e?.status, e?.message);
    return 'Failed to generate answer.';
  }
}
