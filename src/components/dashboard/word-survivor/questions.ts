import { supabase } from "@/integrations/supabase/client";

export type QuestionLevel = "B2" | "C1" | "C2";
export const LEVEL_ORDER: QuestionLevel[] = ["B2", "C1", "C2"];
export type QuestionType = "vocabulary" | "phrasal_verb" | "collocation" | "grammar";
export type QuestionFormat = "multiple_choice" | "cloze" | "key_word_transformation" | "word_formation";

export interface WordSurvivorQuestion {
  id: string;
  termId: string;
  level: QuestionLevel;
  type: QuestionType;
  format: QuestionFormat;
  nodeIndex: number | null;
  prompt: string;
  options: string[] | null;
  correctIndex: number | null;
  acceptedAnswers: string[] | null;
  keyWord: string | null;
  transformPrompt: string | null;
  tip: string;
}

const normalizeAnswer = (s: string) =>
  s.trim().toLowerCase().replace(/\s+/g, " ").replace(/[.,!?;:]+$/g, "");

export const isOpenAnswerCorrect = (input: string, accepted: string[]): boolean => {
  const normalizedInput = normalizeAnswer(input);
  return normalizedInput.length > 0 && accepted.some((a) => normalizeAnswer(a) === normalizedInput);
};

export const TYPE_META: Record<QuestionType, { label: string; emoji: string; accent: string }> = {
  vocabulary: { label: "Vocabulary Challenge", emoji: "📖", accent: "text-emerald-300" },
  phrasal_verb: { label: "Phrasal Verb Challenge", emoji: "🔄", accent: "text-sky-300" },
  collocation: { label: "Collocation Challenge", emoji: "🔗", accent: "text-fuchsia-300" },
  grammar: { label: "Grammar Challenge", emoji: "📐", accent: "text-amber-300" },
};

export const FORMAT_META: Record<QuestionFormat, { label: string; emoji: string }> = {
  multiple_choice: { label: "Multiple Choice", emoji: "🔘" },
  cloze: { label: "Cloze", emoji: "✏️" },
  key_word_transformation: { label: "Key Word Transformation", emoji: "🔑" },
  word_formation: { label: "Word Formation", emoji: "🧩" },
};

export interface LevelMeta {
  label: string;
  description: string;
  badgeClass: string;
  world: { name: string; gradient: string; particle: string; glow: string };
}

export const LEVEL_META: Record<QuestionLevel, LevelMeta> = {
  B2: {
    label: "B2 First (FCE)",
    description: "Use of English nivel B2: vocabulario, phrasal verbs, collocations y gramática del First Certificate",
    badgeClass: "bg-blue-500/20 text-blue-300",
    world: { name: "B2 First (FCE)", gradient: "from-violet-950 via-purple-900 to-slate-950", particle: "🦇", glow: "bg-violet-500/25" },
  },
  C1: {
    label: "C1 Advanced (CAE)",
    description: "Use of English nivel C1: vocabulario avanzado, word formation y transformaciones del Advanced",
    badgeClass: "bg-violet-500/20 text-violet-300",
    world: { name: "C1 Advanced (CAE)", gradient: "from-fuchsia-950 via-purple-900 to-slate-950", particle: "⚡", glow: "bg-fuchsia-500/25" },
  },
  C2: {
    label: "C2 Proficiency (CPE)",
    description: "Use of English nivel C2: registro formal, idiomatismo y los retos más exigentes del Proficiency",
    badgeClass: "bg-yellow-500/20 text-yellow-300",
    world: { name: "C2 Proficiency (CPE)", gradient: "from-yellow-950 via-amber-900 to-slate-950", particle: "👑", glow: "bg-yellow-500/25" },
  },
};

export type EnemyRarity = "common" | "rare" | "epic" | "legendary";

interface RarityConfig {
  label: string;
  weight: number;
  hpMultiplier: number;
  rewardMultiplier: number;
  atkMultiplier: number;
  ring: string;
  badge: string;
  text: string;
}

