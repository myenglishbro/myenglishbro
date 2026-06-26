-- Vouchers need a unique redemption code the student shows to their advisor.
-- The code is generated server-side at purchase time and stored on the
-- inventory row so it persists across sessions/devices.

ALTER TABLE public.word_survivor_inventory ADD COLUMN IF NOT EXISTS redemption_code text;

CREATE OR REPLACE FUNCTION public.purchase_word_survivor_item(p_item_id text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_price int;
  v_category text;
  v_balance int;
  v_code text;
BEGIN
  SELECT price, category INTO v_price, v_category FROM word_survivor_shop_items WHERE item_id = p_item_id;
  IF v_price IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'item_not_found');
  END IF;

  IF EXISTS (SELECT 1 FROM word_survivor_inventory WHERE usuario_id = v_user_id AND item_id = p_item_id) THEN
    RETURN jsonb_build_object('success', false, 'error', 'already_owned');
  END IF;

  INSERT INTO word_survivor_wallet (usuario_id, coins) VALUES (v_user_id, 0) ON CONFLICT (usuario_id) DO NOTHING;

  SELECT coins INTO v_balance FROM word_survivor_wallet WHERE usuario_id = v_user_id;

  IF v_balance < v_price THEN
    RETURN jsonb_build_object('success', false, 'error', 'insufficient_funds');
  END IF;

  IF v_category = 'voucher' THEN
    v_code := upper(substr(md5(random()::text || clock_timestamp()::text), 1, 8));
  END IF;

  UPDATE word_survivor_wallet SET coins = coins - v_price, updated_at = now() WHERE usuario_id = v_user_id;
  INSERT INTO word_survivor_inventory (usuario_id, item_id, redemption_code) VALUES (v_user_id, p_item_id, v_code);

  RETURN jsonb_build_object('success', true, 'remaining_coins', v_balance - v_price, 'redemption_code', v_code);
END;
$$;
