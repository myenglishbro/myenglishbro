-- Per-student word mastery tracking (Duolingo/Anki-style) for Word Survivor.

CREATE TABLE public.word_survivor_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  term_id uuid NOT NULL REFERENCES public.word_survivor_terms(id) ON DELETE CASCADE,
  times_seen int NOT NULL DEFAULT 0,
  times_correct int NOT NULL DEFAULT 0,
  mastery_stage text NOT NULL DEFAULT 'new' CHECK (mastery_stage IN ('new','learning','familiar','mastered')),
  mastery_score numeric NOT NULL DEFAULT 0,
  last_seen_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (usuario_id, term_id)
);

CREATE INDEX idx_word_survivor_progress_usuario ON public.word_survivor_progress (usuario_id);

ALTER TABLE public.word_survivor_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios ven su propio progreso de vocabulario"
ON public.word_survivor_progress FOR SELECT
USING (usuario_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'content_admin'::app_role));

CREATE POLICY "Usuarios crean su propio progreso de vocabulario"
ON public.word_survivor_progress FOR INSERT
WITH CHECK (usuario_id = auth.uid());

CREATE POLICY "Usuarios actualizan su propio progreso de vocabulario"
ON public.word_survivor_progress FOR UPDATE
USING (usuario_id = auth.uid());

-- Atomically records one exposure to a term (correct or wrong) and recomputes
-- the mastery stage/score in a single round trip from the game client.
CREATE OR REPLACE FUNCTION public.record_word_progress(p_term_id uuid, p_correct boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_times_seen int;
  v_times_correct int;
  v_accuracy numeric;
  v_score numeric;
  v_stage text;
BEGIN
  INSERT INTO word_survivor_progress (usuario_id, term_id, times_seen, times_correct, last_seen_at)
  VALUES (v_user_id, p_term_id, 1, CASE WHEN p_correct THEN 1 ELSE 0 END, now())
  ON CONFLICT (usuario_id, term_id) DO UPDATE SET
    times_seen = word_survivor_progress.times_seen + 1,
    times_correct = word_survivor_progress.times_correct + CASE WHEN p_correct THEN 1 ELSE 0 END,
    last_seen_at = now()
  RETURNING times_seen, times_correct INTO v_times_seen, v_times_correct;

  v_accuracy := v_times_correct::numeric / v_times_seen;
  v_score := LEAST(100, GREATEST(0, (v_times_correct::numeric / 6) * 70 + v_accuracy * 30));
  v_stage := CASE
    WHEN v_times_correct >= 6 AND v_accuracy >= 0.85 THEN 'mastered'
    WHEN v_times_correct >= 3 AND v_accuracy >= 0.6 THEN 'familiar'
    WHEN v_times_correct >= 1 THEN 'learning'
    ELSE 'new'
  END;

  UPDATE word_survivor_progress
  SET mastery_score = v_score, mastery_stage = v_stage
  WHERE usuario_id = v_user_id AND term_id = p_term_id;
END;
$$;