export const RARITY_CONFIG: Record<EnemyRarity, RarityConfig> = {
  common: {
    label: "Común",
    weight: 60,
    hpMultiplier: 1,
    rewardMultiplier: 1,
    atkMultiplier: 1,
    ring: "shadow-[0_0_40px_10px_rgba(148,163,184,0.25)]",
    badge: "bg-slate-500/20 text-slate-300 border-slate-400/30",
    text: "text-slate-300",
  },
  rare: {
    label: "Raro",
    weight: 25,
    hpMultiplier: 1.3,
    rewardMultiplier: 1.4,
    atkMultiplier: 1.15,
    ring: "shadow-[0_0_50px_14px_rgba(59,130,246,0.35)]",
    badge: "bg-blue-500/20 text-blue-300 border-blue-400/30",
    text: "text-blue-300",
  },
  epic: {
    label: "Épico",
    weight: 12,
    hpMultiplier: 1.7,
    rewardMultiplier: 1.9,
    atkMultiplier: 1.3,
    ring: "shadow-[0_0_60px_18px_rgba(168,85,247,0.4)]",
    badge: "bg-purple-500/20 text-purple-300 border-purple-400/30",
    text: "text-purple-300",
  },
  legendary: {
    label: "Legendario",
    weight: 3,
    hpMultiplier: 2.2,
    rewardMultiplier: 2.6,
    atkMultiplier: 1.5,
    ring: "shadow-[0_0_70px_22px_rgba(245,158,11,0.45)]",
    badge: "bg-amber-500/20 text-amber-300 border-amber-400/30",
    text: "text-amber-300",
  },
};

export const rollRarity = (): EnemyRarity => {
  const entries = Object.entries(RARITY_CONFIG) as [EnemyRarity, RarityConfig][];
  const total = entries.reduce((s, [, r]) => s + r.weight, 0);
  let roll = Math.random() * total;
  for (const [key, cfg] of entries) {
    roll -= cfg.weight;
    if (roll <= 0) return key;
  }
  return "common";
};

export const rollBossRarity = (boosted: boolean): EnemyRarity =>
  Math.random() < (boosted ? 0.65 : 0.4) ? "legendary" : "epic";

export type NodeKind = "battle" | "miniboss" | "boss" | "treasure";

export interface WorldNodeConfig {
  index: number;
  kind: NodeKind;
  maxQTimeDeci: number;
  enemyAttack: number;
  bossHpMultiplier: number;
  forceEpicBoss: boolean;
  xpPreview: number;
  coinPreview: number;
}

export const NODES_PER_WORLD = 12;

// Fixed per-world layout: 8 battle + 2 mini-boss + 1 treasure + 1 final boss.
export const WORLD_NODE_TEMPLATE: NodeKind[] = [
  "battle",
  "battle",
  "battle",
  "miniboss",
  "battle",
  "battle",
  "battle",
  "treasure",
  "battle",
  "battle",
  "miniboss",
  "boss",
];

export const NODE_KIND_LABEL: Record<NodeKind, string> = {
  battle: "Combate",
  miniboss: "Mini-Jefe",
  boss: "Jefe Final",
  treasure: "Tesoro",
};

export const NODE_KIND_ICON: Record<NodeKind, string> = {
  battle: "⚔️",
  miniboss: "💀",
  boss: "🏰",
  treasure: "🎁",
};

// All four Cambridge Use of English formats appear from the very first battle onward,
// not just at the boss. The final boss is the one exception: it drops multiple_choice
// entirely so every question there demands a typed answer -- the toughest challenge.
export const FORMATS_BY_NODE_KIND: Record<NodeKind, QuestionFormat[]> = {
  battle: ["multiple_choice", "cloze", "word_formation", "key_word_transformation"],
  treasure: ["multiple_choice", "cloze", "word_formation", "key_word_transformation"],
  miniboss: ["multiple_choice", "cloze", "word_formation", "key_word_transformation"],
  boss: ["cloze", "word_formation", "key_word_transformation"],
};

// Typing takes longer than tapping a button, so non-multiple-choice questions get more time.
export const FORMAT_TIME_MULTIPLIER: Record<QuestionFormat, number> = {
  multiple_choice: 1,
  cloze: 1.4,
  word_formation: 1.5,
  key_word_transformation: 1.8,
};

export const getWorldNode = (index: number): WorldNodeConfig => {
  const kind = WORLD_NODE_TEMPLATE[index - 1];
  const t = (index - 1) / (NODES_PER_WORLD - 1);
  const baseQTime = Math.round(100 - t * 35);
  const baseAttack = Math.round(9 + t * 12);
  const isBigFight = kind === "miniboss" || kind === "boss";
  const rewardMult = kind === "boss" ? 3 : kind === "miniboss" ? 1.8 : kind === "treasure" ? 1.3 : 1;
  return {
    index,
    kind,
    maxQTimeDeci: kind === "treasure" ? Math.round(baseQTime * 1.25) : baseQTime,
    enemyAttack: kind === "treasure" ? Math.round(baseAttack * 0.6) : baseAttack,
    bossHpMultiplier: kind === "boss" ? 1.6 + t * 0.4 : kind === "miniboss" ? 1.25 + t * 0.2 : 1,
    forceEpicBoss: isBigFight,
    xpPreview: Math.round((15 + t * 35) * rewardMult),
    coinPreview: Math.round((8 + t * 20) * (kind === "boss" ? 4 : kind === "miniboss" ? 2 : kind === "treasure" ? 2.5 : 1)),
  };
};

