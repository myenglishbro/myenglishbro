-- Crear política RLS para permitir acceso público a cursos activos
CREATE POLICY "Cursos activos visibles públicamente" 
ON public.cursos 
FOR SELECT 
USING (activo = true);

-- Esta política permite que cualquier visitante (autenticado o no) 
-- pueda ver los cursos que están marcados como activos