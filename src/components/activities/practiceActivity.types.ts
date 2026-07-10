// Auto-gradable activity subset for course-lesson practice (no persisted
// scores, no teacher grading workflow — this is instant-feedback practice).
export type PracticeActivityType =
  | "multiple_matching" | "fill_blanks" | "multiple_choice"
  | "use_of_english" | "reading" | "listening";

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

export type PracticeActivityContent =
  | MatchingContent | FillBlanksContent | MultipleChoiceContent
  | UseOfEnglishContent | ReadingContent | ListeningContent;

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

export const TIPO_LABELS: Record<PracticeActivityType, string> = {
  multiple_matching: "Multiple Matching",
  fill_blanks: "Fill in the Blanks",
  multiple_choice: "Multiple Choice",
  use_of_english: "Use of English",
  reading: "Reading",
  listening: "Listening",
};

export const TIPO_COLORS: Record<PracticeActivityType, string> = {
  multiple_matching: "bg-blue-100 text-blue-700",
  fill_blanks: "bg-amber-100 text-amber-700",
  multiple_choice: "bg-purple-100 text-purple-700",
  use_of_english: "bg-indigo-100 text-indigo-700",
  reading: "bg-cyan-100 text-cyan-700",
  listening: "bg-orange-100 text-orange-700",
};
