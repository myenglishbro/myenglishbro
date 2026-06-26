import { useState, useEffect } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Calendar, Loader2 } from "lucide-react";
import { EnrollmentWithCourse } from "../types/adminUsuarios.types";

interface EditDatesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  enrollment: EnrollmentWithCourse | null;
  onConfirm: (enrollmentId: string, fechaInicio: string, fechaFin: string | null) => void;
  isUpdating: boolean;
}

export function EditDatesDialog({
  open,
  onOpenChange,
  enrollment,
  onConfirm,
  isUpdating,
}: EditDatesDialogProps) {
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  useEffect(() => {
    if (enrollment) {
      setFechaInicio(
        enrollment.fecha_inicio 
          ? format(new Date(enrollment.fecha_inicio), "yyyy-MM-dd") 
          : format(new Date(), "yyyy-MM-dd")
      );
      setFechaFin(
        enrollment.fecha_fin 
          ? format(new Date(enrollment.fecha_fin), "yyyy-MM-dd") 
          : ""
      );
    }
  }, [enrollment]);

  const handleConfirm = () => {
    if (!enrollment) return;
    
    const inicio = new Date(fechaInicio).toISOString();
    const fin = fechaFin ? new Date(fechaFin).toISOString() : null;
    
    onConfirm(enrollment.id, inicio, fin);
  };

  if (!enrollment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border-gray-200 text-gray-900 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-gray-900 text-lg font-semibold flex items-center gap-2">
            <Calendar className="h-5 w-5 text-indigo-600" />
            Editar Fechas
          </DialogTitle>
          <DialogDescription className="text-gray-500">
            Curso: {enrollment.curso.nivel} - {enrollment.curso.titulo}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div>
            <Label htmlFor="fecha-inicio" className="text-gray-700">
              Fecha de inicio
            </Label>
            <Input
              id="fecha-inicio"
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="mt-1 bg-white border-gray-300"
            />
          </div>

          <div>
            <Label htmlFor="fecha-fin" className="text-gray-700">
              Fecha de fin
            </Label>
            <Input
              id="fecha-fin"
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="mt-1 bg-white border-gray-300"
            />
            <p className="text-xs text-gray-500 mt-1">
              Dejar vacío para acceso de por vida
            </p>
          </div>
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
            onClick={handleConfirm}
            disabled={isUpdating || !fechaInicio}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {isUpdating ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
