import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Eye, EyeOff, BookOpen, MonitorPlay, Video } from "lucide-react";

const NIVELES = ["All", "A1", "A2", "B1", "B2", "C1", "C2"];
const CATEGORIAS = [
  "General",
  "Grammar",
  "Vocabulary",
  "Listening",
  "Pronunciation",
  "Speaking",
  "Reading",
  "Writing",
  "Tips",
];

type LeccionPublica = {
  id: string;
  titulo: string;
  slug: string;
  descripcion: string | null;
  contenido_html: string | null;
  youtube_url: string | null;
  imagen_url: string | null;
  nivel: string;
  categoria: string;
  publicado: boolean;
  created_at: string;
  updated_at: string;
};

type FormData = {
  titulo: string;
  slug: string;
  descripcion: string;
  contenido_html: string;
  youtube_url: string;
  imagen_url: string;
  nivel: string;
  categoria: string;
  publicado: boolean;
};

const emptyForm: FormData = {
  titulo: "",
  slug: "",
  descripcion: "",
  contenido_html: "",
  youtube_url: "",
  imagen_url: "",
  nivel: "All",
  categoria: "General",
  publicado: false,
};

const generateSlug = (title: string) =>
  title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();

const AdminLessonsBlog = () => {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<LeccionPublica | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [slugManual, setSlugManual] = useState(false);
  const [slugError, setSlugError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<LeccionPublica | null>(null);

  const { data: lessons = [], isLoading } = useQuery({
    queryKey: ["lecciones-publicas-admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lecciones_publicas")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as LeccionPublica[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const { error } = await supabase.from("lecciones_publicas").insert({
        titulo: data.titulo,
        slug: data.slug,
        descripcion: data.descripcion || null,
        contenido_html: data.contenido_html || null,
        youtube_url: data.youtube_url || null,
        imagen_url: data.imagen_url || null,
        nivel: data.nivel,
        categoria: data.categoria,
        publicado: data.publicado,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lecciones-publicas-admin"] });
      toast.success("Lección creada");
      closeDialog();
    },
    onError: (e) => toast.error("Error: " + e.message),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: FormData }) => {
      const { error } = await supabase
        .from("lecciones_publicas")
        .update({
          titulo: data.titulo,
          slug: data.slug,
          descripcion: data.descripcion || null,
          contenido_html: data.contenido_html || null,
          youtube_url: data.youtube_url || null,
          imagen_url: data.imagen_url || null,
          nivel: data.nivel,
          categoria: data.categoria,
          publicado: data.publicado,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lecciones-publicas-admin"] });
      toast.success("Lección actualizada");
      closeDialog();
    },
    onError: (e) => toast.error("Error: " + e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("lecciones_publicas").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lecciones-publicas-admin"] });
      toast.success("Lección eliminada");
      setDeleteTarget(null);
    },
    onError: (e) => toast.error("Error: " + e.message),
  });

  const togglePublishedMutation = useMutation({
    mutationFn: async ({ id, publicado }: { id: string; publicado: boolean }) => {
      const { error } = await supabase
        .from("lecciones_publicas")
        .update({ publicado })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lecciones-publicas-admin"] });
    },
    onError: (e) => toast.error("Error: " + e.message),
  });

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setSlugManual(false);
    setSlugError("");
    setDialogOpen(true);
  };

  const openEdit = (lesson: LeccionPublica) => {
    setEditing(lesson);
    setForm({
      titulo: lesson.titulo,
      slug: lesson.slug,
      descripcion: lesson.descripcion || "",
      contenido_html: lesson.contenido_html || "",
      youtube_url: lesson.youtube_url || "",
      imagen_url: lesson.imagen_url || "",
      nivel: lesson.nivel,
      categoria: lesson.categoria,
      publicado: lesson.publicado,
    });
    setSlugManual(true);
    setSlugError("");
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditing(null);
    setForm(emptyForm);
    setSlugManual(false);
    setSlugError("");
  };

  const handleTituloChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      titulo: value,
      slug: slugManual ? prev.slug : generateSlug(value),
    }));
  };

  const handleSlugChange = (value: string) => {
    setSlugManual(true);
    const clean = value.toLowerCase().replace(/[^a-z0-9-]/g, "").replace(/-+/g, "-");
    setForm((prev) => ({ ...prev, slug: clean }));
    const isDup = lessons.some((l) => l.slug === clean && l.id !== editing?.id);
    setSlugError(isDup ? "Este slug ya existe" : "");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (slugError) return;
    if (editing) {
      updateMutation.mutate({ id: editing.id, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-indigo-600" />
            Free Lessons
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Lecciones públicas con explicaciones e iframes — visibles para todos
          </p>
        </div>
        <Button onClick={openCreate} className="bg-indigo-600 hover:bg-indigo-700 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Nueva Lección
        </Button>
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 bg-gray-100 rounded-lg" />
          ))}
        </div>
      ) : lessons.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
          <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">No hay lecciones aún</h3>
          <p className="text-gray-400 text-sm mb-4">
            Crea tu primera lección pública con explicaciones e iframes
          </p>
          <Button onClick={openCreate} className="bg-indigo-600 hover:bg-indigo-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Crear primera lección
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold text-gray-700">Título</TableHead>
                <TableHead className="font-semibold text-gray-700">Nivel</TableHead>
                <TableHead className="font-semibold text-gray-700">Categoría</TableHead>
                <TableHead className="font-semibold text-gray-700">Estado</TableHead>
                <TableHead className="font-semibold text-gray-700">Fecha</TableHead>
                <TableHead className="font-semibold text-gray-700 text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lessons.map((lesson) => (
                <TableRow key={lesson.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div>
                      <p className="font-medium text-gray-900">{lesson.titulo}</p>
                      <p className="text-xs text-gray-400 font-mono">/lessons/{lesson.slug}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {lesson.nivel}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600">{lesson.categoria}</span>
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() =>
                        togglePublishedMutation.mutate({
                          id: lesson.id,
                          publicado: !lesson.publicado,
                        })
                      }
                      className="flex items-center gap-1.5 text-sm"
                    >
                      {lesson.publicado ? (
                        <>
                          <Eye className="h-4 w-4 text-emerald-500" />
                          <span className="text-emerald-600 font-medium">Publicado</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-400">Borrador</span>
                        </>
                      )}
                    </button>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-gray-500">
                      {new Date(lesson.created_at).toLocaleDateString("es-PE")}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openEdit(lesson)}
                        className="text-gray-600 hover:text-indigo-600"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDeleteTarget(lesson)}
                        className="text-gray-600 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={closeDialog}>
        <DialogContent className="bg-white border-gray-200 text-gray-900 max-w-2xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold flex items-center gap-2">
              {editing ? (
                <><Edit className="h-5 w-5 text-indigo-600" /> Editar Lección</>
              ) : (
                <><Plus className="h-5 w-5 text-indigo-600" /> Nueva Lección</>
              )}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5 mt-2">
            {/* Title + Slug */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Título</Label>
                <Input
                  value={form.titulo}
                  onChange={(e) => handleTituloChange(e.target.value)}
                  placeholder="Present Perfect Explained"
                  required
                  className="bg-white border-gray-300"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Slug</Label>
                <Input
                  value={form.slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  placeholder="present-perfect-explained"
                  required
                  className={`bg-white border-gray-300 font-mono text-sm ${slugError ? "border-red-500" : ""}`}
                />
                {slugError && <p className="text-xs text-red-500">{slugError}</p>}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label className="text-gray-700 font-medium">Descripción corta</Label>
              <Textarea
                value={form.descripcion}
                onChange={(e) => setForm((p) => ({ ...p, descripcion: e.target.value }))}
                placeholder="Un resumen breve que aparecerá en la tarjeta de la lección..."
                rows={2}
                className="bg-white border-gray-300"
              />
            </div>

            {/* Level + Category */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Nivel</Label>
                <Select
                  value={form.nivel}
                  onValueChange={(v) => setForm((p) => ({ ...p, nivel: v }))}
                >
                  <SelectTrigger className="bg-white border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {NIVELES.map((n) => (
                      <SelectItem key={n} value={n}>{n}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Categoría</Label>
                <Select
                  value={form.categoria}
                  onValueChange={(v) => setForm((p) => ({ ...p, categoria: v }))}
                >
                  <SelectTrigger className="bg-white border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIAS.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Thumbnail URL */}
            <div className="space-y-2">
              <Label className="text-gray-700 font-medium">Imagen / thumbnail (URL)</Label>
              <Input
                value={form.imagen_url}
                onChange={(e) => setForm((p) => ({ ...p, imagen_url: e.target.value }))}
                placeholder="https://..."
                className="bg-white border-gray-300"
              />
            </div>

            {/* YouTube URL */}
            <div className="space-y-2">
              <Label className="text-gray-700 font-medium flex items-center gap-2">
                <Video className="h-4 w-4 text-red-500" />
                YouTube URL (opcional)
              </Label>
              <Input
                value={form.youtube_url}
                onChange={(e) => setForm((p) => ({ ...p, youtube_url: e.target.value }))}
                placeholder="https://youtube.com/watch?v=... o embed URL"
                className="bg-white border-gray-300"
              />
            </div>

            {/* HTML Content */}
            <div className="border-2 border-purple-200 rounded-lg p-4 space-y-3 bg-purple-50/40">
              <div className="flex items-center gap-2">
                <MonitorPlay className="h-5 w-5 text-purple-600" />
                <Label className="text-purple-800 font-bold">Contenido HTML</Label>
              </div>
              <p className="text-xs text-gray-500">
                Pega HTML con tu explicación. Puedes incluir iframes de YouTube, Google Slides,
                Canva, Quizlet, etc.
              </p>
              <Textarea
                value={form.contenido_html}
                onChange={(e) => setForm((p) => ({ ...p, contenido_html: e.target.value }))}
                placeholder={'<p>Explicación...</p>\n\n<iframe src="https://..." width="100%" height="400" allowfullscreen></iframe>'}
                rows={10}
                className="font-mono text-xs bg-white border-gray-300"
              />
            </div>

            {/* Published toggle */}
            <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
              <Switch
                checked={form.publicado}
                onCheckedChange={(v) => setForm((p) => ({ ...p, publicado: v }))}
              />
              <Label className="text-gray-700 flex items-center gap-2 cursor-pointer">
                <Eye className="h-4 w-4 text-emerald-600" />
                Publicar (visible para todos)
              </Label>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
              <Button type="button" variant="outline" onClick={closeDialog} className="border-gray-300">
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isPending || !!slugError || !form.titulo.trim()}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {isPending ? "Guardando..." : editing ? "Actualizar" : "Crear"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="bg-white border-gray-200 text-gray-900 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              Eliminar lección
            </DialogTitle>
          </DialogHeader>
          <p className="text-gray-600 mt-2">
            ¿Estás seguro que quieres eliminar{" "}
            <span className="font-semibold text-gray-900">"{deleteTarget?.titulo}"</span>?
            Esta acción no se puede deshacer.
          </p>
          <div className="flex gap-3 justify-end mt-4">
            <Button variant="outline" onClick={() => setDeleteTarget(null)} className="border-gray-300">
              Cancelar
            </Button>
            <Button
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
              disabled={deleteMutation.isPending}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleteMutation.isPending ? "Eliminando..." : "Eliminar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminLessonsBlog;
