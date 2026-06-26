-- Tracks which CEFR regions (A1-C2) a student has cleared in Word Survivor by
-- defeating that region's one-time Region Boss. Drives the world map's lock state.

CREATE TABLE public.word_survivor_region_progress (
  usuario_id uuid PRIMARY KEY REFERENCES public.usuarios(id) ON DELETE CASCADE,
  cleared_regions text[] NOT NULL DEFAULT '{}',
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.word_survivor_region_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios ven su propio progreso de regiones"
ON public.word_survivor_region_progress FOR SELECT
USING (usuario_id = auth.uid());

CREATE POLICY "Usuarios crean su propio progreso de regiones"
ON public.word_survivor_region_progress FOR INSERT
WITH CHECK (usuario_id = auth.uid());

CREATE POLICY "Usuarios actualizan su propio progreso de regiones"
ON public.word_survivor_region_progress FOR UPDATE
USING (usuario_id = auth.uid());

-- Idempotent: marks a region as cleared the first time its Region Boss is defeated.
CREATE OR REPLACE FUNCTION public.clear_word_survivor_region(p_level text)
RETURNS void
LANGUAGE sql
SECURITY INVOKER
SET search_path = public
AS $$
  INSERT INTO word_survivor_region_progress (usuario_id, cleared_regions)
  VALUES (auth.uid(), ARRAY[p_level])
  ON CONFLICT (usuario_id) DO UPDATE SET
    cleared_regions = CASE
      WHEN p_level = ANY(word_survivor_region_progress.cleared_regions) THEN word_survivor_region_progress.cleared_regions
      ELSE array_append(word_survivor_region_progress.cleared_regions, p_level)
    END,
    updated_at = now();
$$;
