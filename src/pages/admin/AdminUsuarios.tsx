import { useState, useMemo } from "react";
import { adminCreateUserSchema, adminResetPasswordSchema } from "@/lib/validations";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Search, 
  Download, 
  Users, 
  Loader2, 
  Trash2, 
  Key, 
  UserPlus, 
  Eye,
  Copy,
  Calendar,
  BookOpen
} from "lucide-react";
import { toast } from "sonner";
import { format, addMonths, addDays } from "date-fns";
import { es } from "date-fns/locale";
import { useIsMobile } from "@/hooks/use-mobile";

import {
  Usuario,
  Matricula,
  Curso,
  EnrollmentWithCourse,
  computeEnrollmentStatus,
} from "./types/adminUsuarios.types";
import { UserDetailDrawer } from "./components/UserDetailDrawer";
import { EditDatesDialog } from "./components/EditDatesDialog";
import { AddCourseDialog } from "./components/AddCourseDialog";
import { RemoveEnrollmentDialog } from "./components/RemoveEnrollmentDialog";

const AdminUsuarios = () => {
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  
  // Search and selection state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Modal states
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<Usuario | null>(null);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [userForPassword, setUserForPassword] = useState<Usuario | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [createUserModalOpen, setCreateUserModalOpen] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserNombre, setNewUserNombre] = useState("");
  
  // Drawer-related dialogs
  const [addCourseDialogOpen, setAddCourseDialogOpen] = useState(false);
  const [editDatesDialogOpen, setEditDatesDialogOpen] = useState(false);
  const [enrollmentToEdit, setEnrollmentToEdit] = useState<EnrollmentWithCourse | null>(null);
  const [removeEnrollmentDialogOpen, setRemoveEnrollmentDialogOpen] = useState(false);
  const [enrollmentToRemove, setEnrollmentToRemove] = useState<EnrollmentWithCourse | null>(null);

  // Fetch usuarios
  const { data: usuarios = [], isLoading: loadingUsuarios } = useQuery({
    queryKey: ["admin-usuarios"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("usuarios")
        .select("*")
        .order("fecha_creacion", { ascending: false });
      if (error) throw error;
      return data as Usuario[];
    },
  });

  // Fetch cursos
  const { data: cursos = [], isLoading: loadingCursos } = useQuery({
    queryKey: ["admin-cursos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cursos")
        .select("id, nivel, titulo")
        .eq("activo", true)
        .order("nivel");
      if (error) throw error;
      return data as Curso[];
    },
  });

  // Fetch todas las matriculas
  const { data: matriculas = [], isLoading: loadingMatriculas } = useQuery({
    queryKey: ["admin-matriculas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("matriculas")
        .select("*");
      if (error) throw error;
      return data as Matricula[];
    },
  });

  // Mutation: crear matricula
  const createMatricula = useMutation({
    mutationFn: async ({
      usuarioId,
      cursoId,
      metodoPago,
      tipoPago,
      diasPrueba: trialDays,
    }: {
      usuarioId: string;
      cursoId: string;
      metodoPago: string;
      tipoPago: string;
      diasPrueba?: number;
    }) => {
      let fechaFin: string | null = null;
      if (tipoPago === "mensual") {
        fechaFin = addMonths(new Date(), 1).toISOString();
      } else if (tipoPago === "prueba" && trialDays) {
        fechaFin = addDays(new Date(), trialDays).toISOString();
      }
      
      const { data, error } = await supabase.from("matriculas").insert({
        usuario_id: usuarioId,
        curso_id: cursoId,
        estado: "activa",
        metodo_pago: metodoPago,
        tipo_pago: tipoPago,
        fecha_fin: fechaFin,
      }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-matriculas"] });
      toast.success("Curso agregado correctamente");
      setAddCourseDialogOpen(false);
    },
    onError: (error) => {
      console.error("Error creating matricula:", error);
      toast.error("Error al agregar el curso");
    },
  });

  // Mutation: +30 días
  const add30Days = useMutation({
    mutationFn: async ({ matriculaId, currentFechaFin }: { matriculaId: string; currentFechaFin: string | null }) => {
      const baseDate = currentFechaFin && new Date(currentFechaFin) > new Date() 
        ? new Date(currentFechaFin) 
        : new Date();
      const newFechaFin = addDays(baseDate, 30).toISOString();

      const { data, error } = await supabase
        .from("matriculas")
        .update({
          estado: "activa",
          fecha_fin: newFechaFin,
          fecha_inicio: currentFechaFin === null ? new Date().toISOString() : undefined,
        })
        .eq("id", matriculaId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-matriculas"] });
      toast.success("+30 días agregados");
    },
    onError: (error) => {
      console.error("Error adding days:", error);
      toast.error("Error al agregar días");
    },
  });

  // Mutation: editar fechas
  const updateDates = useMutation({
    mutationFn: async ({ matriculaId, fechaInicio, fechaFin }: { matriculaId: string; fechaInicio: string; fechaFin: string | null }) => {
      const { data, error } = await supabase
        .from("matriculas")
        .update({
          fecha_inicio: fechaInicio,
          fecha_fin: fechaFin,
          estado: "activa",
        })
        .eq("id", matriculaId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-matriculas"] });
      toast.success("Fechas actualizadas");
      setEditDatesDialogOpen(false);
      setEnrollmentToEdit(null);
    },
    onError: (error) => {
      console.error("Error updating dates:", error);
      toast.error("Error al actualizar fechas");
    },
  });

  // Mutation: pausar/activar
  const togglePause = useMutation({
    mutationFn: async ({ matriculaId, currentStatus }: { matriculaId: string; currentStatus: string }) => {
      const newStatus = currentStatus === "pausada" ? "activa" : "pausada";
      const { data, error } = await supabase
        .from("matriculas")
        .update({ estado: newStatus })
        .eq("id", matriculaId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-matriculas"] });
      toast.success(data.estado === "activa" ? "Curso activado" : "Curso pausado");
    },
    onError: (error) => {
      console.error("Error toggling pause:", error);
      toast.error("Error al cambiar estado");
    },
  });

  // Mutation: eliminar enrollment
  const deleteEnrollment = useMutation({
    mutationFn: async (matriculaId: string) => {
      const { error } = await supabase
        .from("matriculas")
        .delete()
        .eq("id", matriculaId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-matriculas"] });
      toast.success("Curso eliminado del usuario");
      setRemoveEnrollmentDialogOpen(false);
      setEnrollmentToRemove(null);
    },
    onError: (error) => {
      console.error("Error deleting enrollment:", error);
      toast.error("Error al eliminar el curso");
    },
  });

  // Mutation: eliminar usuario
  const deleteUser = useMutation({
    mutationFn: async (usuarioId: string) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No session");

      const response = await fetch(
        `https://zjobnxbzdtqsgbfdxzqo.supabase.co/functions/v1/admin-delete-user`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ userId: usuarioId }),
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Error deleting user");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-usuarios"] });
      queryClient.invalidateQueries({ queryKey: ["admin-matriculas"] });
      toast.success("Usuario eliminado correctamente");
      setDeleteModalOpen(false);
      setUserToDelete(null);
      setDrawerOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.message || "Error al eliminar el usuario");
    },
  });

  // Mutation: resetear contraseña
  const resetPassword = useMutation({
    mutationFn: async ({ userId, password }: { userId: string; password: string }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No session");

      const response = await fetch(
        `https://zjobnxbzdtqsgbfdxzqo.supabase.co/functions/v1/admin-reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ userId, newPassword: password }),
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Error resetting password");
      return data;
    },
    onSuccess: () => {
      toast.success("Contraseña actualizada correctamente");
      setPasswordModalOpen(false);
      setUserForPassword(null);
      setNewPassword("");
    },
    onError: (error: any) => {
      toast.error(error.message || "Error al resetear la contraseña");
    },
  });

  // Mutation: crear usuario
  const createUser = useMutation({
    mutationFn: async ({ email, password, nombre }: { email: string; password: string; nombre: string }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No session");

      const response = await fetch(
        `https://zjobnxbzdtqsgbfdxzqo.supabase.co/functions/v1/admin-create-user`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ email, password, nombre }),
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Error creating user");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-usuarios"] });
      toast.success("Usuario creado correctamente");
      setCreateUserModalOpen(false);
      setNewUserEmail("");
      setNewUserPassword("");
      setNewUserNombre("");
    },
    onError: (error: any) => {
      toast.error(error.message || "Error al crear el usuario");
    },
  });

  // Helper: get enrollments with course data for a user
  const getEnrollmentsForUser = (usuarioId: string): EnrollmentWithCourse[] => {
    return matriculas
      .filter(m => m.usuario_id === usuarioId)
      .map(m => {
        const curso = cursos.find(c => c.id === m.curso_id);
        return {
          ...m,
          curso: curso || { id: m.curso_id, nivel: "?", titulo: "Curso no encontrado" },
          computedStatus: computeEnrollmentStatus(m),
        };
      })
      .sort((a, b) => a.curso.nivel.localeCompare(b.curso.nivel));
  };

  // Helper: count active enrollments
  const getActiveEnrollmentCount = (usuarioId: string): number => {
    return getEnrollmentsForUser(usuarioId).filter(e => e.computedStatus === 'active').length;
  };

  // Helper: next expiration date
  const getNextExpiration = (usuarioId: string): string | null => {
    const enrollments = getEnrollmentsForUser(usuarioId)
      .filter(e => e.fecha_fin && e.computedStatus === 'active')
      .sort((a, b) => new Date(a.fecha_fin!).getTime() - new Date(b.fecha_fin!).getTime());
    return enrollments[0]?.fecha_fin || null;
  };

  // Handlers
  const handleViewUser = (usuario: Usuario) => {
    setSelectedUsuario(usuario);
    setDrawerOpen(true);
  };

  const handleDeleteClick = (usuario: Usuario) => {
    setUserToDelete(usuario);
    setDeleteModalOpen(true);
  };

  const handlePasswordClick = (usuario: Usuario) => {
    setUserForPassword(usuario);
    setNewPassword("");
    setPasswordModalOpen(true);
  };

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    toast.success("Email copiado");
  };

  const handleAddCourse = (cursoId: string, metodoPago: string, tipoPago: string, diasPrueba?: number) => {
    if (!selectedUsuario) return;
    createMatricula.mutate({
      usuarioId: selectedUsuario.id,
      cursoId,
      metodoPago,
      tipoPago,
      diasPrueba,
    });
  };

  const handleAdd30Days = (enrollmentId: string, currentFechaFin: string | null) => {
    add30Days.mutate({ matriculaId: enrollmentId, currentFechaFin });
  };

  const handleEditDates = (enrollment: EnrollmentWithCourse) => {
    setEnrollmentToEdit(enrollment);
    setEditDatesDialogOpen(true);
  };

  const handleConfirmEditDates = (enrollmentId: string, fechaInicio: string, fechaFin: string | null) => {
    updateDates.mutate({ matriculaId: enrollmentId, fechaInicio, fechaFin });
  };

  const handleTogglePause = (enrollmentId: string, currentStatus: string) => {
    togglePause.mutate({ matriculaId: enrollmentId, currentStatus });
  };

  const handleRemoveEnrollment = (enrollment: EnrollmentWithCourse) => {
    setEnrollmentToRemove(enrollment);
    setRemoveEnrollmentDialogOpen(true);
  };

  const handleConfirmRemoveEnrollment = (enrollmentId: string) => {
    deleteEnrollment.mutate(enrollmentId);
  };

  // Filtered users
  const filteredUsuarios = useMemo(() => {
    if (!searchTerm) return usuarios;
    const term = searchTerm.toLowerCase();
    return usuarios.filter(
      (u) =>
        u.email.toLowerCase().includes(term) ||
        (u.nombre && u.nombre.toLowerCase().includes(term)) ||
        (u.telefono && u.telefono.includes(term))
    );
  }, [usuarios, searchTerm]);

  // Export CSV
  const exportToCSV = () => {
    const headers = ["Nombre", "Email", "Registro", "Cursos Activos", "Próximo Fin"];
    const rows = filteredUsuarios.map((usuario) => [
      usuario.nombre || "Sin nombre",
      usuario.email,
      format(new Date(usuario.fecha_creacion), "dd/MM/yyyy", { locale: es }),
      getActiveEnrollmentCount(usuario.id).toString(),
      getNextExpiration(usuario.id) 
        ? format(new Date(getNextExpiration(usuario.id)!), "dd/MM/yyyy", { locale: es })
        : "—",
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `usuarios_${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();

    toast.success("CSV exportado correctamente");
  };

  const isLoading = loadingUsuarios || loadingCursos || loadingMatriculas;
  const isUpdating = add30Days.isPending || updateDates.isPending || togglePause.isPending;

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 md:mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Users className="h-6 w-6 text-indigo-600" />
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">
            Gestión de Usuarios
          </h1>
        </div>
        <p className="text-gray-600 text-sm md:text-base">
          Administra el acceso a cursos de tus estudiantes
        </p>
      </div>

      <Card className="bg-white border-gray-200 shadow-sm p-4 md:p-6">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mb-4 md:mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por nombre o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setCreateUserModalOpen(true)}
              className="border-indigo-300 text-indigo-600 hover:bg-indigo-50 flex-1 sm:flex-none"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Agregar</span>
            </Button>
            <Button
              variant="outline"
              onClick={exportToCSV}
              className="border-gray-300 text-gray-700 hover:bg-gray-100 flex-1 sm:flex-none"
            >
              <Download className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Exportar</span>
            </Button>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          </div>
        ) : isMobile ? (
          // Mobile: Cards
          <div className="space-y-3">
            {filteredUsuarios.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                {searchTerm ? "No se encontraron usuarios" : "No hay usuarios registrados"}
              </div>
            ) : (
              filteredUsuarios.map((usuario) => {
                const activeCount = getActiveEnrollmentCount(usuario.id);
                const nextExp = getNextExpiration(usuario.id);
                return (
                  <Card key={usuario.id} className="p-4 border-gray-200">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {usuario.nombre || "Sin nombre"}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          <p className="text-sm text-gray-600 truncate">{usuario.email}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyEmail(usuario.email)}
                            className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600 shrink-0"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <Badge className="bg-indigo-100 text-indigo-700 text-xs">
                            <BookOpen className="h-3 w-3 mr-1" />
                            {activeCount} activo{activeCount !== 1 ? 's' : ''}
                          </Badge>
                          {nextExp && (
                            <Badge className="bg-amber-100 text-amber-700 text-xs">
                              <Calendar className="h-3 w-3 mr-1" />
                              {format(new Date(nextExp), "dd/MM/yy", { locale: es })}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewUser(usuario)}
                        className="shrink-0 text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        ) : (
          // Desktop: Table
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 hover:bg-gray-50">
                  <TableHead className="text-gray-700 font-semibold">Nombre</TableHead>
                  <TableHead className="text-gray-700 font-semibold">Email</TableHead>
                  <TableHead className="text-gray-700 font-semibold">Registro</TableHead>
                  <TableHead className="text-gray-700 font-semibold text-center">Cursos Activos</TableHead>
                  <TableHead className="text-gray-700 font-semibold">Próximo Fin</TableHead>
                  <TableHead className="text-gray-700 font-semibold text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsuarios.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                      {searchTerm ? "No se encontraron usuarios" : "No hay usuarios registrados"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsuarios.map((usuario) => {
                    const activeCount = getActiveEnrollmentCount(usuario.id);
                    const nextExp = getNextExpiration(usuario.id);
                    return (
                      <TableRow key={usuario.id} className="hover:bg-gray-50">
                        <TableCell className="text-gray-900 font-medium">
                          {usuario.nombre || "Sin nombre"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <span className="text-gray-600 text-sm">{usuario.email}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopyEmail(usuario.email)}
                              className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-500 text-sm">
                          {format(new Date(usuario.fecha_creacion), "dd/MM/yy", { locale: es })}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className={`${activeCount > 0 ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-500'}`}>
                            {activeCount}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {nextExp ? (
                            <span className="text-amber-600">
                              {format(new Date(nextExp), "dd/MM/yy", { locale: es })}
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewUser(usuario)}
                            className="text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Ver
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Stats */}
        <div className="mt-4 md:mt-6 pt-4 border-t border-gray-200 flex gap-4 md:gap-6 text-sm text-gray-500">
          <span>
            Total: <strong className="text-gray-900">{usuarios.length}</strong>
          </span>
          <span>
            Mostrando: <strong className="text-gray-900">{filteredUsuarios.length}</strong>
          </span>
        </div>
      </Card>

      {/* User Detail Drawer */}
      <UserDetailDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        usuario={selectedUsuario}
        enrollments={selectedUsuario ? getEnrollmentsForUser(selectedUsuario.id) : []}
        cursos={cursos}
        onAdd30Days={handleAdd30Days}
        onEditDates={handleEditDates}
        onTogglePause={handleTogglePause}
        onRemoveEnrollment={handleRemoveEnrollment}
        onAddCourse={() => setAddCourseDialogOpen(true)}
        onChangePassword={handlePasswordClick}
        onDeleteUser={handleDeleteClick}
        isUpdating={isUpdating}
      />

      {/* Add Course Dialog */}
      <AddCourseDialog
        open={addCourseDialogOpen}
        onOpenChange={setAddCourseDialogOpen}
        cursos={cursos}
        enrolledCourseIds={selectedUsuario ? getEnrollmentsForUser(selectedUsuario.id).map(e => e.curso_id) : []}
        onConfirm={handleAddCourse}
        isCreating={createMatricula.isPending}
      />

      {/* Edit Dates Dialog */}
      <EditDatesDialog
        open={editDatesDialogOpen}
        onOpenChange={setEditDatesDialogOpen}
        enrollment={enrollmentToEdit}
        onConfirm={handleConfirmEditDates}
        isUpdating={updateDates.isPending}
      />

      {/* Remove Enrollment Dialog */}
      <RemoveEnrollmentDialog
        open={removeEnrollmentDialogOpen}
        onOpenChange={setRemoveEnrollmentDialogOpen}
        enrollment={enrollmentToRemove}
        onConfirm={handleConfirmRemoveEnrollment}
        isDeleting={deleteEnrollment.isPending}
      />

      {/* Delete User Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="bg-white border-gray-200 text-gray-900">
          <DialogHeader>
            <DialogTitle className="text-red-600 text-lg font-semibold">
              Eliminar Usuario
            </DialogTitle>
            <DialogDescription className="text-gray-500">
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <p className="text-gray-900">
              ¿Estás seguro de que deseas eliminar a <strong>{userToDelete?.nombre || userToDelete?.email}</strong>?
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Se eliminarán todas sus matrículas y acceso a cursos.
            </p>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteModalOpen(false)}
              className="border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              Cancelar
            </Button>
            <Button
              onClick={() => userToDelete && deleteUser.mutate(userToDelete.id)}
              disabled={deleteUser.isPending}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleteUser.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Eliminar Usuario
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Password Reset Modal */}
      <Dialog open={passwordModalOpen} onOpenChange={setPasswordModalOpen}>
        <DialogContent className="bg-white border-gray-200 text-gray-900">
          <DialogHeader>
            <DialogTitle className="text-gray-900 text-lg font-semibold">
              Cambiar Contraseña
            </DialogTitle>
            <DialogDescription className="text-gray-500">
              Asigna una nueva contraseña para {userForPassword?.nombre || userForPassword?.email}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div>
              <label className="text-sm text-gray-700 font-medium mb-2 block">
                Nueva contraseña
              </label>
              <Input
                type="text"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="bg-white border-gray-300 text-gray-900"
              />
              {newPassword.length > 0 && newPassword.length < 6 && (
                <p className="text-sm text-red-500 mt-1">
                  La contraseña debe tener al menos 6 caracteres
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPasswordModalOpen(false)}
              className="border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              Cancelar
            </Button>
            <Button
              onClick={() => {
                if (!userForPassword) return;
                const parsed = adminResetPasswordSchema.safeParse({ password: newPassword });
                if (!parsed.success) {
                  toast.error(parsed.error.errors[0]?.message || "Contraseña inválida");
                  return;
                }
                resetPassword.mutate({ userId: userForPassword.id, password: parsed.data.password });
              }}
              disabled={resetPassword.isPending || newPassword.length < 6}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {resetPassword.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Key className="h-4 w-4 mr-2" />
              )}
              Guardar Contraseña
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create User Modal */}
      <Dialog open={createUserModalOpen} onOpenChange={setCreateUserModalOpen}>
        <DialogContent className="bg-white border-gray-200 text-gray-900">
          <DialogHeader>
            <DialogTitle className="text-gray-900 text-lg font-semibold">
              Agregar Usuario
            </DialogTitle>
            <DialogDescription className="text-gray-500">
              Crea un nuevo usuario manualmente
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div>
              <label className="text-sm text-gray-700 font-medium mb-2 block">
                Nombre
              </label>
              <Input
                type="text"
                value={newUserNombre}
                onChange={(e) => setNewUserNombre(e.target.value)}
                placeholder="Nombre del usuario"
                className="bg-white border-gray-300 text-gray-900"
              />
            </div>
            <div>
              <label className="text-sm text-gray-700 font-medium mb-2 block">
                Email *
              </label>
              <Input
                type="email"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
                className="bg-white border-gray-300 text-gray-900"
              />
            </div>
            <div>
              <label className="text-sm text-gray-700 font-medium mb-2 block">
                Contraseña *
              </label>
              <Input
                type="text"
                value={newUserPassword}
                onChange={(e) => setNewUserPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="bg-white border-gray-300 text-gray-900"
              />
              {newUserPassword.length > 0 && newUserPassword.length < 6 && (
                <p className="text-sm text-red-500 mt-1">
                  La contraseña debe tener al menos 6 caracteres
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateUserModalOpen(false)}
              className="border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              Cancelar
            </Button>
            <Button
              onClick={() => {
                const parsed = adminCreateUserSchema.safeParse({ email: newUserEmail, password: newUserPassword, nombre: newUserNombre || undefined });
                if (!parsed.success) {
                  toast.error(parsed.error.errors[0]?.message || "Datos inválidos");
                  return;
                }
                createUser.mutate({ email: parsed.data.email, password: parsed.data.password, nombre: parsed.data.nombre || "" });
              }}
              disabled={createUser.isPending || !newUserEmail || newUserPassword.length < 6}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {createUser.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <UserPlus className="h-4 w-4 mr-2" />
              )}
              Crear Usuario
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsuarios;
