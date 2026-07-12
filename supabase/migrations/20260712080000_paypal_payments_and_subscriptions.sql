-- Nuevo modelo de precios: cada curso es solo pago único (soles o USD vía PayPal)
UPDATE public.cursos
SET precio_unico_soles = 200,
    precio_usd = 60,
    precio_mensual_soles = NULL;

-- Suscripción mensual "Acceso Completo" (acceso a todos los cursos mientras esté activa)
CREATE TABLE public.suscripciones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL REFERENCES public.usuarios(id),
  pago_id uuid REFERENCES public.pagos(id),
  metodo_pago text,
  estado text NOT NULL DEFAULT 'activa',
  fecha_inicio timestamptz NOT NULL DEFAULT now(),
  fecha_fin timestamptz NOT NULL,
  fecha_creacion timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.suscripciones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios ven su propia suscripcion"
  ON public.suscripciones
  FOR SELECT
  USING (auth.uid() = usuario_id);

CREATE POLICY "Admin gestiona suscripciones"
  ON public.suscripciones
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Precio único de la suscripción (fuente de verdad compartida por frontend y Edge Functions)
CREATE TABLE public.suscripcion_config (
  id boolean PRIMARY KEY DEFAULT true CHECK (id),
  precio_soles numeric NOT NULL,
  precio_usd numeric NOT NULL
);

INSERT INTO public.suscripcion_config (precio_soles, precio_usd) VALUES (65, 20);

ALTER TABLE public.suscripcion_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cualquiera lee el precio de suscripcion"
  ON public.suscripcion_config
  FOR SELECT
  USING (true);

-- has_active_enrollment ahora también reconoce una suscripción activa (acceso a todos los cursos)
CREATE OR REPLACE FUNCTION public.has_active_enrollment(_user_id uuid, _curso_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.matriculas
    WHERE usuario_id = _user_id
    AND curso_id = _curso_id
    AND estado = 'activa'
    AND (fecha_fin IS NULL OR fecha_fin > now())
  )
  OR EXISTS (
    SELECT 1
    FROM public.suscripciones
    WHERE usuario_id = _user_id
    AND estado = 'activa'
    AND fecha_fin > now()
  )
$$;
