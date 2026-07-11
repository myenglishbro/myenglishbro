import { useState, useEffect } from "react";
import { useParams, Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useTeacherRole } from "@/hooks/useTeacherRole";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";

import { PlayCircle, ChevronLeft, ChevronRight, FileText, Lock, Globe, Menu, X, CheckCircle2, MonitorPlay, Eye } from "lucide-react";

import { SecurePDFViewer } from "@/components/pdf/SecurePDFViewer";
import { SecureWebViewer } from "@/components/pdf/SecureWebViewer";
import { LessonContent } from "@/components/lessons/LessonContent";
import { LeccionActividades } from "@/components/activities/LeccionActividades";
import { useDbCourseProgress } from "@/hooks/useDbCourseProgress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import logoAce from "@/assets/logo-ace.png";

const CourseDetail = () => {
  const { courseId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isTeacher, isAdmin, isLoading: roleLoading } = useTeacherRole();
  const isPreview = searchParams.get("preview") === "true";
  const isTeacherPreview = isPreview && (isTeacher || isAdmin);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [showPdfViewer, setShowPdfViewer] = useState(false);
  const [extraViewerUrl, setExtraViewerUrl] = useState<string | null>(null);
  const [extraViewerTitle, setExtraViewerTitle] = useState<string>("");
  const [extraViewerType, setExtraViewerType] = useState<"pdf" | "web" | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Progress tracking
  const {
    isLessonCompleted,
    toggleLesson,
    getCompletedCount,
    getProgressPercentage,
  } = useDbCourseProgress(courseId, user?.id);

  // Verify enrollment
  const { data: enrollment, isLoading: enrollmentLoading } = useQuery({
    queryKey: ["enrollment", courseId, user?.id],
    queryFn: async () => {
      if (!user?.id || !courseId) return null;
      
      const { data, error } = await supabase
        .from("matriculas")
        .select("*")
        .eq("usuario_id", user.id)
        .eq("curso_id", courseId)
        .eq("estado", "activa")
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id && !!courseId,
  });

  // Fetch course info
  const { data: curso } = useQuery({
    queryKey: ["course", courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cursos")
        .select("*")
        .eq("id", courseId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!courseId,
  });

  // Fetch modules
  const { data: modulos = [] } = useQuery({
    queryKey: ["course-modulos", courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("modulos")
        .select("*")
        .eq("curso_id", courseId)
        .order("order_index", { ascending: true });
      
      if (error) throw error;
      return data;
    },
    enabled: !!courseId && !!(enrollment || isTeacherPreview),
  });

  // Fetch lessons
  const { data: lecciones, isLoading: leccionesLoading } = useQuery({
    queryKey: ["lessons", courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lecciones")
        .select("*")
        .eq("curso_id", courseId)
        .order("order_index", { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!courseId && !!(enrollment || isTeacherPreview),
  });

  // Group lessons by module using modulo_id (or legacy modulo field as fallback)
  const lessonsByModule = modulos.length > 0
    ? modulos.reduce((acc, modulo) => {
        const moduleLessons = lecciones?.filter(l => (l as any).modulo_id === modulo.id) || [];
        if (moduleLessons.length > 0 || modulos.length === 1) {
          acc[modulo.titulo] = moduleLessons.sort((a, b) => 
            ((a as any).order_index || 0) - ((b as any).order_index || 0)
          );
        }
        return acc;
      }, {} as Record<string, typeof lecciones>)
    : lecciones?.reduce((acc, leccion) => {
        const modulo = (leccion as any).modulo || "General";
        if (!acc[modulo]) acc[modulo] = [];
        acc[modulo].push(leccion);
        return acc;
      }, {} as Record<string, typeof lecciones>) || {};

  // Get flat sorted list for navigation
  const sortedLecciones = modulos.length > 0
    ? modulos
        .sort((a, b) => a.order_index - b.order_index)
        .flatMap(m => 
          (lecciones || [])
            .filter(l => (l as any).modulo_id === m.id)
            .sort((a, b) => ((a as any).order_index || 0) - ((b as any).order_index || 0))
        )
    : lecciones || [];


  // No auto-select - user must choose a lesson

  // Close sidebar on mobile when lesson is selected
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (enrollmentLoading || (isPreview && roleLoading)) {
    return (
      <div className="dashboard flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  // Redirect if not enrolled (unless a teacher/admin is previewing)
  if (!enrollment && !isTeacherPreview) {
    return <Navigate to="/dashboard/courses" replace />;
  }

  const selectedLesson = sortedLecciones?.find(l => l.id === selectedLessonId);
  
  // Get current lesson index and next lesson - use sortedLecciones for proper order
  const currentLessonIndex = sortedLecciones?.findIndex(l => l.id === selectedLessonId) ?? -1;
  const nextLesson = sortedLecciones && currentLessonIndex >= 0 && currentLessonIndex < sortedLecciones.length - 1 
    ? sortedLecciones[currentLessonIndex + 1] 
    : null;
  const prevLesson = sortedLecciones && currentLessonIndex > 0 
    ? sortedLecciones[currentLessonIndex - 1] 
    : null;

  // Handle lesson selection
  const handleSelectLesson = (lessonId: string) => {
    setSelectedLessonId(lessonId);
    // Close sidebar on mobile after selection
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  // Convert Google Drive URL to embed URL
  const getDriveEmbedUrl = (url: string | null): string | null => {
    if (!url) return null;
    
    const fileIdMatch = url.match(/[-\w]{25,}/);
    if (fileIdMatch) {
      return `https://drive.google.com/file/d/${fileIdMatch[0]}/preview`;
    }
    return url;
  };

  // Convert YouTube URL to embed URL
  const getYouTubeEmbedUrl = (url: string | null) => {
    if (!url) return null;
    
    // Handle various YouTube URL formats
    let videoId = null;
    
    // youtube.com/watch?v=VIDEO_ID
    const watchMatch = url.match(/(?:youtube\.com\/watch\?v=)([^&]+)/);
    if (watchMatch) videoId = watchMatch[1];
    
    // youtu.be/VIDEO_ID
    const shortMatch = url.match(/(?:youtu\.be\/)([^?&]+)/);
    if (shortMatch) videoId = shortMatch[1];
    
    // youtube.com/embed/VIDEO_ID
    const embedMatch = url.match(/(?:youtube\.com\/embed\/)([^?&]+)/);
    if (embedMatch) videoId = embedMatch[1];
    
    if (videoId) {
      return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`;
    }
    return null;
  };

  if (leccionesLoading) {
    return (
      <div className="dashboard flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando lecciones...</p>
        </div>
      </div>
    );
  }

  if (!sortedLecciones || sortedLecciones.length === 0) {
    return (
      <div className="dashboard flex h-screen bg-gray-50">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Lock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Aún no hay lecciones disponibles
            </h3>
            <p className="text-gray-600 mb-6">Este curso está en preparación</p>
            <Link to="/dashboard/courses">
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                Volver a mis cursos
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard flex flex-col h-screen bg-gray-50 relative">
      {/* Preview banner */}
      {isTeacherPreview && (
        <div className="bg-amber-100 border-b border-amber-300 px-6 py-2 flex items-center gap-2 text-amber-800 text-sm shrink-0 z-50">
          <Eye className="h-4 w-4 shrink-0" />
          <span className="font-medium">Vista de estudiante</span>
          <span className="text-amber-700">— estás previsualizando este curso como lo ven los estudiantes.</span>
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

      <div className="flex flex-1 min-h-0 relative">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar with lessons */}
      <div 
        className={`
          fixed md:relative z-40 h-full bg-white border-r border-gray-200 shadow-sm
          transition-all duration-300 ease-in-out
          ${sidebarOpen ? "w-80 translate-x-0" : "w-0 -translate-x-full md:w-0 md:translate-x-0"}
        `}
      >
        <div className={`w-80 h-full flex flex-col ${!sidebarOpen ? "hidden" : ""}`}>
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <Link to="/dashboard/courses">
                <Button variant="ghost" size="sm" className="hover:bg-gray-100 text-gray-700">
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Volver
                </Button>
              </Link>
              <Button 
                variant="ghost" 
                size="sm" 
                className="md:hidden"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <h2 className="text-lg font-bold text-gray-900">{curso?.titulo}</h2>
            <p className="text-sm text-gray-500 mb-2">{sortedLecciones.length} lecciones</p>
            
            {/* Course progress bar */}
            {sortedLecciones.length > 0 && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Progreso</span>
                  <span className="font-semibold text-primary">
                    {getProgressPercentage(sortedLecciones.map(l => l.id))}%
                  </span>
                </div>
                <Progress 
                  value={getProgressPercentage(sortedLecciones.map(l => l.id))} 
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground">
                  {getCompletedCount(sortedLecciones.map(l => l.id))}/{sortedLecciones.length} completadas
                </p>
              </div>
            )}
          </div>

          <ScrollArea className="flex-1">
            <div className="p-4">
              <Accordion type="multiple" className="space-y-2">
                {Object.entries(lessonsByModule).map(([modulo, moduleLecciones]) => {
                  const moduleLessonIds = moduleLecciones?.map(l => l.id) || [];
                  const moduleDone = getCompletedCount(moduleLessonIds);
                  const moduleTotal = moduleLessonIds.length;

                  return (
                  <AccordionItem 
                    key={modulo} 
                    value={modulo}
                    className="border rounded-lg bg-gray-50 overflow-hidden"
                  >
                    <AccordionTrigger className="px-4 py-3 bg-slate-700 text-white hover:bg-slate-600 hover:no-underline font-semibold">
                      <div className="flex items-center justify-between w-full mr-2">
                        <span>{modulo}</span>
                        <span className="text-xs font-normal opacity-80 flex items-center gap-1">
                          {moduleDone === moduleTotal && moduleTotal > 0 && (
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                          )}
                          {moduleDone}/{moduleTotal}
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="p-2 space-y-2">
                      {/* Module progress bar */}
                      {moduleTotal > 0 && (
                        <div className="px-2 pb-1">
                          <Progress value={Math.round((moduleDone / moduleTotal) * 100)} className="h-1.5" />
                        </div>
                      )}
                      {moduleLecciones?.map((leccion) => {
                        const isSelected = selectedLessonId === leccion.id;
                        const completed = isLessonCompleted(leccion.id);
                        return (
                          <div
                            key={leccion.id}
                            className={`w-full text-left p-3 rounded-lg transition-all duration-200 flex items-start gap-3 ${
                              isSelected
                                ? "bg-indigo-100 border-2 border-indigo-500"
                                : "bg-white border border-gray-200 hover:bg-gray-100"
                            }`}
                          >
                            <div className="pt-0.5 shrink-0">
                              <Checkbox
                                checked={completed}
                                onCheckedChange={() => toggleLesson(leccion.id)}
                                className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                              />
                            </div>
                            <button
                              onClick={() => handleSelectLesson(leccion.id)}
                              className="flex-1 min-w-0 text-left"
                            >
                              <p className={`font-medium text-sm ${completed ? "text-muted-foreground line-through" : "text-gray-900"}`}>
                                {leccion.titulo}
                              </p>
                              {leccion.descripcion && (
                                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{leccion.descripcion}</p>
                              )}
                              <div className="flex flex-wrap gap-1 mt-2">
                                {leccion.video_url && (
                                  <span className="flex items-center gap-1 text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                                    <PlayCircle className="h-3 w-3" />
                                  </span>
                                )}
                                {leccion.pdf_url && (
                                  <span className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                                    <FileText className="h-3 w-3" />
                                  </span>
                                )}
                                {leccion.extra_urls && (leccion.extra_urls as any[]).length > 0 && (
                                  <span className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                                    <Globe className="h-3 w-3" /> +{(leccion.extra_urls as any[]).length}
                                  </span>
                                )}
                              </div>
                            </button>
                          </div>
                        );
                      })}
                    </AccordionContent>
                  </AccordionItem>
                  );
                })}
              </Accordion>
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 overflow-auto bg-gray-50">
        {/* Toggle sidebar button */}
        <div className="sticky top-0 z-20 bg-gray-50 border-b border-gray-200 p-2 flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex items-center gap-2"
          >
            <Menu className="h-4 w-4" />
            <span className="hidden sm:inline">{sidebarOpen ? "Ocultar menú" : "Ver lecciones"}</span>
          </Button>
          {selectedLesson && (
            <span className="text-sm text-gray-600 truncate">
              {selectedLesson.titulo}
            </span>
          )}
        </div>

        <div className="p-4 md:p-8 max-w-5xl mx-auto">
          {selectedLesson ? (
            <>
              {/* Video - YouTube or Google Drive */}
              {(selectedLesson.video_url || (selectedLesson as any).youtube_url) && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden relative">
                  <iframe
                    src={
                      (selectedLesson as any).youtube_url 
                        ? getYouTubeEmbedUrl((selectedLesson as any).youtube_url) || ""
                        : getDriveEmbedUrl(selectedLesson.video_url) || ""
                    }
                    className="w-full aspect-video max-h-[450px] relative z-10"
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                    title={selectedLesson.titulo}
                  />
                  
                  {/* Overlay central - Loading con logo */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 pointer-events-none z-0">
                    <img 
                      src={logoAce}
                      alt="Acelingua" 
                      className="h-12 md:h-16 w-auto mb-4 animate-pulse"
                    />
                    <span className="text-white/80 text-sm font-medium tracking-wide">Cargando...</span>
                  </div>
                </div>
              )}

              {/* Lesson info + Navigation */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-3 flex-wrap">
                  <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                    {selectedLesson.titulo}
                  </h1>
                  <span className="bg-indigo-600 text-white text-xs px-3 py-1 rounded-full font-semibold">
                    Lección {currentLessonIndex + 1}
                  </span>
                </div>
                {selectedLesson.descripcion && (
                  <p className="text-gray-600 mb-4">{selectedLesson.descripcion}</p>
                )}
                
                {/* Navigation buttons */}
                <div className="flex items-center gap-3 flex-wrap">
                  {prevLesson && (
                    <Button
                      variant="outline"
                      onClick={() => handleSelectLesson(prevLesson.id)}
                      className="flex items-center gap-2"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                  )}
                  {nextLesson && (
                    <Button
                      onClick={() => handleSelectLesson(nextLesson.id)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2"
                    >
                      Next lesson
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* PDF Resource */}
              {selectedLesson.pdf_url && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 mb-6">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-emerald-100 rounded-lg">
                        <FileText className="h-6 w-6 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Material de apoyo</h3>
                        <p className="text-sm text-gray-500">PDF de la lección</p>
                      </div>
                    </div>
                    <Button 
                      onClick={() => setShowPdfViewer(true)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Ver PDF
                    </Button>
                  </div>
                </div>
              )}

              {/* Extra Resources (PDFs and Web Links) */}
              {selectedLesson.extra_urls && (selectedLesson.extra_urls as any[]).length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recursos adicionales</h3>
                  <div className="space-y-3">
                    {(selectedLesson.extra_urls as any[]).map((item: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100 flex-wrap gap-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${item.type === "web" ? "bg-indigo-100" : "bg-emerald-100"}`}>
                            {item.type === "web" ? (
                              <Globe className="h-5 w-5 text-indigo-600" />
                            ) : (
                              <FileText className="h-5 w-5 text-emerald-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{item.title}</p>
                            <p className="text-xs text-gray-500">
                              {item.type === "web" ? "Página web" : "PDF"}
                            </p>
                          </div>
                        </div>
                        <Button
                          onClick={() => {
                            setExtraViewerUrl(item.url);
                            setExtraViewerTitle(item.title);
                            setExtraViewerType(item.type === "web" ? "web" : "pdf");
                          }}
                          className={item.type === "web" 
                            ? "bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
                            : "bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                          }
                        >
                          {item.type === "web" ? (
                            <>
                              <Globe className="h-4 w-4 mr-2" />
                              Ver página
                            </>
                          ) : (
                            <>
                              <FileText className="h-4 w-4 mr-2" />
                              Ver PDF
                            </>
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* HTML Content (iframes, embeds) */}
              {(selectedLesson as any).contenido_html && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <MonitorPlay className="h-5 w-5 text-purple-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Contenido interactivo</h3>
                  </div>
                  <LessonContent html={(selectedLesson as any).contenido_html} />
                </div>
              )}

              {/* Practice activities for this lesson */}
              <LeccionActividades leccionId={selectedLesson.id} />

              {/* Secure PDF Viewer Modal */}
              {showPdfViewer && selectedLesson.pdf_url && (
                <SecurePDFViewer
                  url={selectedLesson.pdf_url}
                  title={`${selectedLesson.titulo} - Material`}
                  onClose={() => setShowPdfViewer(false)}
                />
              )}

              {/* Extra Resource Viewer */}
              {extraViewerUrl && extraViewerType === "pdf" && (
                <SecurePDFViewer
                  url={extraViewerUrl}
                  title={extraViewerTitle}
                  onClose={() => {
                    setExtraViewerUrl(null);
                    setExtraViewerType(null);
                  }}
                />
              )}
              {extraViewerUrl && extraViewerType === "web" && (
                <SecureWebViewer
                  url={extraViewerUrl}
                  title={extraViewerTitle}
                  onClose={() => {
                    setExtraViewerUrl(null);
                    setExtraViewerType(null);
                  }}
                />
              )}
            </>
          ) : (
            <div className="text-center py-20">
              <img 
                src={logoAce}
                alt="Acelingua" 
                className="h-20 md:h-28 w-auto mx-auto mb-6 p-4 rounded-2xl"
              />
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                Welcome to your platform!
              </h2>
              <p className="text-gray-600 text-lg">
                Select a topic to study from the side menu
              </p>
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
};

export default CourseDetail;