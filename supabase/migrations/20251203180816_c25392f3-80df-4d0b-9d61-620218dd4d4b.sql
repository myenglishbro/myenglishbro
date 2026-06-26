-- Fix RLS policy for matriculas to allow admin INSERT
DROP POLICY IF EXISTS "Sistema gestiona matriculas" ON public.matriculas;
CREATE POLICY "Admin gestiona matriculas" 
ON public.matriculas 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Fix the trigger to use 'full_name' instead of 'nombre'
CREATE OR REPLACE FUNCTION public.handle_new_usuario()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.usuarios (id, email, nombre)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'nombre')
  );
  
  -- Asignar rol 'student' por defecto
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'student');
  
  RETURN new;
END;
$$;