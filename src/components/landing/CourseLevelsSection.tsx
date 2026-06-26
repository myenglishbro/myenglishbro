import { ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface CourseLevelsSectionProps {
  onExploreCourses: () => void;
}

export const CourseLevelsSection = ({ onExploreCourses }: CourseLevelsSectionProps) => {
  const levels = [
    { level: "A1", label: "Principiante", color: "bg-emerald-500" },
    { level: "A2", label: "Elemental", color: "bg-teal-500" },
    { level: "B1", label: "Intermedio", color: "bg-cyan-500" },
    { level: "B2", label: "Intermedio alto", color: "bg-accent-sky" },
    { level: "C1", label: "Avanzado", color: "bg-primary" },
    { level: "C2", label: "Maestría", color: "bg-secondary" },
  ];

  return (
    <section className="py-24 px-6 lg:px-20 bg-background">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <Badge className="bg-primary/10 text-primary border-0 mb-4 text-xs font-semibold px-4 py-1.5">
            NIVELES
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold font-display text-foreground mb-4">
            Cursos para todos los niveles
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Desde principiante hasta maestría. Elige tu nivel y empieza hoy.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {levels.map((item) => (
            <div key={item.level} className="text-center">
              <span className={`${item.color} text-white px-5 py-2 rounded-full font-bold text-sm shadow-soft inline-block`}>
                {item.level}
              </span>
              <p className="text-xs text-muted-foreground mt-1.5">{item.label}</p>
            </div>
          ))}
        </div>

        <div className="max-w-2xl mx-auto">
          <Card className="border-primary/20 shadow-soft-lg p-8 text-center">
            <Badge className="bg-primary/10 text-primary border-0 mb-4 text-xs font-semibold">
              CATÁLOGO COMPLETO
            </Badge>
            <h3 className="text-2xl font-bold text-foreground mb-4 font-display">
              Explora todos nuestros cursos
            </h3>
            <p className="text-muted-foreground mb-8">
              Cursos estándar por nivel, cursos especializados (Cambridge, Business English) y paquetes con descuento.
            </p>

            <div className="grid grid-cols-3 gap-4 mb-8">
              {[
                { value: "6+", label: "Niveles", color: "text-primary" },
                { value: "300+", label: "Lecciones", color: "text-secondary" },
                { value: "S/30", label: "Desde", color: "text-accent-sky" },
              ].map((stat) => (
                <div key={stat.label} className="p-4 bg-muted/50 rounded-xl">
                  <div className={`text-2xl font-bold ${stat.color} font-display`}>{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>

            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/25 text-base px-8 rounded-xl"
              onClick={onExploreCourses}
            >
              Ver todos los cursos
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Card>
        </div>
      </div>
    </section>
  );
};
