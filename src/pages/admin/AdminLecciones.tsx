import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Plus, ChevronLeft, Upload, Download, FolderPlus } from "lucide-react";
import { DragDropContext, Droppable, DropResult } from "@hello-pangea/dnd";

import { ModuleCard } from "./components/lessons/ModuleCard";
import { ModuleFormDialog } from "./components/lessons/ModuleFormDialog";
import { LessonFormDialog } from "./components/lessons/LessonFormDialog";
import { ImportDialog } from "./components/lessons/ImportDialog";
import { ExportDialog } from "./components/lessons/ExportDialog";
import {
  Modulo,
  Leccion,
  Curso,
  ModuloFormData,
  LeccionFormData,
  JsonModulo,
  ImportConflictResolution,
  ExtraUrl,
} from "./types/lessonManagement.types";

const AdminLecciones = () => {
  const { cursoId } = useParams();
  const queryClient = useQueryClient();

  // Dialog states
  const [isModuleDialogOpen, setIsModuleDialogOpen] = useState(false);
  const [isLessonDialogOpen, setIsLessonDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [exportModuloId, setExportModuloId] = useState<string | undefined>();

  // Editing states
  const [editingModulo, setEditingModulo] = useState<Modulo | null>(null);
  const [editingLeccion, setEditingLeccion] = useState<Leccion | null>(null);
  const [defaultModuloId, setDefaultModuloId] = useState<string | undefined>();

  // Fetch course
  const { data: curso } = useQuery({
    queryKey: ["curso", cursoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cursos")
        .select("*")
        .eq("id", cursoId)
        .single();
      if (error) throw error;
      return data as Curso;
    },
  });

  // Fetch modules
  const { data: modulos = [], isLoading: modulosLoading } = useQuery({
    queryKey: ["modulos", cursoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("modulos")
        .select("*")
        .eq("curso_id", cursoId)
        .order("order_index", { ascending: true });
      if (error) throw error;
      return data as Modulo[];
    },
  });

  // Fetch lessons
  const { data: lecciones = [], isLoading: leccionesLoading } = useQuery({
    queryKey: ["lecciones", cursoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lecciones")
        .select("*")
        .eq("curso_id", cursoId)
        .order("order_index", { ascending: true });
      if (error) throw error;
      return data as unknown as Leccion[];
    },
  });

  // Create module mutation
  const createModuloMutation = useMutation({
    mutationFn: async (data: ModuloFormData) => {
      const maxOrder = modulos.length > 0 
        ? Math.max(...modulos.map(m => m.order_index)) + 1 
        : 0;
      
      const { error } = await supabase.from("modulos").insert({
        curso_id: cursoId,
        titulo: data.titulo,
        slug: data.slug,
        order_index: maxOrder,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["modulos", cursoId] });
      toast.success("Módulo creado");
      setIsModuleDialogOpen(false);
    },
    onError: (error) => toast.error("Error: " + error.message),
  });

  // Update module mutation
  const updateModuloMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ModuloFormData }) => {
      const { error } = await supabase
        .from("modulos")
        .update({ titulo: data.titulo, slug: data.slug })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["modulos", cursoId] });
      toast.success("Módulo actualizado");
      setIsModuleDialogOpen(false);
      setEditingModulo(null);
    },
    onError: (error) => toast.error("Error: " + error.message),
  });

  // Delete module mutation
  const deleteModuloMutation = useMutation({
    mutationFn: async (id: string) => {
      // First delete all lessons in this module
      const { error: lessonsError } = await supabase
        .from("lecciones")
        .delete()
        .eq("modulo_id", id);
      if (lessonsError) throw lessonsError;

      const { error } = await supabase.from("modulos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["modulos", cursoId] });
      queryClient.invalidateQueries({ queryKey: ["lecciones", cursoId] });
      toast.success("Módulo eliminado");
    },
    onError: (error) => toast.error("Error: " + error.message),
  });

  // Create lesson mutation
  const createLeccionMutation = useMutation({
    mutationFn: async (data: LeccionFormData) => {
      const moduloLecciones = lecciones.filter(l => l.modulo_id === data.modulo_id);
      const maxOrder = moduloLecciones.length > 0
        ? Math.max(...moduloLecciones.map(l => l.order_index)) + 1
        : 0;

      const { error } = await supabase.from("lecciones").insert({
        curso_id: cursoId,
        modulo_id: data.modulo_id,
        titulo: data.titulo,
        slug: data.slug,
        descripcion: data.descripcion || null,
        orden: maxOrder,
        order_index: maxOrder,
        video_url: data.video_url || null,
        youtube_url: data.youtube_url || null,
        pdf_url: data.pdf_url || null,
        extra_urls: data.extra_urls.length > 0 ? data.extra_urls : null,
        contenido_html: data.contenido_html || null,
        modulo: modulos.find(m => m.id === data.modulo_id)?.titulo || null,
        es_preview: data.es_preview || false,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lecciones", cursoId] });
      toast.success("Lección creada");
      setIsLessonDialogOpen(false);
    },
    onError: (error) => toast.error("Error: " + error.message),
  });

  // Update lesson mutation
  const updateLeccionMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: LeccionFormData }) => {
      const { error } = await supabase
        .from("lecciones")
        .update({
          modulo_id: data.modulo_id,
          titulo: data.titulo,
          slug: data.slug,
          descripcion: data.descripcion || null,
          video_url: data.video_url || null,
          youtube_url: data.youtube_url || null,
          pdf_url: data.pdf_url || null,
          extra_urls: data.extra_urls.length > 0 ? data.extra_urls : null,
          contenido_html: data.contenido_html || null,
          modulo: modulos.find(m => m.id === data.modulo_id)?.titulo || null,
          es_preview: data.es_preview || false,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lecciones", cursoId] });
      toast.success("Lección actualizada");
      setIsLessonDialogOpen(false);
      setEditingLeccion(null);
    },
    onError: (error) => toast.error("Error: " + error.message),
  });

  // Delete lesson mutation
  const deleteLeccionMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("lecciones").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lecciones", cursoId] });
      toast.success("Lección eliminada");
    },
    onError: (error) => toast.error("Error: " + error.message),
  });

  // Reorder modules mutation
  const reorderModulosMutation = useMutation({
    mutationFn: async (updates: { id: string; order_index: number }[]) => {
      for (const update of updates) {
        const { error } = await supabase
          .from("modulos")
          .update({ order_index: update.order_index })
          .eq("id", update.id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["modulos", cursoId] });
      toast.success("Orden actualizado");
    },
    onError: (error) => toast.error("Error: " + error.message),
  });

  // Reorder lessons mutation
  const reorderLeccionesMutation = useMutation({
    mutationFn: async (updates: { id: string; order_index: number; modulo_id: string; modulo: string | null }[]) => {
      for (const update of updates) {
        const { error } = await supabase
          .from("lecciones")
          .update({ 
            order_index: update.order_index,
            orden: update.order_index,
            modulo_id: update.modulo_id,
            modulo: update.modulo,
          })
          .eq("id", update.id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lecciones", cursoId] });
      toast.success("Orden actualizado");
    },
    onError: (error) => toast.error("Error: " + error.message),
  });

  // Import mutation
  const importMutation = useMutation({
    mutationFn: async ({ 
      modulosData, 
      conflictResolution 
    }: { 
      modulosData: JsonModulo[]; 
      conflictResolution: ImportConflictResolution;
    }) => {
      const existingModuloSlugs = modulos.map(m => m.slug);
      const existingLeccionSlugs = lecciones.map(l => l.slug);
      let moduleOrder = modulos.length > 0 ? Math.max(...modulos.map(m => m.order_index)) + 1 : 0;

      for (const modData of modulosData) {
        let moduloId: string;
        let moduloSlug = modData.slug;
        const existingModulo = modulos.find(m => m.slug === moduloSlug);

        if (existingModulo) {
          if (conflictResolution === "skip") continue;
          if (conflictResolution === "duplicate") {
            moduloSlug = `${moduloSlug}-copy`;
          }
          if (conflictResolution === "overwrite") {
            await supabase
              .from("modulos")
              .update({ titulo: modData.titulo })
              .eq("id", existingModulo.id);
            moduloId = existingModulo.id;
          } else {
            const { data: newMod, error } = await supabase
              .from("modulos")
              .insert({
                curso_id: cursoId,
                titulo: modData.titulo,
                slug: moduloSlug,
                order_index: moduleOrder++,
              })
              .select()
              .single();
            if (error) throw error;
            moduloId = newMod.id;
          }
        } else {
          const { data: newMod, error } = await supabase
            .from("modulos")
            .insert({
              curso_id: cursoId,
              titulo: modData.titulo,
              slug: moduloSlug,
              order_index: moduleOrder++,
            })
            .select()
            .single();
          if (error) throw error;
          moduloId = newMod.id;
        }

        // Import lessons for this module
        let lessonOrder = 0;
        for (const lecData of modData.lecciones) {
          let leccionSlug = lecData.slug;
          const existingLeccion = lecciones.find(l => l.slug === leccionSlug);

          if (existingLeccion) {
            if (conflictResolution === "skip") continue;
            if (conflictResolution === "duplicate") {
              leccionSlug = `${leccionSlug}-copy`;
            }
            if (conflictResolution === "overwrite") {
              await supabase
                .from("lecciones")
                .update({
                  titulo: lecData.titulo,
                  descripcion: lecData.descripcion || null,
                  video_url: lecData.video_url || null,
                  youtube_url: lecData.youtube_url || null,
                  pdf_url: lecData.pdf_url || null,
                  extra_urls: lecData.extra_urls || null,
                  modulo_id: moduloId,
                  modulo: modData.titulo,
                })
                .eq("id", existingLeccion.id);
              continue;
            }
          }

          await supabase.from("lecciones").insert({
            curso_id: cursoId,
            modulo_id: moduloId,
            titulo: lecData.titulo,
            slug: leccionSlug,
            descripcion: lecData.descripcion || null,
            orden: lessonOrder,
            order_index: lessonOrder++,
            video_url: lecData.video_url || null,
            youtube_url: lecData.youtube_url || null,
            pdf_url: lecData.pdf_url || null,
            extra_urls: lecData.extra_urls || null,
            modulo: modData.titulo,
          });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["modulos", cursoId] });
      queryClient.invalidateQueries({ queryKey: ["lecciones", cursoId] });
      toast.success("Importación completada");
    },
    onError: (error) => toast.error("Error: " + error.message),
  });

  // Handle drag end
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination, type } = result;

    if (type === "module") {
      const newModulos = [...modulos].sort((a, b) => a.order_index - b.order_index);
      const [moved] = newModulos.splice(source.index, 1);
      newModulos.splice(destination.index, 0, moved);

      const updates = newModulos.map((m, i) => ({ id: m.id, order_index: i }));
      reorderModulosMutation.mutate(updates);
    } else if (type === "lesson") {
      const sourceModuloId = source.droppableId;
      const destModuloId = destination.droppableId;
      const destModulo = modulos.find(m => m.id === destModuloId);

      // Get lessons grouped by module
      const lessonsByModule = new Map<string, Leccion[]>();
      modulos.forEach(m => {
        lessonsByModule.set(
          m.id,
          lecciones
            .filter(l => l.modulo_id === m.id)
            .sort((a, b) => a.order_index - b.order_index)
        );
      });

      const sourceList = [...(lessonsByModule.get(sourceModuloId) || [])];
      const [movedLesson] = sourceList.splice(source.index, 1);

      if (sourceModuloId === destModuloId) {
        sourceList.splice(destination.index, 0, movedLesson);
        const updates = sourceList.map((l, i) => ({
          id: l.id,
          order_index: i,
          modulo_id: sourceModuloId,
          modulo: modulos.find(m => m.id === sourceModuloId)?.titulo || null,
        }));
        reorderLeccionesMutation.mutate(updates);
      } else {
        const destList = [...(lessonsByModule.get(destModuloId) || [])];
        destList.splice(destination.index, 0, movedLesson);

        const sourceUpdates = sourceList.map((l, i) => ({
          id: l.id,
          order_index: i,
          modulo_id: sourceModuloId,
          modulo: modulos.find(m => m.id === sourceModuloId)?.titulo || null,
        }));
        const destUpdates = destList.map((l, i) => ({
          id: l.id,
          order_index: i,
          modulo_id: destModuloId,
          modulo: destModulo?.titulo || null,
        }));

        reorderLeccionesMutation.mutate([...sourceUpdates, ...destUpdates]);
      }
    }
  };

  // Mobile move handlers
  const handleMoveModule = (moduloId: string, direction: "up" | "down") => {
    const sorted = [...modulos].sort((a, b) => a.order_index - b.order_index);
    const index = sorted.findIndex(m => m.id === moduloId);
    if (index === -1) return;

    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= sorted.length) return;

    const [moved] = sorted.splice(index, 1);
    sorted.splice(newIndex, 0, moved);

    const updates = sorted.map((m, i) => ({ id: m.id, order_index: i }));
    reorderModulosMutation.mutate(updates);
  };

  const handleMoveLesson = (leccionId: string, moduloId: string, direction: "up" | "down") => {
    const moduleLessons = lecciones
      .filter(l => l.modulo_id === moduloId)
      .sort((a, b) => a.order_index - b.order_index);

    const index = moduleLessons.findIndex(l => l.id === leccionId);
    if (index === -1) return;

    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= moduleLessons.length) return;

    const [moved] = moduleLessons.splice(index, 1);
    moduleLessons.splice(newIndex, 0, moved);

    const modulo = modulos.find(m => m.id === moduloId);
    const updates = moduleLessons.map((l, i) => ({
      id: l.id,
      order_index: i,
      modulo_id: moduloId,
      modulo: modulo?.titulo || null,
    }));
    reorderLeccionesMutation.mutate(updates);
  };

  // Dialog handlers
  const handleEditModule = (modulo: Modulo) => {
    setEditingModulo(modulo);
    setIsModuleDialogOpen(true);
  };

  const handleAddLessonToModule = (moduloId: string) => {
    setDefaultModuloId(moduloId);
    setEditingLeccion(null);
    setIsLessonDialogOpen(true);
  };

  const handleEditLesson = (leccion: Leccion) => {
    setEditingLeccion(leccion);
    setDefaultModuloId(leccion.modulo_id || undefined);
    setIsLessonDialogOpen(true);
  };

  const handleExportModule = (modulo: Modulo) => {
    setExportModuloId(modulo.id);
    setIsExportDialogOpen(true);
  };

  const handleModuleSubmit = (data: ModuloFormData) => {
    if (editingModulo) {
      updateModuloMutation.mutate({ id: editingModulo.id, data });
    } else {
      createModuloMutation.mutate(data);
    }
  };

  const handleLessonSubmit = (data: LeccionFormData) => {
    if (editingLeccion) {
      updateLeccionMutation.mutate({ id: editingLeccion.id, data });
    } else {
      createLeccionMutation.mutate(data);
    }
  };

  const handleImport = async (
    modulosData: JsonModulo[],
    conflictResolution: ImportConflictResolution
  ) => {
    await importMutation.mutateAsync({ modulosData, conflictResolution });
  };

  const isLoading = modulosLoading || leccionesLoading;
  const sortedModulos = [...modulos].sort((a, b) => a.order_index - b.order_index);

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="mb-6">
        <Link to="/admin/cursos">
          <Button variant="ghost" size="sm" className="text-gray-600 hover:bg-gray-100 mb-4">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Volver a cursos
          </Button>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              {curso?.titulo}
            </h1>
            <p className="text-gray-600 text-sm">
              {modulos.length} módulos · {lecciones.length} lecciones
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => setIsImportDialogOpen(true)}
              className="border-indigo-300 text-indigo-600 hover:bg-indigo-50"
            >
              <Upload className="h-4 w-4 mr-2" />
              Importar
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setExportModuloId(undefined);
                setIsExportDialogOpen(true);
              }}
              className="border-emerald-300 text-emerald-600 hover:bg-emerald-50"
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setEditingModulo(null);
                setIsModuleDialogOpen(true);
              }}
              className="border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              <FolderPlus className="h-4 w-4 mr-2" />
              Nuevo Módulo
            </Button>
            {modulos.length > 0 && (
              <Button
                onClick={() => {
                  setEditingLeccion(null);
                  setDefaultModuloId(modulos[0]?.id);
                  setIsLessonDialogOpen(true);
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nueva Lección
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Modules List */}
      {modulos.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <FolderPlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay módulos
          </h3>
          <p className="text-gray-500 mb-4">
            Crea tu primer módulo para organizar las lecciones
          </p>
          <Button
            onClick={() => {
              setEditingModulo(null);
              setIsModuleDialogOpen(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <FolderPlus className="h-4 w-4 mr-2" />
            Crear Módulo
          </Button>
        </div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="modules" type="module">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="space-y-4"
              >
                {sortedModulos.map((modulo, index) => {
                  const moduleLecciones = lecciones
                    .filter((l) => l.modulo_id === modulo.id)
                    .sort((a, b) => a.order_index - b.order_index);

                  return (
                    <ModuleCard
                      key={modulo.id}
                      modulo={modulo}
                      lecciones={moduleLecciones}
                      index={index}
                      totalModules={sortedModulos.length}
                      onEditModule={handleEditModule}
                      onDeleteModule={(id) => deleteModuloMutation.mutate(id)}
                      onAddLesson={handleAddLessonToModule}
                      onEditLesson={handleEditLesson}
                      onDeleteLesson={(id) => deleteLeccionMutation.mutate(id)}
                      onExportModule={handleExportModule}
                      onMoveModule={handleMoveModule}
                      onMoveLesson={handleMoveLesson}
                    />
                  );
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}

      {/* Dialogs */}
      <ModuleFormDialog
        isOpen={isModuleDialogOpen}
        onClose={() => {
          setIsModuleDialogOpen(false);
          setEditingModulo(null);
        }}
        onSubmit={handleModuleSubmit}
        editingModulo={editingModulo}
        existingSlugs={modulos.map((m) => m.slug)}
        isLoading={createModuloMutation.isPending || updateModuloMutation.isPending}
      />

      <LessonFormDialog
        isOpen={isLessonDialogOpen}
        onClose={() => {
          setIsLessonDialogOpen(false);
          setEditingLeccion(null);
          setDefaultModuloId(undefined);
        }}
        onSubmit={handleLessonSubmit}
        editingLeccion={editingLeccion}
        modulos={modulos}
        defaultModuloId={defaultModuloId}
        existingSlugs={lecciones.map((l) => l.slug)}
        isLoading={createLeccionMutation.isPending || updateLeccionMutation.isPending}
      />

      <ImportDialog
        isOpen={isImportDialogOpen}
        onClose={() => setIsImportDialogOpen(false)}
        onImport={handleImport}
        existingModuloSlugs={modulos.map((m) => m.slug)}
        existingLeccionSlugs={lecciones.map((l) => l.slug)}
        cursoSlug={curso?.slug || "curso"}
      />

      {curso && (
        <ExportDialog
          isOpen={isExportDialogOpen}
          onClose={() => {
            setIsExportDialogOpen(false);
            setExportModuloId(undefined);
          }}
          curso={curso}
          modulos={modulos}
          lecciones={lecciones}
          selectedModuloId={exportModuloId}
        />
      )}
    </div>
  );
};

export default AdminLecciones;
