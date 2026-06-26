-- Drop the existing check constraint and add a new one that includes 'prueba'
ALTER TABLE public.matriculas 
DROP CONSTRAINT IF EXISTS matriculas_tipo_pago_check;

ALTER TABLE public.matriculas 
ADD CONSTRAINT matriculas_tipo_pago_check 
CHECK (tipo_pago IN ('unico', 'mensual', 'prueba'));