export const nodeId = (level: QuestionLevel, index: number) => `${level}-${index}`;

export const isNodeUnlocked = (level: QuestionLevel, index: number, clearedNodes: string[]): boolean => {
  if (index > 1) return clearedNodes.includes(nodeId(level, index - 1));
  const idx = LEVEL_ORDER.indexOf(level);
  if (idx === 0) return true;
  return clearedNodes.includes(nodeId(LEVEL_ORDER[idx - 1], NODES_PER_WORLD));
};

export const WORLD_BOSS_EMOJI: Record<QuestionLevel, string> = {
  B2: "🧛",
  C1: "👁️",
  C2: "👑",
};

export const WORLD_BOSS_NAME: Record<QuestionLevel, string> = {
  B2: "Señor del Castillo",
  C1: "Horror Arcano",
  C2: "Rey de Cambridge",
};

export const WORLD_LANDMARKS: Record<QuestionLevel, string[]> = {
  B2: ["🏰", "🦇", "🕯️", "⛓️", "🌙"],
  C1: ["⚡", "🌩️", "🔮", "🗿", "🌀"],
  C2: ["📜", "👑", "🏛️", "🕊️", "⭐"],
};

export type PowerUpKind = "shield" | "freeze" | "bomb" | "double_xp";

export const POWER_UP_META: Record<PowerUpKind, { label: string; emoji: string; description: string }> = {
  shield: { label: "Shield", emoji: "🛡", description: "Bloquea el próximo golpe enemigo" },
  freeze: { label: "Freeze", emoji: "❄", description: "+5s en el cronómetro actual" },
  bomb: { label: "Bomb", emoji: "💣", description: "Daño masivo instantáneo" },
  double_xp: { label: "Double XP", emoji: "⚡", description: "XP x2 en tus próximas respuestas" },
};

export const rollPowerUp = (): PowerUpKind => {
  const kinds: PowerUpKind[] = ["shield", "freeze", "bomb", "double_xp"];
  return kinds[Math.floor(Math.random() * kinds.length)];
};

export type AchievementId =
  | "first_blood"
  | "combo_5"
  | "word_master"
  | "boss_slayer"
  | "legendary_hunter"
  | "survivor"
  | "perfectionist"
  | "coin_collector";

export const ACHIEVEMENTS: Record<AchievementId, { label: string; emoji: string; description: string }> = {
  first_blood: { label: "Primera Sangre", emoji: "🗡️", description: "Derrota tu primer enemigo" },
  combo_5: { label: "En Llamas", emoji: "🔥", description: "Alcanza un combo x5" },
  word_master: { label: "Word Master", emoji: "👑", description: "Alcanza un combo x10" },
  boss_slayer: { label: "Cazador de Jefes", emoji: "💀", description: "Derrota a tu primer jefe" },
  legendary_hunter: { label: "Cazador Legendario", emoji: "🌟", description: "Derrota a un enemigo legendario" },
  survivor: { label: "Superviviente", emoji: "🛡️", description: "Sobrevive una sesión completa" },
  perfectionist: { label: "Perfeccionista", emoji: "🎯", description: "Termina una partida con 100% de precisión" },
  coin_collector: { label: "Coleccionista", emoji: "🪙", description: "Acumula 200 monedas en total" },
};

export const ENEMY_BY_TYPE: Record<QuestionType, { name: string; emoji: string }[]> = {
  vocabulary: [
    { name: "Vocab Vampire", emoji: "🧛" },
    { name: "Synonym Specter", emoji: "👻" },
    { name: "Lexicon Lurker", emoji: "👹" },
  ],
  phrasal_verb: [
    { name: "Phrasal Phantom", emoji: "🧟" },
    { name: "Particle Pirate", emoji: "🏴‍☠️" },
    { name: "Idiom Ninja", emoji: "🥷" },
  ],
  collocation: [
    { name: "Collocation Cyclops", emoji: "👁️" },
    { name: "Combo Kraken", emoji: "🦑" },
    { name: "Pairing Phantom", emoji: "🐙" },
  ],
  grammar: [
    { name: "Grammar Goblin", emoji: "👺" },
    { name: "Tense Troll", emoji: "🧌" },
    { name: "Syntax Serpent", emoji: "🐍" },
  ],
};

