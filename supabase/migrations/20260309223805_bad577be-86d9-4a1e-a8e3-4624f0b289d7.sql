-- Fix: Allow anon to see all lessons for active courses (curriculum display)
-- Content access is controlled at the application level (preview vs enrolled)
DROP POLICY IF EXISTS "Solo preview lecciones para anon" ON public.lecciones;

CREATE POLICY "Lecciones de cursos activos visibles para anon"
ON public.lecciones FOR SELECT TO anon
USING (
  EXISTS (
    SELECT 1 FROM public.cursos
    WHERE cursos.id = lecciones.curso_id
    AND cursos.activo = true
  )
);