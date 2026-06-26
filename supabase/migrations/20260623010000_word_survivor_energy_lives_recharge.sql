-- Energy + lives economy for Word Survivor, plus a manual recharge-code system
-- (Yape/QR payment -> admin generates a one-time code -> student redeems it for energy).
-- NOTE: the wallet columns, the recharge_codes table, and the 4 functions below were
-- already applied directly against production while this migration was being written;
-- every statement here is written to be idempotent so re-running it is a no-op for those
-- parts. The RLS policies on word_survivor_recharge_codes are NEW (the table had RLS
-- enabled but zero policies, which silently blocked all client access).

ALTER TABLE public.word_survivor_wallet
  ADD COLUMN IF NOT EXISTS energy int NOT NULL DEFAULT 20,
  ADD COLUMN IF NOT EXISTS energy_max int NOT NULL DEFAULT 20,
  ADD COLUMN IF NOT EXISTS energy_updated_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS lives int NOT NULL DEFAULT 5,
  ADD COLUMN IF NOT EXISTS lives_updated_at timestamptz NOT NULL DEFAULT now();

CREATE TABLE IF NOT EXISTS public.word_survivor_recharge_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  currency_type text NOT NULL DEFAULT 'energy' CHECK (currency_type IN ('energy')),
  amount int NOT NULL CHECK (amount > 0),
  price_soles numeric(10,2),
  payment_reference text,
  notes text,
  created_by uuid REFERENCES public.usuarios(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  redeemed_by uuid REFERENCES public.usuarios(id),
  redeemed_at timestamptz
);

ALTER TABLE public.word_survivor_recharge_codes ENABLE ROW LEVEL SECURITY;

-- Only admins manage codes directly (list/generate). Regular users never get a SELECT/UPDATE
-- policy here on purpose: redemption only happens through redeem_word_survivor_code(), a
-- SECURITY DEFINER function, so a client can never read another code or tamper with amounts.
DROP POLICY IF EXISTS "Admin gestiona codigos de recarga" ON public.word_survivor_recharge_codes;
CREATE POLICY "Admin gestiona codigos de recarga"
ON public.word_survivor_recharge_codes FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'content_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'content_admin'::app_role));

-- Settles pending energy/lives regen for a user, lazily, without needing a cron job.
-- Keeps leftover sub-tick minutes so partial regen progress is never lost.
CREATE OR REPLACE FUNCTION public.settle_word_survivor_resources(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_energy_ticks int;
  v_lives_ticks int;
BEGIN
  INSERT INTO word_survivor_wallet (usuario_id) VALUES (p_user_id) ON CONFLICT (usuario_id) DO NOTHING;

  SELECT
    floor(extract(epoch FROM now() - energy_updated_at) / 60 / 8)::int,
    floor(extract(epoch FROM now() - lives_updated_at) / 60 / 20)::int
  INTO v_energy_ticks, v_lives_ticks
  FROM word_survivor_wallet WHERE usuario_id = p_user_id;

  UPDATE word_survivor_wallet SET
    energy = LEAST(energy_max, energy + GREATEST(v_energy_ticks, 0)),
    energy_updated_at = CASE WHEN v_energy_ticks > 0 THEN energy_updated_at + (v_energy_ticks * 8 || ' min')::interval ELSE energy_updated_at END,
    lives = LEAST(5, lives + GREATEST(v_lives_ticks, 0)),
    lives_updated_at = CASE WHEN v_lives_ticks > 0 THEN lives_updated_at + (v_lives_ticks * 20 || ' min')::interval ELSE lives_updated_at END
  WHERE usuario_id = p_user_id;
END;
$$;

-- Charges the coin + energy toll to enter a node, gated by lives. The client now calls
-- this instead of spend_word_survivor_coins for node entry (that RPC is left in place
-- but unused, since dropping it isn't necessary).
CREATE OR REPLACE FUNCTION public.start_word_survivor_node(p_coin_cost int, p_energy_cost int)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_coins int; v_energy int; v_lives int;
BEGIN
  PERFORM settle_word_survivor_resources(v_user_id);
  SELECT coins, energy, lives INTO v_coins, v_energy, v_lives FROM word_survivor_wallet WHERE usuario_id = v_user_id;

  IF v_lives < 1 THEN RETURN jsonb_build_object('success', false, 'error', 'no_lives'); END IF;
  IF v_energy < p_energy_cost THEN RETURN jsonb_build_object('success', false, 'error', 'no_energy'); END IF;
  IF v_coins < p_coin_cost THEN RETURN jsonb_build_object('success', false, 'error', 'insufficient_funds'); END IF;

  UPDATE word_survivor_wallet
  SET coins = coins - p_coin_cost, energy = energy - p_energy_cost, updated_at = now()
  WHERE usuario_id = v_user_id;

  RETURN jsonb_build_object(
    'success', true,
    'remaining_coins', v_coins - p_coin_cost,
    'remaining_energy', v_energy - p_energy_cost,
    'remaining_lives', v_lives
  );
END;
$$;

-- Called once a battle session ends; only failed attempts cost a life. Resets
-- lives_updated_at too -- without this, settle_word_survivor_resources would compute
-- ticks from a stale timestamp and could refill lives back to max almost immediately.
CREATE OR REPLACE FUNCTION public.register_word_survivor_attempt_result(p_won boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  IF NOT p_won THEN
    -- Settle any pending regen first so a near-complete tick isn't discarded by the reset below.
    PERFORM settle_word_survivor_resources(auth.uid());
    UPDATE word_survivor_wallet
    SET lives = GREATEST(0, lives - 1), lives_updated_at = now(), updated_at = now()
    WHERE usuario_id = auth.uid();
  END IF;
END;
$$;

-- Atomically claims a one-time recharge code and credits energy. SECURITY DEFINER because
-- the code doesn't belong to the redeeming user beforehand -- a plain SECURITY INVOKER
-- function would need a client-writable RLS policy on the codes table, which would let a
-- malicious user tamper with amounts before claiming. Purchased energy is allowed to exceed
-- energy_max so a paid top-up is never wasted.
CREATE OR REPLACE FUNCTION public.redeem_word_survivor_code(p_code text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_amount int;
  v_currency text;
BEGIN
  UPDATE word_survivor_recharge_codes
  SET redeemed_by = v_user_id, redeemed_at = now()
  WHERE code = upper(trim(p_code)) AND redeemed_by IS NULL
  RETURNING amount, currency_type INTO v_amount, v_currency;

  IF v_amount IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'invalid_or_used_code');
  END IF;

  INSERT INTO word_survivor_wallet (usuario_id) VALUES (v_user_id) ON CONFLICT (usuario_id) DO NOTHING;

  IF v_currency = 'energy' THEN
    UPDATE word_survivor_wallet SET energy = energy + v_amount, updated_at = now() WHERE usuario_id = v_user_id;
  END IF;

  RETURN jsonb_build_object('success', true, 'amount', v_amount, 'currency', v_currency);
END;
$$;
