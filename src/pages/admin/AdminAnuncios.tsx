import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, ExternalLink, Image, Megaphone } from "lucide-react";

interface Announcement {
  id: string;
  titulo: string;
  descripcion: string | null;
  imagen_url: string | null;
  link_url: string | null;
  preview_url: string | null;
  activo: boolean;
  orden: number;
  created_at: string;
}

type FormState = {
  titulo: string;
  descripcion: string;
  imagen_url: string;
  link_url: string;
  preview_url: string;
  activo: boolean;
  orden: number;
};

const EMPTY: FormState = {
  titulo: "",
  descripcion: "",
  imagen_url: "",
  link_url: "",
  preview_url: "",
  activo: true,
  orden: 0,
};

const AdminAnuncios = () => {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);

  const { data: announcements = [], isLoading } = useQuery({
    queryKey: ["admin-announcements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("announcements")
        .select("*")
        .order("orden");
      if (error) throw error;
      return data as Announcement[];
    },
  });

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        titulo: form.titulo.trim(),
        descripcion: form.descripcion.trim() || null,
        imagen_url: form.imagen_url.trim() || null,
        link_url: form.link_url.trim() || null,
        preview_url: form.preview_url.trim() || null,
        activo: form.activo,
        orden: Number(form.orden) || 0,
      };
      if (editing) {
        const { error } = await supabase
          .from("announcements")
          .update(payload)
          .eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("announcements").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-announcements"] });
      qc.invalidateQueries({ queryKey: ["announcements"] });
      toast.success(editing ? "Anuncio actualizado" : "Anuncio creado");
      setOpen(false);
    },
    onError: () => toast.error("Error al guardar el anuncio"),
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, activo }: { id: string; activo: boolean }) => {
      const { error } = await supabase
        .from("announcements")
        .update({ activo })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-announcements"] });
      qc.invalidateQueries({ queryKey: ["announcements"] });
    },
    onError: () => toast.error("Error al actualizar"),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("announcements")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-announcements"] });
      qc.invalidateQueries({ queryKey: ["announcements"] });
      toast.success("Anuncio eliminado");
    },
    onError: () => toast.error("Error al eliminar"),
  });

  const openCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY, orden: announcements.length });
    setOpen(true);
  };

  const openEdit = (a: Announcement) => {
    setEditing(a);
    setForm({
      titulo: a.titulo,
      descripcion: a.descripcion ?? "",
      imagen_url: a.imagen_url ?? "",
      link_url: a.link_url ?? "",
      preview_url: a.preview_url ?? "",
      activo: a.activo,
      orden: a.orden,
    });
    setOpen(true);
  };

  const set = (field: keyof FormState, value: string | boolean | number) =>
    setForm((f) => ({ ...f, [field]: value }));

  return (
    <div className="p-8 light" style={{ colorScheme: "light" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 font-display flex items-center gap-2">
            <Megaphone className="h-6 w-6 text-primary" />
            Anuncios del Dashboard
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Los estudiantes los ven como carrusel al entrar a su dashboard.
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="bg-primary hover:bg-primary/90 text-white rounded-xl gap-2"
        >
          <Plus className="h-4 w-4" />
          Nuevo anuncio
        </Button>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : announcements.length === 0 ? (
        <div className="dashboard-card p-16 text-center">
          <Megaphone className="h-10 w-10 text-slate-200 mx-auto mb-4" />
          <p className="text-slate-400 font-medium mb-1">No hay anuncios aún</p>
          <p className="text-slate-400 text-sm">
            Crea el primero con el botón de arriba.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.map((a) => (
            <div
              key={a.id}
              className={`dashboard-card p-4 flex items-center gap-4 transition-opacity ${
                !a.activo ? "opacity-60" : ""
              }`}
            >
              {/* Thumbnail */}
              <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden border border-slate-200">
                {a.imagen_url ? (
                  <img
                    src={a.imagen_url}
                    alt={a.titulo}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Image className="h-5 w-5 text-slate-300" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="font-semibold text-slate-800 text-sm truncate">
                    {a.titulo}
                  </p>
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full font-medium shrink-0 ${
                      a.activo
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {a.activo ? "Activo" : "Inactivo"}
                  </span>
                  <span className="text-[11px] text-slate-400 shrink-0">
                    #{a.orden}
                  </span>
                </div>
                {a.descripcion && (
                  <p className="text-xs text-slate-500 truncate">{a.descripcion}</p>
                )}
                {a.link_url && (
                  <a
                    href={a.link_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-primary hover:underline flex items-center gap-1 mt-0.5"
                  >
                    <ExternalLink className="h-3 w-3" />
                    {a.link_url}
                  </a>
                )}
                {a.preview_url && (
                  <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                    🎬 Vista previa configurada
                  </span>
                )}
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2 shrink-0">
                <Switch
                  checked={a.activo}
                  onCheckedChange={(v) =>
                    toggleActive.mutate({ id: a.id, activo: v })
                  }
                />
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => openEdit(a)}
                  className="h-8 w-8 text-slate-400 hover:text-primary hover:bg-primary/5"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => {
                    if (confirm("¿Eliminar este anuncio?")) remove.mutate(a.id);
                  }}
                  className="h-8 w-8 text-slate-400 hover:text-destructive hover:bg-destructive/5"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="max-w-lg light"
          style={{ colorScheme: "light" }}
        >
          <DialogHeader>
            <DialogTitle>
              {editing ? "Editar anuncio" : "Nuevo anuncio"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-1">
            <div className="space-y-1.5">
              <Label>Título *</Label>
              <Input
                value={form.titulo}
                onChange={(e) => set("titulo", e.target.value)}
                placeholder="Ej: 📚 Libro Cambridge B2 First"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Descripción</Label>
              <Textarea
                value={form.descripcion}
                onChange={(e) => set("descripcion", e.target.value)}
                placeholder="Breve descripción visible en el carrusel..."
                rows={3}
              />
            </div>

            <div className="space-y-1.5">
              <Label>URL de imagen</Label>
              <Input
                value={form.imagen_url}
                onChange={(e) => set("imagen_url", e.target.value)}
                placeholder="https://ejemplo.com/imagen.jpg"
              />
              <p className="text-xs text-slate-400">
                Opcional. Se muestra a la izquierda del anuncio.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label>Link de WhatsApp</Label>
              <Input
                value={form.link_url}
                onChange={(e) => set("link_url", e.target.value)}
                placeholder="https://wa.link/..."
              />
              <p className="text-xs text-slate-400">
                Opcional. Muestra el botón verde "WhatsApp".
              </p>
            </div>

            <div className="space-y-1.5">
              <Label>Link de vista previa</Label>
              <Input
                value={form.preview_url}
                onChange={(e) => set("preview_url", e.target.value)}
                placeholder="Link de YouTube, Google Drive o imagen"
              />
              <p className="text-xs text-slate-400">
                Opcional. Muestra el botón "Vista previa" con un video o documento embebido.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Orden (menor = primero)</Label>
                <Input
                  type="number"
                  value={form.orden}
                  onChange={(e) => set("orden", e.target.value)}
                  min={0}
                />
              </div>
              <div className="flex items-end gap-3 pb-1">
                <Switch
                  checked={form.activo}
                  onCheckedChange={(v) => set("activo", v)}
                  id="activo-switch"
                />
                <Label htmlFor="activo-switch">
                  {form.activo ? "Activo" : "Inactivo"}
                </Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => save.mutate()}
              disabled={!form.titulo.trim() || save.isPending}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              {save.isPending ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminAnuncios;
