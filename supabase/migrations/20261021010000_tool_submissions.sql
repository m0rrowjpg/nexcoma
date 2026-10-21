create table if not exists public.tool_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  url text not null check (url ~ '^https://'),
  category text not null check (char_length(category) between 1 and 80),
  pricing_model text not null check (pricing_model in ('Free', 'Freemium', 'Paid', 'Open Source')),
  tagline text not null check (char_length(tagline) between 1 and 500),
  submitter_email text check (submitter_email is null or char_length(submitter_email) <= 254),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  tool_id uuid references public.content_items(id) on delete set null,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create index if not exists tool_submissions_status_created_idx
  on public.tool_submissions (status, created_at desc);

alter table public.tool_submissions enable row level security;
grant insert on public.tool_submissions to anon, authenticated;
grant select, update, delete on public.tool_submissions to authenticated;

create policy "Anyone can submit a tool for review"
  on public.tool_submissions for insert to anon, authenticated
  with check (status = 'pending' and tool_id is null and reviewed_at is null);

create policy "Administrators can read submissions"
  on public.tool_submissions for select to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Administrators can update submissions"
  on public.tool_submissions for update to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Administrators can delete submissions"
  on public.tool_submissions for delete to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'tool_submissions'
  ) then
    alter publication supabase_realtime add table public.tool_submissions;
  end if;
end;
$$;

create or replace function public.approve_tool_submission(p_submission_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  submission public.tool_submissions%rowtype;
  new_tool_id uuid;
  tool_slug text;
  tool_data jsonb;
begin
  if (auth.jwt() -> 'app_metadata' ->> 'role') is distinct from 'admin' then
    raise exception 'Administrator role required';
  end if;

  select * into submission
  from public.tool_submissions
  where id = p_submission_id
  for update;

  if not found then
    raise exception 'Tool submission not found';
  end if;
  if submission.status <> 'pending' then
    raise exception 'Only pending submissions can be approved';
  end if;
  if not exists (
    select 1 from public.content_items
    where content_type = 'category' and data ->> 'id' = submission.category
  ) then
    raise exception 'The submitted category is no longer available';
  end if;

  tool_slug := trim(both '-' from regexp_replace(lower(submission.name), '[^a-z0-9]+', '-', 'g'));
  if tool_slug = '' then
    tool_slug := 'tool';
  end if;
  if exists (select 1 from public.content_items where slug = tool_slug) then
    tool_slug := tool_slug || '-' || left(replace(submission.id::text, '-', ''), 8);
  end if;

  tool_data := jsonb_build_object(
    'id', tool_slug,
    'name', submission.name,
    'slug', tool_slug,
    'tagline', submission.tagline,
    'description', submission.tagline,
    'category', submission.category,
    'pricingModel', submission.pricing_model,
    'startingPrice', case when submission.pricing_model in ('Free', 'Open Source') then 'Free' else 'See website' end,
    'officialUrl', submission.url,
    'featured', false,
    'curatedRank', coalesce((select max((data ->> 'curatedRank')::integer) from public.content_items where content_type = 'tool'), 0) + 1,
    'addedYear', extract(year from now())::integer,
    'keyFeatures', '[]'::jsonb,
    'pros', '[]'::jsonb,
    'cons', '[]'::jsonb,
    'bestFor', submission.tagline,
    'platforms', '[]'::jsonb,
    'pricingTiers', '[]'::jsonb,
    'specs', jsonb_build_object(
      'apiAvailable', false,
      'selfHostable', false,
      'privacyNoTraining', false,
      'primaryInterface', '',
      'primaryLanguageSupport', ''
    ),
    'iconBg', 'bg-violet-100 text-violet-700'
  );

  insert into public.content_items (content_type, slug, title, status, data, seo_title, seo_description)
  values (
    'tool',
    tool_slug,
    submission.name,
    'draft',
    tool_data,
    submission.name || ' review, pricing & features | Nexcoma',
    submission.tagline
  )
  returning id into new_tool_id;

  update public.tool_submissions
  set status = 'approved', tool_id = new_tool_id, reviewed_at = now()
  where id = p_submission_id;

  return new_tool_id;
end;
$$;

revoke all on function public.approve_tool_submission(uuid) from public, anon;
grant execute on function public.approve_tool_submission(uuid) to authenticated;
