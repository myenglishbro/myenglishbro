import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
import { toast } from "sonner";
import {
  Plus,
  Edit,
  Trash2,
  Users,
  BookOpen,
  School,
  UserPlus,
  X,
  ChevronRight,
  Search,
  Eye,
} from "lucide-react";
import { Link } from "react-router-dom";

type Salon = {
  id: string;
  nombre: string;
  descripcion: string | null;
  imagen_url: string | null;
  teacher_id: string | null;
  curso_id: string | null;
  activo: boolean;
  creado_por: string | null;
  fecha_creacion: string;
};

type Usuario = {
  id: string;
  nombre: string | null;
  email: string;
};

type Curso = {
  id: string;
  titulo: string;
  nivel: string;
};

const AdminSalones = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [isSalonDialogOpen, setIsSalonDialogOpen] = useState(false);
  const [editingSalon, setEditingSalon] = useState<Salon | null>(null);
  const [salonForm, setSalonForm] = useState({
    nombre: "",
    descripcion: "",
    imagen_url: "",
    teacher_id: "",
    curso_id: "",
    activo: true,
  });

  const [isEstudiantesDialogOpen, setIsEstudiantesDialogOpen] = useState(false);
  const [selectedSalon, setSelectedSalon] = useState<Salon | null>(null);
  const [estudianteSearch, setEstudianteSearch] = useState("");

  // Fetch salones
  const { data: salones = [], isLoading } = useQuery({
    queryKey: ["admin-salones"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("salones")
        .select("*")
        .order("fecha_creacion", { ascending: false });
      if (error) throw error;
      return data as Salon[];
    },
  });

  // Fetch all teachers
  const { data: teachers = [] } = useQuery({
    queryKey: ["admin-teachers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("user_id, usuarios(id, nombre, email)")
        .eq("role", "teacher");
      if (error) throw error;
      return (data ?? []).map((r) => r.usuarios as unknown as Usuario).filter(Boolean);
    },
  });

  // Fetch all users (for student assignment)
  const { data: allUsers = [] } = useQuery({
    queryKey: ["admin-all-users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("usuarios")
        .select("id, nombre, email")
        .order("nombre", { ascending: true });
      if (error) throw error;
      return data as Usuario[];
    },
  });

  // Fetch all courses
  const { data: cursos = [] } = useQuery({
    queryKey: ["admin-cursos-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cursos")
        .select("id, titulo, nivel")
        .eq("activo", true)
        .order("titulo", { ascending: true });
      if (error) throw error;
      return data as Curso[];
    },
  });

  // Fetch students in selected salon
  const { data: salonEstudiantes = [] } = useQuery({
    queryKey: ["salon-estudiantes-admin", selectedSalon?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("salon_estudiantes")
        .select("id, usuario_id, usuarios(id, nombre, email)")
        .eq("salon_id", selectedSalon!.id);
      if (error) throw error;
      return data;
    },
    enabled: !!selectedSalon?.id,
  });

  const salonEstudiantesIds = new Set(salonEstudiantes.map((e) => e.usuario_id));

  const filteredUsers = allUsers.filter((u) => {
    const term = estudianteSearch.toLowerCase();
    return (
      !term ||
      u.email.toLowerCase().includes(term) ||
      (u.nombre || "").toLowerCase().includes(term)
    );
  });

  // Mutations
  const createSalonMutation = useMutation({
    mutationFn: async (form: typeof salonForm) => {
      const { error } = await supabase.from("salones").insert({
        nombre: form.nombre,
        descripcion: form.descripcion || null,
        imagen_url: form.imagen_url || null,
        teacher_id: form.teacher_id || null,
        curso_id: form.curso_id || null,
        activo: form.activo,
        creado_por: user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-salones"] });
      closeSalonDialog();
      toast.success("Salón creado exitosamente");
    },
    onError: () => toast.error("Error al crear el salón"),
  });

  const updateSalonMutation = useMutation({
    mutationFn: async ({ id, form }: { id: string; form: typeof salonForm }) => {
      const { error } = await supabase.from("salones").update({
        nombre: form.nombre,
        descripcion: form.descripcion || null,
        imagen_url: form.imagen_url || null,
        teacher_id: form.teacher_id || null,
        curso_id: form.curso_id || null,
        activo: form.activo,
      }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-salones"] });
      closeSalonDialog();
      toast.success("Salón actualizado");
    },
    onError: () => toast.error("Error al actualizar el salón"),
  });

  const deleteSalonMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("salones").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-salones"] });
      toast.success("Salón eliminado");
    },
    onError: () => toast.error("Error al eliminar el salón"),
  });

  const assignEstudianteMutation = useMutation({
    mutationFn: async (usuarioId: string) => {
      const { error } = await supabase.from("salon_estudiantes").insert({
        salon_id: selectedSalon!.id,
        usuario_id: usuarioId,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["salon-estudiantes-admin", selectedSalon?.id] });
      toast.success("Estudiante asignado");
    },
    onError: () => toast.error("El estudiante ya está en este salón"),
  });

  const removeEstudianteMutation = useMutation({
    mutationFn: async (entryId: string) => {
      const { error } = await supabase.from("salon_estudiantes").delete().eq("id", entryId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["salon-estudiantes-admin", selectedSalon?.id] });
      toast.success("Estudiante removido");
    },
  });

  const openCreateSalon = () => {
    setEditingSalon(null);
    setSalonForm({ nombre: "", descripcion: "", imagen_url: "", teacher_id: "", curso_id: "", activo: true });
    setIsSalonDialogOpen(true);
  };

  const openEditSalon = (salon: Salon) => {
    setEditingSalon(salon);
    setSalonForm({
      nombre: salon.nombre,
      descripcion: salon.descripcion || "",
      imagen_url: salon.imagen_url || "",
      teacher_id: salon.teacher_id || "",
      curso_id: salon.curso_id || "",
      activo: salon.activo,
    });
    setIsSalonDialogOpen(true);
  };

  const closeSalonDialog = () => {
    setIsSalonDialogOpen(false);
    setEditingSalon(null);
  };

  const handleSalonSubmit = () => {
    if (!salonForm.nombre.trim()) return;
    if (editingSalon) {
      updateSalonMutation.mutate({ id: editingSalon.id, form: salonForm });
    } else {
      createSalonMutation.mutate(salonForm);
    }
  };

  const openEstudiantesDialog = (salon: Salon) => {
    setSelectedSalon(salon);
    setEstudianteSearch("");
    setIsEstudiantesDialogOpen(true);
  };

  const getTeacherName = (teacherId: string | null) => {
    if (!teacherId) return null;
    const t = teachers.find((t) => t.id === teacherId);
    return t ? t.nombre || t.email : teacherId;
  };

  const getCursoTitulo = (cursoId: string | null) => {
    if (!cursoId) return null;
    return cursos.find((c) => c.id === cursoId)?.titulo ?? null;
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gestión de Salones</h1>
          <p className="text-muted-foreground mt-1">Crea y administra salones con docentes y estudiantes</p>
        </div>
        <Button onClick={openCreateSalon}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Salón
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3" />
          <p className="text-muted-foreground">Cargando salones...</p>
        </div>
      ) : salones.length === 0 ? (
        <div className="text-center py-20">
          <School className="h-14 w-14 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-lg mb-1">No hay salones creados</h3>
          <p className="text-muted-foreground mb-4">Crea el primer salón para comenzar.</p>
          <Button onClick={openCreateSalon}>
            <Plus className="mr-2 h-4 w-4" />
            Crear Salón
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {salones.map((salon) => (
            <Card key={salon.id} className="flex flex-col overflow-hidden">
              {/* Imagen de portada */}
              <div className="relative h-36 bg-gradient-to-br from-primary/10 to-indigo-100 flex items-center justify-center shrink-0">
                {salon.imagen_url ? (
                  <img
                    src={salon.imagen_url}
                    alt={salon.nombre}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <School className="h-12 w-12 text-primary/30" />
                )}
                <Badge
                  variant={salon.activo ? "default" : "secondary"}
                  className="absolute top-2 right-2 shrink-0"
                >
                  {salon.activo ? "Activo" : "Inactivo"}
                </Badge>
              </div>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base leading-tight">{salon.nombre}</CardTitle>
                </div>
                {salon.descripcion && (
                  <p className="text-sm text-muted-foreground">{salon.descripcion}</p>
                )}
              </CardHeader>
              <CardContent className="flex-1 space-y-2 pt-0">
                {getTeacherName(salon.teacher_id) && (
                  <p className="text-sm flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Docente:</span>
                    <span className="font-medium">{getTeacherName(salon.teacher_id)}</span>
                  </p>
                )}
                {getCursoTitulo(salon.curso_id) && (
                  <p className="text-sm flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Curso base:</span>
                    <span className="font-medium truncate">{getCursoTitulo(salon.curso_id)}</span>
                  </p>
                )}
                <div className="flex gap-2 pt-2 flex-wrap">
                  <Link to={`/salon/${salon.id}?preview=true`}>
                    <Button size="sm" variant="outline">
                      <Eye className="mr-1.5 h-3.5 w-3.5" />
                      Vista estudiante
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEstudiantesDialog(salon)}
                  >
                    <UserPlus className="mr-1.5 h-3.5 w-3.5" />
                    Estudiantes
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => openEditSalon(salon)}>
                    <Edit className="mr-1.5 h-3.5 w-3.5" />
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    onClick={() => {
                      if (confirm(`¿Eliminar el salón "${salon.nombre}"?`)) {
                        deleteSalonMutation.mutate(salon.id);
                      }
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Salon Dialog */}
      <Dialog open={isSalonDialogOpen} onOpenChange={(open) => !open && closeSalonDialog()}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingSalon ? "Editar Salón" : "Nuevo Salón"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nombre del salón *</Label>
              <Input
                value={salonForm.nombre}
                onChange={(e) => setSalonForm((p) => ({ ...p, nombre: e.target.value }))}
                placeholder="Ej: Inglés Avanzado - Grupo A"
              />
            </div>

            <div>
              <Label>Descripción</Label>
              <Textarea
                value={salonForm.descripcion}
                onChange={(e) => setSalonForm((p) => ({ ...p, descripcion: e.target.value }))}
                placeholder="Descripción del salón (opcional)"
                rows={2}
              />
            </div>

            <div>
              <Label>URL de imagen de portada</Label>
              {salonForm.imagen_url && (
                <div className="mb-2 rounded-lg overflow-hidden h-28 bg-muted">
                  <img
                    src={salonForm.imagen_url}
                    alt="Vista previa"
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                </div>
              )}
              <Input
                value={salonForm.imagen_url}
                onChange={(e) => setSalonForm((p) => ({ ...p, imagen_url: e.target.value }))}
                placeholder="https://... (URL de imagen)"
              />
              <p className="text-xs text-muted-foreground mt-1">Pega la URL de una imagen (JPG, PNG, WebP)</p>
            </div>

            <div>
              <Label>Docente asignado</Label>
              <Select
                value={salonForm.teacher_id || "none"}
                onValueChange={(v) => setSalonForm((p) => ({ ...p, teacher_id: v === "none" ? "" : v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar docente..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin docente</SelectItem>
                  {teachers.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.nombre || t.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {teachers.length === 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  No hay usuarios con rol docente. Asigna el rol "teacher" a un usuario primero.
                </p>
              )}
            </div>

            <div>
              <Label>Curso base (opcional)</Label>
              <Select
                value={salonForm.curso_id || "none"}
                onValueChange={(v) => setSalonForm((p) => ({ ...p, curso_id: v === "none" ? "" : v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar curso base..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin curso base</SelectItem>
                  {cursos.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.titulo} ({c.nivel})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label>Salón activo</Label>
              <Switch
                checked={salonForm.activo}
                onCheckedChange={(v) => setSalonForm((p) => ({ ...p, activo: v }))}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={closeSalonDialog}>Cancelar</Button>
              <Button
                onClick={handleSalonSubmit}
                disabled={!salonForm.nombre.trim() || createSalonMutation.isPending || updateSalonMutation.isPending}
              >
                {editingSalon ? "Guardar cambios" : "Crear salón"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Students Management Dialog */}
      <Dialog open={isEstudiantesDialogOpen} onOpenChange={setIsEstudiantesDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Estudiantes — {selectedSalon?.nombre}</DialogTitle>
          </DialogHeader>

          {/* Current students */}
          <div className="mb-4">
            <p className="text-sm font-medium mb-2">
              Estudiantes asignados ({salonEstudiantes.length})
            </p>
            {salonEstudiantes.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay estudiantes asignados aún.</p>
            ) : (
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {salonEstudiantes.map((est) => {
                  const u = est.usuarios as unknown as Usuario;
                  return (
                    <div key={est.id} className="flex items-center gap-2 p-2 bg-muted/50 rounded text-sm">
                      <div className="flex-1">
                        <span className="font-medium">{u?.nombre || "Sin nombre"}</span>
                        <span className="text-muted-foreground ml-2">{u?.email}</span>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 text-destructive hover:text-destructive"
                        onClick={() => removeEstudianteMutation.mutate(est.id)}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="border-t pt-4 flex-1 flex flex-col min-h-0">
            <p className="text-sm font-medium mb-2">Agregar estudiante</p>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Buscar por nombre o email..."
                value={estudianteSearch}
                onChange={(e) => setEstudianteSearch(e.target.value)}
              />
            </div>
            <div className="flex-1 overflow-y-auto space-y-1 max-h-64">
              {filteredUsers.map((u) => {
                const yaAsignado = salonEstudiantesIds.has(u.id);
                return (
                  <div
                    key={u.id}
                    className="flex items-center gap-2 p-2 rounded hover:bg-muted/50 text-sm"
                  >
                    <div className="flex-1">
                      <span className="font-medium">{u.nombre || "Sin nombre"}</span>
                      <span className="text-muted-foreground ml-2">{u.email}</span>
                    </div>
                    {yaAsignado ? (
                      <Badge variant="secondary" className="text-xs">En salón</Badge>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7"
                        onClick={() => assignEstudianteMutation.mutate(u.id)}
                      >
                        <UserPlus className="h-3.5 w-3.5 mr-1" />
                        Asignar
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button onClick={() => setIsEstudiantesDialogOpen(false)}>Cerrar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminSalones;
