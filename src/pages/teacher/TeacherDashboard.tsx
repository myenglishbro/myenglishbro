import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useTeacherRole } from "@/hooks/useTeacherRole";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, School, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

type Salon = {
  id: string;
  nombre: string;
  descripcion: string | null;
  imagen_url: string | null;
  activo: boolean;
  cursos: { titulo: string } | null;
};

const SalonCard = ({ salon }: { salon: Salon }) => {
  const { data: estudiantesCount = 0 } = useQuery({
    queryKey: ["teacher-estudiantes-count", salon.id],
    queryFn: async () => {
      const { count } = await supabase
        .from("salon_estudiantes")
        .select("*", { count: "exact", head: true })
        .eq("salon_id", salon.id);
      return count ?? 0;
    },
  });

  const { data: leccionesCount = 0 } = useQuery({
    queryKey: ["teacher-lecciones-count", salon.id],
    queryFn: async () => {
      const { count } = await supabase
        .from("salon_lecciones")
        .select("*", { count: "exact", head: true })
        .eq("salon_id", salon.id);
      return count ?? 0;
    },
  });

  return (
    <Card className="hover:shadow-md transition-shadow overflow-hidden">
      {/* Cover image */}
      <div className="relative h-32 bg-gradient-to-br from-primary/10 to-indigo-100 flex items-center justify-center">
        {salon.imagen_url ? (
          <img
            src={salon.imagen_url}
            alt={salon.nombre}
            className="w-full h-full object-cover"
          />
        ) : (
          <School className="h-10 w-10 text-primary/30" />
        )}
      </div>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-base">{salon.nombre}</CardTitle>
          <ChevronRight className="h-4 w-4 text-muted-foreground mt-0.5" />
        </div>
        {salon.descripcion && (
          <p className="text-sm text-muted-foreground">{salon.descripcion}</p>
        )}
        {salon.cursos && (
          <p className="text-xs text-primary">Basado en: {salon.cursos.titulo}</p>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex gap-4">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{estudiantesCount} estudiantes</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <BookOpen className="h-4 w-4" />
            <span>{leccionesCount} lecciones</span>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <Link
            to={`/teacher/salon/${salon.id}`}
            className="text-sm font-medium text-primary hover:underline"
          >
            Gestionar contenido →
          </Link>
          <span className="text-muted-foreground">·</span>
          <Link
            to={`/teacher/estudiantes/${salon.id}`}
            className="text-sm font-medium text-muted-foreground hover:text-foreground hover:underline"
          >
            Ver estudiantes
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

const TeacherDashboard = () => {
  const { user } = useAuth();
  const { isAdmin } = useTeacherRole();

  const { data: salones = [], isLoading } = useQuery({
    queryKey: ["teacher-salones", user?.id, isAdmin],
    queryFn: async () => {
      let query = supabase
        .from("salones")
        .select("id, nombre, descripcion, imagen_url, activo, cursos(titulo)")
        .eq("activo", true)
        .order("fecha_creacion", { ascending: true });
      if (!isAdmin) query = query.eq("teacher_id", user!.id);
      const { data, error } = await query;
      if (error) throw error;
      return data as Salon[];
    },
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (salones.length === 0) {
    return (
      <div className="p-8">
        <div className="max-w-lg mx-auto text-center py-20">
          <School className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Sin salones asignados</h2>
          <p className="text-muted-foreground">
            El administrador aún no te ha asignado ningún salón. Contacta al administrador.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Panel Docente</h1>
        <p className="text-muted-foreground mt-1">
          Tienes {salones.length} salón{salones.length !== 1 ? "es" : ""} asignado{salones.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {salones.map((salon) => (
          <SalonCard key={salon.id} salon={salon} />
        ))}
      </div>
    </div>
  );
};

export default TeacherDashboard;
