import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Upload,
  Download,
  File,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import {
  JsonImport,
  JsonModulo,
  JsonLeccion,
  ValidationResult,
  ImportConflictResolution,
  ImportPreviewItem,
} from "../../types/lessonManagement.types";

interface ImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (
    modulos: JsonModulo[],
    conflictResolution: ImportConflictResolution
  ) => Promise<void>;
  existingModuloSlugs: string[];
  existingLeccionSlugs: string[];
  cursoSlug: string;
}

export const ImportDialog = ({
  isOpen,
  onClose,
  onImport,
  existingModuloSlugs,
  existingLeccionSlugs,
  cursoSlug,
}: ImportDialogProps) => {
  const [jsonInput, setJsonInput] = useState("");
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [conflictResolution, setConflictResolution] = useState<ImportConflictResolution>("skip");
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const validateJson = (jsonString: string): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];
    const preview: ImportPreviewItem[] = [];

    let parsed: JsonImport;
    try {
      parsed = JSON.parse(jsonString);
    } catch (e) {
      return {
        valid: false,
        errors: ["JSON inválido: " + (e as Error).message],
        warnings: [],
        preview: [],
        modulos: [],
        legacyFormat: false,
      };
    }

    // Check for legacy format (flat lecciones array)
    const isLegacyFormat = !parsed.modulos && Array.isArray(parsed.lecciones);

    let modulos: JsonModulo[] = [];

    if (isLegacyFormat && parsed.lecciones) {
      // Convert legacy format to new format
      const moduloMap = new Map<string, JsonLeccion[]>();
      
      parsed.lecciones.forEach((leccion) => {
        const moduloName = leccion.modulo || "Sin módulo";
        if (!moduloMap.has(moduloName)) {
          moduloMap.set(moduloName, []);
        }
        moduloMap.get(moduloName)!.push(leccion);
      });

      let orderIndex = 0;
      moduloMap.forEach((lecciones, titulo) => {
        modulos.push({
          titulo,
          slug: generateSlug(titulo),
          order_index: orderIndex++,
          lecciones: lecciones.map((l, i) => ({
            ...l,
            order_index: l.order_index ?? i,
          })),
        });
      });

      warnings.push("Formato legacy detectado. Se convertirán las lecciones a módulos.");
    } else if (parsed.modulos) {
      modulos = parsed.modulos;
    } else {
      return {
        valid: false,
        errors: ["El JSON debe contener 'modulos' o 'lecciones'"],
        warnings: [],
        preview: [],
        modulos: [],
        legacyFormat: false,
      };
    }

    if (modulos.length === 0) {
      return {
        valid: false,
        errors: ["No hay módulos para importar"],
        warnings: [],
        preview: [],
        modulos: [],
        legacyFormat: isLegacyFormat,
      };
    }

    // Validate modules and lessons
    const seenModuloSlugs = new Set<string>();
    const seenLeccionSlugs = new Set<string>();

    modulos.forEach((modulo, mIndex) => {
      const mPrefix = `Módulo ${mIndex + 1}:`;

      if (!modulo.titulo?.trim()) {
        errors.push(`${mPrefix} falta 'titulo'`);
      }

      const moduloSlug = modulo.slug || generateSlug(modulo.titulo || "");
      if (!moduloSlug) {
        errors.push(`${mPrefix} no se puede generar slug`);
      } else {
        // Check for duplicates within import
        if (seenModuloSlugs.has(moduloSlug)) {
          errors.push(`${mPrefix} slug duplicado '${moduloSlug}'`);
        } else {
          seenModuloSlugs.add(moduloSlug);
        }

        // Check for conflicts with existing
        const hasConflict = existingModuloSlugs.includes(moduloSlug);
        if (hasConflict) {
          warnings.push(`${mPrefix} slug '${moduloSlug}' ya existe`);
        }

        preview.push({
          type: "modulo",
          titulo: modulo.titulo,
          slug: moduloSlug,
          hasConflict,
        });
      }

      // Validate lessons
      if (!modulo.lecciones || !Array.isArray(modulo.lecciones)) {
        modulo.lecciones = [];
      }

      modulo.lecciones.forEach((leccion, lIndex) => {
        const lPrefix = `${mPrefix} Lección ${lIndex + 1}:`;

        if (!leccion.titulo?.trim()) {
          errors.push(`${lPrefix} falta 'titulo'`);
        }

        const leccionSlug = leccion.slug || generateSlug(leccion.titulo || "");
        if (!leccionSlug) {
          errors.push(`${lPrefix} no se puede generar slug`);
        } else {
          if (seenLeccionSlugs.has(leccionSlug)) {
            errors.push(`${lPrefix} slug duplicado '${leccionSlug}'`);
          } else {
            seenLeccionSlugs.add(leccionSlug);
          }

          const hasConflict = existingLeccionSlugs.includes(leccionSlug);
          if (hasConflict) {
            warnings.push(`${lPrefix} slug '${leccionSlug}' ya existe`);
          }

          preview.push({
            type: "leccion",
            titulo: leccion.titulo,
            slug: leccionSlug,
            moduloTitulo: modulo.titulo,
            hasConflict,
          });
        }
      });
    });

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      preview,
      modulos,
      legacyFormat: isLegacyFormat,
    };
  };

  const handleJsonChange = (value: string) => {
    setJsonInput(value);
    if (value.trim()) {
      setValidationResult(validateJson(value));
    } else {
      setValidationResult(null);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setJsonInput(content);
      setValidationResult(validateJson(content));
    };
    reader.readAsText(file);
  };

  const downloadTemplate = () => {
    const template: JsonImport = {
      version: "2.0",
      modulos: [
        {
          titulo: "Present Simple",
          slug: "present-simple",
          order_index: 0,
          lecciones: [
            {
              titulo: "Introducción al Present Simple",
              slug: "intro-present-simple",
              descripcion: "Aprende los fundamentos",
              order_index: 0,
              video_url: "https://drive.google.com/file/d/xxx/view",
              pdf_url: "https://drive.google.com/file/d/xxx/view",
              extra_urls: [
                { title: "Ejercicios", url: "https://ejemplo.com", type: "web" },
              ],
            },
            {
              titulo: "Verbos en Present Simple",
              slug: "verbos-present-simple",
              order_index: 1,
            },
          ],
        },
        {
          titulo: "Past Simple",
          slug: "past-simple",
          order_index: 1,
          lecciones: [
            {
              titulo: "Introducción al Past Simple",
              slug: "intro-past-simple",
              order_index: 0,
            },
          ],
        },
      ],
    };

    const blob = new Blob([JSON.stringify(template, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `plantilla-modulos-${cursoSlug}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async () => {
    if (!validationResult?.valid) return;

    setIsImporting(true);
    try {
      await onImport(validationResult.modulos, conflictResolution);
      handleClose();
    } catch (error) {
      console.error("Import error:", error);
    } finally {
      setIsImporting(false);
    }
  };

  const handleClose = () => {
    setJsonInput("");
    setValidationResult(null);
    setConflictResolution("skip");
    onClose();
  };

  const hasConflicts = validationResult?.warnings.some((w) =>
    w.includes("ya existe")
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-white border-gray-200 text-gray-900 max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-gray-900 text-xl font-semibold flex items-center gap-2">
            <Upload className="h-5 w-5 text-indigo-600" />
            Importar Contenido desde JSON
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Download Template */}
          <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-lg border border-indigo-200">
            <div>
              <p className="text-sm font-medium text-indigo-900">¿Primera vez?</p>
              <p className="text-xs text-indigo-700">
                Descarga la plantilla JSON v2.0 con módulos
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={downloadTemplate}
              className="border-indigo-300 text-indigo-600 hover:bg-indigo-100"
            >
              <Download className="h-4 w-4 mr-2" />
              Descargar Plantilla
            </Button>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label className="text-gray-700 font-medium">Cargar archivo JSON</Label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-dashed border-2 border-gray-300 hover:border-indigo-400 hover:bg-indigo-50 h-16"
            >
              <File className="h-5 w-5 mr-2 text-gray-500" />
              <span className="text-gray-600">Seleccionar archivo .json</span>
            </Button>
          </div>

          {/* Paste JSON */}
          <div className="space-y-2">
            <Label className="text-gray-700 font-medium">
              O pega el JSON directamente:
            </Label>
            <Textarea
              value={jsonInput}
              onChange={(e) => handleJsonChange(e.target.value)}
              placeholder='{"version": "2.0", "modulos": [...]}'
              rows={10}
              className="font-mono text-sm bg-gray-50 border-gray-300 text-gray-900"
            />
          </div>

          {/* Validation Feedback */}
          {validationResult && (
            <div
              className={`p-4 rounded-lg border ${
                validationResult.valid
                  ? "bg-green-50 border-green-200"
                  : "bg-red-50 border-red-200"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                {validationResult.valid ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-800">
                      JSON válido - {validationResult.preview.filter((p) => p.type === "modulo").length} módulos, {validationResult.preview.filter((p) => p.type === "leccion").length} lecciones
                    </span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <span className="font-medium text-red-800">
                      Errores encontrados ({validationResult.errors.length})
                    </span>
                  </>
                )}
              </div>

              {/* Errors */}
              {validationResult.errors.length > 0 && (
                <ul className="list-disc list-inside space-y-1 text-sm text-red-700 mb-3">
                  {validationResult.errors.map((error, i) => (
                    <li key={i}>{error}</li>
                  ))}
                </ul>
              )}

              {/* Warnings */}
              {validationResult.warnings.length > 0 && (
                <div className="mb-3 p-3 bg-amber-50 rounded border border-amber-200">
                  <div className="flex items-center gap-2 text-amber-800 font-medium text-sm mb-1">
                    <AlertTriangle className="h-4 w-4" />
                    Advertencias ({validationResult.warnings.length})
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-xs text-amber-700">
                    {validationResult.warnings.slice(0, 5).map((warning, i) => (
                      <li key={i}>{warning}</li>
                    ))}
                    {validationResult.warnings.length > 5 && (
                      <li>...y {validationResult.warnings.length - 5} más</li>
                    )}
                  </ul>
                </div>
              )}

              {/* Preview */}
              {validationResult.valid && (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {validationResult.preview
                    .filter((p) => p.type === "modulo")
                    .map((item, i) => (
                      <div
                        key={i}
                        className={`text-sm p-2 rounded ${
                          item.hasConflict
                            ? "bg-amber-100 text-amber-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        <span className="font-medium">📁 {item.titulo}</span>
                        <span className="text-xs ml-2 opacity-75">/{item.slug}</span>
                        {item.hasConflict && (
                          <span className="text-xs ml-2 bg-amber-200 px-1 rounded">
                            conflicto
                          </span>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* Conflict Resolution */}
          {validationResult?.valid && hasConflicts && (
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <Label className="text-gray-700 font-medium mb-3 block">
                Manejo de conflictos (slugs existentes):
              </Label>
              <RadioGroup
                value={conflictResolution}
                onValueChange={(v) => setConflictResolution(v as ImportConflictResolution)}
                className="space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="skip" id="skip" />
                  <Label htmlFor="skip" className="text-sm text-gray-600 cursor-pointer">
                    Saltar elementos con slug existente
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="overwrite" id="overwrite" />
                  <Label htmlFor="overwrite" className="text-sm text-gray-600 cursor-pointer">
                    Sobrescribir contenido existente
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="duplicate" id="duplicate" />
                  <Label htmlFor="duplicate" className="text-sm text-gray-600 cursor-pointer">
                    Crear duplicado con slug-copy
                  </Label>
                </div>
              </RadioGroup>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={handleClose}
              className="border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleImport}
              disabled={!validationResult?.valid || isImporting}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {isImporting ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Importando...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Importar
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
