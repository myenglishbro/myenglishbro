-- Crear registro en la tabla usuarios para el admin
INSERT INTO usuarios (id, email, nombre)
VALUES (
  '6ebfca11-e452-4ec5-aa59-9ec12e38dfa5',
  'carlos.apolaya@upch.pe',
  'Carlos'
) ON CONFLICT (id) DO NOTHING;

-- Asignar rol admin
INSERT INTO user_roles (user_id, role)
VALUES (
  '6ebfca11-e452-4ec5-aa59-9ec12e38dfa5',
  'admin'
) ON CONFLICT (user_id, role) DO NOTHING;