import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppButton } from "@/components/landing/WhatsAppButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Calendar,
  Clock,
  BookOpen,
  Globe,
  CheckCircle,
  ArrowRight,
  Users,
  ArrowLeft,
  ListChecks,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const levelColors: Record<string, string> = {
  A1: "bg-emerald-500",
  A2: "bg-teal-500",
  B1: "bg-cyan-500",
  B2: "bg-blue-500",
  C1: "bg-indigo-500",
  IELTS: "bg-purple-500",
};

const ProgramDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const { data: programa, isLoading, error } = useQuery({
    queryKey: ["programa-detalle", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("programas_en_vivo")
        .select("*")
        .eq("slug", slug!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  const whatsappUrl =
    programa?.whatsapp_url || "https://wa.link/e86mee";

  const syllabus: string[] = Array.isArray(programa?.syllabus)
    ? (programa.syllabus as string[])
    : [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-28 pb-20 px-6 lg:px-20 container mx-auto max-w-4xl space-y-6">
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-10 w-1/2" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-3/4" />
        </div>
      </div>
    );
  }

  if (!programa || error) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 pb-20 px-6 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Programa no encontrado</h1>
          <Button variant="outline" onClick={() => navigate("/programs")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Volver a programas
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Banner */}
      {programa.imagen_url ? (
        <div className="pt-20">
          <div className="w-full h-64 md:h-80 lg:h-96 overflow-hidden">
            <img
              src={programa.imagen_url}
              alt={programa.nombre}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      ) : (
        <div className={`pt-20 ${levelColors[programa.nivel] || "bg-primary"}`}>
          <div className="h-48 md:h-64 flex items-center justify-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white font-display">
              {programa.nombre}
            </h2>
          </div>
        </div>
      )}

      <div className="px-6 lg:px-20 py-12">
        <div className="container mx-auto max-w-4xl">
          {/* Back link */}
          <button
            onClick={() => navigate("/programs")}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Volver a programas
          </button>

          {/* Title + badge */}
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <Badge
              className={`${levelColors[programa.nivel] || "bg-primary"} text-white border-0 font-bold text-sm px-3 py-1`}
            >
              {programa.nivel}
            </Badge>
            {programa.estado_inscripcion === "abierta" && (
              <Badge variant="outline" className="border-emerald-200 text-emerald-600 text-xs">
                Inscripción abierta
              </Badge>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold font-display text-foreground mb-8">
            {programa.nombre}
          </h1>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-8">
              {/* About */}
              {(programa.descripcion_completa || programa.descripcion) && (
                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3">
                    Acerca de este programa
                  </h2>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {programa.descripcion_completa || programa.descripcion}
                  </p>
                </section>
              )}

              {/* Syllabus */}
              {syllabus.length > 0 && (
                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
                    <ListChecks className="h-5 w-5 text-primary" /> Temario
                  </h2>
                  <Card className="p-0 overflow-hidden divide-y divide-border">
                    {syllabus.map((item, i) => (
                      <div key={i} className="px-5 py-3 flex items-center gap-3">
                        <span className="text-xs font-bold text-muted-foreground w-6 text-right">
                          {i + 1}
                        </span>
                        <span className="text-sm text-foreground">{item}</span>
                      </div>
                    ))}
                  </Card>
                </section>
              )}

              {/* What's included */}
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">
                  ¿Qué incluye?
                </h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    "Clases en vivo por Zoom / Google Meet",
                    "Grupos reducidos (máx. 8 estudiantes)",
                    programa.incluye_plataforma && "Acceso completo a la plataforma Acelingua",
                    "Material del curso incluido",
                    "Seguimiento personalizado",
                  ]
                    .filter(Boolean)
                    .map((text, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{text}</span>
                      </div>
                    ))}
                </div>
              </section>

              {/* Promotional image */}
              {programa.imagen_promocional_url && (
                <img
                  src={programa.imagen_promocional_url}
                  alt={`${programa.nombre} promoción`}
                  className="w-full rounded-xl shadow-md"
                />
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Card className="p-6 rounded-2xl border shadow-lg sticky top-28 space-y-5">
                <div>
                  <span className="text-3xl font-bold text-foreground font-display">
                    S/{programa.precio_mensual}
                  </span>
                  <span className="text-sm text-muted-foreground">/mes</span>
                </div>

                <div className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary flex-shrink-0" />
                    <span>
                      Inicio:{" "}
                      {format(
                        new Date(programa.fecha_inicio + "T12:00:00"),
                        "d 'de' MMMM yyyy",
                        { locale: es }
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary flex-shrink-0" />
                    <span>
                      {programa.dias_clase} — {programa.horario}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-primary flex-shrink-0" />
                    <span>Duración: {programa.duracion_meses} meses</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary flex-shrink-0" />
                    <span>Máx. {programa.max_estudiantes} estudiantes</span>
                  </div>
                  {programa.requisito_nivel && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-primary flex-shrink-0" />
                      <span>Requisito: {programa.requisito_nivel}</span>
                    </div>
                  )}
                </div>

                <Button
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl py-5"
                  onClick={() => window.open(whatsappUrl, "_blank")}
                >
                  Inscribirme por WhatsApp
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default ProgramDetail;
