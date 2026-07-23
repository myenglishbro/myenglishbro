import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X } from "lucide-react";
import {
  MultipleChoiceClozeContent, OpenClozeContent, WordFormationContent,
  DragDropGapfillContent, ReorderContent, CategorizeContent,
  parseClozeGaps,
} from "./practiceActivity.types";

// Shared builder components for the cloze family (Cambridge Use of English Parts 1-3)
// and the drag-and-drop family. Used identically from the teacher (salon_actividades)
// and admin (curso_actividades) editors — the authoring UX doesn't depend on which
// system the activity belongs to.

export function MultipleChoiceClozeBuilder({
  content, onChange,
}: {
  content: MultipleChoiceClozeContent;
  onChange: (content: MultipleChoiceClozeContent) => void;
}) {
  function handleTextChange(text: string) {
    const gaps = parseClozeGaps(text, content.gaps, (id) => ({ id, options: ["", "", "", ""], correctIndex: 0 }));
    onChange({ text, gaps });
  }
  return (
    <div className="space-y-4">
      <div>
        <Label className="font-medium">
          Texto con espacios *
          <span className="text-muted-foreground font-normal ml-2 text-xs">Usa ___ (tres guiones) para cada espacio numerado</span>
        </Label>
        <Textarea value={content.text} onChange={(e) => handleTextChange(e.target.value)} placeholder="I've been ___ (1) English since I was a child..." rows={5} className="mt-1 font-mono text-sm" />
        <p className="text-xs text-muted-foreground mt-1">Espacios detectados: <span className="font-semibold text-primary">{content.gaps.length}</span></p>
      </div>
      {content.gaps.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Opciones para cada espacio (A, B, C, D)</h4>
          {content.gaps.map((gap, gi) => (
            <div key={gap.id} className="border rounded-lg p-3 bg-background space-y-1.5">
              <p className="text-xs font-semibold text-muted-foreground">Espacio ({gi + 1})</p>
              {gap.options.map((opt, oi) => (
                <div key={oi} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`cloze-correct-${gap.id}`}
                    checked={gap.correctIndex === oi}
                    onChange={() => onChange({
                      ...content,
                      gaps: content.gaps.map((g) => (g.id === gap.id ? { ...g, correctIndex: oi } : g)),
                    })}
                    title="Marcar como correcta"
                    className="shrink-0"
                  />
                  <Input
                    value={opt}
                    onChange={(e) => onChange({
                      ...content,
                      gaps: content.gaps.map((g) => (g.id === gap.id ? { ...g, options: g.options.map((o, i) => (i === oi ? e.target.value : o)) } : g)),
                    })}
                    placeholder={`Opción ${String.fromCharCode(65 + oi)}`}
                    className="h-8 text-sm flex-1"
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function OpenClozeBuilder({
  content, onChange,
}: {
  content: OpenClozeContent;
  onChange: (content: OpenClozeContent) => void;
}) {
  function handleTextChange(text: string) {
    const gaps = parseClozeGaps(text, content.gaps, (id) => ({ id, answer: "", acceptableAnswers: "" }));
    onChange({ text, gaps });
  }
  return (
    <div className="space-y-4">
      <div>
        <Label className="font-medium">
          Texto con espacios *
          <span className="text-muted-foreground font-normal ml-2 text-xs">Usa ___ para cada espacio; sin opciones, el estudiante escribe la respuesta</span>
        </Label>
        <Textarea value={content.text} onChange={(e) => handleTextChange(e.target.value)} placeholder="It's been ages ___ (1) I last saw you..." rows={5} className="mt-1 font-mono text-sm" />
        <p className="text-xs text-muted-foreground mt-1">Espacios detectados: <span className="font-semibold text-primary">{content.gaps.length}</span></p>
      </div>
      {content.gaps.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Respuestas para cada espacio</h4>
          {content.gaps.map((gap, gi) => (
            <div key={gap.id} className="flex gap-3 items-start">
              <div className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-2">{gi + 1}</div>
              <div className="flex-1 grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Respuesta correcta *</Label>
                  <Input value={gap.answer} onChange={(e) => onChange({ ...content, gaps: content.gaps.map((g) => (g.id === gap.id ? { ...g, answer: e.target.value } : g)) })} placeholder="since" className="h-8 text-sm" />
                </div>
                <div>
                  <Label className="text-xs">Respuestas alternativas (coma)</Label>
                  <Input value={gap.acceptableAnswers} onChange={(e) => onChange({ ...content, gaps: content.gaps.map((g) => (g.id === gap.id ? { ...g, acceptableAnswers: e.target.value } : g)) })} placeholder="opcional" className="h-8 text-sm" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function WordFormationBuilder({
  content, onChange,
}: {
  content: WordFormationContent;
  onChange: (content: WordFormationContent) => void;
}) {
  function handleTextChange(text: string) {
    const gaps = parseClozeGaps(text, content.gaps, (id) => ({ id, rootWord: "", answer: "", acceptableAnswers: "" }));
    onChange({ text, gaps });
  }
  return (
    <div className="space-y-4">
      <div>
        <Label className="font-medium">
          Texto con espacios *
          <span className="text-muted-foreground font-normal ml-2 text-xs">Usa ___ para cada espacio</span>
        </Label>
        <Textarea value={content.text} onChange={(e) => handleTextChange(e.target.value)} placeholder="I was really ___ (1) with the film..." rows={5} className="mt-1 font-mono text-sm" />
        <p className="text-xs text-muted-foreground mt-1">Espacios detectados: <span className="font-semibold text-primary">{content.gaps.length}</span></p>
      </div>
      {content.gaps.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Palabra raíz y respuesta de cada espacio</h4>
          {content.gaps.map((gap, gi) => (
            <div key={gap.id} className="flex gap-3 items-start">
              <div className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-2">{gi + 1}</div>
              <div className="flex-1 grid grid-cols-3 gap-2">
                <div>
                  <Label className="text-xs">Palabra raíz *</Label>
                  <Input value={gap.rootWord} onChange={(e) => onChange({ ...content, gaps: content.gaps.map((g) => (g.id === gap.id ? { ...g, rootWord: e.target.value } : g)) })} placeholder="DISAPPOINT" className="h-8 text-sm font-mono uppercase" />
                </div>
                <div>
                  <Label className="text-xs">Respuesta correcta *</Label>
                  <Input value={gap.answer} onChange={(e) => onChange({ ...content, gaps: content.gaps.map((g) => (g.id === gap.id ? { ...g, answer: e.target.value } : g)) })} placeholder="disappointed" className="h-8 text-sm" />
                </div>
                <div>
                  <Label className="text-xs">Alternativas (coma)</Label>
                  <Input value={gap.acceptableAnswers} onChange={(e) => onChange({ ...content, gaps: content.gaps.map((g) => (g.id === gap.id ? { ...g, acceptableAnswers: e.target.value } : g)) })} placeholder="opcional" className="h-8 text-sm" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function DragDropGapfillBuilder({
  content, onChange,
}: {
  content: DragDropGapfillContent;
  onChange: (content: DragDropGapfillContent) => void;
}) {
  function handleTextChange(text: string) {
    const gaps = parseClozeGaps(text, content.gaps, (id) => ({ id, answer: "" }));
    onChange({ ...content, text, gaps });
  }
  return (
    <div className="space-y-4">
      <div>
        <Label className="font-medium">
          Texto con espacios *
          <span className="text-muted-foreground font-normal ml-2 text-xs">Usa ___ para cada espacio</span>
        </Label>
        <Textarea value={content.text} onChange={(e) => handleTextChange(e.target.value)} placeholder="She has lived here ___ (1) five years..." rows={5} className="mt-1 font-mono text-sm" />
        <p className="text-xs text-muted-foreground mt-1">Espacios detectados: <span className="font-semibold text-primary">{content.gaps.length}</span></p>
      </div>
      {content.gaps.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Respuesta correcta de cada espacio</h4>
          {content.gaps.map((gap, gi) => (
            <div key={gap.id} className="flex gap-3 items-center">
              <div className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">{gi + 1}</div>
              <Input value={gap.answer} onChange={(e) => onChange({ ...content, gaps: content.gaps.map((g) => (g.id === gap.id ? { ...g, answer: e.target.value } : g)) })} placeholder="for" className="h-8 text-sm flex-1" />
            </div>
          ))}
        </div>
      )}
      <div>
        <Label className="font-medium">
          Banco de palabras (una por línea) *
          <span className="text-muted-foreground font-normal ml-2 text-xs">Incluye las respuestas correctas; puedes agregar palabras de distracción</span>
        </Label>
        <Textarea
          value={content.wordBank.join("\n")}
          onChange={(e) => onChange({ ...content, wordBank: e.target.value.split("\n") })}
          placeholder={"for\nsince\nduring"}
          rows={4}
          className="mt-1 font-mono text-sm"
        />
      </div>
    </div>
  );
}

export function ReorderBuilder({
  content, onChange,
}: {
  content: ReorderContent;
  onChange: (content: ReorderContent) => void;
}) {
  function addItem() {
    onChange({ items: [...content.items, { id: Date.now().toString(), text: "" }] });
  }
  function removeItem(id: string) {
    onChange({ items: content.items.filter((it) => it.id !== id) });
  }
  function updateItem(id: string, text: string) {
    onChange({ items: content.items.map((it) => (it.id === id ? { ...it, text } : it)) });
  }
  function moveItem(index: number, dir: -1 | 1) {
    const next = [...content.items];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange({ items: next });
  }
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-sm">Orden correcto</h3>
        <Button variant="outline" size="sm" onClick={addItem}><Plus className="h-3 w-3 mr-1" /> Agregar ítem</Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Escribe los ítems (oraciones o palabras) en el orden correcto — al estudiante se le mostrarán mezclados.
      </p>
      <div className="space-y-2">
        {content.items.map((item, i) => (
          <div key={item.id} className="flex items-center gap-2">
            <div className="flex flex-col shrink-0">
              <button type="button" onClick={() => moveItem(i, -1)} disabled={i === 0} className="text-muted-foreground disabled:opacity-30 text-xs leading-none px-1">▲</button>
              <button type="button" onClick={() => moveItem(i, 1)} disabled={i === content.items.length - 1} className="text-muted-foreground disabled:opacity-30 text-xs leading-none px-1">▼</button>
            </div>
            <div className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</div>
            <Input value={item.text} onChange={(e) => updateItem(item.id, e.target.value)} placeholder={`Ítem ${i + 1}`} className="flex-1" />
            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive h-8 w-8 shrink-0" onClick={() => removeItem(item.id)} disabled={content.items.length === 1}>
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CategorizeBuilder({
  content, onChange,
}: {
  content: CategorizeContent;
  onChange: (content: CategorizeContent) => void;
}) {
  function addCategory() {
    const id = Date.now().toString();
    onChange({ ...content, categories: [...content.categories, { id, label: "" }] });
  }
  function removeCategory(id: string) {
    onChange({
      categories: content.categories.filter((c) => c.id !== id),
      items: content.items.map((it) => (it.categoryId === id ? { ...it, categoryId: "" } : it)),
    });
  }
  function updateCategory(id: string, label: string) {
    onChange({ ...content, categories: content.categories.map((c) => (c.id === id ? { ...c, label } : c)) });
  }
  function addItem() {
    onChange({ ...content, items: [...content.items, { id: Date.now().toString(), text: "", categoryId: content.categories[0]?.id || "" }] });
  }
  function removeItem(id: string) {
    onChange({ ...content, items: content.items.filter((it) => it.id !== id) });
  }
  function updateItemText(id: string, text: string) {
    onChange({ ...content, items: content.items.map((it) => (it.id === id ? { ...it, text } : it)) });
  }
  function updateItemCategory(id: string, categoryId: string) {
    onChange({ ...content, items: content.items.map((it) => (it.id === id ? { ...it, categoryId } : it)) });
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium text-sm">Categorías</h3>
          <Button variant="outline" size="sm" onClick={addCategory}><Plus className="h-3 w-3 mr-1" /> Agregar categoría</Button>
        </div>
        <div className="space-y-2">
          {content.categories.map((cat) => (
            <div key={cat.id} className="flex items-center gap-2">
              <Input value={cat.label} onChange={(e) => updateCategory(cat.id, e.target.value)} placeholder="Ej: Present Simple" className="flex-1" />
              <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive h-8 w-8 shrink-0" onClick={() => removeCategory(cat.id)} disabled={content.categories.length === 1}>
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t pt-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium text-sm">Ítems a clasificar</h3>
          <Button variant="outline" size="sm" onClick={addItem} disabled={content.categories.length === 0}><Plus className="h-3 w-3 mr-1" /> Agregar ítem</Button>
        </div>
        <div className="space-y-2">
          {content.items.map((item, i) => (
            <div key={item.id} className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</div>
              <Input value={item.text} onChange={(e) => updateItemText(item.id, e.target.value)} placeholder="Ej: She goes to work" className="flex-1" />
              <select
                value={item.categoryId}
                onChange={(e) => updateItemCategory(item.id, e.target.value)}
                className="h-9 px-2 rounded-md border text-sm bg-background"
              >
                <option value="">-- Categoría --</option>
                {content.categories.map((c) => <option key={c.id} value={c.id}>{c.label || "(sin nombre)"}</option>)}
              </select>
              <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive h-8 w-8 shrink-0" onClick={() => removeItem(item.id)}>
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
