import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Edit, Video, FileText, Globe, X, Eye, MonitorPlay } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Leccion, Modulo, LeccionFormData, ExtraUrl } from "../../types/lessonManagement.types";

interface LessonFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: LeccionFormData) => void;
  editingLeccion?: Leccion | null;
  modulos: Modulo[];
  defaultModuloId?: string;
  existingSlugs: string[];
  isLoading?: boolean;
}

export const LessonFormDialog = ({
  isOpen,
  onClose,
  onSubmit,
  editingLeccion,
  modulos,
  defaultModuloId,
  existingSlugs,
  isLoading,
}: LessonFormDialogProps) => {
  const [formData, setFormData] = useState<LeccionFormData>({
    titulo: "",
    slug: "",
    descripcion: "",
    order_index: 0,
    video_url: "",
    youtube_url: "",
    pdf_url: "",
    extra_urls: [],
    contenido_html: "",
    modulo_id: "",
    es_preview: false,
  });
  const [newExtraUrl, setNewExtraUrl] = useState<ExtraUrl>({
    title: "",
    url: "",
    type: "web",
  });
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [slugError, setSlugError] = useState("");

  useEffect(() => {
    if (editingLeccion) {
      setFormData({
        titulo: editingLeccion.titulo,
        slug: editingLeccion.slug,
        descripcion: editingLeccion.descripcion || "",
        order_index: editingLeccion.order_index,
        video_url: editingLeccion.video_url || "",
        youtube_url: editingLeccion.youtube_url || "",
        pdf_url: editingLeccion.pdf_url || "",
        extra_urls: (editingLeccion.extra_urls as ExtraUrl[]) || [],
        contenido_html: editingLeccion.contenido_html || "",
        modulo_id: editingLeccion.modulo_id || "",
        es_preview: editingLeccion.es_preview || false,
      });
      setSlugManuallyEdited(true);
    } else {
      setFormData({
        titulo: "",
        slug: "",
        descripcion: "",
        order_index: 0,
        video_url: "",
        youtube_url: "",
        pdf_url: "",
        extra_urls: [],
        contenido_html: "",
        modulo_id: defaultModuloId || modulos[0]?.id || "",
        es_preview: false,
      });
      setSlugManuallyEdited(false);
    }
    setSlugError("");
    setNewExtraUrl({ title: "", url: "", type: "web" });
  }, [editingLeccion, isOpen, defaultModuloId, modulos]);

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

    const isDuplicate =
      existingSlugs.includes(cleanSlug) && cleanSlug !== editingLeccion?.slug;
    setSlugError(isDuplicate ? "Este slug ya existe" : "");
  };

  const addExtraUrl = () => {
    if (newExtraUrl.title && newExtraUrl.url) {
      setFormData((prev) => ({
        ...prev,
        extra_urls: [...prev.extra_urls, newExtraUrl],
      }));
      setNewExtraUrl({ title: "", url: "", type: "web" });
    }
  };

  const removeExtraUrl = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      extra_urls: prev.extra_urls.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (slugError) return;
    onSubmit(formData);
  };

  const isEditing = !!editingLeccion;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white border-gray-200 text-gray-900 max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-gray-900 text-xl font-semibold flex items-center gap-2">
            {isEditing ? (
              <>
                <Edit className="h-5 w-5 text-indigo-600" />
                Editar Lección
              </>
            ) : (
              <>
                <Plus className="h-5 w-5 text-indigo-600" />
                Nueva Lección
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Module Selection */}
          <div className="space-y-2">
            <Label className="text-gray-700 font-medium">Módulo</Label>
            <Select
              value={formData.modulo_id}
              onValueChange={(v) => setFormData((prev) => ({ ...prev, modulo_id: v }))}
            >
              <SelectTrigger className="bg-white border-gray-300">
                <SelectValue placeholder="Selecciona un módulo" />
              </SelectTrigger>
              <SelectContent>
                {modulos
                  .sort((a, b) => a.order_index - b.order_index)
                  .map((modulo) => (
                    <SelectItem key={modulo.id} value={modulo.id}>
                      {modulo.titulo}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {/* Title and Slug */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="titulo" className="text-gray-700 font-medium">
                Título
              </Label>
              <Input
                id="titulo"
                value={formData.titulo}
                onChange={(e) => handleTituloChange(e.target.value)}
                placeholder="Introducción al tema"
                required
                className="bg-white border-gray-300 text-gray-900"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug" className="text-gray-700 font-medium">
                Slug
              </Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="introduccion-tema"
                required
                className={`bg-white border-gray-300 text-gray-900 font-mono ${
                  slugError ? "border-red-500" : ""
                }`}
              />
              {slugError && <p className="text-xs text-red-500">{slugError}</p>}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="descripcion" className="text-gray-700 font-medium">
              Descripción
            </Label>
            <Textarea
              id="descripcion"
              value={formData.descripcion}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, descripcion: e.target.value }))
              }
              placeholder="Descripción de la lección..."
              rows={2}
              className="bg-white border-gray-300 text-gray-900"
            />
          </div>

          {/* Video URLs */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-700 font-medium flex items-center gap-2">
                <Video className="h-4 w-4 text-red-500" />
                Google Drive Video
              </Label>
              <Input
                value={formData.video_url}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, video_url: e.target.value }))
                }
                placeholder="https://drive.google.com/..."
                className="bg-white border-gray-300 text-gray-900"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-700 font-medium flex items-center gap-2">
                <Video className="h-4 w-4 text-red-600" />
                YouTube URL
              </Label>
              <Input
                value={formData.youtube_url}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, youtube_url: e.target.value }))
                }
                placeholder="https://youtube.com/..."
                className="bg-white border-gray-300 text-gray-900"
              />
            </div>
          </div>

          {/* PDF URL */}
          <div className="space-y-2">
            <Label className="text-gray-700 font-medium flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-500" />
              Google Drive PDF
            </Label>
            <Input
              value={formData.pdf_url}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, pdf_url: e.target.value }))
              }
              placeholder="https://drive.google.com/..."
              className="bg-white border-gray-300 text-gray-900"
            />
          </div>

          {/* Extra URLs */}
          <div className="border-2 border-indigo-300 rounded-lg p-4 space-y-3 bg-indigo-50/50">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-indigo-600" />
              <Label className="text-indigo-800 font-bold">
                Enlaces adicionales
              </Label>
            </div>

            {/* Added URLs */}
            {formData.extra_urls.length > 0 && (
              <div className="space-y-2">
                {formData.extra_urls.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-white p-2 rounded border border-green-200"
                  >
                    {item.type === "web" ? (
                      <Globe className="h-4 w-4 text-indigo-600" />
                    ) : (
                      <FileText className="h-4 w-4 text-emerald-600" />
                    )}
                    <span className="text-sm flex-1 truncate">{item.title}</span>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                      {item.type}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-red-500"
                      onClick={() => removeExtraUrl(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Add new URL */}
            <div className="grid grid-cols-12 gap-2 items-end">
              <div className="col-span-4">
                <Label className="text-xs text-gray-600">Título</Label>
                <Input
                  value={newExtraUrl.title}
                  onChange={(e) =>
                    setNewExtraUrl((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="Ejercicios"
                  className="bg-white border-gray-300 text-sm"
                />
              </div>
              <div className="col-span-4">
                <Label className="text-xs text-gray-600">URL</Label>
                <Input
                  value={newExtraUrl.url}
                  onChange={(e) =>
                    setNewExtraUrl((prev) => ({ ...prev, url: e.target.value }))
                  }
                  placeholder="https://..."
                  className="bg-white border-gray-300 text-sm"
                />
              </div>
              <div className="col-span-2">
                <Label className="text-xs text-gray-600">Tipo</Label>
                <Select
                  value={newExtraUrl.type}
                  onValueChange={(v) =>
                    setNewExtraUrl((prev) => ({
                      ...prev,
                      type: v as "web" | "pdf" | "iframe",
                    }))
                  }
                >
                  <SelectTrigger className="bg-white border-gray-300 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="web">Web</SelectItem>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="iframe">Iframe</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Button
                  type="button"
                  onClick={addExtraUrl}
                  disabled={!newExtraUrl.title || !newExtraUrl.url}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* HTML Content */}
          <div className="border-2 border-purple-300 rounded-lg p-4 space-y-3 bg-purple-50/50">
            <div className="flex items-center gap-2">
              <MonitorPlay className="h-5 w-5 text-purple-600" />
              <Label className="text-purple-800 font-bold">Contenido HTML</Label>
            </div>
            <p className="text-xs text-gray-500">Puedes pegar HTML directamente, incluyendo iframes embebidos.</p>
            <Textarea
              value={formData.contenido_html}
              onChange={(e) => setFormData((prev) => ({ ...prev, contenido_html: e.target.value }))}
              placeholder={'<iframe src="https://..." width="100%" height="500"></iframe>'}
              rows={6}
              className="font-mono text-xs bg-white border-gray-300"
            />
          </div>

          {/* Preview lesson toggle */}
          <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
            <Switch
              id="es_preview"
              checked={formData.es_preview}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, es_preview: checked }))
              }
            />
            <Label htmlFor="es_preview" className="text-gray-700 flex items-center gap-2 cursor-pointer">
              <Eye className="h-4 w-4 text-emerald-600" />
              Clase gratuita / Preview lesson
            </Label>
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
