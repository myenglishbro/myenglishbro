
-- Fix: Restrict anon access to only preview lessons
DROP POLICY IF EXISTS "Lecciones visibles publicamente" ON public.lecciones;

CREATE POLICY "Solo preview lecciones para anon"
ON public.lecciones FOR SELECT TO anon
USING (
  es_preview = true
  AND EXISTS (
    SELECT 1 FROM public.cursos
    WHERE cursos.id = lecciones.curso_id
    AND cursos.activo = true
  )
);
