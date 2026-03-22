export interface WeightEntry {
  /** YYYY-MM-DD */
  date: string;
  weightKg: number;
}

export interface Goal {
  targetWeightKg: number;
  /** YYYY-MM-DD */
  targetDate: string;
  /** Optional baseline when goal was set */
  startWeightKg: number | null;
  /** YYYY-MM-DD */
  startDate: string;
}

export interface FastingSession {
  id: string;
  /** ISO datetime */
  startedAt: string;
  /** ISO datetime, null while fasting */
  endedAt: string | null;
}

/** 单日待办 */
export interface TodoItem {
  id: string;
  text: string;
  done: boolean;
}

/** 某日待办与小目标 */
export interface TodoDay {
  /** 今日一句小目标（可空） */
  dailyGoal: string;
  items: TodoItem[];
}

/** 虚拟金毛状态，用于宠物页 */
export interface PetState {
  /** 小狗名字 */
  dogName: string;
  /** 饱食 0–100 */
  fullness: number;
  /** 水分 0–100 */
  hydration: number;
  /** 心情 0–100 */
  mood: number;
  /** 技能等级 1–5 */
  skillLevel: number;
  /** 当前等级内经验 0–99 */
  skillXp: number;
  /** 便便堆积 0–100，需铲屎 */
  litterMess: number;
  /** 上次遛狗时间（ISO），用于冷却 */
  lastWalkAt: string | null;
  /** 上次结算随时间衰减的时间戳 */
  lastDecayAt: string;
}
