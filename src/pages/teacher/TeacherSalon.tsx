import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useTeacherRole } from "@/hooks/useTeacherRole";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  Plus, Edit, Trash2, ChevronDown, ChevronRight,
  FolderPlus, School, Video, FileText, Globe, X, ChevronLeft, Eye, MonitorPlay,
  ClipboardList, ClipboardCheck,
} from "lucide-react";

type SalonModulo = { id: string; salon_id: string; titulo: string; order_index: number };
type ExtraUrl = { title: string; url: string; type: "web" | "pdf" | "iframe" };
type SalonLeccion = {
  id: string;
  salon_id: string;
  modulo_id: string | null;
  titulo: string;
  descripcion: string | null;
  video_url: string | null;
  youtube_url: string | null;
  pdf_url: string | null;
  extra_urls: ExtraUrl[] | null;
  contenido_html: string | null;
  order_index: number;
};

const emptyLeccionForm = {
  titulo: "",
  descripcion: "",
  modulo_id: "",
  video_url: "",
  youtube_url: "",
  pdf_url: "",
  extra_urls: [] as ExtraUrl[],
  contenido_html: "",
};

const TeacherSalon = () => {
  const { salonId } = useParams<{ salonId: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [expandedModulos, setExpandedModulos] = useState<Set<string>>(new Set());
  const [isModuloDialogOpen, setIsModuloDialogOpen] = useState(false);
  const [editingModulo, setEditingModulo] = useState<SalonModulo | null>(null);
  const [moduloTitulo, setModuloTitulo] = useState("");
  const [isLeccionDialogOpen, setIsLeccionDialogOpen] = useState(false);
  const [editingLeccion, setEditingLeccion] = useState<SalonLeccion | null>(null);
  const [leccionForm, setLeccionForm] = useState(emptyLeccionForm);
  const [newExtraUrl, setNewExtraUrl] = useState<ExtraUrl>({ title: "", url: "", type: "web" });


  const { isAdmin } = useTeacherRole();

  const { data: salon, isLoading: salonLoading } = useQuery({
    queryKey: ["teacher-salon-detail", salonId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("salones")
        .select("id, nombre, descripcion, teacher_id")
        .eq("id", salonId!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!salonId,
  });

  const { data: modulos = [] } = useQuery({
    queryKey: ["salon-modulos", salonId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("salon_modulos")
        .select("*")
        .eq("salon_id", salonId!)
        .order("order_index", { ascending: true });
      if (error) throw error;
      return data as SalonModulo[];
    },
    enabled: !!salonId,
  });

  const { data: lecciones = [] } = useQuery({
    queryKey: ["salon-lecciones", salonId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("salon_lecciones")
        .select("*")
        .eq("salon_id", salonId!)
        .order("order_index", { ascending: true });
      if (error) throw error;
      return data as unknown as SalonLeccion[];
    },
    enabled: !!salonId,
  });

  const isOwner = isAdmin || salon?.teacher_id === user?.id;

  const createModuloMutation = useMutation({
    mutationFn: async (titulo: string) => {
      const { error } = await supabase.from("salon_modulos").insert({
        salon_id: salonId!,
        titulo,
        order_index: modulos.length,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["salon-modulos", salonId] });
      setIsModuloDialogOpen(false);
      setModuloTitulo("");
      toast.success("Módulo creado");
    },
    onError: (e: Error) => toast.error(`Error: ${e.message}`),
  });

  const updateModuloMutation = useMutation({
    mutationFn: async ({ id, titulo }: { id: string; titulo: string }) => {
      const { error } = await supabase.from("salon_modulos").update({ titulo }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["salon-modulos", salonId] });
      setIsModuloDialogOpen(false);
      setEditingModulo(null);
      setModuloTitulo("");
      toast.success("Módulo actualizado");
    },
    onError: (e: Error) => toast.error(`Error: ${e.message}`),
  });

  const deleteModuloMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("salon_modulos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["salon-modulos", salonId] });
      queryClient.invalidateQueries({ queryKey: ["salon-lecciones", salonId] });
      toast.success("Módulo eliminado");
    },
    onError: (e: Error) => toast.error(`Error: ${e.message}`),
  });

  const createLeccionMutation = useMutation({
    mutationFn: async (form: typeof leccionForm) => {
      const leccionesInModulo = lecciones.filter((l) => l.modulo_id === (form.modulo_id || null));
      const { error } = await supabase.from("salon_lecciones").insert({
        salon_id: salonId!,
        modulo_id: form.modulo_id || null,
        titulo: form.titulo,
        descripcion: form.descripcion || null,
        video_url: form.video_url || null,
        youtube_url: form.youtube_url || null,
        pdf_url: form.pdf_url || null,
        extra_urls: form.extra_urls.length > 0 ? (form.extra_urls as unknown as never) : null,
        contenido_html: form.contenido_html || null,
        order_index: leccionesInModulo.length,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["salon-lecciones", salonId] });
      closeLeccionDialog();
      toast.success("Lección creada");
    },
    onError: (e: Error) => toast.error(`Error: ${e.message}`),
  });

  const updateLeccionMutation = useMutation({
    mutationFn: async ({ id, form }: { id: string; form: typeof leccionForm }) => {
      const { error } = await supabase.from("salon_lecciones").update({
        modulo_id: form.modulo_id || null,
        titulo: form.titulo,
        descripcion: form.descripcion || null,
        video_url: form.video_url || null,
        youtube_url: form.youtube_url || null,
        pdf_url: form.pdf_url || null,
        extra_urls: form.extra_urls.length > 0 ? (form.extra_urls as unknown as never) : null,
        contenido_html: form.contenido_html || null,
      }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["salon-lecciones", salonId] });
      closeLeccionDialog();
      toast.success("Lección actualizada");
    },
    onError: (e: Error) => toast.error(`Error: ${e.message}`),
  });

  const deleteLeccionMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("salon_lecciones").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["salon-lecciones", salonId] });
      toast.success("Lección eliminada");
    },
    onError: (e: Error) => toast.error(`Error: ${e.message}`),
  });

  const openAddModulo = () => { setEditingModulo(null); setModuloTitulo(""); setIsModuloDialogOpen(true); };
  const openEditModulo = (m: SalonModulo) => { setEditingModulo(m); setModuloTitulo(m.titulo); setIsModuloDialogOpen(true); };

  const handleModuloSubmit = () => {
    if (!moduloTitulo.trim()) return;
    editingModulo
      ? updateModuloMutation.mutate({ id: editingModulo.id, titulo: moduloTitulo })
      : createModuloMutation.mutate(moduloTitulo);
  };

  const openAddLeccion = (moduloId?: string) => {
    setEditingLeccion(null);
    setLeccionForm({ ...emptyLeccionForm, modulo_id: moduloId || "" });
    setIsLeccionDialogOpen(true);
  };

  const openEditLeccion = (leccion: SalonLeccion) => {
    setEditingLeccion(leccion);
    setLeccionForm({
      titulo: leccion.titulo,
      descripcion: leccion.descripcion || "",
      modulo_id: leccion.modulo_id || "",
      video_url: leccion.video_url || "",
      youtube_url: leccion.youtube_url || "",
      pdf_url: leccion.pdf_url || "",
      extra_urls: (leccion.extra_urls as ExtraUrl[]) || [],
      contenido_html: leccion.contenido_html || "",
    });
    setIsLeccionDialogOpen(true);
  };

  const closeLeccionDialog = () => {
    setIsLeccionDialogOpen(false);
    setEditingLeccion(null);
    setLeccionForm(emptyLeccionForm);
    setNewExtraUrl({ title: "", url: "", type: "web" });
  };

  const handleLeccionSubmit = () => {
    if (!leccionForm.titulo.trim()) return;
    editingLeccion
      ? updateLeccionMutation.mutate({ id: editingLeccion.id, form: leccionForm })
      : createLeccionMutation.mutate(leccionForm);
  };

  const addExtraUrl = () => {
    if (!newExtraUrl.title.trim() || !newExtraUrl.url.trim()) return;
    setLeccionForm((p) => ({ ...p, extra_urls: [...p.extra_urls, { ...newExtraUrl }] }));
    setNewExtraUrl({ title: "", url: "", type: "web" });
  };

  const removeExtraUrl = (i: number) =>
    setLeccionForm((p) => ({ ...p, extra_urls: p.extra_urls.filter((_, idx) => idx !== i) }));

  const toggleModulo = (id: string) => {
    setExpandedModulos((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  if (salonLoading) {
    return (
      <div className="p-8 flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!salon) {
    return (
      <div className="p-8 text-center py-20">
        <School className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground">No se pudo cargar el salón.</p>
        <Link to="/teacher" className="text-primary text-sm mt-2 inline-block hover:underline">← Volver</Link>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="p-8 text-center py-20">
        <School className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground">No tienes acceso a este salón.</p>
        <Link to="/teacher" className="text-primary text-sm mt-2 inline-block hover:underline">← Volver</Link>
      </div>
    );
  }

  const leccionesSinModulo = lecciones.filter((l) => !l.modulo_id);

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/teacher">
          <Button variant="ghost" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">{salon.nombre}</h1>
          {salon.descripcion && <p className="text-muted-foreground text-sm">{salon.descripcion}</p>}
        </div>
        <div className="flex gap-2">
          <Link to={`/salon/${salonId}?preview=true`}>
            <Button variant="outline">
              <Eye className="mr-2 h-4 w-4" />
              Vista de estudiante
            </Button>
          </Link>
          <Button variant="outline" onClick={openAddModulo}>
            <FolderPlus className="mr-2 h-4 w-4" />
            Nuevo módulo
          </Button>
          <Button onClick={() => openAddLeccion()}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva lección
          </Button>
        </div>
      </div>

      {/* Sub-navigation */}
      <div className="flex gap-2 mb-6 border-b pb-3">
        <Link to={`/teacher/salon/${salonId}`}>
          <Button variant="secondary" size="sm" className="gap-2">
            <FileText className="h-4 w-4" />
            Contenido
          </Button>
        </Link>
        <Link to={`/teacher/actividades/${salonId}`}>
          <Button variant="ghost" size="sm" className="gap-2">
            <ClipboardList className="h-4 w-4" />
            Actividades
          </Button>
        </Link>
        <Link to={`/teacher/calificaciones/${salonId}`}>
          <Button variant="ghost" size="sm" className="gap-2">
            <ClipboardCheck className="h-4 w-4" />
            Calificaciones
          </Button>
        </Link>
      </div>

      <div className="space-y-4">
        {modulos.map((modulo) => {
          const isExpanded = expandedModulos.has(modulo.id);
          const leccionesModulo = lecciones.filter((l) => l.modulo_id === modulo.id);
          return (
            <Card key={modulo.id}>
              <CardHeader className="py-3 px-4">
                <div className="flex items-center justify-between">
                  <button
                    className="flex items-center gap-2 flex-1 text-left"
                    onClick={() => toggleModulo(modulo.id)}
                  >
                    {isExpanded
                      ? <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                    <CardTitle className="text-base">{modulo.titulo}</CardTitle>
                    <span className="text-xs text-muted-foreground ml-2">({leccionesModulo.length} lecciones)</span>
                  </button>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => openAddLeccion(modulo.id)}>
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => openEditModulo(modulo)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive"
                      onClick={() => deleteModuloMutation.mutate(modulo.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {isExpanded && (
                <CardContent className="pt-0 px-4 pb-3">
                  {leccionesModulo.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-2 pl-6">Sin lecciones. Haz clic en + para agregar.</p>
                  ) : (
                    <div className="space-y-2 mt-2">
                      {leccionesModulo.map((l) => (
                        <LeccionRow key={l.id} leccion={l}
                          onEdit={() => openEditLeccion(l)}
                          onDelete={() => deleteLeccionMutation.mutate(l.id)} />
                      ))}
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          );
        })}

        {leccionesSinModulo.length > 0 && (
          <Card>
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-base text-muted-foreground">Sin módulo</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 px-4 pb-3 space-y-2">
              {leccionesSinModulo.map((l) => (
                <LeccionRow key={l.id} leccion={l}
                  onEdit={() => openEditLeccion(l)}
                  onDelete={() => deleteLeccionMutation.mutate(l.id)} />
              ))}
            </CardContent>
          </Card>
        )}

        {modulos.length === 0 && lecciones.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <FolderPlus className="h-12 w-12 mx-auto mb-3" />
            <p>Empieza creando un módulo o una lección.</p>
          </div>
        )}
      </div>

      {/* Module Dialog */}
      <Dialog open={isModuloDialogOpen} onOpenChange={setIsModuloDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingModulo ? "Editar módulo" : "Nuevo módulo"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Título</Label>
              <Input value={moduloTitulo} onChange={(e) => setModuloTitulo(e.target.value)}
                placeholder="Ej: Módulo 1 - Presente simple" />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsModuloDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleModuloSubmit} disabled={!moduloTitulo.trim()}>
                {editingModulo ? "Guardar" : "Crear"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Lesson Dialog */}
      <Dialog open={isLeccionDialogOpen} onOpenChange={(open) => !open && closeLeccionDialog()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingLeccion ? "Editar lección" : "Nueva lección"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Título *</Label>
              <Input value={leccionForm.titulo}
                onChange={(e) => setLeccionForm((p) => ({ ...p, titulo: e.target.value }))}
                placeholder="Título de la lección" />
            </div>

            <div>
              <Label>Módulo</Label>
              <Select value={leccionForm.modulo_id || "none"}
                onValueChange={(v) => setLeccionForm((p) => ({ ...p, modulo_id: v === "none" ? "" : v }))}>
                <SelectTrigger><SelectValue placeholder="Sin módulo" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin módulo</SelectItem>
                  {modulos.map((m) => <SelectItem key={m.id} value={m.id}>{m.titulo}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Descripción</Label>
              <Textarea value={leccionForm.descripcion}
                onChange={(e) => setLeccionForm((p) => ({ ...p, descripcion: e.target.value }))}
                placeholder="Descripción de la lección" rows={3} />
            </div>

            <div className="border rounded-lg p-4 space-y-3">
              <p className="text-sm font-medium flex items-center gap-2"><Video className="h-4 w-4" /> URLs de contenido</p>
              <div>
                <Label className="text-xs text-muted-foreground">Video URL (Drive, Vimeo, etc.)</Label>
                <Input value={leccionForm.video_url}
                  onChange={(e) => setLeccionForm((p) => ({ ...p, video_url: e.target.value }))}
                  placeholder="https://drive.google.com/..." />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">YouTube URL</Label>
                <Input value={leccionForm.youtube_url}
                  onChange={(e) => setLeccionForm((p) => ({ ...p, youtube_url: e.target.value }))}
                  placeholder="https://youtube.com/watch?v=..." />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">PDF URL</Label>
                <Input value={leccionForm.pdf_url}
                  onChange={(e) => setLeccionForm((p) => ({ ...p, pdf_url: e.target.value }))}
                  placeholder="https://drive.google.com/..." />
              </div>
            </div>

            <div className="border rounded-lg p-4 space-y-3">
              <p className="text-sm font-medium flex items-center gap-2"><MonitorPlay className="h-4 w-4" /> Contenido HTML</p>
              <p className="text-xs text-muted-foreground">Puedes pegar HTML directamente, incluyendo iframes embebidos.</p>
              <Textarea
                value={leccionForm.contenido_html}
                onChange={(e) => setLeccionForm((p) => ({ ...p, contenido_html: e.target.value }))}
                placeholder={'<iframe src="https://..." width="100%" height="500"></iframe>'}
                rows={6}
                className="font-mono text-xs"
              />
            </div>

            <div className="border rounded-lg p-4 space-y-3">
              <p className="text-sm font-medium flex items-center gap-2"><Globe className="h-4 w-4" /> URLs adicionales</p>
              {leccionForm.extra_urls.map((url, i) => (
                <div key={i} className="flex items-center gap-2 text-sm bg-muted/50 p-2 rounded">
                  {url.type === "pdf" ? <FileText className="h-4 w-4 shrink-0" /> : url.type === "iframe" ? <MonitorPlay className="h-4 w-4 shrink-0" /> : <Globe className="h-4 w-4 shrink-0" />}
                  <span className="font-medium">{url.title}</span>
                  <span className="text-muted-foreground truncate flex-1">{url.url}</span>
                  <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => removeExtraUrl(i)}>
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              <div className="grid grid-cols-[auto_1fr_2fr_auto] gap-2 items-end">
                <div>
                  <Label className="text-xs">Tipo</Label>
                  <Select value={newExtraUrl.type}
                    onValueChange={(v: "web" | "pdf" | "iframe") => setNewExtraUrl((p) => ({ ...p, type: v }))}>
                    <SelectTrigger className="h-8 w-24"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="web">Web</SelectItem>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="iframe">Iframe</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Nombre</Label>
                  <Input className="h-8" value={newExtraUrl.title}
                    onChange={(e) => setNewExtraUrl((p) => ({ ...p, title: e.target.value }))}
                    placeholder="Nombre" />
                </div>
                <div>
                  <Label className="text-xs">URL</Label>
                  <Input className="h-8" value={newExtraUrl.url}
                    onChange={(e) => setNewExtraUrl((p) => ({ ...p, url: e.target.value }))}
                    placeholder="https://..." />
                </div>
                <Button size="sm" variant="outline" onClick={addExtraUrl} className="h-8 mt-4">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={closeLeccionDialog}>Cancelar</Button>
              <Button onClick={handleLeccionSubmit}
                disabled={!leccionForm.titulo.trim() || createLeccionMutation.isPending || updateLeccionMutation.isPending}>
                {editingLeccion ? "Guardar cambios" : "Crear lección"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const LeccionRow = ({ leccion, onEdit, onDelete }: { leccion: SalonLeccion; onEdit: () => void; onDelete: () => void }) => (
  <div className="flex items-center gap-3 p-2 pl-6 rounded-md hover:bg-muted/50 group">
    <Video className="h-4 w-4 text-muted-foreground shrink-0" />
    <span className="flex-1 text-sm font-medium">{leccion.titulo}</span>
    {leccion.descripcion && (
      <span className="text-xs text-muted-foreground hidden md:block truncate max-w-xs">{leccion.descripcion}</span>
    )}
    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={onEdit}><Edit className="h-3.5 w-3.5" /></Button>
      <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={onDelete}>
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  </div>
);

export default TeacherSalon;
