import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  Plus, Edit, Trash2, ChevronLeft, ClipboardList,
  Shuffle, PenLine, AlignLeft, X, GripVertical,
  FileText, ClipboardCheck, ListChecks, HelpCircle,
  Sparkles, Copy, ClipboardPaste,
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
type ActivityContent = MatchingContent | FillBlanksContent | MultipleChoiceContent | WritingContent | OpenQuestionsContent;

type Actividad = {
  id: string;
  salon_id: string;
  titulo: string;
  instrucciones: string | null;
  tipo: ActivityType;
  contenido: ActivityContent;
  puntaje_maximo: number;
  activo: boolean;
  order_index: number;
};

const TIPO_LABELS: Record<ActivityType, string> = {
  multiple_matching: "Multiple Matching",
  fill_blanks: "Fill in the Blanks",
  multiple_choice: "Multiple Choice",
  writing: "Writing",
  open_questions: "Preguntas Abiertas",
};

const TIPO_ICONS: Record<ActivityType, React.ElementType> = {
  multiple_matching: Shuffle,
  fill_blanks: AlignLeft,
  multiple_choice: ListChecks,
  writing: PenLine,
  open_questions: HelpCircle,
};

const TIPO_COLORS: Record<ActivityType, string> = {
  multiple_matching: "bg-blue-100 text-blue-700",
  fill_blanks: "bg-amber-100 text-amber-700",
  multiple_choice: "bg-purple-100 text-purple-700",
  writing: "bg-green-100 text-green-700",
  open_questions: "bg-rose-100 text-rose-700",
};

const emptyForm = {
  titulo: "",
  instrucciones: "",
  tipo: "multiple_matching" as ActivityType,
  puntaje_maximo: 10,
};

const emptyMatching: MatchingContent = { pairs: [{ id: "1", left: "", right: "" }] };
const emptyFillBlanks: FillBlanksContent = { template: "", blanks: [] };
const emptyWriting: WritingContent = { prompt: "", min_words: 50, max_words: 300 };

function getDefaultContent(tipo: ActivityType): ActivityContent {
  if (tipo === "multiple_matching") return { ...emptyMatching, pairs: [{ id: Date.now().toString(), left: "", right: "" }] };
  if (tipo === "fill_blanks") return { template: "", blanks: [] };
  if (tipo === "multiple_choice") {
    return { questions: [{ id: Date.now().toString(), question: "", options: ["", ""], correctIndex: 0 }] };
  }
  if (tipo === "open_questions") return { questions: [{ id: Date.now().toString(), question: "" }] };
  return { prompt: "", min_words: 50, max_words: 300 };
}

function parseBlanksFromTemplate(template: string, existing: BlankItem[]): BlankItem[] {
  const count = (template.match(/___/g) || []).length;
  const result: BlankItem[] = [];
  for (let i = 0; i < count; i++) {
    result.push(existing[i] || { id: (i + 1).toString(), answer: "", options: "" });
  }
  return result;
}

