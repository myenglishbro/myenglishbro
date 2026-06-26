import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CheckCircle,
  Search,
  Calendar,
  Infinity,
  CreditCard,
  MessageCircle,
  Loader2,
  GraduationCap,
  BookOpen,
  Filter,
  Star,
  Users,
  Clock,
  Award,
  Zap,
  PlayCircle,
  AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import instructorPhoto from "@/assets/instructor-photo.png";

interface Curso {
  id: string;
  titulo: string;
  slug: string;
  nivel: string;
  descripcion: string | null;
  precio_mensual_soles: number | null;
  precio_unico_soles: number | null;
  imagen_url: string | null;
  activo: boolean;
}

interface Matricula {
  id: string;
  curso_id: string;
  tipo_pago: string;
  estado: string;
  fecha_fin: string | null;
}

type EnrollmentState = "none" | "trial_active" | "trial_expired" | "paid_active" | "paid_expired";

// Course images based on level
const levelImages: Record<string, string> = {
  A1: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=250&fit=crop",
  A2: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=250&fit=crop",
  B1: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=250&fit=crop",
  B2: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=400&h=250&fit=crop",
  C1: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=250&fit=crop",
  C2: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=250&fit=crop",
};

const levelColors: Record<string, { bg: string; text: string; light: string }> = {
  A1: { bg: "bg-emerald-500", text: "text-emerald-600", light: "bg-emerald-50" },
  A2: { bg: "bg-teal-500", text: "text-teal-600", light: "bg-teal-50" },
  B1: { bg: "bg-cyan-500", text: "text-cyan-600", light: "bg-cyan-50" },
  B2: { bg: "bg-blue-500", text: "text-blue-600", light: "bg-blue-50" },
  C1: { bg: "bg-indigo-500", text: "text-indigo-600", light: "bg-indigo-50" },
  C2: { bg: "bg-purple-500", text: "text-purple-600", light: "bg-purple-50" },
};

