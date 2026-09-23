create table if not exists public.learning_progress (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  age_group text not null check (age_group in ('2-4','5-8','adult')),
  lesson_number integer not null check (lesson_number between 1 and 48),
  step integer not null default 0 check (step >= 0),
  action integer not null default 0 check (action >= 0),
  completed boolean not null default false,
  mastery text check (mastery is null or mastery in ('mastered','reinforce')),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  unique(student_id, age_group, lesson_number)
);

create table if not exists public.learning_sessions (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  age_group text not null check (age_group in ('2-4','5-8','adult')),
  session_type text not null check (session_type in ('lesson','song','game','workout')),
  lesson_number integer check (lesson_number is null or lesson_number between 1 and 48),
  content_id text,
  source text check (source is null or source in ('screen','midi','microphone','mixed')),
  hand_mode text check (hand_mode is null or hand_mode in ('right','left','both')),
  attempts integer not null default 0 check (attempts >= 0),
  correct integer not null default 0 check (correct >= 0),
  mistakes integer not null default 0 check (mistakes >= 0),
  accuracy integer check (accuracy is null or accuracy between 0 and 100),
  stars integer check (stars is null or stars between 1 and 3),
  duration_seconds integer not null default 0 check (duration_seconds >= 0),
  metadata jsonb not null default '{}'::jsonb,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.student_competency_metrics (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  age_group text not null check (age_group in ('2-4','5-8','adult')),
  competency text not null check (competency in ('ouvido','ritmo','teclado','tecnica','leitura','criatividade','repertorio','harmonia','coordenacao','expressao')),
  evidence_count integer not null default 0 check (evidence_count >= 0),
  successes integer not null default 0 check (successes >= 0),
  mistakes integer not null default 0 check (mistakes >= 0),
  mastery_score numeric(5,4) not null default 0.5 check (mastery_score between 0 and 1),
  last_accuracy integer check (last_accuracy is null or last_accuracy between 0 and 100),
  last_content_id text,
  updated_at timestamptz not null default now(),
  unique(student_id, age_group, competency)
);

create index if not exists learning_progress_teacher_student_idx on public.learning_progress(teacher_id, student_id, updated_at desc);
create index if not exists learning_sessions_teacher_student_idx on public.learning_sessions(teacher_id, student_id, created_at desc);
create index if not exists learning_sessions_content_idx on public.learning_sessions(student_id, session_type, content_id, created_at desc);
create index if not exists student_competency_metrics_teacher_student_idx on public.student_competency_metrics(teacher_id, student_id, updated_at desc);

alter table public.learning_progress enable row level security;
alter table public.learning_sessions enable row level security;
alter table public.student_competency_metrics enable row level security;

grant select, insert, update, delete on public.learning_progress to authenticated;
grant select, insert on public.learning_sessions to authenticated;
grant select, insert, update on public.student_competency_metrics to authenticated;

drop policy if exists learning_progress_teacher_select on public.learning_progress;
create policy learning_progress_teacher_select on public.learning_progress for select to authenticated
using (teacher_id=(select auth.uid()) and private.has_product_access() and exists(select 1 from public.students s where s.id=student_id and s.teacher_id=(select auth.uid())));
drop policy if exists learning_progress_teacher_insert on public.learning_progress;
create policy learning_progress_teacher_insert on public.learning_progress for insert to authenticated
with check (teacher_id=(select auth.uid()) and private.has_product_access() and exists(select 1 from public.students s where s.id=student_id and s.teacher_id=(select auth.uid())));
drop policy if exists learning_progress_teacher_update on public.learning_progress;
create policy learning_progress_teacher_update on public.learning_progress for update to authenticated
using (teacher_id=(select auth.uid()) and private.has_product_access() and exists(select 1 from public.students s where s.id=student_id and s.teacher_id=(select auth.uid())))
with check (teacher_id=(select auth.uid()) and private.has_product_access() and exists(select 1 from public.students s where s.id=student_id and s.teacher_id=(select auth.uid())));
drop policy if exists learning_progress_teacher_delete on public.learning_progress;
create policy learning_progress_teacher_delete on public.learning_progress for delete to authenticated
using (teacher_id=(select auth.uid()) and private.has_product_access() and exists(select 1 from public.students s where s.id=student_id and s.teacher_id=(select auth.uid())));

drop policy if exists learning_sessions_teacher_select on public.learning_sessions;
create policy learning_sessions_teacher_select on public.learning_sessions for select to authenticated
using (teacher_id=(select auth.uid()) and private.has_product_access() and exists(select 1 from public.students s where s.id=student_id and s.teacher_id=(select auth.uid())));
drop policy if exists learning_sessions_teacher_insert on public.learning_sessions;
create policy learning_sessions_teacher_insert on public.learning_sessions for insert to authenticated
with check (teacher_id=(select auth.uid()) and private.has_product_access() and exists(select 1 from public.students s where s.id=student_id and s.teacher_id=(select auth.uid())));

drop policy if exists competency_metrics_teacher_select on public.student_competency_metrics;
create policy competency_metrics_teacher_select on public.student_competency_metrics for select to authenticated
using (teacher_id=(select auth.uid()) and private.has_product_access() and exists(select 1 from public.students s where s.id=student_id and s.teacher_id=(select auth.uid())));
drop policy if exists competency_metrics_teacher_insert on public.student_competency_metrics;
create policy competency_metrics_teacher_insert on public.student_competency_metrics for insert to authenticated
with check (teacher_id=(select auth.uid()) and private.has_product_access() and exists(select 1 from public.students s where s.id=student_id and s.teacher_id=(select auth.uid())));
drop policy if exists competency_metrics_teacher_update on public.student_competency_metrics;
create policy competency_metrics_teacher_update on public.student_competency_metrics for update to authenticated
using (teacher_id=(select auth.uid()) and private.has_product_access() and exists(select 1 from public.students s where s.id=student_id and s.teacher_id=(select auth.uid())))
with check (teacher_id=(select auth.uid()) and private.has_product_access() and exists(select 1 from public.students s where s.id=student_id and s.teacher_id=(select auth.uid())));
