-- Agregar campo modulo para agrupar lecciones
ALTER TABLE public.lecciones 
ADD COLUMN modulo text DEFAULT NULL;

-- Crear índice para ordenar por módulo
CREATE INDEX idx_lecciones_modulo ON public.lecciones(curso_id, modulo, orden);