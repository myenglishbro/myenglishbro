import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Eye, EyeOff } from "lucide-react";
import {
  PracticeActivityType, PracticeActivityContent, TIPO_LABELS, TIPO_COLORS,
  MatchingContent, FillBlanksContent, MultipleChoiceContent, UseOfEnglishContent, ReadingContent, ListeningContent,
  MultipleChoiceClozeContent, OpenClozeContent, WordFormationContent,
  DragDropGapfillContent, ReorderContent, CategorizeContent,
  getPreviewCorrectAnswers, getPreviewEmptyAnswers,
} from "./practiceActivity.types";
import {
  MatchingPractice, FillBlanksPractice, MultipleChoicePractice,
  UseOfEnglishPractice, ReadingPractice, ListeningPractice,
} from "./PracticeActivityBody";
import { MultipleChoiceClozeActivity, OpenClozeActivity, WordFormationActivity } from "./ClozeActivities";
import { DragDropGapfillActivity, DragDropReorderActivity, DragDropCategorizeActivity } from "./DragDropActivities";

// Salon-only content shapes (manually graded, no "correct answer" to preview).
type WritingPreviewContent = { prompt: string; min_words: number; max_words: number };
type OpenQuestionsPreviewContent = { questions: { id: string; question: string }[] };
type SpeakingPreviewContent = { prompt: string; preparation_seconds: number; max_recording_seconds: number };

const MANUALLY_GRADED_TYPES = ["writing", "open_questions", "speaking"];

export function ActivityPreviewDialog({
  open, onOpenChange, titulo, instrucciones, tipo, contenido,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  titulo: string;
  instrucciones?: string;
  tipo: string;
  contenido: unknown;
}) {
  const [showCorrect, setShowCorrect] = useState(false);
  const hasCorrectAnswers = !MANUALLY_GRADED_TYPES.includes(tipo);

  useEffect(() => {
    if (open) setShowCorrect(false);
  }, [open]);

  const practiceTipo = tipo as PracticeActivityType;
  const practiceContent = contenido as PracticeActivityContent;
  const answers = showCorrect
    ? getPreviewCorrectAnswers(practiceTipo, practiceContent)
    : getPreviewEmptyAnswers(practiceTipo);
  const remountKey = `${tipo}-${showCorrect}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 flex-wrap">
            <DialogTitle>{titulo || "(Sin título)"}</DialogTitle>
            {TIPO_LABELS[practiceTipo] && (
              <Badge variant="secondary" className={`text-xs ${TIPO_COLORS[practiceTipo]}`}>
                {TIPO_LABELS[practiceTipo]}
              </Badge>
            )}
          </div>
          {instrucciones && (
            <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{instrucciones}</p>
          )}
        </DialogHeader>

        <div className="mt-2 space-y-4">
          {hasCorrectAnswers && (
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => setShowCorrect((v) => !v)}
            >
              {showCorrect ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              {showCorrect ? "Ver vacío (como estudiante)" : "Ver respuestas correctas"}
            </Button>
          )}

          {tipo === "multiple_matching" && (
            <MatchingPractice key={remountKey} content={contenido as MatchingContent} answers={answers as Record<string, string>} onChange={() => {}} checked={showCorrect} />
          )}
          {tipo === "fill_blanks" && (
            <FillBlanksPractice key={remountKey} content={contenido as FillBlanksContent} answers={answers as Record<string, string>} onChange={() => {}} checked={showCorrect} />
          )}
          {tipo === "multiple_choice" && (
            <MultipleChoicePractice key={remountKey} content={contenido as MultipleChoiceContent} answers={answers as Record<string, number>} onChange={() => {}} checked={showCorrect} />
          )}
          {tipo === "use_of_english" && (
            <UseOfEnglishPractice key={remountKey} content={contenido as UseOfEnglishContent} answers={answers as Record<string, string>} onChange={() => {}} checked={showCorrect} />
          )}
          {tipo === "reading" && (
            <ReadingPractice key={remountKey} content={contenido as ReadingContent} answers={answers as Record<string, number>} onChange={() => {}} checked={showCorrect} />
          )}
          {tipo === "listening" && (
            <ListeningPractice key={remountKey} content={contenido as ListeningContent} answers={answers as Record<string, number>} onChange={() => {}} checked={showCorrect} />
          )}
          {tipo === "multiple_choice_cloze" && (
            <MultipleChoiceClozeActivity key={remountKey} content={contenido as MultipleChoiceClozeContent} answers={answers as Record<string, number>} onChange={() => {}} readonly={showCorrect} />
          )}
          {tipo === "open_cloze" && (
            <OpenClozeActivity key={remountKey} content={contenido as OpenClozeContent} answers={answers as Record<string, string>} onChange={() => {}} readonly={showCorrect} />
          )}
          {tipo === "word_formation" && (
            <WordFormationActivity key={remountKey} content={contenido as WordFormationContent} answers={answers as Record<string, string>} onChange={() => {}} readonly={showCorrect} />
          )}
          {tipo === "drag_drop_gapfill" && (
            <DragDropGapfillActivity key={remountKey} content={contenido as DragDropGapfillContent} answers={answers as Record<string, string>} onChange={() => {}} readonly={showCorrect} />
          )}
          {tipo === "drag_drop_reorder" && (
            <DragDropReorderActivity key={remountKey} content={contenido as ReorderContent} answers={answers as string[]} onChange={() => {}} readonly={showCorrect} />
          )}
          {tipo === "drag_drop_categorize" && (
            <DragDropCategorizeActivity key={remountKey} content={contenido as CategorizeContent} answers={answers as Record<string, string>} onChange={() => {}} readonly={showCorrect} />
          )}

          {tipo === "writing" && (() => {
            const c = contenido as WritingPreviewContent;
            return (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-1">
                <p className="text-sm font-medium text-green-800 whitespace-pre-wrap">{c.prompt || "(Sin consigna)"}</p>
                <p className="text-xs text-green-600">
                  {c.min_words > 0 && `Mín. ${c.min_words} palabras`}
                  {c.min_words > 0 && c.max_words > 0 && " · "}
                  {c.max_words > 0 && `Máx. ${c.max_words} palabras`}
                </p>
                <p className="text-xs text-muted-foreground pt-1">Este tipo se califica manualmente; no hay respuesta correcta que mostrar.</p>
              </div>
            );
          })()}
          {tipo === "open_questions" && (() => {
            const c = contenido as OpenQuestionsPreviewContent;
            return (
              <div className="space-y-3">
                {(c.questions || []).map((q, i) => (
                  <p key={q.id} className="text-sm font-medium whitespace-pre-wrap">{i + 1}. {q.question}</p>
                ))}
                <p className="text-xs text-muted-foreground pt-1">Este tipo se califica manualmente; no hay respuesta correcta que mostrar.</p>
              </div>
            );
          })()}
          {tipo === "speaking" && (() => {
            const c = contenido as SpeakingPreviewContent;
            return (
              <div className="bg-pink-50 border border-pink-200 rounded-lg p-4 space-y-1">
                <p className="text-sm font-medium text-pink-800 whitespace-pre-wrap">{c.prompt || "(Sin consigna)"}</p>
                <p className="text-xs text-pink-600">
                  Preparación: {c.preparation_seconds}s · Grabación máxima: {c.max_recording_seconds}s
                </p>
                <p className="text-xs text-muted-foreground pt-1">Este tipo se califica manualmente; la grabación no está disponible en la vista previa.</p>
              </div>
            );
          })()}

          <div className="flex justify-end pt-2 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cerrar</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
