-- ============================================================================
-- Admin paneli: herkese açık görsel deposu
-- Dashboard → SQL Editor üzerinden bir kez çalıştırın.
-- ============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media',
  'media',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "media_public_read" on storage.objects;
drop policy if exists "media_authenticated_insert" on storage.objects;
drop policy if exists "media_authenticated_update" on storage.objects;
drop policy if exists "media_authenticated_delete" on storage.objects;

create policy "media_public_read"
  on storage.objects for select
  using (bucket_id = 'media');

create policy "media_authenticated_insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'media');

create policy "media_authenticated_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'media')
  with check (bucket_id = 'media');

create policy "media_authenticated_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'media');
