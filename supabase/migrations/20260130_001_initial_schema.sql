-- Initial schema for Templify
-- Run with: supabase db push (local) or via Supabase dashboard SQL editor

-- Templates table
create table templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  original_docx text not null,  -- base64 encoded
  html_content text not null,
  schema jsonb not null default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Data sessions table
create table data_sessions (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references templates(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Data rows table
create table data_rows (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references data_sessions(id) on delete cascade,
  template_id uuid not null references templates(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  values jsonb not null default '{}',
  created_at timestamptz not null default now()
);

-- Indexes for common queries
create index templates_user_id_idx on templates(user_id);
create index data_sessions_template_id_idx on data_sessions(template_id);
create index data_sessions_user_id_idx on data_sessions(user_id);
create index data_rows_session_id_idx on data_rows(session_id);
create index data_rows_template_id_idx on data_rows(template_id);

-- Row Level Security (RLS)
alter table templates enable row level security;
alter table data_sessions enable row level security;
alter table data_rows enable row level security;

-- Policies: users can only access their own data
create policy "Users can view own templates"
  on templates for select using (auth.uid() = user_id);

create policy "Users can insert own templates"
  on templates for insert with check (auth.uid() = user_id);

create policy "Users can update own templates"
  on templates for update using (auth.uid() = user_id);

create policy "Users can delete own templates"
  on templates for delete using (auth.uid() = user_id);

create policy "Users can view own data_sessions"
  on data_sessions for select using (auth.uid() = user_id);

create policy "Users can insert own data_sessions"
  on data_sessions for insert with check (auth.uid() = user_id);

create policy "Users can update own data_sessions"
  on data_sessions for update using (auth.uid() = user_id);

create policy "Users can delete own data_sessions"
  on data_sessions for delete using (auth.uid() = user_id);

create policy "Users can view own data_rows"
  on data_rows for select using (auth.uid() = user_id);

create policy "Users can insert own data_rows"
  on data_rows for insert with check (auth.uid() = user_id);

create policy "Users can update own data_rows"
  on data_rows for update using (auth.uid() = user_id);

create policy "Users can delete own data_rows"
  on data_rows for delete using (auth.uid() = user_id);

-- Updated_at trigger function
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Apply updated_at triggers
create trigger templates_updated_at
  before update on templates
  for each row execute function update_updated_at();

create trigger data_sessions_updated_at
  before update on data_sessions
  for each row execute function update_updated_at();
