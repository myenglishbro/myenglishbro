-- Create modules table to store course modules with persistent ordering
CREATE TABLE public.modulos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  curso_id UUID NOT NULL REFERENCES public.cursos(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  slug TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  fecha_creacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(curso_id, slug)
);

-- Add order_index to lecciones for lesson ordering within modules
ALTER TABLE public.lecciones 
ADD COLUMN IF NOT EXISTS order_index INTEGER NOT NULL DEFAULT 0;

-- Add modulo_id foreign key to lecciones (nullable for backward compatibility)
ALTER TABLE public.lecciones 
ADD COLUMN IF NOT EXISTS modulo_id UUID REFERENCES public.modulos(id) ON DELETE SET NULL;

-- Enable RLS on modulos
ALTER TABLE public.modulos ENABLE ROW LEVEL SECURITY;

-- Admin manages modules
CREATE POLICY "Admin gestiona modulos" 
ON public.modulos 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Enrolled users can view modules
CREATE POLICY "Modulos visibles para matriculados" 
ON public.modulos 
FOR SELECT 
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  OR has_active_enrollment(auth.uid(), curso_id)
);

-- Create function to generate slug from title
CREATE OR REPLACE FUNCTION public.generate_slug(title TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN lower(regexp_replace(
    regexp_replace(
      regexp_replace(
        unaccent(trim(title)),
        '[^a-zA-Z0-9\s-]', '', 'g'
      ),
      '\s+', '-', 'g'
    ),
    '-+', '-', 'g'
  ));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create index for faster ordering queries
CREATE INDEX IF NOT EXISTS idx_modulos_curso_order ON public.modulos(curso_id, order_index);
CREATE INDEX IF NOT EXISTS idx_lecciones_modulo_order ON public.lecciones(modulo_id, order_index);