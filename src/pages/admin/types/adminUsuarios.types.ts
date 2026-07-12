export interface Usuario {
  id: string;
  email: string;
  nombre: string | null;
  fecha_creacion: string;
  telefono: string | null;
}

export interface Matricula {
  id: string;
  usuario_id: string;
  curso_id: string;
  estado: string;
  metodo_pago: string | null;
  tipo_pago: string | null;
  fecha_inicio: string;
  fecha_fin: string | null;
}

export interface Curso {
  id: string;
  nivel: string;
  titulo: string;
}

export interface Suscripcion {
  id: string;
  usuario_id: string;
  estado: string;
  metodo_pago: string | null;
  fecha_inicio: string;
  fecha_fin: string;
}

export type EnrollmentStatus = 'active' | 'paused' | 'expired' | 'completed';

export interface EnrollmentWithCourse extends Matricula {
  curso: Curso;
  computedStatus: EnrollmentStatus;
}

export function computeEnrollmentStatus(matricula: Matricula): EnrollmentStatus {
  const now = new Date();
  
  // Si fecha_fin existe y ya pasó, está expirado (sin importar el estado en DB)
  if (matricula.fecha_fin && new Date(matricula.fecha_fin) < now) {
    return 'expired';
  }
  
  // Mapear estados de la DB
  switch (matricula.estado) {
    case 'activa':
      return 'active';
    case 'pausada':
      return 'paused';
    case 'completada':
      return 'completed';
    case 'cancelada':
      return 'expired';
    default:
      return 'active';
  }
}

export function getStatusBadgeProps(status: EnrollmentStatus): {
  label: string;
  className: string;
} {
  switch (status) {
    case 'active':
      return { label: 'Activo', className: 'bg-emerald-100 text-emerald-700' };
    case 'paused':
      return { label: 'Pausado', className: 'bg-amber-100 text-amber-700' };
    case 'expired':
      return { label: 'Expirado', className: 'bg-red-100 text-red-700' };
    case 'completed':
      return { label: 'Completado', className: 'bg-blue-100 text-blue-700' };
    default:
      return { label: 'Desconocido', className: 'bg-gray-100 text-gray-700' };
  }
}
