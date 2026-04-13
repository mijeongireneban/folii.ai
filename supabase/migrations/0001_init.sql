-- folii.ai v1 schema
-- Tables: profiles, sites
-- Apply via Supabase dashboard SQL editor or `supabase db push`.

create extension if not exists citext;

-- ---------------------------------------------------------------------------
-- profiles: one row per auth user, owns a unique username.
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  username    citext unique not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint  username_shape
    check (username ~ '^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$')
);

create index if not exists profiles_username_idx on public.profiles (username);

-- ---------------------------------------------------------------------------
-- sites: one row per portfolio. content is the Zod-validated JSON payload.
-- ---------------------------------------------------------------------------
create table if not exists public.sites (
  id            uuid primary key default gen_random_uuid(),
  owner_id      uuid not null references public.profiles(id) on delete cascade,
  template      text not null default 'swe',
  content       jsonb not null default '{}'::jsonb,
  published     boolean not null default false,
  published_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (owner_id)
);

create index if not exists sites_owner_idx on public.sites (owner_id);
create index if not exists sites_published_idx on public.sites (published) where published;

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists sites_set_updated_at on public.sites;
create trigger sites_set_updated_at
  before update on public.sites
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.sites    enable row level security;

-- profiles: anyone can read (needed for public /[username] pages),
-- owners can insert/update their own row, nobody can delete via anon.
drop policy if exists profiles_select_public on public.profiles;
create policy profiles_select_public
  on public.profiles for select
  using (true);

drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- sites: published sites are world-readable; owners always see their own row.
drop policy if exists sites_select_published_or_owner on public.sites;
create policy sites_select_published_or_owner
  on public.sites for select
  using (published = true or auth.uid() = owner_id);

drop policy if exists sites_insert_own on public.sites;
create policy sites_insert_own
  on public.sites for insert
  with check (auth.uid() = owner_id);

drop policy if exists sites_update_own on public.sites;
create policy sites_update_own
  on public.sites for update
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

drop policy if exists sites_delete_own on public.sites;
create policy sites_delete_own
  on public.sites for delete
  using (auth.uid() = owner_id);

-- ---------------------------------------------------------------------------
-- Auto-create a profile row when a user signs up.
-- Username is derived from the email local-part; collisions are resolved by
-- appending a short random suffix. Application code may later prompt the user
-- to change it.
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  base_name text;
  candidate text;
  suffix    text;
  tries     int := 0;
begin
  base_name := lower(split_part(split_part(new.email, '@', 1), '+', 1));
  base_name := regexp_replace(base_name, '[._]+', '-', 'g');
  base_name := regexp_replace(base_name, '[^a-z0-9-]+', '', 'g');
  base_name := regexp_replace(base_name, '-+', '-', 'g');
  base_name := regexp_replace(base_name, '^-+|-+$', '', 'g');
  if length(base_name) < 3 then
    base_name := base_name || substr(md5(random()::text), 1, 4);
  end if;
  base_name := left(base_name, 28);

  candidate := base_name;
  while exists (select 1 from public.profiles where username = candidate) loop
    tries := tries + 1;
    suffix := substr(md5(random()::text), 1, 4);
    candidate := left(base_name, 23) || '-' || suffix;
    if tries > 10 then
      exit;
    end if;
  end loop;

  insert into public.profiles (id, username) values (new.id, candidate);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
