create extension if not exists "pgcrypto";

create table public.portfolios (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  username text unique,
  content jsonb not null default '{}'::jsonb,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index portfolios_username_idx on public.portfolios (username) where username is not null;
create index portfolios_published_idx on public.portfolios (published) where published = true;

create table public.assets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  url text not null,
  kind text not null check (kind in ('upload', 'external')),
  created_at timestamptz not null default now()
);

create index assets_user_idx on public.assets (user_id);

create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  portfolio_id uuid not null references public.portfolios(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

create index chat_messages_portfolio_idx on public.chat_messages (portfolio_id, created_at);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

create trigger portfolios_updated_at
before update on public.portfolios
for each row execute function public.set_updated_at();
