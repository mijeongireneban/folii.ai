-- Extended rate-limit check that returns the current count alongside the
-- boolean allow/deny. The original check_rate_limit is kept for backward
-- compat; this one is used by the daily-cap flow so the API can report
-- "remaining" to the client.

create or replace function public.check_rate_limit_ex(
  p_key            text,
  p_max            integer,
  p_window_seconds integer
)
returns table(allowed boolean, current_count integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count         integer;
  v_now           timestamptz := now();
begin
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
  returning count into v_count;

  allowed := v_count <= p_max;
  current_count := v_count;
  return next;
end;
$$;
