import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  User,
  Mail,
  BookOpen,
  Calendar,
  Copy,
  BookPlus,
  Key,
  Trash2,
  GraduationCap,
  Phone
} from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Usuario,
  Curso,
  EnrollmentWithCourse
} from "../types/adminUsuarios.types";
import { EnrollmentCard } from "./EnrollmentCard";
import { useIsMobile } from "@/hooks/use-mobile";

interface UserDetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  usuario: Usuario | null;
  enrollments: EnrollmentWithCourse[];
  cursos: Curso[];
  onAdd30Days: (enrollmentId: string, currentFechaFin: string | null) => void;
  onEditDates: (enrollment: EnrollmentWithCourse) => void;
  onTogglePause: (enrollmentId: string, currentStatus: string) => void;
  onRemoveEnrollment: (enrollment: EnrollmentWithCourse) => void;
  onAddCourse: () => void;
  onChangePassword: (usuario: Usuario) => void;
  onDeleteUser: (usuario: Usuario) => void;
  isUpdating: boolean;
}

export function UserDetailDrawer({
  open,
  onOpenChange,
  usuario,
  enrollments,
  cursos,
  onAdd30Days,
  onEditDates,
  onTogglePause,
  onRemoveEnrollment,
  onAddCourse,
  onChangePassword,
  onDeleteUser,
  isUpdating,
}: UserDetailDrawerProps) {
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();

  const { data: isTeacher = false } = useQuery({
    queryKey: ["user-is-teacher", usuario?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("user_roles")
        .select("id")
        .eq("user_id", usuario!.id)
        .eq("role", "teacher")
        .maybeSingle();
      return !!data;
    },
    enabled: !!usuario?.id && open,
  });

  const toggleTeacherMutation = useMutation({
    mutationFn: async (assign: boolean) => {
      if (assign) {
        const { error } = await supabase
          .from("user_roles")
          .insert({ user_id: usuario!.id, role: "teacher" });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("user_roles")
          .delete()
          .eq("user_id", usuario!.id)
          .eq("role", "teacher");
        if (error) throw error;
      }
    },
    onSuccess: (_, assign) => {
      queryClient.invalidateQueries({ queryKey: ["user-is-teacher", usuario?.id] });
      queryClient.invalidateQueries({ queryKey: ["admin-teachers"] });
      toast.success(assign ? "Rol docente asignado" : "Rol docente removido");
    },
    onError: () => toast.error("Error al cambiar el rol"),
  });

  if (!usuario) return null;

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(usuario.email);
    toast.success("Email copiado al portapapeles");
  };

  const activeEnrollments = enrollments.filter(
    e => e.computedStatus === 'active'
  );

  const nextExpiration = enrollments
    .filter(e => e.fecha_fin && e.computedStatus === 'active')
    .sort((a, b) => new Date(a.fecha_fin!).getTime() - new Date(b.fecha_fin!).getTime())
    [0]?.fecha_fin;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side={isMobile ? "bottom" : "right"}
        className={`bg-white border-gray-200 overflow-y-auto ${
          isMobile ? 'h-[95vh] rounded-t-xl' : 'w-full max-w-lg'
        }`}
      >
        <SheetHeader className="pb-4 border-b border-gray-100">
          <SheetTitle className="text-gray-900 text-xl font-semibold flex items-center gap-2">
            <User className="h-5 w-5 text-indigo-600" />
            Detalle del Usuario
          </SheetTitle>
          <SheetDescription className="text-gray-500">
            Gestiona el acceso y cursos de este usuario
          </SheetDescription>
        </SheetHeader>

        <div className="py-6 space-y-6">
          {/* Resumen del usuario */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
              Información
            </h3>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-900">
                <User className="h-4 w-4 text-gray-400" />
                <span className="font-medium">{usuario.nombre || "Sin nombre"}</span>
              </div>

              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="text-gray-700">{usuario.email}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyEmail}
                  className="h-7 w-7 p-0 text-gray-400 hover:text-gray-600"
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </div>

              {usuario.telefono && (
                <div className="flex items-center gap-2 text-gray-700 text-sm">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span>{usuario.telefono}</span>
                </div>
              )}

              <div className="flex items-center gap-2 text-gray-600 text-sm">
                <Calendar className="h-4 w-4 text-gray-400" />
                Registrado: {format(new Date(usuario.fecha_creacion), "dd/MM/yyyy", { locale: es })}
              </div>
            </div>

            {/* Stats badges */}
            <div className="flex flex-wrap gap-2 pt-2">
              <Badge className="bg-indigo-100 text-indigo-700">
                <BookOpen className="h-3 w-3 mr-1" />
                {activeEnrollments.length} curso{activeEnrollments.length !== 1 ? 's' : ''} activo{activeEnrollments.length !== 1 ? 's' : ''}
              </Badge>
              {nextExpiration && (
                <Badge className="bg-amber-100 text-amber-700">
                  <Calendar className="h-3 w-3 mr-1" />
                  Próx. fin: {format(new Date(nextExpiration), "dd/MM/yy", { locale: es })}
                </Badge>
              )}
            </div>
          </section>

          {/* Acciones de usuario */}
          <section className="space-y-3 pt-4 border-t border-gray-100">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
              Acciones
            </h3>
            
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onAddCourse}
                className="text-indigo-600 border-indigo-200 hover:bg-indigo-50"
              >
                <BookPlus className="h-4 w-4 mr-2" />
                Agregar Curso
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => onChangePassword(usuario)}
                className="text-gray-600 border-gray-200 hover:bg-gray-50"
              >
                <Key className="h-4 w-4 mr-2" />
                Cambiar Contraseña
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => onDeleteUser(usuario)}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar Usuario
              </Button>
            </div>
          </section>

          {/* Rol Docente */}
          <section className="space-y-3 pt-4 border-t border-gray-100">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
              Rol Docente
            </h3>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-indigo-600" />
                <div>
                  <p className="text-sm font-medium text-gray-800">Docente</p>
                  <p className="text-xs text-gray-500">Puede gestionar un salón asignado</p>
                </div>
              </div>
              <Switch
                checked={isTeacher}
                onCheckedChange={(v) => toggleTeacherMutation.mutate(v)}
                disabled={toggleTeacherMutation.isPending}
              />
            </div>
            {isTeacher && (
              <p className="text-xs text-indigo-600 flex items-center gap-1">
                <GraduationCap className="h-3 w-3" />
                Este usuario puede acceder a /teacher y gestionar su salón
              </p>
            )}
          </section>

          {/* Lista de cursos/enrollments */}
          <section className="space-y-3 pt-4 border-t border-gray-100">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
              Cursos Asignados ({enrollments.length})
            </h3>
            
            {enrollments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Este usuario no tiene cursos asignados</p>
              </div>
            ) : (
              <div className="space-y-3">
                {enrollments.map((enrollment) => (
                  <EnrollmentCard
                    key={enrollment.id}
                    enrollment={enrollment}
                    onAdd30Days={onAdd30Days}
                    onEditDates={onEditDates}
                    onTogglePause={onTogglePause}
                    onRemove={onRemoveEnrollment}
                    isUpdating={isUpdating}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}
