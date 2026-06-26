import { useEffect, useMemo, useRef } from "react";
import { Lock, Crown } from "lucide-react";
import {
  LEVEL_ORDER,
  LEVEL_META,
  WORLD_NODE_TEMPLATE,
  WORLD_BOSS_EMOJI,
  WORLD_LANDMARKS,
  NODES_PER_WORLD,
  NODE_KIND_ICON,
  NODE_KIND_LABEL,
  NODE_ENTRY_FEE,
  nodeId,
  isNodeUnlocked,
  type QuestionLevel,
  type NodeKind,
} from "./questions";

const NODE_VSPACING = 92;
const WORLD_TOP_PADDING = 80;
const WORLD_BOTTOM_PADDING = 190;
const X_PATTERN = [28, 62, 38, 72];

const nodeX = (index: number, kind: NodeKind): number => {
  if (kind === "boss" || kind === "miniboss") return 50;
  return X_PATTERN[(index - 1) % X_PATTERN.length];
};

const nodeY = (index: number): number => WORLD_TOP_PADDING + (index - 1) * NODE_VSPACING;

const worldHeight = (): number => WORLD_TOP_PADDING + (NODES_PER_WORLD - 1) * NODE_VSPACING + WORLD_BOTTOM_PADDING;

const buildPathD = (points: { x: number; y: number }[]): string => {
  if (points.length < 2) return "";
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const midY = (prev.y + curr.y) / 2;
    d += ` C ${prev.x} ${midY}, ${curr.x} ${midY}, ${curr.x} ${curr.y}`;
  }
  return d;
};

interface WorldMapScreenProps {
  clearedNodes: string[];
  onSelectNode: (level: QuestionLevel, nodeIndex: number) => void;
  equippedAvatarEmoji: string;
  equippedFrameClass: string;
}

interface NodePoint {
  index: number;
  kind: NodeKind;
  x: number;
  y: number;
}

const NODE_SHAPE: Record<NodeKind, string> = {
  battle: "w-12 h-12 rounded-2xl",
  treasure: "w-12 h-12 rounded-2xl",
  miniboss: "w-20 h-20 rounded-[26px]",
  boss: "w-28 h-36 rounded-t-[36px] rounded-b-2xl",
};

const NODE_ICON_TEXT_SIZE: Record<NodeKind, string> = {
  battle: "text-xl",
  treasure: "text-xl",
  miniboss: "text-4xl",
  boss: "text-5xl",
};

const NODE_LOCK_ICON_SIZE: Record<NodeKind, string> = {
  battle: "h-4 w-4",
  treasure: "h-4 w-4",
  miniboss: "h-6 w-6",
  boss: "h-8 w-8",
};

const NODE_UNLOCKED_STYLE: Record<NodeKind, string> = {
  battle: "bg-white/10 border-white/25",
  treasure:
    "bg-gradient-to-r from-amber-400/25 via-yellow-200/35 to-amber-400/25 bg-[length:200%_100%] animate-treasure-shimmer border-amber-300/60 shadow-[0_0_16px_4px_rgba(252,211,77,0.3)]",
  miniboss: "bg-fuchsia-500/15 border-fuchsia-400/70 shadow-[0_0_22px_6px_rgba(232,121,249,0.35)]",
  boss: "bg-gradient-to-b from-amber-500/25 to-red-600/20 border-amber-300 shadow-[0_0_32px_10px_rgba(245,158,11,0.45)] animate-tower-breathe",
};

interface MapNodeProps {
  level: QuestionLevel;
  point: NodePoint;
  unlocked: boolean;
  cleared: boolean;
  isCurrent: boolean;
  onSelect: () => void;
  registerRef?: (el: HTMLButtonElement | null) => void;
}

const MapNode = ({ level, point, unlocked, cleared, isCurrent, onSelect, registerRef }: MapNodeProps) => {
  const icon = point.kind === "boss" ? WORLD_BOSS_EMOJI[level] : NODE_KIND_ICON[point.kind];
  return (
    <button
      ref={registerRef}
      onClick={onSelect}
      style={{ left: `${point.x}%`, top: point.y }}
      className="absolute -translate-x-1/2 z-10 flex flex-col items-center gap-1"
    >
      <div
        className={`relative flex items-center justify-center border-2 transition-transform hover:scale-105 active:scale-95 ${NODE_SHAPE[point.kind]} ${
          !unlocked ? "bg-slate-800/80 border-slate-700 text-slate-600" : NODE_UNLOCKED_STYLE[point.kind]
        } ${NODE_ICON_TEXT_SIZE[point.kind]}`}
      >
        {unlocked ? icon : <Lock className={NODE_LOCK_ICON_SIZE[point.kind]} />}
        {cleared && (
          <span className="absolute -top-1.5 -right-1.5 bg-amber-400 rounded-full p-0.5 ring-2 ring-slate-950 animate-pop-in">
            <Crown className="h-3 w-3 text-slate-900" />
          </span>
        )}
        {isCurrent && !cleared && (
          <span className="absolute inset-0 rounded-[inherit] ring-2 ring-sky-300/80 animate-pulse-glow" />
        )}
      </div>
      <span className={`text-[9px] font-bold text-center leading-tight ${unlocked ? "text-slate-300" : "text-slate-600"}`}>
        {point.kind === "battle" ? `#${point.index}` : NODE_KIND_LABEL[point.kind]}
      </span>
      {point.index > 1 && (
        <span className="text-[8px] font-bold text-amber-300/80 leading-tight">🪙-{NODE_ENTRY_FEE}</span>
      )}
    </button>
  );
};

