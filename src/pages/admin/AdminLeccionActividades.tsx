import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  Plus, Edit, Trash2, ChevronLeft, ClipboardList,
  Shuffle, AlignLeft, X, GripVertical, ListChecks,
  Sparkles, Copy, ClipboardPaste, SpellCheck, BookOpen, Headphones, Eye,
  CheckSquare, TextCursor, Wand2, GripHorizontal, ArrowUpDown, LayoutGrid,
} from "lucide-react";
import {
  PracticeActivityType, PracticeActivityContent, CursoActividad,
  MatchingContent, FillBlanksContent, MultipleChoiceContent, UseOfEnglishContent, ReadingContent, ListeningContent,
  MultipleChoiceClozeContent, OpenClozeContent, WordFormationContent,
  DragDropGapfillContent, ReorderContent, CategorizeContent,
  McQuestion, BlankItem, KeyWordItem, TIPO_LABELS, TIPO_COLORS, parseClozeGaps,
} from "@/components/activities/practiceActivity.types";
import {
  MultipleChoiceClozeBuilder, OpenClozeBuilder, WordFormationBuilder,
  DragDropGapfillBuilder, ReorderBuilder, CategorizeBuilder,
} from "@/components/activities/ActivityBuilders";
import { ActivityPreviewDialog } from "@/components/activities/ActivityPreview";

const TIPO_ICONS: Record<PracticeActivityType, React.ElementType> = {
  multiple_matching: Shuffle,
  fill_blanks: AlignLeft,
  multiple_choice: ListChecks,
  use_of_english: SpellCheck,
  reading: BookOpen,
  listening: Headphones,
  multiple_choice_cloze: CheckSquare,
  open_cloze: TextCursor,
  word_formation: Wand2,
  drag_drop_gapfill: GripHorizontal,
  drag_drop_reorder: ArrowUpDown,
  drag_drop_categorize: LayoutGrid,
};

const emptyForm = { titulo: "", instrucciones: "", tipo: "multiple_matching" as PracticeActivityType };
const emptyMatching: MatchingContent = { pairs: [{ id: "1", left: "", right: "" }] };

function parseBlanksFromTemplate(template: string, existing: BlankItem[]): BlankItem[] {
  const count = (template.match(/___/g) || []).length;
  const result: BlankItem[] = [];
  for (let i = 0; i < count; i++) {
    result.push(existing[i] || { id: (i + 1).toString(), answer: "", options: "" });
  }
  return result;
}

function getDefaultContent(tipo: PracticeActivityType): PracticeActivityContent {
  if (tipo === "multiple_matching") return { pairs: [{ id: Date.now().toString(), left: "", right: "" }] };
  if (tipo === "fill_blanks") return { template: "", blanks: [] };
  if (tipo === "multiple_choice") {
    return { questions: [{ id: Date.now().toString(), question: "", options: ["", ""], correctIndex: 0 }] };
  }
  if (tipo === "use_of_english") {
    return { items: [{ id: Date.now().toString(), sentence: "", keyword: "", gapPrefix: "", gapSuffix: "", answer: "" }] };
  }
  if (tipo === "reading") {
    return { passage: "", questions: [{ id: Date.now().toString(), question: "", options: ["", ""], correctIndex: 0 }] };
  }
  if (tipo === "listening") {
    return { audio_url: "", questions: [{ id: Date.now().toString(), question: "", options: ["", ""], correctIndex: 0 }] };
  }
  if (tipo === "multiple_choice_cloze") return { text: "", gaps: [] };
  if (tipo === "open_cloze") return { text: "", gaps: [] };
  if (tipo === "word_formation") return { text: "", gaps: [] };
  if (tipo === "drag_drop_gapfill") return { text: "", wordBank: [], gaps: [] };
  if (tipo === "drag_drop_reorder") return { items: [{ id: Date.now().toString(), text: "" }, { id: (Date.now() + 1).toString(), text: "" }] };
  return { categories: [{ id: Date.now().toString(), label: "" }], items: [] }; // drag_drop_categorize
}

