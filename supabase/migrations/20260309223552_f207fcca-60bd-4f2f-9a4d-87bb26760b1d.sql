-- Move unaccent extension from public to extensions schema
CREATE SCHEMA IF NOT EXISTS extensions;

-- Move the extension
ALTER EXTENSION unaccent SET SCHEMA extensions;

-- Update the generate_slug function to reference the new schema
CREATE OR REPLACE FUNCTION public.generate_slug(title text)
 RETURNS text
 LANGUAGE plpgsql
 IMMUTABLE
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN lower(regexp_replace(
    regexp_replace(
      regexp_replace(
        extensions.unaccent(trim(title)),
        '[^a-zA-Z0-9\s-]', '', 'g'
      ),
      '\s+', '-', 'g'
    ),
    '-+', '-', 'g'
  ));
END;
$function$;