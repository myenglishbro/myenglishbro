
-- Actualizar la función has_active_enrollment para verificar fecha_fin
CREATE OR REPLACE FUNCTION public.has_active_enrollment(_user_id uuid, _curso_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.matriculas
    WHERE usuario_id = _user_id
    AND curso_id = _curso_id
    AND estado = 'activa'
    AND (fecha_fin IS NULL OR fecha_fin > now())
  )
$$;
