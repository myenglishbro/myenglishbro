import { Draggable } from "@hello-pangea/dnd";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  GripVertical,
  Edit,
  Trash2,
  Video,
  FileText,
  Globe,
  ArrowUp,
  ArrowDown,
  ClipboardList
} from "lucide-react";
import { Leccion } from "../../types/lessonManagement.types";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";
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

interface LessonCardProps {
  leccion: Leccion;
  index: number;
  totalLessons: number;
  moduloId: string;
  onEdit: (leccion: Leccion) => void;
  onDelete: (leccionId: string) => void;
  onMove: (leccionId: string, moduloId: string, direction: "up" | "down") => void;
}

export const LessonCard = ({
  leccion,
  index,
  totalLessons,
  moduloId,
  onEdit,
  onDelete,
  onMove,
}: LessonCardProps) => {
  const isMobile = useIsMobile();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { cursoId } = useParams<{ cursoId: string }>();

  const hasVideo = leccion.video_url || leccion.youtube_url;
  const hasPdf = leccion.pdf_url;
  const hasExtras = leccion.extra_urls && leccion.extra_urls.length > 0;

  return (
    <>
      <Draggable draggableId={`lesson-${leccion.id}`} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            className={`flex items-center gap-2 p-3 mb-2 bg-white rounded-lg border border-gray-200 transition-shadow ${
              snapshot.isDragging
                ? "shadow-lg border-indigo-300"
                : "hover:shadow-sm"
            }`}
          >
            {/* Drag Handle - Desktop */}
            {!isMobile && (
              <div
                {...provided.dragHandleProps}
                className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded"
              >
                <GripVertical className="h-4 w-4 text-gray-400" />
              </div>
            )}

            {/* Mobile Reorder Buttons */}
            {isMobile && (
              <div className="flex flex-col gap-0.5">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5"
                  disabled={index === 0}
                  onClick={() => onMove(leccion.id, moduloId, "up")}
                >
                  <ArrowUp className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5"
                  disabled={index === totalLessons - 1}
                  onClick={() => onMove(leccion.id, moduloId, "down")}
                >
                  <ArrowDown className="h-3 w-3" />
                </Button>
              </div>
            )}

            {/* Order Badge */}
            <span className="flex-shrink-0 w-7 h-7 flex items-center justify-center bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold">
              {index + 1}
            </span>

            {/* Lesson Info */}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 text-sm truncate">
                {leccion.titulo}
              </p>
              <p className="text-xs text-gray-500 font-mono truncate">
                /{leccion.slug}
              </p>
            </div>

            {/* Content Indicators */}
            <div className="flex items-center gap-1">
              {hasVideo && (
                <span className="p-1 bg-red-50 rounded" title="Video">
                  <Video className="h-3 w-3 text-red-500" />
                </span>
              )}
              {hasPdf && (
                <span className="p-1 bg-blue-50 rounded" title="PDF">
                  <FileText className="h-3 w-3 text-blue-500" />
                </span>
              )}
              {hasExtras && (
                <span className="p-1 bg-green-50 rounded" title="Enlaces extra">
                  <Globe className="h-3 w-3 text-green-500" />
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              <Link to={`/admin/cursos/${cursoId}/lecciones/${leccion.id}/actividades`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 px-2 text-xs text-indigo-700 border-indigo-200 hover:bg-indigo-50"
                  title="Actividades de práctica"
                >
                  <ClipboardList className="h-3.5 w-3.5 mr-1" />
                  Actividades
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-gray-500 hover:text-indigo-600"
                onClick={() => onEdit(leccion)}
              >
                <Edit className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-gray-500 hover:text-red-600"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </Draggable>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar lección?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará la lección "{leccion.titulo}". Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete(leccion.id);
                setShowDeleteDialog(false);
              }}
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
