import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface Programa {
  id: string;
  nombre: string;
  nivel: string;
  slug: string;
  fecha_inicio: string;
  dias_clase: string;
  horario: string;
  duracion_meses: number;
  precio_mensual: number;
  max_estudiantes: number;
  min_estudiantes: number;
  requisito_nivel: string | null;
  estado_inscripcion: string;
  descripcion: string | null;
  descripcion_completa: string | null;
  imagen_url: string | null;
  imagen_promocional_url: string | null;
  syllabus: any | null;
  whatsapp_url: string | null;
  incluye_plataforma: boolean;
  fecha_creacion: string;
}

const emptyForm = {
  nombre: "",
  nivel: "A1",
  fecha_inicio: "",
  dias_clase: "",
  horario: "",
  duracion_meses: 4,
  precio_mensual: 300,
  max_estudiantes: 8,
  min_estudiantes: 3,
  requisito_nivel: null as string | null,
  estado_inscripcion: "abierta",
  descripcion: null as string | null,
  descripcion_completa: null as string | null,
  imagen_url: null as string | null,
  imagen_promocional_url: null as string | null,
  syllabus_text: "",
  whatsapp_url: null as string | null,
  incluye_plataforma: true,
};

const niveles = ["A1", "A2", "B1", "B2", "C1", "IELTS"];

