-- Adds two new activity types: multiple_choice (auto-graded, like fill_blanks/matching)
-- and open_questions (short open-ended answers, manually graded by the teacher like writing).
ALTER TYPE public.activity_type ADD VALUE IF NOT EXISTS 'multiple_choice';
ALTER TYPE public.activity_type ADD VALUE IF NOT EXISTS 'open_questions';
