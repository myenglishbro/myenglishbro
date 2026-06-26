import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Swords, Upload, Search, Sparkles, Copy } from "lucide-react";
import {
  WORLD_NODE_TEMPLATE,
  NODE_KIND_LABEL,
  NODES_PER_WORLD,
  FORMATS_BY_NODE_KIND,
} from "@/components/dashboard/word-survivor/questions";

const LEVELS = ["B2", "C1", "C2"] as const;

const NODE_OPTIONS = Array.from({ length: NODES_PER_WORLD }, (_, i) => {
  const index = i + 1;
  const kind = WORLD_NODE_TEMPLATE[i];
  return { index, kind, label: `Nodo ${index} — ${NODE_KIND_LABEL[kind]}` };
});
const TYPES = ["vocabulary", "phrasal_verb", "collocation", "grammar", "listening", "cambridge"] as const;
const TYPE_LABEL: Record<string, string> = {
  vocabulary: "Vocabulary",
  phrasal_verb: "Phrasal verb",
  collocation: "Collocation",
  grammar: "Grammar",
  listening: "Listening",
  cambridge: "Cambridge",
};

const FORMATS = ["multiple_choice", "cloze", "key_word_transformation", "word_formation"] as const;
const FORMAT_LABEL: Record<string, string> = {
  multiple_choice: "Multiple Choice",
  cloze: "Cloze",
  key_word_transformation: "Key Word Transformation",
  word_formation: "Word Formation",
};

interface QuestionRow {
  id: string;
  term_id: string;
  level: string;
  type: string;
  format: string;
  node_index: number | null;
  difficulty: number;
  prompt: string;
  options: string[] | null;
  correct_index: number | null;
  accepted_answers: string[] | null;
  key_word: string | null;
  transform_prompt: string | null;
  tip: string | null;
  tags: string[];
  active: boolean;
  word_survivor_terms: { term: string; meaning: string; example_sentence: string | null } | null;
}

type FormState = {
  term: string;
  meaning: string;
  example_sentence: string;
  level: string;
  type: string;
  format: string;
  nodeIndex: number | null;
  difficulty: number;
  prompt: string;
  options: string[];
  correctIndex: number;
  acceptedAnswers: string;
  keyWord: string;
  transformPrompt: string;
  tip: string;
  tags: string;
  active: boolean;
};

const EMPTY_FORM: FormState = {
  term: "",
  meaning: "",
  example_sentence: "",
  level: "B2",
  type: "vocabulary",
  format: "multiple_choice",
  nodeIndex: null,
  difficulty: 2,
  prompt: "",
  options: ["", "", "", ""],
  correctIndex: 0,
  acceptedAnswers: "",
  keyWord: "",
  transformPrompt: "",
  tip: "",
  tags: "",
  active: true,
};

const LEVEL_EXAM_NAME: Record<string, string> = {
  B2: "B2 First (FCE)",
  C1: "C1 Advanced (CAE)",
  C2: "C2 Proficiency (CPE)",
};

