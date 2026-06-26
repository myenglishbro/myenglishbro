-- Removes the lives system. In practice it was invisible to players who were winning
-- (lives only drop on a loss and regen faster than energy), so it added a second resource
-- to track without enough distinct value once energy already gates how often a node can
-- be attempted. Energy alone is now the only pacing/monetization resource.

DROP FUNCTION IF EXISTS public.register_word_survivor_attempt_result(boolean);

CREATE OR REPLACE FUNCTION public.settle_word_survivor_resources(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_energy_ticks int;
BEGIN
  INSERT INTO word_survivor_wallet (usuario_id) VALUES (p_user_id) ON CONFLICT (usuario_id) DO NOTHING;

  SELECT floor(extract(epoch FROM now() - energy_updated_at) / 60 / 8)::int
  INTO v_energy_ticks
  FROM word_survivor_wallet WHERE usuario_id = p_user_id;

  UPDATE word_survivor_wallet SET
    energy = LEAST(energy_max, energy + GREATEST(v_energy_ticks, 0)),
    energy_updated_at = CASE WHEN v_energy_ticks > 0 THEN energy_updated_at + (v_energy_ticks * 8 || ' min')::interval ELSE energy_updated_at END
  WHERE usuario_id = p_user_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.start_word_survivor_node(p_coin_cost int, p_energy_cost int)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_coins int;
  v_energy int;
BEGIN
  PERFORM settle_word_survivor_resources(v_user_id);
  SELECT coins, energy INTO v_coins, v_energy FROM word_survivor_wallet WHERE usuario_id = v_user_id;

  IF v_energy < p_energy_cost THEN RETURN jsonb_build_object('success', false, 'error', 'no_energy'); END IF;
  IF v_coins < p_coin_cost THEN RETURN jsonb_build_object('success', false, 'error', 'insufficient_funds'); END IF;

  UPDATE word_survivor_wallet
  SET coins = coins - p_coin_cost, energy = energy - p_energy_cost, updated_at = now()
  WHERE usuario_id = v_user_id;

  RETURN jsonb_build_object(
    'success', true,
    'remaining_coins', v_coins - p_coin_cost,
    'remaining_energy', v_energy - p_energy_cost
  );
END;
$$;

ALTER TABLE public.word_survivor_wallet
  DROP COLUMN IF EXISTS lives,
  DROP COLUMN IF EXISTS lives_updated_at;
