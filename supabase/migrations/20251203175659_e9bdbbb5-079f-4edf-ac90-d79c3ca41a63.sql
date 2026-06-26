-- Añadir campos de precio a cursos
ALTER TABLE public.cursos 
ADD COLUMN IF NOT EXISTS precio_mensual_soles numeric,
ADD COLUMN IF NOT EXISTS precio_unico_soles numeric;

-- Añadir campos a matriculas para tipo de pago
ALTER TABLE public.matriculas 
ADD COLUMN IF NOT EXISTS tipo_pago text DEFAULT 'unico' CHECK (tipo_pago IN ('mensual', 'unico'));

-- Actualizar precios de cursos existentes
UPDATE public.cursos SET 
  precio_mensual_soles = CASE nivel
    WHEN 'B2' THEN 40
    WHEN 'C1' THEN 50
    WHEN 'C2' THEN 70
    ELSE 30
  END,
  precio_unico_soles = CASE nivel
    WHEN 'B2' THEN 150
    WHEN 'C1' THEN 180
    WHEN 'C2' THEN 220
    ELSE 100
  END;

-- Insertar nuevos cursos A1, A2, B1 si no existen
INSERT INTO public.cursos (nivel, titulo, slug, descripcion, precio_mensual_soles, precio_unico_soles, activo)
SELECT 'A1', 'Inglés Básico A1', 'ingles-a1', 'Curso de inglés nivel A1 - Principiante', 30, 100, true
WHERE NOT EXISTS (SELECT 1 FROM public.cursos WHERE nivel = 'A1');

INSERT INTO public.cursos (nivel, titulo, slug, descripcion, precio_mensual_soles, precio_unico_soles, activo)
SELECT 'A2', 'Inglés Elemental A2', 'ingles-a2', 'Curso de inglés nivel A2 - Elemental', 30, 100, true
WHERE NOT EXISTS (SELECT 1 FROM public.cursos WHERE nivel = 'A2');

INSERT INTO public.cursos (nivel, titulo, slug, descripcion, precio_mensual_soles, precio_unico_soles, activo)
SELECT 'B1', 'Inglés Intermedio B1', 'ingles-b1', 'Curso de inglés nivel B1 - Intermedio', 30, 100, true
WHERE NOT EXISTS (SELECT 1 FROM public.cursos WHERE nivel = 'B1');

-- Añadir política para que admins puedan eliminar usuarios
CREATE POLICY "Admin elimina usuarios" ON public.usuarios
FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- Añadir política para eliminar matriculas
CREATE POLICY "Admin elimina matriculas" ON public.matriculas
FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));