-- =============================================
-- SECURITY FIX: Comprehensive RLS Policy Updates
-- =============================================

-- 1. FIX PROFILES PUBLIC EXPOSURE
-- Remove the overly permissive policy that exposes all user data
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Create restrictive policy - users can only see their own profile
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- Allow admins to view all profiles for management
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'));

-- 2. CREATE ENROLLMENT CHECK FUNCTION
-- Security definer function to check if user has active enrollment
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
  )
$$;

-- 3. FIX LECCIONES ACCESS CONTROL
-- Remove overly permissive policy
DROP POLICY IF EXISTS "Lecciones visibles para usuarios autenticados" ON public.lecciones;

-- Create enrollment-based access policy
CREATE POLICY "Lecciones solo para usuarios matriculados" 
ON public.lecciones 
FOR SELECT 
USING (
  has_role(auth.uid(), 'admin') OR 
  has_active_enrollment(auth.uid(), curso_id)
);

-- 4. FIX RECURSOS ACCESS CONTROL
-- Remove overly permissive policy
DROP POLICY IF EXISTS "Recursos visibles para usuarios autenticados" ON public.recursos;

-- Create enrollment-based access policy for course-specific resources
-- If curso_id is null, resource is available to all authenticated users
CREATE POLICY "Recursos solo para usuarios matriculados" 
ON public.recursos 
FOR SELECT 
USING (
  has_role(auth.uid(), 'admin') OR 
  (curso_id IS NULL AND auth.role() = 'authenticated') OR
  (curso_id IS NOT NULL AND has_active_enrollment(auth.uid(), curso_id))
);

-- 5. FIX PAGOS (PAYMENTS) PERMISSIONS
-- Remove overly permissive INSERT policy
DROP POLICY IF EXISTS "Sistema gestiona pagos" ON public.pagos;

-- Remove overly permissive UPDATE policy  
DROP POLICY IF EXISTS "Sistema actualiza pagos" ON public.pagos;

-- Create restrictive INSERT policy - only admins can insert payments
-- (Edge functions with service_role bypass RLS anyway)
CREATE POLICY "Solo admins insertan pagos" 
ON public.pagos 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Create restrictive UPDATE policy - only admins can update payments
CREATE POLICY "Solo admins actualizan pagos" 
ON public.pagos 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'));

-- 6. FIX MATRICULAS (ENROLLMENTS) UPDATE PERMISSION
-- Remove overly permissive UPDATE policy
DROP POLICY IF EXISTS "Sistema actualiza matriculas" ON public.matriculas;

-- Create restrictive UPDATE policy - only admins can update enrollments
CREATE POLICY "Solo admins actualizan matriculas" 
ON public.matriculas 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'));