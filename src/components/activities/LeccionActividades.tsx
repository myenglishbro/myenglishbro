import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { ClipboardList, Shuffle, AlignLeft, ListChecks, SpellCheck, BookOpen, Headphones } from "lucide-react";
import {
  CursoActividad, PracticeActivityType, TIPO_LABELS, TIPO_COLORS,
  MatchingContent, FillBlanksContent, MultipleChoiceContent, UseOfEnglishContent, ReadingContent, ListeningContent,
  scoreMatching, scoreFillBlanks, scoreMultipleChoice, scoreUseOfEnglish,
} from "./practiceActivity.types";
import {
  MatchingPractice, FillBlanksPractice, MultipleChoicePractice,
  UseOfEnglishPractice, ReadingPractice, ListeningPractice,
} from "./PracticeActivityBody";

const TIPO_ICONS: Record<PracticeActivityType, React.ElementType> = {
  multiple_matching: Shuffle,
  fill_blanks: AlignLeft,
  multiple_choice: ListChecks,
  use_of_english: SpellCheck,
  reading: BookOpen,
  listening: Headphones,
};

type Progreso = { actividad_id: string; correctas: number | null; total: number | null };

export function LeccionActividades({ leccionId }: { leccionId: string }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [active, setActive] = useState<CursoActividad | null>(null);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [checked, setChecked] = useState(false);
  const [result, setResult] = useState<{ correctas: number; total: number } | null>(null);

  const { data: actividades = [] } = useQuery({
    queryKey: ["curso-actividades", leccionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("curso_actividades")
        .select("*")
        .eq("leccion_id", leccionId)
        .eq("activo", true)
        .order("order_index", { ascending: true });
      if (error) throw error;
      return data as unknown as CursoActividad[];
    },
    enabled: !!leccionId,
  });

  const { data: progreso = [] } = useQuery({
    queryKey: ["curso-actividad-progreso", leccionId, user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("curso_actividad_progreso")
        .select("actividad_id, correctas, total")
        .eq("usuario_id", user!.id)
        .in("actividad_id", actividades.map((a) => a.id));
      if (error) throw error;
      return data as Progreso[];
    },
    enabled: !!user?.id && actividades.length > 0,
  });

  const saveMutation = useMutation({
    mutationFn: async ({ actividadId, respuestas, correctas, total }: {
      actividadId: string; respuestas: Record<string, unknown>; correctas: number; total: number;
    }) => {
      const { error } = await supabase
        .from("curso_actividad_progreso")
        .upsert({
          actividad_id: actividadId,
          usuario_id: user!.id,
          completado: true,
          respuestas: respuestas as Json,
          correctas,
          total,
          fecha_completado: new Date().toISOString(),
        }, { onConflict: "actividad_id,usuario_id" });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["curso-actividad-progreso", leccionId, user?.id] });
    },
    onError: () => toast.error("No se pudo guardar tu progreso"),
  });

  function openActivity(actividad: CursoActividad) {
    setActive(actividad);
    setAnswers({});
    setChecked(false);
    setResult(null);
  }

  function handleVerify() {
    if (!active) return;
    let score = { correctas: 0, total: 0 };
    if (active.tipo === "multiple_matching") {
      score = scoreMatching((active.contenido as MatchingContent).pairs, answers as Record<string, string>);
    } else if (active.tipo === "fill_blanks") {
      score = scoreFillBlanks((active.contenido as FillBlanksContent).blanks, answers as Record<string, string>);
    } else if (active.tipo === "multiple_choice") {
      score = scoreMultipleChoice((active.contenido as MultipleChoiceContent).questions, answers as Record<string, number>);
    } else if (active.tipo === "use_of_english") {
      score = scoreUseOfEnglish((active.contenido as UseOfEnglishContent).items, answers as Record<string, string>);
    } else if (active.tipo === "reading") {
      score = scoreMultipleChoice((active.contenido as ReadingContent).questions, answers as Record<string, number>);
    } else if (active.tipo === "listening") {
      score = scoreMultipleChoice((active.contenido as ListeningContent).questions, answers as Record<string, number>);
    }
    setResult(score);
    setChecked(true);
    saveMutation.mutate({ actividadId: active.id, respuestas: answers, correctas: score.correctas, total: score.total });
  }

  if (actividades.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <ClipboardList className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">Actividades de práctica</h3>
      </div>
      <div className="space-y-2">
        {actividades.map((actividad) => {
          const p = progreso.find((pr) => pr.actividad_id === actividad.id);
          const Icon = TIPO_ICONS[actividad.tipo];
          return (
            <div
              key={actividad.id}
              className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:shadow-sm transition-shadow"
            >
              <Checkbox checked={!!p} disabled className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600" />
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium">{actividad.titulo}</span>
                  <Badge variant="secondary" className={`text-xs ${TIPO_COLORS[actividad.tipo]}`}>
                    {TIPO_LABELS[actividad.tipo]}
                  </Badge>
                </div>
                {p && p.total ? (
                  <p className="text-xs text-muted-foreground mt-0.5">Última práctica: {p.correctas}/{p.total} correctas</p>
                ) : null}
              </div>
              <Button size="sm" variant={p ? "outline" : "default"} onClick={() => openActivity(actividad)}>
                {p ? "Repasar" : "Practicar"}
              </Button>
            </div>
          );
        })}
      </div>

      <Dialog open={!!active} onOpenChange={(open) => !open && setActive(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {active && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 flex-wrap">
                  <DialogTitle>{active.titulo}</DialogTitle>
                  <Badge variant="secondary" className={`text-xs ${TIPO_COLORS[active.tipo]}`}>
                    {TIPO_LABELS[active.tipo]}
                  </Badge>
                </div>
                {active.instrucciones && (
                  <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{active.instrucciones}</p>
                )}
              </DialogHeader>

              <div className="mt-4 space-y-4">
                {active.tipo === "multiple_matching" && (
                  <MatchingPractice
                    content={active.contenido as MatchingContent}
                    answers={answers as Record<string, string>}
                    onChange={setAnswers}
                    checked={checked}
                  />
                )}
                {active.tipo === "fill_blanks" && (
                  <FillBlanksPractice
                    content={active.contenido as FillBlanksContent}
                    answers={answers as Record<string, string>}
                    onChange={setAnswers}
                    checked={checked}
                  />
                )}
                {active.tipo === "multiple_choice" && (
                  <MultipleChoicePractice
                    content={active.contenido as MultipleChoiceContent}
                    answers={answers as Record<string, number>}
                    onChange={setAnswers}
                    checked={checked}
                  />
                )}
                {active.tipo === "use_of_english" && (
                  <UseOfEnglishPractice
                    content={active.contenido as UseOfEnglishContent}
                    answers={answers as Record<string, string>}
                    onChange={setAnswers}
                    checked={checked}
                  />
                )}
                {active.tipo === "reading" && (
                  <ReadingPractice
                    content={active.contenido as ReadingContent}
                    answers={answers as Record<string, number>}
                    onChange={setAnswers}
                    checked={checked}
                  />
                )}
                {active.tipo === "listening" && (
                  <ListeningPractice
                    content={active.contenido as ListeningContent}
                    answers={answers as Record<string, number>}
                    onChange={setAnswers}
                    checked={checked}
                  />
                )}

                {result && (
                  <div className="border-t pt-4 flex items-center gap-2">
                    <span className="font-semibold text-primary">
                      {result.correctas}/{result.total} correctas
                    </span>
                  </div>
                )}

                <div className="flex justify-end gap-2 border-t pt-4">
                  <Button variant="outline" onClick={() => setActive(null)}>Cerrar</Button>
                  {!checked && (
                    <Button onClick={handleVerify}>Verificar respuestas</Button>
                  )}
                  {checked && (
                    <Button variant="secondary" onClick={() => openActivity(active)}>Intentar de nuevo</Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
