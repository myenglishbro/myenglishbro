import { MessageCircle, PenTool, Award, Lightbulb } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const LearningBenefits = () => {
  const benefits = [
    {
      icon: MessageCircle,
      title: "Habla con confianza",
      desc: "Practica conversaciones reales y gana fluidez para reuniones, entrevistas y vida cotidiana.",
      color: "bg-primary/10 text-primary",
    },
    {
      icon: PenTool,
      title: "Escribe como un profesional",
      desc: "Domina emails, reportes y documentos profesionales con estructuras claras y efectivas.",
      color: "bg-secondary/10 text-secondary",
    },
    {
      icon: Award,
      title: "Prepárate para certificaciones",
      desc: "Contenido alineado con Cambridge, IELTS y TOEFL para que apruebes en el primer intento.",
      color: "bg-accent/10 text-accent",
    },
    {
      icon: Lightbulb,
      title: "Metodología efectiva",
      desc: "Video lecciones + ejercicios prácticos + recursos descargables para un aprendizaje completo.",
      color: "bg-accent-sky/10 text-accent-sky",
    },
  ];

  return (
    <section className="py-24 px-6 lg:px-20 bg-background">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <Badge className="bg-primary/10 text-primary border-0 mb-4 text-xs font-semibold px-4 py-1.5">
            BENEFICIOS
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold font-display text-foreground mb-4">
            Domina el inglés con Acelingua
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Desarrolla habilidades reales con un método probado por miles de estudiantes
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {benefits.map((item, i) => (
            <Card key={i} className="p-6 border-border shadow-soft hover:shadow-soft-lg hover:-translate-y-1 transition-all duration-300">
              <div className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center mb-4`}>
                <item.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2 font-display">{item.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
