import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  Volume2,
  VolumeX,
  Trophy,
  Coins,
  Heart,
  Zap,
  Shield as ShieldIcon,
  Loader2,
  ShoppingBag,
  ArrowLeft,
  Check,
  X,
  MessageCircle,
} from "lucide-react";
import {
  fetchWordSurvivorQuestions,
  recordWordProgress,
  fetchClearedNodes,
  clearNode,
  fetchWallet,
  fetchShopItems,
  fetchInventory,
  fetchLeaderboard,
  depositCoins,
  NODE_ENTRY_FEE,
  NODE_ENERGY_COST,
  ENERGY_MAX,
  ENERGY_REGEN_MINUTES,
  startNodeAttempt,
  redeemRechargeCode,
  exchangeCoinsForEnergy,
  ENERGY_EXCHANGE_COIN_COST,
  ENERGY_EXCHANGE_AMOUNT,
  secondsUntilNextRegenTick,
  purchaseItem,
  equipItem,
  shuffleQuestions,
  pickEnemy,
  rollRarity,
  rollBossRarity,
  rollPowerUp,
  isOpenAnswerCorrect,
  RARITY_CONFIG,
  POWER_UP_META,
  ACHIEVEMENTS,
  TYPE_META,
  LEVEL_META,
  LEVEL_ORDER,
  getWorldNode,
  nodeId,
  isNodeUnlocked,
  NODES_PER_WORLD,
  NODE_KIND_LABEL,
  WORLD_BOSS_EMOJI,
  WORLD_BOSS_NAME,
  FORMAT_TIME_MULTIPLIER,
  type QuestionLevel,
  type WordSurvivorQuestion,
  type EnemyRarity,
  type PowerUpKind,
  type AchievementId,
  type ShopCategory,
  type ShopItem,
  type WalletRow,
  type NodeKind,
  type InventoryItem,
} from "./questions";
import { useGameSound } from "./useGameSound";
import { useBackgroundMusic } from "./useBackgroundMusic";
import { WorldMapScreen } from "./WorldMapScreen";
import { QuestionPanel } from "./QuestionPanel";

const PLAYER_MAX_HP = 100;
const BASE_ENEMY_HP = 80;
const SESSION_SECONDS = 75;
const POWER_UP_DROP_CHANCE = 0.28;
const STATS_KEY = "ws_stats_v2";
const MUTED_KEY = "ws_muted";
const YAPE_WHATSAPP_URL = "https://wa.link/8rlrd2";

interface StoredStats {
  bestCombo: number;
  totalCoins: number;
  gamesPlayed: number;
  lifetimeDefeated: number;
  unlockedAchievements: AchievementId[];
}

const DEFAULT_STATS: StoredStats = {
  bestCombo: 0,
  totalCoins: 0,
  gamesPlayed: 0,
  lifetimeDefeated: 0,
  unlockedAchievements: [],
};

const loadStats = (): StoredStats => {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (raw) return { ...DEFAULT_STATS, ...JSON.parse(raw) };
  } catch {
    /* ignore */
  }
  return DEFAULT_STATS;
};

const saveStats = (s: StoredStats) => {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
};

const maxQTimeFor = (nodeIndex: number) => getWorldNode(nodeIndex).maxQTimeDeci;
const enemyAttackFor = (nodeIndex: number) => getWorldNode(nodeIndex).enemyAttack;
const hitDamageFor = (combo: number) => 50 + Math.min(combo, 7) * 8;
const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

const comboTier = (c: number) => {
  if (c >= 10) return { label: `👑 x${c}`, text: "text-amber-300" };
  if (c >= 5) return { label: `⚡ x${c}`, text: "text-orange-300" };
  if (c >= 3) return { label: `🔥 x${c}`, text: "text-red-300" };
  return { label: `x${c}`, text: "text-slate-300" };
};

const comboMilestoneText = (c: number): string | null => {
  if (c === 3) return `🔥 COMBO x${c}!`;
  if (c === 5) return `⚡ COMBO x${c}!`;
  if (c >= 10 && c % 5 === 0) return `👑 WORD MASTER x${c}!`;
  return null;
};

type Screen = "select" | "playing" | "over" | "shop" | "leaderboard";

interface Floater {
  id: number;
  text: string;
  anchor: "enemy" | "player" | "reward";
}

interface ToastItem {
  id: number;
  text: string;
  tone: "combo" | "achievement" | "levelup" | "powerup" | "region";
}

interface LastEvent {
  kind: "correct" | "wrong";
  damage: number;
  xp?: number;
  coins?: number;
  enemyDied: boolean;
  playerDied: boolean;
  shielded?: boolean;
}

interface EnemyState {
  name: string;
  emoji: string;
  rarity: EnemyRarity;
  isBoss: boolean;
  isWorldBoss: boolean;
  isFirstClear: boolean;
  nodeKind: NodeKind;
}

interface GameState {
  level: QuestionLevel;
  nodeIndex: number;
  queue: WordSurvivorQuestion[];
  current: WordSurvivorQuestion;
  enemy: EnemyState;
  enemyHp: number;
  enemyMaxHp: number;
  playerHp: number;
  combo: number;
  bestCombo: number;
  xp: number;
  coins: number;
  defeated: number;
  correctCount: number;
  totalCount: number;
  selected: number | null;
  feedback: "correct" | "wrong" | null;
  qTimeDeci: number;
  qMaxDeci: number;
  sessionLeft: number;
  lastEvent: LastEvent | null;
  shieldActive: boolean;
  doubleXpCharges: number;
  pendingPowerUpMsg: string | null;
}

const spawnEnemy = (
  question: WordSurvivorQuestion,
  level: QuestionLevel,
  nodeIndex: number,
  clearedNodes: string[],
): { enemy: EnemyState; enemyMaxHp: number } => {
  const cfg = getWorldNode(nodeIndex);
  const isBoss = cfg.kind === "miniboss" || cfg.kind === "boss";
  const isWorldBoss = cfg.kind === "boss";
  const isFirstClear = !clearedNodes.includes(nodeId(level, nodeIndex));
  const rarity = isBoss ? rollBossRarity(cfg.forceEpicBoss) : rollRarity();
  const base =
    cfg.kind === "boss" ? { name: WORLD_BOSS_NAME[level], emoji: WORLD_BOSS_EMOJI[level] } : pickEnemy(question.type);
  const rarityCfg = RARITY_CONFIG[rarity];
  const hp = Math.round(BASE_ENEMY_HP * rarityCfg.hpMultiplier * (isBoss ? 1.6 * cfg.bossHpMultiplier : 1));
  return {
    enemy: { name: base.name, emoji: base.emoji, rarity, isBoss, isWorldBoss, isFirstClear, nodeKind: cfg.kind },
    enemyMaxHp: hp,
  };
};

