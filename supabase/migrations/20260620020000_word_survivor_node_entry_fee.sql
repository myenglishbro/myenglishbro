-- Generic coin-spend RPC for the wallet, used to charge a small toll to
-- enter map nodes beyond the first one in a world.
CREATE OR REPLACE FUNCTION public.spend_word_survivor_coins(p_amount int)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_balance int;
BEGIN
  IF p_amount <= 0 THEN
    RETURN jsonb_build_object('success', true);
  END IF;

  INSERT INTO word_survivor_wallet (usuario_id, coins) VALUES (v_user_id, 0) ON CONFLICT (usuario_id) DO NOTHING;
  SELECT coins INTO v_balance FROM word_survivor_wallet WHERE usuario_id = v_user_id;

  IF v_balance < p_amount THEN
    RETURN jsonb_build_object('success', false, 'error', 'insufficient_funds', 'remaining_coins', v_balance);
  END IF;

  UPDATE word_survivor_wallet SET coins = coins - p_amount, updated_at = now() WHERE usuario_id = v_user_id;

  RETURN jsonb_build_object('success', true, 'remaining_coins', v_balance - p_amount);
END;
$$;