function getWordSurvivorPrompt(level: string): string {
  return `Eres un experto en exámenes de Cambridge English y vas a generar contenido de Reading & Use of English para un minijuego de vocabulario tipo RPG.

NIVEL: ${level} (${LEVEL_EXAM_NAME[level] ?? level})
TEMA (opcional, edita esta línea si quieres enfocarlo en algo, ej. "business", "medio ambiente", "phrasal verbs de trabajo"; déjala así para temas variados):
[ESCRIBE AQUÍ UN TEMA OPCIONAL, O DÉJALO EN BLANCO]

Genera EXACTAMENTE 16 ítems, variados en formato y en tipo (no repitas la misma combinación), así:
- 6 de "format": "multiple_choice" -> estilo Use of English Part 1 (cloze con 4 opciones MUY cercanas en significado o forma; no preguntas triviales de "qué significa X", sino que elegir la correcta requiera entender colocación/registro).
- 4 de "format": "cloze" -> estilo Part 2 (open cloze: falta UNA sola palabra gramatical -- preposición, artículo, conjunción, auxiliar, pronombre relativo...).
- 3 de "format": "word_formation" -> estilo Part 3 (se da una palabra raíz en mayúsculas que hay que transformar para completar el hueco).
- 3 de "format": "key_word_transformation" -> estilo Part 4 (reescribir una frase usando una palabra clave dada, manteniendo el significado).

Reparte también el campo "type" entre "vocabulary", "phrasal_verb", "collocation" y "grammar" -- no uses el mismo type para todos los ítems.

Devuélveme ÚNICAMENTE un JSON válido (sin explicaciones, sin comentarios, sin bloques de código con comillas triples), un array de términos con esta estructura exacta:

[{
  "term": "string (la palabra o frase clave de este ítem)",
  "meaning": "string (su significado en inglés, claro y breve)",
  "example_sentence": "string (opcional)",
  "level": "${level}",
  "type": "vocabulary" | "phrasal_verb" | "collocation" | "grammar",
  "questions": [{
    "format": "multiple_choice" | "cloze" | "word_formation" | "key_word_transformation",
    "prompt": "la frase con ___ donde va el hueco (o la frase original para key_word_transformation)",
    "options": ["opción correcta", "distractor 1", "distractor 2", "distractor 3"],
    "correctIndex": 0,
    "acceptedAnswers": ["respuesta correcta", "variante también válida"],
    "keyWord": "PALABRA",
    "transformPrompt": "segunda frase con ___ (solo key_word_transformation)",
    "difficulty": 3,
    "tip": "explicación breve de por qué esa es la respuesta correcta",
    "tags": ["cambridge-${level.toLowerCase()}"]
  }]
}]

Reglas importantes:
- Cada término trae solo UNA pregunta dentro de "questions".
- "options"/"correctIndex" SOLO van en multiple_choice. "acceptedAnswers" SOLO en cloze/word_formation/key_word_transformation.
- "keyWord" va en key_word_transformation (la palabra clave dada) y en word_formation (la palabra raíz en mayúsculas). "transformPrompt" SOLO en key_word_transformation.
- Dificultad acorde a ${level}: el vocabulario, la gramática y el idiomatismo deben sentirse genuinamente de examen, no genéricos.
- No repitas términos ni preguntas entre sí.
- En multiple_choice las 4 opciones deben ser del mismo tipo de palabra (todas verbos, todas preposiciones, etc.) para que el reto sea elegir el significado/colocación correcta, no descartar por gramática obvia.`;
}

interface BulkQuestionInput {
  prompt: string;
  format?: string;
  nodeIndex?: number;
  options?: string[];
  correctIndex?: number;
  acceptedAnswers?: string[];
  keyWord?: string;
  transformPrompt?: string;
  difficulty?: number;
  tip?: string;
  tags?: string[];
}
interface BulkTermInput {
  term: string;
  meaning: string;
  example_sentence?: string;
  level: string;
  type: string;
  questions: BulkQuestionInput[];
}

