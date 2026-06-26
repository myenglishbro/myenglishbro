
CREATE TABLE public.programas_en_vivo (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  nivel TEXT NOT NULL,
  fecha_inicio DATE NOT NULL,
  dias_clase TEXT NOT NULL,
  horario TEXT NOT NULL,
  duracion_meses INTEGER NOT NULL DEFAULT 4,
  precio_mensual NUMERIC NOT NULL,
  max_estudiantes INTEGER NOT NULL DEFAULT 8,
  min_estudiantes INTEGER NOT NULL DEFAULT 3,
  requisito_nivel TEXT,
  estado_inscripcion TEXT NOT NULL DEFAULT 'abierta',
  descripcion TEXT,
  incluye_plataforma BOOLEAN NOT NULL DEFAULT true,
  fecha_creacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.programas_en_vivo ENABLE ROW LEVEL SECURITY;

-- Public can read programs with open enrollment
CREATE POLICY "Programas visibles publicamente"
  ON public.programas_en_vivo
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Admin full access
CREATE POLICY "Admin gestiona programas"
  ON public.programas_en_vivo
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));
