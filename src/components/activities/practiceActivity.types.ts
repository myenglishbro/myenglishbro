// Auto-gradable activity subset for course-lesson practice (no persisted
// scores, no teacher grading workflow — this is instant-feedback practice).
export type PracticeActivityType =
  | "multiple_matching" | "fill_blanks" | "multiple_choice"
  | "use_of_english" | "reading" | "listening"
  | "multiple_choice_cloze" | "open_cloze" | "word_formation"
  | "drag_drop_gapfill" | "drag_drop_reorder" | "drag_drop_categorize";

export type MatchingPair = { id: string; left: string; right: string };
export type BlankItem = { id: string; answer: string; options: string };
export type McQuestion = { id: string; question: string; options: string[]; correctIndex: number };
export type KeyWordItem = { id: string; sentence: string; keyword: string; gapPrefix: string; gapSuffix: string; answer: string };

export type MatchingContent = { pairs: MatchingPair[] };
export type FillBlanksContent = { template: string; blanks: BlankItem[] };
export type MultipleChoiceContent = { questions: McQuestion[] };
export type UseOfEnglishContent = { items: KeyWordItem[] };
export type ReadingContent = { passage: string; questions: McQuestion[] };
export type ListeningContent = { audio_url: string; questions: McQuestion[] };

// --- Cambridge-style cloze family (Use of English Parts 1-3) ---
// `text` holds "___" markers, one per gap, in order (same authoring convention as fill_blanks' template).
export type ClozeMcGap = { id: string; options: string[]; correctIndex: number };
export type MultipleChoiceClozeContent = { text: string; gaps: ClozeMcGap[] };

export type OpenClozeGap = { id: string; answer: string; acceptableAnswers: string };
export type OpenClozeContent = { text: string; gaps: OpenClozeGap[] };

export type WordFormationGap = { id: string; rootWord: string; answer: string; acceptableAnswers: string };
export type WordFormationContent = { text: string; gaps: WordFormationGap[] };

// --- Drag & drop family ---
export type DragGapItem = { id: string; answer: string };
export type DragDropGapfillContent = { text: string; wordBank: string[]; gaps: DragGapItem[] };

export type ReorderItem = { id: string; text: string };
export type ReorderContent = { items: ReorderItem[] }; // items in correct order

export type CategorizeCategory = { id: string; label: string };
export type CategorizeItem = { id: string; text: string; categoryId: string };
export type CategorizeContent = { categories: CategorizeCategory[]; items: CategorizeItem[] };

export type PracticeActivityContent =
  | MatchingContent | FillBlanksContent | MultipleChoiceContent
  | UseOfEnglishContent | ReadingContent | ListeningContent
  | MultipleChoiceClozeContent | OpenClozeContent | WordFormationContent
  | DragDropGapfillContent | ReorderContent | CategorizeContent;

export type CursoActividad = {
  id: string;
  leccion_id: string;
  titulo: string;
  instrucciones: string | null;
  tipo: PracticeActivityType;
  contenido: PracticeActivityContent;
  activo: boolean;
  order_index: number;
};