const PROMPT_SCHEMAS: Record<ActivityType, string> = {
  multiple_matching: `{
  "titulo": "string",
  "instrucciones": "string",
  "puntaje_maximo": number,
  "contenido": {
    "pairs": [
      { "id": "1", "left": "string", "right": "string" },
      { "id": "2", "left": "string", "right": "string" }
    ]
  }
}

Reglas:
- "id" es un string incremental único para cada par ("1", "2", "3"...).
- "left" y "right" deben corresponder a la pareja correcta (palabra-definición, pregunta-respuesta, sinónimo, etc., según el tema).
- No repitas pares ni dejes campos vacíos.`,
  fill_blanks: `{
  "titulo": "string",
  "instrucciones": "string",
  "puntaje_maximo": number,
  "contenido": {
    "template": "texto con ___ en cada espacio que el estudiante debe completar",
    "blanks": [
      { "id": "1", "answer": "respuesta correcta del primer espacio", "options": "opcion1, opcion2, opcion3" }
    ]
  }
}

Reglas:
- Usa exactamente tres guiones bajos "___" en el texto para marcar cada espacio.
- El array "blanks" debe tener un elemento por cada "___" del template, en el mismo orden.
- "options" es opcional: déjalo como "" si quieres que el estudiante escriba libremente, o pon 2-4 alternativas separadas por coma si quieres opción múltiple.`,
  multiple_choice: `{
  "titulo": "string",
  "instrucciones": "string",
  "puntaje_maximo": number,
  "contenido": {
    "questions": [
      { "id": "1", "question": "string", "options": ["opción A", "opción B", "opción C"], "correctIndex": 0 }
    ]
  }
}

Reglas:
- "correctIndex" es el índice (empezando en 0) de la opción correcta dentro del array "options".
- Cada pregunta debe tener entre 2 y 5 opciones.
- No repitas preguntas.`,
  writing: `{
  "titulo": "string",
  "instrucciones": "string",
  "puntaje_maximo": number,
  "contenido": {
    "prompt": "consigna de escritura para el estudiante",
    "min_words": number,
    "max_words": number
  }
}

Reglas:
- "prompt" debe ser claro y motivar al estudiante a escribir sobre el tema indicado.
- Ajusta "min_words" y "max_words" según el nivel (ej. principiante 30-100, intermedio 80-200, avanzado 150-400).`,
  open_questions: `{
  "titulo": "string",
  "instrucciones": "string",
  "puntaje_maximo": number,
  "contenido": {
    "questions": [
      { "id": "1", "question": "string" }
    ]
  }
}

Reglas:
- Cada pregunta debe ser abierta (no de opción múltiple) y fomentar respuestas en inglés.
- No repitas preguntas.`,
};

function getPromptForTipo(tipo: ActivityType): string {
  return `Eres un generador de contenido educativo para una academia de inglés. Genera el contenido de una actividad de tipo "${TIPO_LABELS[tipo]}" para un salón de estudiantes.

TEMA / NIVEL / CANTIDAD DE ITEMS (modifica esta línea con lo que necesites):
[ESCRIBE AQUÍ EL TEMA, EL NIVEL Y LA CANTIDAD DE ITEMS QUE QUIERES]

Devuélveme ÚNICAMENTE un JSON válido, sin explicaciones, sin comentarios y sin bloques de código (no uses comillas triples), con exactamente esta estructura:

${PROMPT_SCHEMAS[tipo]}`;
}

function normalizeContent(tipo: ActivityType, raw: any): ActivityContent { // eslint-disable-line @typescript-eslint/no-explicit-any
  if (tipo === "multiple_matching") {
    const pairs = Array.isArray(raw?.pairs) ? raw.pairs : [];
    return {
      pairs: pairs.map((p: any, i: number) => ({ // eslint-disable-line @typescript-eslint/no-explicit-any
        id: p?.id ? String(p.id) : String(i + 1),
        left: String(p?.left ?? ""),
        right: String(p?.right ?? ""),
      })),
    };
  }
  if (tipo === "fill_blanks") {
    const template = String(raw?.template ?? "");
    const existing: BlankItem[] = Array.isArray(raw?.blanks)
      ? raw.blanks.map((b: any, i: number) => ({ // eslint-disable-line @typescript-eslint/no-explicit-any
          id: b?.id ? String(b.id) : String(i + 1),
          answer: String(b?.answer ?? ""),
          options: String(b?.options ?? ""),
        }))
      : [];
    return { template, blanks: parseBlanksFromTemplate(template, existing) };
  }
  if (tipo === "multiple_choice") {
    const questions = Array.isArray(raw?.questions) ? raw.questions : [];
    return {
      questions: questions.map((q: any, i: number) => ({ // eslint-disable-line @typescript-eslint/no-explicit-any
        id: q?.id ? String(q.id) : String(i + 1),
        question: String(q?.question ?? ""),
        options: Array.isArray(q?.options) && q.options.length >= 2
          ? q.options.map((o: any) => String(o)) // eslint-disable-line @typescript-eslint/no-explicit-any
          : ["", ""],
        correctIndex: typeof q?.correctIndex === "number" ? q.correctIndex : 0,
      })),
    };
  }
  if (tipo === "open_questions") {
    const questions = Array.isArray(raw?.questions) ? raw.questions : [];
    return {
      questions: questions.map((q: any, i: number) => ({ // eslint-disable-line @typescript-eslint/no-explicit-any
        id: q?.id ? String(q.id) : String(i + 1),
        question: String(q?.question ?? ""),
      })),
    };
  }
  return {
    prompt: String(raw?.prompt ?? ""),
    min_words: typeof raw?.min_words === "number" ? raw.min_words : 50,
    max_words: typeof raw?.max_words === "number" ? raw.max_words : 300,
  };
}

