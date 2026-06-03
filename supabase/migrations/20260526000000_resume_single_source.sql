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

create unique index if not exists resumes_one_active_per_user
  on public.resumes(user_id)
  where is_active;

alter table public.resumes enable row level security;
alter table public.resume_versions enable row level security;
alter table public.parsed_resume_data enable row level security;

create policy "Users can manage own resumes"
  on public.resumes
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can manage own resume versions"
  on public.resume_versions
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can manage own parsed resume data"
  on public.parsed_resume_data
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

