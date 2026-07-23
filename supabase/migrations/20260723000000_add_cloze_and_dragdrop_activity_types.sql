-- Adds Cambridge-style Use of English cloze types and drag-and-drop activity types.
-- multiple_choice_cloze: Cambridge Part 1 (4-option cloze)
-- open_cloze: Cambridge Part 2 (no-option cloze)
-- word_formation: Cambridge Part 3 (root-word cloze)
-- drag_drop_gapfill / drag_drop_reorder / drag_drop_categorize: drag-and-drop interactions
ALTER TYPE public.activity_type ADD VALUE IF NOT EXISTS 'multiple_choice_cloze';
ALTER TYPE public.activity_type ADD VALUE IF NOT EXISTS 'open_cloze';
ALTER TYPE public.activity_type ADD VALUE IF NOT EXISTS 'word_formation';
ALTER TYPE public.activity_type ADD VALUE IF NOT EXISTS 'drag_drop_gapfill';
ALTER TYPE public.activity_type ADD VALUE IF NOT EXISTS 'drag_drop_reorder';
ALTER TYPE public.activity_type ADD VALUE IF NOT EXISTS 'drag_drop_categorize';
