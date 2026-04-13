-- Postgres-based rate limiting (fixed window).
-- Keeps v1 free of Redis/Upstash. Good enough up to low-thousands of req/s.
--
-- Usage (from server code via service-role client):
--   select check_rate_limit('chat:<user_id>', 20, 60);  -- 20 per minute
-- Returns true if the request is allowed, false if the caller should 429.

create table if not exists public.rate_limits (
  key           text        primary key,
  count         integer     not null default 0,
  window_start  timestamptz not null default now()
);

-- Not exposed to clients — only the service-role admin client calls it.
alter table public.rate_limits enable row level security;

create or replace function public.check_rate_limit(
  p_key            text,
  p_max            integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count         integer;
  v_window_start  timestamptz;
  v_now           timestamptz := now();
begin
  -- Upsert-and-read in one shot.
  insert into public.rate_limits (key, count, window_start)
  values (p_key, 1, v_now)
  on conflict (key) do update
    set
      count = case
        when public.rate_limits.window_start < v_now - (p_window_seconds || ' seconds')::interval
          then 1
        else public.rate_limits.count + 1
      end,
      window_start = case
        when public.rate_limits.window_start < v_now - (p_window_seconds || ' seconds')::interval
          then v_now
        else public.rate_limits.window_start
      end
  returning count, window_start into v_count, v_window_start;

  return v_count <= p_max;
end;
$$;

-- Periodic cleanup: call this from a cron job later if the table grows.
create or replace function public.prune_rate_limits(p_older_than_seconds integer default 3600)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_deleted integer;
begin
  delete from public.rate_limits
  where window_start < now() - (p_older_than_seconds || ' seconds')::interval;
  get diagnostics v_deleted = row_count;
  return v_deleted;
end;
$$;
