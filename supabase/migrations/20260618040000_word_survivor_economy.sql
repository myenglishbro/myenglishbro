-- Word Survivor economy: a persistent coin wallet (cross-device, spendable),
-- a shop catalog, owned-item inventory, and the equip state for cosmetics.
-- Coins were previously only tracked client-side in localStorage; this makes
-- them a real, server-truth currency that can be spent and ranked.

CREATE TABLE public.word_survivor_wallet (
  usuario_id uuid PRIMARY KEY REFERENCES public.usuarios(id) ON DELETE CASCADE,
  display_name text,
  coins int NOT NULL DEFAULT 0,
  equipped_avatar text,
  equipped_title text,
  equipped_frame text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.word_survivor_wallet ENABLE ROW LEVEL SECURITY;

-- Coins/cosmetics are shown on a public leaderboard, so the wallet is readable by anyone signed in.
CREATE POLICY "Wallet de word survivor visible para autenticados"
ON public.word_survivor_wallet FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios gestionan su propio wallet"
ON public.word_survivor_wallet FOR ALL
USING (usuario_id = auth.uid())
WITH CHECK (usuario_id = auth.uid());

CREATE TABLE public.word_survivor_shop_items (
  item_id text PRIMARY KEY,
  category text NOT NULL CHECK (category IN ('avatar','title','frame')),
  value text NOT NULL,
  label text NOT NULL,
  description text,
  price int NOT NULL,
  rarity text NOT NULL CHECK (rarity IN ('common','rare','epic','legendary'))
);

ALTER TABLE public.word_survivor_shop_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Catalogo de tienda visible para autenticados"
ON public.word_survivor_shop_items FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Admin gestiona la tienda de word survivor"
ON public.word_survivor_shop_items FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'content_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'content_admin'::app_role));

CREATE TABLE public.word_survivor_inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  item_id text NOT NULL REFERENCES public.word_survivor_shop_items(item_id),
  acquired_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (usuario_id, item_id)
);

ALTER TABLE public.word_survivor_inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios ven su propio inventario"
ON public.word_survivor_inventory FOR SELECT
USING (usuario_id = auth.uid());

CREATE POLICY "Usuarios agregan a su propio inventario"
ON public.word_survivor_inventory FOR INSERT
WITH CHECK (usuario_id = auth.uid());

-- Deposits coins earned at the end of a run into the persistent wallet.
CREATE OR REPLACE FUNCTION public.deposit_word_survivor_coins(p_amount int)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_name text;
BEGIN
  IF p_amount <= 0 THEN
    RETURN;
  END IF;

  SELECT COALESCE(nombre, split_part(email, '@', 1)) INTO v_name FROM usuarios WHERE id = v_user_id;

  INSERT INTO word_survivor_wallet (usuario_id, coins, display_name)
  VALUES (v_user_id, p_amount, v_name)
  ON CONFLICT (usuario_id) DO UPDATE SET
    coins = word_survivor_wallet.coins + p_amount,
    display_name = COALESCE(v_name, word_survivor_wallet.display_name),
    updated_at = now();
END;
$$;

-- Atomically validates funds (server-side price, ignores any client-supplied price)
-- and grants the item, or returns a structured failure reason.
CREATE OR REPLACE FUNCTION public.purchase_word_survivor_item(p_item_id text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_price int;
  v_balance int;
BEGIN
  SELECT price INTO v_price FROM word_survivor_shop_items WHERE item_id = p_item_id;
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

  UPDATE word_survivor_wallet SET coins = coins - v_price, updated_at = now() WHERE usuario_id = v_user_id;
  INSERT INTO word_survivor_inventory (usuario_id, item_id) VALUES (v_user_id, p_item_id);

  RETURN jsonb_build_object('success', true, 'remaining_coins', v_balance - v_price);
END;
$$;

-- Equips an owned item (or clears the slot when p_item_id is NULL).
CREATE OR REPLACE FUNCTION public.equip_word_survivor_item(p_category text, p_item_id text)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
BEGIN
  IF p_item_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM word_survivor_inventory i
      JOIN word_survivor_shop_items s ON s.item_id = i.item_id
      WHERE i.usuario_id = v_user_id AND i.item_id = p_item_id AND s.category = p_category
    ) THEN
      RAISE EXCEPTION 'not_owned';
    END IF;
  END IF;

  INSERT INTO word_survivor_wallet (usuario_id) VALUES (v_user_id) ON CONFLICT (usuario_id) DO NOTHING;

  IF p_category = 'avatar' THEN
    UPDATE word_survivor_wallet SET equipped_avatar = p_item_id, updated_at = now() WHERE usuario_id = v_user_id;
  ELSIF p_category = 'title' THEN
    UPDATE word_survivor_wallet SET equipped_title = p_item_id, updated_at = now() WHERE usuario_id = v_user_id;
  ELSIF p_category = 'frame' THEN
    UPDATE word_survivor_wallet SET equipped_frame = p_item_id, updated_at = now() WHERE usuario_id = v_user_id;
  ELSE
    RAISE EXCEPTION 'invalid_category';
  END IF;
