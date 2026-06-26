import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type AdminRoleType = "admin" | "content_admin" | null;

export const useAdminRole = () => {
  const { user } = useAuth();

  const { data: adminRole, isLoading } = useQuery({
    queryKey: ["admin-role-type", user?.id],
    queryFn: async (): Promise<AdminRoleType> => {
      if (!user?.id) return null;

      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .in("role", ["admin", "content_admin"]);

      if (!data || data.length === 0) return null;

      // admin takes priority over content_admin
      const roles = data.map((r) => r.role);
      if (roles.includes("admin")) return "admin";
      if (roles.includes("content_admin")) return "content_admin";
      return null;
    },
    enabled: !!user?.id,
  });

  return {
    adminRole: adminRole ?? null,
    isAdmin: adminRole === "admin",
    isContentAdmin: adminRole === "content_admin",
    isAnyAdmin: adminRole === "admin" || adminRole === "content_admin",
    isLoading,
  };
};