export function normalizeAnswer(s: string) {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

export function matchesAny(given: string, answer: string, acceptableAnswers: string) {
  const accepted = [answer, ...acceptableAnswers.split(",").map((s) => s.trim()).filter(Boolean)].map(normalizeAnswer);
  return accepted.includes(normalizeAnswer(given));
}

// Parses "___" markers from cloze-style text into a gap array, preserving existing
// gap data by position (same convention as fill_blanks' parseBlanksFromTemplate).
export function parseClozeGaps<G extends { id: string }>(text: string, existing: G[], makeDefault: (id: string) => G): G[] {
  const count = (text.match(/___/g) || []).length;
  const result: G[] = [];
  for (let i = 0; i < count; i++) result.push(existing[i] || makeDefault((i + 1).toString()));
  return result;
}

export type ClozeSegment = { kind: "text"; value: string } | { kind: "gap"; index: number };
export function splitClozeText(text: string): ClozeSegment[] {
  const parts = text.split("___");
  const segments: ClozeSegment[] = [];
  parts.forEach((part, i) => {
    if (part) segments.push({ kind: "text", value: part });
    if (i < parts.length - 1) segments.push({ kind: "gap", index: i });
  });
  return segments;
}

export function scoreMatching(pairs: MatchingPair[], matches: Record<string, string>) {
  return { correctas: pairs.filter((p) => matches[p.id] === p.id).length, total: pairs.length };
}
export function scoreFillBlanks(blanks: BlankItem[], answers: Record<string, string>) {
  return {
    correctas: blanks.filter((b) => normalizeAnswer(answers[b.id] || "") === normalizeAnswer(b.answer)).length,
    total: blanks.length,
  };
}
export function scoreMultipleChoice(questions: McQuestion[], answers: Record<string, number>) {
  return { correctas: questions.filter((q) => answers[q.id] === q.correctIndex).length, total: questions.length };
}
export function scoreUseOfEnglish(items: KeyWordItem[], answers: Record<string, string>) {
  return {
    correctas: items.filter((it) => normalizeAnswer(answers[it.id] || "") === normalizeAnswer(it.answer)).length,
    total: items.length,
  };
}

export function scoreMultipleChoiceCloze(gaps: ClozeMcGap[], answers: Record<string, number>) {
  return { correctas: gaps.filter((g) => answers[g.id] === g.correctIndex).length, total: gaps.length };
}
export function scoreOpenCloze(gaps: OpenClozeGap[], answers: Record<string, string>) {
  return { correctas: gaps.filter((g) => matchesAny(answers[g.id] || "", g.answer, g.acceptableAnswers)).length, total: gaps.length };
}
export function scoreWordFormation(gaps: WordFormationGap[], answers: Record<string, string>) {
  return { correctas: gaps.filter((g) => matchesAny(answers[g.id] || "", g.answer, g.acceptableAnswers)).length, total: gaps.length };
}
export function scoreDragDropGapfill(gaps: DragGapItem[], answers: Record<string, string>) {
  return { correctas: gaps.filter((g) => normalizeAnswer(answers[g.id] || "") === normalizeAnswer(g.answer)).length, total: gaps.length };
}
export function scoreReorder(items: ReorderItem[], order: string[]) {
  return { correctas: items.filter((it, i) => order[i] === it.id).length, total: items.length };
}
export function scoreCategorize(items: CategorizeItem[], placements: Record<string, string>) {
  return { correctas: items.filter((it) => placements[it.id] === it.categoryId).length, total: items.length };
}

// Converts a { correctas, total } result into a points value out of maxScore (salon activities are worth points, practice ones are not).
export function toMaxScore(result: { correctas: number; total: number }, maxScore: number) {
  if (!result.total) return 0;
  return Math.round((result.correctas / result.total) * maxScore);
}

// Builds an "answers" object that is 100% correct for a given type — used by the
// activity preview so a teacher can toggle between an empty view and a fully
// solved view without needing a real student submission.
export function getPreviewCorrectAnswers(tipo: PracticeActivityType, contenido: PracticeActivityContent): unknown {
  switch (tipo) {
    case "multiple_matching":
      return Object.fromEntries((contenido as MatchingContent).pairs.map((p) => [p.id, p.id]));
    case "fill_blanks":
      return Object.fromEntries((contenido as FillBlanksContent).blanks.map((b) => [b.id, b.answer]));
    case "multiple_choice":
      return Object.fromEntries((contenido as MultipleChoiceContent).questions.map((q) => [q.id, q.correctIndex]));
    case "use_of_english":
      return Object.fromEntries((contenido as UseOfEnglishContent).items.map((it) => [it.id, it.answer]));
    case "reading":
      return Object.fromEntries((contenido as ReadingContent).questions.map((q) => [q.id, q.correctIndex]));
    case "listening":
      return Object.fromEntries((contenido as ListeningContent).questions.map((q) => [q.id, q.correctIndex]));
    case "multiple_choice_cloze":
      return Object.fromEntries((contenido as MultipleChoiceClozeContent).gaps.map((g) => [g.id, g.correctIndex]));
    case "open_cloze":
      return Object.fromEntries((contenido as OpenClozeContent).gaps.map((g) => [g.id, g.answer]));
    case "word_formation":
      return Object.fromEntries((contenido as WordFormationContent).gaps.map((g) => [g.id, g.answer]));
    case "drag_drop_gapfill":
      return Object.fromEntries((contenido as DragDropGapfillContent).gaps.map((g) => [g.id, g.answer]));
    case "drag_drop_reorder":
      return (contenido as ReorderContent).items.map((it) => it.id);
    case "drag_drop_categorize":
      return Object.fromEntries((contenido as CategorizeContent).items.map((it) => [it.id, it.categoryId]));
    default:
      return {};
  }
}

export function getPreviewEmptyAnswers(tipo: PracticeActivityType): unknown {
  return tipo === "drag_drop_reorder" ? [] : {};
}

export const TIPO_LABELS: Record<PracticeActivityType, string> = {
  multiple_matching: "Multiple Matching",
  fill_blanks: "Fill in the Blanks",
  multiple_choice: "Multiple Choice",
  use_of_english: "Use of English",
  reading: "Reading",
  listening: "Listening",
  multiple_choice_cloze: "Multiple-Choice Cloze",
  open_cloze: "Open Cloze",
  word_formation: "Word Formation",
  drag_drop_gapfill: "Drag & Drop Gap Fill",
  drag_drop_reorder: "Reorder",
  drag_drop_categorize: "Categorize",
};

export const TIPO_COLORS: Record<PracticeActivityType, string> = {
  multiple_matching: "bg-blue-100 text-blue-700",
  fill_blanks: "bg-amber-100 text-amber-700",
  multiple_choice: "bg-purple-100 text-purple-700",
  use_of_english: "bg-indigo-100 text-indigo-700",
  reading: "bg-cyan-100 text-cyan-700",
  listening: "bg-orange-100 text-orange-700",
  multiple_choice_cloze: "bg-fuchsia-100 text-fuchsia-700",
  open_cloze: "bg-teal-100 text-teal-700",
  word_formation: "bg-lime-100 text-lime-700",
  drag_drop_gapfill: "bg-sky-100 text-sky-700",
  drag_drop_reorder: "bg-violet-100 text-violet-700",
  drag_drop_categorize: "bg-yellow-100 text-yellow-700",
};
