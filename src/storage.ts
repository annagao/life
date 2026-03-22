import type { FastingSession, Goal, PetState, TodoDay, TodoItem, WeightEntry } from "./types";

const KEYS = {
  weights: "health-app:weights",
  goal: "health-app:goal",
  fasts: "health-app:fasts",
  profile: "health-app:profile",
  pet: "health-app:pet",
  todos: "health-app:todos",
} as const;

export type UserProfile = {
  /** 称呼，用于个性化标题，如「Anna」 */
  displayName: string;
};

const DEFAULT_PROFILE: UserProfile = { displayName: "小伙伴" };

export function getProfile(): UserProfile {
  const raw = load(KEYS.profile, null as UserProfile | null);
  if (!raw || typeof raw !== "object" || typeof raw.displayName !== "string") {
    return { ...DEFAULT_PROFILE };
  }
  const name = raw.displayName.trim().slice(0, 20);
  return { displayName: name || DEFAULT_PROFILE.displayName };
}

export function setProfile(profile: UserProfile): void {
  save(KEYS.profile, {
    displayName: profile.displayName.trim().slice(0, 20) || DEFAULT_PROFILE.displayName,
  });
}

const LB_TO_KG = 0.45359237;

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

/** Legacy entries stored weight in lb */
type LegacyWeightEntry = { date: string; weightLb: number; weightKg?: number };
type LegacyGoal = {
  targetWeightLb?: number;
  targetWeightKg?: number;
  startWeightLb?: number | null;
  startWeightKg?: number | null;
  targetDate: string;
  startDate: string;
};

function normalizeWeightEntry(raw: LegacyWeightEntry): WeightEntry {
  if (typeof raw.weightKg === "number" && Number.isFinite(raw.weightKg)) {
    return { date: raw.date, weightKg: raw.weightKg };
  }
  if (typeof raw.weightLb === "number" && Number.isFinite(raw.weightLb)) {
    return { date: raw.date, weightKg: Math.round(raw.weightLb * LB_TO_KG * 10) / 10 };
  }
  return { date: raw.date, weightKg: 0 };
}

function normalizeGoal(raw: LegacyGoal | Goal | null): Goal | null {
  if (!raw || typeof raw !== "object") return null;
  if ("targetWeightKg" in raw && typeof (raw as Goal).targetWeightKg === "number") {
    const g = raw as Goal;
    return {
      targetWeightKg: g.targetWeightKg,
      targetDate: g.targetDate,
      startWeightKg: g.startWeightKg,
      startDate: g.startDate,
    };
  }
  const legacy = raw as LegacyGoal;
  const target =
    typeof legacy.targetWeightKg === "number"
      ? legacy.targetWeightKg
      : typeof legacy.targetWeightLb === "number"
        ? Math.round(legacy.targetWeightLb * LB_TO_KG * 10) / 10
        : null;
  if (target === null || !Number.isFinite(target)) return null;

  let start: number | null = null;
  if (typeof legacy.startWeightKg === "number") start = legacy.startWeightKg;
  else if (typeof legacy.startWeightLb === "number")
    start = Math.round(legacy.startWeightLb * LB_TO_KG * 10) / 10;

  return {
    targetWeightKg: target,
    targetDate: legacy.targetDate,
    startWeightKg: start,
    startDate: legacy.startDate,
  };
}

export function getWeights(): WeightEntry[] {
  const raw = load(KEYS.weights, [] as LegacyWeightEntry[]);
  if (!Array.isArray(raw)) return [];
  const normalized = raw.map(normalizeWeightEntry);
  const legacy = raw.some((r) => typeof r === "object" && r && "weightLb" in r);
  if (legacy) save(KEYS.weights, normalized);
  return normalized;
}

export function setWeights(entries: WeightEntry[]): void {
  save(KEYS.weights, entries);
}

export function getGoal(): Goal | null {
  const raw = load(KEYS.goal, null as LegacyGoal | Goal | null);
  const normalized = normalizeGoal(raw);
  const legacy =
    raw &&
    typeof raw === "object" &&
    ("targetWeightLb" in raw || "startWeightLb" in raw);
  if (legacy && normalized) save(KEYS.goal, normalized);
  return normalized;
}

export function setGoal(goal: Goal | null): void {
  if (goal === null) localStorage.removeItem(KEYS.goal);
  else save(KEYS.goal, goal);
}

