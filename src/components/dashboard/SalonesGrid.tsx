import { Link } from "react-router-dom";
import { PlayCircle, School } from "lucide-react";

interface Salon {
  id: string;
  nombre: string;
  descripcion: string | null;
  imagen_url: string | null;
}

export const SalonesGrid = ({ salones }: { salones: Salon[] }) => {
  if (salones.length === 0) return null;

  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-slate-800 font-display mb-3 flex items-center gap-2">
        <School className="h-4 w-4 text-primary" />
        Mis Salones
      </h3>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {salones.map((salon) => (
          <Link
            key={salon.id}
            to={`/salon/${salon.id}`}
            className="group dashboard-card overflow-hidden flex flex-col hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
          >
            {/* Cover image */}
            <div className="relative h-28 bg-gradient-to-br from-primary/10 to-indigo-100 overflow-hidden shrink-0">
              {salon.imagen_url ? (
                <img
                  src={salon.imagen_url}
                  alt={salon.nombre}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <School className="h-9 w-9 text-primary/30" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/0 to-transparent" />
              <span className="absolute top-2 left-2 text-[10px] font-bold uppercase tracking-wider text-white bg-black/40 backdrop-blur px-2 py-0.5 rounded-full flex items-center gap-1">
                <School className="h-3 w-3" /> Salón
              </span>
            </div>
            {/* Info */}
            <div className="p-3.5 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm text-slate-800 truncate group-hover:text-primary transition-colors">
                  {salon.nombre}
                </h4>
                {salon.descripcion && (
                  <p className="text-xs text-slate-500 truncate mt-0.5">{salon.descripcion}</p>
                )}
              </div>
              <div className="shrink-0 w-8 h-8 rounded-full bg-primary/10 group-hover:bg-primary flex items-center justify-center transition-colors">
                <PlayCircle className="h-4 w-4 text-primary group-hover:text-white transition-colors" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
