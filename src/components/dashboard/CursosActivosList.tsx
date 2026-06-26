import { Link } from "react-router-dom";
import { PlayCircle, Clock, Infinity, Gift } from "lucide-react";
import { differenceInDays, parseISO } from "date-fns";

interface Enrollment {
  id: string;
  tipo_pago: string;
  fecha_fin: string | null;
  curso: any;
}

const LEVEL_COLORS: Record<string, string> = {
  A1: "bg-emerald-100 text-emerald-700",
  A2: "bg-teal-100 text-teal-700",
  B1: "bg-cyan-100 text-cyan-700",
  B2: "bg-blue-100 text-blue-700",
  C1: "bg-indigo-100 text-indigo-700",
  C2: "bg-violet-100 text-violet-700",
};

const getAccessStatus = (enrollment: Enrollment) => {
  if (enrollment.tipo_pago === "unico" || !enrollment.fecha_fin) {
    return { type: "lifetime" as const, days: null };
  }
  const fechaFin = parseISO(enrollment.fecha_fin);
  const daysRemaining = differenceInDays(fechaFin, new Date());
  return {
    type: enrollment.tipo_pago === "prueba" ? ("trial" as const) : ("monthly" as const),
    days: daysRemaining > 0 ? daysRemaining : 0,
  };
};

export const CursosActivosList = ({ enrollments }: { enrollments: Enrollment[] }) => {
  return (
    <div className="dashboard-card p-4 animate-fade-in-up animate-delay-300">
      <h3 className="text-sm font-semibold text-slate-800 font-display mb-3">
        Tus cursos activos
      </h3>
      <div className="space-y-2">
        {enrollments.map((enrollment) => {
          const course = enrollment.curso;
          if (!course) return null;

          const accessStatus = getAccessStatus(enrollment);

          return (
            <Link
              key={enrollment.id}
              to={`/courses/${course.id}`}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-slate-100 group"
            >
              <div className={`w-10 h-10 rounded-xl ${LEVEL_COLORS[course.nivel] || "bg-slate-100 text-slate-700"} flex items-center justify-center font-bold text-xs shrink-0`}>
                {course.nivel}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm text-slate-800 truncate group-hover:text-primary transition-colors">{course.titulo}</h4>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Nivel {course.nivel}</span>
                  {accessStatus.type === "lifetime" ? (
                    <span className="text-[11px] text-emerald-600 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full">
                      <Infinity className="h-3 w-3" /> Lifetime
                    </span>
                  ) : accessStatus.type === "trial" ? (
                    <span className="text-[11px] text-amber-600 flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-full">
                      <Gift className="h-3 w-3" /> Prueba: {accessStatus.days}d
                    </span>
                  ) : (
                    <span className={`text-[11px] flex items-center gap-1 px-2 py-0.5 rounded-full ${accessStatus.days && accessStatus.days <= 7 ? "text-red-600 bg-red-50" : "text-blue-600 bg-blue-50"}`}>
                      <Clock className="h-3 w-3" /> {accessStatus.days}d
                    </span>
                  )}
                </div>
              </div>
              <PlayCircle className="h-5 w-5 text-slate-300 group-hover:text-primary transition-colors flex-shrink-0" />
            </Link>
          );
        })}
      </div>
    </div>
  );
};
