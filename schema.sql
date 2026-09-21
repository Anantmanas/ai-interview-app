-- ==============================================================================
-- Schema for InterviewAI
-- Stack: Supabase (PostgreSQL) with Row Level Security (RLS)
-- ==============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Profiles Table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  target_role text,
  target_companies text[],
  experience_level text,
  resume_text text,
  resume_url text,
  plan text default 'free',
  daily_ai_calls integer default 0,
  last_call_reset timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Interviews Table
create table if not exists public.interviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  type text not null default 'technical',
  difficulty text not null default 'medium',
  target_role text,
  status text not null default 'in_progress',
  overall_score integer,
  duration_seconds integer,
  feedback_summary text,
  strengths text[],
  weaknesses jsonb,
  created_at timestamptz default now(),
  completed_at timestamptz
);

-- 3. Interview Questions Table
create table if not exists public.interview_questions (
  id uuid primary key default gen_random_uuid(),
  interview_id uuid not null references public.interviews(id) on delete cascade,
  question_text text not null,
  question_type text default 'technical',
  topic text,
  difficulty text default 'medium',
  user_answer text,
  ai_evaluation jsonb,
  time_taken_seconds integer default 0,
  sequence_order integer not null default 0,
  created_at timestamptz default now()
);

-- 4. User Weaknesses Table
create table if not exists public.user_weaknesses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  topic text not null,
  subtopic text,
  weakness_score integer not null default 50,
  occurrence_count integer not null default 1,
  improvement_trend integer default 0,
  last_tested_at timestamptz default now(),
  created_at timestamptz default now()
);

-- 5. Roadmap Items Table
create table if not exists public.roadmap_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  topic text not null,
  title text not null,
  description text,
  resources jsonb,
  priority integer default 1,
  estimated_hours numeric,
  status text default 'pending',
  created_at timestamptz default now()
);

-- 6. Resumes & Document Tables
create table if not exists public.resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  active_version_id uuid,
  status text not null default 'UPLOADING' check (status in ('UPLOADING', 'PARSING', 'READY', 'FAILED')),
  is_active boolean not null default true,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.resume_versions (
  id uuid primary key default gen_random_uuid(),
  resume_id uuid not null references public.resumes(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  file_url text not null,
  file_name text,
  file_size bigint,
  version_number integer not null,
  status text not null default 'UPLOADING' check (status in ('UPLOADING', 'PARSING', 'READY', 'FAILED')),
  error_message text,
  parsed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (resume_id, version_number)
);

create table if not exists public.parsed_resume_data (
  id uuid primary key default gen_random_uuid(),
  resume_version_id uuid not null unique references public.resume_versions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  raw_text text not null,
  structured_data jsonb not null,
  markdown text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.resumes
  add constraint resumes_active_version_id_fkey
  foreign key (active_version_id)
  references public.resume_versions(id)
  on delete set null;

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

alter table public.profiles enable row level security;
alter table public.interviews enable row level security;
alter table public.interview_questions enable row level security;
alter table public.user_weaknesses enable row level security;
alter table public.roadmap_items enable row level security;
alter table public.resumes enable row level security;
alter table public.resume_versions enable row level security;
alter table public.parsed_resume_data enable row level security;

-- Profiles: user owns row by id
create policy "Users can manage own profile"
  on public.profiles for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Interviews: user owns row by user_id
create policy "Users can manage own interviews"
  on public.interviews for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Interview Questions: user owns through interview relationship
create policy "Users can manage own interview questions"
  on public.interview_questions for all
  using (
    exists (
      select 1 from public.interviews
      where public.interviews.id = public.interview_questions.interview_id
        and public.interviews.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.interviews
      where public.interviews.id = public.interview_questions.interview_id
        and public.interviews.user_id = auth.uid()
    )
  );

-- User Weaknesses
create policy "Users can manage own weaknesses"
  on public.user_weaknesses for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Roadmap Items
create policy "Users can manage own roadmap items"
  on public.roadmap_items for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Resumes
create policy "Users can manage own resumes"
  on public.resumes for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can manage own resume versions"
  on public.resume_versions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can manage own parsed resume data"
  on public.parsed_resume_data for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ==============================================================================
-- AUTOMATIC PROFILE CREATION TRIGGER
-- Whenever a user signs up in auth.users, create their profile row
-- ==============================================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do update
  set
    email = excluded.email,
    full_name = coalesce(excluded.full_name, public.profiles.full_name);
  return new;
end;
$$;

-- Trigger on auth.users after insert
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
