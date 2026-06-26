import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  Eye,
  Infinity,
  Layers,
  Loader2,
  Lock,
  PlayCircle,
  Star,
  Users,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { PreviewModal } from "@/components/course/PreviewModal";

const levelColors: Record<string, { bg: string; text: string }> = {
  A1: { bg: "bg-emerald-500", text: "text-emerald-600" },
  A2: { bg: "bg-teal-500", text: "text-teal-600" },
  B1: { bg: "bg-cyan-500", text: "text-cyan-600" },
  B2: { bg: "bg-blue-500", text: "text-blue-600" },
  C1: { bg: "bg-indigo-500", text: "text-indigo-600" },
  C2: { bg: "bg-purple-500", text: "text-purple-600" },
};

type Curso = {
  id: string;
  titulo: string;
  slug: string;
  nivel: string;
  descripcion: string | null;
  imagen_url: string | null;
  precio_mensual_soles: number | null;
  precio_unico_soles: number | null;
  activo: boolean;
  duracion_total: string | null;
  learning_outcomes: string[] | null;
  instructor: string | null;
  rating: number | null;
  estudiantes_count: number | null;
};

type Modulo = {
  id: string;
  curso_id: string;
  titulo: string;
  slug: string;
  order_index: number;
};

type Leccion = {
  id: string;
  curso_id: string;
  modulo_id: string | null;
  titulo: string;
  slug: string;
  descripcion: string | null;
  order_index: number;
  orden: number;
  es_preview: boolean;
  video_url: string | null;
  youtube_url: string | null;
};

const CoursePublicDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const whatsappLink = "https://wa.link/e86mee";
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedPreviewLesson, setSelectedPreviewLesson] = useState<Leccion | null>(null);

  const { data: curso, isLoading: loadingCurso } = useQuery({
    queryKey: ["public-curso", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cursos")
        .select("*")
        .eq("slug", slug!)
        .eq("activo", true)
        .limit(1)
        .single();
      if (error) throw error;
      return data as unknown as Curso;
    },
    enabled: !!slug,
  });

  const { data: modulos = [] } = useQuery({
    queryKey: ["public-modulos", curso?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("modulos")
        .select("id, curso_id, titulo, slug, order_index")
        .eq("curso_id", curso!.id)
        .order("order_index");
      if (error) throw error;
      return data as Modulo[];
    },
    enabled: !!curso?.id,
  });

  const { data: lecciones = [] } = useQuery({
    queryKey: ["public-lecciones", curso?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lecciones")
        .select("id, curso_id, modulo_id, titulo, slug, descripcion, order_index, orden, es_preview, video_url, youtube_url")
        .eq("curso_id", curso!.id)
        .order("order_index")
        .order("orden");
      if (error) throw error;
      return data as Leccion[];
    },
    enabled: !!curso?.id,
  });

  const { data: hasEnrollment } = useQuery({
    queryKey: ["enrollment-check", curso?.id, user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("matriculas")
        .select("id")
        .eq("usuario_id", user!.id)
        .eq("curso_id", curso!.id)
        .eq("estado", "activa")
        .maybeSingle();
      if (error) return false;
      return !!data;
    },
    enabled: !!curso?.id && !!user?.id,
  });

  const handleInscription = () => {
    if (!user) {
      navigate("/auth?tab=register");
      toast.info("Regístrate para inscribirte al curso");
      return;
    }
    window.open(whatsappLink, "_blank");
  };

  const colors = curso
    ? levelColors[curso.nivel] || { bg: "bg-blue-500", text: "text-blue-600" }
    : { bg: "bg-blue-500", text: "text-blue-600" };

  const previewLesson = lecciones.find((l) => l.es_preview);
  const previewLessons = lecciones.filter((l) => l.es_preview);
  const activePreview = selectedPreviewLesson || previewLesson || null;
  const learningOutcomes: string[] = (curso?.learning_outcomes as string[]) || [];

  const openPreview = (lesson: Leccion) => {
    setSelectedPreviewLesson(lesson);
    setPreviewOpen(true);
  };

  const leccionesByModulo = modulos.map((m) => ({
    ...m,
    lecciones: lecciones.filter((l) => l.modulo_id === m.id),
  }));
  const leccionesSinModulo = lecciones.filter((l) => !l.modulo_id);
  const totalLecciones = lecciones.length;

  if (loadingCurso) {
    return (
      <div className="min-h-screen bg-landing-light">
        <Navbar />
        <div className="flex items-center justify-center py-40">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!curso) {
    return (
      <div className="min-h-screen bg-landing-light">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-40 px-6 text-center">
          <BookOpen className="h-16 w-16 text-muted-foreground mb-6" />
          <h1 className="text-3xl font-bold text-foreground mb-3">Curso no encontrado</h1>
          <p className="text-muted-foreground mb-8">
            El curso que buscas no existe o no está disponible.
          </p>
          <Button onClick={() => navigate("/store")} variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Volver al catálogo
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const PricingSidebar = () => (
    <Card className="rounded-2xl overflow-hidden border-0 shadow-lg">
      <div className="p-6 space-y-4">
        {curso.precio_mensual_soles != null && (
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground font-medium">Mensual</span>
            </div>
            <span className="text-2xl font-bold text-foreground">
              S/{curso.precio_mensual_soles}
            </span>
          </div>
        )}
        {curso.precio_unico_soles != null && (
          <div className="flex items-center justify-between p-3 bg-accent/30 rounded-xl border border-accent">
            <div className="flex items-center gap-2">
              <Infinity className="h-5 w-5 text-accent-foreground" />
              <span className="text-sm font-medium text-accent-foreground">Lifetime</span>
            </div>
            <span className="text-2xl font-bold text-accent-foreground">
              S/{curso.precio_unico_soles}
            </span>
          </div>
        )}
        <Button
          size="lg"
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl h-12"
          onClick={handleInscription}
        >
          Inscribirme ahora
        </Button>
        <div className="space-y-2 pt-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
            <span>Acceso al contenido completo</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
            <span>Video lecciones HD</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
            <span>Recursos descargables</span>
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-landing-light">
      <Navbar />

      {/* Hero Section - Two Column */}
      <section className="pt-28 pb-16 px-6 lg:px-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-500 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-start">
            {/* LEFT SIDE — 3/5 */}
            <div className="lg:col-span-3">
              {/* Breadcrumb */}
              <nav className="flex items-center gap-2 text-sm text-white/50 mb-6">
                <button onClick={() => navigate("/store")} className="hover:text-white/80 transition-colors">
                  Catálogo
                </button>
                <span>/</span>
                <span className="text-white/70">{curso.titulo}</span>
              </nav>

              <Badge className={`${colors.bg} text-white border-0 font-bold text-sm px-3 py-1 mb-4`}>
                Nivel {curso.nivel}
              </Badge>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                {curso.titulo}
              </h1>

              {curso.descripcion && (
                <p className="text-white/70 text-lg mb-6 leading-relaxed line-clamp-3">
                  {curso.descripcion}
                </p>
              )}

              {/* Meta line */}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-white/60 text-sm mb-4">
                <span className="flex items-center gap-1.5">
                  <PlayCircle className="h-4 w-4" /> {totalLecciones} lecciones
                </span>
                <span className="flex items-center gap-1.5">
                  <Layers className="h-4 w-4" /> {modulos.length} módulos
                </span>
                {curso.duracion_total && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" /> {curso.duracion_total}
                  </span>
                )}
                {curso.rating != null && (
                  <span className="flex items-center gap-1.5 text-amber-400">
                    <Star className="h-4 w-4 fill-current" /> {curso.rating}
                  </span>
                )}
                {curso.estudiantes_count != null && (
                  <span className="flex items-center gap-1.5">
                    <Users className="h-4 w-4" /> {curso.estudiantes_count} estudiantes
                  </span>
                )}
              </div>

              {curso.instructor && (
                <p className="text-white/50 text-sm">
                  Instructor: <span className="text-white/80 font-medium">{curso.instructor}</span>
                </p>
              )}
            </div>

            {/* RIGHT SIDE — 2/5 — Preview Card */}
            <div className="lg:col-span-2">
              {previewLesson ? (
                <button
                  onClick={() => openPreview(previewLesson)}
                  className="w-full group relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 transition-transform hover:scale-[1.02] focus:outline-none"
                >
                  {curso.imagen_url ? (
                    <img src={curso.imagen_url} alt={curso.titulo} className="w-full aspect-video object-cover" />
                  ) : (
                    <div className="w-full aspect-video bg-gradient-to-br from-slate-700 to-slate-800" />
                  )}
                  <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-3 group-hover:bg-black/30 transition-colors">
                    <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 group-hover:scale-110 transition-transform">
                      <PlayCircle className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-emerald-500 text-white border-0 shadow-lg text-xs">Clase gratuita</Badge>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                    <p className="text-white font-medium text-sm text-left">{previewLesson.titulo}</p>
                  </div>
                </button>
              ) : curso.imagen_url ? (
                <div className="rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                  <img
                    src={curso.imagen_url}
                    alt={curso.titulo}
                    className="w-full aspect-video object-cover"
                  />
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {/* "Qué aprenderás" Section — Udemy style, below hero */}
      {learningOutcomes.length > 0 && (
        <section className="py-10 px-6 lg:px-20 border-b border-border">
          <div className="container mx-auto max-w-6xl">
            <div className="border border-border rounded-xl p-6 lg:p-8 bg-white">
              <h2 className="text-xl font-bold text-foreground mb-5">
                Qué aprenderás en este curso
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
                {learningOutcomes.map((item, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm">
                    <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Content */}
      <section className="py-12 px-6 lg:px-20">
        <div className="container mx-auto max-w-6xl">
          {/* Mobile pricing + preview */}
          <div className="lg:hidden mb-8 space-y-4">
            {previewLesson && (
              <button
                onClick={() => openPreview(previewLesson)}
                className="w-full group relative rounded-xl overflow-hidden shadow-lg border border-border"
              >
                {curso.imagen_url ? (
                  <img src={curso.imagen_url} alt={curso.titulo} className="w-full aspect-video object-cover" />
                ) : (
                  <div className="w-full aspect-video bg-gradient-to-br from-slate-200 to-slate-300" />
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                    <PlayCircle className="h-7 w-7 text-white" />
                  </div>
                </div>
                <div className="absolute top-3 left-3">
                  <Badge className="bg-emerald-500 text-white border-0 text-xs">Clase gratuita</Badge>
                </div>
              </button>
            )}
            <PricingSidebar />
          </div>

          <div className="flex flex-col lg:flex-row gap-10">
            {/* Main content */}
            <div className="flex-1 min-w-0">
              {/* Description */}
              {curso.descripcion && (
                <div className="mb-10">
                  <h2 className="text-2xl font-bold text-foreground mb-4">Descripción</h2>
                  <div className="prose prose-slate max-w-none">
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                      {curso.descripcion}
                    </p>
                  </div>
                </div>
              )}

              {/* Curriculum */}
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Contenido del curso
                </h2>
                <p className="text-muted-foreground mb-6">
                  {modulos.length} módulos · {totalLecciones} lecciones
                </p>

                {modulos.length > 0 || leccionesSinModulo.length > 0 ? (
                  <Accordion type="multiple" defaultValue={modulos.map(m => m.id)} className="space-y-3">
                    {leccionesByModulo.map((mod) => (
                      <AccordionItem
                        key={mod.id}
                        value={mod.id}
                        className="border rounded-xl px-4 bg-white shadow-sm"
                      >
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center gap-3">
                            <Layers className="h-5 w-5 text-primary flex-shrink-0" />
                            <span className="font-semibold text-foreground text-left">
                              {mod.titulo}
                            </span>
                            <Badge variant="secondary" className="ml-auto text-xs">
                              {mod.lecciones.length} lecciones
                            </Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <ul className="space-y-1">
                            {mod.lecciones.map((lec) => {
                              const isPreview = lec.es_preview;
                              const isAccessible = isPreview || !!hasEnrollment;
                              const isActive = previewOpen && selectedPreviewLesson?.id === lec.id;

                              return (
                                <li
                                  key={lec.id}
                                  role={isAccessible ? "button" : undefined}
                                  tabIndex={isAccessible ? 0 : undefined}
                                  className={`flex items-center gap-3 text-sm py-2.5 px-3 rounded-lg transition-colors ${
                                    isActive
                                      ? "bg-primary/10 text-primary font-medium"
                                      : isPreview
                                      ? "text-emerald-600 cursor-pointer hover:bg-emerald-50"
                                      : isAccessible
                                      ? "text-foreground cursor-pointer hover:bg-muted/50"
                                      : "text-muted-foreground/50"
                                  }`}
                                  onClick={() => {
                                    if (isPreview) openPreview(lec);
                                    else if (hasEnrollment) navigate(`/courses/${curso.id}`);
                                  }}
                                >
                                  {isPreview ? (
                                    <PlayCircle className="h-4 w-4 flex-shrink-0 text-emerald-500" />
                                  ) : isAccessible ? (
                                    <PlayCircle className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                                  ) : (
                                    <Lock className="h-4 w-4 flex-shrink-0 text-muted-foreground/40" />
                                  )}
                                  <span className="flex-1 text-left">{lec.titulo}</span>
                                  {isPreview && (
                                    <Badge className="bg-emerald-100 text-emerald-700 border-0 text-[10px] px-2 py-0.5 font-semibold">
                                      Clase gratuita
                                    </Badge>
                                  )}
                                </li>
                              );
                            })}
                            {mod.lecciones.length === 0 && (
                              <li className="text-sm text-muted-foreground italic py-2 px-3">
                                Sin lecciones aún
                              </li>
                            )}
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                    ))}

                    {leccionesSinModulo.length > 0 && (
                      <AccordionItem
                        value="sin-modulo"
                        className="border rounded-xl px-4 bg-white shadow-sm"
                      >
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center gap-3">
                            <BookOpen className="h-5 w-5 text-primary flex-shrink-0" />
                            <span className="font-semibold text-foreground">
                              Lecciones generales
                            </span>
                            <Badge variant="secondary" className="ml-auto text-xs">
                              {leccionesSinModulo.length} lecciones
                            </Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <ul className="space-y-1">
                            {leccionesSinModulo.map((lec) => {
                              const isPreview = lec.es_preview;
                              const isAccessible = isPreview || !!hasEnrollment;
                              const isActive = previewOpen && selectedPreviewLesson?.id === lec.id;

                              return (
                                <li
                                  key={lec.id}
                                  role={isAccessible ? "button" : undefined}
                                  tabIndex={isAccessible ? 0 : undefined}
                                  className={`flex items-center gap-3 text-sm py-2.5 px-3 rounded-lg transition-colors ${
                                    isActive
                                      ? "bg-primary/10 text-primary font-medium"
                                      : isPreview
                                      ? "text-emerald-600 cursor-pointer hover:bg-emerald-50"
                                      : isAccessible
                                      ? "text-foreground cursor-pointer hover:bg-muted/50"
                                      : "text-muted-foreground/50"
                                  }`}
                                  onClick={() => {
                                    if (isPreview) openPreview(lec);
                                    else if (hasEnrollment) navigate(`/courses/${curso.id}`);
                                  }}
                                >
                                  {isPreview ? (
                                    <PlayCircle className="h-4 w-4 flex-shrink-0 text-emerald-500" />
                                  ) : isAccessible ? (
                                    <PlayCircle className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                                  ) : (
                                    <Lock className="h-4 w-4 flex-shrink-0 text-muted-foreground/40" />
                                  )}
                                  <span className="flex-1 text-left">{lec.titulo}</span>
                                  {isPreview && (
                                    <Badge className="bg-emerald-100 text-emerald-700 border-0 text-[10px] px-2 py-0.5 font-semibold">
                                      Clase gratuita
                                    </Badge>
                                  )}
                                </li>
                              );
                            })}
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                    )}
                  </Accordion>
                ) : (
                  <div className="text-center py-12 bg-white rounded-xl border">
                    <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">
                      El contenido de este curso estará disponible pronto.
                    </p>
                  </div>
                )}
              </div>

              {/* Back button */}
              <div className="mt-12">
                <Button
                  variant="outline"
                  onClick={() => navigate("/store")}
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" /> Volver al catálogo
                </Button>
              </div>
            </div>

            {/* Desktop sidebar — pricing only, no image */}
            <div className="hidden lg:block w-80 flex-shrink-0">
              <div className="lg:sticky lg:top-24">
                <PricingSidebar />
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      {/* Preview Modal */}
      <PreviewModal
        isOpen={previewOpen}
        onClose={() => { setPreviewOpen(false); setSelectedPreviewLesson(null); }}
        lesson={activePreview}
        allPreviewLessons={previewLessons}
        onSelectLesson={(lec) => setSelectedPreviewLesson(lec as Leccion)}
        modules={leccionesByModulo}
        totalLessons={totalLecciones}
        totalModules={modulos.length}
        nivel={curso.nivel}
        duracionTotal={curso.duracion_total}
        onInscription={handleInscription}
      />
    </div>
  );
};

export default CoursePublicDetail;
