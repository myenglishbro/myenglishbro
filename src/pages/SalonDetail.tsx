import { useState } from "react";
import { useParams, useNavigate, useSearchParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useTeacherRole } from "@/hooks/useTeacherRole";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft, ChevronRight, School, Video, FileText, Globe,
  ChevronDown, ExternalLink, Eye, Lock, MonitorPlay, ClipboardList,
} from "lucide-react";

type ExtraUrl = { title: string; url: string; type: "web" | "pdf" | "iframe" };

type SalonModulo = { id: string; titulo: string; order_index: number };
type SalonLeccion = {
  id: string;
  modulo_id: string | null;
  titulo: string;
  descripcion: string | null;
  video_url: string | null;
  youtube_url: string | null;
  pdf_url: string | null;
  extra_urls: ExtraUrl[] | null;
  contenido_html: string | null;
  order_index: number;
};

const getEmbedUrl = (url: string): string => {
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  const driveMatch = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  if (driveMatch) return `https://drive.google.com/file/d/${driveMatch[1]}/preview`;
  return url;
};

const getLeccionIcon = (leccion: SalonLeccion) => {
  if (leccion.youtube_url || leccion.video_url) return Video;
  if (leccion.pdf_url) return FileText;
  if (leccion.extra_urls?.some((e) => e.type === "iframe")) return MonitorPlay;
  return Globe;
};

