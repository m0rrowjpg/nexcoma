create table if not exists public.content_items (
  id uuid primary key default gen_random_uuid(),
  content_type text not null check (content_type in ('tool', 'category', 'article', 'affiliate', 'media')),
  slug text not null unique,
  title text not null,
  status text not null default 'draft' check (status in ('draft', 'published')),
  data jsonb not null default '{}'::jsonb,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists content_items_type_status_idx
  on public.content_items (content_type, status);

create or replace function public.set_content_items_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger content_items_updated_at
  before update on public.content_items
  for each row execute function public.set_content_items_updated_at();

alter table public.content_items enable row level security;
grant select on public.content_items to anon, authenticated;
grant insert, update, delete on public.content_items to authenticated;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'content_items'
  ) then
    alter publication supabase_realtime add table public.content_items;
  end if;
end;
$$;

create policy "Published content is publicly readable"
  on public.content_items for select
  using (status = 'published');

create policy "Administrators can read all content"
  on public.content_items for select to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Administrators can insert content"
  on public.content_items for insert to authenticated
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Administrators can update content"
  on public.content_items for update to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Administrators can delete content"
  on public.content_items for delete to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'nexcoma-media',
  'nexcoma-media',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Media is publicly readable"
  on storage.objects for select
  using (bucket_id = 'nexcoma-media');

create policy "Administrators can upload media"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'nexcoma-media'
    and (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

create policy "Administrators can update media"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'nexcoma-media'
    and (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  )
  with check (
    bucket_id = 'nexcoma-media'
    and (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

create policy "Administrators can delete media"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'nexcoma-media'
    and (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );
