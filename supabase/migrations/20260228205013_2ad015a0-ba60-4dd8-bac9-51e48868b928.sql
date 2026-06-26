-- Modulos visibles publicamente para cursos activos
CREATE POLICY "Modulos visibles publicamente"
ON public.modulos FOR SELECT TO anon
USING (EXISTS (
  SELECT 1 FROM public.cursos
  WHERE cursos.id = modulos.curso_id AND cursos.activo = true
));

-- Lecciones visibles publicamente para cursos activos
CREATE POLICY "Lecciones visibles publicamente"
ON public.lecciones FOR SELECT TO anon
USING (EXISTS (
  SELECT 1 FROM public.cursos
  WHERE cursos.id = lecciones.curso_id AND cursos.activo = true
));