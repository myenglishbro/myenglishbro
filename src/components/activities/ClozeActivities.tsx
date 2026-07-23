import { Input } from "@/components/ui/input";
import {
  MultipleChoiceClozeContent, OpenClozeContent, WordFormationContent,
  splitClozeText, matchesAny,
} from "./practiceActivity.types";

const OPTION_LETTERS = ["A", "B", "C", "D", "E", "F"];

export function MultipleChoiceClozeActivity({
  content, answers, onChange, readonly,
}: {
  content: MultipleChoiceClozeContent;
  answers: Record<string, number>;
  onChange?: (answers: Record<string, number>) => void;
  readonly?: boolean;
}) {
  const segments = splitClozeText(content.text);

  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed whitespace-pre-wrap">
        {segments.map((seg, i) =>
          seg.kind === "text" ? (
            <span key={i}>{seg.value}</span>
          ) : (
            <span key={i} className="font-semibold text-primary">({seg.index + 1})</span>
          )
        )}
      </p>
      <div className="space-y-2.5">
        {content.gaps.map((gap, gi) => (
          <div key={gap.id} className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground w-5 shrink-0">({gi + 1})</span>
            {gap.options.map((opt, oi) => {
              const selected = answers[gap.id] === oi;
              const isCorrectOption = oi === gap.correctIndex;
              let cls = "border-muted hover:border-primary/40";
              if (readonly) {
                if (isCorrectOption) cls = "border-green-300 bg-green-50 text-green-700";
                else if (selected) cls = "border-red-300 bg-red-50 text-red-700";
                else cls = "border-muted opacity-50";
              } else if (selected) {
                cls = "border-primary bg-primary/10";
              }
              return (
                <button
                  key={oi}
                  type="button"
                  disabled={readonly}
                  onClick={() => onChange?.({ ...answers, [gap.id]: oi })}
                  className={`px-3 py-1 rounded-full border text-sm ${cls} ${readonly ? "cursor-default" : "cursor-pointer"}`}
                >
                  <span className="font-semibold mr-1">{OPTION_LETTERS[oi]}</span>{opt}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export function OpenClozeActivity({
  content, answers, onChange, readonly,
}: {
  content: OpenClozeContent;
  answers: Record<string, string>;
  onChange?: (answers: Record<string, string>) => void;
  readonly?: boolean;
}) {
  const segments = splitClozeText(content.text);
  return (
    <p className="text-sm leading-relaxed whitespace-pre-wrap">
      {segments.map((seg, i) => {
        if (seg.kind === "text") return <span key={i}>{seg.value}</span>;
        const gap = content.gaps[seg.index];
        const given = answers[gap.id] || "";
        const isCorrect = readonly && matchesAny(given, gap.answer, gap.acceptableAnswers);
        return (
          <span key={i} className="mx-1 inline-flex items-center gap-1">
            <span className="text-xs font-semibold text-muted-foreground">({seg.index + 1})</span>
            {readonly ? (
              <span className={`font-bold ${isCorrect ? "text-green-600" : "text-red-600"}`}>
                {given || "?"}{!isCorrect && ` (${gap.answer})`}
              </span>
            ) : (
              <Input
                value={given}
                onChange={(e) => onChange?.({ ...answers, [gap.id]: e.target.value })}
                className="inline-block w-24 h-7 px-1.5 text-sm"
              />
            )}
          </span>
        );
      })}
    </p>
  );
}

export function WordFormationActivity({
  content, answers, onChange, readonly,
}: {
  content: WordFormationContent;
  answers: Record<string, string>;
  onChange?: (answers: Record<string, string>) => void;
  readonly?: boolean;
}) {
  const segments = splitClozeText(content.text);
  return (
    <p className="text-sm leading-relaxed whitespace-pre-wrap">
      {segments.map((seg, i) => {
        if (seg.kind === "text") return <span key={i}>{seg.value}</span>;
        const gap = content.gaps[seg.index];
        const given = answers[gap.id] || "";
        const isCorrect = readonly && matchesAny(given, gap.answer, gap.acceptableAnswers);
        return (
          <span key={i} className="mx-1 inline-flex items-center gap-1">
            {readonly ? (
              <span className={`font-bold ${isCorrect ? "text-green-600" : "text-red-600"}`}>
                {given || "?"}{!isCorrect && ` (${gap.answer})`}
              </span>
            ) : (
              <Input
                value={given}
                onChange={(e) => onChange?.({ ...answers, [gap.id]: e.target.value })}
                className="inline-block w-28 h-7 px-1.5 text-sm"
              />
            )}
            <span className="text-xs font-mono font-bold text-muted-foreground uppercase">({gap.rootWord})</span>
          </span>
        );
      })}
    </p>
  );
}
