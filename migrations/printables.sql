create table public.printables (
 id uuid primary key default gen_random_uuid(),
 title text not null check (length(title) between 1 and 160),
 description text not null default '' check (length(description)<=600),
 files jsonb not null check (jsonb_typeof(files)='array' and jsonb_array_length(files) between 1 and 20),
 created_by uuid not null references auth.users(id),
 created_at timestamptz not null default now()
);
alter table public.printables enable row level security;
grant select, insert, delete on public.printables to authenticated;
create policy "printables_read" on public.printables for select to authenticated using (
 exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.role='admin') or
 exists(select 1 from public.product_entitlements e where e.user_id=(select auth.uid()) and e.product in ('aprenda','ensine') and (
 (e.status='active' and (e.access_until is null or e.access_until>now())) or
 (e.status='trial' and e.trial_ends_at>now() and (e.access_until is null or e.access_until>now()))
 ))
);
create policy "printables_admin_insert" on public.printables for insert to authenticated with check (
 created_by=(select auth.uid()) and exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.role='admin')
);
create policy "printables_admin_delete" on public.printables for delete to authenticated using (
 exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.role='admin')
);
update storage.buckets set public=false,file_size_limit=31457280,allowed_mime_types=array['application/pdf','application/zip','application/x-zip-compressed'] where id='printables';
drop policy if exists "Public read printables" on storage.objects;
create policy "printables_files_read" on storage.objects for select to authenticated using (
 bucket_id='printables' and (
 exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.role='admin') or
 exists(select 1 from public.product_entitlements e where e.user_id=(select auth.uid()) and e.product in ('aprenda','ensine') and (
 (e.status='active' and (e.access_until is null or e.access_until>now())) or
 (e.status='trial' and e.trial_ends_at>now() and (e.access_until is null or e.access_until>now()))
 )))
);
create policy "printables_files_admin_insert" on storage.objects for insert to authenticated with check (
 bucket_id='printables' and exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.role='admin')
);
create policy "printables_files_admin_delete" on storage.objects for delete to authenticated using (
 bucket_id='printables' and exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.role='admin')
);
