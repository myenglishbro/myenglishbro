import { useState } from "react";
import { Draggable, Droppable } from "@hello-pangea/dnd";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  GripVertical, 
  ChevronDown, 
  ChevronRight, 
  Edit, 
  Trash2, 
  Plus,
  Download,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import { Modulo, Leccion } from "../../types/lessonManagement.types";
import { LessonCard } from "./LessonCard";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ModuleCardProps {
  modulo: Modulo;
  lecciones: Leccion[];
  index: number;
  totalModules: number;
  onEditModule: (modulo: Modulo) => void;
  onDeleteModule: (moduloId: string) => void;
  onAddLesson: (moduloId: string) => void;
  onEditLesson: (leccion: Leccion) => void;
  onDeleteLesson: (leccionId: string) => void;
  onExportModule: (modulo: Modulo) => void;
  onMoveModule: (moduloId: string, direction: "up" | "down") => void;
  onMoveLesson: (leccionId: string, moduloId: string, direction: "up" | "down") => void;
}

export const ModuleCard = ({
  modulo,
  lecciones,
  index,
  totalModules,
  onEditModule,
  onDeleteModule,
  onAddLesson,
  onEditLesson,
  onDeleteLesson,
  onExportModule,
  onMoveModule,
  onMoveLesson,
}: ModuleCardProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const isMobile = useIsMobile();

  const handleDeleteConfirm = () => {
    onDeleteModule(modulo.id);
    setShowDeleteDialog(false);
  };

  return (
    <>
      <Draggable draggableId={`module-${modulo.id}`} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            className={`mb-4 ${snapshot.isDragging ? "opacity-75 shadow-xl" : ""}`}
          >
            <Card className="bg-white border-gray-200 overflow-hidden">
              <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                {/* Module Header */}
                <div className="flex items-center gap-2 p-4 bg-gradient-to-r from-indigo-50 to-white border-b border-gray-100">
                  {/* Drag Handle - Desktop */}
                  {!isMobile && (
                    <div
                      {...provided.dragHandleProps}
                      className="cursor-grab active:cursor-grabbing p-1 hover:bg-indigo-100 rounded"
                    >
                      <GripVertical className="h-5 w-5 text-gray-400" />
                    </div>
                  )}

                  {/* Mobile Reorder Buttons */}
                  {isMobile && (
                    <div className="flex flex-col gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        disabled={index === 0}
                        onClick={() => onMoveModule(modulo.id, "up")}
                      >
                        <ArrowUp className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        disabled={index === totalModules - 1}
                        onClick={() => onMoveModule(modulo.id, "down")}
                      >
                        <ArrowDown className="h-3 w-3" />
                      </Button>
                    </div>
                  )}

                  {/* Collapse Toggle */}
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      {isOpen ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                  </CollapsibleTrigger>

                  {/* Module Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {modulo.titulo}
                    </h3>
                    <p className="text-xs text-gray-500 font-mono">
                      /{modulo.slug} · {lecciones.length} lecciones
                    </p>
                  </div>

                  {/* Module Actions */}
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-500 hover:text-indigo-600"
                      onClick={() => onAddLesson(modulo.id)}
                      title="Agregar lección"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-500 hover:text-indigo-600"
                      onClick={() => onExportModule(modulo)}
                      title="Exportar módulo"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-500 hover:text-indigo-600"
                      onClick={() => onEditModule(modulo)}
                      title="Editar módulo"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-500 hover:text-red-600"
                      onClick={() => setShowDeleteDialog(true)}
                      title="Eliminar módulo"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Lessons List */}
                <CollapsibleContent>
                  <Droppable droppableId={modulo.id} type="lesson">
                    {(droppableProvided, droppableSnapshot) => (
                      <div
                        ref={droppableProvided.innerRef}
                        {...droppableProvided.droppableProps}
                        className={`min-h-[60px] p-2 ${
                          droppableSnapshot.isDraggingOver
                            ? "bg-indigo-50"
                            : "bg-gray-50"
                        }`}
                      >
                        {lecciones.length === 0 ? (
                          <div className="text-center py-8 text-gray-400 text-sm">
                            No hay lecciones. Arrastra aquí o haz clic en + para agregar.
                          </div>
                        ) : (
                          lecciones.map((leccion, lessonIndex) => (
                            <LessonCard
                              key={leccion.id}
                              leccion={leccion}
                              index={lessonIndex}
                              totalLessons={lecciones.length}
                              moduloId={modulo.id}
                              onEdit={onEditLesson}
                              onDelete={onDeleteLesson}
                              onMove={onMoveLesson}
                            />
                          ))
                        )}
                        {droppableProvided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          </div>
        )}
      </Draggable>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar módulo?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará el módulo "{modulo.titulo}" y todas sus {lecciones.length} lecciones.
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