const Store = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [startingTrial, setStartingTrial] = useState<string | null>(null);

  const whatsappLink = "https://wa.link/e86mee";

  const { data: cursos = [], isLoading } = useQuery({
    queryKey: ["store-cursos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cursos")
        .select("*")
        .eq("activo", true)
        .order("nivel");
      if (error) throw error;
      return data as Curso[];
    },
  });

  const { data: matriculas = [] } = useQuery({
    queryKey: ["store-matriculas", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("matriculas")
        .select("id, curso_id, tipo_pago, estado, fecha_fin")
        .eq("usuario_id", user.id);
      if (error) throw error;
      return data as Matricula[];
    },
    enabled: !!user?.id,
  });

  const enrollmentMap = useMemo(() => {
    return matriculas.reduce((acc, m) => {
      acc[m.curso_id] = m;
      return acc;
    }, {} as Record<string, Matricula>);
  }, [matriculas]);

  const getEnrollmentState = (cursoId: string): EnrollmentState => {
    const m = enrollmentMap[cursoId];
    if (!m) return "none";
    const now = new Date();
    if (m.tipo_pago !== "prueba") {
      if (m.estado !== "activa") return "paid_expired";
      if (m.fecha_fin === null || new Date(m.fecha_fin) > now) return "paid_active";
      return "paid_expired";
    }
    if (!m.fecha_fin || new Date(m.fecha_fin) <= now) return "trial_expired";
    return "trial_active";
  };

  const getTimeRemaining = (fechaFin: string) => {
    const diff = new Date(fechaFin).getTime() - Date.now();
    if (diff <= 0) return "Finalizada";
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) return `${hours}h ${minutes}m restantes`;
    return `${minutes}m restantes`;
  };

  const uniqueLevels = useMemo(() => {
    const levels = [...new Set(cursos.map((c) => c.nivel))];
    return levels.sort();
  }, [cursos]);

  const filteredCursos = useMemo(() => {
    return cursos.filter((curso) => {
      const matchesSearch =
        curso.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (curso.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
      const matchesLevel = levelFilter === "all" || curso.nivel === levelFilter;
      return matchesSearch && matchesLevel;
    });
  }, [cursos, searchTerm, levelFilter]);

  const handleInscription = () => {
    if (!user) {
      navigate("/auth?tab=register");
      toast.info("Regístrate para inscribirte al curso");
      return;
    }
    window.open(whatsappLink, "_blank");
  };

  const handleFreeTrial = async (cursoId: string) => {
    if (!user) {
      navigate("/auth?tab=login");
      toast.info("Inicia sesión para acceder a la prueba gratuita");
      return;
    }

    setStartingTrial(cursoId);
    try {
      const { data, error } = await supabase.functions.invoke("create-trial-enrollment", {
        body: { curso_id: cursoId },
      });

      // data contiene el cuerpo de la respuesta incluso en errores HTTP
      const errorMsg = data?.error ?? error?.message;
      if (errorMsg) throw new Error(errorMsg);

      toast.success("¡Prueba gratuita activada! Tienes 24 horas de acceso completo.");
      await queryClient.invalidateQueries({ queryKey: ["store-matriculas", user.id] });
      navigate(`/courses/${cursoId}`);
    } catch (err: any) {
      toast.error(err.message || "Error al activar la prueba gratuita");
    } finally {
      setStartingTrial(null);
    }
  };

  const getColorForLevel = (nivel: string) => {
    return levelColors[nivel] || { bg: "bg-education-primary", text: "text-education-primary", light: "bg-education-light" };
  };

  const getImageForLevel = (nivel: string) => {
    return levelImages[nivel] || levelImages["B2"];
  };

  return (
    <div className="min-h-screen bg-landing-light">
      <Navbar />

      {/* Header */}
      <section className="pt-32 pb-16 px-6 lg:px-20 bg-gradient-to-br from-education-light via-white to-certification-light/30">
        <div className="container mx-auto text-center">
          <Badge className="bg-education-primary/10 text-education-primary border-education-primary/20 mb-6 font-semibold px-4 py-2">
            <GraduationCap className="h-4 w-4 mr-2" />
            CATÁLOGO COMPLETO
          </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-display text-slate-900 mb-6">
            Todos nuestros <span className="text-gradient-primary">cursos</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Explora nuestra colección completa de cursos de inglés. Desde principiante hasta maestría,
            encuentra el nivel perfecto para ti.
          </p>

          {/* Quick Stats */}
          <div className="flex flex-wrap justify-center gap-8 mt-10">
            <div className="flex items-center gap-2 text-slate-600">
              <Users className="h-5 w-5 text-education-primary" />
              <span className="font-semibold">+500 estudiantes</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Star className="h-5 w-5 text-certification-gold" />
              <span className="font-semibold">4.9 calificación</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Award className="h-5 w-5 text-education-secondary" />
              <span className="font-semibold">Certificación Cambridge</span>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-6 px-6 lg:px-20 bg-white border-b border-slate-100 sticky top-20 z-40">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                placeholder="Buscar cursos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl focus:ring-2 focus:ring-education-primary/20"
              />
            </div>
            <div className="flex items-center gap-3">
              <Filter className="h-5 w-5 text-slate-400" />
              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger className="w-[180px] h-12 bg-slate-50 border-slate-200 text-slate-900 rounded-xl">
                  <SelectValue placeholder="Nivel" />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200">
                  <SelectItem value="all" className="text-slate-900">Todos los niveles</SelectItem>
                  {uniqueLevels.map((level) => (
                    <SelectItem key={level} value={level} className="text-slate-900">
                      Nivel {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Badge className="bg-education-primary/10 text-education-primary border-0 px-4 py-2 font-semibold">
              {filteredCursos.length} cursos disponibles
            </Badge>
          </div>
        </div>
      </section>

      {/* Courses Grid */}
      <section className="py-16 px-6 lg:px-20 bg-landing-light">
        <div className="container mx-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-education-primary" />
            </div>
          ) : filteredCursos.length === 0 ? (
            <div className="text-center py-20">
              <BookOpen className="h-16 w-16 text-slate-300 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-slate-900 mb-3">No se encontraron cursos</h3>
              <p className="text-slate-600">Intenta con otros filtros o términos de búsqueda</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCursos.map((curso) => {
                const colors = getColorForLevel(curso.nivel);
                const image = curso.imagen_url || getImageForLevel(curso.nivel);
                const enrollState = getEnrollmentState(curso.id);
                const matricula = enrollmentMap[curso.id];

                return (
                  <Card
                    key={curso.id}
                    className="bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-2 border-0"
                  >
                    {/* Course Image */}
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={image}
                        alt={curso.titulo}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <Badge className={`absolute top-4 left-4 ${colors.bg} text-white border-0 font-bold text-sm px-3 py-1`}>
                        Nivel {curso.nivel}
                      </Badge>

                      {/* Enrollment state badge on image */}
                      {enrollState === "trial_active" && (
                        <Badge className="absolute top-4 right-4 bg-amber-500 text-white border-0 font-semibold text-xs px-2 py-1">
                          <Clock className="h-3 w-3 mr-1" />
                          Prueba activa
                        </Badge>
                      )}
                      {enrollState === "paid_active" && (
                        <Badge className="absolute top-4 right-4 bg-emerald-500 text-white border-0 font-semibold text-xs px-2 py-1">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Inscrito
                        </Badge>
                      )}

                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-xl font-bold text-white line-clamp-2">{curso.titulo}</h3>
                      </div>
                    </div>

                    <div className="p-6">
                      {curso.descripcion && (
                        <p className="text-slate-600 text-sm mb-5 line-clamp-2">{curso.descripcion}</p>
                      )}

                      {/* Trial active countdown */}
                      {enrollState === "trial_active" && matricula?.fecha_fin && (
                        <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl mb-4">
                          <Clock className="h-4 w-4 text-amber-600 flex-shrink-0" />
                          <span className="text-sm font-semibold text-amber-700">
                            {getTimeRemaining(matricula.fecha_fin)}
                          </span>
                        </div>
                      )}

                      {/* Trial expired notice */}
                      {enrollState === "trial_expired" && (
                        <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl mb-4">
                          <AlertCircle className="h-4 w-4 text-slate-500 flex-shrink-0" />
                          <span className="text-sm text-slate-600">
                            Prueba finalizada — adquiere el acceso completo
                          </span>
                        </div>
                      )}

                      {/* Pricing (hide when already enrolled) */}
                      {(enrollState === "none" || enrollState === "trial_expired" || enrollState === "paid_expired") && (
                        <div className="space-y-3 mb-6">
                          {curso.precio_mensual_soles && (
                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-education-primary" />
                                <span className="text-sm text-slate-600 font-medium">Mensual</span>
                              </div>
                              <span className="text-2xl font-bold text-slate-900">
                                S/{curso.precio_mensual_soles}
                              </span>
                            </div>
                          )}

                          {curso.precio_unico_soles && (
                            <div className="flex items-center justify-between p-3 bg-education-secondary/10 rounded-xl border border-education-secondary/20">
                              <div className="flex items-center gap-2">
                                <Infinity className="h-5 w-5 text-education-secondary" />
                                <span className="text-sm text-education-secondary font-medium">Lifetime</span>
                              </div>
                              <span className="text-2xl font-bold text-education-secondary">
                                S/{curso.precio_unico_soles}
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Features (show only when no enrollment) */}
                      {enrollState === "none" && (
                        <div className="space-y-2 mb-6">
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <CheckCircle className="h-4 w-4 text-education-secondary flex-shrink-0" />
                            <span>Contenido completo del nivel</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <CheckCircle className="h-4 w-4 text-education-secondary flex-shrink-0" />
                            <span>Video lecciones HD</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <CheckCircle className="h-4 w-4 text-education-secondary flex-shrink-0" />
                            <span>Recursos descargables</span>
                          </div>
                        </div>
                      )}

                      {/* Action buttons */}
                      <div className="space-y-3">
                        {enrollState === "none" && (
                          <>
                            <Button
                              size="lg"
                              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl h-12"
                              onClick={() => handleFreeTrial(curso.id)}
                              disabled={startingTrial === curso.id}
                            >
                              {startingTrial === curso.id ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              ) : (
                                <Zap className="h-4 w-4 mr-2" />
                              )}
                              Prueba gratuita 24h
                            </Button>
                            <Button
                              size="lg"
                              variant="outline"
                              className="w-full font-semibold rounded-xl h-12"
                              onClick={handleInscription}
                            >
                              Inscribirme ahora
                            </Button>
                          </>
                        )}

                        {enrollState === "trial_active" && (
                          <>
                            <Button
                              size="lg"
                              className="w-full bg-education-primary hover:bg-education-primary/90 text-white font-semibold rounded-xl h-12"
                              onClick={() => navigate(`/courses/${curso.id}`)}
                            >
                              <PlayCircle className="h-4 w-4 mr-2" />
                              Ir al curso
                            </Button>
                            <Button
                              size="lg"
                              variant="outline"
                              className="w-full font-semibold rounded-xl h-12"
                              onClick={handleInscription}
                            >
                              <MessageCircle className="h-4 w-4 mr-2" />
                              Comprar acceso completo
                            </Button>
                          </>
                        )}

                        {enrollState === "trial_expired" && (
                          <Button
                            size="lg"
                            className="w-full bg-education-primary hover:bg-education-primary/90 text-white font-semibold rounded-xl h-12"
                            onClick={handleInscription}
                          >
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Inscribirme ahora
                          </Button>
                        )}

                        {enrollState === "paid_active" && (
                          <Button
                            size="lg"
                            className="w-full bg-education-primary hover:bg-education-primary/90 text-white font-semibold rounded-xl h-12"
                            onClick={() => navigate(`/courses/${curso.id}`)}
                          >
                            <PlayCircle className="h-4 w-4 mr-2" />
                            Ir al curso
                          </Button>
                        )}

                        {enrollState === "paid_expired" && (
                          <Button
                            size="lg"
                            className="w-full bg-education-primary hover:bg-education-primary/90 text-white font-semibold rounded-xl h-12"
                            onClick={handleInscription}
                          >
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Renovar acceso
                          </Button>
                        )}

                        <Button
                          size="lg"
                          variant="ghost"
                          className="w-full font-semibold rounded-xl h-10 text-slate-500"
                          onClick={() => navigate(`/curso/${curso.slug}`)}
                        >
                          Ver detalles del curso
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Bundle Section */}
      <section className="py-20 px-6 lg:px-20 bg-gradient-to-br from-education-primary via-indigo-600 to-purple-700">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-white rounded-3xl p-8 md:p-12 relative overflow-hidden shadow-2xl border-0">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-education-primary/10 to-education-secondary/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-certification-gold/10 to-education-primary/10 rounded-full blur-3xl" />

              <div className="relative z-10">
                <div className="absolute -top-4 -right-4 md:top-0 md:right-0">
                  <Badge className="bg-certification-gold text-slate-900 border-0 font-bold text-sm px-4 py-2 shadow-lg">
                    MEJOR VALOR
                  </Badge>
                </div>

                <div className="flex flex-col md:flex-row gap-8 items-center mb-8">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-lg flex-shrink-0">
                    <img src={instructorPhoto} alt="Instructor" className="w-full h-full object-cover" />
                  </div>
                  <div className="text-center md:text-left">
                    <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Acceso Completo</h3>
                    <p className="text-slate-600 text-lg">Todos los niveles: A1, A2, B1, B2, C1, C2</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 max-w-lg mx-auto md:mx-0 mb-8">
                  <div className="p-5 bg-education-primary/5 rounded-2xl border border-education-primary/10 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Calendar className="h-5 w-5 text-education-primary" />
                      <span className="text-education-primary font-semibold text-sm uppercase tracking-wide">Mensual</span>
                    </div>
                    <span className="text-4xl font-bold text-slate-900">S/50</span>
                    <p className="text-sm text-slate-500 mt-1">por mes</p>
                  </div>

                  <div className="p-5 bg-education-secondary/5 rounded-2xl border border-education-secondary/20 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Infinity className="h-5 w-5 text-education-secondary" />
                      <span className="text-education-secondary font-semibold text-sm uppercase tracking-wide">Lifetime</span>
                    </div>
                    <span className="text-4xl font-bold text-education-secondary">S/500</span>
                    <p className="text-sm text-slate-500 mt-1">pago único</p>
                  </div>
                </div>

                <Badge className="bg-education-secondary/10 text-education-secondary border-0 font-semibold mb-8 px-4 py-2">
                  Ahorra más del 50% vs comprar niveles individuales
                </Badge>

                <div className="grid md:grid-cols-2 gap-4 mb-8">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-education-secondary flex-shrink-0" />
                      <span className="text-slate-700">6 niveles completos (A1-C2)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-education-secondary flex-shrink-0" />
                      <span className="text-slate-700">Más de 300 lecciones en video</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-education-secondary flex-shrink-0" />
                      <span className="text-slate-700">Recursos descargables ilimitados</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-education-secondary flex-shrink-0" />
                      <span className="text-slate-700">Actualizaciones de por vida</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-education-secondary flex-shrink-0" />
                      <span className="text-slate-700">Soporte por WhatsApp</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-education-secondary flex-shrink-0" />
                      <span className="text-slate-700">Acceso inmediato</span>
                    </div>
                  </div>
                </div>

                <Button
                  size="lg"
                  className="w-full md:w-auto px-12 bg-education-primary hover:bg-education-primary/90 text-white font-bold rounded-xl h-14 text-lg shadow-lg shadow-education-primary/30"
                  onClick={handleInscription}
                >
                  Obtener Acceso Completo
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Payment Methods */}
      <section className="py-16 px-6 lg:px-20 bg-white">
        <div className="container mx-auto">
          <div className="max-w-2xl mx-auto">
            <Card className="bg-slate-50 rounded-2xl p-8 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-education-primary/10 rounded-xl flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-education-primary" />
                </div>
                <h4 className="text-xl font-bold text-slate-900">Métodos de pago disponibles</h4>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="flex items-center gap-3 p-3 bg-white rounded-xl">
                  <span className="text-2xl">💚</span>
                  <span className="font-medium text-slate-700">Yape</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white rounded-xl">
                  <span className="text-2xl">💜</span>
                  <span className="font-medium text-slate-700">Plin</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white rounded-xl">
                  <span className="text-2xl">🏦</span>
                  <span className="font-medium text-slate-700">Transferencia</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white rounded-xl">
                  <span className="text-2xl">🔵</span>
                  <span className="font-medium text-slate-700">PayPal</span>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-education-secondary/10 rounded-xl">
                <MessageCircle className="h-5 w-5 text-education-secondary flex-shrink-0" />
                <span className="text-slate-700">Contáctanos por WhatsApp para realizar tu pago y activar tu acceso</span>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Store;
