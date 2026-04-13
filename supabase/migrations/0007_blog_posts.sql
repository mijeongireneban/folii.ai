-- Blog posts: chat-driven writing that lives on the user's portfolio.
-- Each post belongs to a site and has a unique slug within that site.

create table public.blog_posts (
  id            uuid primary key default gen_random_uuid(),
  site_id       uuid not null references public.sites(id) on delete cascade,
  slug          citext not null,
  title         text not null,
  body          text not null default '',
  excerpt       text,
  tags          text[] not null default '{}',
  source        text not null default 'chat' check (source in ('chat', 'import', 'github')),
  status        text not null default 'draft' check (status in ('draft', 'published')),
  published_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (site_id, slug)
);

-- Listing query: "all published posts for this site, newest first"
create index blog_posts_site_status_published_idx
  on public.blog_posts (site_id, status, published_at desc);

-- Reuse the updated_at trigger function from 0001_init.sql
create trigger blog_posts_set_updated_at
  before update on public.blog_posts
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.blog_posts enable row level security;

-- Public can read published posts; owners can read all their own posts.
create policy blog_posts_select
  on public.blog_posts for select
  using (
    status = 'published'
    or auth.uid() = (select owner_id from public.sites where id = site_id)
  );

create policy blog_posts_insert
  on public.blog_posts for insert
  with check (
    auth.uid() = (select owner_id from public.sites where id = site_id)
  );

create policy blog_posts_update
  on public.blog_posts for update
  using (
    auth.uid() = (select owner_id from public.sites where id = site_id)
  );

create policy blog_posts_delete
  on public.blog_posts for delete
  using (
    auth.uid() = (select owner_id from public.sites where id = site_id)
  );
