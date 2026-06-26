-- Adds discount tickets to the Word Survivor shop, purchasable with coins
-- via the existing purchase_word_survivor_item RPC (no new tables needed).

ALTER TABLE public.word_survivor_shop_items DROP CONSTRAINT IF EXISTS word_survivor_shop_items_category_check;
ALTER TABLE public.word_survivor_shop_items ADD CONSTRAINT word_survivor_shop_items_category_check
  CHECK (category IN ('avatar','title','frame','voucher'));

INSERT INTO public.word_survivor_shop_items (item_id, category, value, label, description, price, rarity) VALUES
  ('voucher_s10', 'voucher', 'S/ 10', 'Ticket S/10 de descuento', 'Canjéalo con tu asesor para tu próxima compra o matrícula.', 600, 'rare'),
  ('voucher_s20', 'voucher', 'S/ 20', 'Ticket S/20 de descuento', 'Canjéalo con tu asesor para tu próxima compra o matrícula.', 1200, 'epic');
