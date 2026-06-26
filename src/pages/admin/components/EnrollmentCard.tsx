import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Calendar, 
  Pause, 
  Play, 
  Trash2, 
  Loader2 
} from "lucide-react";
import { 
  EnrollmentWithCourse, 
  getStatusBadgeProps 
} from "../types/adminUsuarios.types";

interface EnrollmentCardProps {
  enrollment: EnrollmentWithCourse;
  onAdd30Days: (enrollmentId: string, currentFechaFin: string | null) => void;
  onEditDates: (enrollment: EnrollmentWithCourse) => void;
  onTogglePause: (enrollmentId: string, currentStatus: string) => void;
  onRemove: (enrollment: EnrollmentWithCourse) => void;
  isUpdating: boolean;
}

export function EnrollmentCard({
  enrollment,
  onAdd30Days,
  onEditDates,
  onTogglePause,
  onRemove,
  isUpdating,
}: EnrollmentCardProps) {
  const statusProps = getStatusBadgeProps(enrollment.computedStatus);
  const isPaused = enrollment.estado === 'pausada';
  
  const formatDate = (date: string | null) => {
    if (!date) return '—';
    return format(new Date(date), "dd/MM/yyyy", { locale: es });
  };

  const getTipoPagoIcon = () => {
    switch (enrollment.tipo_pago) {
      case 'mensual': return '📅';
      case 'prueba': return '🎁';
      default: return '♾️';
    }
  };

  return (
    <Card className="p-4 border-gray-200">
      <div className="flex flex-col gap-3">
        {/* Header con curso y estado */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-indigo-600">{enrollment.curso.nivel}</span>
              <span className="text-sm text-gray-600 truncate">{enrollment.curso.titulo}</span>
              <span className="text-sm">{getTipoPagoIcon()}</span>
            </div>
          </div>
          <Badge className={`${statusProps.className} shrink-0`}>
            {statusProps.label}
          </Badge>
        </div>

        {/* Fechas */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Inicio:</span>
            <span className="ml-2 text-gray-900">{formatDate(enrollment.fecha_inicio)}</span>
          </div>
          <div>
            <span className="text-gray-500">Fin:</span>
            <span className={`ml-2 ${enrollment.computedStatus === 'expired' ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
              {formatDate(enrollment.fecha_fin)}
            </span>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAdd30Days(enrollment.id, enrollment.fecha_fin)}
            disabled={isUpdating}
            className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 flex-1 min-w-[100px]"
          >
            {isUpdating ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
            ) : (
              <Plus className="h-3.5 w-3.5 mr-1" />
            )}
            +30 días
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onEditDates(enrollment)}
            className="text-gray-600 border-gray-200 hover:bg-gray-50 flex-1 min-w-[100px]"
          >
            <Calendar className="h-3.5 w-3.5 mr-1" />
            Editar fechas
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onTogglePause(enrollment.id, enrollment.estado)}
            className={`flex-1 min-w-[100px] ${
              isPaused 
                ? 'text-emerald-600 border-emerald-200 hover:bg-emerald-50' 
                : 'text-amber-600 border-amber-200 hover:bg-amber-50'
            }`}
          >
            {isPaused ? (
              <>
                <Play className="h-3.5 w-3.5 mr-1" />
                Activar
              </>
            ) : (
              <>
                <Pause className="h-3.5 w-3.5 mr-1" />
                Pausar
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onRemove(enrollment)}
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
