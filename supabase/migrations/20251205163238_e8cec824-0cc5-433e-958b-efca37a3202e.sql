-- Agregar campo imagen_url a la tabla cursos
ALTER TABLE public.cursos ADD COLUMN IF NOT EXISTS imagen_url TEXT;