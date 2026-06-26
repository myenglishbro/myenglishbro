import { useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface LessonProgress {
  leccion_id: string;
  completado: boolean;
  completed_at: string | null;
}

export const useDbCourseProgress = (courseId?: string, userId?: string) => {
  const queryClient = useQueryClient();
  const queryKey = ["lesson-progress", courseId, userId];

  // Fetch all progress for this course's lessons
  const { data: progressData = [], isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!courseId || !userId) return [];

      // Get lesson IDs for this course
      const { data: lessons } = await supabase
        .from("lecciones")
        .select("id")
        .eq("curso_id", courseId);

      if (!lessons || lessons.length === 0) return [];

      const lessonIds = lessons.map((l) => l.id);

      const { data, error } = await supabase
        .from("progreso_lecciones")
        .select("leccion_id, completado, completed_at")
        .eq("usuario_id", userId)
        .in("leccion_id", lessonIds);

      if (error) throw error;
      return (data as LessonProgress[]) || [];
    },
    enabled: !!courseId && !!userId,
  });

  // Toggle lesson completion
  const toggleMutation = useMutation({
    mutationFn: async ({
      lessonId,
      completed,
    }: {
      lessonId: string;
      completed: boolean;
    }) => {
      if (!userId) throw new Error("No user");

      const { error } = await supabase.from("progreso_lecciones").upsert(
        {
          usuario_id: userId,
          leccion_id: lessonId,
          completado: completed,
          completed_at: completed ? new Date().toISOString() : null,
        },
        { onConflict: "usuario_id,leccion_id" }
      );

      if (error) throw error;
    },
    onMutate: async ({ lessonId, completed }) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<LessonProgress[]>(queryKey);

      queryClient.setQueryData<LessonProgress[]>(queryKey, (old = []) => {
        const existing = old.find((p) => p.leccion_id === lessonId);
        if (existing) {
          return old.map((p) =>
            p.leccion_id === lessonId
              ? {
                  ...p,
                  completado: completed,
                  completed_at: completed ? new Date().toISOString() : null,
                }
              : p
          );
        }
        return [
          ...old,
          {
            leccion_id: lessonId,
            completado: completed,
            completed_at: completed ? new Date().toISOString() : null,
          },
        ];
      });

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const isLessonCompleted = useCallback(
    (lessonId: string): boolean => {
      return progressData.some(
        (p) => p.leccion_id === lessonId && p.completado
      );
    },
    [progressData]
  );

  const toggleLesson = useCallback(
    (lessonId: string) => {
      const current = isLessonCompleted(lessonId);
      toggleMutation.mutate({ lessonId, completed: !current });
    },
    [isLessonCompleted, toggleMutation]
  );

  const getCompletedCount = useCallback(
    (lessonIds: string[]): number => {
      return progressData.filter(
        (p) => p.completado && lessonIds.includes(p.leccion_id)
      ).length;
    },
    [progressData]
  );

  const getProgressPercentage = useCallback(
    (lessonIds: string[]): number => {
      if (lessonIds.length === 0) return 0;
      const done = getCompletedCount(lessonIds);
      return Math.round((done / lessonIds.length) * 100);
    },
    [getCompletedCount]
  );

  return {
    progressData,
    isLoading,
    isLessonCompleted,
    toggleLesson,
    getCompletedCount,
    getProgressPercentage,
    isToggling: toggleMutation.isPending,
  };
};
