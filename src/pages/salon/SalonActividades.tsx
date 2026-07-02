import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  ChevronLeft, Trophy, ClipboardList, Star, User,
  CheckCircle2, Clock, Shuffle, AlignLeft, PenLine, Lock,
  ListChecks, HelpCircle,
} from "lucide-react";

type ActivityType = "multiple_matching" | "fill_blanks" | "multiple_choice" | "writing" | "open_questions";

type MatchingPair = { id: string; left: string; right: string };
type BlankItem = { id: string; answer: string; options: string };
type McQuestion = { id: string; question: string; options: string[]; correctIndex: number };
type OpenQuestionItem = { id: string; question: string };
type MatchingContent = { pairs: MatchingPair[] };
type FillBlanksContent = { template: string; blanks: BlankItem[] };
type MultipleChoiceContent = { questions: McQuestion[] };
type WritingContent = { prompt: string; min_words: number; max_words: number };
type OpenQuestionsContent = { questions: OpenQuestionItem[] };

type Actividad = {
  id: string;
  salon_id: string;
  titulo: string;
  instrucciones: string | null;
  tipo: ActivityType;
  contenido: MatchingContent | FillBlanksContent | MultipleChoiceContent | WritingContent | OpenQuestionsContent;
  puntaje_maximo: number;
  activo: boolean;
  order_index: number;
};

type Entrega = {
  id: string;
  actividad_id: string;
  puntaje_obtenido: number | null;
  comentario_docente: string | null;
  estado: "entregado" | "calificado";
  respuestas: Record<string, unknown>;
};

type LeaderboardEntry = {
  estudiante_id: string;
  nombre: string | null;
  email: string;
  total: number;
};

const TIPO_ICONS: Record<ActivityType, React.ElementType> = {
  multiple_matching: Shuffle,
  fill_blanks: AlignLeft,
  multiple_choice: ListChecks,
  writing: PenLine,
  open_questions: HelpCircle,
};

const TIPO_LABELS: Record<ActivityType, string> = {
  multiple_matching: "Multiple Matching",
  fill_blanks: "Fill in the Blanks",
  multiple_choice: "Multiple Choice",
  writing: "Writing",
  open_questions: "Preguntas Abiertas",
};

const TIPO_COLORS: Record<ActivityType, string> = {
  multiple_matching: "bg-blue-100 text-blue-700",
  fill_blanks: "bg-amber-100 text-amber-700",
  multiple_choice: "bg-purple-100 text-purple-700",
  writing: "bg-green-100 text-green-700",
  open_questions: "bg-rose-100 text-rose-700",
};

