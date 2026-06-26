import { Play, Lock, BookOpen, Download, Users, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface FreeLessonPreviewProps {
  onPlayPreview: () => void;
  onExploreCourses: () => void;
}

export const FreeLessonPreview = ({ onPlayPreview, onExploreCourses }: FreeLessonPreviewProps) => {
  const modules = [
    {
      title: "Módulo 1 — ABC & 123",
      lessons: [
        { title: "The alphabet", preview: true },
        { title: "Spelling the alphabet", preview: true },
        { title: "Numbers 1–30", preview: false },
      ],
    },
    {
      title: "Módulo 2 — Greetings",
      lessons: [
        { title: "Introduce yourself", preview: true },
        { title: "Basic greetings", preview: false },
      ],
    },
  ];

  return (
    <section className="py-24 px-6 lg:px-20 bg-muted/30">
      <div className="container mx-auto">
        <div className="text-center mb-14">
          <Badge className="bg-accent/10 text-accent border-0 mb-4 text-xs font-semibold px-4 py-1.5">
            PRUEBA GRATIS
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold font-display text-foreground mb-4">
            Mira una clase antes de inscribirte
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Accede a lecciones de prueba en cada curso y comprueba la calidad de nuestro contenido
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Video Card */}
          <Card className="overflow-hidden border-border shadow-soft-lg group">
            <div className="relative aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center cursor-pointer" onClick={onPlayPreview}>
              <Badge className="absolute top-4 left-4 bg-accent text-accent-foreground border-0 text-xs font-semibold px-3 py-1 z-10">
                Clase gratuita
              </Badge>
              <div className="w-20 h-20 rounded-full bg-primary/90 flex items-center justify-center shadow-lg shadow-primary/30 group-hover:scale-110 transition-transform duration-300">
                <Play className="h-8 w-8 text-primary-foreground ml-1" fill="currentColor" />
              </div>
            </div>
            <div className="p-6">
              <p className="text-sm text-muted-foreground mb-1">Lección de ejemplo</p>
              <h3 className="text-xl font-bold text-foreground font-display mb-4">Introduce Yourself in English</h3>
              <Button onClick={onPlayPreview} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-semibold">
                <Play className="h-4 w-4 mr-2" />
                Ver clase gratuita
              </Button>
            </div>
          </Card>

          {/* Mini Curriculum */}
          <Card className="border-border shadow-soft-lg p-6">
            <h3 className="text-lg font-bold text-foreground font-display mb-1">Currículo del curso</h3>
            <p className="text-sm text-muted-foreground mb-5">Vista previa del contenido disponible</p>

            <div className="space-y-4 mb-6">
              {modules.map((mod, i) => (
                <div key={i}>
                  <p className="text-sm font-semibold text-foreground mb-2">{mod.title}</p>
                  <div className="space-y-1.5">
                    {mod.lessons.map((lesson, j) => (
                      <div
                        key={j}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                          lesson.preview
                            ? "bg-accent/5 text-foreground cursor-pointer hover:bg-accent/10"
                            : "text-muted-foreground"
                        }`}
                        onClick={lesson.preview ? onPlayPreview : undefined}
                      >
                        {lesson.preview ? (
                          <Play className="h-4 w-4 text-accent shrink-0" />
                        ) : (
                          <Lock className="h-4 w-4 text-muted-foreground/50 shrink-0" />
                        )}
                        <span className="flex-1">{lesson.title}</span>
                        {lesson.preview && (
                          <Badge variant="outline" className="text-[10px] border-accent/30 text-accent px-2 py-0.5">
                            Clase gratuita
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-5 space-y-3">
              {[
                { icon: BookOpen, text: "150+ lecciones disponibles" },
                { icon: Download, text: "Descargas incluidas" },
                { icon: Users, text: "Tutores certificados" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                  <item.icon className="h-4 w-4 text-primary" />
                  <span>{item.text}</span>
                </div>
              ))}
            </div>

            <Button variant="outline" className="w-full mt-5 rounded-xl font-semibold" onClick={onExploreCourses}>
              Ver cursos completos
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </Card>
        </div>
      </div>
    </section>
  );
};
