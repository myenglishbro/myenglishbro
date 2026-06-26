-- Fix generate_slug function to set search_path for security
DROP FUNCTION IF EXISTS public.generate_slug(text);

CREATE OR REPLACE FUNCTION public.generate_slug(title TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  RETURN lower(regexp_replace(
    regexp_replace(
      regexp_replace(
        unaccent(trim(title)),
        '[^a-zA-Z0-9\s-]', '', 'g'
      ),
      '\s+', '-', 'g'
    ),
    '-+', '-', 'g'
  ));
END;
$$;