const PROMPT_SCHEMAS: Record<PracticeActivityType, string> = {
  multiple_matching: `{
  "titulo": "string",
  "instrucciones": "string",
  "contenido": { "pairs": [{ "id": "1", "left": "string", "right": "string" }, { "id": "2", "left": "string", "right": "string" }] }
}
Reglas: "id" incremental único; "left"/"right" deben ser la pareja correcta; no repitas pares ni dejes campos vacíos.`,
  fill_blanks: `{
  "titulo": "string",
  "instrucciones": "string",
  "contenido": { "template": "texto con ___ en cada espacio", "blanks": [{ "id": "1", "answer": "respuesta correcta", "options": "opcion1, opcion2, opcion3" }] }
}
Reglas: usa "___" para cada espacio; un "blank" por cada "___" en el mismo orden; "options" vacío = texto libre.`,
  multiple_choice: `{
  "titulo": "string",
  "instrucciones": "string",
  "contenido": { "questions": [{ "id": "1", "question": "string", "options": ["opción A", "opción B", "opción C"], "correctIndex": 0 }] }
}
Reglas: "correctIndex" es el índice (desde 0) de la opción correcta; 2 a 5 opciones por pregunta; no repitas preguntas.`,
  use_of_english: `{
  "titulo": "string",
  "instrucciones": "string",
  "contenido": { "items": [{ "id": "1", "sentence": "oración original", "keyword": "PALABRA CLAVE", "gapPrefix": "texto antes del espacio", "gapSuffix": "texto después del espacio", "answer": "respuesta (2-6 palabras, incluye la keyword)" }] }
}
Reglas: formato Key Word Transformation de Cambridge; "gapPrefix" + [ESPACIO] + "gapSuffix" debe formar una oración natural con "answer".`,
  reading: `{
  "titulo": "string",
  "instrucciones": "string",
  "contenido": { "passage": "texto de lectura completo", "questions": [{ "id": "1", "question": "string", "options": ["opción A", "opción B", "opción C"], "correctIndex": 0 }] }
}
Reglas: preguntas de comprensión (idea principal, detalles, inferencia); "correctIndex" desde 0.`,
  listening: `{
  "titulo": "string",
  "instrucciones": "string",
  "contenido": { "audio_url": "", "questions": [{ "id": "1", "question": "string", "options": ["opción A", "opción B", "opción C"], "correctIndex": 0 }] }
}
Reglas: deja "audio_url" vacío (lo completarás manualmente); preguntas de comprensión auditiva; "correctIndex" desde 0.`,
  multiple_choice_cloze: `{
  "titulo": "string",
  "instrucciones": "string",
  "contenido": { "text": "texto con ___ en cada espacio numerado", "gaps": [{ "id": "1", "options": ["opción A", "opción B", "opción C", "opción D"], "correctIndex": 0 }] }
}
Reglas: formato Cambridge Use of English Parte 1; usa "___" para cada espacio, un "gap" por cada "___" en el mismo orden; exactamente 4 opciones por gap; "correctIndex" desde 0.`,
  open_cloze: `{
  "titulo": "string",
  "instrucciones": "string",
  "contenido": { "text": "texto con ___ en cada espacio numerado", "gaps": [{ "id": "1", "answer": "respuesta correcta", "acceptableAnswers": "alternativa1, alternativa2" }] }
}
Reglas: formato Cambridge Use of English Parte 2 (sin opciones); usa "___" para cada espacio; normalmente preposiciones, conectores o auxiliares; "acceptableAnswers" puede quedar vacío.`,
  word_formation: `{
  "titulo": "string",
  "instrucciones": "string",
  "contenido": { "text": "texto con ___ en cada espacio numerado", "gaps": [{ "id": "1", "rootWord": "PALABRA RAÍZ EN MAYÚSCULAS", "answer": "forma correcta", "acceptableAnswers": "" }] }
}
Reglas: formato Cambridge Use of English Parte 3; usa "___" para cada espacio; "rootWord" es la palabra base que se transforma (ej. HAPPY → "answer": "happiness").`,
  drag_drop_gapfill: `{
  "titulo": "string",
  "instrucciones": "string",
  "contenido": { "text": "texto con ___ en cada espacio numerado", "wordBank": ["palabra1", "palabra2", "palabra3"], "gaps": [{ "id": "1", "answer": "palabra correcta" }] }
}
Reglas: usa "___" para cada espacio; "wordBank" debe incluir todas las respuestas correctas y puede incluir 1-2 palabras de distracción; el estudiante arrastra las palabras a los espacios.`,
  drag_drop_reorder: `{
  "titulo": "string",
  "instrucciones": "string",
  "contenido": { "items": [{ "id": "1", "text": "primer elemento en el orden correcto" }, { "id": "2", "text": "segundo elemento" }] }
}
Reglas: escribe los ítems (oraciones o palabras) EN EL ORDEN CORRECTO — el sistema los mostrará mezclados al estudiante, que debe arrastrarlos de vuelta al orden correcto.`,
  drag_drop_categorize: `{
  "titulo": "string",
  "instrucciones": "string",
  "contenido": { "categories": [{ "id": "1", "label": "Categoría A" }, { "id": "2", "label": "Categoría B" }], "items": [{ "id": "1", "text": "ítem de ejemplo", "categoryId": "1" }] }
}
Reglas: cada "item" debe tener el "categoryId" de su categoría correcta; el estudiante arrastra los ítems a la categoría correspondiente.`,
};