const SalonDetail = () => {
  const { salonId } = useParams<{ salonId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isTeacher, isAdmin, isLoading: roleLoading } = useTeacherRole();

  const isPreview = searchParams.get("preview") === "true";
  const isTeacherPreview = isPreview && (isTeacher || isAdmin);

  const [selectedLeccion, setSelectedLeccion] = useState<SalonLeccion | null>(null);
  const [expandedModulos, setExpandedModulos] = useState<Set<string>>(new Set());

  const { data: salon, isLoading: salonLoading } = useQuery({
    queryKey: ["salon-detail", salonId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("salones")
        .select("id, nombre, descripcion")
        .eq("id", salonId!)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const { data: enrolled, isLoading: enrolledLoading } = useQuery({
    queryKey: ["salon-enrolled", salonId, user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("salon_estudiantes")
        .select("id")
        .eq("salon_id", salonId!)
        .eq("usuario_id", user!.id)
        .maybeSingle();
      return !!data;
    },
    enabled: !!user?.id,
  });

  const { data: modulos = [] } = useQuery({
    queryKey: ["salon-modulos-detail", salonId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("salon_modulos")
        .select("*")
        .eq("salon_id", salonId!)
        .order("order_index", { ascending: true });
      if (error) throw error;
      return data as SalonModulo[];
    },
    enabled: !!(enrolled || isTeacherPreview),
  });

  const { data: lecciones = [] } = useQuery({
    queryKey: ["salon-lecciones-detail", salonId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("salon_lecciones")
        .select("*")
        .eq("salon_id", salonId!)
        .order("order_index", { ascending: true });
      if (error) throw error;
      return data as unknown as SalonLeccion[];
    },
    enabled: !!(enrolled || isTeacherPreview),
  });

  const toggleModulo = (id: string) => {
    setExpandedModulos((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const canAccess = enrolled || isTeacherPreview;

  if (salonLoading || enrolledLoading || (isPreview && roleLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    );
  }

  if (!canAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <School className="h-14 w-14 text-muted-foreground mx-auto mb-3" />
          <h2 className="font-semibold text-lg mb-1">Acceso no autorizado</h2>
          <p className="text-muted-foreground mb-4">No tienes acceso a este salón.</p>
          <Button onClick={() => navigate("/dashboard")}>Volver al dashboard</Button>
        </div>
      </div>
    );
  }

  const leccionesSinModulo = lecciones.filter((l) => !l.modulo_id);

  // Flat ordered list for prev/next navigation
  const allLecciones = [
    ...modulos.flatMap((m) => lecciones.filter((l) => l.modulo_id === m.id)),
    ...leccionesSinModulo,
  ];
  const currentIndex = selectedLeccion
    ? allLecciones.findIndex((l) => l.id === selectedLeccion.id)
    : -1;
  const prevLeccion = currentIndex > 0 ? allLecciones[currentIndex - 1] : null;
  const nextLeccion = currentIndex < allLecciones.length - 1 ? allLecciones[currentIndex + 1] : null;

  const videoUrl = selectedLeccion?.youtube_url
    ? getEmbedUrl(selectedLeccion.youtube_url)
    : selectedLeccion?.video_url
    ? getEmbedUrl(selectedLeccion.video_url)
    : null;

  const iframeItems = selectedLeccion?.extra_urls?.filter((e) => e.type === "iframe") ?? [];
  const linkItems = selectedLeccion?.extra_urls?.filter((e) => e.type !== "iframe") ?? [];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Preview banner */}
      {isTeacherPreview && (
        <div className="bg-amber-100 border-b border-amber-300 px-6 py-2 flex items-center gap-2 text-amber-800 text-sm shrink-0">
          <Eye className="h-4 w-4 shrink-0" />
          <span className="font-medium">Vista de estudiante</span>
          <span className="text-amber-700">— estás previsualizando este salón como lo ven los estudiantes.</span>
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto text-amber-800 hover:bg-amber-200 hover:text-amber-900 h-7"
            onClick={() => navigate(-1)}
          >
            <ChevronLeft className="h-3.5 w-3.5 mr-1" />
            Volver a editar
          </Button>
        </div>
      )}

      {/* Header */}
      <div className="border-b bg-card px-4 py-3 flex items-center gap-3 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={() => (isTeacherPreview ? navigate(-1) : navigate("/dashboard"))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2 min-w-0">
          <School className="h-4 w-4 text-primary shrink-0" />
          <h1 className="font-semibold text-sm text-foreground truncate">{salon?.nombre}</h1>
        </div>
        {selectedLeccion && allLecciones.length > 0 && (
          <span className="ml-auto text-xs text-muted-foreground shrink-0">
            {currentIndex + 1} / {allLecciones.length}
          </span>
        )}
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-72 border-r bg-card overflow-y-auto shrink-0 flex flex-col">
          <div className="p-3 border-b">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Contenido del salón
            </p>
          </div>

          {/* Activities link */}
          {!isTeacherPreview && (
            <div className="px-2 py-2 border-b">
              <Link to={`/salon/${salonId}/actividades`}>
                <button className="w-full flex items-center gap-2 px-2 py-2 rounded-md hover:bg-primary/10 text-left text-primary">
                  <ClipboardList className="h-4 w-4 shrink-0" />
                  <span className="text-sm font-medium">Actividades</span>
                </button>
              </Link>
            </div>
          )}

          <nav className="flex-1 p-2 space-y-0.5">
            {modulos.map((modulo, modIdx) => {
              const isExpanded = expandedModulos.has(modulo.id);
              const leccionesModulo = lecciones.filter((l) => l.modulo_id === modulo.id);
              return (
                <div key={modulo.id}>
                  <button
                    className="w-full flex items-center gap-2 px-2 py-2 rounded-md hover:bg-muted/60 text-left group"
                    onClick={() => toggleModulo(modulo.id)}
                  >
                    <ChevronDown
                      className={`h-3.5 w-3.5 text-muted-foreground shrink-0 transition-transform ${
                        isExpanded ? "" : "-rotate-90"
                      }`}
                    />
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex-1 truncate">
                      Módulo {modIdx + 1} — {modulo.titulo}
                    </span>
                    <span className="text-[10px] text-muted-foreground shrink-0 bg-muted rounded px-1">
                      {leccionesModulo.length}
                    </span>
                  </button>
                  {isExpanded && (
                    <div className="ml-2 mt-0.5 space-y-0.5 mb-1">
                      {leccionesModulo.map((leccion) => {
                        const Icon = getLeccionIcon(leccion);
                        const isActive = selectedLeccion?.id === leccion.id;
                        return (
                          <button
                            key={leccion.id}
                            className={`w-full text-left px-3 py-2 rounded-md text-sm transition-all flex items-center gap-2 border-l-2 ${
                              isActive
                                ? "bg-primary/10 text-primary font-medium border-primary"
                                : "text-foreground/80 hover:bg-muted/60 hover:text-foreground border-transparent"
                            }`}
                            onClick={() => setSelectedLeccion(leccion)}
                          >
                            <Icon className={`h-3.5 w-3.5 shrink-0 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                            <span className="truncate">{leccion.titulo}</span>
                          </button>
                        );
                      })}
                      {leccionesModulo.length === 0 && (
                        <p className="text-xs text-muted-foreground px-3 py-1.5">Sin lecciones</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {leccionesSinModulo.length > 0 && (
              <>
                {modulos.length > 0 && (
                  <div className="px-2 pt-2 pb-1">
                    <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      General
                    </p>
                  </div>
                )}
                {leccionesSinModulo.map((leccion) => {
                  const Icon = getLeccionIcon(leccion);
                  const isActive = selectedLeccion?.id === leccion.id;
                  return (
                    <button
                      key={leccion.id}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-all flex items-center gap-2 border-l-2 ${
                        isActive
                          ? "bg-primary/10 text-primary font-medium border-primary"
                          : "text-foreground/80 hover:bg-muted/60 hover:text-foreground border-transparent"
                      }`}
                      onClick={() => setSelectedLeccion(leccion)}
                    >
                      <Icon className={`h-3.5 w-3.5 shrink-0 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                      <span className="truncate">{leccion.titulo}</span>
                    </button>
                  );
                })}
              </>
            )}

            {lecciones.length === 0 && (
              <div className="px-2 py-8 text-center">
                <p className="text-sm text-muted-foreground">Aún no hay contenido disponible.</p>
              </div>
            )}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          {!selectedLeccion ? (
            <div className="flex items-center justify-center h-full text-center p-8">
              <div className="max-w-sm">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <School className="h-8 w-8 text-primary" />
                </div>
                <h2 className="font-bold text-xl mb-2">{salon?.nombre}</h2>
                {salon?.descripcion && (
                  <p className="text-muted-foreground text-sm mb-4">{salon.descripcion}</p>
                )}
                {allLecciones.length > 0 && (
                  <p className="text-xs text-muted-foreground mb-6">
                    {allLecciones.length} lección{allLecciones.length !== 1 ? "es" : ""} disponible{allLecciones.length !== 1 ? "s" : ""}
                  </p>
                )}
                {allLecciones.length > 0 && (
                  <Button onClick={() => setSelectedLeccion(allLecciones[0])}>
                    Comenzar
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto px-6 py-8">
              {/* Lesson header */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-foreground">{selectedLeccion.titulo}</h2>
                {selectedLeccion.descripcion && (
                  <p className="text-muted-foreground mt-2">{selectedLeccion.descripcion}</p>
                )}
              </div>

              {/* Video */}
              {videoUrl && (
                <div className="mb-8">
                  <SectionLabel icon={<Video className="h-3.5 w-3.5" />} label="Video" />
                  <div className="rounded-xl overflow-hidden bg-black aspect-video relative">
                    <iframe
                      src={videoUrl}
                      className="w-full h-full"
                      allowFullScreen
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      sandbox="allow-scripts allow-same-origin allow-presentation"
                    />
                    {videoUrl.includes("drive.google.com") && (
                      <div
                        className="absolute top-0 right-0 w-16 h-16 bg-black flex items-center justify-center cursor-not-allowed z-10"
                        onClick={(e) => e.preventDefault()}
                        onContextMenu={(e) => e.preventDefault()}
                        title="Contenido exclusivo"
                      >
                        <Lock className="h-4 w-4 text-white/40" />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* HTML content */}
              {selectedLeccion.contenido_html && (
                <div className="mb-8">
                  <SectionLabel icon={<MonitorPlay className="h-3.5 w-3.5" />} label="Contenido" />
                  <div
                    className="prose prose-sm max-w-none [&_iframe]:w-full [&_iframe]:rounded-xl [&_iframe]:border"
                    dangerouslySetInnerHTML={{ __html: selectedLeccion.contenido_html }}
                  />
                </div>
              )}

              {/* Embedded iframes */}
              {iframeItems.map((extra, i) => (
                <div key={i} className="mb-8">
                  <SectionLabel icon={<MonitorPlay className="h-3.5 w-3.5" />} label={extra.title} />
                  <div className="rounded-xl overflow-hidden border bg-muted/20" style={{ height: 520 }}>
                    <iframe
                      src={extra.url}
                      className="w-full h-full"
                      title={extra.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    />
                  </div>
                </div>
              ))}

              {/* PDF */}
              {selectedLeccion.pdf_url && (
                <div className="mb-8">
                  <SectionLabel icon={<FileText className="h-3.5 w-3.5" />} label="Documento PDF" />
                  <div className="relative rounded-xl overflow-hidden border">
                    <iframe
                      src={getEmbedUrl(selectedLeccion.pdf_url)}
                      className="w-full h-[600px]"
                      sandbox="allow-scripts allow-same-origin"
                    />
                    <div
                      className="absolute top-0 right-0 w-16 h-16 bg-background flex items-center justify-center cursor-not-allowed z-10"
                      onClick={(e) => e.preventDefault()}
                      onContextMenu={(e) => e.preventDefault()}
                      title="Contenido exclusivo"
                    >
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div
                      className="absolute top-0 right-0 w-20 h-20 pointer-events-auto z-10"
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                      onContextMenu={(e) => e.preventDefault()}
                    />
                  </div>
                </div>
              )}

              {/* Links / extra resources */}
              {linkItems.length > 0 && (
                <div className="mb-8">
                  <SectionLabel icon={<Globe className="h-3.5 w-3.5" />} label="Recursos adicionales" />
                  <div className="space-y-2">
                    {linkItems.map((extra, i) => (
                      <a
                        key={i}
                        href={extra.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3.5 rounded-xl border bg-card hover:bg-muted/50 transition-colors text-sm group"
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          extra.type === "pdf" ? "bg-red-100" : "bg-blue-100"
                        }`}>
                          {extra.type === "pdf" ? (
                            <FileText className="h-4 w-4 text-red-600" />
                          ) : (
                            <Globe className="h-4 w-4 text-blue-600" />
                          )}
                        </div>
                        <span className="font-medium flex-1 text-foreground">{extra.title}</span>
                        <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Prev / Next navigation */}
              <div className="flex items-center justify-between pt-4 border-t mt-4">
                <Button
                  variant="outline"
                  onClick={() => prevLeccion && setSelectedLeccion(prevLeccion)}
                  disabled={!prevLeccion}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Anterior
                </Button>
                <span className="text-xs text-muted-foreground">
                  {currentIndex + 1} de {allLecciones.length}
                </span>
                <Button
                  variant="outline"
                  onClick={() => nextLeccion && setSelectedLeccion(nextLeccion)}
                  disabled={!nextLeccion}
                >
                  Siguiente
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

const SectionLabel = ({ icon, label }: { icon: React.ReactNode; label: string }) => (
  <div className="flex items-center gap-2 mb-3">
    <span className="text-muted-foreground">{icon}</span>
    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
    <div className="flex-1 h-px bg-border" />
  </div>
);

export default SalonDetail;