const TeacherActividades = () => {
  const { salonId } = useParams<{ salonId: string }>();
  const queryClient = useQueryClient();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Actividad | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [content, setContent] = useState<ActivityContent>(emptyMatching);
  const [isPromptDialogOpen, setIsPromptDialogOpen] = useState(false);
  const [promptText, setPromptText] = useState("");
  const [jsonInput, setJsonInput] = useState("");

  const { data: salon } = useQuery({
    queryKey: ["teacher-salon-name", salonId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("salones")
        .select("id, nombre")
        .eq("id", salonId!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!salonId,
  });

  const { data: actividades = [], isLoading } = useQuery({
    queryKey: ["salon-actividades", salonId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("salon_actividades")
        .select("*")
        .eq("salon_id", salonId!)
        .order("order_index", { ascending: true });
      if (error) throw error;
      return data as Actividad[];
    },
    enabled: !!salonId,
  });

  const saveMutation = useMutation({
    mutationFn: async (payload: {
      titulo: string; instrucciones: string; tipo: ActivityType;
      contenido: ActivityContent; puntaje_maximo: number; salon_id: string;
      order_index: number; id?: string;
    }) => {
      if (editing) {
        const { error } = await supabase
          .from("salon_actividades")
          .update({
            titulo: payload.titulo,
            instrucciones: payload.instrucciones || null,
            tipo: payload.tipo,
            contenido: payload.contenido as any, // eslint-disable-line @typescript-eslint/no-explicit-any
            puntaje_maximo: payload.puntaje_maximo,
          })
          .eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("salon_actividades")
          .insert({
            salon_id: payload.salon_id,
            titulo: payload.titulo,
            instrucciones: payload.instrucciones || null,
            tipo: payload.tipo,
            contenido: payload.contenido as any, // eslint-disable-line @typescript-eslint/no-explicit-any
            puntaje_maximo: payload.puntaje_maximo,
            order_index: payload.order_index,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["salon-actividades", salonId] });
      toast.success(editing ? "Actividad actualizada" : "Actividad creada");
      closeDialog();
    },
    onError: () => toast.error("Error al guardar la actividad"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("salon_actividades").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["salon-actividades", salonId] });
      toast.success("Actividad eliminada");
    },
    onError: () => toast.error("Error al eliminar"),
  });

  const toggleActivaMutation = useMutation({
    mutationFn: async ({ id, activo }: { id: string; activo: boolean }) => {
      const { error } = await supabase.from("salon_actividades").update({ activo }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["salon-actividades", salonId] }),
  });

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setContent(getDefaultContent("multiple_matching"));
    setJsonInput("");
    setIsDialogOpen(true);
  }

  function openEdit(a: Actividad) {
    setEditing(a);
    setForm({
      titulo: a.titulo,
      instrucciones: a.instrucciones ?? "",
      tipo: a.tipo,
      puntaje_maximo: a.puntaje_maximo,
    });
    setContent(a.contenido);
    setJsonInput("");
    setIsDialogOpen(true);
  }

  function closeDialog() {
    setIsDialogOpen(false);
    setEditing(null);
    setJsonInput("");
  }

  function handleTipoChange(tipo: ActivityType) {
    setForm((f) => ({ ...f, tipo }));
    if (!editing) setContent(getDefaultContent(tipo));
    setJsonInput("");
  }

  function openPromptDialog() {
    setPromptText(getPromptForTipo(form.tipo));
    setIsPromptDialogOpen(true);
  }

  async function copyPrompt() {
    try {
      await navigator.clipboard.writeText(promptText);
      toast.success("Prompt copiado. Pégalo en Claude, edita el tema y luego pega aquí el JSON que te devuelva.");
    } catch {
      toast.error("No se pudo copiar automáticamente. Selecciona el texto y cópialo manualmente.");
    }
  }

  function handleLoadJson() {
    if (!jsonInput.trim()) { toast.error("Pega primero el JSON generado"); return; }
    let parsed: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    try {
      parsed = JSON.parse(jsonInput);
    } catch {
      toast.error("El JSON no es válido. Revisa que lo hayas copiado completo.");
      return;
    }
    setForm((f) => ({
      ...f,
      titulo: typeof parsed.titulo === "string" && parsed.titulo.trim() ? parsed.titulo : f.titulo,
      instrucciones: typeof parsed.instrucciones === "string" ? parsed.instrucciones : f.instrucciones,
      puntaje_maximo: typeof parsed.puntaje_maximo === "number" ? parsed.puntaje_maximo : f.puntaje_maximo,
    }));
    setContent(normalizeContent(form.tipo, parsed.contenido ?? parsed));
    toast.success("JSON cargado. Revisa el contenido antes de guardar.");
  }

  // --- Matching helpers ---
  function addPair() {
    const c = content as MatchingContent;
    setContent({ pairs: [...c.pairs, { id: Date.now().toString(), left: "", right: "" }] });
  }
  function removePair(id: string) {
    const c = content as MatchingContent;
    setContent({ pairs: c.pairs.filter((p) => p.id !== id) });
  }
  function updatePair(id: string, field: "left" | "right", value: string) {
    const c = content as MatchingContent;
    setContent({ pairs: c.pairs.map((p) => (p.id === id ? { ...p, [field]: value } : p)) });
  }

  // --- Fill blanks helpers ---
  function handleTemplateChange(template: string) {
    const c = content as FillBlanksContent;
    const blanks = parseBlanksFromTemplate(template, c.blanks);
    setContent({ template, blanks });
  }
  function updateBlank(id: string, field: "answer" | "options", value: string) {
    const c = content as FillBlanksContent;
    setContent({ ...c, blanks: c.blanks.map((b) => (b.id === id ? { ...b, [field]: value } : b)) });
  }

  // --- Multiple choice helpers ---
  function addMcQuestion() {
    const c = content as MultipleChoiceContent;
    setContent({ questions: [...c.questions, { id: Date.now().toString(), question: "", options: ["", ""], correctIndex: 0 }] });
  }
  function removeMcQuestion(id: string) {
    const c = content as MultipleChoiceContent;
    setContent({ questions: c.questions.filter((q) => q.id !== id) });
  }
  function updateMcQuestion(id: string, question: string) {
    const c = content as MultipleChoiceContent;
    setContent({ questions: c.questions.map((q) => (q.id === id ? { ...q, question } : q)) });
  }
  function addMcOption(qId: string) {
    const c = content as MultipleChoiceContent;
    setContent({ questions: c.questions.map((q) => (q.id === qId ? { ...q, options: [...q.options, ""] } : q)) });
  }
  function removeMcOption(qId: string, index: number) {
    const c = content as MultipleChoiceContent;
    setContent({
      questions: c.questions.map((q) => {
        if (q.id !== qId) return q;
        const options = q.options.filter((_, i) => i !== index);
        const correctIndex = q.correctIndex >= options.length ? 0 : q.correctIndex > index ? q.correctIndex - 1 : q.correctIndex;
        return { ...q, options, correctIndex };
      }),
    });
  }
  function updateMcOption(qId: string, index: number, value: string) {
    const c = content as MultipleChoiceContent;
    setContent({
      questions: c.questions.map((q) =>
        q.id === qId ? { ...q, options: q.options.map((o, i) => (i === index ? value : o)) } : q,
      ),
    });
  }
  function updateMcCorrect(qId: string, correctIndex: number) {
    const c = content as MultipleChoiceContent;
    setContent({ questions: c.questions.map((q) => (q.id === qId ? { ...q, correctIndex } : q)) });
  }

  // --- Open questions helpers ---
  function addOpenQuestion() {
    const c = content as OpenQuestionsContent;
    setContent({ questions: [...c.questions, { id: Date.now().toString(), question: "" }] });
  }
  function removeOpenQuestion(id: string) {
    const c = content as OpenQuestionsContent;
    setContent({ questions: c.questions.filter((q) => q.id !== id) });
  }
  function updateOpenQuestion(id: string, question: string) {
    const c = content as OpenQuestionsContent;
    setContent({ questions: c.questions.map((q) => (q.id === id ? { ...q, question } : q)) });
  }

  // --- Writing helpers ---
  function updateWriting(field: keyof WritingContent, value: string | number) {
    setContent((prev) => ({ ...(prev as WritingContent), [field]: value }));
  }

  function handleSave() {
    if (!form.titulo.trim()) { toast.error("El título es requerido"); return; }
    if (form.tipo === "multiple_matching") {
      const c = content as MatchingContent;
      if (c.pairs.length === 0 || c.pairs.some((p) => !p.left.trim() || !p.right.trim())) {
        toast.error("Completa todos los pares del matching"); return;
      }
    }
    if (form.tipo === "fill_blanks") {
      const c = content as FillBlanksContent;
      if (!c.template.trim()) { toast.error("El texto es requerido"); return; }
      if (c.blanks.length === 0) { toast.error("Agrega al menos un espacio en blanco (___)"); return; }
      if (c.blanks.some((b) => !b.answer.trim())) { toast.error("Completa la respuesta de cada espacio"); return; }
    }
    if (form.tipo === "multiple_choice") {
      const c = content as MultipleChoiceContent;
      if (c.questions.length === 0) { toast.error("Agrega al menos una pregunta"); return; }
      for (const q of c.questions) {
        if (!q.question.trim()) { toast.error("Completa el enunciado de cada pregunta"); return; }
        if (q.options.length < 2 || q.options.some((o) => !o.trim())) {
          toast.error("Cada pregunta necesita al menos 2 opciones completas"); return;
        }
      }
    }
    if (form.tipo === "writing") {
      const c = content as WritingContent;
      if (!c.prompt.trim()) { toast.error("El enunciado es requerido"); return; }
    }
    if (form.tipo === "open_questions") {
      const c = content as OpenQuestionsContent;
      if (c.questions.length === 0) { toast.error("Agrega al menos una pregunta"); return; }
      if (c.questions.some((q) => !q.question.trim())) { toast.error("Completa el enunciado de cada pregunta"); return; }
    }
    saveMutation.mutate({
      salon_id: salonId!,
      titulo: form.titulo.trim(),
      instrucciones: form.instrucciones.trim(),
      tipo: form.tipo,
      contenido: content,
      puntaje_maximo: form.puntaje_maximo,
      order_index: actividades.length,
    });
  }

  if (isLoading) {
    return <div className="p-8 text-muted-foreground">Cargando actividades...</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link to={`/teacher/salon/${salonId}`}>
          <Button variant="ghost" size="sm">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Volver al salón
          </Button>
        </Link>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-primary" />
            Actividades
          </h1>
          {salon && <p className="text-sm text-muted-foreground mt-1">{salon.nombre}</p>}
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva actividad
        </Button>
      </div>

      {/* Sub-navigation */}
      <div className="flex gap-2 mb-6 border-b pb-3">
        <Link to={`/teacher/salon/${salonId}`}>
          <Button variant="ghost" size="sm" className="gap-2">
            <FileText className="h-4 w-4" />
            Contenido
          </Button>
        </Link>
        <Link to={`/teacher/actividades/${salonId}`}>
          <Button variant="secondary" size="sm" className="gap-2">
            <ClipboardList className="h-4 w-4" />
            Actividades
          </Button>
        </Link>
        <Link to={`/teacher/calificaciones/${salonId}`}>
          <Button variant="ghost" size="sm" className="gap-2">
            <ClipboardCheck className="h-4 w-4" />
            Calificaciones
          </Button>
        </Link>
      </div>

      {/* Activity list */}
      {actividades.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center text-muted-foreground">
            <ClipboardList className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p>No hay actividades aún.</p>
            <p className="text-sm mt-1">Crea la primera actividad para este salón.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {actividades.map((a) => {
            const Icon = TIPO_ICONS[a.tipo];
            return (
              <Card key={a.id} className={`transition-opacity ${!a.activo ? "opacity-60" : ""}`}>
                <CardContent className="p-4 flex items-center gap-4">
                  <GripVertical className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium truncate">{a.titulo}</span>
                      <Badge variant="secondary" className={`text-xs ${TIPO_COLORS[a.tipo]}`}>
                        {TIPO_LABELS[a.tipo]}
                      </Badge>
                      {!a.activo && <Badge variant="outline" className="text-xs">Inactiva</Badge>}
                    </div>
                    {a.instrucciones && (
                      <p className="text-sm text-muted-foreground truncate mt-0.5">{a.instrucciones}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Puntaje máximo: <span className="font-semibold text-primary">{a.puntaje_maximo} pts</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs"
                      onClick={() => toggleActivaMutation.mutate({ id: a.id, activo: !a.activo })}
                    >
                      {a.activo ? "Desactivar" : "Activar"}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => openEdit(a)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => {
                        if (confirm("¿Eliminar esta actividad? Se perderán todas las entregas.")) {
                          deleteMutation.mutate(a.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar actividad" : "Nueva actividad"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            {/* Basic fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Título *</Label>
                <Input
                  value={form.titulo}
                  onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))}
                  placeholder="Ej. Matching Unit 3 Vocabulary"
                />
              </div>
              <div>
                <Label>Tipo de actividad *</Label>
                <Select value={form.tipo} onValueChange={(v) => handleTipoChange(v as ActivityType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="multiple_matching">Multiple Matching</SelectItem>
                    <SelectItem value="fill_blanks">Fill in the Blanks</SelectItem>
                    <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                    <SelectItem value="writing">Writing</SelectItem>
                    <SelectItem value="open_questions">Preguntas Abiertas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Puntaje máximo *</Label>
                <Input
                  type="number"
                  min={1}
                  max={100}
                  value={form.puntaje_maximo}
                  onChange={(e) => setForm((f) => ({ ...f, puntaje_maximo: parseInt(e.target.value) || 10 }))}
                />
              </div>
              <div className="col-span-2">
                <Label>Instrucciones (opcional)</Label>
                <Textarea
                  value={form.instrucciones}
                  onChange={(e) => setForm((f) => ({ ...f, instrucciones: e.target.value }))}
                  placeholder="Instrucciones para el estudiante..."
                  rows={2}
                />
              </div>
            </div>

            {/* AI-assisted content generation */}
            <div className="border rounded-lg p-3 bg-primary/5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Generar contenido con IA
                </div>
                <Button variant="outline" size="sm" onClick={openPromptDialog}>
                  <Copy className="h-3 w-3 mr-1" /> Ver prompt
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Copia el prompt para "{TIPO_LABELS[form.tipo]}", edítalo con tu tema en Claude (o similar) y pega aquí el JSON que te devuelva.
              </p>
              <Textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder="Pega aquí el JSON generado por la IA..."
                rows={3}
                className="text-xs font-mono"
              />
              <div className="flex justify-end">
                <Button size="sm" variant="secondary" onClick={handleLoadJson}>
                  <ClipboardPaste className="h-3 w-3 mr-1" /> Cargar JSON
                </Button>
              </div>
            </div>

            {/* Type-specific content builder */}
            <div className="border rounded-lg p-4 bg-muted/30">
              {form.tipo === "multiple_matching" && (
                <MatchingBuilder
                  content={content as MatchingContent}
                  onAddPair={addPair}
                  onRemovePair={removePair}
                  onUpdatePair={updatePair}
                />
              )}
              {form.tipo === "fill_blanks" && (
                <FillBlanksBuilder
                  content={content as FillBlanksContent}
                  onTemplateChange={handleTemplateChange}
                  onUpdateBlank={updateBlank}
                />
              )}
              {form.tipo === "multiple_choice" && (
                <MultipleChoiceBuilder
                  content={content as MultipleChoiceContent}
                  onAddQuestion={addMcQuestion}
                  onRemoveQuestion={removeMcQuestion}
                  onUpdateQuestion={updateMcQuestion}
                  onAddOption={addMcOption}
                  onRemoveOption={removeMcOption}
                  onUpdateOption={updateMcOption}
                  onSetCorrect={updateMcCorrect}
                />
              )}
              {form.tipo === "writing" && (
                <WritingBuilder
                  content={content as WritingContent}
                  onUpdate={updateWriting}
                />
              )}
              {form.tipo === "open_questions" && (
                <OpenQuestionsBuilder
                  content={content as OpenQuestionsContent}
                  onAddQuestion={addOpenQuestion}
                  onRemoveQuestion={removeOpenQuestion}
                  onUpdateQuestion={updateOpenQuestion}
                />
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={closeDialog}>Cancelar</Button>
              <Button onClick={handleSave} disabled={saveMutation.isPending}>
                {saveMutation.isPending ? "Guardando..." : editing ? "Guardar cambios" : "Crear actividad"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* AI Prompt Dialog */}
      <Dialog open={isPromptDialogOpen} onOpenChange={setIsPromptDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Prompt para {TIPO_LABELS[form.tipo]}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Edita la línea del tema con lo que necesites, copia el prompt y pégalo en Claude. Luego copia el JSON que te devuelva y pégalo en el campo "Pegar aquí el JSON generado por la IA" de la actividad.
            </p>
            <Textarea
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              rows={16}
              className="text-xs font-mono"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsPromptDialogOpen(false)}>Cerrar</Button>
              <Button onClick={copyPrompt}>
                <Copy className="h-4 w-4 mr-2" /> Copiar prompt
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// --- Sub-components for content builders ---

function MatchingBuilder({
  content,
  onAddPair,
  onRemovePair,
  onUpdatePair,
}: {
  content: MatchingContent;
  onAddPair: () => void;
  onRemovePair: (id: string) => void;
  onUpdatePair: (id: string, field: "left" | "right", value: string) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-sm">Pares para hacer match</h3>
        <Button variant="outline" size="sm" onClick={onAddPair}>
          <Plus className="h-3 w-3 mr-1" /> Agregar par
        </Button>
      </div>
      <div className="grid grid-cols-[1fr,1fr,auto] gap-2 text-xs font-medium text-muted-foreground mb-1 px-1">
        <span>Columna izquierda</span>
        <span>Columna derecha</span>
        <span />
      </div>
      <div className="space-y-2">
        {content.pairs.map((pair, i) => (
          <div key={pair.id} className="grid grid-cols-[1fr,1fr,auto] gap-2 items-center">
            <Input
              value={pair.left}
              onChange={(e) => onUpdatePair(pair.id, "left", e.target.value)}
              placeholder={`Ítem ${i + 1}`}
            />
            <Input
              value={pair.right}
              onChange={(e) => onUpdatePair(pair.id, "right", e.target.value)}
              placeholder={`Match ${i + 1}`}
            />
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive hover:text-destructive h-8 w-8"
              onClick={() => onRemovePair(pair.id)}
              disabled={content.pairs.length === 1}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

function FillBlanksBuilder({
  content,
  onTemplateChange,
  onUpdateBlank,
}: {
  content: FillBlanksContent;
  onTemplateChange: (t: string) => void;
  onUpdateBlank: (id: string, field: "answer" | "options", value: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <Label className="font-medium">
          Texto con espacios en blanco *
          <span className="text-muted-foreground font-normal ml-2 text-xs">
            Usa ___ (tres guiones) para cada espacio
          </span>
        </Label>
        <Textarea
          value={content.template}
          onChange={(e) => onTemplateChange(e.target.value)}
          placeholder="Ej: The cat ___ on the ___ mat."
          rows={3}
          className="mt-1 font-mono text-sm"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Espacios detectados: <span className="font-semibold text-primary">{content.blanks.length}</span>
        </p>
      </div>
      {content.blanks.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Respuestas para cada espacio</h4>
          {content.blanks.map((blank, i) => (
            <div key={blank.id} className="flex gap-3 items-start">
              <div className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-2">
                {i + 1}
              </div>
              <div className="flex-1 grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Respuesta correcta *</Label>
                  <Input
                    value={blank.answer}
                    onChange={(e) => onUpdateBlank(blank.id, "answer", e.target.value)}
                    placeholder="Respuesta"
                    className="h-8 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs">Opciones (separadas por coma)</Label>
                  <Input
                    value={blank.options}
                    onChange={(e) => onUpdateBlank(blank.id, "options", e.target.value)}
                    placeholder="op1, op2, op3 (dejar vacío = texto libre)"
                    className="h-8 text-sm"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MultipleChoiceBuilder({
  content,
  onAddQuestion,
  onRemoveQuestion,
  onUpdateQuestion,
  onAddOption,
  onRemoveOption,
  onUpdateOption,
  onSetCorrect,
}: {
  content: MultipleChoiceContent;
  onAddQuestion: () => void;
  onRemoveQuestion: (id: string) => void;
  onUpdateQuestion: (id: string, question: string) => void;
  onAddOption: (qId: string) => void;
  onRemoveOption: (qId: string, index: number) => void;
  onUpdateOption: (qId: string, index: number, value: string) => void;
  onSetCorrect: (qId: string, correctIndex: number) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-sm">Preguntas de opción múltiple</h3>
        <Button variant="outline" size="sm" onClick={onAddQuestion}>
          <Plus className="h-3 w-3 mr-1" /> Agregar pregunta
        </Button>
      </div>
      <div className="space-y-4">
        {content.questions.map((q, qi) => (
          <div key={q.id} className="border rounded-lg p-3 bg-background space-y-2">
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-1.5">
                {qi + 1}
              </div>
              <Input
                value={q.question}
                onChange={(e) => onUpdateQuestion(q.id, e.target.value)}
                placeholder="Enunciado de la pregunta"
                className="flex-1"
              />
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive h-8 w-8 shrink-0"
                onClick={() => onRemoveQuestion(q.id)}
                disabled={content.questions.length === 1}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            <div className="pl-8 space-y-1.5">
              {q.options.map((opt, oi) => (
                <div key={oi} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`correct-${q.id}`}
                    checked={q.correctIndex === oi}
                    onChange={() => onSetCorrect(q.id, oi)}
                    title="Marcar como correcta"
                    className="shrink-0"
                  />
                  <Input
                    value={opt}
                    onChange={(e) => onUpdateOption(q.id, oi, e.target.value)}
                    placeholder={`Opción ${oi + 1}`}
                    className="h-8 text-sm flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive h-7 w-7 shrink-0"
                    onClick={() => onRemoveOption(q.id, oi)}
                    disabled={q.options.length === 2}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => onAddOption(q.id)}>
                <Plus className="h-3 w-3 mr-1" /> Agregar opción
              </Button>
              <p className="text-xs text-muted-foreground">Selecciona el radio button de la opción correcta.</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function OpenQuestionsBuilder({
  content,
  onAddQuestion,
  onRemoveQuestion,
  onUpdateQuestion,
}: {
  content: OpenQuestionsContent;
  onAddQuestion: () => void;
  onRemoveQuestion: (id: string) => void;
  onUpdateQuestion: (id: string, question: string) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-sm">Preguntas abiertas</h3>
        <Button variant="outline" size="sm" onClick={onAddQuestion}>
          <Plus className="h-3 w-3 mr-1" /> Agregar pregunta
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        El estudiante responderá con texto libre. Tú revisarás y asignarás el puntaje al corregir.
      </p>
      <div className="space-y-2">
        {content.questions.map((q, qi) => (
          <div key={q.id} className="flex items-start gap-2">
            <div className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-1.5">
              {qi + 1}
            </div>
            <Textarea
              value={q.question}
              onChange={(e) => onUpdateQuestion(q.id, e.target.value)}
              placeholder="Ej: ¿Qué harías si ganaras la lotería? Explica tu respuesta."
              rows={2}
              className="flex-1"
            />
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive hover:text-destructive h-8 w-8 shrink-0 mt-0.5"
              onClick={() => onRemoveQuestion(q.id)}
              disabled={content.questions.length === 1}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

function WritingBuilder({
  content,
  onUpdate,
}: {
  content: WritingContent;
  onUpdate: (field: keyof WritingContent, value: string | number) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <Label className="font-medium">Enunciado / Prompt *</Label>
        <Textarea
          value={content.prompt}
          onChange={(e) => onUpdate("prompt", e.target.value)}
          placeholder="Ej: Write a paragraph about your favorite hobby. Include at least 3 reasons why you enjoy it."
          rows={4}
          className="mt-1"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm">Mínimo de palabras</Label>
          <Input
            type="number"
            min={0}
            value={content.min_words}
            onChange={(e) => onUpdate("min_words", parseInt(e.target.value) || 0)}
            className="mt-1"
          />
        </div>
        <div>
          <Label className="text-sm">Máximo de palabras</Label>
          <Input
            type="number"
            min={1}
            value={content.max_words}
            onChange={(e) => onUpdate("max_words", parseInt(e.target.value) || 300)}
            className="mt-1"
          />
        </div>
      </div>
    </div>
  );
}

export default TeacherActividades;
