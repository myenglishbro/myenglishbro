import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Download, Copy, Check } from "lucide-react";
import { Modulo, Leccion, Curso, JsonCursoExport } from "../../types/lessonManagement.types";

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  curso: Curso;
  modulos: Modulo[];
  lecciones: Leccion[];
  selectedModuloId?: string;
}

export const ExportDialog = ({
  isOpen,
  onClose,
  curso,
  modulos,
  lecciones,
  selectedModuloId,
}: ExportDialogProps) => {
  const [exportType, setExportType] = useState<"full" | "module">(
    selectedModuloId ? "module" : "full"
  );
  const [selectedModulo, setSelectedModulo] = useState<string>(
    selectedModuloId || modulos[0]?.id || ""
  );
  const [copied, setCopied] = useState(false);

  const generateExportData = (): JsonCursoExport => {
    const modulosToExport = exportType === "full"
      ? modulos
      : modulos.filter((m) => m.id === selectedModulo);

    const exportModulos = modulosToExport
      .sort((a, b) => a.order_index - b.order_index)
      .map((modulo) => {
        const moduloLecciones = lecciones
          .filter((l) => l.modulo_id === modulo.id)
          .sort((a, b) => a.order_index - b.order_index)
          .map((l) => ({
            titulo: l.titulo,
            slug: l.slug,
            descripcion: l.descripcion || undefined,
            order_index: l.order_index,
            video_url: l.video_url || undefined,
            youtube_url: l.youtube_url || undefined,
            pdf_url: l.pdf_url || undefined,
            extra_urls: l.extra_urls || undefined,
          }));

        return {
          titulo: modulo.titulo,
          slug: modulo.slug,
          order_index: modulo.order_index,
          lecciones: moduloLecciones,
        };
      });

    return {
      version: "2.0",
      exported_at: new Date().toISOString(),
      curso: {
        slug: curso.slug,
        titulo: curso.titulo,
        nivel: curso.nivel,
        descripcion: curso.descripcion || undefined,
      },
      modulos: exportModulos,
    };
  };

  const exportData = generateExportData();
  const jsonString = JSON.stringify(exportData, null, 2);

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const filename = exportType === "full"
      ? `${curso.slug}-completo.json`
      : `${curso.slug}-${modulos.find((m) => m.id === selectedModulo)?.slug || "modulo"}.json`;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const totalLecciones = exportType === "full"
    ? lecciones.length
    : lecciones.filter((l) => l.modulo_id === selectedModulo).length;

  const totalModulos = exportType === "full"
    ? modulos.length
    : 1;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white border-gray-200 text-gray-900 max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-gray-900 text-xl font-semibold flex items-center gap-2">
            <Download className="h-5 w-5 text-indigo-600" />
            Exportar Contenido a JSON
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Export Type Selection */}
          <div className="space-y-3">
            <Label className="text-gray-700 font-medium">¿Qué exportar?</Label>
            <RadioGroup
              value={exportType}
              onValueChange={(v) => setExportType(v as "full" | "module")}
              className="space-y-2"
            >
              <div className="flex items-center space-x-2 p-3 rounded-lg border border-gray-200 hover:bg-gray-50">
                <RadioGroupItem value="full" id="full" />
                <Label htmlFor="full" className="flex-1 cursor-pointer">
                  <span className="font-medium text-gray-900">Curso completo</span>
                  <span className="text-sm text-gray-500 block">
                    {modulos.length} módulos, {lecciones.length} lecciones
                  </span>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 rounded-lg border border-gray-200 hover:bg-gray-50">
                <RadioGroupItem value="module" id="module" />
                <Label htmlFor="module" className="flex-1 cursor-pointer">
                  <span className="font-medium text-gray-900">Módulo individual</span>
                  <span className="text-sm text-gray-500 block">
                    Exportar solo un módulo con sus lecciones
                  </span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Module Selection (when exporting single module) */}
          {exportType === "module" && (
            <div className="space-y-2">
              <Label className="text-gray-700 font-medium">Seleccionar módulo:</Label>
              <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
                {modulos
                  .sort((a, b) => a.order_index - b.order_index)
                  .map((modulo) => {
                    const lessonCount = lecciones.filter(
                      (l) => l.modulo_id === modulo.id
                    ).length;
                    return (
                      <button
                        key={modulo.id}
                        type="button"
                        onClick={() => setSelectedModulo(modulo.id)}
                        className={`text-left p-3 rounded-lg border transition-colors ${
                          selectedModulo === modulo.id
                            ? "border-indigo-500 bg-indigo-50"
                            : "border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        <span className="font-medium text-gray-900">
                          {modulo.titulo}
                        </span>
                        <span className="text-xs text-gray-500 ml-2">
                          {lessonCount} lecciones
                        </span>
                      </button>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Preview Stats */}
          <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-indigo-900">
                  Preview de exportación
                </p>
                <p className="text-xs text-indigo-700">
                  {totalModulos} módulo(s), {totalLecciones} lección(es)
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-indigo-600 font-mono">v2.0</p>
                <p className="text-xs text-indigo-500">
                  {(new Blob([jsonString]).size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
          </div>

          {/* JSON Preview */}
          <div className="space-y-2">
            <Label className="text-gray-700 font-medium">Vista previa del JSON:</Label>
            <pre className="p-4 bg-gray-900 text-gray-100 rounded-lg text-xs overflow-x-auto max-h-60 overflow-y-auto">
              {jsonString}
            </pre>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={handleCopy}
              className="border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-2 text-green-600" />
                  Copiado
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar
                </>
              )}
            </Button>
            <Button
              onClick={handleDownload}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Download className="h-4 w-4 mr-2" />
              Descargar JSON
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
