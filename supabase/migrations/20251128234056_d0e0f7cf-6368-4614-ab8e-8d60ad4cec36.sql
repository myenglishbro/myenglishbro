-- Agregar campo precio_usd a la tabla cursos
ALTER TABLE cursos ADD COLUMN IF NOT EXISTS precio_usd NUMERIC(10,2);

-- Agregar campos de PayPal a la tabla pagos
ALTER TABLE pagos 
  ADD COLUMN IF NOT EXISTS paypal_order_id TEXT,
  ADD COLUMN IF NOT EXISTS paypal_capture_id TEXT;

-- Insertar los 3 cursos con sus precios
INSERT INTO cursos (nivel, titulo, slug, descripcion, precio_usd, activo) VALUES
('B2', 'Inglés Intermedio Alto', 'b2-intermedio-alto', 'Domina el inglés B2 para comunicación profesional', 79.00, true),
('C1', 'Inglés Avanzado', 'c1-avanzado', 'Alcanza fluidez avanzada en inglés profesional', 89.00, true),
('C2', 'Maestría en Inglés', 'c2-maestria', 'Perfecciona tu inglés al nivel nativo', 99.00, true)
ON CONFLICT (slug) DO UPDATE SET
  precio_usd = EXCLUDED.precio_usd,
  descripcion = EXCLUDED.descripcion;