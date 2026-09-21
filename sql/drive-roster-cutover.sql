-- Apply only together with the Drive roster code.
alter table public.profiles add column if not exists google_drive_refresh_token_enc text;
alter table public.profiles add column if not exists google_drive_connected_at timestamptz;
-- Student/group tables are intentionally retained during the cutover so existing homework FKs do not break.
-- After every teacher has migrated, remove student_id/group_id dependencies from homework_assignments,
-- export any remaining roster data to each teacher's Drive, then drop students/student_groups/student_group_members.
