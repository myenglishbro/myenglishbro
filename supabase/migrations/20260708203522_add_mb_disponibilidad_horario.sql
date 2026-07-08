CREATE TABLE public.mb_disponibilidad_horario (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dia_semana SMALLINT NOT NULL CHECK (dia_semana BETWEEN 1 AND 7),
  hora_inicio SMALLINT NOT NULL CHECK (hora_inicio BETWEEN 6 AND 22),
  disponible BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id),
  UNIQUE (dia_semana, hora_inicio)
);

ALTER TABLE public.mb_disponibilidad_horario ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Horario visible para autenticados"
  ON public.mb_disponibilidad_horario FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Profesor o admin gestiona horario"
  ON public.mb_disponibilidad_horario FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'teacher'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'teacher'::app_role));

INSERT INTO public.mb_disponibilidad_horario (dia_semana, hora_inicio, disponible)
SELECT d, h, true FROM generate_series(1,7) d, generate_series(6,22) h;
