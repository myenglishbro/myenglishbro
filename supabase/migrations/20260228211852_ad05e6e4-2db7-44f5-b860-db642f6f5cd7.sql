
-- Table: progreso_lecciones
CREATE TABLE public.progreso_lecciones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  leccion_id uuid NOT NULL REFERENCES public.lecciones(id) ON DELETE CASCADE,
  completado boolean NOT NULL DEFAULT false,
  completed_at timestamptz NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(usuario_id, leccion_id)
);

-- Enable RLS
ALTER TABLE public.progreso_lecciones ENABLE ROW LEVEL SECURITY;

-- Users can view their own progress
CREATE POLICY "Usuarios ven su propio progreso"
ON public.progreso_lecciones FOR SELECT
USING (auth.uid() = usuario_id);

-- Users can insert their own progress (only if enrolled)
CREATE POLICY "Usuarios insertan su progreso"
ON public.progreso_lecciones FOR INSERT
WITH CHECK (
  auth.uid() = usuario_id
  AND EXISTS (
    SELECT 1 FROM public.lecciones l
    JOIN public.matriculas m ON m.curso_id = l.curso_id
    WHERE l.id = leccion_id
      AND m.usuario_id = auth.uid()
      AND m.estado = 'activa'
      AND (m.fecha_fin IS NULL OR m.fecha_fin > now())
  )
);

-- Users can update their own progress
CREATE POLICY "Usuarios actualizan su progreso"
ON public.progreso_lecciones FOR UPDATE
USING (auth.uid() = usuario_id)
WITH CHECK (auth.uid() = usuario_id);

-- Admins full access
CREATE POLICY "Admin gestiona progreso"
ON public.progreso_lecciones FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.progreso_lecciones
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();
