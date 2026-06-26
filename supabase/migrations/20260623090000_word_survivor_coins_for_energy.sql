-- Lets players spend coins earned in-game for a top-up of energy, separate from the
-- real-money Yape recharge codes. Mirrors start_word_survivor_node's style: settle
-- pending regen first, then validate and apply the trade atomically.

CREATE OR REPLACE FUNCTION public.exchange_word_survivor_coins_for_energy(p_coin_cost int, p_energy_amount int)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_coins int;
  v_energy int;
  v_energy_max int;
BEGIN
  PERFORM settle_word_survivor_resources(v_user_id);
  SELECT coins, energy, energy_max INTO v_coins, v_energy, v_energy_max
  FROM word_survivor_wallet WHERE usuario_id = v_user_id;

  IF v_coins < p_coin_cost THEN RETURN jsonb_build_object('success', false, 'error', 'insufficient_funds'); END IF;
  IF v_energy >= v_energy_max THEN RETURN jsonb_build_object('success', false, 'error', 'energy_full'); END IF;

  UPDATE word_survivor_wallet
  SET coins = coins - p_coin_cost,
      energy = LEAST(v_energy_max, v_energy + p_energy_amount),
      updated_at = now()
  WHERE usuario_id = v_user_id;

  RETURN jsonb_build_object(
    'success', true,
    'remaining_coins', v_coins - p_coin_cost,
    'remaining_energy', LEAST(v_energy_max, v_energy + p_energy_amount)
  );
END;
$$;
