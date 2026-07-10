-- Practice activities for course lessons (mirrors salon_actividades but scoped per
-- leccion_id, and practice-only: no persisted grading/teacher review workflow).

create table public.curso_actividades (
  id uuid primary key default gen_random_uuid(),
  leccion_id uuid not null references public.lecciones(id) on delete cascade,
  titulo text not null,
  instrucciones text,
  tipo public.activity_type not null,
  contenido jsonb not null default '{}'::jsonb,
  activo boolean not null default true,
  order_index integer not null default 0,
  fecha_creacion timestamptz not null default now()
);

alter table public.curso_actividades enable row level security;

create policy "Admin gestiona curso_actividades"
on public.curso_actividades for all to authenticated
using (has_role(auth.uid(), 'admin'::app_role) or has_role(auth.uid(), 'content_admin'::app_role))
with check (has_role(auth.uid(), 'admin'::app_role) or has_role(auth.uid(), 'content_admin'::app_role));

create policy "Estudiantes matriculados ven curso_actividades"
on public.curso_actividades for select to authenticated
using (
  activo = true
  and exists (
    select 1 from public.lecciones l
    where l.id = curso_actividades.leccion_id
      and (has_role(auth.uid(), 'admin'::app_role) or has_active_enrollment(auth.uid(), l.curso_id))
  )
);

-- Per-student practice tracking: just "did I practice this", plus the last
-- correctas/total shown to the student for their own reference. No score,
-- comentario_docente, or grading workflow — this is practice, not a submission.
create table public.curso_actividad_progreso (
  id uuid primary key default gen_random_uuid(),
  actividad_id uuid not null references public.curso_actividades(id) on delete cascade,
  usuario_id uuid not null references public.usuarios(id) on delete cascade,
  completado boolean not null default true,
  respuestas jsonb not null default '{}'::jsonb,
  correctas integer,
  total integer,
  fecha_completado timestamptz not null default now(),
  unique (actividad_id, usuario_id)
);

alter table public.curso_actividad_progreso enable row level security;

create policy "Admin gestiona curso_actividad_progreso"
on public.curso_actividad_progreso for all to authenticated
using (has_role(auth.uid(), 'admin'::app_role) or has_role(auth.uid(), 'content_admin'::app_role))
with check (has_role(auth.uid(), 'admin'::app_role) or has_role(auth.uid(), 'content_admin'::app_role));

create policy "Estudiantes gestionan su propio progreso de practica"
on public.curso_actividad_progreso for all to authenticated
using (usuario_id = auth.uid())
with check (usuario_id = auth.uid());
