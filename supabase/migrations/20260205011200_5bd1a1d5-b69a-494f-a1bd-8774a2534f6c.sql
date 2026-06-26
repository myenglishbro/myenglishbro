-- Permitir que cada usuario autenticado lea su propio registro en usuarios
CREATE POLICY "Usuarios pueden ver su propio registro"
ON public.usuarios
FOR SELECT
TO authenticated
USING (auth.uid() = id);