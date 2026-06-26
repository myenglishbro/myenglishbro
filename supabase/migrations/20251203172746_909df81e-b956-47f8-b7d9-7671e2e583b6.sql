-- Agregar columna metodo_pago a matriculas
ALTER TABLE public.matriculas ADD COLUMN IF NOT EXISTS metodo_pago text;

-- Comentario para documentar los valores permitidos
COMMENT ON COLUMN public.matriculas.metodo_pago IS 'Método de pago: yape, plin, transferencia, paypal';