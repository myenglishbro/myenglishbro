
-- Add metadata fields to cursos
ALTER TABLE public.cursos 
  ADD COLUMN IF NOT EXISTS duracion_total text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS learning_outcomes jsonb DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS instructor text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS rating numeric DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS estudiantes_count integer DEFAULT NULL;

-- Add es_preview to lecciones
ALTER TABLE public.lecciones 
  ADD COLUMN IF NOT EXISTS es_preview boolean NOT NULL DEFAULT false;
