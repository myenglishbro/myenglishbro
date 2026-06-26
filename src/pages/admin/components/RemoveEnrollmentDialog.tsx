import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Trash2, Loader2, AlertTriangle } from "lucide-react";
import { EnrollmentWithCourse } from "../types/adminUsuarios.types";

interface RemoveEnrollmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  enrollment: EnrollmentWithCourse | null;
  onConfirm: (enrollmentId: string) => void;
  isDeleting: boolean;
}

export function RemoveEnrollmentDialog({
  open,
  onOpenChange,
  enrollment,
  onConfirm,
  isDeleting,
}: RemoveEnrollmentDialogProps) {
  if (!enrollment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border-gray-200 text-gray-900 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-red-600 text-lg font-semibold flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Quitar Curso
          </DialogTitle>
          <DialogDescription className="text-gray-500">
            Esta acción no se puede deshacer.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <p className="text-gray-900">
            ¿Estás seguro de quitar el curso{" "}
            <strong className="text-indigo-600">
              {enrollment.curso.nivel} - {enrollment.curso.titulo}
            </strong>{" "}
            de este usuario?
          </p>
          <p className="text-sm text-gray-500 mt-2">
            El usuario perderá todo acceso a este curso y sus recursos.
          </p>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            Cancelar
          </Button>
          <Button
            onClick={() => onConfirm(enrollment.id)}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Trash2 className="h-4 w-4 mr-2" />
            )}
            Quitar Curso
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
