-- Chat history for the editor.
-- Each assistant message stores the content snapshot it produced, so the
-- editor can implement "revert to here" by reapplying content_after.

create table if not exists public.chat_messages (
  id             uuid        primary key default gen_random_uuid(),
  site_id        uuid        not null references public.sites(id) on delete cascade,
  role           text        not null check (role in ('user', 'assistant', 'system')),
  content        text        not null,
  content_after  jsonb,
  created_at     timestamptz not null default now()
);

create index if not exists chat_messages_site_created_idx
  on public.chat_messages (site_id, created_at);

alter table public.chat_messages enable row level security;

-- Owners can read their own chat history.
drop policy if exists chat_messages_select_own on public.chat_messages;
create policy chat_messages_select_own
  on public.chat_messages for select
  using (
    exists (
      select 1 from public.sites s
      where s.id = chat_messages.site_id and s.owner_id = auth.uid()
    )
  );

-- Owners can insert messages into their own site's thread.
drop policy if exists chat_messages_insert_own on public.chat_messages;
create policy chat_messages_insert_own
  on public.chat_messages for insert
  with check (
    exists (
      select 1 from public.sites s
      where s.id = chat_messages.site_id and s.owner_id = auth.uid()
    )
  );

-- Owners can delete (for "clear history" later).
drop policy if exists chat_messages_delete_own on public.chat_messages;
create policy chat_messages_delete_own
  on public.chat_messages for delete
  using (
    exists (
      select 1 from public.sites s
      where s.id = chat_messages.site_id and s.owner_id = auth.uid()
    )
  );
