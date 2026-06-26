import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppButton } from "@/components/landing/WhatsAppButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, Video, Users, Calendar, ArrowRight, Clock, BookOpen, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";
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

const LiveClasses = () => {
  const navigate = useNavigate();
  const whatsappLink = "https://wa.link/e86mee";

  const { data: programas = [], isLoading } = useQuery({
    queryKey: ["programas-en-vivo-public"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("programas_en_vivo")
        .select("*")
        .order("fecha_inicio", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const openPrograms = programas.filter((p) => p.estado_inscripcion === "abierta");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 lg:px-20 bg-gradient-to-br from-slate-50 via-white to-secondary/5">
        <div className="container mx-auto text-center max-w-4xl">
          <Badge className="bg-secondary/10 text-secondary border-0 mb-6 text-xs font-semibold px-4 py-1.5">
            PROGRAMAS GRUPALES EN VIVO
          </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-display text-foreground mb-6 leading-tight">
            Aprende inglés en{" "}
            <span className="text-gradient-primary">clases grupales</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-10">
            Únete a grupos reducidos con profesores certificados vía Zoom o Google Meet.
            Incluye acceso completo a la plataforma digital de Acelingua.
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            {[
              { icon: Video, text: "Zoom / Google Meet" },
              { icon: Users, text: "Máx. 8 estudiantes" },
              { icon: Calendar, text: "Horarios flexibles" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-muted-foreground">
                <item.icon className="h-5 w-5 text-secondary" />
                <span className="font-medium">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Program Cards */}
      <section className="py-20 px-6 lg:px-20">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold font-display text-foreground text-center mb-4">
            Programas disponibles
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Elige tu nivel y comienza tu camino hacia la fluidez en inglés
          </p>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : openPrograms.length === 0 ? (
            <Card className="p-12 text-center max-w-lg mx-auto">
              <Calendar className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">No hay programas con inscripción abierta en este momento.</p>
              <p className="text-sm text-muted-foreground mt-2">Contáctanos por WhatsApp para más información.</p>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {openPrograms.map((programa) => (
                <Card key={programa.id} className="p-6 rounded-xl border shadow-sm hover:shadow-md transition-shadow flex flex-col">
                  <div className="flex items-center gap-3 mb-4">
                    <Badge className={`${levelColors[programa.nivel] || "bg-gray-500"} text-white border-0 font-bold`}>
                      {programa.nivel}
                    </Badge>
                    <h3 className="font-semibold text-foreground text-lg">{programa.nombre}</h3>
                  </div>

                  {programa.descripcion && (
                    <p className="text-sm text-muted-foreground mb-4">{programa.descripcion}</p>
                  )}

                  <div className="space-y-3 text-sm text-muted-foreground mb-6 flex-grow">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-secondary flex-shrink-0" />
                      <span>
                        Inicio: {format(new Date(programa.fecha_inicio + "T12:00:00"), "d 'de' MMMM", { locale: es })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-secondary flex-shrink-0" />
                      <span>{programa.dias_clase} — {programa.horario}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-secondary flex-shrink-0" />
                      <span>Duración: {programa.duracion_meses} meses</span>
                    </div>
                    {programa.requisito_nivel && (
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-secondary flex-shrink-0" />
                        <span>Requisito: {programa.requisito_nivel}</span>
                      </div>
                    )}
                    {programa.incluye_plataforma && (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                        <span>Incluye acceso a la plataforma Acelingua</span>
                      </div>
                    )}
                  </div>

                  <div className="border-t pt-4 mt-auto">
                    <div className="flex items-end justify-between mb-4">
                      <div>
                        <span className="text-3xl font-bold text-foreground font-display">S/{programa.precio_mensual}</span>
                        <span className="text-sm text-muted-foreground">/mes</span>
                      </div>
                      <Badge variant="outline" className="text-xs border-emerald-200 text-emerald-600">
                        Inscripción abierta
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1 font-semibold"
                        onClick={() => navigate(`/programs/${programa.slug}`)}
                      >
                        Ver detalles
                      </Button>
                      <Button
                        className="flex-1 bg-secondary hover:bg-secondary/90 text-white font-semibold"
                        onClick={() => window.open(programa.whatsapp_url || whatsappLink, "_blank")}
                      >
                        Inscribirme
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* What's included */}
      <section className="py-20 px-6 lg:px-20 bg-card">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold font-display text-foreground text-center mb-12">
            ¿Qué incluye cada programa?
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: Video, title: "Clases en vivo por Zoom", desc: "Sesiones grupales con profesor certificado, 2-3 veces por semana." },
              { icon: Users, title: "Grupos reducidos", desc: "Máximo 8 estudiantes para atención personalizada." },
              { icon: BookOpen, title: "Acceso a la plataforma", desc: "Video lecciones, ejercicios y recursos descargables incluidos." },
              { icon: CheckCircle, title: "Material del curso", desc: "Contenido estructurado por nivel con práctica autónoma." },
            ].map((item, i) => (
              <div key={i} className="flex gap-4 p-4">
                <item.icon className="h-6 w-6 text-secondary flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 lg:px-20 bg-gradient-to-br from-secondary to-secondary/80">
        <div className="container mx-auto text-center max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 font-display">
            Comienza tu programa hoy
          </h2>
          <p className="text-white/80 text-lg mb-8">
            Contáctanos para encontrar el grupo y horario ideal para ti.
          </p>
          <Button
            size="lg"
            className="bg-white text-secondary hover:bg-white/90 px-8 py-6 rounded-full font-semibold shadow-lg"
            onClick={() => window.open(whatsappLink, "_blank")}
          >
            Contactar por WhatsApp
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default LiveClasses;
