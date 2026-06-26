import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Clock, Users, ArrowRight, CheckCircle } from "lucide-react";
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

export const UpcomingPrograms = () => {
  const navigate = useNavigate();

  const { data: programas = [], isLoading } = useQuery({
    queryKey: ["programas-landing-upcoming"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("programas_en_vivo")
        .select("*")
        .eq("estado_inscripcion", "abierta")
        .order("fecha_inicio", { ascending: true })
        .limit(6);
      if (error) throw error;
      return data;
    },
  });

  return (
    <section className="py-20 px-6 lg:px-20 bg-card">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-14">
          <Badge className="bg-secondary/10 text-secondary border-0 mb-4 text-xs font-semibold px-4 py-1.5">
            UPCOMING COHORTS
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold font-display text-foreground mb-4">
            Upcoming Live Programs
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Enroll in a scheduled group program and learn with a certified instructor.
          </p>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-64 rounded-2xl" />
            ))}
          </div>
        ) : programas.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No upcoming programs at the moment. Check back soon!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {programas.map((p) => (
              <Card key={p.id} className="p-6 rounded-2xl border shadow-sm hover:shadow-md transition-shadow flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <Badge className={`${levelColors[p.nivel] || "bg-muted"} text-white border-0 font-bold`}>
                    {p.nivel}
                  </Badge>
                  <h3 className="font-semibold text-foreground text-sm">{p.nombre}</h3>
                </div>

                <div className="space-y-2 text-sm text-muted-foreground flex-grow">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-secondary flex-shrink-0" />
                    <span>Start: {format(new Date(p.fecha_inicio + "T12:00:00"), "d 'de' MMMM", { locale: es })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-secondary flex-shrink-0" />
                    <span>{p.dias_clase} — {p.horario}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-secondary flex-shrink-0" />
                    <span>Max. {p.max_estudiantes} students</span>
                  </div>
                  {p.incluye_plataforma && (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                      <span>Platform access included</span>
                    </div>
                  )}
                </div>

                <div className="border-t pt-4 mt-4 flex items-end justify-between">
                  <div>
                    <span className="text-2xl font-bold text-foreground font-display">S/{p.precio_mensual}</span>
                    <span className="text-sm text-muted-foreground">/mo</span>
                  </div>
                  <Button
                    size="sm"
                    className="rounded-xl font-semibold bg-secondary hover:bg-secondary/90 text-white"
                    onClick={() => navigate(`/programs/${p.slug}`)}
                  >
                    Enroll
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {programas.length > 0 && (
          <div className="text-center mt-10">
            <Button
              variant="outline"
              size="lg"
              className="rounded-full font-semibold px-8"
              onClick={() => navigate("/live-classes")}
            >
              View All Programs
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};