export const pickEnemy = (type: QuestionType) => {
  const list = ENEMY_BY_TYPE[type];
  return list[Math.floor(Math.random() * list.length)];
};

interface DbQuestionRow {
  id: string;
  term_id: string;
  level: QuestionLevel;
  type: QuestionType;
  format: QuestionFormat;
  node_index: number | null;
  prompt: string;
  options: string[] | null;
  correct_index: number | null;
  accepted_answers: string[] | null;
  key_word: string | null;
  transform_prompt: string | null;
  tip: string | null;
}

export const fetchWordSurvivorQuestions = async (): Promise<WordSurvivorQuestion[]> => {
  const { data, error } = await supabase
    .from("word_survivor_questions")
    .select(
      "id, term_id, level, type, format, node_index, prompt, options, correct_index, accepted_answers, key_word, transform_prompt, tip",
    )
    .eq("active", true);
  if (error) throw error;
  return (data as DbQuestionRow[]).map((q) => ({
    id: q.id,
    termId: q.term_id,
    level: q.level,
    type: q.type,
    format: q.format,
    nodeIndex: q.node_index,
    prompt: q.prompt,
    options: q.options,
    correctIndex: q.correct_index,
    acceptedAnswers: q.accepted_answers,
    keyWord: q.key_word,
    transformPrompt: q.transform_prompt,
    tip: q.tip ?? "",
  }));
};

export const recordWordProgress = async (termId: string, correct: boolean) => {
  const { error } = await supabase.rpc("record_word_progress", { p_term_id: termId, p_correct: correct });
  if (error) console.error("record_word_progress failed:", error.message);
};

export const fetchClearedNodes = async (): Promise<string[]> => {
  const { data, error } = await supabase.from("word_survivor_region_progress").select("cleared_regions").maybeSingle();
  if (error) throw error;
  return (data?.cleared_regions ?? []) as string[];
};

export const clearNode = async (id: string) => {
  const { error } = await supabase.rpc("clear_word_survivor_region", { p_level: id });
  if (error) console.error("clear_word_survivor_region failed:", error.message);
};

export type ShopCategory = "avatar" | "title" | "frame" | "voucher";

export interface ShopItem {
  item_id: string;
  category: ShopCategory;
  value: string;
  label: string;
  description: string | null;
  price: number;
  rarity: EnemyRarity;
}

// Keep these in sync with the constants hardcoded in the settle_word_survivor_resources
// and start_word_survivor_node Postgres functions (supabase/migrations/*_word_survivor_energy_lives_recharge.sql).
export const ENERGY_MAX = 20;
export const NODE_ENERGY_COST = 2;
export const ENERGY_REGEN_MINUTES = 8;

export interface WalletRow {
  coins: number;
  display_name: string | null;
  equipped_avatar: string | null;
  equipped_title: string | null;
  equipped_frame: string | null;
  energy: number;
  energy_max: number;
  energy_updated_at: string;
}

const EMPTY_WALLET: WalletRow = {
  coins: 0,
  display_name: null,
  equipped_avatar: null,
  equipped_title: null,
  equipped_frame: null,
  energy: ENERGY_MAX,
  energy_max: ENERGY_MAX,
  energy_updated_at: new Date().toISOString(),
};

export interface LeaderboardRow {
  usuario_id: string;
  display_name: string | null;
  coins: number;
  equipped_avatar: string | null;
  equipped_title: string | null;
}

export const fetchWallet = async (userId: string): Promise<WalletRow> => {
  const { data, error } = await supabase
    .from("word_survivor_wallet")
    .select("coins, display_name, equipped_avatar, equipped_title, equipped_frame, energy, energy_max, energy_updated_at")
    .eq("usuario_id", userId)
    .maybeSingle();
  if (error) throw error;
  return (data as WalletRow | null) ?? EMPTY_WALLET;
};

export const fetchShopItems = async (): Promise<ShopItem[]> => {
  const { data, error } = await supabase.from("word_survivor_shop_items").select("*").order("category").order("price");
  if (error) throw error;
  return data as ShopItem[];
};

export interface InventoryItem {
  item_id: string;
  redemption_code: string | null;
}

