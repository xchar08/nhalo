-- ============================================================================
-- schema.sql (SAFE TO COMMIT)
-- Extensions + tables + RLS/policies + triggers + indexes
-- ============================================================================

-- Extensions
create extension if not exists "vector";
create extension if not exists "uuid-ossp";
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- ============================================================================
-- updated_at helper trigger
-- ============================================================================
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ============================================================================
-- DOCUMENTS
-- ============================================================================
create table if not exists public.documents (
  id uuid primary key default uuid_generate_v4(),
  url text not null unique,
  title text,
  domain text,
  confidence_aggregate float default 0.5,
  metadata jsonb default '{}'::jsonb,
  content_embedding vector(1536),
  created_at timestamptz default now()
);

alter table public.documents enable row level security;

drop policy if exists "Public documents are viewable by everyone" on public.documents;
create policy "Public documents are viewable by everyone"
on public.documents for select using (true);

drop policy if exists "Authenticated users can insert documents" on public.documents;
create policy "Authenticated users can insert documents"
on public.documents for insert to authenticated
with check (true);

create index if not exists idx_documents_domain on public.documents(domain);

-- ============================================================================
-- RESEARCH SESSIONS
-- ============================================================================
create table if not exists public.research_sessions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  query text not null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

alter table public.research_sessions enable row level security;

drop policy if exists "Users can read own sessions" on public.research_sessions;
create policy "Users can read own sessions"
on public.research_sessions for select to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert own sessions" on public.research_sessions;
create policy "Users can insert own sessions"
on public.research_sessions for insert to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update own sessions" on public.research_sessions;
create policy "Users can update own sessions"
on public.research_sessions for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete own sessions" on public.research_sessions;
create policy "Users can delete own sessions"
on public.research_sessions for delete to authenticated
using ((select auth.uid()) = user_id);

create index if not exists idx_sessions_user on public.research_sessions(user_id);
create index if not exists idx_sessions_created_at on public.research_sessions(created_at);

-- ============================================================================
-- RESEARCH CONTEXTS
-- ============================================================================
create table if not exists public.research_contexts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  session_id uuid references public.research_sessions(id) on delete cascade,
  prompt text,
  context text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.research_contexts enable row level security;

drop policy if exists "Users can read own research_contexts" on public.research_contexts;
create policy "Users can read own research_contexts"
on public.research_contexts for select to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert own research_contexts" on public.research_contexts;
create policy "Users can insert own research_contexts"
on public.research_contexts for insert to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update own research_contexts" on public.research_contexts;
create policy "Users can update own research_contexts"
on public.research_contexts for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create index if not exists idx_research_contexts_user on public.research_contexts(user_id);
create index if not exists idx_research_contexts_session on public.research_contexts(session_id);
create index if not exists idx_research_contexts_updated_at on public.research_contexts(updated_at);

drop trigger if exists trg_research_contexts_updated_at on public.research_contexts;
create trigger trg_research_contexts_updated_at
before update on public.research_contexts
for each row execute function public.set_updated_at();

-- ============================================================================
-- RESEARCH BRANCHES
-- ============================================================================
create table if not exists public.research_branches (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  session_id uuid references public.research_sessions(id) on delete cascade,

  branch_id text not null,
  parent_node_id text,
  seed_type text not null check (seed_type in ('claim','document')),
  seed_text text not null,
  seed_url text,
  depth int not null default 1,
  breadth int not null default 6,

  context text not null default '',
  report text not null default '',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique(user_id, branch_id)
);

alter table public.research_branches enable row level security;

drop policy if exists "Users can read own research_branches" on public.research_branches;
create policy "Users can read own research_branches"
on public.research_branches for select to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert own research_branches" on public.research_branches;
create policy "Users can insert own research_branches"
on public.research_branches for insert to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update own research_branches" on public.research_branches;
create policy "Users can update own research_branches"
on public.research_branches for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create index if not exists idx_research_branches_user on public.research_branches(user_id);
create index if not exists idx_research_branches_session on public.research_branches(session_id);
create index if not exists idx_research_branches_branchid on public.research_branches(branch_id);
create index if not exists idx_research_branches_updated_at on public.research_branches(updated_at);

drop trigger if exists trg_research_branches_updated_at on public.research_branches;
create trigger trg_research_branches_updated_at
before update on public.research_branches
for each row execute function public.set_updated_at();

-- ============================================================================
-- RESEARCH JOBS
-- ============================================================================
create table if not exists public.research_jobs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  session_id uuid references public.research_sessions(id) on delete cascade,
  status text not null default 'queued' check (status in ('queued','running','succeeded','failed')),
  deep_mode boolean not null default false,
  breadth int not null default 3,
  input_text text not null,
  result jsonb not null default '{}'::jsonb,
  error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.research_jobs enable row level security;

drop policy if exists "Users can read own research_jobs" on public.research_jobs;
create policy "Users can read own research_jobs"
on public.research_jobs for select to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert own research_jobs" on public.research_jobs;
create policy "Users can insert own research_jobs"
on public.research_jobs for insert to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update own research_jobs" on public.research_jobs;
create policy "Users can update own research_jobs"
on public.research_jobs for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create index if not exists idx_research_jobs_user on public.research_jobs(user_id);
create index if not exists idx_research_jobs_status on public.research_jobs(status);
create index if not exists idx_research_jobs_created_at on public.research_jobs(created_at);

drop trigger if exists trg_research_jobs_updated_at on public.research_jobs;
create trigger trg_research_jobs_updated_at
before update on public.research_jobs
for each row execute function public.set_updated_at();

-- ============================================================================
-- UPDATE EVENTS
-- ============================================================================
create table if not exists public.update_events (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  document_id uuid references public.documents(id),
  event_type text not null,
  is_read boolean default false,
  created_at timestamptz default now()
);

alter table public.update_events enable row level security;

drop policy if exists "Users can view their own events" on public.update_events;
create policy "Users can view their own events"
on public.update_events for select to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert their own events" on public.update_events;
create policy "Users can insert their own events"
on public.update_events for insert to authenticated
with check ((select auth.uid()) = user_id);

create index if not exists idx_update_events_user on public.update_events(user_id);
create index if not exists idx_update_events_created_at on public.update_events(created_at);
