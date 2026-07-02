ALTER TABLE public.salon_entregas
  ADD CONSTRAINT salon_entregas_actividad_id_estudiante_id_key
  UNIQUE (actividad_id, estudiante_id);
