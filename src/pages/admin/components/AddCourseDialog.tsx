import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BookPlus, Loader2 } from "lucide-react";
import { Curso } from "../types/adminUsuarios.types";

interface AddCourseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cursos: Curso[];
  enrolledCourseIds: string[];
  onConfirm: (cursoId: string, metodoPago: string, tipoPago: string, diasPrueba?: number) => void;
  isCreating: boolean;
}

export function AddCourseDialog({
  open,
  onOpenChange,
  cursos,
  enrolledCourseIds,
  onConfirm,
  isCreating,
}: AddCourseDialogProps) {
  const [selectedCurso, setSelectedCurso] = useState("");
  const [selectedTipoPago, setSelectedTipoPago] = useState("unico");
  const [selectedMetodoPago, setSelectedMetodoPago] = useState("");
  const [diasPrueba, setDiasPrueba] = useState(7);

  const availableCursos = cursos.filter(c => !enrolledCourseIds.includes(c.id));

  const handleConfirm = () => {
    if (!selectedCurso || !selectedTipoPago) return;
    if (selectedTipoPago !== "prueba" && !selectedMetodoPago) return;

    const metodo = selectedTipoPago === "prueba" ? "prueba_gratuita" : selectedMetodoPago;
    onConfirm(
      selectedCurso, 
      metodo, 
      selectedTipoPago, 
      selectedTipoPago === "prueba" ? diasPrueba : undefined
    );

    // Reset form
    setSelectedCurso("");
    setSelectedTipoPago("unico");
    setSelectedMetodoPago("");
    setDiasPrueba(7);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setSelectedCurso("");
      setSelectedTipoPago("unico");
      setSelectedMetodoPago("");
      setDiasPrueba(7);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-white border-gray-200 text-gray-900 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-gray-900 text-lg font-semibold flex items-center gap-2">
            <BookPlus className="h-5 w-5 text-indigo-600" />
            Agregar Curso
          </DialogTitle>
          <DialogDescription className="text-gray-500">
            Asigna un nuevo curso a este usuario
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {/* Selector de curso */}
          <div>
            <label className="text-sm text-gray-700 font-medium mb-2 block">
              Curso
            </label>
            {availableCursos.length === 0 ? (
              <p className="text-sm text-gray-500 italic">
                El usuario ya tiene todos los cursos disponibles
              </p>
            ) : (
              <Select value={selectedCurso} onValueChange={setSelectedCurso}>
                <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                  <SelectValue placeholder="Selecciona un curso" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200">
                  {availableCursos.map((curso) => (
                    <SelectItem key={curso.id} value={curso.id} className="text-gray-900">
                      <span className="font-semibold text-indigo-600">{curso.nivel}</span>
                      <span className="ml-2">{curso.titulo}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Tipo de pago */}
          <div>
            <label className="text-sm text-gray-700 font-medium mb-2 block">
              Tipo de pago
            </label>
            <Select value={selectedTipoPago} onValueChange={setSelectedTipoPago}>
              <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                <SelectValue placeholder="Selecciona tipo de pago" />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-200">
                <SelectItem value="unico" className="text-gray-900">
                  ♾️ Pago único (Acceso de por vida)
                </SelectItem>
                <SelectItem value="mensual" className="text-gray-900">
                  📅 Pago mensual (30 días)
                </SelectItem>
                <SelectItem value="prueba" className="text-gray-900">
                  🎁 Prueba gratuita (X días)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Días de prueba */}
          {selectedTipoPago === "prueba" && (
            <div>
              <label className="text-sm text-gray-700 font-medium mb-2 block">
                Días de prueba
              </label>
              <Input
                type="number"
                min={1}
                max={365}
                value={diasPrueba}
                onChange={(e) => setDiasPrueba(Math.max(1, parseInt(e.target.value) || 1))}
                className="bg-white border-gray-300 text-gray-900"
              />
              <p className="text-xs text-gray-500 mt-1">
                El acceso se desactivará después de {diasPrueba} día{diasPrueba !== 1 ? 's' : ''}
              </p>
            </div>
          )}

          {/* Método de pago */}
          {selectedTipoPago !== "prueba" && (
            <div>
              <label className="text-sm text-gray-700 font-medium mb-2 block">
                Método de pago
              </label>
              <Select value={selectedMetodoPago} onValueChange={setSelectedMetodoPago}>
                <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                  <SelectValue placeholder="Selecciona método de pago" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200">
                  <SelectItem value="yape" className="text-gray-900">💚 Yape</SelectItem>
                  <SelectItem value="plin" className="text-gray-900">💜 Plin</SelectItem>
                  <SelectItem value="transferencia" className="text-gray-900">🏦 Transferencia</SelectItem>
                  <SelectItem value="paypal" className="text-gray-900">🔵 PayPal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            className="border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={
              isCreating || 
              !selectedCurso || 
              !selectedTipoPago ||
              (selectedTipoPago !== "prueba" && !selectedMetodoPago)
            }
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {isCreating ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <BookPlus className="h-4 w-4 mr-2" />
            )}
            Agregar Curso
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
