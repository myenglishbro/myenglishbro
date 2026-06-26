import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlayCircle, Layers, BookOpen, Clock, Award, Lock } from "lucide-react";

type PreviewLesson = {
  id?: string;
  titulo: string;
  descripcion: string | null;
  video_url: string | null;
  youtube_url: string | null;
  es_preview?: boolean;
  modulo_id?: string | null;
};

type ModuleWithLessons = {
  id: string;
  titulo: string;
  lecciones: PreviewLesson[];
};

type PreviewModalProps = {
  isOpen: boolean;
  onClose: () => void;
  lesson: PreviewLesson | null;
  allPreviewLessons?: PreviewLesson[];
  onSelectLesson?: (lesson: PreviewLesson) => void;
  modules?: ModuleWithLessons[];
  totalLessons: number;
  totalModules: number;
  nivel: string;
  duracionTotal: string | null;
  onInscription: () => void;
};

const getYouTubeEmbedUrl = (url: string | null) => {
  if (!url) return null;
  const watchMatch = url.match(/(?:youtube\.com\/watch\?v=)([^&]+)/);
  if (watchMatch) return `https://www.youtube-nocookie.com/embed/${watchMatch[1]}?rel=0&modestbranding=1`;
  const shortMatch = url.match(/(?:youtu\.be\/)([^?&]+)/);
  if (shortMatch) return `https://www.youtube-nocookie.com/embed/${shortMatch[1]}?rel=0&modestbranding=1`;
  const embedMatch = url.match(/(?:youtube\.com\/embed\/)([^?&]+)/);
  if (embedMatch) return `https://www.youtube-nocookie.com/embed/${embedMatch[1]}?rel=0&modestbranding=1`;
  return null;
};

const getDriveEmbedUrl = (url: string | null) => {
  if (!url) return null;
  const fileIdMatch = url.match(/[-\w]{25,}/);
  if (fileIdMatch) return `https://drive.google.com/file/d/${fileIdMatch[0]}/preview`;
  return url;
};

export const PreviewModal = ({
  isOpen,
  onClose,
  lesson,
  allPreviewLessons = [],
  onSelectLesson,
  modules = [],
  totalLessons,
  totalModules,
  nivel,
  duracionTotal,
  onInscription,
}: PreviewModalProps) => {
  if (!lesson) return null;

  const videoSrc = lesson.youtube_url
    ? getYouTubeEmbedUrl(lesson.youtube_url)
    : getDriveEmbedUrl(lesson.video_url);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card border-0 text-card-foreground max-w-2xl max-h-[90vh] overflow-y-auto p-0 rounded-2xl shadow-2xl gap-0">
        
        {/* Section 1 — Video Preview */}
        <div className="relative">
          {videoSrc ? (
            <div className="w-full aspect-video bg-foreground/95 rounded-t-2xl overflow-hidden">
              <iframe
                src={videoSrc}
                className="w-full h-full"
                allow="autoplay; encrypted-media"
                allowFullScreen
                title={lesson.titulo}
              />
            </div>
          ) : (
            <div className="w-full aspect-video bg-muted rounded-t-2xl flex items-center justify-center">
              <PlayCircle className="h-16 w-16 text-muted-foreground/30" />
            </div>
          )}
          <div className="absolute top-3 left-3">
            <Badge className="bg-emerald-500 text-white border-0 shadow-lg text-xs font-semibold">
              Clase gratuita
            </Badge>
          </div>
        </div>

        {/* Lesson title below video */}
        <div className="px-5 pt-4 pb-3 border-b border-border">
          <h2 className="text-lg font-bold text-foreground leading-snug">{lesson.titulo}</h2>
          {lesson.descripcion && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{lesson.descripcion}</p>
          )}
        </div>

        {/* Section 2 — Curriculum / Temario */}
        {modules.length > 0 && (
          <div className="px-5 py-4 border-b border-border">
            <h3 className="text-sm font-bold text-foreground mb-3">Temario del curso</h3>
            <div className="space-y-3 max-h-52 overflow-y-auto pr-1">
              {modules.map((mod) => (
                <div key={mod.id}>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5 text-primary" />
                    {mod.titulo}
                  </p>
                  <ul className="space-y-0.5">
                    {mod.lecciones.map((lec) => {
                      const isPreview = !!lec.es_preview;
                      const isActive = lec.id === lesson.id;

                      return (
                        <li
                          key={lec.id || lec.titulo}
                          role={isPreview ? "button" : undefined}
                          tabIndex={isPreview ? 0 : undefined}
                          onClick={() => {
                            if (isPreview && onSelectLesson) onSelectLesson(lec);
                          }}
                          className={`flex items-center gap-2.5 text-sm py-2 px-2.5 rounded-lg transition-colors ${
                            isActive
                              ? "bg-primary/10 text-primary font-medium"
                              : isPreview
                              ? "text-foreground cursor-pointer hover:bg-muted/60"
                              : "text-muted-foreground/50"
                          }`}
                        >
                          {isPreview ? (
                            <PlayCircle className={`h-4 w-4 flex-shrink-0 ${isActive ? "text-primary" : "text-emerald-500"}`} />
                          ) : (
                            <Lock className="h-4 w-4 flex-shrink-0 text-muted-foreground/30" />
                          )}
                          <span className="flex-1 text-left truncate">{lec.titulo}</span>
                          {isPreview && (
                            <Badge className="bg-emerald-100 text-emerald-700 border-0 text-[10px] px-1.5 py-0 font-semibold whitespace-nowrap">
                              Clase gratuita
                            </Badge>
                          )}
                          {isActive && (
                            <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 3 — Course includes */}
        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-sm font-bold text-foreground mb-3">Este curso incluye</h3>
          <div className="grid grid-cols-2 gap-2.5 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <PlayCircle className="h-4 w-4 text-primary flex-shrink-0" />
              {totalLessons} lecciones
            </div>
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary flex-shrink-0" />
              {totalModules} módulos
            </div>
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-primary flex-shrink-0" />
              Nivel {nivel}
            </div>
            {duracionTotal && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary flex-shrink-0" />
                {duracionTotal}
              </div>
            )}
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary flex-shrink-0" />
              Recursos descargables
            </div>
          </div>
        </div>

        {/* Section 4 — CTA */}
        <div className="px-5 py-5">
          <p className="text-sm text-muted-foreground text-center mb-3">
            Desbloquea las {totalLessons} lecciones completas.
          </p>
          <Button
            size="lg"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl h-12"
            onClick={() => {
              onClose();
              onInscription();
            }}
          >
            Inscribirme ahora
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
