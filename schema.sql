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

-- ============================================================================
-- ONTOLOGY SYSTEM (Concepts, Entities, Taggings)
-- ============================================================================

-- A) Concepts (Hierarchical Taxonomy)
create table if not exists public.concepts (
  id uuid primary key default uuid_generate_v4(),
  scheme text not null default 'general',
  label text not null,
  description text,
  parent_id uuid references public.concepts(id),
  synonyms text[] default '{}',
  external_id text,
  created_at timestamptz default now()
);

-- Constraint to allow unique upsert by label+scheme
alter table public.concepts drop constraint if exists unique_concept_label_scheme;
alter table public.concepts add constraint unique_concept_label_scheme unique (label, scheme);

-- B) Entities (Resolved Real-World Objects)
create table if not exists public.entities (
  id uuid primary key default uuid_generate_v4(),
  type text not null,
  name text not null,
  aliases text[] default '{}',
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- Constraint to allow unique upsert by name+type
alter table public.entities drop constraint if exists unique_entity_name_type;
alter table public.entities add constraint unique_entity_name_type unique (name, type);

-- C) Taggings (Polymorphic Link)
create table if not exists public.taggings (
  id uuid primary key default uuid_generate_v4(),
  target_id uuid not null, -- The research_job.id
  target_type text not null, -- 'job', 'doc', 'session'
  concept_id uuid references public.concepts(id),
  entity_id uuid references public.entities(id),
  confidence float default 1.0,
  source text default 'manual',
  evidence jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  constraint tag_target_check check (
    (concept_id is not null and entity_id is null) or 
    (concept_id is null and entity_id is not null)
  )
);

-- RLS & Policies
alter table public.concepts enable row level security;
alter table public.entities enable row level security;
alter table public.taggings enable row level security;

create policy "Public read concepts" on public.concepts for select using (true);
create policy "Auth insert concepts" on public.concepts for insert to authenticated with check (true);

create policy "Public read entities" on public.entities for select using (true);
create policy "Auth insert entities" on public.entities for insert to authenticated with check (true);

create policy "Public read taggings" on public.taggings for select using (true);
create policy "Auth insert taggings" on public.taggings for insert to authenticated with check (true);

-- Indexes
create index if not exists idx_concepts_scheme on public.concepts(scheme);
create index if not exists idx_entities_type on public.entities(type);
create index if not exists idx_taggings_target on public.taggings(target_id, target_type);
