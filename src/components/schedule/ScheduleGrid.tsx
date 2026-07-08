import { cn } from "@/lib/utils";
import type { HorarioSlot } from "@/hooks/useHorario";

const DIAS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const HORAS = Array.from({ length: 17 }, (_, i) => i + 6); // 6..22

const formatHora = (h: number) => `${h.toString().padStart(2, "0")}:00`;

type ScheduleGridProps = {
  slots: HorarioSlot[];
  editable?: boolean;
  onToggle?: (slot: HorarioSlot) => void;
  pendingSlotId?: string | null;
  ocupadoLabel?: string;
};

export const ScheduleGrid = ({
  slots,
  editable = false,
  onToggle,
  pendingSlotId,
  ocupadoLabel = "Ocupado",
}: ScheduleGridProps) => {
  const bySlot = new Map(slots.map((s) => [`${s.dia_semana}-${s.hora_inicio}`, s]));

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[640px]">
        <div className="grid grid-cols-8 gap-1 mb-1">
          <div />
          {DIAS.map((dia) => (
            <div key={dia} className="text-center text-xs font-semibold text-muted-foreground py-1">
              {dia}
            </div>
          ))}
        </div>
        {HORAS.map((hora) => (
          <div key={hora} className="grid grid-cols-8 gap-1 mb-1">
            <div className="text-xs text-muted-foreground flex items-center justify-end pr-2">
              {formatHora(hora)}
            </div>
            {DIAS.map((_, i) => {
              const diaSemana = i + 1;
              const slot = bySlot.get(`${diaSemana}-${hora}`);
              if (!slot) return <div key={i} />;
              const isPending = pendingSlotId === slot.id;
              const clickable = editable && !!onToggle;
              return (
                <button
                  key={i}
                  type="button"
                  disabled={!clickable || isPending}
                  onClick={() => onToggle?.(slot)}
                  className={cn(
                    "h-8 rounded-md text-[10px] font-medium flex items-center justify-center transition-colors",
                    slot.disponible
                      ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                      : "bg-slate-200 text-slate-500 border border-slate-300",
                    clickable && "cursor-pointer hover:brightness-95",
                    !clickable && "cursor-default",
                    isPending && "opacity-50"
                  )}
                  title={slot.disponible ? "Disponible" : ocupadoLabel}
                >
                  {slot.disponible ? "" : "•"}
                </button>
              );
            })}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-200 inline-block" />
          Disponible
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-slate-200 border border-slate-300 inline-block" />
          {ocupadoLabel}
        </span>
      </div>
    </div>
  );
};
