import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { TYPE_META, FORMAT_META, type WordSurvivorQuestion } from "./questions";

interface QuestionPanelProps {
  question: WordSurvivorQuestion;
  feedback: "correct" | "wrong" | null;
  selectedIndex: number | null;
  textValue: string;
  onTextChange: (value: string) => void;
  onAnswerIndex: (index: number) => void;
  onSubmitText: () => void;
  qRatio: number;
  timerColor: string;
}

export const QuestionPanel = ({
  question,
  feedback,
  selectedIndex,
  textValue,
  onTextChange,
  onAnswerIndex,
  onSubmitText,
  qRatio,
  timerColor,
}: QuestionPanelProps) => {
  const isMultipleChoice = question.format === "multiple_choice";

  return (
    <div className="px-5">
      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mb-3">
        <div className={`h-full rounded-full transition-[width] duration-100 ${timerColor}`} style={{ width: `${qRatio * 100}%` }} />
      </div>
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-3">
        <p className={`text-[11px] font-extrabold uppercase tracking-widest mb-2 ${TYPE_META[question.type].accent}`}>
          {TYPE_META[question.type].emoji} {TYPE_META[question.type].label}
        </p>
        {!isMultipleChoice && (
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
            {FORMAT_META[question.format].emoji} {FORMAT_META[question.format].label}
          </p>
        )}
        <p className="text-base sm:text-lg font-bold text-white leading-snug">{question.prompt}</p>
        {question.format === "key_word_transformation" && (
          <>
            <div className="flex items-center gap-2 mt-2 text-xs">
              <span className="text-slate-400">Palabra clave:</span>
              <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-extrabold tracking-wide">
                {question.keyWord}
              </span>
            </div>
            <p className="text-base sm:text-lg font-bold text-white leading-snug mt-2">{question.transformPrompt}</p>
          </>
        )}
        {question.format === "word_formation" && (
          <div className="flex items-center gap-2 mt-2 text-xs">
            <span className="text-slate-400">Palabra raíz:</span>
            <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 font-extrabold tracking-wide">
              {question.keyWord}
            </span>
          </div>
        )}
      </div>

      {isMultipleChoice ? (
        <div className="grid grid-cols-2 gap-2.5 mb-2">
          {(question.options ?? []).map((opt, i) => {
            let stateClasses =
              "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/30 hover:scale-[1.02] active:scale-95 text-slate-100";
            let extraAnim = "";
            if (feedback) {
              if (i === question.correctIndex) {
                stateClasses = "bg-emerald-500/20 border-emerald-400 text-emerald-200 shadow-[0_0_0_4px_rgba(16,185,129,0.35)]";
                extraAnim = "animate-pop-in";
              } else if (i === selectedIndex) {
                stateClasses = "bg-red-500/20 border-red-400 text-red-200";
                extraAnim = "animate-shake";
              } else {
                stateClasses = "bg-white/5 border-white/10 text-slate-500";
              }
            }
            return (
              <button
                key={i}
                disabled={!!feedback}
                onClick={() => onAnswerIndex(i)}
                className={`rounded-xl border-2 px-3 py-3 text-xs sm:text-sm font-bold transition-all duration-150 text-center disabled:cursor-default ${stateClasses} ${extraAnim}`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="mb-2">
          <div className="flex gap-2">
            <input
              value={textValue}
              onChange={(e) => onTextChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onSubmitText();
              }}
              disabled={!!feedback}
              placeholder="Escribe tu respuesta..."
              autoComplete="off"
              className="flex-1 rounded-xl border-2 border-white/10 bg-white/5 px-3 py-3 text-sm font-bold text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-primary/60 disabled:opacity-60"
            />
            <Button
              onClick={onSubmitText}
              disabled={!!feedback || !textValue.trim()}
              className="rounded-xl bg-primary hover:bg-primary/90 text-white"
            >
              <Check className="h-4 w-4" />
            </Button>
          </div>
          {feedback && (
            <p className={`mt-2 text-xs font-bold ${feedback === "correct" ? "text-emerald-300" : "text-red-300"}`}>
              {feedback === "correct" ? `✅ ${textValue}` : `❌ Respuesta correcta: ${question.acceptedAnswers?.[0] ?? ""}`}
            </p>
          )}
        </div>
      )}

      {feedback === "wrong" && <p className="text-[11px] text-slate-400 text-center mb-1">💡 {question.tip}</p>}
    </div>
  );
};
