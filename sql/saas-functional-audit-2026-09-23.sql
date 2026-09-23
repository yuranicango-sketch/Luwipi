-- Luwipi functional audit fixes (2026-09-23)
-- Mirrors the live Supabase migrations applied during the SaaS repair.

-- The UI supports adult students, so keep the database constraint aligned.
alter table public.students
  drop constraint if exists students_age_group_check;

alter table public.students
  add constraint students_age_group_check
  check (age_group = any (array['2-4'::text, '5-8'::text, 'adult'::text]));

-- Pedagogical image review must still work when the server service key is
-- unavailable. Admin users can persist decisions through their authenticated
-- session while normal authenticated users remain read-only.
grant select, insert, update on table public.pedagogy_assets to authenticated;

drop policy if exists "admins can insert pedagogy assets" on public.pedagogy_assets;
create policy "admins can insert pedagogy assets"
on public.pedagogy_assets
for insert
to authenticated
with check (
  exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.role = 'admin'
  )
);

drop policy if exists "admins can update pedagogy assets" on public.pedagogy_assets;
create policy "admins can update pedagogy assets"
on public.pedagogy_assets
for update
to authenticated
using (
  exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.role = 'admin'
  )
)
with check (
  exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.role = 'admin'
  )
);