END;
$$;

-- Shop catalog seed.
INSERT INTO public.word_survivor_shop_items (item_id, category, value, label, description, price, rarity) VALUES
  ('av_wizard', 'avatar', '🧙', 'Mago Sabio', 'Un avatar para tu panel de jugador.', 150, 'common'),
  ('av_ninja', 'avatar', '🥷', 'Ninja Silencioso', 'Un avatar para tu panel de jugador.', 150, 'common'),
  ('av_pirate', 'avatar', '🏴‍☠️', 'Pirata Audaz', 'Un avatar para tu panel de jugador.', 200, 'common'),
  ('av_knight', 'avatar', '🤴', 'Caballero Real', 'Un avatar para tu panel de jugador.', 400, 'rare'),
  ('av_astronaut', 'avatar', '🧑‍🚀', 'Explorador Estelar', 'Un avatar para tu panel de jugador.', 450, 'rare'),
  ('av_dragon', 'avatar', '🐉', 'Dragón Ancestral', 'Un avatar para tu panel de jugador.', 900, 'epic'),
  ('av_champion', 'avatar', '🏆', 'Campeón Legendario', 'Un avatar para tu panel de jugador.', 2000, 'legendary'),
  ('title_wordsmith', 'title', 'Word Wizard', 'Word Wizard', 'Un título junto a tu nombre.', 150, 'common'),
  ('title_grammarslayer', 'title', 'Grammar Slayer', 'Grammar Slayer', 'Un título junto a tu nombre.', 150, 'common'),
  ('title_vocabhunter', 'title', 'Vocab Hunter', 'Vocab Hunter', 'Un título junto a tu nombre.', 350, 'rare'),
  ('title_bossbreaker', 'title', 'Boss Breaker', 'Boss Breaker', 'Un título junto a tu nombre.', 400, 'rare'),
  ('title_legend', 'title', 'Living Legend', 'Living Legend', 'Un título junto a tu nombre.', 800, 'epic'),
  ('title_cambridge', 'title', 'Cambridge Master', 'Cambridge Master', 'Un título junto a tu nombre.', 1800, 'legendary'),
  ('frame_silver', 'frame', 'ring-2 ring-slate-300', 'Marco Plateado', 'Un marco para tu avatar.', 150, 'common'),
  ('frame_sky', 'frame', 'ring-2 ring-sky-400', 'Marco Cielo', 'Un marco para tu avatar.', 150, 'common'),
  ('frame_emerald', 'frame', 'ring-2 ring-emerald-400', 'Marco Esmeralda', 'Un marco para tu avatar.', 400, 'rare'),
  ('frame_violet', 'frame', 'ring-2 ring-violet-400', 'Marco Violeta', 'Un marco para tu avatar.', 400, 'rare'),
  ('frame_gold', 'frame', 'ring-4 ring-amber-400', 'Marco Dorado', 'Un marco para tu avatar.', 900, 'epic'),
  ('frame_legendary', 'frame', 'ring-4 ring-fuchsia-400 shadow-[0_0_20px_6px_rgba(217,70,239,0.5)]', 'Marco Legendario', 'Un marco para tu avatar.', 2000, 'legendary');