function generateSlug(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

function syllabusToText(syllabus: any): string {
  if (!syllabus) return "";
  if (Array.isArray(syllabus)) return syllabus.join("\n");
  return String(syllabus);
}

function textToSyllabus(text: string): string[] | null {
  if (!text.trim()) return null;
  return text.split("\n").map((l) => l.trim()).filter(Boolean);
}

const AdminProgramas = () => {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const { data: programas = [], isLoading } = useQuery({
    queryKey: ["admin-programas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("programas_en_vivo")
        .select("*")
        .order("fecha_inicio", { ascending: true });
      if (error) throw error;
      return data as Programa[];
    },
  });

  const upsertMutation = useMutation({
    mutationFn: async (values: any) => {
      const { syllabus_text, ...rest } = values;
      const payload = {
        ...rest,
        syllabus: textToSyllabus(syllabus_text),
        slug: generateSlug(rest.nombre),
      };
      if (payload.id) {
        const { error } = await supabase
          .from("programas_en_vivo")
          .update(payload)
          .eq("id", payload.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("programas_en_vivo")
          .insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-programas"] });
      toast.success(editingId ? "Programa actualizado" : "Programa creado");
      handleClose();
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("programas_en_vivo").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-programas"] });
      toast.success("Programa eliminado");
      setDeleteDialogOpen(false);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const handleOpen = (programa?: Programa) => {
    if (programa) {
      setEditingId(programa.id);
      setForm({
        nombre: programa.nombre,
        nivel: programa.nivel,
        fecha_inicio: programa.fecha_inicio,
        dias_clase: programa.dias_clase,
        horario: programa.horario,
        duracion_meses: programa.duracion_meses,
        precio_mensual: programa.precio_mensual,
        max_estudiantes: programa.max_estudiantes,
        min_estudiantes: programa.min_estudiantes,
        requisito_nivel: programa.requisito_nivel,
        estado_inscripcion: programa.estado_inscripcion,
        descripcion: programa.descripcion,
        descripcion_completa: programa.descripcion_completa,
        imagen_url: programa.imagen_url,
        imagen_promocional_url: programa.imagen_promocional_url,
        syllabus_text: syllabusToText(programa.syllabus),
        whatsapp_url: programa.whatsapp_url,
        incluye_plataforma: programa.incluye_plataforma,
      });
    } else {
      setEditingId(null);
      setForm({ ...emptyForm });
    }
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
    setEditingId(null);
    setForm({ ...emptyForm });
  };

  const handleSubmit = () => {
    if (!form.nombre || !form.fecha_inicio || !form.dias_clase || !form.horario) {
      toast.error("Completa los campos obligatorios");
      return;
    }
    upsertMutation.mutate(editingId ? { ...form, id: editingId } : form);
  };

  const statusColor = (status: string) =>
    status === "abierta" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700";

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Programas en Vivo</h1>
          <p className="text-sm text-gray-500 mt-1">Gestiona los programas grupales</p>
        </div>
        <Button onClick={() => handleOpen()} className="bg-indigo-600 hover:bg-indigo-700 text-white">
          <Plus className="mr-2 h-4 w-4" /> Nuevo programa
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
        </div>
      ) : programas.length === 0 ? (
        <Card className="p-12 text-center">
          <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No hay programas creados aún</p>
          <Button variant="outline" className="mt-4" onClick={() => handleOpen()}>
            Crear primer programa
          </Button>
        </Card>
      ) : (
        <div className="bg-white rounded-lg border shadow-sm overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Programa</TableHead>
                <TableHead>Nivel</TableHead>
                <TableHead>Inicio</TableHead>
                <TableHead>Horario</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {programas.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium text-gray-900">{p.nombre}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-bold">{p.nivel}</Badge>
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {format(new Date(p.fecha_inicio + "T12:00:00"), "dd MMM yyyy")}
                  </TableCell>
                  <TableCell className="text-gray-600 text-xs">
                    <div>{p.dias_clase}</div>
                    <div className="text-gray-400">{p.horario}</div>
                  </TableCell>
                  <TableCell className="font-semibold text-gray-900">S/{p.precio_mensual}/mes</TableCell>
                  <TableCell>
                    <Badge className={`${statusColor(p.estado_inscripcion)} border-0 text-xs`}>
                      {p.estado_inscripcion === "abierta" ? "Abierta" : "Cerrada"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handleOpen(p)}>
                        <Pencil className="h-4 w-4 text-gray-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => { setDeletingId(p.id); setDeleteDialogOpen(true); }}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
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
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar programa" : "Nuevo programa"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Nombre del programa *</Label>
              <Input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="B2 First (FCE)" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nivel *</Label>
                <Select value={form.nivel} onValueChange={(v) => setForm({ ...form, nivel: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {niveles.map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Fecha de inicio *</Label>
                <Input type="date" value={form.fecha_inicio} onChange={(e) => setForm({ ...form, fecha_inicio: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Días de clase *</Label>
                <Input value={form.dias_clase} onChange={(e) => setForm({ ...form, dias_clase: e.target.value })} placeholder="Mar / Jue / Sáb" />
              </div>
              <div>
                <Label>Horario *</Label>
                <Input value={form.horario} onChange={(e) => setForm({ ...form, horario: e.target.value })} placeholder="7:30pm – 9:00pm" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Duración (meses)</Label>
                <Input type="number" value={form.duracion_meses} onChange={(e) => setForm({ ...form, duracion_meses: Number(e.target.value) })} />
              </div>
              <div>
                <Label>Precio mensual (S/)</Label>
                <Input type="number" value={form.precio_mensual} onChange={(e) => setForm({ ...form, precio_mensual: Number(e.target.value) })} />
              </div>
              <div>
                <Label>Estado</Label>
                <Select value={form.estado_inscripcion} onValueChange={(v) => setForm({ ...form, estado_inscripcion: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="abierta">Abierta</SelectItem>
                    <SelectItem value="cerrada">Cerrada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Máx. estudiantes</Label>
                <Input type="number" value={form.max_estudiantes} onChange={(e) => setForm({ ...form, max_estudiantes: Number(e.target.value) })} />
              </div>
              <div>
                <Label>Mín. estudiantes</Label>
                <Input type="number" value={form.min_estudiantes} onChange={(e) => setForm({ ...form, min_estudiantes: Number(e.target.value) })} />
              </div>
            </div>
            <div>
              <Label>Requisito de nivel (opcional)</Label>
              <Input value={form.requisito_nivel || ""} onChange={(e) => setForm({ ...form, requisito_nivel: e.target.value || null })} placeholder="Ej: Completar A2" />
            </div>

            <hr className="border-gray-200" />
            <p className="text-sm font-semibold text-gray-700">Contenido y medios</p>

            <div>
              <Label>Imagen del programa (URL)</Label>
              <Input value={form.imagen_url || ""} onChange={(e) => setForm({ ...form, imagen_url: e.target.value || null })} placeholder="https://..." />
            </div>
            <div>
              <Label>Imagen promocional (URL, opcional)</Label>
              <Input value={form.imagen_promocional_url || ""} onChange={(e) => setForm({ ...form, imagen_promocional_url: e.target.value || null })} placeholder="https://..." />
            </div>
            <div>
              <Label>Descripción corta (opcional)</Label>
              <Textarea value={form.descripcion || ""} onChange={(e) => setForm({ ...form, descripcion: e.target.value || null })} rows={2} placeholder="Breve descripción del programa..." />
            </div>
            <div>
              <Label>Descripción completa (opcional)</Label>
              <Textarea value={form.descripcion_completa || ""} onChange={(e) => setForm({ ...form, descripcion_completa: e.target.value || null })} rows={4} placeholder="Descripción detallada del programa..." />
            </div>
            <div>
              <Label>Temario / Syllabus (un módulo por línea)</Label>
              <Textarea value={form.syllabus_text} onChange={(e) => setForm({ ...form, syllabus_text: e.target.value })} rows={5} placeholder={"Módulo 1 — Introducción\nMódulo 2 — Gramática básica\nMódulo 3 — Vocabulario"} />
            </div>
            <div>
              <Label>WhatsApp URL para inscripción</Label>
              <Input value={form.whatsapp_url || ""} onChange={(e) => setForm({ ...form, whatsapp_url: e.target.value || null })} placeholder="https://wa.me/51903014835?text=Hola..." />
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={form.incluye_plataforma} onCheckedChange={(v) => setForm({ ...form, incluye_plataforma: v })} />
              <Label>Incluye acceso a la plataforma</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>Cancelar</Button>
            <Button onClick={handleSubmit} disabled={upsertMutation.isPending} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              {upsertMutation.isPending ? "Guardando..." : editingId ? "Guardar cambios" : "Crear programa"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>¿Eliminar programa?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500">Esta acción no se puede deshacer.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={() => deletingId && deleteMutation.mutate(deletingId)} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminProgramas;
