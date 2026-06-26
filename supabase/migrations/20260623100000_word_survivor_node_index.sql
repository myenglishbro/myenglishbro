-- Each Word Survivor node (1-12 per level) gets its own curated set of questions instead
-- of every battle/miniboss/treasure node in a level sharing one giant shuffled pool. The
-- admin panel assigns node_index per question going forward; this backfills existing rows
-- with a round-robin spread so no node is left empty.

ALTER TABLE public.word_survivor_questions
  ADD COLUMN node_index smallint CHECK (node_index BETWEEN 1 AND 12);

CREATE INDEX idx_word_survivor_questions_node_index ON public.word_survivor_questions (level, node_index);

WITH numbered AS (
  SELECT id, row_number() OVER (PARTITION BY level ORDER BY id) AS rn
  FROM public.word_survivor_questions
)
UPDATE public.word_survivor_questions q
SET node_index = ((n.rn - 1) % 12) + 1
FROM numbered n
WHERE q.id = n.id;

-- Node 12 is always the world's final boss, which is meant to demand typed answers only
-- (see FORMATS_BY_NODE_KIND in questions.ts) -- bump any multiple_choice question that
-- landed there to an earlier node so the backfilled boss node stays typed-only.
WITH bumped AS (
  SELECT id, row_number() OVER (PARTITION BY level ORDER BY id) AS rn
  FROM public.word_survivor_questions
  WHERE node_index = 12 AND format = 'multiple_choice'
)
UPDATE public.word_survivor_questions q
SET node_index = ((b.rn - 1) % 11) + 1
FROM bumped b
WHERE q.id = b.id;
