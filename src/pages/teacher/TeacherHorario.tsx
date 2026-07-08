import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";
import { ScheduleGrid } from "@/components/schedule/ScheduleGrid";
import { useHorarioQuery, useToggleHorarioSlot } from "@/hooks/useHorario";

const TeacherHorario = () => {
  const { data: slots = [], isLoading } = useHorarioQuery();
  const toggleSlot = useToggleHorarioSlot();

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Clock className="h-6 w-6 text-primary" />
          Mi Horario
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Haz clic en un bloque para marcarlo como disponible u ocupado. Tus estudiantes verán este horario actualizado al instante.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Lunes a Domingo · 6:00 AM - 11:00 PM</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Cargando horario...</p>
          ) : (
            <ScheduleGrid
              slots={slots}
              editable
              ocupadoLabel="Clase con Juan"
              pendingSlotId={toggleSlot.isPending ? toggleSlot.variables?.id ?? null : null}
              onToggle={(slot) => toggleSlot.mutate({ id: slot.id, disponible: !slot.disponible })}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherHorario;
