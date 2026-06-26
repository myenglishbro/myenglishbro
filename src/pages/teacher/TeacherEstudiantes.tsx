import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useTeacherRole } from "@/hooks/useTeacherRole";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, ChevronLeft } from "lucide-react";

const TeacherEstudiantes = () => {
  const { salonId } = useParams<{ salonId: string }>();
  const { user } = useAuth();
  const { isAdmin, isLoading: roleLoading } = useTeacherRole();

  const { data: salon } = useQuery({
    queryKey: ["teacher-salon-detail", salonId],
    queryFn: async () => {
      const { data } = await supabase
        .from("salones")
        .select("id, nombre, teacher_id")
        .eq("id", salonId!)
        .single();
      return data;
    },
    enabled: !!salonId,
  });

  const { data: estudiantes = [], isLoading } = useQuery({
    queryKey: ["teacher-salon-estudiantes", salonId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("salon_estudiantes")
        .select("*, usuarios(nombre)")
        .eq("salon_id", salonId!)
        .order("fecha_asignacion", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!salonId,
  });

  const isOwner = isAdmin || salon?.teacher_id === user?.id;

  if (!salon || roleLoading) return null;

  if (!isOwner) {
    return (
      <div className="p-8 text-center py-20">
        <p className="text-muted-foreground">No tienes acceso a este salón.</p>
        <Link to="/teacher" className="text-primary text-sm mt-2 inline-block hover:underline">← Volver</Link>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/teacher">
          <Button variant="ghost" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Estudiantes</h1>
          <p className="text-muted-foreground mt-0.5">{salon.nombre}</p>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3" />
          <p className="text-muted-foreground">Cargando estudiantes...</p>
        </div>
      ) : estudiantes.length === 0 ? (
        <div className="text-center py-20">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No hay estudiantes asignados a este salón aún.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {estudiantes.map((est) => {
            const usuario = est.usuarios as { nombre: string | null } | null;
            return (
              <Card key={est.id} className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-primary font-semibold text-sm">
                      {(usuario?.nombre || "?").charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">{usuario?.nombre || "Estudiante"}</p>
                  </div>
                  <div className="text-xs text-muted-foreground shrink-0">
                    Desde {new Date(est.fecha_asignacion).toLocaleDateString("es-PE")}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TeacherEstudiantes;