const AdminWordSurvivor = () => {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<QuestionRow | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [bulkBusy, setBulkBusy] = useState(false);
  const [promptLevel, setPromptLevel] = useState<string>("B2");
  const [promptOpen, setPromptOpen] = useState(false);
  const [promptText, setPromptText] = useState("");

  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [nodeFilter, setNodeFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const { data: questions = [], isLoading } = useQuery({
    queryKey: ["admin-word-survivor-questions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("word_survivor_questions")
        .select(
          "id, term_id, level, type, format, node_index, difficulty, prompt, options, correct_index, accepted_answers, key_word, transform_prompt, tip, tags, active, word_survivor_terms(term, meaning, example_sentence)",
        )
        .order("level")
        .order("node_index");
      if (error) throw error;
      return data as unknown as QuestionRow[];
    },
  });

  const filtered = useMemo(() => {
    return questions.filter((q) => {
      if (levelFilter !== "all" && q.level !== levelFilter) return false;
      if (typeFilter !== "all" && q.type !== typeFilter) return false;
      if (nodeFilter !== "all" && String(q.node_index ?? "unassigned") !== nodeFilter) return false;
      if (search.trim()) {
        const s = search.toLowerCase();
        const term = q.word_survivor_terms?.term?.toLowerCase() ?? "";
        if (!term.includes(s) && !q.prompt.toLowerCase().includes(s)) return false;
      }
      return true;
    });
  }, [questions, levelFilter, typeFilter, nodeFilter, search]);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["admin-word-survivor-questions"] });
    qc.invalidateQueries({ queryKey: ["word-survivor-questions"] });
  };

  const save = useMutation({
    mutationFn: async () => {
      const tagsArray = form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const { data: term, error: termError } = await supabase
        .from("word_survivor_terms")
        .upsert(
          {
            term: form.term.trim(),
            meaning: form.meaning.trim(),
            example_sentence: form.example_sentence.trim() || null,
            level: form.level,
            type: form.type,
          },
          { onConflict: "term,level,type" },
        )
        .select("id")
        .single();
      if (termError) throw termError;

      const acceptedAnswersArray = form.acceptedAnswers
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean);

      const payload =
        form.format === "multiple_choice"
          ? {
              term_id: term.id,
              level: form.level,
              type: form.type,
              format: form.format,
              node_index: form.nodeIndex,
              difficulty: form.difficulty,
              prompt: form.prompt.trim(),
              options: form.options.map((o) => o.trim()),
              correct_index: form.correctIndex,
              accepted_answers: null,
              key_word: null,
              transform_prompt: null,
              tip: form.tip.trim() || null,
              tags: tagsArray,
              active: form.active,
            }
          : {
              term_id: term.id,
              level: form.level,
              type: form.type,
              format: form.format,
              node_index: form.nodeIndex,
              difficulty: form.difficulty,
              prompt: form.prompt.trim(),
              options: null,
              correct_index: null,
              accepted_answers: acceptedAnswersArray,
              key_word:
                form.format === "key_word_transformation" || form.format === "word_formation"
                  ? form.keyWord.trim()
                  : null,
              transform_prompt: form.format === "key_word_transformation" ? form.transformPrompt.trim() : null,
              tip: form.tip.trim() || null,
              tags: tagsArray,
              active: form.active,
            };

      if (editing) {
        const { error } = await supabase.from("word_survivor_questions").update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("word_survivor_questions").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      invalidate();
      toast.success(editing ? "Pregunta actualizada" : "Pregunta creada");
      setOpen(false);
    },
    onError: (e: any) => toast.error(e?.message || "Error al guardar la pregunta"),
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase.from("word_survivor_questions").update({ active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
    onError: () => toast.error("Error al actualizar"),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("word_survivor_questions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate();
      toast.success("Pregunta eliminada");
    },
    onError: () => toast.error("Error al eliminar"),
  });

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setOpen(true);
  };

  const openEdit = (q: QuestionRow) => {
    setEditing(q);
    setForm({
      term: q.word_survivor_terms?.term ?? "",
      meaning: q.word_survivor_terms?.meaning ?? "",
      example_sentence: q.word_survivor_terms?.example_sentence ?? "",
      level: q.level,
      type: q.type,
      format: q.format,
      nodeIndex: q.node_index,
      difficulty: q.difficulty,
      prompt: q.prompt,
      options: q.options ? [...q.options] : ["", "", "", ""],
      correctIndex: q.correct_index ?? 0,
      acceptedAnswers: (q.accepted_answers ?? []).join(", "),
      keyWord: q.key_word ?? "",
      transformPrompt: q.transform_prompt ?? "",
      tip: q.tip ?? "",
      tags: q.tags.join(", "),
      active: q.active,
    });
    setOpen(true);
  };

  const setOption = (i: number, value: string) => {
    setForm((f) => {
      const options = [...f.options];
      options[i] = value;
      return { ...f, options };
    });
  };

  const openPromptDialog = () => {
    setPromptText(getWordSurvivorPrompt(promptLevel));
    setPromptOpen(true);
  };

  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(promptText);
      toast.success("Prompt copiado. Pégalo en Claude, edita el tema si quieres y luego pega aquí el JSON que te devuelva.");
    } catch {
      toast.error("No se pudo copiar automáticamente. Selecciona el texto y cópialo manualmente.");
    }
  };

  const runBulkImport = async () => {
    setBulkBusy(true);
    try {
      const items = JSON.parse(bulkText) as BulkTermInput[];
      if (!Array.isArray(items)) throw new Error("El JSON debe ser un array de términos");

      let termsCount = 0;
      let questionsCount = 0;

      for (const item of items) {
        const { data: term, error: termError } = await supabase
          .from("word_survivor_terms")
          .upsert(
            {
              term: item.term.trim(),
              meaning: item.meaning.trim(),
              example_sentence: item.example_sentence?.trim() || null,
              level: item.level,
              type: item.type,
            },
            { onConflict: "term,level,type" },
          )
          .select("id")
          .single();
        if (termError) throw termError;
        termsCount += 1;

        const rows = item.questions.map((q) => {
          const format = q.format ?? "multiple_choice";
          return {
            term_id: term.id,
            level: item.level,
            type: item.type,
            format,
            node_index: q.nodeIndex ?? null,
            difficulty: q.difficulty ?? 2,
            prompt: q.prompt,
            options: format === "multiple_choice" ? q.options ?? [] : null,
            correct_index: format === "multiple_choice" ? q.correctIndex ?? 0 : null,
            accepted_answers: format === "multiple_choice" ? null : q.acceptedAnswers ?? [],
            key_word: format === "key_word_transformation" || format === "word_formation" ? q.keyWord ?? null : null,
            transform_prompt: format === "key_word_transformation" ? q.transformPrompt ?? null : null,
            tip: q.tip ?? null,
            tags: q.tags ?? [],
            active: true,
          };
        });
        if (rows.length > 0) {
          const { error: qError } = await supabase.from("word_survivor_questions").insert(rows);
          if (qError) throw qError;
          questionsCount += rows.length;
        }
      }

      invalidate();
      toast.success(`Importado: ${termsCount} términos, ${questionsCount} preguntas`);
      setBulkOpen(false);
      setBulkText("");
    } catch (e: any) {
      toast.error(e?.message || "Error al importar el JSON");
    } finally {
      setBulkBusy(false);
    }
  };

  return (
    <div className="p-8 light" style={{ colorScheme: "light" }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 font-display flex items-center gap-2">
            <Swords className="h-6 w-6 text-primary" />
            Word Survivor — Contenido
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Vocabulario, phrasal verbs, collocations y gramática usados en el minijuego.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setBulkOpen(true)} className="rounded-xl gap-2">
            <Upload className="h-4 w-4" />
            Importar JSON
          </Button>
          <Button onClick={openCreate} className="bg-primary hover:bg-primary/90 text-white rounded-xl gap-2">
            <Plus className="h-4 w-4" />
            Nueva pregunta
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por término o pregunta..."
            className="pl-9"
          />
        </div>
        <Select value={levelFilter} onValueChange={setLevelFilter}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los niveles</SelectItem>
            {LEVELS.map((l) => (
              <SelectItem key={l} value={l}>
                {l}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los tipos</SelectItem>
            {TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {TYPE_LABEL[t]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={nodeFilter} onValueChange={setNodeFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los nodos</SelectItem>
            <SelectItem value="unassigned">Sin asignar</SelectItem>
            {NODE_OPTIONS.map((n) => (
              <SelectItem key={n.index} value={String(n.index)}>
                {n.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-sm text-slate-400">{filtered.length} preguntas</span>
      </div>

      {/* Table */}
      <div className="dashboard-card overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400">Cargando...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400">No hay preguntas que coincidan con los filtros.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Término</TableHead>
                <TableHead>Nivel</TableHead>
                <TableHead>Nodo</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Formato</TableHead>
                <TableHead>Dificultad</TableHead>
                <TableHead>Pregunta</TableHead>
                <TableHead>Activo</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((q) => (
                <TableRow key={q.id} className={!q.active ? "opacity-50" : ""}>
                  <TableCell className="font-medium">{q.word_survivor_terms?.term ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{q.level}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-slate-500">
                    {q.node_index ? q.node_index : <span className="text-amber-600">Sin asignar</span>}
                  </TableCell>
                  <TableCell className="text-sm text-slate-500">{TYPE_LABEL[q.type] ?? q.type}</TableCell>
                  <TableCell>
                    <Badge variant={q.format === "multiple_choice" ? "outline" : "secondary"}>
                      {FORMAT_LABEL[q.format] ?? q.format}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-slate-500">{q.difficulty}/5</TableCell>
                  <TableCell className="text-sm text-slate-600 max-w-xs truncate">{q.prompt}</TableCell>
                  <TableCell>
                    <Switch
                      checked={q.active}
                      onCheckedChange={(v) => toggleActive.mutate({ id: q.id, active: v })}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="icon" variant="ghost" onClick={() => openEdit(q)} className="h-8 w-8 text-slate-400 hover:text-primary">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        if (confirm("¿Eliminar esta pregunta?")) remove.mutate(q.id);
                      }}
                      className="h-8 w-8 text-slate-400 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Create / Edit dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl light max-h-[90vh] overflow-y-auto" style={{ colorScheme: "light" }}>
          <DialogHeader>
            <DialogTitle>{editing ? "Editar pregunta" : "Nueva pregunta"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-1">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Término *</Label>
                <Input value={form.term} onChange={(e) => setForm({ ...form, term: e.target.value })} placeholder="Ej: meticulous" />
              </div>
              <div className="space-y-1.5">
                <Label>Significado *</Label>
                <Input
                  value={form.meaning}
                  onChange={(e) => setForm({ ...form, meaning: e.target.value })}
                  placeholder="Showing great attention to detail."
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Frase de ejemplo</Label>
              <Input
                value={form.example_sentence}
                onChange={(e) => setForm({ ...form, example_sentence: e.target.value })}
                placeholder="She is meticulous when preparing reports."
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label>Nivel *</Label>
                <Select value={form.level} onValueChange={(v) => setForm({ ...form, level: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LEVELS.map((l) => (
                      <SelectItem key={l} value={l}>
                        {l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Tipo *</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {TYPE_LABEL[t]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Dificultad *</Label>
                <Select value={String(form.difficulty)} onValueChange={(v) => setForm({ ...form, difficulty: Number(v) })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map((d) => (
                      <SelectItem key={d} value={String(d)}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Formato *</Label>
              <Select value={form.format} onValueChange={(v) => setForm({ ...form, format: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FORMATS.map((f) => (
                    <SelectItem key={f} value={f}>
                      {FORMAT_LABEL[f]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Nodo *</Label>
              <Select
                value={form.nodeIndex ? String(form.nodeIndex) : ""}
                onValueChange={(v) => setForm({ ...form, nodeIndex: Number(v) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona en qué nodo aparece esta pregunta" />
                </SelectTrigger>
                <SelectContent>
                  {NODE_OPTIONS.map((n) => (
                    <SelectItem key={n.index} value={String(n.index)}>
                      {n.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.nodeIndex && (
                <p className="text-xs text-slate-500">
                  Formatos recomendados para este nodo:{" "}
                  {FORMATS_BY_NODE_KIND[NODE_OPTIONS[form.nodeIndex - 1].kind].map((f) => FORMAT_LABEL[f]).join(", ")}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>
                {form.format === "key_word_transformation"
                  ? "Frase original *"
                  : form.format === "word_formation"
                    ? "Frase con espacio en blanco (usa ___) *"
                    : "Pregunta *"}
              </Label>
              <Textarea
                value={form.prompt}
                onChange={(e) => setForm({ ...form, prompt: e.target.value })}
                placeholder={
                  form.format === "key_word_transformation"
                    ? "It isn't necessary for you to finish the report today."
                    : form.format === "word_formation"
                      ? "I have always been interested in ___ matters."
                      : "She is extremely ___ when preparing reports."
                }
                rows={2}
              />
            </div>

            {form.format === "key_word_transformation" && (
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label>Palabra clave *</Label>
                  <Input
                    value={form.keyWord}
                    onChange={(e) => setForm({ ...form, keyWord: e.target.value })}
                    placeholder="NEED"
                  />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label>Segunda frase (con ___) *</Label>
                  <Input
                    value={form.transformPrompt}
                    onChange={(e) => setForm({ ...form, transformPrompt: e.target.value })}
                    placeholder="You ___ the report today."
                  />
                </div>
              </div>
            )}

            {form.format === "word_formation" && (
              <div className="space-y-1.5">
                <Label>Palabra raíz *</Label>
                <Input
                  value={form.keyWord}
                  onChange={(e) => setForm({ ...form, keyWord: e.target.value })}
                  placeholder="POLITICS"
                />
              </div>
            )}

            {form.format === "multiple_choice" ? (
              <div className="space-y-1.5">
                <Label>Opciones * (marca la correcta)</Label>
                <div className="grid grid-cols-2 gap-2">
                  {form.options.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="correctIndex"
                        checked={form.correctIndex === i}
                        onChange={() => setForm({ ...form, correctIndex: i })}
                        className="accent-primary"
                      />
                      <Input value={opt} onChange={(e) => setOption(i, e.target.value)} placeholder={`Opción ${i + 1}`} />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                <Label>Respuestas aceptadas * (separadas por coma)</Label>
                <Input
                  value={form.acceptedAnswers}
                  onChange={(e) => setForm({ ...form, acceptedAnswers: e.target.value })}
                  placeholder={
                    form.format === "key_word_transformation"
                      ? "don't need to finish, do not need to finish"
                      : "generous"
                  }
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label>Explicación (tip)</Label>
              <Textarea
                value={form.tip}
                onChange={(e) => setForm({ ...form, tip: e.target.value })}
                placeholder="'Meticulous' means showing great attention to detail."
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Tags (separados por coma)</Label>
                <Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="cambridge-c1, adjectives" />
              </div>
              <div className="flex items-end gap-3 pb-1">
                <Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} id="active-switch" />
                <Label htmlFor="active-switch">{form.active ? "Activa" : "Inactiva"}</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => save.mutate()}
              disabled={
                !form.term.trim() ||
                !form.meaning.trim() ||
                !form.prompt.trim() ||
                !form.nodeIndex ||
                save.isPending ||
                (form.format === "multiple_choice"
                  ? form.options.some((o) => !o.trim())
                  : !form.acceptedAnswers.trim() ||
                    (form.format === "key_word_transformation" && (!form.keyWord.trim() || !form.transformPrompt.trim())) ||
                    (form.format === "word_formation" && !form.keyWord.trim()))
              }
              className="bg-primary hover:bg-primary/90 text-white"
            >
              {save.isPending ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk import dialog */}
      <Dialog open={bulkOpen} onOpenChange={setBulkOpen}>
        <DialogContent className="max-w-2xl light" style={{ colorScheme: "light" }}>
          <DialogHeader>
            <DialogTitle>Importar preguntas (JSON)</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="border border-primary/20 rounded-lg p-3 bg-primary/5 space-y-2">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-800">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Generar contenido con IA
                </div>
                <Button variant="outline" size="sm" onClick={openPromptDialog}>
                  <Copy className="h-3 w-3 mr-1" /> Ver prompt
                </Button>
              </div>
              <p className="text-xs text-slate-500">
                Copia el prompt para el nivel que quieras, edítalo con tu tema en Claude (o similar) y pega aquí
                el JSON que te devuelva. El prompt ya pide variedad de formato (multiple choice, cloze, word
                formation, key word transformation) y de tipo (vocabulary, phrasal verb, collocation, grammar).
              </p>
            </div>
            <p className="text-sm text-slate-500">
              Pega un array de términos. Cada término puede traer varias preguntas. "format" es opcional
              (por defecto "multiple_choice"); para "cloze", "key_word_transformation" y "word_formation" usa
              "acceptedAnswers" en vez de "options"/"correctIndex". "keyWord" + "transformPrompt" son para
              key_word_transformation; "word_formation" solo necesita "keyWord" (la palabra raíz en mayúsculas).
              "nodeIndex" (1-12) es opcional para asignar el nodo de una vez al importar; si lo omites, la
              pregunta queda "Sin asignar" y puedes elegir su nodo después desde la tabla:
            </p>
            <pre className="text-xs bg-slate-50 border border-slate-200 rounded-lg p-3 overflow-x-auto text-slate-600">
{`[{
  "term": "meticulous",
  "meaning": "Showing great attention to detail.",
  "example_sentence": "She is meticulous when preparing reports.",
  "level": "C1",
  "type": "vocabulary",
  "questions": [{
    "prompt": "She is extremely ___ when preparing reports.",
    "options": ["meticulous", "careless", "hasty", "indifferent"],
    "correctIndex": 0,
    "difficulty": 3,
    "tip": "'Meticulous' means showing great attention to detail.",
    "tags": ["cambridge-c1"]
  }]
}, {
  "term": "need",
  "meaning": "'Don't need to' expresses a lack of obligation.",
  "level": "B2",
  "type": "grammar",
  "questions": [{
    "format": "key_word_transformation",
    "prompt": "It isn't necessary for you to finish the report today.",
    "keyWord": "NEED",
    "transformPrompt": "You ___ the report today.",
    "acceptedAnswers": ["don't need to finish", "do not need to finish"],
    "difficulty": 3,
    "tip": "'Don't need to' expresses lack of obligation."
  }]
}]`}
            </pre>
            <Textarea
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              placeholder="Pega aquí el JSON..."
              rows={10}
              className="font-mono text-xs"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={runBulkImport} disabled={!bulkText.trim() || bulkBusy} className="bg-primary hover:bg-primary/90 text-white">
              {bulkBusy ? "Importando..." : "Importar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI prompt dialog */}
      <Dialog open={promptOpen} onOpenChange={setPromptOpen}>
        <DialogContent className="max-w-2xl light" style={{ colorScheme: "light" }}>
          <DialogHeader>
            <DialogTitle>Prompt para generar preguntas con IA</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Nivel objetivo</Label>
              <Select
                value={promptLevel}
                onValueChange={(v) => {
                  setPromptLevel(v);
                  setPromptText(getWordSurvivorPrompt(v));
                }}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LEVELS.map((l) => (
                    <SelectItem key={l} value={l}>
                      {l} — {LEVEL_EXAM_NAME[l]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="text-sm text-slate-500">
              Copia este prompt, pégalo en Claude (o similar), opcionalmente edita la línea de "TEMA" con un
              enfoque específico, y pega el JSON que te devuelva en el cuadro de "Importar preguntas".
            </p>
            <Textarea value={promptText} readOnly rows={16} className="font-mono text-xs" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPromptOpen(false)}>
              Cerrar
            </Button>
            <Button onClick={copyPrompt} className="bg-primary hover:bg-primary/90 text-white gap-2">
              <Copy className="h-4 w-4" /> Copiar prompt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminWordSurvivor;
