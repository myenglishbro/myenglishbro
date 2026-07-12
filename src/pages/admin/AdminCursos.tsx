import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Edit, BookOpen, ImageIcon, Eye } from "lucide-react";
import { Link } from "react-router-dom";

type Curso = {
  id: string;
  nivel: string;
  titulo: string;
  slug: string;
  descripcion: string | null;
  precio_unico_soles: number | null;
  precio_usd: number | null;
  imagen_url: string | null;
  activo: boolean;
  duracion_total: string | null;
  learning_outcomes: string[] | null;
  instructor: string | null;
  rating: number | null;
  estudiantes_count: number | null;
};

const AdminCursos = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCurso, setEditingCurso] = useState<Curso | null>(null);
  const [formData, setFormData] = useState({
    nivel: "",
    titulo: "",
    slug: "",
    descripcion: "",
    precio_unico_soles: "",
    precio_usd: "",
    imagen_url: "",
    activo: true,
    duracion_total: "",
    learning_outcomes: "",
    instructor: "",
    rating: "",
    estudiantes_count: "",
  });

  const queryClient = useQueryClient();

  const { data: cursos, isLoading } = useQuery({
    queryKey: ["admin-cursos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cursos")
        .select("*")
        .order("nivel", { ascending: true });
      if (error) throw error;
      return data as unknown as Curso[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const outcomes = data.learning_outcomes
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);
      const insertData = {
        nivel: data.nivel,
        titulo: data.titulo,
        slug: data.slug,
        descripcion: data.descripcion || null,
        precio_unico_soles: data.precio_unico_soles ? Number(data.precio_unico_soles) : null,
        precio_usd: data.precio_usd ? Number(data.precio_usd) : null,
        imagen_url: data.imagen_url || null,
        activo: data.activo,
        duracion_total: data.duracion_total || null,
        learning_outcomes: outcomes.length > 0 ? outcomes : null,
        instructor: data.instructor || null,
        rating: data.rating ? Number(data.rating) : null,
        estudiantes_count: data.estudiantes_count ? Number(data.estudiantes_count) : null,
      };
      const { error } = await supabase.from("cursos").insert([insertData]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-cursos"] });
      toast.success("Curso creado exitosamente");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => toast.error("Error al crear el curso: " + error.message),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const outcomes = data.learning_outcomes
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);
      const updateData = {
        nivel: data.nivel,
        titulo: data.titulo,
        slug: data.slug,
        descripcion: data.descripcion || null,
        precio_unico_soles: data.precio_unico_soles ? Number(data.precio_unico_soles) : null,
        precio_usd: data.precio_usd ? Number(data.precio_usd) : null,
        imagen_url: data.imagen_url || null,
        activo: data.activo,
        duracion_total: data.duracion_total || null,
        learning_outcomes: outcomes.length > 0 ? outcomes : null,
        instructor: data.instructor || null,
        rating: data.rating ? Number(data.rating) : null,
        estudiantes_count: data.estudiantes_count ? Number(data.estudiantes_count) : null,
      };
      const { error } = await supabase.from("cursos").update(updateData).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-cursos"] });
      toast.success("Curso actualizado exitosamente");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => toast.error("Error al actualizar el curso: " + error.message),
  });

  const toggleActivoMutation = useMutation({
    mutationFn: async ({ id, activo }: { id: string; activo: boolean }) => {
      const { error } = await supabase.from("cursos").update({ activo }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-cursos"] });
      toast.success("Estado actualizado");
    },
    onError: (error) => toast.error("Error al actualizar: " + error.message),
  });

  const resetForm = () => {
    setFormData({
      nivel: "", titulo: "", slug: "", descripcion: "",
      precio_unico_soles: "", precio_usd: "", imagen_url: "",
      activo: true, duracion_total: "", learning_outcomes: "",
      instructor: "", rating: "", estudiantes_count: "",
    });
    setEditingCurso(null);
  };

  const handleEdit = (curso: Curso) => {
    setEditingCurso(curso);
    setFormData({
      nivel: curso.nivel,
      titulo: curso.titulo,
      slug: curso.slug,
      descripcion: curso.descripcion || "",
      precio_unico_soles: curso.precio_unico_soles?.toString() || "",
      precio_usd: curso.precio_usd?.toString() || "",
      imagen_url: curso.imagen_url || "",
      activo: curso.activo,
      duracion_total: curso.duracion_total || "",
      learning_outcomes: (curso.learning_outcomes || []).join("\n"),
      instructor: curso.instructor || "",
      rating: curso.rating?.toString() || "",
      estudiantes_count: curso.estudiantes_count?.toString() || "",
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCurso) {
      updateMutation.mutate({ id: editingCurso.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Gestión de Cursos</h1>
          <p className="text-gray-600 text-sm">Administrar cursos disponibles en la plataforma</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Crear Curso
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white border-gray-200 text-gray-900 max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-gray-900 text-xl font-semibold">
                {editingCurso ? "Editar Curso" : "Crear Nuevo Curso"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nivel" className="text-gray-700 font-medium">Nivel</Label>
                  <Input id="nivel" value={formData.nivel} onChange={(e) => setFormData({ ...formData, nivel: e.target.value })} placeholder="A1, A2, B1, B2, C1, C2" required className="bg-white border-gray-300 text-gray-900" />
                </div>
                <div>
                  <Label htmlFor="slug" className="text-gray-700 font-medium">Slug</Label>
                  <Input id="slug" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} placeholder="b2-curso" required className="bg-white border-gray-300 text-gray-900" />
                  <p className="text-xs text-gray-500 mt-1">Identificador URL (ej: b2-intermedio)</p>
                </div>
              </div>
              <div>
                <Label htmlFor="titulo" className="text-gray-700 font-medium">Título</Label>
                <Input id="titulo" value={formData.titulo} onChange={(e) => setFormData({ ...formData, titulo: e.target.value })} placeholder="Curso de Inglés B2" required className="bg-white border-gray-300 text-gray-900" />
              </div>
              <div>
                <Label htmlFor="descripcion" className="text-gray-700 font-medium">Descripción</Label>
                <Textarea id="descripcion" value={formData.descripcion} onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })} placeholder="Descripción del curso..." rows={3} className="bg-white border-gray-300 text-gray-900" />
              </div>

              {/* Image */}
              <div>
                <Label htmlFor="imagen_url" className="text-gray-700 font-medium flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" /> URL de Imagen (opcional)
                </Label>
                <Input id="imagen_url" value={formData.imagen_url} onChange={(e) => setFormData({ ...formData, imagen_url: e.target.value })} placeholder="https://ejemplo.com/imagen.jpg" className="bg-white border-gray-300 text-gray-900" />
                {formData.imagen_url && (
                  <div className="mt-2 p-2 border border-gray-200 rounded-lg">
                    <img src={formData.imagen_url} alt="Preview" className="h-20 w-auto object-cover rounded" onError={(e) => (e.currentTarget.style.display = "none")} />
                  </div>
                )}
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="precio_unico_soles" className="text-gray-700 font-medium">Precio Único / Lifetime (S/)</Label>
                  <Input id="precio_unico_soles" type="number" value={formData.precio_unico_soles} onChange={(e) => setFormData({ ...formData, precio_unico_soles: e.target.value })} placeholder="200" className="bg-white border-gray-300 text-gray-900" />
                </div>
                <div>
                  <Label htmlFor="precio_usd" className="text-gray-700 font-medium">Precio USD (PayPal)</Label>
                  <Input id="precio_usd" type="number" value={formData.precio_usd} onChange={(e) => setFormData({ ...formData, precio_usd: e.target.value })} placeholder="60" className="bg-white border-gray-300 text-gray-900" />
                </div>
              </div>

              {/* NEW FIELDS */}
              <div className="border-t border-gray-200 pt-4 space-y-4">
                <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Metadatos del curso</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="instructor" className="text-gray-700 font-medium">Instructor</Label>
                    <Input id="instructor" value={formData.instructor} onChange={(e) => setFormData({ ...formData, instructor: e.target.value })} placeholder="Nombre del instructor" className="bg-white border-gray-300 text-gray-900" />
                  </div>
                  <div>
                    <Label htmlFor="duracion_total" className="text-gray-700 font-medium">Duración total</Label>
                    <Input id="duracion_total" value={formData.duracion_total} onChange={(e) => setFormData({ ...formData, duracion_total: e.target.value })} placeholder="12 horas" className="bg-white border-gray-300 text-gray-900" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="rating" className="text-gray-700 font-medium">Rating (0-5)</Label>
                    <Input id="rating" type="number" step="0.1" min="0" max="5" value={formData.rating} onChange={(e) => setFormData({ ...formData, rating: e.target.value })} placeholder="4.8" className="bg-white border-gray-300 text-gray-900" />
                  </div>
                  <div>
                    <Label htmlFor="estudiantes_count" className="text-gray-700 font-medium">Estudiantes inscritos</Label>
                    <Input id="estudiantes_count" type="number" value={formData.estudiantes_count} onChange={(e) => setFormData({ ...formData, estudiantes_count: e.target.value })} placeholder="150" className="bg-white border-gray-300 text-gray-900" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="learning_outcomes" className="text-gray-700 font-medium">Learning outcomes (uno por línea)</Label>
                  <Textarea id="learning_outcomes" value={formData.learning_outcomes} onChange={(e) => setFormData({ ...formData, learning_outcomes: e.target.value })} placeholder={"Dominar gramática avanzada\nMejorar pronunciación\nComprender conversaciones reales"} rows={4} className="bg-white border-gray-300 text-gray-900" />
                  <p className="text-xs text-gray-500 mt-1">Escribe cada objetivo de aprendizaje en una línea separada</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Switch id="activo" checked={formData.activo} onCheckedChange={(checked) => setFormData({ ...formData, activo: checked })} />
                <Label htmlFor="activo" className="text-gray-700">Curso activo (visible en el catálogo)</Label>
              </div>
              <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="border-gray-300 text-gray-700 hover:bg-gray-100">Cancelar</Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  {editingCurso ? "Actualizar" : "Crear"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {cursos?.map((curso) => (
          <Card key={curso.id} className="bg-white border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-4 flex-1">
                {curso.imagen_url ? (
                  <img src={curso.imagen_url} alt={curso.titulo} className="h-16 w-24 object-cover rounded-lg border border-gray-200" />
                ) : (
                  <div className="h-16 w-24 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-lg flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-indigo-500" />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="bg-indigo-600 text-white px-3 py-1 rounded-md font-bold text-sm">{curso.nivel}</span>
                    <h3 className="text-lg font-semibold text-gray-900">{curso.titulo}</h3>
                    {curso.activo ? (
                      <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-medium">Activo</span>
                    ) : (
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">Inactivo</span>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm mb-2 line-clamp-2">{curso.descripcion}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="font-mono bg-gray-100 px-2 py-1 rounded">/{curso.slug}</span>
                    {curso.precio_unico_soles && <span className="text-emerald-600 font-medium">♾️ S/{curso.precio_unico_soles}</span>}
                    {curso.precio_usd && <span className="text-[#0070ba] font-medium">💳 ${curso.precio_usd}</span>}
                    {!curso.precio_unico_soles && !curso.precio_usd && <span className="text-amber-600 font-medium">⚠️ Sin precio</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link to={`/admin/cursos/${curso.id}/lecciones`}>
                  <Button variant="outline" size="sm" className="border-gray-300 text-gray-700 hover:bg-gray-100">
                    <BookOpen className="h-4 w-4 mr-2" /> Lecciones
                  </Button>
                </Link>
                <Link to={`/courses/${curso.id}?preview=true`}>
                  <Button variant="outline" size="sm" className="border-gray-300 text-gray-700 hover:bg-gray-100" title="Vista de estudiante">
                    <Eye className="h-4 w-4" />
                  </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={() => handleEdit(curso)} className="border-gray-300 text-gray-700 hover:bg-gray-100">
                  <Edit className="h-4 w-4" />
                </Button>
                <Switch checked={curso.activo} onCheckedChange={(checked) => toggleActivoMutation.mutate({ id: curso.id, activo: checked })} />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminCursos;
