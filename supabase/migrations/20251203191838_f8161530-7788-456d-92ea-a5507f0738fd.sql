-- Permitir a admins ver todas las matriculas
CREATE POLICY "Admin ve todas las matriculas" 
ON public.matriculas 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Actualizar nombre del usuario existente
UPDATE public.usuarios 
SET nombre = 'Usuario Temis' 
WHERE email = 'temis_it@hotmail.com' AND (nombre IS NULL OR nombre = '');