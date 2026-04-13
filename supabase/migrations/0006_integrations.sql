-- integrations: stores OAuth tokens for external services (GitHub, etc.)
-- One row per user per provider. Access tokens are stored server-side only,
-- never exposed to the client via RLS.

create table if not exists public.integrations (
  id                uuid primary key default gen_random_uuid(),
  owner_id          uuid not null references public.profiles(id) on delete cascade,
  provider          text not null,           -- 'github', 'linkedin', etc.
  access_token      text not null,
  provider_user_id  text,                    -- e.g. GitHub user ID
  provider_username text,                    -- e.g. GitHub login
  provider_avatar   text,                    -- profile picture URL
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (owner_id, provider)
);

create index if not exists integrations_owner_idx on public.integrations (owner_id);

-- updated_at trigger
drop trigger if exists integrations_set_updated_at on public.integrations;
create trigger integrations_set_updated_at
  before update on public.integrations
  for each row execute function public.set_updated_at();

-- RLS: integrations are private. Only the admin/service-role client touches
-- this table. No client-side reads or writes.
alter table public.integrations enable row level security;

-- Owner can read their own integrations (for checking connection status).
drop policy if exists integrations_select_own on public.integrations;
create policy integrations_select_own
  on public.integrations for select
  using (auth.uid() = owner_id);

-- All writes go through the service-role client (admin), so no insert/update/delete
-- policies for authenticated users. The admin client bypasses RLS.
