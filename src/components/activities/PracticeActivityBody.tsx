import { useState } from "react";
import { Input } from "@/components/ui/input";
import { CheckCircle2 } from "lucide-react";
import {
  MatchingContent, FillBlanksContent, MultipleChoiceContent,
  UseOfEnglishContent, ReadingContent, ListeningContent,
} from "./practiceActivity.types";

export function MatchingPractice({
  content, answers, onChange, checked,
}: {
  content: MatchingContent;
  answers: Record<string, string>;
  onChange: (matches: Record<string, string>) => void;
  checked: boolean;
}) {
  const [shuffled] = useState(() => [...content.pairs].sort(() => Math.random() - 0.5));

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
            {checked ? (
              <div className={`p-3 rounded-lg text-sm font-medium text-center ${
                answers[pair.id] === pair.id ? "bg-green-50 border border-green-200 text-green-700" : "bg-red-50 border border-red-200 text-red-700"
              }`}>
                {content.pairs.find((p) => p.id === answers[pair.id])?.right || "(Sin respuesta)"}
              </div>
            ) : (
              <select
                className="w-full p-3 rounded-lg border text-sm bg-white"
                value={answers[pair.id] || ""}
                onChange={(e) => onChange({ ...answers, [pair.id]: e.target.value })}
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

export function FillBlanksPractice({
  content, answers, onChange, checked,
}: {
  content: FillBlanksContent;
  answers: Record<string, string>;
  onChange: (answers: Record<string, string>) => void;
  checked: boolean;
}) {
  const parts = content.template.split("___");
  let blankIndex = 0;

  return (
    <p className="text-sm leading-relaxed whitespace-pre-wrap">
      {parts.map((part, i) => {
        const blank = content.blanks[blankIndex];
        blankIndex++;
        const hasOptions = blank?.options && blank.options.trim().length > 0;
        const options = hasOptions ? blank.options.split(",").map((o) => o.trim()) : [];
        const isCorrect = checked && blank && (answers[blank.id] || "").trim().toLowerCase() === blank.answer.trim().toLowerCase();

        return (
          <span key={i}>
            {part}
            {i < parts.length - 1 && blank && (
              hasOptions && !checked ? (
                <select
                  className="mx-1 px-2 py-0.5 border-b-2 border-primary bg-transparent text-sm focus:outline-none"
                  value={answers[blank.id] || ""}
                  onChange={(e) => onChange({ ...answers, [blank.id]: e.target.value })}
                >
                  <option value="">___</option>
                  {options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              ) : (
                <span className={`mx-1 inline-block ${checked ? (isCorrect ? "text-green-600 font-bold" : "text-red-600 font-bold") : ""}`}>
                  {checked ? (
                    `[${answers[blank.id] || "?"}]${!isCorrect ? ` (${blank.answer})` : ""}`
                  ) : (
                    <input
                      type="text"
                      className="border-b-2 border-primary bg-transparent w-24 px-1 py-0.5 text-sm focus:outline-none"
                      value={answers[blank.id] || ""}
                      onChange={(e) => onChange({ ...answers, [blank.id]: e.target.value })}
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
  );
}

export function MultipleChoicePractice({
  content, answers, onChange, checked,
}: {
  content: MultipleChoiceContent;
  answers: Record<string, number>;
  onChange: (answers: Record<string, number>) => void;
  checked: boolean;
}) {
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
              if (checked) {
                if (isCorrectOption) optClasses = "border-green-300 bg-green-50 text-green-700";
                else if (selected) optClasses = "border-red-300 bg-red-50 text-red-700";
                else optClasses = "border-muted opacity-60";
              } else if (selected) {
                optClasses = "border-primary bg-primary/5";
              }
              return (
                <label
                  key={oi}
                  className={`flex items-center gap-2 p-2.5 rounded-lg border text-sm cursor-pointer ${optClasses} ${checked ? "cursor-default" : ""}`}
                >
                  <input
                    type="radio"
                    name={`mc-${q.id}`}
                    checked={selected}
                    onChange={() => onChange({ ...answers, [q.id]: oi })}
                    disabled={checked}
                  />
                  <span className="flex-1">{opt}</span>
                  {checked && isCorrectOption && <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />}
                </label>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export function UseOfEnglishPractice({
  content, answers, onChange, checked,
}: {
  content: UseOfEnglishContent;
  answers: Record<string, string>;
  onChange: (answers: Record<string, string>) => void;
  checked: boolean;
}) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Completa la segunda oración usando la palabra clave, sin cambiarla, para que signifique lo mismo que la primera.
      </p>
      {content.items.map((item, i) => {
        const isCorrect = checked && (answers[item.id] || "").trim().toLowerCase().replace(/\s+/g, " ") === item.answer.trim().toLowerCase().replace(/\s+/g, " ");
        return (
          <div key={item.id} className="space-y-1.5 border-b pb-3 last:border-b-0">
            <p className="text-sm font-medium">{i + 1}. {item.sentence}</p>
            <p className="text-xs text-muted-foreground">
              Palabra clave: <span className="font-mono font-bold text-primary">{item.keyword}</span>
            </p>
            <div className="flex flex-wrap items-center gap-1 text-sm">
              <span>{item.gapPrefix}</span>
              {checked ? (
                <span className={`mx-1 font-bold ${isCorrect ? "text-green-600" : "text-red-600"}`}>
                  {answers[item.id] || "(Sin respuesta)"}
                </span>
              ) : (
                <Input
                  value={answers[item.id] || ""}
                  onChange={(e) => onChange({ ...answers, [item.id]: e.target.value })}
                  className="inline-block w-48 h-8 mx-1"
                  placeholder="..."
                />
              )}
              <span>{item.gapSuffix}</span>
              {checked && (
                isCorrect
                  ? <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                  : <span className="text-xs text-muted-foreground ml-1">(Correcta: {item.answer})</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function ReadingPractice({
  content, answers, onChange, checked,
}: {
  content: ReadingContent;
  answers: Record<string, number>;
  onChange: (answers: Record<string, number>) => void;
  checked: boolean;
}) {
  return (
    <div className="space-y-4">
      <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4 max-h-64 overflow-y-auto">
        <p className="text-sm whitespace-pre-wrap leading-relaxed">{content.passage}</p>
      </div>
      <MultipleChoicePractice content={{ questions: content.questions }} answers={answers} onChange={onChange} checked={checked} />
    </div>
  );
}

export function ListeningPractice({
  content, answers, onChange, checked,
}: {
  content: ListeningContent;
  answers: Record<string, number>;
  onChange: (answers: Record<string, number>) => void;
  checked: boolean;
}) {
  return (
    <div className="space-y-4">
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <audio controls src={content.audio_url} className="w-full" />
      </div>
      <MultipleChoicePractice content={{ questions: content.questions }} answers={answers} onChange={onChange} checked={checked} />
    </div>
  );
}