interface WorldBlockProps {
  level: QuestionLevel;
  clearedNodes: string[];
  onSelectNode: (level: QuestionLevel, nodeIndex: number) => void;
  currentNodeIndex: number | null;
  registerCurrentNode: (el: HTMLButtonElement | null) => void;
  equippedAvatarEmoji: string;
  equippedFrameClass: string;
}

const WorldBlock = ({
  level,
  clearedNodes,
  onSelectNode,
  currentNodeIndex,
  registerCurrentNode,
  equippedAvatarEmoji,
  equippedFrameClass,
}: WorldBlockProps) => {
  const meta = LEVEL_META[level];
  const landmarks = WORLD_LANDMARKS[level];
  const unlocked = isNodeUnlocked(level, 1, clearedNodes);
  const height = worldHeight();

  const points: NodePoint[] = WORLD_NODE_TEMPLATE.map((kind, i) => {
    const index = i + 1;
    return { index, kind, x: nodeX(index, kind), y: nodeY(index) };
  });
  const pathD = buildPathD(points);
  const clearedCount = points.filter((p) => clearedNodes.includes(nodeId(level, p.index))).length;

  const landmarkSpots = landmarks.map((emoji, i) => ({
    emoji,
    x: i % 2 === 0 ? 9 : 87,
    y: WORLD_TOP_PADDING + 20 + i * ((height - WORLD_TOP_PADDING - WORLD_BOTTOM_PADDING) / landmarks.length),
    delay: i * 0.4,
  }));

  return (
    <div className={`relative ${!unlocked ? "opacity-45 grayscale" : ""}`} style={{ height }}>
      <div
        className={`absolute top-0 inset-x-2 rounded-2xl border px-4 py-3 flex items-center gap-3 bg-gradient-to-r ${meta.world.gradient} ${
          unlocked ? "border-white/15" : "border-slate-700"
        }`}
      >
        <span className="text-3xl shrink-0">{meta.world.particle}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-extrabold text-white truncate">{meta.world.name}</p>
          {unlocked ? (
            <p className="text-[11px] text-slate-300">
              {clearedCount}/{NODES_PER_WORLD} nodos · {meta.label}
            </p>
          ) : (
            <p className="text-[11px] text-slate-400 flex items-center gap-1">
              <Lock className="h-3 w-3" /> Derrota al jefe final del mundo anterior
            </p>
          )}
        </div>
      </div>

      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox={`0 0 100 ${height}`}
        preserveAspectRatio="none"
      >
        <path d={pathD} stroke="white" strokeOpacity={0.07} strokeWidth={4} fill="none" strokeLinecap="round" />
        <path
          d={pathD}
          stroke="white"
          strokeOpacity={0.22}
          strokeWidth={1.1}
          strokeDasharray="2 2.5"
          fill="none"
          strokeLinecap="round"
        />
      </svg>

      {landmarkSpots.map((spot, i) => (
        <span
          key={i}
          aria-hidden
          className="absolute text-2xl opacity-70 pointer-events-none select-none animate-float"
          style={{ left: `${spot.x}%`, top: spot.y, animationDelay: `${spot.delay}s` }}
        >
          {spot.emoji}
        </span>
      ))}

      {points.map((p) => {
        const cleared = clearedNodes.includes(nodeId(level, p.index));
        const nodeUnlocked = isNodeUnlocked(level, p.index, clearedNodes);
        const isCurrent = currentNodeIndex === p.index;
        return (
          <MapNode
            key={p.index}
            level={level}
            point={p}
            unlocked={nodeUnlocked}
            cleared={cleared}
            isCurrent={isCurrent}
            onSelect={() => onSelectNode(level, p.index)}
            registerRef={isCurrent ? registerCurrentNode : undefined}
          />
        );
      })}

      {currentNodeIndex && (
        <div
          aria-hidden
          className="absolute -translate-x-1/2 -translate-y-[calc(100%+6px)] animate-idle-bob pointer-events-none z-20"
          style={{ left: `${nodeX(currentNodeIndex, WORLD_NODE_TEMPLATE[currentNodeIndex - 1])}%`, top: nodeY(currentNodeIndex) }}
        >
          <span className={`flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-lg ${equippedFrameClass}`}>
            {equippedAvatarEmoji}
          </span>
        </div>
      )}
    </div>
  );
};

export const WorldMapScreen = ({ clearedNodes, onSelectNode, equippedAvatarEmoji, equippedFrameClass }: WorldMapScreenProps) => {
  const currentNodeRef = useRef<HTMLButtonElement | null>(null);

  const currentPosition = useMemo(() => {
    for (const level of LEVEL_ORDER) {
      for (let index = 1; index <= NODES_PER_WORLD; index++) {
        if (!isNodeUnlocked(level, index, clearedNodes)) continue;
        if (!clearedNodes.includes(nodeId(level, index))) return { level, index };
      }
    }
    return null;
  }, [clearedNodes]);

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      currentNodeRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="relative overflow-x-hidden px-2 pb-6 text-left">
      {LEVEL_ORDER.map((level) => (
        <WorldBlock
          key={level}
          level={level}
          clearedNodes={clearedNodes}
          onSelectNode={onSelectNode}
          currentNodeIndex={currentPosition?.level === level ? currentPosition.index : null}
          registerCurrentNode={(el) => (currentNodeRef.current = el)}
          equippedAvatarEmoji={equippedAvatarEmoji}
          equippedFrameClass={equippedFrameClass}
        />
      ))}
    </div>
  );
};
