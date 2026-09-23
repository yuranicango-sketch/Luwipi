drop policy if exists student_groups_teacher_all on public.student_groups;
create policy student_groups_teacher_all on public.student_groups
for all to authenticated
using ((teacher_id=(select auth.uid())) and private.has_product_access())
with check ((teacher_id=(select auth.uid())) and private.has_product_access());

drop policy if exists student_group_members_teacher_select on public.student_group_members;
create policy student_group_members_teacher_select on public.student_group_members
for select to authenticated
using (exists (
  select 1 from public.student_groups g
  where g.id=student_group_members.group_id
    and g.teacher_id=(select auth.uid())
    and private.has_product_access()
));

drop policy if exists student_group_members_teacher_insert on public.student_group_members;
create policy student_group_members_teacher_insert on public.student_group_members
for insert to authenticated
with check (
  exists (
    select 1 from public.student_groups g
    where g.id=student_group_members.group_id
      and g.teacher_id=(select auth.uid())
      and private.has_product_access()
  )
  and exists (
    select 1 from public.students s
    where s.id=student_group_members.student_id
      and s.teacher_id=(select auth.uid())
  )
);

drop policy if exists student_group_members_teacher_delete on public.student_group_members;
create policy student_group_members_teacher_delete on public.student_group_members
for delete to authenticated
using (exists (
  select 1 from public.student_groups g
  where g.id=student_group_members.group_id
    and g.teacher_id=(select auth.uid())
    and private.has_product_access()
));