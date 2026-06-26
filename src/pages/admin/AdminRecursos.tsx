import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Edit, ChevronLeft, Trash2 } from "lucide-react";

type Recurso = {
  id: string;
  curso_id: string | null;
  titulo: string;
  descripcion: string | null;
  categoria: string;
  tipo: string;
  archivo_url: string;
};

const CATEGORIAS = ["grammar", "speaking", "writing", "vocabulary", "exams"];

const AdminRecursos = () => {
  const { cursoId } = useParams();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRecurso, setEditingRecurso] = useState<Recurso | null>(null);
  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    categoria: "grammar",
    tipo: "pdf",
    archivo_url: "",
  });

  const queryClient = useQueryClient();

  const { data: curso } = useQuery({
    queryKey: ["curso", cursoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cursos")
        .select("*")
        .eq("id", cursoId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!cursoId,
  });

  const { data: recursos, isLoading } = useQuery({
    queryKey: ["admin-recursos", cursoId],
    queryFn: async () => {
      let query = supabase.from("recursos").select("*");
      
      if (cursoId) {
        query = query.eq("curso_id", cursoId);
      }
      
      const { data, error } = await query.order("fecha_creacion", { ascending: false });
      
      if (error) throw error;
      return data as Recurso[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from("recursos").insert([{
        ...data,
        curso_id: cursoId || null,
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-recursos", cursoId] });
      toast.success("Recurso creado exitosamente");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Error al crear el recurso: " + error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<typeof formData> }) => {
      const { error } = await supabase.from("recursos").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-recursos", cursoId] });
      toast.success("Recurso actualizado exitosamente");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Error al actualizar el recurso: " + error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("recursos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-recursos", cursoId] });
      toast.success("Recurso eliminado");
    },
    onError: (error) => {
      toast.error("Error al eliminar: " + error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      titulo: "",
      descripcion: "",
      categoria: "grammar",
      tipo: "pdf",
      archivo_url: "",
    });
    setEditingRecurso(null);
  };

  const handleEdit = (recurso: Recurso) => {
    setEditingRecurso(recurso);
    setFormData({
      titulo: recurso.titulo,
      descripcion: recurso.descripcion || "",
      categoria: recurso.categoria,
      tipo: recurso.tipo,
      archivo_url: recurso.archivo_url,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRecurso) {
      updateMutation.mutate({ id: editingRecurso.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  if (isLoading) {
    return <div className="p-8"><div className="animate-pulse h-32 bg-white/10 rounded"></div></div>;
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <Link to="/admin/cursos">
          <Button variant="ghost" size="sm" className="hover:bg-white/5 text-dashboard-text mb-4">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Volver a cursos
          </Button>
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold font-mono text-dashboard-text mb-2">
              Recursos {curso ? `- ${curso.titulo}` : "- Todos"}
            </h1>
            <p className="text-dashboard-muted text-sm">Gestionar recursos complementarios</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="bg-dashboard-accent-red hover:bg-dashboard-accent-red/90 font-mono">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Recurso
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-dashboard-card border-white/10 text-dashboard-text max-w-2xl">
              <DialogHeader>
                <DialogTitle className="font-mono">
                  {editingRecurso ? "Editar Recurso" : "Crear Nuevo Recurso"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="titulo" className="text-dashboard-text">Título</Label>
                  <Input
                    id="titulo"
                    value={formData.titulo}
                    onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                    placeholder="Guía de gramática avanzada"
                    required
                    className="bg-dashboard-input border-white/10 text-dashboard-text placeholder:text-dashboard-muted"
                  />
                </div>
                <div>
                  <Label htmlFor="descripcion" className="text-dashboard-text">Descripción</Label>
                  <Textarea
                    id="descripcion"
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    placeholder="Descripción del recurso..."
                    rows={3}
                    className="bg-dashboard-input border-white/10 text-dashboard-text placeholder:text-dashboard-muted"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="categoria" className="text-dashboard-text">Categoría</Label>
                    <Select value={formData.categoria} onValueChange={(val) => setFormData({ ...formData, categoria: val })}>
                      <SelectTrigger className="bg-dashboard-input border-white/10 text-dashboard-text">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-dashboard-card border-white/10">
                        {CATEGORIAS.map((cat) => (
                          <SelectItem key={cat} value={cat} className="text-dashboard-text">{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="tipo" className="text-dashboard-text">Tipo</Label>
                    <Select value={formData.tipo} onValueChange={(val) => setFormData({ ...formData, tipo: val })}>
                      <SelectTrigger className="bg-dashboard-input border-white/10 text-dashboard-text">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-dashboard-card border-white/10">
                        <SelectItem value="pdf" className="text-dashboard-text">PDF</SelectItem>
                        <SelectItem value="video" className="text-dashboard-text">Video</SelectItem>
                        <SelectItem value="audio" className="text-dashboard-text">Audio</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="archivo_url" className="text-dashboard-text">Google Drive URL</Label>
                  <Input
                    id="archivo_url"
                    value={formData.archivo_url}
                    onChange={(e) => setFormData({ ...formData, archivo_url: e.target.value })}
                    placeholder="https://drive.google.com/file/d/..."
                    required
                    className="bg-dashboard-input border-white/10 text-dashboard-text placeholder:text-dashboard-muted"
                  />
                  <p className="text-xs text-dashboard-muted mt-1">URL del archivo en Google Drive</p>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="bg-dashboard-accent-red hover:bg-dashboard-accent-red/90">
                    {editingRecurso ? "Actualizar" : "Crear"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4">
        {recursos?.map((recurso) => (
          <Card key={recurso.id} className="dashboard-card p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="bg-dashboard-accent-teal/20 text-dashboard-accent-teal px-3 py-1 rounded-md font-bold font-mono text-sm">
                    {recurso.categoria}
                  </span>
                  <span className="bg-dashboard-chip text-dashboard-muted px-2 py-1 rounded-md text-xs font-mono">
                    {recurso.tipo}
                  </span>
                  <h3 className="text-lg font-bold font-mono text-dashboard-text">{recurso.titulo}</h3>
                </div>
                <p className="text-dashboard-muted text-sm mb-2">{recurso.descripcion}</p>
                <p className="text-xs text-dashboard-muted font-mono truncate">{recurso.archivo_url}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(recurso)}
                  className="border-white/10 hover:bg-white/5"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteMutation.mutate(recurso.id)}
                  className="border-red-500/20 hover:bg-red-500/10 text-red-400"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminRecursos;