const freshGame = (
  level: QuestionLevel,
  nodeIndex: number,
  bank: WordSurvivorQuestion[],
  clearedNodes: string[],
): GameState => {
  const queue = shuffleQuestions(bank, level, nodeIndex);
  const [current, ...rest] = queue;
  const qMax = Math.round(maxQTimeFor(nodeIndex) * FORMAT_TIME_MULTIPLIER[current.format]);
  const { enemy, enemyMaxHp } = spawnEnemy(current, level, nodeIndex, clearedNodes);
  return {
    level,
    nodeIndex,
    queue: rest,
    current,
    enemy,
    enemyHp: enemyMaxHp,
    enemyMaxHp,
    playerHp: PLAYER_MAX_HP,
    combo: 0,
    bestCombo: 0,
    xp: 0,
    coins: 0,
    defeated: 0,
    correctCount: 0,
    totalCount: 0,
    selected: null,
    feedback: null,
    qTimeDeci: qMax,
    qMaxDeci: qMax,
    sessionLeft: SESSION_SECONDS,
    lastEvent: null,
    shieldActive: false,
    doubleXpCharges: 0,
    pendingPowerUpMsg: null,
  };
};

const buildAnswerResult = (prev: GameState, isCorrect: boolean, selected: number | null): GameState => {
  const rarityCfg = RARITY_CONFIG[prev.enemy.rarity];

  if (isCorrect) {
    const scaledDmg = Math.round(hitDamageFor(prev.combo) * (prev.enemyMaxHp / 100));
    const newCombo = prev.combo + 1;
    const newEnemyHp = Math.max(0, prev.enemyHp - scaledDmg);
    const enemyDied = newEnemyHp <= 0;
    const useDoubleXp = prev.doubleXpCharges > 0;
    const rewardMult = rarityCfg.rewardMultiplier * (prev.enemy.isBoss ? 1.5 : 1);
    const gainedXp = Math.round((10 + newCombo * 2) * rewardMult * (useDoubleXp ? 2 : 1));
    const regionBonus = enemyDied && prev.enemy.isFirstClear ? (prev.enemy.isWorldBoss ? 100 : 25) : 0;
    const gainedCoins = Math.round((4 + Math.floor(newCombo / 2)) * rewardMult) + regionBonus;
    return {
      ...prev,
      selected,
      feedback: "correct",
      combo: newCombo,
      bestCombo: Math.max(prev.bestCombo, newCombo),
      xp: prev.xp + gainedXp,
      coins: prev.coins + gainedCoins,
      correctCount: prev.correctCount + 1,
      totalCount: prev.totalCount + 1,
      enemyHp: newEnemyHp,
      doubleXpCharges: useDoubleXp ? prev.doubleXpCharges - 1 : prev.doubleXpCharges,
      lastEvent: { kind: "correct", damage: scaledDmg, xp: gainedXp, coins: gainedCoins, enemyDied, playerDied: false },
    };
  }

  const rawDmg = Math.round(enemyAttackFor(prev.nodeIndex) * rarityCfg.atkMultiplier);
  const shielded = prev.shieldActive;
  const dmg = shielded ? 0 : rawDmg;
  const newPlayerHp = Math.max(0, prev.playerHp - dmg);
  const playerDied = newPlayerHp <= 0;
  return {
    ...prev,
    selected,
    feedback: "wrong",
    combo: 0,
    totalCount: prev.totalCount + 1,
    playerHp: newPlayerHp,
    shieldActive: false,
    lastEvent: { kind: "wrong", damage: dmg, enemyDied: false, playerDied, shielded },
  };
};

const Stat = ({ label, value, icon, className }: { label: string; value: string | number; icon: string; className?: string }) => (
  <div className={`bg-white/5 border border-white/10 rounded-xl p-3 ${className ?? ""}`}>
    <div className="text-[11px] text-slate-400 mb-0.5">
      {icon} {label}
    </div>
    <div className="text-lg font-bold text-white">{value}</div>
  </div>
);

