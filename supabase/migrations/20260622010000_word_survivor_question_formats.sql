-- Adds exercise formats beyond multiple choice to Word Survivor: cloze (gap-fill, free text)
-- and key_word_transformation (Cambridge-style sentence rewrite using a given keyword).
-- Existing rows default to 'multiple_choice' and are unaffected.

ALTER TABLE public.word_survivor_questions
  ADD COLUMN format text NOT NULL DEFAULT 'multiple_choice'
    CHECK (format IN ('multiple_choice', 'cloze', 'key_word_transformation')),
  ADD COLUMN accepted_answers text[],
  ADD COLUMN key_word text,
  ADD COLUMN transform_prompt text;

ALTER TABLE public.word_survivor_questions ALTER COLUMN options DROP NOT NULL;
ALTER TABLE public.word_survivor_questions ALTER COLUMN correct_index DROP NOT NULL;

ALTER TABLE public.word_survivor_questions
  ADD CONSTRAINT word_survivor_questions_format_fields_check CHECK (
    (format = 'multiple_choice' AND options IS NOT NULL AND correct_index IS NOT NULL)
    OR (format = 'cloze' AND accepted_answers IS NOT NULL AND array_length(accepted_answers, 1) > 0)
    OR (format = 'key_word_transformation' AND accepted_answers IS NOT NULL
        AND array_length(accepted_answers, 1) > 0 AND key_word IS NOT NULL AND transform_prompt IS NOT NULL)
  );

-- Sample content so the new formats are playable immediately (mini-boss: cloze, boss: cloze + KWT).
insert into public.word_survivor_terms (id, term, meaning, example_sentence, level, type) values
  ('4b2616a8-be00-4377-91b2-3bd43b704a29', 'generous', '''Generous'' means willing to give and share freely.', 'He is very generous with his time and money.', 'B1', 'vocabulary'),
  ('eba2349b-0be6-4acf-939d-99e8226cb3c8', 'look up to', '''Look up to'' means to admire and respect someone as a role model.', 'Many young athletes look up to their coach.', 'B2', 'phrasal_verb'),
  ('82acce25-7b57-4c3d-a6bc-c6fe6491eb0b', 'need', '''Don''t need to'' expresses a lack of obligation.', 'You don''t need to finish the report today.', 'B2', 'grammar'),
  ('9feed49a-1aec-4e42-b27f-494fb7613d75', 'never', 'Inversion with ''Never'' + had + subject + past participle emphasizes a negative experience.', 'Never had he felt so embarrassed before.', 'C1', 'grammar');

insert into public.word_survivor_questions
  (id, term_id, level, type, difficulty, format, prompt, accepted_answers, key_word, transform_prompt, tip, tags) values
  (
    '1479fae9-a3f6-44cc-8ce0-b5e6932e664b', '4b2616a8-be00-4377-91b2-3bd43b704a29', 'B1', 'vocabulary', 2, 'cloze',
    'She is very ___ ; she always shares her lunch with classmates.',
    ARRAY['generous']::text[], null, null,
    '''Generous'' means willing to give freely.', ARRAY['b1', 'vocabulary', 'cloze']::text[]
  ),
  (
    'c67e5465-4405-4346-89aa-72d3fb338a92', 'eba2349b-0be6-4acf-939d-99e8226cb3c8', 'B2', 'phrasal_verb', 3, 'cloze',
    'Many young athletes ___ their coach as a role model.',
    ARRAY['look up to']::text[], null, null,
    '''Look up to'' means to admire someone as a role model.', ARRAY['b2', 'phrasal_verb', 'cloze']::text[]
  ),
  (
    '775408fe-a8ba-4605-8bde-8cbd14e15cbc', '82acce25-7b57-4c3d-a6bc-c6fe6491eb0b', 'B2', 'grammar', 3, 'key_word_transformation',
    'It isn''t necessary for you to finish the report today.',
    ARRAY['don''t need to finish', 'do not need to finish']::text[], 'NEED', 'You ___ the report today.',
    '''Don''t need to'' expresses lack of obligation, the same meaning as ''isn''t necessary''.', ARRAY['b2', 'grammar', 'key-word-transformation']::text[]
  ),
  (
    'e1b5b3af-492c-4a20-b506-2b212a5d6917', '9feed49a-1aec-4e42-b27f-494fb7613d75', 'C1', 'grammar', 4, 'key_word_transformation',
    'He had never felt so embarrassed before.',
    ARRAY['never had he felt', 'never before had he felt']::text[], 'NEVER', '___ so embarrassed before.',
    'Inversion with ''Never'' + had + subject + past participle emphasizes a negative experience.', ARRAY['c1', 'grammar', 'key-word-transformation']::text[]
  );
