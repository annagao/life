import { useCallback, useEffect, useMemo, useState } from "react";
import type { FastingSession, Goal, WeightEntry } from "./types";
import * as store from "./storage";
import { daysBetween, todayISO } from "./utils";
import { AppHeader } from "./components/AppHeader";
import { BottomNav } from "./components/BottomNav";
import { FastingSection } from "./components/FastingSection";
import { GoalHome } from "./components/GoalHome";
import { TrendChart } from "./components/TrendChart";
import { PetSection } from "./components/PetSection";
import { TodoSection } from "./components/TodoSection";
import type { AppTab } from "./components/AppHeader";

function upsertWeight(entries: WeightEntry[], date: string, weightKg: number): WeightEntry[] {
  const next = entries.filter((e) => e.date !== date);
  next.push({ date, weightKg });
  return next.sort((a, b) => a.date.localeCompare(b.date));
}

export default function App() {
  const [tab, setTab] = useState<AppTab>("home");
  const [displayName, setDisplayName] = useState(() => store.getProfile().displayName);
  const [weights, setWeights] = useState<WeightEntry[]>(() => store.getWeights());
  const [goal, setGoal] = useState<Goal | null>(() => store.getGoal());
  const [fasts, setFasts] = useState<FastingSession[]>(() => store.getFasts());

  useEffect(() => {
    store.setProfile({ displayName });
  }, [displayName]);

  useEffect(() => {
    store.setWeights(weights);
  }, [weights]);

  useEffect(() => {
    store.setGoal(goal);
  }, [goal]);

  useEffect(() => {
    store.setFasts(fasts);
  }, [fasts]);

  const onSaveGoal = useCallback((g: Goal) => {
    setGoal(g);
  }, []);

  const onLogWeight = useCallback((date: string, weightKg: number) => {
    setWeights((w) => upsertWeight(w, date, weightKg));
  }, []);

  const onDeleteEntry = useCallback((date: string) => {
    setWeights((w) => w.filter((e) => e.date !== date));
  }, []);

  const latestWeight = useMemo(() => {
    if (weights.length === 0) return null;
    return weights[weights.length - 1];
  }, [weights]);

  const goalProgress = useMemo(() => {
    if (!goal || !latestWeight) return null;
    const start =
      goal.startWeightKg ??
      weights[0]?.weightKg ??
      latestWeight.weightKg;
    const target = goal.targetWeightKg;
    const current = latestWeight.weightKg;
    const total = Math.abs(start - target);
    if (total < 1e-6) return { pct: 100, direction: "maintain" as const };
    const done = Math.abs(start - current);
    const raw = (done / total) * 100;
    const pct = Math.min(100, Math.max(0, raw));
    const direction =
      target < start ? ("lose" as const) : target > start ? ("gain" as const) : ("maintain" as const);
    return { pct, direction };
  }, [goal, latestWeight, weights]);

  const daysToTarget = goal ? daysBetween(todayISO(), goal.targetDate) : null;

  return (
    <div className="app-shell">
      <AppHeader tab={tab} displayName={displayName} onDisplayNameChange={setDisplayName} />

      {tab === "todo" && <TodoSection />}
      {tab === "home" && (
        <GoalHome
          goal={goal}
          onSaveGoal={onSaveGoal}
          latestWeight={latestWeight}
          entries={weights}
          onLogWeight={onLogWeight}
          onDeleteEntry={onDeleteEntry}
          goalProgress={goalProgress}
          daysToTarget={daysToTarget}
        />
      )}
      {tab === "trends" && <TrendChart entries={weights} goal={goal} />}
      {tab === "fast" && <FastingSection sessions={fasts} onUpdateSessions={setFasts} />}
      {tab === "pet" && <PetSection />}

      <BottomNav active={tab} onChange={setTab} />
    </div>
  );
}
