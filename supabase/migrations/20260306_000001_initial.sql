-- Initial schema for a single-customer Templify workspace.
-- Authentication is handled by Supabase Auth with fixed users only.
-- Public signup should be disabled in the Supabase dashboard.

create extension if not exists pgcrypto;

create table if not exists public.user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin', 'member')),
  created_at timestamptz not null default now()
);

create table if not exists public.templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  original_docx text not null default '',
  docx_path text,
  html_content text not null,
  schema jsonb not null default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.data_sessions (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.templates(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.data_rows (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.data_sessions(id) on delete cascade,
  template_id uuid not null references public.templates(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  values jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists templates_created_at_idx on public.templates(created_at desc);
create index if not exists data_sessions_template_id_idx on public.data_sessions(template_id);
create index if not exists data_rows_session_id_idx on public.data_rows(session_id);

create or replace function public.update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists templates_updated_at on public.templates;
create trigger templates_updated_at
  before update on public.templates
  for each row execute function public.update_updated_at();

drop trigger if exists data_sessions_updated_at on public.data_sessions;
create trigger data_sessions_updated_at
  before update on public.data_sessions
  for each row execute function public.update_updated_at();

insert into storage.buckets (id, name, public)
values ('templates-docx', 'templates-docx', false)
on conflict (id) do nothing;

alter table public.user_roles enable row level security;
alter table public.templates enable row level security;
alter table public.data_sessions enable row level security;
alter table public.data_rows enable row level security;

create or replace function public.has_role(required_role text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = auth.uid()
      and role = required_role
  );
$$;

drop policy if exists "Users can read own role" on public.user_roles;
drop policy if exists "Admins can read all roles" on public.user_roles;
create policy "Users can read own role"
  on public.user_roles for select
  using (auth.uid() = user_id);
create policy "Admins can read all roles"
  on public.user_roles for select
  using (public.has_role('admin'));

drop policy if exists "Authenticated users can view templates" on public.templates;
drop policy if exists "Admins can insert templates" on public.templates;
drop policy if exists "Admins can update templates" on public.templates;
drop policy if exists "Admins can delete templates" on public.templates;
create policy "Authenticated users can view templates"
  on public.templates for select
  using (auth.role() = 'authenticated');
create policy "Admins can insert templates"
  on public.templates for insert
  with check (
    auth.role() = 'authenticated'
    and public.has_role('admin')
    and auth.uid() = user_id
  );
create policy "Admins can update templates"
  on public.templates for update
  using (public.has_role('admin'));
create policy "Admins can delete templates"
  on public.templates for delete
  using (public.has_role('admin'));

drop policy if exists "Authenticated users can view sessions" on public.data_sessions;
drop policy if exists "Authenticated users can insert sessions" on public.data_sessions;
drop policy if exists "Authenticated users can update sessions" on public.data_sessions;
drop policy if exists "Authenticated users can delete sessions" on public.data_sessions;
create policy "Authenticated users can view sessions"
  on public.data_sessions for select
  using (auth.role() = 'authenticated');
create policy "Authenticated users can insert sessions"
  on public.data_sessions for insert
  with check (
    auth.role() = 'authenticated'
    and auth.uid() = user_id
  );
create policy "Authenticated users can update sessions"
  on public.data_sessions for update
  using (auth.role() = 'authenticated');
create policy "Authenticated users can delete sessions"
  on public.data_sessions for delete
  using (auth.role() = 'authenticated');

drop policy if exists "Authenticated users can view rows" on public.data_rows;
drop policy if exists "Authenticated users can insert rows" on public.data_rows;
drop policy if exists "Authenticated users can update rows" on public.data_rows;
drop policy if exists "Authenticated users can delete rows" on public.data_rows;
create policy "Authenticated users can view rows"
  on public.data_rows for select
  using (auth.role() = 'authenticated');
create policy "Authenticated users can insert rows"
  on public.data_rows for insert
  with check (
    auth.role() = 'authenticated'
    and auth.uid() = user_id
  );
create policy "Authenticated users can update rows"
  on public.data_rows for update
  using (auth.role() = 'authenticated');
create policy "Authenticated users can delete rows"
  on public.data_rows for delete
  using (auth.role() = 'authenticated');

drop policy if exists "Authenticated users can view shared templates" on storage.objects;
drop policy if exists "Admins can upload shared templates" on storage.objects;
drop policy if exists "Admins can update shared templates" on storage.objects;
drop policy if exists "Admins can delete shared templates" on storage.objects;
create policy "Authenticated users can view shared templates"
  on storage.objects for select
  using (
    bucket_id = 'templates-docx'
    and auth.role() = 'authenticated'
  );
create policy "Admins can upload shared templates"
  on storage.objects for insert
  with check (
    bucket_id = 'templates-docx'
    and public.has_role('admin')
  );
create policy "Admins can update shared templates"
  on storage.objects for update
  using (
    bucket_id = 'templates-docx'
    and public.has_role('admin')
  );
create policy "Admins can delete shared templates"
  on storage.objects for delete
  using (
    bucket_id = 'templates-docx'
    and public.has_role('admin')
  );
