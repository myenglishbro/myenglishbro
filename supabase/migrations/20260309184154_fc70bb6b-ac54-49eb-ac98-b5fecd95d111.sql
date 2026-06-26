
-- Allow content_admin to manage lecciones
DROP POLICY IF EXISTS "Admin gestiona lecciones" ON public.lecciones;
CREATE POLICY "Admin gestiona lecciones"
ON public.lecciones FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'content_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'content_admin'::app_role));

-- Allow content_admin to manage modulos
DROP POLICY IF EXISTS "Admin gestiona modulos" ON public.modulos;
CREATE POLICY "Admin gestiona modulos"
ON public.modulos FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'content_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'content_admin'::app_role));

-- Allow content_admin to manage cursos
DROP POLICY IF EXISTS "Admin gestiona cursos" ON public.cursos;
CREATE POLICY "Admin gestiona cursos"
ON public.cursos FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'content_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'content_admin'::app_role));

-- Allow content_admin to manage recursos
DROP POLICY IF EXISTS "Admin gestiona recursos" ON public.recursos;
CREATE POLICY "Admin gestiona recursos"
ON public.recursos FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'content_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'content_admin'::app_role));
