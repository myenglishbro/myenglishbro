import { useState } from "react";
import { DragDropContext, Draggable, Droppable, type DropResult } from "@hello-pangea/dnd";
import { GripVertical } from "lucide-react";
import {
  DragDropGapfillContent, ReorderContent, CategorizeContent,
  splitClozeText, normalizeAnswer,
} from "./practiceActivity.types";

export function DragDropGapfillActivity({
  content, answers, onChange, readonly,
}: {
  content: DragDropGapfillContent;
  answers: Record<string, string>;
  onChange?: (answers: Record<string, string>) => void;
  readonly?: boolean;
}) {
  const [bankItems] = useState(() => content.wordBank.map((text, i) => ({ id: `bank-${i}`, text })));
  const [placed, setPlaced] = useState<Record<string, string>>({}); // gapId -> bankItemId
  const segments = splitClozeText(content.text);

  if (readonly) {
    return (
      <p className="text-sm leading-relaxed whitespace-pre-wrap">
        {segments.map((seg, i) => {
          if (seg.kind === "text") return <span key={i}>{seg.value}</span>;
          const gap = content.gaps[seg.index];
          const given = answers[gap.id] || "";
          const isCorrect = normalizeAnswer(given) === normalizeAnswer(gap.answer);
          return (
            <span key={i} className={`mx-1 font-bold ${isCorrect ? "text-green-600" : "text-red-600"}`}>
              [{given || "?"}]{!isCorrect && ` (${gap.answer})`}
            </span>
          );
        })}
      </p>
    );
  }

  function handleDragEnd(result: DropResult) {
    const { destination, draggableId } = result;
    if (!destination) return;
    setPlaced((prev) => {
      const next = { ...prev };
      for (const gapId of Object.keys(next)) {
        if (next[gapId] === draggableId) delete next[gapId];
      }
      if (destination.droppableId.startsWith("gap-")) {
        next[destination.droppableId.slice(4)] = draggableId;
      }
      const answerMap: Record<string, string> = {};
      for (const [gapId, bankId] of Object.entries(next)) {
        const item = bankItems.find((b) => b.id === bankId);
        if (item) answerMap[gapId] = item.text;
      }
      onChange?.(answerMap);
      return next;
    });
  }

  const availableBank = bankItems.filter((b) => !Object.values(placed).includes(b.id));

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="bank" direction="horizontal">
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="flex flex-wrap gap-2 p-3 rounded-lg border border-dashed bg-muted/30 min-h-14"
          >
            {availableBank.map((item, i) => (
              <Draggable key={item.id} draggableId={item.id} index={i}>
                {(dragProvided, snapshot) => (
                  <span
                    ref={dragProvided.innerRef}
                    {...dragProvided.draggableProps}
                    {...dragProvided.dragHandleProps}
                    className={`px-3 py-1.5 rounded-full border bg-background text-sm font-medium shadow-sm cursor-grab ${snapshot.isDragging ? "ring-2 ring-primary" : ""}`}
                  >
                    {item.text}
                  </span>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
            {availableBank.length === 0 && (
              <span className="text-xs text-muted-foreground">Banco vacío — arrastra una palabra aquí para quitarla de un espacio.</span>
            )}
          </div>
        )}
      </Droppable>

      <p className="text-sm leading-relaxed whitespace-pre-wrap mt-4">
        {segments.map((seg, i) => {
          if (seg.kind === "text") return <span key={i}>{seg.value}</span>;
          const gap = content.gaps[seg.index];
          const bankId = placed[gap.id];
          const item = bankId ? bankItems.find((b) => b.id === bankId) : null;
          return (
            <Droppable key={gap.id} droppableId={`gap-${gap.id}`}>
              {(dropProvided, dropSnapshot) => (
                <span
                  ref={dropProvided.innerRef}
                  {...dropProvided.droppableProps}
                  className={`inline-flex mx-1 min-w-16 h-8 px-2 items-center justify-center border-b-2 border-primary align-middle ${dropSnapshot.isDraggingOver ? "bg-primary/10" : ""}`}
                >
                  {item ? (
                    <Draggable draggableId={item.id} index={0}>
                      {(dragProvided) => (
                        <span
                          ref={dragProvided.innerRef}
                          {...dragProvided.draggableProps}
                          {...dragProvided.dragHandleProps}
                          className="px-2 py-0.5 rounded-full border bg-primary/10 text-sm font-medium cursor-grab"
                        >
                          {item.text}
                        </span>
                      )}
                    </Draggable>
                  ) : (
                    <span className="text-muted-foreground text-xs">___</span>
                  )}
                  {dropProvided.placeholder}
                </span>
              )}
            </Droppable>
          );
        })}
      </p>
    </DragDropContext>
  );
}

export function DragDropReorderActivity({
  content, answers, onChange, readonly,
}: {
  content: ReorderContent;
  answers: string[];
  onChange?: (order: string[]) => void;
  readonly?: boolean;
}) {
  const [order, setOrder] = useState<string[]>(() => {
    if (answers && answers.length === content.items.length) return answers;
    return [...content.items].sort(() => Math.random() - 0.5).map((it) => it.id);
  });

  if (readonly) {
    return (
      <div className="space-y-2">
        {order.map((id, i) => {
          const item = content.items.find((it) => it.id === id);
          const isCorrect = content.items[i]?.id === id;
          return (
            <div
              key={id}
              className={`p-3 rounded-lg border text-sm ${isCorrect ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"}`}
            >
              {i + 1}. {item?.text}
            </div>
          );
        })}
      </div>
    );
  }

  function handleDragEnd(result: DropResult) {
    if (!result.destination) return;
    const next = [...order];
    const [moved] = next.splice(result.source.index, 1);
    next.splice(result.destination.index, 0, moved);
    setOrder(next);
    onChange?.(next);
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="reorder-list">
        {(provided) => (
          <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
            {order.map((id, i) => {
              const item = content.items.find((it) => it.id === id);
              return (
                <Draggable key={id} draggableId={id} index={i}>
                  {(dragProvided, snapshot) => (
                    <div
                      ref={dragProvided.innerRef}
                      {...dragProvided.draggableProps}
                      {...dragProvided.dragHandleProps}
                      className={`p-3 rounded-lg border bg-background text-sm flex items-center gap-2 cursor-grab ${snapshot.isDragging ? "ring-2 ring-primary" : ""}`}
                    >
                      <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
                      {item?.text}
                    </div>
                  )}
                </Draggable>
              );
            })}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}

export function DragDropCategorizeActivity({
  content, answers, onChange, readonly,
}: {
  content: CategorizeContent;
  answers: Record<string, string>; // itemId -> categoryId ("" = unplaced)
  onChange?: (placements: Record<string, string>) => void;
  readonly?: boolean;
}) {
  const [placements, setPlacements] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const it of content.items) init[it.id] = "";
    return init;
  });

  if (readonly) {
    return (
      <div className="space-y-4">
        {content.categories.map((cat) => (
          <div key={cat.id}>
            <p className="text-xs font-semibold text-muted-foreground mb-1">{cat.label}</p>
            <div className="flex flex-wrap gap-2 min-h-8">
              {content.items.filter((it) => (answers[it.id] || "") === cat.id).map((it) => {
                const isCorrect = it.categoryId === cat.id;
                return (
                  <span
                    key={it.id}
                    className={`px-3 py-1.5 rounded-full border text-sm ${isCorrect ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"}`}
                  >
                    {it.text}
                  </span>
                );
              })}
            </div>
          </div>
        ))}
        {content.items.some((it) => !answers[it.id]) && (
          <p className="text-xs text-muted-foreground">(Algunos ítems quedaron sin clasificar)</p>
        )}
      </div>
    );
  }

  function handleDragEnd(result: DropResult) {
    const { destination, draggableId } = result;
    if (!destination) return;
    const categoryId = destination.droppableId === "bank" ? "" : destination.droppableId.replace("cat-", "");
    setPlacements((prev) => {
      const next = { ...prev, [draggableId]: categoryId };
      onChange?.(next);
      return next;
    });
  }

  const unplaced = content.items.filter((it) => !placements[it.id]);

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="space-y-4">
        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-1">Sin clasificar</p>
          <Droppable droppableId="bank" direction="horizontal">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="flex flex-wrap gap-2 p-3 rounded-lg border border-dashed bg-muted/30 min-h-14"
              >
                {unplaced.map((it, i) => (
                  <Draggable key={it.id} draggableId={it.id} index={i}>
                    {(dragProvided, snapshot) => (
                      <span
                        ref={dragProvided.innerRef}
                        {...dragProvided.draggableProps}
                        {...dragProvided.dragHandleProps}
                        className={`px-3 py-1.5 rounded-full border bg-background text-sm font-medium shadow-sm cursor-grab ${snapshot.isDragging ? "ring-2 ring-primary" : ""}`}
                      >
                        {it.text}
                      </span>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {content.categories.map((cat) => (
            <div key={cat.id}>
              <p className="text-xs font-semibold text-muted-foreground mb-1">{cat.label}</p>
              <Droppable droppableId={`cat-${cat.id}`}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex flex-wrap gap-2 p-3 rounded-lg border min-h-14 ${snapshot.isDraggingOver ? "bg-primary/10 border-primary" : "bg-background"}`}
                  >
                    {content.items.filter((it) => placements[it.id] === cat.id).map((it, i) => (
                      <Draggable key={it.id} draggableId={it.id} index={i}>
                        {(dragProvided, snapshot) => (
                          <span
                            ref={dragProvided.innerRef}
                            {...dragProvided.draggableProps}
                            {...dragProvided.dragHandleProps}
                            className={`px-3 py-1.5 rounded-full border bg-primary/10 text-sm font-medium cursor-grab ${snapshot.isDragging ? "ring-2 ring-primary" : ""}`}
                          >
                            {it.text}
                          </span>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </div>
    </DragDropContext>
  );
}
