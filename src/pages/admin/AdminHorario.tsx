import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Clock } from "lucide-react";
import { ScheduleGrid } from "@/components/schedule/ScheduleGrid";
import { useHorarioQuery, useUpdateHorarioSlot, type HorarioSlot } from "@/hooks/useHorario";

const DIAS_LARGO = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

const AdminHorario = () => {
  const { data: slots = [], isLoading } = useHorarioQuery();
  const updateSlot = useUpdateHorarioSlot();

  const [editingSlot, setEditingSlot] = useState<HorarioSlot | null>(null);
  const [disponible, setDisponible] = useState(true);
  const [etiqueta, setEtiqueta] = useState("");

  const openDialog = (slot: HorarioSlot) => {
    setEditingSlot(slot);
    setDisponible(slot.disponible);
    setEtiqueta(slot.etiqueta || "");
  };

  const handleSave = () => {
    if (!editingSlot) return;
    updateSlot.mutate({
      id: editingSlot.id,
      disponible,
      etiqueta: disponible ? null : (etiqueta.trim() || null),
    });
    setEditingSlot(null);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Clock className="h-6 w-6 text-primary" />
          Horario
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Haz clic en un bloque para marcarlo como disponible u ocupado (puedes indicar con quién es la clase). Los estudiantes verán este horario actualizado al instante.
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
            <ScheduleGrid slots={slots} editable ocupadoLabel="Ocupado" onSlotClick={openDialog} />
          )}
        </CardContent>
      </Card>

      <Dialog open={!!editingSlot} onOpenChange={(open) => !open && setEditingSlot(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {editingSlot && `${DIAS_LARGO[editingSlot.dia_semana - 1]} ${editingSlot.hora_inicio.toString().padStart(2, "0")}:00 - ${(editingSlot.hora_inicio + 1).toString().padStart(2, "0")}:00`}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="disponible-switch">Disponible</Label>
              <Switch id="disponible-switch" checked={disponible} onCheckedChange={setDisponible} />
            </div>
            {!disponible && (
              <div>
                <Label htmlFor="etiqueta-input">¿Con quién es la clase? (opcional)</Label>
                <Input
                  id="etiqueta-input"
                  value={etiqueta}
                  onChange={(e) => setEtiqueta(e.target.value)}
                  placeholder="Ej. Clase con María"
                  className="mt-1"
                />
              </div>
            )}
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setEditingSlot(null)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={updateSlot.isPending}>
              {updateSlot.isPending ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminHorario;
