import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useTeacherRole = () => {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["teacher-role", user?.id],
    queryFn: async () => {
      if (!user?.id) return { isTeacher: false, isAdmin: false };
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .in("role", ["teacher", "admin"]);
      const roles = data?.map((r) => r.role) ?? [];
      return {
        isTeacher: roles.includes("teacher") || roles.includes("admin"),
        isAdmin: roles.includes("admin"),
      };
    },
    enabled: !!user?.id,
  });

  return {
    isTeacher: data?.isTeacher ?? false,
    isAdmin: data?.isAdmin ?? false,
    isLoading,
  };
};
