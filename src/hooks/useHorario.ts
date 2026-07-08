import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type HorarioSlot = {
  id: string;
  dia_semana: number;
  hora_inicio: number;
  disponible: boolean;
  etiqueta: string | null;
};

export const HORARIO_QUERY_KEY = ["mb-horario"] as const;

export const useHorarioQuery = () => {
  return useQuery({
    queryKey: HORARIO_QUERY_KEY,
    queryFn: async (): Promise<HorarioSlot[]> => {
      const { data, error } = await supabase
        .from("mb_disponibilidad_horario")
        .select("id, dia_semana, hora_inicio, disponible, etiqueta")
        .order("dia_semana", { ascending: true })
        .order("hora_inicio", { ascending: true });
      if (error) throw error;
      return data;
    },
  });
};

export const useUpdateHorarioSlot = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ id, disponible, etiqueta }: { id: string; disponible: boolean; etiqueta: string | null }) => {
      const { error } = await supabase
        .from("mb_disponibilidad_horario")
        .update({ disponible, etiqueta, updated_at: new Date().toISOString(), updated_by: user?.id })
        .eq("id", id);
      if (error) throw error;
    },
    onMutate: async ({ id, disponible, etiqueta }) => {
      await queryClient.cancelQueries({ queryKey: HORARIO_QUERY_KEY });
      const previous = queryClient.getQueryData<HorarioSlot[]>(HORARIO_QUERY_KEY);
      queryClient.setQueryData<HorarioSlot[]>(HORARIO_QUERY_KEY, (old) =>
        old?.map((slot) => (slot.id === id ? { ...slot, disponible, etiqueta } : slot))
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(HORARIO_QUERY_KEY, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: HORARIO_QUERY_KEY });
    },
  });
};
