
DROP POLICY IF EXISTS "Admin gestiona programas" ON public.programas_en_vivo;

CREATE POLICY "Admin gestiona programas"
ON public.programas_en_vivo
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'content_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'content_admin'::app_role));
