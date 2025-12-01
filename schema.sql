-- ============================================================================
-- Halo Research - Full Database Schema
-- ============================================================================
-- Run this entire script in the Supabase SQL Editor to initialize the project.

-- 1. Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. USERS & PROFILES (Managed by Supabase Auth, but we can add a profile table if needed)
-- For this simple version, we just rely on 'auth.users' and link data to 'user_id'
-- ============================================================================

-- ============================================================================
-- 2. DOCUMENTS (Stores crawled URLs and content)
-- ============================================================================
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  url TEXT NOT NULL UNIQUE,
  title TEXT,
  domain TEXT,
  confidence_aggregate FLOAT DEFAULT 0.5,
  metadata JSONB DEFAULT '{}',
  content_embedding vector(1536), -- Compatible with OpenAI Ada-002
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Policy: Public Read (Anyone can read documents)
CREATE POLICY "Public documents are viewable by everyone" 
ON documents FOR SELECT USING (true);

-- Policy: Service Role Only (Only the backend/crawler can insert)
-- (In Supabase, 'service_role' key bypasses RLS, so strict policies aren't needed for inserts if you use that key)
-- But for safety, we allow authenticated users to insert if they are acting as agents
CREATE POLICY "Authenticated users can insert documents" 
ON documents FOR INSERT TO authenticated WITH CHECK (true);


-- ============================================================================
-- 3. UPDATE EVENTS (The "Feed")
-- ============================================================================
CREATE TABLE IF NOT EXISTS update_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_id UUID REFERENCES documents(id),
  event_type TEXT NOT NULL, -- 'new_content', 'alert', 'digest'
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE update_events ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own events
CREATE POLICY "Users can view their own events" 
ON update_events FOR SELECT TO authenticated 
USING (auth.uid() = user_id);

-- Policy: Service role can insert events for anyone (Background jobs)
-- Note: We must allow inserts so our Server Actions or Cron jobs can create feed items.
CREATE POLICY "Users can insert their own events" 
ON update_events FOR INSERT TO authenticated 
WITH CHECK (auth.uid() = user_id);


-- ============================================================================
-- 4. RESEARCH SESSIONS (History)
-- ============================================================================
CREATE TABLE IF NOT EXISTS research_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE research_sessions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can full access their own sessions
CREATE POLICY "Users can manage their own sessions" 
ON research_sessions FOR ALL TO authenticated 
USING (auth.uid() = user_id);

-- Index for faster history loading
CREATE INDEX IF NOT EXISTS idx_sessions_user ON research_sessions(user_id);


-- ============================================================================
-- 5. HELPER: DEMO DATA INJECTION
-- (Optional: Run this if you want to populate a dummy feed)
-- ============================================================================

-- Insert dummy documents
INSERT INTO documents (id, url, title, domain, metadata)
VALUES 
('d0000000-0000-0000-0000-000000000001', 'https://arxiv.org/abs/2301.00001', 'Advances in Transformer Architecture', 'arxiv.org', '{"snippet": "New attention mechanisms..."}'),
('d0000000-0000-0000-0000-000000000002', 'https://nature.com/articles/s41586-023', 'AlphaFold 3 predicts protein structures', 'nature.com', '{"snippet": "High accuracy protein folding..."}'),
('d0000000-0000-0000-0000-000000000003', 'https://techcrunch.com/ai-regulation', 'EU AI Act Finalized', 'techcrunch.com', '{"snippet": "Regulations for high-risk AI..."}')
ON CONFLICT (url) DO NOTHING;

-- Note: We cannot insert into 'update_events' for a specific user yet 
-- because we don't know your User UUID.
-- The app handles creating new events via the 'monitor.ts' script.
