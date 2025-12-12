// ============================================================================
// FILE: src/lib/ai/fast-summarizer.ts
// ============================================================================
import OpenAI from 'openai'; 

// Initialize Cerebras Client
const client = new OpenAI({
    apiKey: process.env.CEREBRAS_API_KEY || "demo",
    baseURL: "https://api.cerebras.ai/v1"
});

/**
 * Summarizes a raw text page into concise bullet points relevant to the query.
 * Uses Llama 3.1 8B on Cerebras for extreme speed.
 */
export async function fastSummarize(text: string, query: string): Promise<string> {
    if (!process.env.CEREBRAS_API_KEY) {
        return `[Raw Excerpt]: ${text.slice(0, 800)}...`; 
    }

    if (!text || text.length < 100) return "";

    try {
        const completion = await client.chat.completions.create({
            messages: [
                { role: "system", content: "You are a high-speed research summarizer. Extract only facts relevant to the query. Be extremely concise. Return 3-5 bullet points." },
                { role: "user", content: `Query: ${query}\n\nText to Summarize: ${text.slice(0, 12000)}` }
            ],
            model: "llama3.1-8b", 
            max_tokens: 400,
            temperature: 0.1
        });

        const summary = completion.choices[0]?.message?.content || "";
        return `**Source Summary**:\n${summary}`;
    } catch (e: any) {
        console.error("Cerebras Summary Failed:", e.status, e.message);
        // Fallback to raw text if AI fails
        return `[Raw Excerpt]: ${text.slice(0, 800)}...`;
    }
}

/**
 * Answering questions based on accumulated context
 */
export async function answerWithContext(question: string, context: string): Promise<string> {
     if (!process.env.CEREBRAS_API_KEY) return "No Cerebras API Key provided for Q&A.";

     try {
        const completion = await client.chat.completions.create({
            messages: [
                { role: "system", content: "You are a helpful research assistant. Answer the user's question using ONLY the provided context. If the answer is not in the context, say so." },
                { role: "user", content: `Context:\n${context}\n\nQuestion: ${question}` }
            ],
            // CHANGED: Use 8b for reliability if 70b is giving 404s on your tier
            model: "llama3.1-8b", 
            max_tokens: 1000
        });
        return completion.choices[0]?.message?.content || "No answer generated.";
     } catch (e) {
         console.error("Cerebras Q&A Failed:", e);
         return "Failed to generate answer.";
     }
}
