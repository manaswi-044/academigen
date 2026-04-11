-- AcademiGen Database Schema
-- Run this in the Supabase SQL Editor

-- 1. Enable UUID Extension
create extension if not exists "uuid-ossp";

-- 2. Profiles Table (Extends Supabase Auth)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  college text,
  department text,
  subject text,
  language text default 'Python',
  roll_number text,
  academic_year text,
  template_choice text default 'default',
  created_at timestamptz default now()
);

-- 3. Templates Table (Lab Record Formats)
create table public.templates (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  subject text,
  file_url text,
  parsed_structure jsonb,
  is_default boolean default false,
  created_at timestamptz default now()
);

-- 4. Documents Table (The Lab Records)
create table public.documents (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  subject text,
  language text default 'Python',
  ex_number integer,
  experiment_date date,
  template_id uuid references public.templates(id),
  content_json jsonb default '{}',
  status text default 'draft',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 5. Document Versions (Max 5 history)
create table public.document_versions (
  id uuid default uuid_generate_v4() primary key,
  document_id uuid references public.documents(id) on delete cascade,
  content_json jsonb not null,
  named_tag text,
  created_at timestamptz default now()
);

-- 6. Code Executions (Output & Screenshots)
create table public.code_executions (
  id uuid default uuid_generate_v4() primary key,
  document_id uuid references public.documents(id) on delete cascade,
  code_snippet text,
  language text,
  output_text text,
  screenshot_url text,
  executed_at timestamptz default now()
);

-- 7. SET UP ROW LEVEL SECURITY (RLS)
alter table public.profiles enable row level security;
alter table public.documents enable row level security;
alter table public.document_versions enable row level security;
alter table public.code_executions enable row level security;

-- Policies for Profiles
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Policies for Documents
create policy "Users can manage their own documents"
  on public.documents for all
  using (auth.uid() = user_id);

-- Policies for Versions
create policy "Users can view versions of their own documents"
  on public.document_versions for select
  using (document_id in (
    select id from public.documents where user_id = auth.uid()
  ));

create policy "Users can insert versions of their own documents"
  on public.document_versions for insert
  with check (document_id in (
    select id from public.documents where user_id = auth.uid()
  ));

-- Policies for Code Executions
create policy "Users can manage their own executions"
  on public.code_executions for all
  using (document_id in (
    select id from public.documents where user_id = auth.uid()
  ));

-- 8. TRIGGERS & FUNCTIONS

-- A. Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- B. Auto-update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at
  before update on public.documents
  for each row execute procedure update_updated_at_column();
