alter table public.portfolios enable row level security;
alter table public.assets enable row level security;
alter table public.chat_messages enable row level security;

-- portfolios: owner can read/write own row
create policy portfolios_owner_select on public.portfolios
  for select using (user_id = auth.uid());
create policy portfolios_owner_insert on public.portfolios
  for insert with check (user_id = auth.uid());
create policy portfolios_owner_update on public.portfolios
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

-- portfolios: anyone can read published rows
create policy portfolios_public_read on public.portfolios
  for select using (published = true);

-- assets: owner only
create policy assets_owner_all on public.assets
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- chat_messages: only the portfolio owner
create policy chat_messages_owner_all on public.chat_messages
  for all using (
    exists (
      select 1 from public.portfolios p
      where p.id = chat_messages.portfolio_id and p.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.portfolios p
      where p.id = chat_messages.portfolio_id and p.user_id = auth.uid()
    )
  );
