import { createClient } from '@supabase/supabase-js';
import { runResearchJobAdmin, runDeepDiveAdmin } from '../app/actions/analyze-pdr';
import dotenv from 'dotenv';
import http from 'http'; // <--- NEW IMPORT

// Load env vars
dotenv.config({ path: '.env.local' });

// ============================================================================
// 1. DUMMY SERVER (Keeps Render Happy)
// ============================================================================
const port = process.env.PORT || 8080;

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Halo Worker is running...');
});

server.listen(port, () => {
  console.log(`✅ Health check server listening on port ${port}`);
});

// ============================================================================
// 2. WORKER LOGIC
// ============================================================================
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Critical: Missing Supabase URL or Service Role Key.");
  // Don't exit process, or Render will restart us endlessly. Just log error.
} else {
  const supabase = createClient(supabaseUrl, supabaseKey);
  console.log("🚀 Halo Worker started. Polling for jobs...");
  
  // Start the loop
  processQueue(supabase);
}

async function processQueue(supabase: any) {
  while (true) {
    try {
      // --------------------------------------------------------
      // A. MAIN JOBS
      // --------------------------------------------------------
      const { data: job } = await supabase
        .from('research_jobs')
        .select('*')
        .eq('status', 'queued')
        .limit(1)
        .single();

      if (job) {
        console.log(`[Job] Found ${job.id}. Executing...`);
        const res = await runResearchJobAdmin(job.id);
        console.log(`[Job] Finished ${job.id}:`, res.success);
      }

      // --------------------------------------------------------
      // B. DEEP DIVES
      // --------------------------------------------------------
      const { data: branch } = await supabase
        .from('research_branches')
        .select('*')
        .eq('report', '') // Empty report = pending
        .neq('seed_text', '') 
        .limit(1)
        .single();

      if (branch) {
        console.log(`[Deep] Found branch ${branch.branch_id}. Executing...`);
        // Mark processing immediately to prevent double-fetch
        await supabase.from('research_branches').update({ report: '(processing...)' }).eq('id', branch.id);
        
        const res = await runDeepDiveAdmin(branch.branch_id);
        console.log(`[Deep] Finished branch ${branch.branch_id}:`, res.success);
      }

      // If nothing found, wait 2 seconds
      if (!job && !branch) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }

    } catch (error) {
      console.error("Worker Loop Error:", error);
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
}
