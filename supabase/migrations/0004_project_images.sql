-- Storage bucket for project screenshots. Public read (so /username page
-- serves without signed URLs), authenticated write scoped to the user's
-- own folder: project-images/<auth.uid>/<file>.

insert into storage.buckets (id, name, public)
values ('project-images', 'project-images', true)
on conflict (id) do nothing;

-- Authenticated users can upload to their own folder.
create policy "project-images: owner insert"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'project-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Authenticated users can overwrite/delete their own files.
create policy "project-images: owner update"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'project-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "project-images: owner delete"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'project-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Public read so published portfolios can embed screenshots directly.
create policy "project-images: public read"
  on storage.objects for select to public
  using (bucket_id = 'project-images');
