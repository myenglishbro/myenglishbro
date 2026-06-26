import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FolderPlus, Edit } from "lucide-react";
import { Modulo, ModuloFormData } from "../../types/lessonManagement.types";

interface ModuleFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ModuloFormData) => void;
  editingModulo?: Modulo | null;
  existingSlugs: string[];
  isLoading?: boolean;
}

export const ModuleFormDialog = ({
  isOpen,
  onClose,
  onSubmit,
  editingModulo,
  existingSlugs,
  isLoading,
}: ModuleFormDialogProps) => {
  const [formData, setFormData] = useState<ModuloFormData>({
    titulo: "",
    slug: "",
  });
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [slugError, setSlugError] = useState("");

  useEffect(() => {
    if (editingModulo) {
      setFormData({
        titulo: editingModulo.titulo,
        slug: editingModulo.slug,
      });
      setSlugManuallyEdited(true); // Don't auto-generate for edits
    } else {
      setFormData({ titulo: "", slug: "" });
      setSlugManuallyEdited(false);
    }
    setSlugError("");
  }, [editingModulo, isOpen]);

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

  const handleTituloChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      titulo: value,
      slug: slugManuallyEdited ? prev.slug : generateSlug(value),
    }));
  };

  const handleSlugChange = (value: string) => {
    setSlugManuallyEdited(true);
    const cleanSlug = value
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-");
    setFormData((prev) => ({ ...prev, slug: cleanSlug }));
    
    // Check for duplicates
    const isDuplicate = existingSlugs.includes(cleanSlug) && 
      cleanSlug !== editingModulo?.slug;
    setSlugError(isDuplicate ? "Este slug ya existe" : "");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (slugError) return;
    onSubmit(formData);
  };

  const isEditing = !!editingModulo;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white border-gray-200 text-gray-900 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-gray-900 text-xl font-semibold flex items-center gap-2">
            {isEditing ? (
              <>
                <Edit className="h-5 w-5 text-indigo-600" />
                Editar Módulo
              </>
            ) : (
              <>
                <FolderPlus className="h-5 w-5 text-indigo-600" />
                Nuevo Módulo
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="titulo" className="text-gray-700 font-medium">
              Título del módulo
            </Label>
            <Input
              id="titulo"
              value={formData.titulo}
              onChange={(e) => handleTituloChange(e.target.value)}
              placeholder="Ej: Present Simple, Past Tenses"
              required
              className="bg-white border-gray-300 text-gray-900"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug" className="text-gray-700 font-medium">
              Slug (identificador URL)
            </Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              placeholder="present-simple"
              required
              className={`bg-white border-gray-300 text-gray-900 font-mono ${
                slugError ? "border-red-500" : ""
              }`}
            />
            {slugError ? (
              <p className="text-xs text-red-500">{slugError}</p>
            ) : (
              <p className="text-xs text-gray-500">
                {isEditing
                  ? "⚠️ Cambiar el slug puede romper enlaces existentes"
                  : "Se genera automáticamente, pero puedes editarlo"}
              </p>
            )}
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !!slugError || !formData.titulo.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {isLoading ? "Guardando..." : isEditing ? "Actualizar" : "Crear"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