function getPromptForTipo(tipo: PracticeActivityType): string {
  return `Eres un generador de contenido educativo para una academia de inglés. Genera el contenido de una actividad de práctica tipo "${TIPO_LABELS[tipo]}" para una lección de curso.

TEMA / NIVEL / CANTIDAD DE ITEMS (modifica esta línea con lo que necesites):
[ESCRIBE AQUÍ EL TEMA, EL NIVEL Y LA CANTIDAD DE ITEMS QUE QUIERES]

Devuélveme ÚNICAMENTE un JSON válido, sin explicaciones ni bloques de código, con exactamente esta estructura:

${PROMPT_SCHEMAS[tipo]}`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeContent(tipo: PracticeActivityType, raw: any): PracticeActivityContent {
  if (tipo === "multiple_matching") {
    const pairs = Array.isArray(raw?.pairs) ? raw.pairs : [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return { pairs: pairs.map((p: any, i: number) => ({ id: p?.id ? String(p.id) : String(i + 1), left: String(p?.left ?? ""), right: String(p?.right ?? "") })) };
  }
  if (tipo === "fill_blanks") {
    const template = String(raw?.template ?? "");
    const existing: BlankItem[] = Array.isArray(raw?.blanks)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ? raw.blanks.map((b: any, i: number) => ({ id: b?.id ? String(b.id) : String(i + 1), answer: String(b?.answer ?? ""), options: String(b?.options ?? "") }))
      : [];
    return { template, blanks: parseBlanksFromTemplate(template, existing) };
  }
  if (tipo === "multiple_choice") {
    const questions = Array.isArray(raw?.questions) ? raw.questions : [];
    return {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      questions: questions.map((q: any, i: number) => ({
        id: q?.id ? String(q.id) : String(i + 1),
        question: String(q?.question ?? ""),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        options: Array.isArray(q?.options) && q.options.length >= 2 ? q.options.map((o: any) => String(o)) : ["", ""],
        correctIndex: typeof q?.correctIndex === "number" ? q.correctIndex : 0,
      })),
    };
  }
  if (tipo === "use_of_english") {
    const items = Array.isArray(raw?.items) ? raw.items : [];
    return {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      items: items.map((it: any, i: number) => ({
        id: it?.id ? String(it.id) : String(i + 1),
        sentence: String(it?.sentence ?? ""),
        keyword: String(it?.keyword ?? ""),
        gapPrefix: String(it?.gapPrefix ?? ""),
        gapSuffix: String(it?.gapSuffix ?? ""),
        answer: String(it?.answer ?? ""),
      })),
    };
  }
  if (tipo === "reading") {
    const questions = Array.isArray(raw?.questions) ? raw.questions : [];
    return {
      passage: String(raw?.passage ?? ""),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      questions: questions.map((q: any, i: number) => ({
        id: q?.id ? String(q.id) : String(i + 1),
        question: String(q?.question ?? ""),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        options: Array.isArray(q?.options) && q.options.length >= 2 ? q.options.map((o: any) => String(o)) : ["", ""],
        correctIndex: typeof q?.correctIndex === "number" ? q.correctIndex : 0,
      })),
    };
  }
  if (tipo === "listening") {
    const questions = Array.isArray(raw?.questions) ? raw.questions : [];
    return {
      audio_url: String(raw?.audio_url ?? ""),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      questions: questions.map((q: any, i: number) => ({
        id: q?.id ? String(q.id) : String(i + 1),
        question: String(q?.question ?? ""),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        options: Array.isArray(q?.options) && q.options.length >= 2 ? q.options.map((o: any) => String(o)) : ["", ""],
        correctIndex: typeof q?.correctIndex === "number" ? q.correctIndex : 0,
      })),
    };
  }
  if (tipo === "multiple_choice_cloze") {
    const text = String(raw?.text ?? "");
    const gaps = Array.isArray(raw?.gaps)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ? raw.gaps.map((g: any, i: number) => ({
          id: g?.id ? String(g.id) : String(i + 1),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          options: Array.isArray(g?.options) && g.options.length >= 2 ? g.options.map((o: any) => String(o)) : ["", "", "", ""],
          correctIndex: typeof g?.correctIndex === "number" ? g.correctIndex : 0,
        }))
      : [];
    return { text, gaps: parseClozeGaps(text, gaps, (id) => ({ id, options: ["", "", "", ""], correctIndex: 0 })) };
  }
  if (tipo === "open_cloze") {
    const text = String(raw?.text ?? "");
    const gaps = Array.isArray(raw?.gaps)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ? raw.gaps.map((g: any, i: number) => ({
          id: g?.id ? String(g.id) : String(i + 1),
          answer: String(g?.answer ?? ""),
          acceptableAnswers: String(g?.acceptableAnswers ?? ""),
        }))
      : [];
    return { text, gaps: parseClozeGaps(text, gaps, (id) => ({ id, answer: "", acceptableAnswers: "" })) };
  }
  if (tipo === "word_formation") {
    const text = String(raw?.text ?? "");
    const gaps = Array.isArray(raw?.gaps)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ? raw.gaps.map((g: any, i: number) => ({
          id: g?.id ? String(g.id) : String(i + 1),
          rootWord: String(g?.rootWord ?? ""),
          answer: String(g?.answer ?? ""),
          acceptableAnswers: String(g?.acceptableAnswers ?? ""),
        }))
      : [];
    return { text, gaps: parseClozeGaps(text, gaps, (id) => ({ id, rootWord: "", answer: "", acceptableAnswers: "" })) };
  }
  if (tipo === "drag_drop_gapfill") {
    const text = String(raw?.text ?? "");
    const gaps = Array.isArray(raw?.gaps)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ? raw.gaps.map((g: any, i: number) => ({ id: g?.id ? String(g.id) : String(i + 1), answer: String(g?.answer ?? "") }))
      : [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const wordBank = Array.isArray(raw?.wordBank) ? raw.wordBank.map((w: any) => String(w)) : [];
    return { text, wordBank, gaps: parseClozeGaps(text, gaps, (id) => ({ id, answer: "" })) };
  }
  if (tipo === "drag_drop_reorder") {
    const items = Array.isArray(raw?.items) ? raw.items : [];
    return {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      items: items.map((it: any, i: number) => ({ id: it?.id ? String(it.id) : String(i + 1), text: String(it?.text ?? "") })),
    };
  }
  // drag_drop_categorize
  const categories = Array.isArray(raw?.categories) ? raw.categories : [];
  const items = Array.isArray(raw?.items) ? raw.items : [];
  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    categories: categories.map((c: any, i: number) => ({ id: c?.id ? String(c.id) : String(i + 1), label: String(c?.label ?? "") })),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    items: items.map((it: any, i: number) => ({
      id: it?.id ? String(it.id) : String(i + 1),
      text: String(it?.text ?? ""),
      categoryId: it?.categoryId ? String(it.categoryId) : "",
    })),
  };
}

const AdminLeccionActividades = () => {
  const { cursoId, leccionId } = useParams<{ cursoId: string; leccionId: string }>();
  const queryClient = useQueryClient();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CursoActividad | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [content, setContent] = useState<PracticeActivityContent>(emptyMatching);
  const [isPromptDialogOpen, setIsPromptDialogOpen] = useState(false);
  const [promptText, setPromptText] = useState("");
  const [jsonInput, setJsonInput] = useState("");
  const [previewActividad, setPreviewActividad] = useState<CursoActividad | null>(null);

  const { data: leccion } = useQuery({
    queryKey: ["leccion-nombre", leccionId],
    queryFn: async () => {
      const { data, error } = await supabase.from("lecciones").select("id, titulo").eq("id", leccionId!).single();
      if (error) throw error;
      return data;
    },
    enabled: !!leccionId,
  });

  const { data: actividades = [], isLoading } = useQuery({
    queryKey: ["curso-actividades-admin", leccionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("curso_actividades")
        .select("*")
        .eq("leccion_id", leccionId!)
        .order("order_index", { ascending: true });
      if (error) throw error;
      return data as unknown as CursoActividad[];
    },
    enabled: !!leccionId,
  });

  const saveMutation = useMutation({
    mutationFn: async (payload: {
      titulo: string; instrucciones: string; tipo: PracticeActivityType;
      contenido: PracticeActivityContent; leccion_id: string; order_index: number;
    }) => {
      if (editing) {
        const { error } = await supabase
          .from("curso_actividades")
          .update({
            titulo: payload.titulo,
            instrucciones: payload.instrucciones || null,
            tipo: payload.tipo,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            contenido: payload.contenido as any,
          })
          .eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("curso_actividades")
          .insert({
            leccion_id: payload.leccion_id,
            titulo: payload.titulo,
            instrucciones: payload.instrucciones || null,
            tipo: payload.tipo,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            contenido: payload.contenido as any,
            order_index: payload.order_index,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["curso-actividades-admin", leccionId] });
      toast.success(editing ? "Actividad actualizada" : "Actividad creada");
      closeDialog();
    },
    onError: () => toast.error("Error al guardar la actividad"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("curso_actividades").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["curso-actividades-admin", leccionId] });
      toast.success("Actividad eliminada");
    },
    onError: () => toast.error("Error al eliminar"),
  });

  const toggleActivaMutation = useMutation({
    mutationFn: async ({ id, activo }: { id: string; activo: boolean }) => {
      const { error } = await supabase.from("curso_actividades").update({ activo }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["curso-actividades-admin", leccionId] }),
  });

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setContent(getDefaultContent("multiple_matching"));
    setJsonInput("");
    setIsDialogOpen(true);
  }

  function openEdit(a: CursoActividad) {
    setEditing(a);
    setForm({ titulo: a.titulo, instrucciones: a.instrucciones ?? "", tipo: a.tipo });
    setContent(a.contenido);
    setJsonInput("");
    setIsDialogOpen(true);
  }

  function closeDialog() {
    setIsDialogOpen(false);
    setEditing(null);
    setJsonInput("");
  }

  function handleTipoChange(tipo: PracticeActivityType) {
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let parsed: any;
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
    setContent({ template, blanks: parseBlanksFromTemplate(template, c.blanks) });
  }
  function updateBlank(id: string, field: "answer" | "options", value: string) {
    const c = content as FillBlanksContent;
    setContent({ ...c, blanks: c.blanks.map((b) => (b.id === id ? { ...b, [field]: value } : b)) });
  }

  // --- Multiple choice helpers (also reused by Reading/Listening) ---
  function mcHelpers(getC: () => { questions: McQuestion[] }, setC: (c: { questions: McQuestion[] }) => void) {
    return {
      addQuestion: () => setC({ questions: [...getC().questions, { id: Date.now().toString(), question: "", options: ["", ""], correctIndex: 0 }] }),
      removeQuestion: (id: string) => setC({ questions: getC().questions.filter((q) => q.id !== id) }),
      updateQuestion: (id: string, question: string) => setC({ questions: getC().questions.map((q) => (q.id === id ? { ...q, question } : q)) }),
      addOption: (qId: string) => setC({ questions: getC().questions.map((q) => (q.id === qId ? { ...q, options: [...q.options, ""] } : q)) }),
      removeOption: (qId: string, index: number) => setC({
        questions: getC().questions.map((q) => {
          if (q.id !== qId) return q;
          const options = q.options.filter((_, i) => i !== index);
          const correctIndex = q.correctIndex >= options.length ? 0 : q.correctIndex > index ? q.correctIndex - 1 : q.correctIndex;
          return { ...q, options, correctIndex };
        }),
      }),
      updateOption: (qId: string, index: number, value: string) => setC({
        questions: getC().questions.map((q) => (q.id === qId ? { ...q, options: q.options.map((o, i) => (i === index ? value : o)) } : q)),
      }),
      setCorrect: (qId: string, correctIndex: number) => setC({ questions: getC().questions.map((q) => (q.id === qId ? { ...q, correctIndex } : q)) }),
    };
  }
  const mcH = mcHelpers(() => content as MultipleChoiceContent, (c) => setContent(c));
  const readingH = mcHelpers(
    () => ({ questions: (content as ReadingContent).questions }),
    (c) => setContent({ ...(content as ReadingContent), questions: c.questions }),
  );
  const listeningH = mcHelpers(
    () => ({ questions: (content as ListeningContent).questions }),
    (c) => setContent({ ...(content as ListeningContent), questions: c.questions }),
  );

  // --- Use of English helpers ---
  function addUoeItem() {
    const c = content as UseOfEnglishContent;
    setContent({ items: [...c.items, { id: Date.now().toString(), sentence: "", keyword: "", gapPrefix: "", gapSuffix: "", answer: "" }] });
  }
  function removeUoeItem(id: string) {
    const c = content as UseOfEnglishContent;
    setContent({ items: c.items.filter((it) => it.id !== id) });
  }
  function updateUoeItem(id: string, field: keyof KeyWordItem, value: string) {
    const c = content as UseOfEnglishContent;
    setContent({ items: c.items.map((it) => (it.id === id ? { ...it, [field]: value } : it)) });
  }

  function handleSave() {
    if (!form.titulo.trim()) { toast.error("El título es requerido"); return; }
    if (form.tipo === "multiple_matching") {
      const c = content as MatchingContent;
      if (c.pairs.length === 0 || c.pairs.some((p) => !p.left.trim() || !p.right.trim())) { toast.error("Completa todos los pares del matching"); return; }
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
        if (q.options.length < 2 || q.options.some((o) => !o.trim())) { toast.error("Cada pregunta necesita al menos 2 opciones completas"); return; }
      }
    }
    if (form.tipo === "use_of_english") {
      const c = content as UseOfEnglishContent;
      if (c.items.length === 0) { toast.error("Agrega al menos un ítem"); return; }
      for (const it of c.items) {
        if (!it.sentence.trim() || !it.keyword.trim() || !it.answer.trim()) { toast.error("Completa la oración, la palabra clave y la respuesta de cada ítem"); return; }
      }
    }
    if (form.tipo === "reading") {
      const c = content as ReadingContent;
      if (!c.passage.trim()) { toast.error("El texto de lectura es requerido"); return; }
      if (c.questions.length === 0) { toast.error("Agrega al menos una pregunta"); return; }
      for (const q of c.questions) {
        if (!q.question.trim()) { toast.error("Completa el enunciado de cada pregunta"); return; }
        if (q.options.length < 2 || q.options.some((o) => !o.trim())) { toast.error("Cada pregunta necesita al menos 2 opciones completas"); return; }
      }
    }
    if (form.tipo === "listening") {
      const c = content as ListeningContent;
      if (!c.audio_url.trim()) { toast.error("La URL del audio es requerida"); return; }
      if (c.questions.length === 0) { toast.error("Agrega al menos una pregunta"); return; }
      for (const q of c.questions) {
        if (!q.question.trim()) { toast.error("Completa el enunciado de cada pregunta"); return; }
        if (q.options.length < 2 || q.options.some((o) => !o.trim())) { toast.error("Cada pregunta necesita al menos 2 opciones completas"); return; }
      }
    }
    if (form.tipo === "multiple_choice_cloze") {
      const c = content as MultipleChoiceClozeContent;
      if (!c.text.trim() || c.gaps.length === 0) { toast.error("Agrega el texto con al menos un espacio (___)"); return; }
      for (const g of c.gaps) {
        if (g.options.length < 2 || g.options.some((o) => !o.trim())) { toast.error("Cada espacio necesita sus 4 opciones completas"); return; }
      }
    }
    if (form.tipo === "open_cloze") {
      const c = content as OpenClozeContent;
      if (!c.text.trim() || c.gaps.length === 0) { toast.error("Agrega el texto con al menos un espacio (___)"); return; }
      if (c.gaps.some((g) => !g.answer.trim())) { toast.error("Completa la respuesta de cada espacio"); return; }
    }
    if (form.tipo === "word_formation") {
      const c = content as WordFormationContent;
      if (!c.text.trim() || c.gaps.length === 0) { toast.error("Agrega el texto con al menos un espacio (___)"); return; }
      if (c.gaps.some((g) => !g.rootWord.trim() || !g.answer.trim())) { toast.error("Completa la palabra raíz y la respuesta de cada espacio"); return; }
    }
    if (form.tipo === "drag_drop_gapfill") {
      const c = content as DragDropGapfillContent;
      if (!c.text.trim() || c.gaps.length === 0) { toast.error("Agrega el texto con al menos un espacio (___)"); return; }
      if (c.gaps.some((g) => !g.answer.trim())) { toast.error("Completa la respuesta de cada espacio"); return; }
      if (c.wordBank.filter((w) => w.trim()).length === 0) { toast.error("Agrega el banco de palabras"); return; }
    }
    if (form.tipo === "drag_drop_reorder") {
      const c = content as ReorderContent;
      if (c.items.length < 2) { toast.error("Agrega al menos 2 ítems para ordenar"); return; }
      if (c.items.some((it) => !it.text.trim())) { toast.error("Completa el texto de cada ítem"); return; }
    }
    if (form.tipo === "drag_drop_categorize") {
      const c = content as CategorizeContent;
      if (c.categories.length === 0 || c.categories.some((cat) => !cat.label.trim())) { toast.error("Completa el nombre de cada categoría"); return; }
      if (c.items.length === 0 || c.items.some((it) => !it.text.trim() || !it.categoryId)) { toast.error("Completa el texto y la categoría de cada ítem"); return; }
    }
    saveMutation.mutate({
      leccion_id: leccionId!,
      titulo: form.titulo.trim(),
      instrucciones: form.instrucciones.trim(),
      tipo: form.tipo,
      contenido: content,
      order_index: actividades.length,
    });
  }

  if (isLoading) return <div className="p-8 text-muted-foreground">Cargando actividades...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link to={`/admin/cursos/${cursoId}/lecciones`}>
          <Button variant="ghost" size="sm">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Volver a lecciones
          </Button>
        </Link>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-primary" />
            Actividades de práctica
          </h1>
          {leccion && <p className="text-sm text-muted-foreground mt-1">{leccion.titulo}</p>}
          <p className="text-xs text-muted-foreground mt-1">
            Corrección automática, sin calificación — el estudiante ve al instante qué respondió bien o mal.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva actividad
        </Button>
      </div>

      {actividades.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center text-muted-foreground">
            <ClipboardList className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p>No hay actividades aún.</p>
            <p className="text-sm mt-1">Crea la primera actividad de práctica para esta lección.</p>
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
                      <Badge variant="secondary" className={`text-xs ${TIPO_COLORS[a.tipo]}`}>{TIPO_LABELS[a.tipo]}</Badge>
                      {!a.activo && <Badge variant="outline" className="text-xs">Inactiva</Badge>}
                    </div>
                    {a.instrucciones && <p className="text-sm text-muted-foreground truncate mt-0.5">{a.instrucciones}</p>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button variant="ghost" size="sm" className="text-xs" onClick={() => toggleActivaMutation.mutate({ id: a.id, activo: !a.activo })}>
                      {a.activo ? "Desactivar" : "Activar"}
                    </Button>
                    <Button variant="ghost" size="icon" title="Vista previa" onClick={() => setPreviewActividad(a)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => openEdit(a)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => { if (confirm("¿Eliminar esta actividad?")) deleteMutation.mutate(a.id); }}
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
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Título *</Label>
                <Input value={form.titulo} onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))} placeholder="Ej. Practice: Present Perfect" />
              </div>
              <div className="col-span-2">
                <Label>Tipo de actividad *</Label>
                <Select value={form.tipo} onValueChange={(v) => handleTipoChange(v as PracticeActivityType)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="multiple_matching">Multiple Matching</SelectItem>
                    <SelectItem value="fill_blanks">Fill in the Blanks</SelectItem>
                    <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                    <SelectItem value="use_of_english">Use of English</SelectItem>
                    <SelectItem value="reading">Reading</SelectItem>
                    <SelectItem value="listening">Listening</SelectItem>
                    <SelectItem value="multiple_choice_cloze">Multiple-Choice Cloze</SelectItem>
                    <SelectItem value="open_cloze">Open Cloze</SelectItem>
                    <SelectItem value="word_formation">Word Formation</SelectItem>
                    <SelectItem value="drag_drop_gapfill">Drag & Drop Gap Fill</SelectItem>
                    <SelectItem value="drag_drop_reorder">Reorder</SelectItem>
                    <SelectItem value="drag_drop_categorize">Categorize</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label>Instrucciones (opcional)</Label>
                <Textarea value={form.instrucciones} onChange={(e) => setForm((f) => ({ ...f, instrucciones: e.target.value }))} placeholder="Instrucciones para el estudiante..." rows={2} />
              </div>
            </div>

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
              <Textarea value={jsonInput} onChange={(e) => setJsonInput(e.target.value)} placeholder="Pega aquí el JSON generado por la IA..." rows={3} className="text-xs font-mono" />
              <div className="flex justify-end">
                <Button size="sm" variant="secondary" onClick={handleLoadJson}>
                  <ClipboardPaste className="h-3 w-3 mr-1" /> Cargar JSON
                </Button>
              </div>
            </div>

            <div className="border rounded-lg p-4 bg-muted/30">
              {form.tipo === "multiple_matching" && (
                <MatchingBuilder content={content as MatchingContent} onAddPair={addPair} onRemovePair={removePair} onUpdatePair={updatePair} />
              )}
              {form.tipo === "fill_blanks" && (
                <FillBlanksBuilder content={content as FillBlanksContent} onTemplateChange={handleTemplateChange} onUpdateBlank={updateBlank} />
              )}
              {form.tipo === "multiple_choice" && (
                <MultipleChoiceBuilder
                  content={content as MultipleChoiceContent}
                  onAddQuestion={mcH.addQuestion} onRemoveQuestion={mcH.removeQuestion} onUpdateQuestion={mcH.updateQuestion}
                  onAddOption={mcH.addOption} onRemoveOption={mcH.removeOption} onUpdateOption={mcH.updateOption} onSetCorrect={mcH.setCorrect}
                />
              )}
              {form.tipo === "use_of_english" && (
                <UseOfEnglishBuilder content={content as UseOfEnglishContent} onAddItem={addUoeItem} onRemoveItem={removeUoeItem} onUpdateItem={updateUoeItem} />
              )}
              {form.tipo === "reading" && (
                <div className="space-y-4">
                  <div>
                    <Label className="font-medium">Texto de lectura *</Label>
                    <Textarea
                      value={(content as ReadingContent).passage}
                      onChange={(e) => setContent({ ...(content as ReadingContent), passage: e.target.value })}
                      placeholder="Pega aquí el pasaje de lectura..."
                      rows={8}
                      className="mt-1"
                    />
                  </div>
                  <div className="border-t pt-4">
                    <MultipleChoiceBuilder
                      content={{ questions: (content as ReadingContent).questions }}
                      onAddQuestion={readingH.addQuestion} onRemoveQuestion={readingH.removeQuestion} onUpdateQuestion={readingH.updateQuestion}
                      onAddOption={readingH.addOption} onRemoveOption={readingH.removeOption} onUpdateOption={readingH.updateOption} onSetCorrect={readingH.setCorrect}
                    />
                  </div>
                </div>
              )}
              {form.tipo === "listening" && (
                <div className="space-y-4">
                  <div>
                    <Label className="font-medium">URL del audio *</Label>
                    <Input
                      value={(content as ListeningContent).audio_url}
                      onChange={(e) => setContent({ ...(content as ListeningContent), audio_url: e.target.value })}
                      placeholder="https://... (mp3, Google Drive, etc.)"
                      className="mt-1"
                    />
                    {(content as ListeningContent).audio_url && (
                      <audio controls src={(content as ListeningContent).audio_url} className="w-full mt-2 h-10" />
                    )}
                  </div>
                  <div className="border-t pt-4">
                    <MultipleChoiceBuilder
                      content={{ questions: (content as ListeningContent).questions }}
                      onAddQuestion={listeningH.addQuestion} onRemoveQuestion={listeningH.removeQuestion} onUpdateQuestion={listeningH.updateQuestion}
                      onAddOption={listeningH.addOption} onRemoveOption={listeningH.removeOption} onUpdateOption={listeningH.updateOption} onSetCorrect={listeningH.setCorrect}
                    />
                  </div>
                </div>
              )}
              {form.tipo === "multiple_choice_cloze" && (
                <MultipleChoiceClozeBuilder content={content as MultipleChoiceClozeContent} onChange={setContent} />
              )}
              {form.tipo === "open_cloze" && (
                <OpenClozeBuilder content={content as OpenClozeContent} onChange={setContent} />
              )}
              {form.tipo === "word_formation" && (
                <WordFormationBuilder content={content as WordFormationContent} onChange={setContent} />
              )}
              {form.tipo === "drag_drop_gapfill" && (
                <DragDropGapfillBuilder content={content as DragDropGapfillContent} onChange={setContent} />
              )}
              {form.tipo === "drag_drop_reorder" && (
                <ReorderBuilder content={content as ReorderContent} onChange={setContent} />
              )}
              {form.tipo === "drag_drop_categorize" && (
                <CategorizeBuilder content={content as CategorizeContent} onChange={setContent} />
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                className="mr-auto gap-2"
                onClick={() => setPreviewActividad({
                  id: "preview", leccion_id: leccionId!, titulo: form.titulo, instrucciones: form.instrucciones,
                  tipo: form.tipo, contenido: content, activo: true, order_index: 0,
                })}
              >
                <Eye className="h-4 w-4" /> Vista previa
              </Button>
              <Button variant="outline" onClick={closeDialog}>Cancelar</Button>
              <Button onClick={handleSave} disabled={saveMutation.isPending}>
                {saveMutation.isPending ? "Guardando..." : editing ? "Guardar cambios" : "Crear actividad"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
              Edita la línea del tema, copia el prompt y pégalo en Claude. Luego copia el JSON que te devuelva y pégalo en el campo "Pegar aquí el JSON generado por la IA".
            </p>
            <Textarea value={promptText} onChange={(e) => setPromptText(e.target.value)} rows={16} className="text-xs font-mono" />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsPromptDialogOpen(false)}>Cerrar</Button>
              <Button onClick={copyPrompt}><Copy className="h-4 w-4 mr-2" /> Copiar prompt</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ActivityPreviewDialog
        open={!!previewActividad}
        onOpenChange={(open) => !open && setPreviewActividad(null)}
        titulo={previewActividad?.titulo || ""}
        instrucciones={previewActividad?.instrucciones || undefined}
        tipo={previewActividad?.tipo || ""}
        contenido={previewActividad?.contenido}
      />
    </div>
  );
};

// --- Builder sub-components ---

function MatchingBuilder({
  content, onAddPair, onRemovePair, onUpdatePair,
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
        <Button variant="outline" size="sm" onClick={onAddPair}><Plus className="h-3 w-3 mr-1" /> Agregar par</Button>
      </div>
      <div className="grid grid-cols-[1fr,1fr,auto] gap-2 text-xs font-medium text-muted-foreground mb-1 px-1">
        <span>Columna izquierda</span><span>Columna derecha</span><span />
      </div>
      <div className="space-y-2">
        {content.pairs.map((pair, i) => (
          <div key={pair.id} className="grid grid-cols-[1fr,1fr,auto] gap-2 items-center">
            <Input value={pair.left} onChange={(e) => onUpdatePair(pair.id, "left", e.target.value)} placeholder={`Ítem ${i + 1}`} />
            <Input value={pair.right} onChange={(e) => onUpdatePair(pair.id, "right", e.target.value)} placeholder={`Match ${i + 1}`} />
            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive h-8 w-8" onClick={() => onRemovePair(pair.id)} disabled={content.pairs.length === 1}>
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

function FillBlanksBuilder({
  content, onTemplateChange, onUpdateBlank,
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
          <span className="text-muted-foreground font-normal ml-2 text-xs">Usa ___ (tres guiones) para cada espacio</span>
        </Label>
        <Textarea value={content.template} onChange={(e) => onTemplateChange(e.target.value)} placeholder="Ej: The cat ___ on the ___ mat." rows={3} className="mt-1 font-mono text-sm" />
        <p className="text-xs text-muted-foreground mt-1">Espacios detectados: <span className="font-semibold text-primary">{content.blanks.length}</span></p>
      </div>
      {content.blanks.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Respuestas para cada espacio</h4>
          {content.blanks.map((blank, i) => (
            <div key={blank.id} className="flex gap-3 items-start">
              <div className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-2">{i + 1}</div>
              <div className="flex-1 grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Respuesta correcta *</Label>
                  <Input value={blank.answer} onChange={(e) => onUpdateBlank(blank.id, "answer", e.target.value)} placeholder="Respuesta" className="h-8 text-sm" />
                </div>
                <div>
                  <Label className="text-xs">Opciones (separadas por coma)</Label>
                  <Input value={blank.options} onChange={(e) => onUpdateBlank(blank.id, "options", e.target.value)} placeholder="op1, op2, op3 (vacío = texto libre)" className="h-8 text-sm" />
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
  content, onAddQuestion, onRemoveQuestion, onUpdateQuestion, onAddOption, onRemoveOption, onUpdateOption, onSetCorrect,
}: {
  content: { questions: McQuestion[] };
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
        <Button variant="outline" size="sm" onClick={onAddQuestion}><Plus className="h-3 w-3 mr-1" /> Agregar pregunta</Button>
      </div>
      <div className="space-y-4">
        {content.questions.map((q, qi) => (
          <div key={q.id} className="border rounded-lg p-3 bg-background space-y-2">
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-1.5">{qi + 1}</div>
              <Input value={q.question} onChange={(e) => onUpdateQuestion(q.id, e.target.value)} placeholder="Enunciado de la pregunta" className="flex-1" />
              <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive h-8 w-8 shrink-0" onClick={() => onRemoveQuestion(q.id)} disabled={content.questions.length === 1}>
                <X className="h-3 w-3" />
              </Button>
            </div>
            <div className="pl-8 space-y-1.5">
              {q.options.map((opt, oi) => (
                <div key={oi} className="flex items-center gap-2">
                  <input type="radio" name={`correct-${q.id}`} checked={q.correctIndex === oi} onChange={() => onSetCorrect(q.id, oi)} title="Marcar como correcta" className="shrink-0" />
                  <Input value={opt} onChange={(e) => onUpdateOption(q.id, oi, e.target.value)} placeholder={`Opción ${oi + 1}`} className="h-8 text-sm flex-1" />
                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive h-7 w-7 shrink-0" onClick={() => onRemoveOption(q.id, oi)} disabled={q.options.length === 2}>
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => onAddOption(q.id)}><Plus className="h-3 w-3 mr-1" /> Agregar opción</Button>
              <p className="text-xs text-muted-foreground">Selecciona el radio button de la opción correcta.</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function UseOfEnglishBuilder({
  content, onAddItem, onRemoveItem, onUpdateItem,
}: {
  content: UseOfEnglishContent;
  onAddItem: () => void;
  onRemoveItem: (id: string) => void;
  onUpdateItem: (id: string, field: keyof KeyWordItem, value: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-sm">Key Word Transformations</h3>
        <Button variant="outline" size="sm" onClick={onAddItem}><Plus className="h-3 w-3 mr-1" /> Agregar ítem</Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Formato Cambridge: el estudiante reescribe la oración usando la palabra clave (sin cambiarla), completando el espacio con 2 a 6 palabras.
      </p>
      <div className="space-y-4">
        {content.items.map((item, i) => (
          <div key={item.id} className="border rounded-lg p-3 bg-background space-y-2">
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-1.5">{i + 1}</div>
              <div className="flex-1 space-y-2">
                <div>
                  <Label className="text-xs">Oración original</Label>
                  <Input value={item.sentence} onChange={(e) => onUpdateItem(item.id, "sentence", e.target.value)} placeholder="Ej: He hasn't visited his grandmother since March." className="h-8 text-sm" />
                </div>
                <div>
                  <Label className="text-xs">Palabra clave</Label>
                  <Input value={item.keyword} onChange={(e) => onUpdateItem(item.id, "keyword", e.target.value)} placeholder="LAST" className="h-8 text-sm font-mono uppercase" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Antes del espacio</Label>
                    <Input value={item.gapPrefix} onChange={(e) => onUpdateItem(item.id, "gapPrefix", e.target.value)} placeholder="He" className="h-8 text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs">Después del espacio</Label>
                    <Input value={item.gapSuffix} onChange={(e) => onUpdateItem(item.id, "gapSuffix", e.target.value)} placeholder="his grandmother in March." className="h-8 text-sm" />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Respuesta correcta (2-6 palabras)</Label>
                  <Input value={item.answer} onChange={(e) => onUpdateItem(item.id, "answer", e.target.value)} placeholder="last visited" className="h-8 text-sm" />
                </div>
              </div>
              <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive h-8 w-8 shrink-0" onClick={() => onRemoveItem(item.id)} disabled={content.items.length === 1}>
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminLeccionActividades;
