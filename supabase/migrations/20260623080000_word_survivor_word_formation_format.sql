-- Adds "word_formation" as a 4th question format (Cambridge Use of English Part 3 style:
-- a sentence with a gap plus a root word in caps that must be transformed to fit it).
-- Reuses the existing key_word column for the root word and accepted_answers for the
-- derived word(s); transform_prompt stays NULL since there's only one sentence.

ALTER TABLE public.word_survivor_questions DROP CONSTRAINT word_survivor_questions_format_check;
ALTER TABLE public.word_survivor_questions ADD CONSTRAINT word_survivor_questions_format_check
  CHECK (format = ANY (ARRAY['multiple_choice'::text, 'cloze'::text, 'key_word_transformation'::text, 'word_formation'::text]));

ALTER TABLE public.word_survivor_questions DROP CONSTRAINT word_survivor_questions_format_fields_check;
ALTER TABLE public.word_survivor_questions ADD CONSTRAINT word_survivor_questions_format_fields_check
  CHECK (
    ((format = 'multiple_choice'::text) AND (options IS NOT NULL) AND (correct_index IS NOT NULL))
    OR ((format = 'cloze'::text) AND (accepted_answers IS NOT NULL) AND (array_length(accepted_answers, 1) > 0))
    OR ((format = 'key_word_transformation'::text) AND (accepted_answers IS NOT NULL) AND (array_length(accepted_answers, 1) > 0) AND (key_word IS NOT NULL) AND (transform_prompt IS NOT NULL))
    OR ((format = 'word_formation'::text) AND (accepted_answers IS NOT NULL) AND (array_length(accepted_answers, 1) > 0) AND (key_word IS NOT NULL))
  );