export function getFasts(): FastingSession[] {
  return load(KEYS.fasts, [] as FastingSession[]);
}

export function setFasts(sessions: FastingSession[]): void {
  save(KEYS.fasts, sessions);
}

function clamp(n: number, lo = 0, hi = 100): number {
  return Math.min(hi, Math.max(lo, n));
}

function defaultPet(): PetState {
  const t = new Date().toISOString();
  return {
    dogName: "Bingo",
    fullness: 78,
    hydration: 75,
    mood: 88,
    skillLevel: 1,
    skillXp: 0,
    litterMess: 12,
    lastWalkAt: null,
    lastDecayAt: t,
  };
}

function normalizePet(raw: unknown): PetState {
  const d = defaultPet();
  if (!raw || typeof raw !== "object") return d;
  const o = raw as Record<string, unknown>;
  return {
    dogName: typeof o.dogName === "string" && o.dogName.trim() ? o.dogName.trim().slice(0, 12) : d.dogName,
    fullness: clamp(Number(o.fullness) || d.fullness),
    hydration: clamp(Number(o.hydration) || d.hydration),
    mood: clamp(Number(o.mood) || d.mood),
    skillLevel: Math.min(5, Math.max(1, Math.round(Number(o.skillLevel)) || d.skillLevel)),
    skillXp: Math.min(99, Math.max(0, Math.round(Number(o.skillXp)) || 0)),
    litterMess: clamp(Number(o.litterMess) || d.litterMess),
    lastWalkAt: typeof o.lastWalkAt === "string" ? o.lastWalkAt : null,
    lastDecayAt: typeof o.lastDecayAt === "string" ? o.lastDecayAt : d.lastDecayAt,
  };
}

function decayPet(state: PetState): PetState {
  const now = Date.now();
  const last = new Date(state.lastDecayAt).getTime();
  const hours = Math.min(72, Math.max(0, (now - last) / 3_600_000));
  if (hours < 0.02) return state;
  return {
    ...state,
    fullness: clamp(state.fullness - hours * 2.2),
    hydration: clamp(state.hydration - hours * 2.8),
    mood: clamp(state.mood - hours * 0.9),
    litterMess: clamp(state.litterMess + hours * 3.5),
    lastDecayAt: new Date().toISOString(),
  };
}

export function getPet(): PetState {
  const raw = load(KEYS.pet, null);
  let state = decayPet(normalizePet(raw));
  save(KEYS.pet, state);
  return state;
}

export function setPet(state: PetState): void {
  save(KEYS.pet, { ...state, lastDecayAt: new Date().toISOString() });
}

function defaultTodoDay(): TodoDay {
  return { dailyGoal: "", items: [] };
}

function normalizeTodoDay(raw: unknown): TodoDay {
  const d = defaultTodoDay();
  if (!raw || typeof raw !== "object") return d;
  const o = raw as Record<string, unknown>;
  const dailyGoal = typeof o.dailyGoal === "string" ? o.dailyGoal.slice(0, 500) : "";
  const items: TodoItem[] = [];
  if (Array.isArray(o.items)) {
    for (const it of o.items) {
      if (!it || typeof it !== "object") continue;
      const x = it as Record<string, unknown>;
      const id = typeof x.id === "string" && x.id ? x.id : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const text = typeof x.text === "string" ? x.text.slice(0, 400) : "";
      const done = Boolean(x.done);
      if (text.trim()) items.push({ id, text: text.trim(), done });
    }
  }
  return { dailyGoal: dailyGoal.trim(), items: items.slice(0, 80) };
}

function loadTodoMap(): Record<string, TodoDay> {
  const raw = load(KEYS.todos, null as Record<string, unknown> | null);
  if (!raw || typeof raw !== "object") return {};
  const out: Record<string, TodoDay> = {};
  for (const [k, v] of Object.entries(raw)) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(k)) out[k] = normalizeTodoDay(v);
  }
  return out;
}

export function getTodoDay(dateKey: string): TodoDay {
  const all = loadTodoMap();
  return all[dateKey] ?? defaultTodoDay();
}

export function setTodoDay(dateKey: string, day: TodoDay): void {
  const all = loadTodoMap();
  all[dateKey] = normalizeTodoDay(day);
  save(KEYS.todos, all);
}
