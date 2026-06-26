import { Button } from "@/components/ui/button";
import { BookOpen, Lock, MessageCircle } from "lucide-react";
import { AnnouncementsCarousel } from "@/components/dashboard/AnnouncementsCarousel";
import { WordSurvivorLauncher } from "@/components/dashboard/word-survivor/WordSurvivorLauncher";
import { SalonesGrid } from "@/components/dashboard/SalonesGrid";
import { CursosActivosList } from "@/components/dashboard/CursosActivosList";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const Dashboard = () => {
  const { user } = useAuth();

  // Fetch enrolled courses to check if user has any active enrollment
  const { data: enrolledCourses, isLoading } = useQuery({
    queryKey: ["dashboard-enrollments", user?.id],
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

      // Ocultar accesos vencidos (si fecha_fin ya pasó)
      const now = new Date();
      return (data ?? []).filter((enrollment: any) => {
        if (!enrollment.fecha_fin) return true; // pago único / lifetime
        return new Date(enrollment.fecha_fin) > now;
      });
    },
    enabled: !!user?.id,
  });

  // Fetch assigned salones
  const { data: mySalones = [] } = useQuery({
    queryKey: ["dashboard-salones", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("salon_estudiantes")
        .select("salon_id, salones(id, nombre, descripcion, imagen_url)")
        .eq("usuario_id", user.id);
      if (error) throw error;
      return (data ?? []).map((row) => row.salones).filter(Boolean) as {
        id: string;
        nombre: string;
        descripcion: string | null;
        imagen_url: string | null;
      }[];
    },
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-5">
          <div className="h-8 bg-slate-200 rounded-xl w-1/3"></div>
          <div className="h-32 bg-slate-200 rounded-2xl"></div>
          <div className="grid md:grid-cols-2 gap-5">
            <div className="h-48 bg-slate-200 rounded-2xl"></div>
            <div className="h-48 bg-slate-200 rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  // Show locked state if no active enrollments AND no salones
  if ((!enrolledCourses || enrolledCourses.length === 0) && mySalones.length === 0) {
    return (
      <div className="p-6">
      <div className="grid lg:grid-cols-[1fr_300px] gap-5 items-start">
      <div className="min-w-0">
        {/* Header */}
        <div className="mb-5">
          <h1 className="text-xl font-bold text-slate-800 font-display mb-1">
            Bienvenido a Acelingua
          </h1>
          <p className="text-sm text-slate-500">
            Tu espacio de aprendizaje de inglés avanzado
          </p>
        </div>

        {/* Locked Card */}
        <div className="dashboard-card p-8 text-center mb-5 animate-fade-in-up">
          <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="h-7 w-7 text-slate-400" />
          </div>
          <h2 className="text-lg font-bold text-slate-800 font-display mb-3">
            Tu acceso aún no está activo
          </h2>
          <p className="text-sm text-slate-500 mb-2 max-w-md mx-auto">
            Tu cuenta está registrada correctamente. Para activar tu acceso a los cursos:
          </p>
          <ol className="text-sm text-slate-600 text-left max-w-md mx-auto mb-6 space-y-2">
            <li className="flex items-start gap-3">
              <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-xs flex-shrink-0 font-semibold">1</span>
              <span>Elige el curso que deseas (A1, A2, B1, B2, C1, C2 o Todos)</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-xs flex-shrink-0 font-semibold">2</span>
              <span>Contáctanos por WhatsApp para coordinar el pago</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-xs flex-shrink-0 font-semibold">3</span>
              <span>Una vez confirmado el pago, activaremos tu acceso</span>
            </li>
          </ol>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/">
              <Button className="bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl shadow-primary">
                <BookOpen className="h-4 w-4 mr-2" />
                Ver cursos disponibles
              </Button>
            </Link>
            <a
              href="https://wa.link/e86mee"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" className="border-emerald-300 text-emerald-600 hover:bg-emerald-50 px-5 py-2.5 rounded-xl">
                <MessageCircle className="h-4 w-4 mr-2" />
                Contactar por WhatsApp
              </Button>
            </a>
          </div>
        </div>

        {/* Payment methods reminder */}
        <div className="dashboard-card p-5 animate-fade-in-up animate-delay-200">
          <h3 className="text-sm font-semibold text-slate-800 font-display mb-3">
            💳 Métodos de pago disponibles
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl">
              <span className="text-xl">💚</span>
              <span className="text-sm text-slate-700 font-medium">Yape</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl">
              <span className="text-xl">💜</span>
              <span className="text-sm text-slate-700 font-medium">Plin</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl">
              <span className="text-xl">🏦</span>
              <span className="text-sm text-slate-700 font-medium">Transferencia</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl">
              <span className="text-xl">🔵</span>
              <span className="text-sm text-slate-700 font-medium">PayPal</span>
            </div>
          </div>
        </div>
      </div>

      <aside className="lg:sticky lg:top-6">
        <AnnouncementsCarousel />
        <WordSurvivorLauncher />
      </aside>
      </div>
      </div>
    );
  }

  return (
    <div className="p-6">
    <div className="grid lg:grid-cols-[1fr_300px] gap-5 items-start">
    <div className="min-w-0">
      {/* Welcome Hero */}
      <div className="dashboard-card p-5 mb-5 bg-gradient-to-br from-primary/5 via-white to-emerald-50/50 animate-fade-in-up">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-primary font-semibold mb-1">👋 ¡Hola de nuevo!</p>
            <h1 className="text-xl font-bold text-slate-800 font-display mb-1">
              Bienvenido, {user?.user_metadata?.full_name?.split(' ')[0] || 'Estudiante'}
            </h1>
            <p className="text-sm text-slate-500">
              Tu progreso está a un clic — sigamos construyendo tu inglés avanzado, paso a paso.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-3 bg-white/70 rounded-2xl px-4 py-3 shrink-0">
            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-800">{enrolledCourses.length}</p>
              <p className="text-xs text-slate-500">Cursos activos</p>
            </div>
          </div>
        </div>
      </div>

      <SalonesGrid salones={mySalones} />

      <CursosActivosList enrollments={enrolledCourses} />
    </div>

    <aside className="lg:sticky lg:top-6">
      <AnnouncementsCarousel />
      <WordSurvivorLauncher />
    </aside>
    </div>
    </div>
  );
};

export default Dashboard;
