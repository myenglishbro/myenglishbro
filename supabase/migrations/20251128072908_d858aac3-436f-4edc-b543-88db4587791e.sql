-- ====================================
-- MyEnglishBro Academy - Database Setup
-- ====================================

-- 1. CREATE ENUM FOR ROLES
CREATE TYPE public.app_role AS ENUM ('admin', 'student');

-- 2. CREATE TABLES

-- Tabla usuarios (extiende auth.users)
CREATE TABLE public.usuarios (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  nombre TEXT,
  stripe_customer_id TEXT,
  fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabla user_roles (sistema de roles seguro)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Tabla cursos
CREATE TABLE public.cursos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  titulo TEXT NOT NULL,
  nivel TEXT NOT NULL,
  descripcion TEXT,
  stripe_price_id TEXT,
  activo BOOLEAN NOT NULL DEFAULT true,
  fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabla pagos
CREATE TABLE public.pagos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE NOT NULL,
  curso_id UUID REFERENCES public.cursos(id) ON DELETE SET NULL,
  stripe_session_id TEXT,
  stripe_payment_intent_id TEXT,
  monto INTEGER NOT NULL,
  moneda TEXT NOT NULL DEFAULT 'usd',
  estado TEXT NOT NULL DEFAULT 'pending',
  raw_payload JSONB,
  fecha TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabla matriculas
CREATE TABLE public.matriculas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE NOT NULL,
  curso_id UUID REFERENCES public.cursos(id) ON DELETE CASCADE NOT NULL,
  pago_id UUID REFERENCES public.pagos(id) ON DELETE SET NULL,
  estado TEXT NOT NULL DEFAULT 'activa',
  fecha_inicio TIMESTAMPTZ NOT NULL DEFAULT now(),
  fecha_fin TIMESTAMPTZ,
  fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(usuario_id, curso_id)
);

-- Tabla lecciones
CREATE TABLE public.lecciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  curso_id UUID REFERENCES public.cursos(id) ON DELETE CASCADE NOT NULL,
  titulo TEXT NOT NULL,
  slug TEXT NOT NULL,
  descripcion TEXT,
  orden INTEGER NOT NULL DEFAULT 0,
  video_url TEXT,
  pdf_url TEXT,
  extra_urls JSONB,
  fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabla recursos
CREATE TABLE public.recursos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  curso_id UUID REFERENCES public.cursos(id) ON DELETE SET NULL,
  categoria TEXT NOT NULL,
  titulo TEXT NOT NULL,
  descripcion TEXT,
  tipo TEXT NOT NULL,
  archivo_url TEXT NOT NULL,
  extra_urls JSONB,
  fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. CREATE SECURITY DEFINER FUNCTION FOR ROLE CHECKING
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 4. CREATE TRIGGER FUNCTION TO AUTO-CREATE USUARIO ON SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_usuario()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.usuarios (id, email, nombre)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'nombre'
  );
  
  -- Asignar rol 'student' por defecto
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'student');
  
  RETURN new;
END;
$$;

-- Create trigger on auth.users
CREATE TRIGGER on_auth_user_created_usuario
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_usuario();

-- 5. ENABLE ROW LEVEL SECURITY
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cursos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pagos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matriculas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lecciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recursos ENABLE ROW LEVEL SECURITY;

-- 6. RLS POLICIES FOR USUARIOS
CREATE POLICY "Usuarios se ven a sí mismos"
ON public.usuarios
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Usuarios editan su perfil"
ON public.usuarios
FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Admins ven todos los usuarios"
ON public.usuarios
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins gestionan usuarios"
ON public.usuarios
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- 7. RLS POLICIES FOR USER_ROLES
CREATE POLICY "Usuarios ven sus propios roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Solo admins gestionan roles"
ON public.user_roles
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- 8. RLS POLICIES FOR PAGOS
CREATE POLICY "Usuarios ven solo sus pagos"
ON public.pagos
FOR SELECT
USING (auth.uid() = usuario_id);

CREATE POLICY "Sistema gestiona pagos"
ON public.pagos
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Sistema actualiza pagos"
ON public.pagos
FOR UPDATE
USING (true);

-- 9. RLS POLICIES FOR MATRICULAS
CREATE POLICY "Usuarios ven solo sus matriculas"
ON public.matriculas
FOR SELECT
USING (auth.uid() = usuario_id);

CREATE POLICY "Sistema gestiona matriculas"
ON public.matriculas
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Sistema actualiza matriculas"
ON public.matriculas
FOR UPDATE
USING (true);

-- 10. RLS POLICIES FOR CURSOS
CREATE POLICY "Cursos visibles para usuarios autenticados"
ON public.cursos
FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Admin gestiona cursos"
ON public.cursos
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- 11. RLS POLICIES FOR LECCIONES
CREATE POLICY "Lecciones visibles para usuarios autenticados"
ON public.lecciones
FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Admin gestiona lecciones"
ON public.lecciones
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- 12. RLS POLICIES FOR RECURSOS
CREATE POLICY "Recursos visibles para usuarios autenticados"
ON public.recursos
FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Admin gestiona recursos"
ON public.recursos
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- 13. CREATE STORAGE BUCKETS
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('avatars', 'avatars', false),
  ('static_assets', 'static_assets', true);

-- 14. STORAGE POLICIES FOR AVATARS
CREATE POLICY "Usuarios pueden ver avatares"
ON storage.objects
FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Usuarios pueden subir su avatar"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Usuarios pueden actualizar su avatar"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Usuarios pueden eliminar su avatar"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 15. STORAGE POLICIES FOR STATIC_ASSETS
CREATE POLICY "Assets públicos visibles para todos"
ON storage.objects
FOR SELECT
USING (bucket_id = 'static_assets');

CREATE POLICY "Solo admins gestionan assets"
ON storage.objects
FOR ALL
USING (
  bucket_id = 'static_assets' 
  AND public.has_role(auth.uid(), 'admin')
);

-- 16. CREATE INDEXES FOR PERFORMANCE
CREATE INDEX idx_usuarios_stripe_customer ON public.usuarios(stripe_customer_id);
CREATE INDEX idx_pagos_usuario ON public.pagos(usuario_id);
CREATE INDEX idx_pagos_curso ON public.pagos(curso_id);
CREATE INDEX idx_matriculas_usuario ON public.matriculas(usuario_id);
CREATE INDEX idx_matriculas_curso ON public.matriculas(curso_id);
CREATE INDEX idx_matriculas_estado ON public.matriculas(estado);
CREATE INDEX idx_lecciones_curso ON public.lecciones(curso_id);
CREATE INDEX idx_lecciones_orden ON public.lecciones(curso_id, orden);
CREATE INDEX idx_recursos_categoria ON public.recursos(categoria);
CREATE INDEX idx_recursos_curso ON public.recursos(curso_id);