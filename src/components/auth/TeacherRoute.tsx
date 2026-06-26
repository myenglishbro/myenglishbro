import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTeacherRole } from "@/hooks/useTeacherRole";

export const TeacherRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { isTeacher, isLoading: roleLoading } = useTeacherRole();

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth?tab=login" replace />;
  }

  if (!isTeacher) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