function countWords(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function scoreMatching(pairs: MatchingPair[], matches: Record<string, string>, maxScore: number): number {
  if (!pairs.length) return 0;
  const correct = pairs.filter((p) => matches[p.id] === p.id).length;
  return Math.round((correct / pairs.length) * maxScore);
}

function scoreFillBlanks(blanks: BlankItem[], answers: Record<string, string>, maxScore: number): number {
  if (!blanks.length) return 0;
  const correct = blanks.filter(
    (b) => (answers[b.id] || "").trim().toLowerCase() === b.answer.trim().toLowerCase()
  ).length;
  return Math.round((correct / blanks.length) * maxScore);
}

function scoreMultipleChoice(questions: McQuestion[], answers: Record<string, number>, maxScore: number): number {
  if (!questions.length) return 0;
  const correct = questions.filter((q) => answers[q.id] === q.correctIndex).length;
  return Math.round((correct / questions.length) * maxScore);
}

// --- Activity components ---

function MatchingActivity({
  content,
  existing,
  onChange,
  readonly,
}: {
  content: MatchingContent;
  existing?: Record<string, string>;
  onChange?: (matches: Record<string, string>) => void;
  readonly?: boolean;
}) {
  const [matches, setMatches] = useState<Record<string, string>>(existing || {});
  const shuffled = [...content.pairs].sort(() => Math.random() - 0.5);

  function handleMatch(leftId: string, rightId: string) {
    if (readonly) return;
    const updated = { ...matches, [leftId]: rightId };
    setMatches(updated);
    onChange?.(updated);
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">Conecta cada elemento de la izquierda con su par correcto de la derecha.</p>
      {content.pairs.map((pair) => (
        <div key={pair.id} className="flex items-center gap-3">
          <div className="flex-1 p-3 rounded-lg bg-blue-50 border border-blue-200 text-sm font-medium text-center">
            {pair.left}
          </div>
          <span className="text-muted-foreground text-lg">→</span>
          <div className="flex-1">
            {readonly ? (
              <div className={`p-3 rounded-lg text-sm font-medium text-center ${
                matches[pair.id] === pair.id ? "bg-green-50 border border-green-200 text-green-700" : "bg-red-50 border border-red-200 text-red-700"
              }`}>
                {content.pairs.find((p) => p.id === matches[pair.id])?.right || "(Sin respuesta)"}
              </div>
            ) : (
              <select
                className="w-full p-3 rounded-lg border text-sm bg-white"
                value={matches[pair.id] || ""}
                onChange={(e) => handleMatch(pair.id, e.target.value)}
              >
                <option value="">-- Seleccionar --</option>
                {shuffled.map((p) => (
                  <option key={p.id} value={p.id}>{p.right}</option>
                ))}
              </select>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function FillBlanksActivity({
  content,
  existing,
  onChange,
  readonly,
}: {
  content: FillBlanksContent;
  existing?: Record<string, string>;
  onChange?: (answers: Record<string, string>) => void;
  readonly?: boolean;
}) {
  const [answers, setAnswers] = useState<Record<string, string>>(existing || {});

  function handleAnswer(id: string, value: string) {
    if (readonly) return;
    const updated = { ...answers, [id]: value };
    setAnswers(updated);
    onChange?.(updated);
  }

  // Render template with inline inputs
  const parts = content.template.split("___");
  let blankIndex = 0;

  return (
    <div>
      <p className="text-sm leading-relaxed whitespace-pre-wrap">
        {parts.map((part, i) => {
          const blank = content.blanks[blankIndex];
          const currentIndex = blankIndex++;
          const hasOptions = blank?.options && blank.options.trim().length > 0;
          const options = hasOptions ? blank.options.split(",").map((o) => o.trim()) : [];
          const isCorrect = readonly && blank && (answers[blank.id] || "").trim().toLowerCase() === blank.answer.trim().toLowerCase();

          return (
            <span key={i}>
              {part}
              {i < parts.length - 1 && blank && (
                hasOptions && !readonly ? (
                  <select
                    className="mx-1 px-2 py-0.5 border-b-2 border-primary bg-transparent text-sm focus:outline-none"
                    value={answers[blank.id] || ""}
                    onChange={(e) => handleAnswer(blank.id, e.target.value)}
                  >
                    <option value="">___</option>
                    {options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                ) : (
                  <span className={`mx-1 inline-block ${readonly ? (isCorrect ? "text-green-600 font-bold" : "text-red-600 font-bold") : ""}`}>
                    {readonly ? (
                      `[${answers[blank.id] || "?"}]`
                    ) : (
                      <input
                        type="text"
                        className="border-b-2 border-primary bg-transparent w-24 px-1 py-0.5 text-sm focus:outline-none"
                        value={answers[blank.id] || ""}
                        onChange={(e) => handleAnswer(blank.id, e.target.value)}
                        placeholder="___"
                      />
                    )}
                  </span>
                )
              )}
            </span>
          );
        })}
      </p>
    </div>
  );
}

function MultipleChoiceActivity({
  content,
  existing,
  onChange,
  readonly,
}: {
  content: MultipleChoiceContent;
  existing?: Record<string, number>;
  onChange?: (answers: Record<string, number>) => void;
  readonly?: boolean;
}) {
  const [answers, setAnswers] = useState<Record<string, number>>(existing || {});

  function handleSelect(qId: string, optionIndex: number) {
    if (readonly) return;
    const updated = { ...answers, [qId]: optionIndex };
    setAnswers(updated);
    onChange?.(updated);
  }

  return (
    <div className="space-y-4">
      {content.questions.map((q, qi) => (
        <div key={q.id} className="space-y-2">
          <p className="text-sm font-medium whitespace-pre-wrap">{qi + 1}. {q.question}</p>
          <div className="space-y-1.5">
            {q.options.map((opt, oi) => {
              const selected = answers[q.id] === oi;
              const isCorrectOption = oi === q.correctIndex;
              let optClasses = "border-muted hover:border-primary/40";
              if (readonly) {
                if (isCorrectOption) optClasses = "border-green-300 bg-green-50 text-green-700";
                else if (selected) optClasses = "border-red-300 bg-red-50 text-red-700";
                else optClasses = "border-muted opacity-60";
              } else if (selected) {
                optClasses = "border-primary bg-primary/5";
              }
              return (
                <label
                  key={oi}
                  className={`flex items-center gap-2 p-2.5 rounded-lg border text-sm cursor-pointer ${optClasses} ${readonly ? "cursor-default" : ""}`}
                >
                  <input
                    type="radio"
                    name={`mc-${q.id}`}
                    checked={selected}
                    onChange={() => handleSelect(q.id, oi)}
                    disabled={readonly}
                  />
                  <span className="flex-1">{opt}</span>
                  {readonly && isCorrectOption && <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />}
                </label>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function OpenQuestionsActivity({
  content,
  existing,
  onChange,
  readonly,
}: {
  content: OpenQuestionsContent;
  existing?: Record<string, string>;
  onChange?: (answers: Record<string, string>) => void;
  readonly?: boolean;
}) {
  const [answers, setAnswers] = useState<Record<string, string>>(existing || {});

  function handleAnswer(id: string, value: string) {
    if (readonly) return;
    const updated = { ...answers, [id]: value };
    setAnswers(updated);
    onChange?.(updated);
  }

  return (
    <div className="space-y-4">
      {content.questions.map((q, qi) => (
        <div key={q.id} className="space-y-1.5">
          <p className="text-sm font-medium whitespace-pre-wrap">{qi + 1}. {q.question}</p>
          {readonly ? (
            <div className="bg-muted/40 rounded-lg p-3 text-sm whitespace-pre-wrap">
              {answers[q.id] || "(Sin respuesta)"}
            </div>
          ) : (
            <Textarea
              value={answers[q.id] || ""}
              onChange={(e) => handleAnswer(q.id, e.target.value)}
              placeholder="Escribe tu respuesta aquí..."
              rows={3}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function WritingActivityComp({
  content,
  existing,
  onChange,
  readonly,
}: {
  content: WritingContent;
  existing?: string;
  onChange?: (text: string) => void;
  readonly?: boolean;
}) {
  const [text, setText] = useState(existing || "");
  const words = countWords(text);

  function handleChange(val: string) {
    setText(val);
    onChange?.(val);
  }

  return (
    <div className="space-y-3">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <p className="text-sm font-medium text-green-800 whitespace-pre-wrap">{content.prompt}</p>
        <p className="text-xs text-green-600 mt-1">
          {content.min_words > 0 && `Mín. ${content.min_words} palabras`}
          {content.min_words > 0 && content.max_words > 0 && " · "}
          {content.max_words > 0 && `Máx. ${content.max_words} palabras`}
        </p>
      </div>
      {readonly ? (
        <div className="bg-muted/40 rounded-lg p-4 text-sm whitespace-pre-wrap">
          {text || "(Sin respuesta)"}
        </div>
      ) : (
        <div>
          <Textarea
            value={text}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="Escribe tu respuesta aquí..."
            rows={8}
            className="resize-none"
          />
          <div className={`text-xs mt-1 text-right ${
            words < content.min_words ? "text-amber-600" :
            words > content.max_words ? "text-red-600" :
            "text-green-600"
          }`}>
            {words} palabra{words !== 1 ? "s" : ""}
            {content.min_words > 0 && ` (mín. ${content.min_words})`}
          </div>
        </div>
      )}
    </div>
  );
}

// --- Main component ---

const SalonActividades = () => {
  const { salonId } = useParams<{ salonId: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [activeActivity, setActiveActivity] = useState<Actividad | null>(null);
  const [matchingAnswers, setMatchingAnswers] = useState<Record<string, string>>({});
  const [fillAnswers, setFillAnswers] = useState<Record<string, string>>({});
  const [mcAnswers, setMcAnswers] = useState<Record<string, number>>({});
  const [writingText, setWritingText] = useState("");
  const [openAnswers, setOpenAnswers] = useState<Record<string, string>>({});
  const [viewingEntrega, setViewingEntrega] = useState<Entrega | null>(null);

  const { data: salon } = useQuery({
    queryKey: ["salon-detail-act", salonId],
    queryFn: async () => {
      const { data, error } = await supabase.from("salones").select("id, nombre").eq("id", salonId!).single();
      if (error) throw error;
      return data;
    },
    enabled: !!salonId,
  });

  const { data: actividades = [] } = useQuery({
    queryKey: ["salon-actividades-student", salonId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("salon_actividades")
        .select("*")
        .eq("salon_id", salonId!)
        .eq("activo", true)
        .order("order_index", { ascending: true });
      if (error) throw error;
      return data as Actividad[];
    },
    enabled: !!salonId,
  });

  const { data: myEntregas = [] } = useQuery({
    queryKey: ["my-entregas", salonId, user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("salon_entregas")
        .select("id, actividad_id, puntaje_obtenido, comentario_docente, estado, respuestas")
        .eq("salon_id", salonId!)
        .eq("estudiante_id", user!.id);
      if (error) throw error;
      return data as Entrega[];
    },
    enabled: !!salonId && !!user?.id,
  });

  const { data: leaderboard = [] } = useQuery({
    queryKey: ["salon-leaderboard", salonId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("salon_entregas")
        .select("estudiante_id, puntaje_obtenido, usuarios(nombre, email)")
        .eq("salon_id", salonId!)
        .eq("estado", "calificado");
      if (error) throw error;

      const map = new Map<string, LeaderboardEntry>();
      for (const row of (data || [])) {
        const usuario = row.usuarios as { nombre: string | null; email: string } | null;
        const existing = map.get(row.estudiante_id);
        const entry: LeaderboardEntry = existing || {
          estudiante_id: row.estudiante_id,
          nombre: usuario?.nombre ?? null,
          email: usuario?.email ?? "",
          total: 0,
        };
        entry.total += (row.puntaje_obtenido as number) ?? 0;
        map.set(row.estudiante_id, entry);
      }
      return [...map.values()].sort((a, b) => b.total - a.total);
    },
    enabled: !!salonId,
  });

  const submitMutation = useMutation({
    mutationFn: async ({
      actividadId, respuestas, puntajeObtenido, autoGraded,
    }: {
      actividadId: string;
      respuestas: Record<string, unknown>;
      puntajeObtenido?: number;
      autoGraded: boolean;
    }) => {
      const payload: Record<string, unknown> = {
        actividad_id: actividadId,
        salon_id: salonId,
        estudiante_id: user!.id,
        respuestas,
        estado: autoGraded ? "calificado" : "entregado",
      };
      if (autoGraded && puntajeObtenido !== undefined) {
        payload.puntaje_obtenido = puntajeObtenido;
        payload.fecha_calificacion = new Date().toISOString();
      }
      const { error } = await supabase
        .from("salon_entregas")
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .upsert(payload as any, { onConflict: "actividad_id,estudiante_id" });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-entregas", salonId, user?.id] });
      queryClient.invalidateQueries({ queryKey: ["salon-leaderboard", salonId] });
      toast.success("¡Actividad entregada!");
      setActiveActivity(null);
    },
    onError: () => toast.error("Error al entregar la actividad"),
  });

  function openActivity(actividad: Actividad) {
    const existing = myEntregas.find((e) => e.actividad_id === actividad.id);
    if (existing) {
      setViewingEntrega(existing);
      setActiveActivity(actividad);
    } else {
      setMatchingAnswers({});
      setFillAnswers({});
      setMcAnswers({});
      setWritingText("");
      setOpenAnswers({});
      setActiveActivity(actividad);
      setViewingEntrega(null);
    }
  }

  function handleSubmit() {
    if (!activeActivity || !user) return;

    if (activeActivity.tipo === "multiple_matching") {
      const content = activeActivity.contenido as MatchingContent;
      if (content.pairs.some((p) => !matchingAnswers[p.id])) {
        toast.error("Conecta todos los pares antes de enviar");
        return;
      }
      const score = scoreMatching(content.pairs, matchingAnswers, activeActivity.puntaje_maximo);
      submitMutation.mutate({
        actividadId: activeActivity.id,
        respuestas: { matches: matchingAnswers },
        puntajeObtenido: score,
        autoGraded: true,
      });
    } else if (activeActivity.tipo === "fill_blanks") {
      const content = activeActivity.contenido as FillBlanksContent;
      if (content.blanks.some((b) => !fillAnswers[b.id]?.trim())) {
        toast.error("Completa todos los espacios antes de enviar");
        return;
      }
      const score = scoreFillBlanks(content.blanks, fillAnswers, activeActivity.puntaje_maximo);
      submitMutation.mutate({
        actividadId: activeActivity.id,
        respuestas: { answers: fillAnswers },
        puntajeObtenido: score,
        autoGraded: true,
      });
    } else if (activeActivity.tipo === "multiple_choice") {
      const content = activeActivity.contenido as MultipleChoiceContent;
      if (content.questions.some((q) => mcAnswers[q.id] === undefined)) {
        toast.error("Responde todas las preguntas antes de enviar");
        return;
      }
      const score = scoreMultipleChoice(content.questions, mcAnswers, activeActivity.puntaje_maximo);
      submitMutation.mutate({
        actividadId: activeActivity.id,
        respuestas: { answers: mcAnswers },
        puntajeObtenido: score,
        autoGraded: true,
      });
    } else if (activeActivity.tipo === "writing") {
      const content = activeActivity.contenido as WritingContent;
      const words = countWords(writingText);
      if (!writingText.trim()) { toast.error("Escribe tu respuesta antes de enviar"); return; }
      if (content.min_words > 0 && words < content.min_words) {
        toast.error(`Tu respuesta debe tener al menos ${content.min_words} palabras (tienes ${words})`);
        return;
      }
      submitMutation.mutate({
        actividadId: activeActivity.id,
        respuestas: { text: writingText },
        autoGraded: false,
      });
    } else if (activeActivity.tipo === "open_questions") {
      const content = activeActivity.contenido as OpenQuestionsContent;
      if (content.questions.some((q) => !openAnswers[q.id]?.trim())) {
        toast.error("Responde todas las preguntas antes de enviar");
        return;
      }
      submitMutation.mutate({
        actividadId: activeActivity.id,
        respuestas: { answers: openAnswers },
        autoGraded: false,
      });
    }
  }

  const myScore = myEntregas
    .filter((e) => e.estado === "calificado")
    .reduce((s, e) => s + (e.puntaje_obtenido ?? 0), 0);

  const myRank = leaderboard.findIndex((e) => e.estudiante_id === user?.id) + 1;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link to={`/salon/${salonId}`}>
          <Button variant="ghost" size="sm">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Volver al salón
          </Button>
        </Link>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-primary" />
            Actividades
          </h1>
          {salon && <p className="text-sm text-muted-foreground mt-1">{salon.nombre}</p>}
        </div>
        {myScore > 0 && (
          <div className="text-right">
            <div className="flex items-center gap-1 justify-end">
              <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
              <span className="font-bold text-primary text-lg">{myScore} pts</span>
            </div>
            {myRank > 0 && (
              <p className="text-xs text-muted-foreground">Posición #{myRank} en el ranking</p>
            )}
          </div>
        )}
      </div>

      <Tabs defaultValue="actividades">
        <TabsList className="mb-6">
          <TabsTrigger value="actividades">Mis actividades</TabsTrigger>
          <TabsTrigger value="ranking">
            <Trophy className="h-4 w-4 mr-1" />
            Ranking
          </TabsTrigger>
        </TabsList>

        <TabsContent value="actividades" className="space-y-3">
          {actividades.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="py-10 text-center text-muted-foreground">
                <ClipboardList className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p>No hay actividades disponibles aún.</p>
              </CardContent>
            </Card>
          )}
          {actividades.map((actividad) => {
            const entrega = myEntregas.find((e) => e.actividad_id === actividad.id);
            const Icon = TIPO_ICONS[actividad.tipo];
            return (
              <Card key={actividad.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">{actividad.titulo}</span>
                      <Badge variant="secondary" className={`text-xs ${TIPO_COLORS[actividad.tipo]}`}>
                        {TIPO_LABELS[actividad.tipo]}
                      </Badge>
                    </div>
                    {actividad.instrucciones && (
                      <p className="text-sm text-muted-foreground mt-0.5 truncate">{actividad.instrucciones}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Vale: <span className="font-semibold text-primary">{actividad.puntaje_maximo} pts</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {entrega ? (
                      <>
                        {entrega.estado === "calificado" ? (
                          <div className="text-right">
                            <span className="font-bold text-primary">
                              {entrega.puntaje_obtenido}/{actividad.puntaje_maximo}
                            </span>
                            <p className="text-xs text-green-600">Calificado</p>
                          </div>
                        ) : (
                          <Badge variant="outline" className="text-amber-600 border-amber-300">
                            <Clock className="h-3 w-3 mr-1" />
                            En revisión
                          </Badge>
                        )}
                        <Button variant="outline" size="sm" onClick={() => openActivity(actividad)}>
                          Ver
                        </Button>
                      </>
                    ) : (
                      <Button size="sm" onClick={() => openActivity(actividad)}>
                        Iniciar
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="ranking">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-500" />
                Top del salón
              </CardTitle>
            </CardHeader>
            <CardContent>
              {leaderboard.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aún no hay calificaciones registradas.</p>
              ) : (
                <div className="space-y-2">
                  {leaderboard.map((entry, i) => {
                    const isMe = entry.estudiante_id === user?.id;
                    return (
                      <div
                        key={entry.estudiante_id}
                        className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${
                          isMe ? "ring-2 ring-primary bg-primary/5" :
                          i === 0 ? "bg-amber-50 border border-amber-200" :
                          i === 1 ? "bg-slate-50 border border-slate-200" :
                          i === 2 ? "bg-orange-50 border border-orange-200" :
                          "bg-muted/30"
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                          i === 0 ? "bg-amber-400 text-white" :
                          i === 1 ? "bg-slate-400 text-white" :
                          i === 2 ? "bg-orange-400 text-white" :
                          "bg-muted text-muted-foreground"
                        }`}>
                          {i + 1}
                        </div>
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                          <User className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {entry.nombre || entry.email}
                            {isMe && <span className="text-primary text-xs ml-2">(tú)</span>}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                          <span className="font-bold text-primary">{entry.total} pts</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Activity dialog */}
      <Dialog open={!!activeActivity} onOpenChange={(open) => !open && setActiveActivity(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {activeActivity && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 flex-wrap">
                  <DialogTitle>{activeActivity.titulo}</DialogTitle>
                  <Badge variant="secondary" className={`text-xs ${TIPO_COLORS[activeActivity.tipo]}`}>
                    {TIPO_LABELS[activeActivity.tipo]}
                  </Badge>
                </div>
                {activeActivity.instrucciones && (
                  <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{activeActivity.instrucciones}</p>
                )}
              </DialogHeader>

              <div className="mt-4 space-y-4">
                {viewingEntrega ? (
                  // Readonly view of submitted activity
                  <div className="space-y-4">
                    {activeActivity.tipo === "multiple_matching" && (
                      <MatchingActivity
                        content={activeActivity.contenido as MatchingContent}
                        existing={(viewingEntrega.respuestas as { matches?: Record<string, string> }).matches}
                        readonly
                      />
                    )}
                    {activeActivity.tipo === "fill_blanks" && (
                      <FillBlanksActivity
                        content={activeActivity.contenido as FillBlanksContent}
                        existing={(viewingEntrega.respuestas as { answers?: Record<string, string> }).answers}
                        readonly
                      />
                    )}
                    {activeActivity.tipo === "multiple_choice" && (
                      <MultipleChoiceActivity
                        content={activeActivity.contenido as MultipleChoiceContent}
                        existing={(viewingEntrega.respuestas as { answers?: Record<string, number> }).answers}
                        readonly
                      />
                    )}
                    {activeActivity.tipo === "writing" && (
                      <WritingActivityComp
                        content={activeActivity.contenido as WritingContent}
                        existing={(viewingEntrega.respuestas as { text?: string }).text}
                        readonly
                      />
                    )}
                    {activeActivity.tipo === "open_questions" && (
                      <OpenQuestionsActivity
                        content={activeActivity.contenido as OpenQuestionsContent}
                        existing={(viewingEntrega.respuestas as { answers?: Record<string, string> }).answers}
                        readonly
                      />
                    )}

                    {/* Score / feedback section */}
                    <div className="border-t pt-4">
                      {viewingEntrega.estado === "calificado" ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                            <span className="font-semibold">
                              Puntaje: {viewingEntrega.puntaje_obtenido}/{activeActivity.puntaje_maximo} pts
                            </span>
                          </div>
                          {viewingEntrega.comentario_docente && (
                            <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-sm">
                              <p className="font-medium text-blue-800 mb-1">Comentario del docente:</p>
                              <p className="text-blue-700">{viewingEntrega.comentario_docente}</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-amber-600">
                          <Clock className="h-4 w-4" />
                          <span className="text-sm">Tu entrega está siendo revisada por el docente.</span>
                        </div>
                      )}
                    </div>
                    <div className="flex justify-end">
                      <Button variant="outline" onClick={() => setActiveActivity(null)}>Cerrar</Button>
                    </div>
                  </div>
                ) : (
                  // Interactive activity
                  <div className="space-y-4">
                    {activeActivity.tipo === "multiple_matching" && (
                      <MatchingActivity
                        content={activeActivity.contenido as MatchingContent}
                        onChange={setMatchingAnswers}
                      />
                    )}
                    {activeActivity.tipo === "fill_blanks" && (
                      <FillBlanksActivity
                        content={activeActivity.contenido as FillBlanksContent}
                        onChange={setFillAnswers}
                      />
                    )}
                    {activeActivity.tipo === "multiple_choice" && (
                      <MultipleChoiceActivity
                        content={activeActivity.contenido as MultipleChoiceContent}
                        onChange={setMcAnswers}
                      />
                    )}
                    {activeActivity.tipo === "writing" && (
                      <WritingActivityComp
                        content={activeActivity.contenido as WritingContent}
                        onChange={setWritingText}
                      />
                    )}
                    {activeActivity.tipo === "open_questions" && (
                      <OpenQuestionsActivity
                        content={activeActivity.contenido as OpenQuestionsContent}
                        onChange={setOpenAnswers}
                      />
                    )}
                    <div className="flex justify-end gap-2 border-t pt-4">
                      <Button variant="outline" onClick={() => setActiveActivity(null)}>Cancelar</Button>
                      <Button onClick={handleSubmit} disabled={submitMutation.isPending}>
                        {submitMutation.isPending ? "Enviando..." : "Entregar actividad"}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SalonActividades;
