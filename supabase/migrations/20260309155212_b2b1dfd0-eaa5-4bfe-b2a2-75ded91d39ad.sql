
ALTER TABLE public.programas_en_vivo
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS imagen_url text,
  ADD COLUMN IF NOT EXISTS descripcion_completa text,
  ADD COLUMN IF NOT EXISTS syllabus jsonb,
  ADD COLUMN IF NOT EXISTS whatsapp_url text,
  ADD COLUMN IF NOT EXISTS imagen_promocional_url text;

-- Generate slugs for existing rows
UPDATE public.programas_en_vivo
SET slug = generate_slug(nombre)
WHERE slug IS NULL;

-- Make slug unique and not null after populating
ALTER TABLE public.programas_en_vivo
  ALTER COLUMN slug SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS programas_en_vivo_slug_key ON public.programas_en_vivo (slug);