export const fetchInventory = async (): Promise<InventoryItem[]> => {
  const { data, error } = await supabase.from("word_survivor_inventory").select("item_id, redemption_code");
  if (error) throw error;
  return (data ?? []) as InventoryItem[];
};

export const fetchLeaderboard = async (): Promise<LeaderboardRow[]> => {
  const { data, error } = await supabase
    .from("word_survivor_wallet")
    .select("usuario_id, display_name, coins, equipped_avatar, equipped_title")
    .order("coins", { ascending: false })
    .limit(20);
  if (error) throw error;
  return data as LeaderboardRow[];
};

export const depositCoins = async (amount: number) => {
  if (amount <= 0) return;
  const { error } = await supabase.rpc("deposit_word_survivor_coins", { p_amount: amount });
  if (error) console.error("deposit_word_survivor_coins failed:", error.message);
};

export const NODE_ENTRY_FEE = 10;

export const spendCoins = async (
  amount: number,
): Promise<{ success: boolean; error?: string; remaining_coins?: number }> => {
  const { data, error } = await supabase.rpc("spend_word_survivor_coins", { p_amount: amount });
  if (error) return { success: false, error: error.message };
  return data as { success: boolean; error?: string; remaining_coins?: number };
};

export interface StartNodeResult {
  success: boolean;
  error?: "no_energy" | "insufficient_funds";
  remaining_coins?: number;
  remaining_energy?: number;
}

export const startNodeAttempt = async (coinCost: number, energyCost: number): Promise<StartNodeResult> => {
  const { data, error } = await supabase.rpc("start_word_survivor_node", {
    p_coin_cost: coinCost,
    p_energy_cost: energyCost,
  });
  if (error) return { success: false };
  return data as unknown as StartNodeResult;
};

export const redeemRechargeCode = async (
  code: string,
): Promise<{ success: boolean; error?: string; amount?: number }> => {
  const { data, error } = await supabase.rpc("redeem_word_survivor_code", { p_code: code });
  if (error) return { success: false, error: error.message };
  return data as { success: boolean; error?: string; amount?: number };
};

export const ENERGY_EXCHANGE_COIN_COST = 50;
export const ENERGY_EXCHANGE_AMOUNT = 5;

export const exchangeCoinsForEnergy = async (): Promise<{
  success: boolean;
  error?: string;
  remaining_coins?: number;
  remaining_energy?: number;
}> => {
  const { data, error } = await supabase.rpc("exchange_word_survivor_coins_for_energy", {
    p_coin_cost: ENERGY_EXCHANGE_COIN_COST,
    p_energy_amount: ENERGY_EXCHANGE_AMOUNT,
  });
  if (error) return { success: false, error: error.message };
  return data as { success: boolean; error?: string; remaining_coins?: number; remaining_energy?: number };
};

// Display-only countdown to the next regen tick; the server is the source of truth and
// settles the real value lazily whenever start_word_survivor_node runs.
export const secondsUntilNextRegenTick = (updatedAtIso: string, regenMinutes: number): number => {
  const elapsedSeconds = (Date.now() - new Date(updatedAtIso).getTime()) / 1000;
  const regenSeconds = regenMinutes * 60;
  const secondsIntoTick = ((elapsedSeconds % regenSeconds) + regenSeconds) % regenSeconds;
  return Math.max(0, Math.ceil(regenSeconds - secondsIntoTick));
};

export const purchaseItem = async (
  itemId: string,
): Promise<{ success: boolean; error?: string; remaining_coins?: number; redemption_code?: string }> => {
  const { data, error } = await supabase.rpc("purchase_word_survivor_item", { p_item_id: itemId });
  if (error) return { success: false, error: error.message };
  return data as { success: boolean; error?: string; remaining_coins?: number; redemption_code?: string };
};

export const equipItem = async (category: ShopCategory, itemId: string | null) => {
  const { error } = await supabase.rpc("equip_word_survivor_item", { p_category: category, p_item_id: itemId });
  if (error) console.error("equip_word_survivor_item failed:", error.message);
};

export const shuffleQuestions = (
  bank: WordSurvivorQuestion[],
  level: QuestionLevel,
  nodeIndex: number,
): WordSurvivorQuestion[] => {
  const byNode = bank.filter((q) => q.level === level && q.nodeIndex === nodeIndex);
  // Falls back to the whole level's pool if this node has no curated questions yet
  // (e.g. right after a new level ships, before the admin panel assigns any), so the
  // node stays playable instead of breaking.
  const pool = byNode.length > 0 ? byNode : bank.filter((q) => q.level === level);
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};
