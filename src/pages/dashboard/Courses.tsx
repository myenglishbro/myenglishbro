import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, PlayCircle, Lock, ArrowRight, Clock, MessageCircle, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const whatsappLink = "https://wa.link/e86mee";

const getTimeRemaining = (fechaFin: string) => {
  const diff = new Date(fechaFin).getTime() - Date.now();
  if (diff <= 0) return null;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 0) return `${hours}h ${minutes}m restantes`;
  return `${minutes}m restantes`;
};

const Courses = () => {
  const { user } = useAuth();

  const { data: enrolledCourses, isLoading } = useQuery({
    queryKey: ["enrolled-courses", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("matriculas")
        .select(`
          id,
          estado,
          fecha_inicio,
          fecha_fin,
          tipo_pago,
          curso:cursos(
            id,
            nivel,
            titulo,
            descripcion,
            slug
          )
        `)
        .eq("usuario_id", user.id)
        .eq("estado", "activa");

      if (error) throw error;

      const now = new Date();
      return data.filter((enrollment: any) => {
        if (!enrollment.fecha_fin) return true;
        return new Date(enrollment.fecha_fin) > now;
      });
    },
    enabled: !!user?.id,
  });

  const getLevelStyles = (nivel: string) => {
    const styles: Record<string, { bg: string; text: string; border: string; gradient: string }> = {
      "A1": { bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-200", gradient: "from-emerald-500 to-emerald-600" },
      "A2": { bg: "bg-teal-100", text: "text-teal-700", border: "border-teal-200", gradient: "from-teal-500 to-teal-600" },
      "B1": { bg: "bg-cyan-100", text: "text-cyan-700", border: "border-cyan-200", gradient: "from-cyan-500 to-cyan-600" },
      "B2": { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-200", gradient: "from-blue-500 to-blue-600" },
      "C1": { bg: "bg-indigo-100", text: "text-indigo-700", border: "border-indigo-200", gradient: "from-indigo-500 to-indigo-600" },
      "C2": { bg: "bg-violet-100", text: "text-violet-700", border: "border-violet-200", gradient: "from-violet-500 to-violet-600" },
    };
    return styles[nivel] || { bg: "bg-slate-100", text: "text-slate-700", border: "border-slate-200", gradient: "from-slate-500 to-slate-600" };
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-slate-200 rounded-xl w-1/4"></div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-72 bg-slate-200 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!enrolledCourses || enrolledCourses.length === 0) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800 font-display mb-2">Mis Cursos</h1>
          <p className="text-slate-500">Accede a tus cursos de inglés avanzado</p>
        </div>
        <div className="dashboard-card p-12 text-center animate-fade-in-up">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="h-10 w-10 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 font-display mb-3">
            No tienes cursos activos
          </h3>
          <p className="text-slate-500 mb-6 max-w-md mx-auto">
            Adquiere un curso o activa una prueba gratuita de 24 horas para empezar a aprender inglés
          </p>
          <Link to="/store">
            <Button className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl shadow-primary">
              <BookOpen className="h-4 w-4 mr-2" />
              Ver cursos disponibles
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 font-display mb-2">Mis Cursos</h1>
        <p className="text-slate-500">
          Accede a todos tus cursos de inglés avanzado
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {enrolledCourses.map((enrollment: any, index: number) => {
          const course = enrollment.curso;
          if (!course) return null;

          const levelStyles = getLevelStyles(course.nivel);
          const isTrial = enrollment.tipo_pago === "prueba";
          const timeRemaining = isTrial && enrollment.fecha_fin ? getTimeRemaining(enrollment.fecha_fin) : null;
          const isUrgent = isTrial && enrollment.fecha_fin
            ? new Date(enrollment.fecha_fin).getTime() - Date.now() < 2 * 60 * 60 * 1000
            : false;

          return (
            <div
              key={enrollment.id}
              className="dashboard-card overflow-hidden group animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Header with gradient */}
              <div className={`h-24 bg-gradient-to-br ${levelStyles.gradient} relative`}>
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                  <Badge className="bg-white/20 backdrop-blur-sm text-white border-0 font-bold text-sm px-3 py-1">
                    {course.nivel}
                  </Badge>
                  {isTrial ? (
                    <Badge className={`${isUrgent ? "bg-red-500" : "bg-amber-500"} text-white border-0 text-xs`}>
                      <Clock className="h-3 w-3 mr-1" />
                      Prueba
                    </Badge>
                  ) : (
                    <Badge className="bg-emerald-500 text-white border-0 text-xs">
                      Activo
                    </Badge>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-lg font-bold text-slate-800 font-display mb-2 group-hover:text-primary transition-colors">
                  {course.titulo}
                </h3>

                {course.descripcion && (
                  <p className="text-sm text-slate-500 mb-4 line-clamp-2">{course.descripcion}</p>
                )}

                {/* Trial countdown */}
                {isTrial && timeRemaining && (
                  <div className={`flex items-center gap-2 p-2.5 rounded-lg mb-4 ${isUrgent ? "bg-red-50 border border-red-200" : "bg-amber-50 border border-amber-200"}`}>
                    {isUrgent ? (
                      <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
                    ) : (
                      <Clock className="h-4 w-4 text-amber-600 flex-shrink-0" />
                    )}
                    <span className={`text-xs font-semibold ${isUrgent ? "text-red-700" : "text-amber-700"}`}>
                      {timeRemaining}
                    </span>
                  </div>
                )}

                <Link to={`/courses/${course.id}`}>
                  <Button className="w-full bg-slate-800 hover:bg-slate-900 text-white rounded-xl group-hover:bg-primary transition-colors mb-3">
                    <PlayCircle className="h-5 w-5 mr-2" />
                    Ver curso
                    <ArrowRight className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Button>
                </Link>

                {/* CTA to upgrade trial */}
                {isTrial && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50"
                    onClick={() => window.open(whatsappLink, "_blank")}
                  >
                    <MessageCircle className="h-3 w-3 mr-1.5" />
                    Comprar acceso completo
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Courses;