const TOAST_STYLES: Record<ToastItem["tone"], string> = {
  combo: "bg-gradient-to-r from-orange-500 to-red-500 text-white",
  achievement: "bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-900",
  levelup: "bg-gradient-to-r from-indigo-500 to-violet-500 text-white",
  powerup: "bg-gradient-to-r from-cyan-500 to-sky-500 text-white",
  region: "bg-gradient-to-r from-emerald-400 to-teal-500 text-white",
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const WordSurvivorGame = ({ open, onOpenChange }: Props) => {
  const { user } = useAuth();
  const playerName = (user?.user_metadata?.full_name as string | undefined)?.split(" ")[0] || "Survivor";

  const [screen, setScreen] = useState<Screen>("select");
  const [game, setGame] = useState<GameState | null>(null);
  const [muted, setMuted] = useState(() => localStorage.getItem(MUTED_KEY) === "1");
  const [floaters, setFloaters] = useState<Floater[]>([]);
  const [toastQueue, setToastQueue] = useState<ToastItem[]>([]);
  const [shake, setShake] = useState<"enemy" | "player" | null>(null);
  const [overReason, setOverReason] = useState<"hp" | "time" | "boss" | "node" | null>(null);
  const [stats, setStats] = useState<StoredStats>(() => loadStats());
  const [textAnswer, setTextAnswer] = useState("");
  useEffect(() => {
    setTextAnswer("");
  }, [game?.current.id]);

  const { data: questionBank = [], isLoading: questionsLoading } = useQuery({
    queryKey: ["word-survivor-questions"],
    queryFn: fetchWordSurvivorQuestions,
    staleTime: 60 * 60 * 1000,
    enabled: open,
  });

  const { data: clearedNodesData, isLoading: regionsLoading } = useQuery({
    queryKey: ["word-survivor-cleared-nodes", user?.id],
    queryFn: fetchClearedNodes,
    staleTime: 5 * 60 * 1000,
    enabled: open && !!user?.id,
  });
  const [clearedNodes, setClearedNodes] = useState<string[]>([]);
  useEffect(() => {
    if (clearedNodesData) setClearedNodes(clearedNodesData);
  }, [clearedNodesData]);

  const { data: shopItems = [] } = useQuery({
    queryKey: ["word-survivor-shop-items"],
    queryFn: fetchShopItems,
    staleTime: 60 * 60 * 1000,
    enabled: open,
  });

  const { data: walletData } = useQuery({
    queryKey: ["word-survivor-wallet", user?.id],
    queryFn: () => fetchWallet(user!.id),
    staleTime: 60 * 1000,
    enabled: open && !!user?.id,
  });
  const [wallet, setWallet] = useState<WalletRow>({
    coins: 0,
    display_name: null,
    equipped_avatar: null,
    equipped_title: null,
    equipped_frame: null,
    energy: ENERGY_MAX,
    energy_max: ENERGY_MAX,
    energy_updated_at: new Date().toISOString(),
  });
  useEffect(() => {
    if (walletData) setWallet(walletData);
  }, [walletData]);

  const { data: inventoryData } = useQuery({
    queryKey: ["word-survivor-inventory", user?.id],
    queryFn: fetchInventory,
    staleTime: 60 * 1000,
    enabled: open && !!user?.id,
  });
  const [inventory, setInventory] = useState<string[]>([]);
  const [voucherCodes, setVoucherCodes] = useState<Record<string, string>>({});
  useEffect(() => {
    if (inventoryData) {
      setInventory(inventoryData.map((i: InventoryItem) => i.item_id));
      setVoucherCodes(
        Object.fromEntries(
          inventoryData.filter((i: InventoryItem) => i.redemption_code).map((i: InventoryItem) => [i.item_id, i.redemption_code as string]),
        ),
      );
    }
  }, [inventoryData]);

  const { data: leaderboard = [], refetch: refetchLeaderboard } = useQuery({
    queryKey: ["word-survivor-leaderboard"],
    queryFn: fetchLeaderboard,
    staleTime: 60 * 1000,
    enabled: false,
  });

  const [shopMsg, setShopMsg] = useState<{ text: string; tone: "ok" | "error" } | null>(null);
  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const [rechargeCode, setRechargeCode] = useState("");
  const [redeeming, setRedeeming] = useState(false);
  const [exchanging, setExchanging] = useState(false);

  const play = useGameSound(muted);
  const { playRandomTrack, stop: stopMusic } = useBackgroundMusic(muted);
  useEffect(() => {
    if (screen !== "playing") stopMusic();
  }, [screen, stopMusic]);
  const timeoutsRef = useRef<number[]>([]);
  const floaterIdRef = useRef(0);
  const toastIdRef = useRef(0);

  // Cosmetic live tick so the energy HUD counts up in real time between node attempts;
  // the server (settle_word_survivor_resources) remains the source of truth at the next attempt.
  const [nowTick, setNowTick] = useState(Date.now());
  useEffect(() => {
    if (screen !== "select" && screen !== "shop") return;
    const id = window.setInterval(() => setNowTick(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [screen]);
  const displayedEnergy = Math.min(
    wallet.energy_max,
    wallet.energy + Math.floor((nowTick - new Date(wallet.energy_updated_at).getTime()) / 60000 / ENERGY_REGEN_MINUTES),
  );
  const prevFeedbackRef = useRef<GameState["feedback"]>(null);

  const clearPendingTimeouts = () => {
    timeoutsRef.current.forEach((id) => window.clearTimeout(id));
    timeoutsRef.current = [];
  };

  useEffect(() => () => clearPendingTimeouts(), []);

  useEffect(() => {
    if (!open) {
      clearPendingTimeouts();
      setScreen("select");
      setGame(null);
      setFloaters([]);
      setToastQueue([]);
      setShake(null);
      prevFeedbackRef.current = null;
    }
  }, [open]);

  const toggleMute = () => {
    setMuted((m) => {
      localStorage.setItem(MUTED_KEY, !m ? "1" : "0");
      return !m;
    });
  };

  const pushToast = (text: string, tone: ToastItem["tone"]) => {
    const id = ++toastIdRef.current;
    setToastQueue((q) => [...q, { id, text, tone }]);
  };

  useEffect(() => {
    if (toastQueue.length === 0) return;
    const t = window.setTimeout(() => setToastQueue((q) => q.slice(1)), 1700);
    timeoutsRef.current.push(t);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toastQueue[0]?.id]);

  const unlockAchievement = (id: AchievementId) => {
    if (stats.unlockedAchievements.includes(id)) return;
    const meta = ACHIEVEMENTS[id];
    pushToast(`🏆 ¡Logro desbloqueado! ${meta.emoji} ${meta.label}`, "achievement");
    play("achievement");
    setStats((prev) => {
      if (prev.unlockedAchievements.includes(id)) return prev;
      const next = { ...prev, unlockedAchievements: [...prev.unlockedAchievements, id] };
      saveStats(next);
      return next;
    });
  };

  const startNode = async (level: QuestionLevel, nodeIndex: number) => {
    if (questionBank.length === 0) return;
    if (!isNodeUnlocked(level, nodeIndex, clearedNodes)) {
      if (nodeIndex > 1) {
        pushToast(`🔒 Completa el nodo anterior primero`, "region");
      } else {
        const prevWorld = LEVEL_META[LEVEL_ORDER[LEVEL_ORDER.indexOf(level) - 1]].world.name;
        pushToast(`🔒 Derrota al jefe final de ${prevWorld} para desbloquear este mundo`, "region");
      }
      return;
    }
    playRandomTrack();
    {
      // Every node costs energy, even the coin-free first node of a world -- energy is
      // the only resource meant to gate how often you can play, with no exceptions.
      const coinCost = nodeIndex > 1 ? NODE_ENTRY_FEE : 0;
      const res = await startNodeAttempt(coinCost, NODE_ENERGY_COST);
      if (!res.success) {
        stopMusic();
        if (res.error === "no_energy") {
          const wait = formatTime(secondsUntilNextRegenTick(wallet.energy_updated_at, ENERGY_REGEN_MINUTES));
          pushToast(`⚡ Necesitas ${NODE_ENERGY_COST} de energía. Próxima en ${wait}`, "region");
        } else {
          pushToast(`🪙 Necesitas ${NODE_ENTRY_FEE} monedas para entrar a este nodo`, "region");
        }
        return;
      }
      setWallet((w) => ({
        ...w,
        coins: res.remaining_coins ?? w.coins - coinCost,
        energy: res.remaining_energy ?? w.energy - NODE_ENERGY_COST,
      }));
    }
    clearPendingTimeouts();
    prevFeedbackRef.current = null;
    setFloaters([]);
    setToastQueue([]);
    setOverReason(null);
    setGame(freshGame(level, nodeIndex, questionBank, clearedNodes));
    setScreen("playing");
  };

  const openShop = () => {
    setShopMsg(null);
    setScreen("shop");
  };

  const openLeaderboard = () => {
    refetchLeaderboard();
    setScreen("leaderboard");
  };

  const handlePurchase = async (item: ShopItem) => {
    if (inventory.includes(item.item_id)) return;
    if (wallet.coins < item.price) {
      setShopMsg({ text: `Necesitas ${item.price - wallet.coins} 🪙 más para comprar ${item.label}`, tone: "error" });
      return;
    }
    setPurchasingId(item.item_id);
    const res = await purchaseItem(item.item_id);
    setPurchasingId(null);
    if (res.success) {
      setInventory((prev) => [...prev, item.item_id]);
      if (res.redemption_code) {
        setVoucherCodes((prev) => ({ ...prev, [item.item_id]: res.redemption_code as string }));
      }
      setWallet((w) => ({ ...w, coins: res.remaining_coins ?? w.coins - item.price }));
      setShopMsg({ text: `✅ ¡Compraste ${item.label}!`, tone: "ok" });
      play("powerup");
    } else {
      setShopMsg({ text: "No se pudo completar la compra. Intenta de nuevo.", tone: "error" });
    }
  };

  const handleEquip = async (item: ShopItem) => {
    const isEquipped =
      (item.category === "avatar" && wallet.equipped_avatar === item.item_id) ||
      (item.category === "title" && wallet.equipped_title === item.item_id) ||
      (item.category === "frame" && wallet.equipped_frame === item.item_id);
    const nextId = isEquipped ? null : item.item_id;
    await equipItem(item.category, nextId);
    setWallet((w) => ({
      ...w,
      equipped_avatar: item.category === "avatar" ? nextId : w.equipped_avatar,
      equipped_title: item.category === "title" ? nextId : w.equipped_title,
      equipped_frame: item.category === "frame" ? nextId : w.equipped_frame,
    }));
  };

  const handleRedeemCode = async () => {
    const code = rechargeCode.trim();
    if (!code) return;
    setRedeeming(true);
    const res = await redeemRechargeCode(code);
    setRedeeming(false);
    if (res.success) {
      setWallet((w) => ({ ...w, energy: w.energy + (res.amount ?? 0) }));
      setShopMsg({ text: `✅ ¡+${res.amount} ⚡ de energía añadidas!`, tone: "ok" });
      setRechargeCode("");
      play("powerup");
    } else {
      setShopMsg({ text: "❌ Código inválido o ya usado", tone: "error" });
    }
  };

  const handleExchangeEnergy = async () => {
    setExchanging(true);
    const res = await exchangeCoinsForEnergy();
    setExchanging(false);
    if (res.success) {
      setWallet((w) => ({
        ...w,
        coins: res.remaining_coins ?? w.coins - ENERGY_EXCHANGE_COIN_COST,
        energy: res.remaining_energy ?? w.energy + ENERGY_EXCHANGE_AMOUNT,
      }));
      setShopMsg({ text: `✅ ¡+${ENERGY_EXCHANGE_AMOUNT} ⚡ de energía a cambio de ${ENERGY_EXCHANGE_COIN_COST} 🪙!`, tone: "ok" });
      play("powerup");
    } else if (res.error === "energy_full") {
      setShopMsg({ text: "⚡ Ya tienes la energía al máximo", tone: "error" });
    } else {
      setShopMsg({ text: `🪙 Necesitas ${ENERGY_EXCHANGE_COIN_COST} monedas para canjear energía`, tone: "error" });
    }
  };

  const addFloater = (anchor: Floater["anchor"], text: string) => {
    const id = ++floaterIdRef.current;
    setFloaters((f) => [...f, { id, text, anchor }]);
    const t = window.setTimeout(() => setFloaters((f) => f.filter((x) => x.id !== id)), 900);
    timeoutsRef.current.push(t);
  };

  const finishGame = (reason: "hp" | "time" | "boss" | "node", finalState: GameState) => {
    setOverReason(reason);
    setScreen("over");
    play(finalState.playerHp <= 0 ? "game-over" : "victory");

    const accuracy = finalState.totalCount > 0 ? finalState.correctCount / finalState.totalCount : 0;
    if (reason === "time") unlockAchievement("survivor");
    if (finalState.totalCount >= 8 && accuracy === 1) unlockAchievement("perfectionist");
    if (wallet.coins + finalState.coins >= 200) unlockAchievement("coin_collector");

    if (finalState.coins > 0) {
      depositCoins(finalState.coins);
      setWallet((w) => ({ ...w, coins: w.coins + finalState.coins }));
    }

    setStats((prev) => {
      const next: StoredStats = {
        ...prev,
        bestCombo: Math.max(prev.bestCombo, finalState.bestCombo),
        totalCoins: prev.totalCoins + finalState.coins,
        gamesPlayed: prev.gamesPlayed + 1,
      };
      saveStats(next);
      return next;
    });
  };

  const advance = () => {
    setGame((prev) => {
      if (!prev || !prev.lastEvent) return prev;
      let queue = prev.queue;
      if (queue.length === 0) queue = shuffleQuestions(questionBank, prev.level, prev.nodeIndex);
      const [nextQ, ...rest] = queue;

      let shieldActive = prev.shieldActive;
      let doubleXpCharges = prev.doubleXpCharges;
      let enemyHp = prev.enemyHp;
      let qBonusDeci = 0;
      let pendingPowerUpMsg: string | null = null;

      if (Math.random() < POWER_UP_DROP_CHANCE) {
        const kind: PowerUpKind = rollPowerUp();
        const meta = POWER_UP_META[kind];
        pendingPowerUpMsg = `${meta.emoji} ¡Power-up! ${meta.label}`;
        if (kind === "shield") shieldActive = true;
        if (kind === "double_xp") doubleXpCharges = 3;
        if (kind === "freeze") qBonusDeci = 50;
        if (kind === "bomb") enemyHp = Math.max(1, enemyHp - Math.round(prev.enemyMaxHp * 0.35));
      }

      const qMax = Math.round(maxQTimeFor(prev.nodeIndex) * FORMAT_TIME_MULTIPLIER[nextQ.format]);
      return {
        ...prev,
        queue: rest,
        current: nextQ,
        enemyHp,
        selected: null,
        feedback: null,
        lastEvent: null,
        qTimeDeci: qMax + qBonusDeci,
        qMaxDeci: qMax,
        shieldActive,
        doubleXpCharges,
        pendingPowerUpMsg,
      };
    });
  };

  const handleAnswer = (index: number | null) => {
    setGame((prev) => {
      if (!prev || prev.feedback !== null) return prev;
      const isCorrect = index !== null && index === prev.current.correctIndex;
      return buildAnswerResult(prev, isCorrect, index);
    });
  };

  const handleTextAnswer = (text: string) => {
    setGame((prev) => {
      if (!prev || prev.feedback !== null) return prev;
      const isCorrect = isOpenAnswerCorrect(text, prev.current.acceptedAnswers ?? []);
      return buildAnswerResult(prev, isCorrect, null);
    });
  };

  // session countdown
  useEffect(() => {
    if (screen !== "playing" || !game) return;
    const id = window.setInterval(() => {
      setGame((prev) => {
        if (!prev) return prev;
        if (prev.sessionLeft <= 1) {
          window.clearInterval(id);
          window.setTimeout(() => finishGame("time", prev), 0);
          return { ...prev, sessionLeft: 0 };
        }
        return { ...prev, sessionLeft: prev.sessionLeft - 1 };
      });
    }, 1000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, game?.level]);

  // per-question countdown (paused while feedback is shown)
  useEffect(() => {
    if (screen !== "playing" || !game || game.feedback !== null) return;
    const id = window.setInterval(() => {
      setGame((prev) => {
        if (!prev || prev.feedback !== null) return prev;
        if (prev.qTimeDeci <= 1) return { ...prev, qTimeDeci: 0 };
        return { ...prev, qTimeDeci: prev.qTimeDeci - 1 };
      });
    }, 100);
    return () => window.clearInterval(id);
  }, [screen, game?.current.id, game?.feedback]);

  // question timeout -> counts as a wrong answer
  useEffect(() => {
    if (screen === "playing" && game && game.feedback === null && game.qTimeDeci <= 0) {
      handleAnswer(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, game?.qTimeDeci, game?.feedback]);

  // power-up pickup announcement
  useEffect(() => {
    if (game?.pendingPowerUpMsg) {
      play("powerup");
      pushToast(game.pendingPowerUpMsg, "powerup");
      setGame((g) => (g ? { ...g, pendingPowerUpMsg: null } : g));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game?.pendingPowerUpMsg]);

  // react to a new answer result: sounds, floaters, shake, achievements, and scheduling the next step
  useEffect(() => {
    if (!game) return;
    if (game.feedback && game.feedback !== prevFeedbackRef.current) {
      const ev = game.lastEvent;
      if (ev) {
        recordWordProgress(game.current.termId, ev.kind === "correct");
        if (ev.kind === "correct") {
          play(ev.enemyDied ? (game.enemy.isBoss ? "boss-defeat" : "defeat-enemy") : "correct");
          setShake("enemy");
          addFloater("enemy", `-${ev.damage}`);
          addFloater("reward", `+${ev.xp} XP · +${ev.coins} 🪙`);

          const milestone = comboMilestoneText(game.combo);
          if (milestone) pushToast(milestone, "combo");
          if (game.combo === 5) unlockAchievement("combo_5");
          if (game.combo === 10) unlockAchievement("word_master");

          const oldXp = game.xp - (ev.xp ?? 0);
          if (Math.floor(oldXp / 100) !== Math.floor(game.xp / 100)) {
            pushToast(`🎉 ¡Nivel ${Math.floor(game.xp / 100) + 1}!`, "levelup");
            play("level-up");
          }

          if (ev.enemyDied) {
            const isFirstEver = stats.lifetimeDefeated === 0;
            setStats((prev) => {
              const next = { ...prev, lifetimeDefeated: prev.lifetimeDefeated + 1 };
              saveStats(next);
              return next;
            });
            if (isFirstEver) unlockAchievement("first_blood");
            if (game.enemy.isBoss) unlockAchievement("boss_slayer");
            if (game.enemy.rarity === "legendary") unlockAchievement("legendary_hunter");

            if (game.enemy.isFirstClear) {
              const id = nodeId(game.level, game.nodeIndex);
              const worldName = LEVEL_META[game.level].world.name;
              clearNode(id);
              setClearedNodes((prev) => (prev.includes(id) ? prev : [...prev, id]));
              play("region-clear");
              pushToast(
                game.enemy.isWorldBoss
                  ? `🗺️ ¡Región conquistada! ${worldName}`
                  : `🚩 ¡"${NODE_KIND_LABEL[game.enemy.nodeKind]}" superado!`,
                "region",
              );
              addFloater("reward", game.enemy.isWorldBoss ? "+100 🪙 bonus de etapa" : "+25 🪙 bonus de nodo");
            }
          }
        } else {
          play(ev.shielded ? "powerup" : "wrong");
          setShake("player");
          addFloater("player", ev.shielded ? "🛡 ¡Bloqueado!" : `-${ev.damage}`);
        }
        const shakeTimeout = window.setTimeout(() => setShake(null), 400);
        timeoutsRef.current.push(shakeTimeout);

        const nodeCleared = ev.kind === "correct" && ev.enemyDied;
        const delay = ev.kind === "correct" ? (ev.enemyDied ? (game.enemy.isBoss ? 1200 : 900) : 750) : 750;
        const t = window.setTimeout(() => {
          if (ev.playerDied) {
            finishGame("hp", game);
          } else if (nodeCleared) {
            finishGame(game.enemy.isBoss ? "boss" : "node", game);
          } else {
            advance();
          }
        }, delay);
        timeoutsRef.current.push(t);
      }
    }
    prevFeedbackRef.current = game.feedback;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game?.feedback]);

  const accuracy = game && game.totalCount > 0 ? Math.round((game.correctCount / game.totalCount) * 100) : 0;
  const qRatio = game ? game.qTimeDeci / game.qMaxDeci : 1;
  const timerColor = qRatio > 0.5 ? "bg-emerald-400" : qRatio > 0.25 ? "bg-amber-400" : "bg-red-500";
  const playerLevel = game ? Math.floor(game.xp / 100) + 1 : 1;
  const xpIntoLevel = game ? game.xp % 100 : 0;
  const burstingEnemy = !!(game?.feedback === "correct" && game.lastEvent?.enemyDied);
  const worldGradient = game ? LEVEL_META[game.level].world.gradient : "from-slate-900 to-slate-950";
  const worldParticle = game ? LEVEL_META[game.level].world.particle : "✨";
  const equippedAvatarEmoji = shopItems.find((i) => i.item_id === wallet.equipped_avatar)?.value ?? "🦸";
  const equippedTitleLabel = shopItems.find((i) => i.item_id === wallet.equipped_title)?.label ?? null;
  const equippedFrameClass = shopItems.find((i) => i.item_id === wallet.equipped_frame)?.value ?? "ring-2 ring-white/20";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        hideClose
        className="left-0 top-0 right-0 bottom-0 translate-x-0 translate-y-0 h-dvh w-screen max-w-none max-h-none rounded-none border-0 gap-0 p-0 overflow-hidden bg-slate-950 text-white"
      >
        <DialogTitle className="sr-only">Word Survivor</DialogTitle>
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-3 top-3 z-30 flex h-9 w-9 items-center justify-center rounded-full bg-black/30 text-white/80 backdrop-blur-sm transition-colors hover:bg-black/50 hover:text-white"
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Cerrar</span>
        </button>
        <div className={`ws-scroll relative h-dvh overflow-y-auto bg-gradient-to-b ${worldGradient}`}>
          {/* ambient decorative particles */}
          {screen !== "select" && (
            <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-30">
              <span className="absolute top-6 left-6 text-2xl animate-float">{worldParticle}</span>
              <span className="absolute top-24 right-10 text-xl animate-float" style={{ animationDelay: "0.6s" }}>
                {worldParticle}
              </span>
              <span className="absolute bottom-16 left-12 text-lg animate-float" style={{ animationDelay: "1.2s" }}>
                {worldParticle}
              </span>
            </div>
          )}

          {toastQueue[0] && (
            <div className="absolute inset-x-0 top-2 flex justify-center pointer-events-none z-20">
              <span
                key={toastQueue[0].id}
                className={`text-xs sm:text-sm font-extrabold px-4 py-1.5 rounded-full shadow-lg animate-toast-slide ${TOAST_STYLES[toastQueue[0].tone]}`}
              >
                {toastQueue[0].text}
              </span>
            </div>
          )}

          <div className="relative mx-auto w-full max-w-xl min-h-full">
          {screen === "select" && (
            <div className="relative p-6 text-center">
              <div className="text-5xl mb-2">⚔️</div>
              <h2 className="text-2xl font-extrabold text-white font-display mb-1">Word Survivor</h2>
              <p className="text-sm text-slate-300 mb-4">
                Explora el mapa, derrota enemigos y conquista cada mundo en inglés.
              </p>

              <button
                onClick={openShop}
                className="w-full flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-primary/50 transition-colors mb-5 text-left"
              >
                <div
                  className={`relative w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-2xl shrink-0 ${equippedFrameClass}`}
                >
                  {equippedAvatarEmoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{playerName}</p>
                  <p className="text-[11px] text-slate-400">
                    {equippedTitleLabel ? (
                      <span className="font-bold uppercase tracking-wide text-amber-300">{equippedTitleLabel}</span>
                    ) : (
                      "Toca para personalizar tu avatar, título y marco"
                    )}
                  </p>
                </div>
                <span className="flex items-center gap-1 text-xs font-bold text-amber-300 bg-white/5 px-2.5 py-1 rounded-full shrink-0">
                  <Coins className="h-3.5 w-3.5" /> {wallet.coins}
                </span>
              </button>

              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="flex items-center gap-1 text-xs font-bold text-sky-300 bg-white/5 px-2.5 py-1 rounded-full">
                  <Zap className="h-3.5 w-3.5" /> {displayedEnergy}/{wallet.energy_max}
                  {displayedEnergy < wallet.energy_max && (
                    <span className="text-[10px] font-medium text-slate-400">
                      · {formatTime(secondsUntilNextRegenTick(wallet.energy_updated_at, ENERGY_REGEN_MINUTES))}
                    </span>
                  )}
                </span>
              </div>

              <div className="sticky top-0 z-20 -mx-6 px-6 py-2.5 mb-3 flex items-center justify-center gap-2 bg-slate-950/85 backdrop-blur-sm border-b border-white/10">
                <Button
                  onClick={openShop}
                  variant="outline"
                  className="flex-1 border-white/15 bg-white/5 text-white hover:bg-white/10 rounded-xl gap-1.5"
                >
                  <ShoppingBag className="h-4 w-4" /> Tienda
                </Button>
                <Button
                  onClick={openLeaderboard}
                  variant="outline"
                  className="flex-1 border-white/15 bg-white/5 text-white hover:bg-white/10 rounded-xl gap-1.5"
                >
                  <Trophy className="h-4 w-4" /> Ranking
                </Button>
              </div>

              {questionsLoading || regionsLoading ? (
                <div className="flex items-center justify-center gap-2 text-sm text-slate-400 py-10">
                  <Loader2 className="h-4 w-4 animate-spin" /> Cargando aventura...
                </div>
              ) : (
                <WorldMapScreen
                  clearedNodes={clearedNodes}
                  onSelectNode={startNode}
                  equippedAvatarEmoji={equippedAvatarEmoji}
                  equippedFrameClass={equippedFrameClass}
                />
              )}

              {stats.gamesPlayed > 0 && (
                <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-400 border-t border-white/10 pt-4">
                  <span className="flex items-center gap-1">
                    <Trophy className="h-3.5 w-3.5 text-amber-400" /> Mejor combo: x{stats.bestCombo}
                  </span>
                  <span className="flex items-center gap-1">
                    <Coins className="h-3.5 w-3.5 text-amber-400" /> {wallet.coins} monedas
                  </span>
                  <span className="flex items-center gap-1">🏆 {stats.unlockedAchievements.length}/{Object.keys(ACHIEVEMENTS).length} logros</span>
                </div>
              )}
            </div>
          )}

          {screen === "playing" && game && (
            <div className="relative">
              <div className="flex items-center justify-between px-4 pt-4 pb-1">
                <button onClick={toggleMute} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                  {muted ? <VolumeX className="h-4 w-4 text-slate-400" /> : <Volume2 className="h-4 w-4 text-slate-300" />}
                </button>
                <div className="flex items-center gap-1 text-xs font-semibold text-slate-300 bg-white/5 px-2.5 py-1 rounded-full">
                  ⏱ {formatTime(game.sessionLeft)}
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-amber-300 bg-white/5 px-2.5 py-1 rounded-full">
                  <Coins className="h-3.5 w-3.5" /> {game.coins}
                </div>
              </div>

              {/* ---- Enemy card (focal point) ---- */}
              <div className="relative px-6 pt-3 pb-4 flex flex-col items-center">
                <div className="flex items-center gap-1.5 mb-1">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border ${RARITY_CONFIG[game.enemy.rarity].badge}`}
                  >
                    {RARITY_CONFIG[game.enemy.rarity].label}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400">
                    {LEVEL_META[game.level].world.particle} Nodo {game.nodeIndex} · {NODE_KIND_LABEL[game.enemy.nodeKind]}
                  </span>
                </div>
                <span className="text-xs font-bold text-slate-200 mb-2 text-center">
                  {game.enemy.isWorldBoss ? "🗺️ JEFE DE REGIÓN · " : game.enemy.isBoss && "👑 JEFE · "}
                  {game.enemy.name}
                </span>

                <div className="relative flex items-center justify-center h-32 w-full mb-2">
                  <div
                    className={`absolute w-32 h-32 rounded-full ${RARITY_CONFIG[game.enemy.rarity].ring} ${
                      game.enemy.isWorldBoss ? "ring-4 ring-amber-300/70 animate-pulse-glow" : ""
                    }`}
                  />
                  <div key={`${game.enemy.name}-${game.defeated}`} className={game.enemy.isBoss ? "animate-boss-entrance" : "animate-pop-in"}>
                    <div
                      className={`relative text-7xl sm:text-8xl leading-none select-none ${
                        shake === "enemy" ? "animate-shake" : burstingEnemy ? "animate-defeat-burst" : "animate-idle-bob"
                      }`}
                    >
                      {game.enemy.emoji}
                      {floaters
                        .filter((f) => f.anchor === "enemy")
                        .map((f) => (
                          <span
                            key={f.id}
                            className="absolute -top-2 left-1/2 -translate-x-1/2 text-base font-bold text-red-400 animate-float-up whitespace-nowrap"
                          >
                            {f.text}
                          </span>
                        ))}
                    </div>
                  </div>
                </div>

                <div className="w-full max-w-[260px] relative">
                  <div className="h-3.5 bg-white/10 rounded-full overflow-hidden border border-white/10">
                    <div
                      className="h-full bg-gradient-to-r from-red-500 to-orange-400 transition-all duration-300 ease-out"
                      style={{ width: `${Math.max(0, (game.enemyHp / game.enemyMaxHp) * 100)}%` }}
                    />
                  </div>
                  {shake === "enemy" && <div className="absolute inset-0 rounded-full bg-white animate-screen-flash" />}
                  <p className="text-center text-[11px] font-bold text-slate-300 mt-1">
                    HP {Math.max(0, game.enemyHp)} / {game.enemyMaxHp}
                  </p>
                </div>
              </div>

              {/* ---- Question (battle action) ---- */}
              <QuestionPanel
                question={game.current}
                feedback={game.feedback}
                selectedIndex={game.selected}
                textValue={textAnswer}
                onTextChange={setTextAnswer}
                onAnswerIndex={handleAnswer}
                onSubmitText={() => handleTextAnswer(textAnswer)}
                qRatio={qRatio}
                timerColor={timerColor}
              />

              {/* ---- Player panel ---- */}
              <div
                className={`mx-5 mb-5 mt-2 p-3 rounded-2xl bg-white/5 border border-white/10 relative ${shake === "player" ? "animate-shake" : ""}`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className={`relative w-11 h-11 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-xl shrink-0 ${equippedFrameClass}`}
                  >
                    {equippedAvatarEmoji}
                    {game.shieldActive && (
                      <span className="absolute -bottom-1 -right-1 bg-sky-500 rounded-full p-0.5 ring-2 ring-slate-900">
                        <ShieldIcon className="h-3 w-3 text-white" />
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-bold text-white truncate">
                        {playerName}
                        {equippedTitleLabel && (
                          <span className="ml-1.5 text-[10px] font-bold uppercase tracking-wide text-amber-300">
                            {equippedTitleLabel}
                          </span>
                        )}
                      </span>
                      <span className="text-[11px] font-bold text-indigo-300 shrink-0">Nv. {playerLevel}</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mt-1">
                      <div className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 transition-all duration-300" style={{ width: `${xpIntoLevel}%` }} />
                    </div>
                  </div>
                  <span className={`text-xs font-extrabold shrink-0 ${comboTier(game.combo).text}`}>{comboTier(game.combo).label}</span>
                </div>

                <div className="flex items-center gap-2 relative">
                  <Heart className="h-3.5 w-3.5 text-red-400 shrink-0" />
                  <div className="flex-1 h-2.5 bg-white/10 rounded-full overflow-hidden relative">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-300"
                      style={{ width: `${game.playerHp}%` }}
                    />
                    {shake === "player" && <div className="absolute inset-0 bg-white animate-screen-flash" />}
                  </div>
                  <span className="text-[11px] font-bold text-slate-300 w-9 text-right shrink-0">{game.playerHp}%</span>
                </div>

                {game.doubleXpCharges > 0 && (
                  <div className="flex items-center gap-1 mt-2 text-[10px] font-bold text-cyan-300 bg-cyan-500/10 border border-cyan-400/30 rounded-full px-2 py-0.5 w-fit">
                    <Zap className="h-3 w-3" /> Double XP x{game.doubleXpCharges}
                  </div>
                )}

                {floaters
                  .filter((f) => f.anchor === "player")
                  .map((f) => (
                    <span key={f.id} className="absolute -top-2 right-4 text-sm font-bold text-red-400 animate-float-up whitespace-nowrap">
                      {f.text}
                    </span>
                  ))}
                {floaters
                  .filter((f) => f.anchor === "reward")
                  .map((f) => (
                    <span key={f.id} className="absolute -top-2 left-4 text-[11px] font-bold text-amber-300 animate-float-up whitespace-nowrap">
                      {f.text}
                    </span>
                  ))}
              </div>
            </div>
          )}

          {screen === "over" && game && (
            <div className="relative p-6 text-center">
              <div className="text-5xl mb-2">
                {overReason === "boss" ? "🏆" : overReason === "node" ? "⚔️" : overReason === "time" ? "⏰" : "💀"}
              </div>
              <h2 className="text-xl font-extrabold text-white mb-1">
                {overReason === "boss"
                  ? "¡Nivel superado!"
                  : overReason === "node"
                    ? "¡Enemigo derrotado!"
                    : overReason === "time"
                      ? "¡Tiempo agotado!"
                      : "¡Has caído en combate!"}
              </h2>
              <p className="text-sm text-slate-400 mb-5">
                {LEVEL_META[game.level].world.name} · Nodo {game.nodeIndex} · {NODE_KIND_LABEL[game.enemy.nodeKind]}
              </p>

              {(overReason === "boss" || overReason === "node") && game.enemy.isFirstClear && (
                <div className="bg-emerald-500/10 border border-emerald-400/30 rounded-xl p-3 mb-5 text-sm text-emerald-300 font-semibold">
                  {game.enemy.isWorldBoss
                    ? "🗺️ ¡Región conquistada! Nuevo mundo desbloqueado."
                    : "🚩 ¡Nodo superado! Siguiente nodo desbloqueado."}
                </div>
              )}

              <div className="grid grid-cols-2 gap-2.5 mb-5 text-left">
                <Stat label="Enemigos derrotados" value={overReason === "boss" || overReason === "node" ? 1 : 0} icon="⚔️" />
                <Stat label="XP ganada" value={game.xp} icon="⭐" />
                <Stat label="Monedas" value={game.coins} icon="🪙" />
                <Stat label="Mejor combo" value={`x${game.bestCombo}`} icon="🔥" />
                <Stat label="Precisión" value={`${accuracy}%`} icon="🎯" className="col-span-2" />
              </div>

              <div className="flex flex-wrap gap-2.5">
                {(overReason === "boss" || overReason === "node") &&
                  game.enemy.isFirstClear &&
                  (() => {
                    const next: { level: QuestionLevel; nodeIndex: number } | null =
                      game.nodeIndex < NODES_PER_WORLD
                        ? { level: game.level, nodeIndex: game.nodeIndex + 1 }
                        : LEVEL_ORDER[LEVEL_ORDER.indexOf(game.level) + 1]
                          ? { level: LEVEL_ORDER[LEVEL_ORDER.indexOf(game.level) + 1], nodeIndex: 1 }
                          : null;
                    return next ? (
                      <Button
                        onClick={() => startNode(next.level, next.nodeIndex)}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
                      >
                        Siguiente nodo ➜
                      </Button>
                    ) : null;
                  })()}
                <Button
                  onClick={() => startNode(game.level, game.nodeIndex)}
                  className="flex-1 bg-primary hover:bg-primary/90 text-white rounded-xl"
                >
                  Jugar de nuevo
                </Button>
                <Button
                  onClick={() => setScreen("select")}
                  variant="outline"
                  className="flex-1 border-white/20 bg-transparent text-white hover:bg-white/10 rounded-xl"
                >
                  Elegir nivel
                </Button>
              </div>
            </div>
          )}

          {screen === "shop" && (
            <div className="relative p-5 sm:p-7">
              <div className="flex items-center justify-between mb-1">
                <button
                  onClick={() => setScreen("select")}
                  className="flex items-center gap-1.5 rounded-full bg-white/5 border border-white/10 pl-2 pr-3 py-1.5 text-xs font-bold text-slate-200 hover:bg-white/10 hover:text-white transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" /> Volver
                </button>
                <span className="flex items-center gap-1 text-xs font-bold text-amber-300 bg-white/5 px-2.5 py-1 rounded-full">
                  <Coins className="h-3.5 w-3.5" /> {wallet.coins}
                </span>
              </div>

              <div className="text-center mb-5">
                <h2 className="text-2xl font-extrabold text-white font-display flex items-center justify-center gap-2">
                  <ShoppingBag className="h-6 w-6 text-primary" /> Tienda
                </h2>
                <p className="text-xs text-slate-400 mt-1">Personaliza tu perfil y canjea recargas de energía</p>
              </div>

              {shopMsg && (
                <div
                  className={`text-center text-xs font-semibold rounded-lg p-2 mb-4 ${
                    shopMsg.tone === "ok" ? "bg-emerald-500/15 text-emerald-300" : "bg-red-500/15 text-red-300"
                  }`}
                >
                  {shopMsg.text}
                </div>
              )}

              <div className="mb-4 rounded-2xl border border-amber-400/20 bg-amber-500/5 p-4">
                <h3 className="text-sm font-bold text-amber-300 mb-2 flex items-center gap-1.5">
                  <Zap className="h-4 w-4" /> Canjear monedas por energía
                </h3>
                <p className="text-xs text-slate-300 mb-3">
                  Cambia monedas ganadas jugando por energía al instante, sin esperar a que se recargue sola.
                </p>
                <Button
                  onClick={handleExchangeEnergy}
                  disabled={exchanging || wallet.coins < ENERGY_EXCHANGE_COIN_COST || displayedEnergy >= wallet.energy_max}
                  className="w-full rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-900 gap-2"
                >
                  {exchanging
                    ? "..."
                    : displayedEnergy >= wallet.energy_max
                      ? "Energía al máximo"
                      : `Canjear ${ENERGY_EXCHANGE_COIN_COST} 🪙 por ${ENERGY_EXCHANGE_AMOUNT} ⚡`}
                </Button>
              </div>

              <div className="mb-4 rounded-2xl border border-emerald-400/20 bg-emerald-500/5 p-4">
                <h3 className="text-sm font-bold text-emerald-300 mb-2 flex items-center gap-1.5">
                  💚 Recargar energía con Yape
                </h3>
                <p className="text-xs text-slate-300 mb-3">
                  Haz tu Yape y escríbenos por WhatsApp con tu captura de pago. Te enviamos tu código de recarga para canjearlo aquí abajo.
                </p>
                <Button
                  onClick={() => window.open(YAPE_WHATSAPP_URL, "_blank")}
                  className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                >
                  <MessageCircle className="h-4 w-4" /> Contactar por WhatsApp
                </Button>
              </div>

              <div className="mb-6 rounded-2xl border border-sky-400/20 bg-sky-500/5 p-4">
                <h3 className="text-sm font-bold text-sky-300 mb-2 flex items-center gap-1.5">
                  <Zap className="h-4 w-4" /> Canjear código de recarga
                </h3>
                <div className="flex gap-2">
                  <input
                    value={rechargeCode}
                    onChange={(e) => setRechargeCode(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === "Enter" && handleRedeemCode()}
                    disabled={redeeming}
                    placeholder="Código de recarga"
                    autoComplete="off"
                    className="flex-1 rounded-xl border-2 border-white/10 bg-white/5 px-3 py-2.5 text-sm font-bold tracking-widest text-slate-100 placeholder:text-slate-500 placeholder:tracking-normal placeholder:font-normal focus:outline-none focus:border-sky-400/60 disabled:opacity-60"
                  />
                  <Button
                    onClick={handleRedeemCode}
                    disabled={redeeming || !rechargeCode.trim()}
                    className="rounded-xl bg-sky-500 hover:bg-sky-600 text-white shrink-0 px-4"
                  >
                    {redeeming ? "..." : "Canjear"}
                  </Button>
                </div>
              </div>

              {(["avatar", "title", "frame", "voucher"] as ShopCategory[]).map((category) => {
                const items = shopItems.filter((i) => i.category === category);
                if (items.length === 0) return null;
                const sectionMeta =
                  category === "avatar"
                    ? { label: "Avatares", emoji: "🧑‍🎤" }
                    : category === "title"
                      ? { label: "Títulos", emoji: "🏷️" }
                      : category === "frame"
                        ? { label: "Marcos", emoji: "🖼️" }
                        : { label: "Tickets de descuento", emoji: "🎟️" };
                return (
                  <div key={category} className="mb-6">
                    <h3 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-1.5">
                      <span>{sectionMeta.emoji}</span> {sectionMeta.label}
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {items.map((item) => {
                        const owned = inventory.includes(item.item_id);
                        const equipped =
                          (item.category === "avatar" && wallet.equipped_avatar === item.item_id) ||
                          (item.category === "title" && wallet.equipped_title === item.item_id) ||
                          (item.category === "frame" && wallet.equipped_frame === item.item_id);
                        return (
                          <div
                            key={item.item_id}
                            className={`relative rounded-2xl border p-3.5 transition-colors ${
                              equipped ? "border-amber-400/60 bg-amber-400/10" : "border-white/10 bg-white/5 hover:bg-white/[0.08]"
                            }`}
                          >
                            <span
                              className={`absolute top-2 right-2 text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full border ${RARITY_CONFIG[item.rarity].badge}`}
                            >
                              {RARITY_CONFIG[item.rarity].label}
                            </span>

                            <div className="flex justify-center mb-3 mt-2">
                              {item.category === "avatar" && (
                                <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center text-3xl">
                                  {item.value}
                                </div>
                              )}
                              {item.category === "title" && (
                                <div className="w-full h-14 rounded-lg bg-white/10 flex items-center justify-center text-xs font-bold text-amber-300 px-1 text-center">
                                  {item.value}
                                </div>
                              )}
                              {item.category === "frame" && (
                                <div className={`w-14 h-14 rounded-full bg-white/10 ${item.value}`} />
                              )}
                              {item.category === "voucher" && (
                                <div className="w-full h-14 rounded-lg bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center text-sm font-extrabold text-emerald-300">
                                  🎟️ {item.value}
                                </div>
                              )}
                            </div>
                            <p className="text-xs font-bold text-white text-center truncate mb-2.5">{item.label}</p>
                            {owned ? (
                              item.category === "voucher" ? (
                                <div className="w-full h-8 flex items-center justify-center text-[12px] font-mono font-extrabold tracking-widest text-emerald-300 bg-emerald-500/10 border border-emerald-400/30 rounded-lg">
                                  {voucherCodes[item.item_id] ?? "…"}
                                </div>
                              ) : (
                                <Button
                                  size="sm"
                                  onClick={() => handleEquip(item)}
                                  variant={equipped ? "default" : "outline"}
                                  className={`w-full h-8 text-[11px] rounded-lg gap-1 ${
                                    equipped
                                      ? "bg-amber-500 hover:bg-amber-600 text-slate-900"
                                      : "border-white/20 bg-transparent text-white hover:bg-white/10"
                                  }`}
                                >
                                  {equipped ? (
                                    <>
                                      <Check className="h-3 w-3" /> Equipado
                                    </>
                                  ) : (
                                    "Equipar"
                                  )}
                                </Button>
                              )
                            ) : (
                              <Button
                                size="sm"
                                disabled={purchasingId === item.item_id}
                                onClick={() => handlePurchase(item)}
                                className="w-full h-8 text-[11px] rounded-lg gap-1 bg-primary hover:bg-primary/90 text-white"
                              >
                                <Coins className="h-3 w-3" /> {item.price}
                              </Button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {screen === "leaderboard" && (
            <div className="relative p-5">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => setScreen("select")}
                  className="flex items-center gap-1.5 rounded-full bg-white/5 border border-white/10 pl-2 pr-3 py-1.5 text-xs font-bold text-slate-200 hover:bg-white/10 hover:text-white transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" /> Volver
                </button>
                <h2 className="text-base font-extrabold text-white flex items-center gap-1.5">
                  <Trophy className="h-4 w-4" /> Ranking
                </h2>
                <span className="w-7" />
              </div>

              {leaderboard.length === 0 ? (
                <div className="text-center text-sm text-slate-400 py-10">Aún no hay nadie en el ranking.</div>
              ) : (
                <div className="space-y-1.5">
                  {leaderboard.map((row, i) => {
                    const isMe = row.usuario_id === user?.id;
                    const avatarEmoji = shopItems.find((s) => s.item_id === row.equipped_avatar)?.value ?? "🦸";
                    const titleLabel = shopItems.find((s) => s.item_id === row.equipped_title)?.label;
                    return (
                      <div
                        key={row.usuario_id}
                        className={`flex items-center gap-3 p-2.5 rounded-xl border ${
                          isMe ? "border-primary/50 bg-primary/10" : "border-white/10 bg-white/5"
                        }`}
                      >
                        <span className="w-6 text-center text-sm font-bold text-slate-400 shrink-0">
                          {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                        </span>
                        <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-lg shrink-0">
                          {avatarEmoji}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white truncate">
                            {row.display_name ?? "Survivor"} {isMe && "(Tú)"}
                          </p>
                          {titleLabel && <p className="text-[10px] font-bold uppercase text-amber-300">{titleLabel}</p>}
                        </div>
                        <span className="flex items-center gap-1 text-xs font-bold text-amber-300 shrink-0">
                          <Coins className="h-3.5 w-3.5" /> {row.coins}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
