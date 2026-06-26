
-- =====================================================
-- MIGRACIÓN DE DATOS: Lecciones existentes → Nuevo sistema de módulos
-- =====================================================

-- Paso 1: Crear módulos únicos desde el campo texto 'modulo' de lecciones
WITH module_first_orden AS (
  SELECT 
    curso_id,
    modulo,
    MIN(orden) as first_orden
  FROM lecciones
  WHERE modulo IS NOT NULL 
    AND modulo != ''
    AND modulo_id IS NULL
  GROUP BY curso_id, modulo
),
module_with_order AS (
  SELECT 
    curso_id,
    modulo,
    ROW_NUMBER() OVER (PARTITION BY curso_id ORDER BY first_orden, modulo) - 1 as order_index
  FROM module_first_orden
)
INSERT INTO modulos (curso_id, titulo, slug, order_index)
SELECT 
  m.curso_id,
  m.modulo as titulo,
  generate_slug(m.modulo) as slug,
  m.order_index
FROM module_with_order m
WHERE NOT EXISTS (
  SELECT 1 FROM modulos existing 
  WHERE existing.curso_id = m.curso_id 
  AND existing.slug = generate_slug(m.modulo)
);

-- Paso 2: Vincular lecciones con sus módulos
UPDATE lecciones l
SET modulo_id = m.id
FROM modulos m
WHERE l.curso_id = m.curso_id
  AND generate_slug(l.modulo) = m.slug
  AND l.modulo_id IS NULL;

-- Paso 3: Calcular order_index de lecciones dentro de cada módulo
WITH ordered_lessons AS (
  SELECT 
    l.id,
    ROW_NUMBER() OVER (
      PARTITION BY l.modulo_id 
      ORDER BY l.orden, l.fecha_creacion
    ) - 1 as new_order_index
  FROM lecciones l
  WHERE l.modulo_id IS NOT NULL
)
UPDATE lecciones l
SET order_index = ol.new_order_index
FROM ordered_lessons ol
WHERE l.id = ol.id;

-- Paso 4: Generar slugs únicos para lecciones con slugs genéricos/duplicados
WITH ranked_lessons AS (
  SELECT 
    l.id,
    l.titulo,
    l.slug as old_slug,
    l.modulo_id,
    l.orden,
    l.fecha_creacion,
    ROW_NUMBER() OVER (
      PARTITION BY l.modulo_id, generate_slug(l.titulo)
      ORDER BY l.orden, l.fecha_creacion
    ) as rn
  FROM lecciones l
  WHERE l.modulo_id IS NOT NULL
)
UPDATE lecciones l
SET slug = CASE 
  WHEN rl.rn = 1 THEN generate_slug(l.titulo)
  ELSE generate_slug(l.titulo) || '-' || rl.rn
END
FROM ranked_lessons rl
WHERE l.id = rl.id
  AND (l.slug IS NULL 
    OR l.slug = '' 
    OR l.slug IN ('Information', 'Listening', 'Use of english', 'Grammar', 'Reading', 'Writing', 'Speaking'));

-- Paso 5: Recalcular order_index de módulos para asegurar secuencia 0,1,2...
WITH ordered_modules AS (
  SELECT 
    m.id,
    ROW_NUMBER() OVER (
      PARTITION BY m.curso_id 
      ORDER BY m.order_index, m.fecha_creacion
    ) - 1 as new_order_index
  FROM modulos m
)
UPDATE modulos m
SET order_index = om.new_order_index
FROM ordered_modules om
WHERE m.id = om.id;
