import { useEffect, useState } from "react";
import { zh } from "../i18n/zh";
import type { Goal, WeightEntry } from "../types";
import { formatShortDate, normalizeKgInputDisplay, todayISO } from "../utils";

type GoalProgress = { pct: number; direction: "lose" | "gain" | "maintain" } | null;

type Props = {
  goal: Goal | null;
  onSaveGoal: (g: Goal) => void;
  latestWeight: WeightEntry | null;
  entries: WeightEntry[];
  onLogWeight: (date: string, weightKg: number) => void;
  onDeleteEntry: (date: string) => void;
  goalProgress: GoalProgress;
  daysToTarget: number | null;
};

export function GoalHome({
  goal,
  onSaveGoal,
  latestWeight,
  entries,
  onLogWeight,
  onDeleteEntry,
  goalProgress,
  daysToTarget,
}: Props) {
  const [editing, setEditing] = useState(!goal);
  const [targetWeightInput, setTargetWeightInput] = useState(() =>
    goal?.targetWeightKg != null ? normalizeKgInputDisplay(goal.targetWeightKg) : "72",
  );
  const [targetDate, setTargetDate] = useState(goal?.targetDate ?? todayISO());
  const [startWeightStr, setStartWeightStr] = useState(() =>
    goal?.startWeightKg != null ? normalizeKgInputDisplay(goal.startWeightKg) : "",
  );
  const [logDate, setLogDate] = useState(() => todayISO());
  const [logWeightInput, setLogWeightInput] = useState("");

  useEffect(() => {
    const e = entries.find((x) => x.date === logDate);
    setLogWeightInput(e ? normalizeKgInputDisplay(e.weightKg) : "");
  }, [logDate, entries]);

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const tw = Number(String(targetWeightInput).trim());
    const swParsed = startWeightStr.trim() === "" ? NaN : Number(startWeightStr);
    const startWeightKg = Number.isFinite(swParsed)
      ? swParsed
      : latestWeight?.weightKg ?? null;
    onSaveGoal({
      targetWeightKg: Number.isFinite(tw) ? tw : 72,
      targetDate,
      startWeightKg,
      startDate: goal?.startDate ?? todayISO(),
    });
    setEditing(false);
  };

  const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <>
      <section className="card" aria-labelledby="goal-heading">
        <h2 id="goal-heading" className="card-title">
          {zh.goal}
        </h2>
        {editing ? (
          <form onSubmit={handleSaveGoal}>
            <div className="row goal-form-row" style={{ marginBottom: "0.75rem" }}>
              <div>
                <label htmlFor="target-w">{zh.targetWeightKg}</label>
                <input
                  id="target-w"
                  type="number"
                  step="0.1"
                  min="1"
                  inputMode="decimal"
                  required
                  value={targetWeightInput}
                  onChange={(e) => setTargetWeightInput(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="target-d">{zh.targetDate}</label>
                <input
                  id="target-d"
                  type="date"
                  required
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                />
              </div>
            </div>
            <div style={{ marginBottom: "0.75rem" }}>
              <label htmlFor="start-w">{zh.startWeightOptional}</label>
              <input
                id="start-w"
                type="number"
                step="0.1"
                min="1"
                inputMode="decimal"
                placeholder={
                  latestWeight ? normalizeKgInputDisplay(latestWeight.weightKg) : zh.placeholderCurrentWeight
                }
                value={startWeightStr}
                onChange={(e) => setStartWeightStr(e.target.value)}
              />
            </div>
            <div className="row">
              <button type="submit" className="btn btn-primary btn-block">
                {zh.saveGoal}
              </button>
              {goal && (
                <button
                  type="button"
                  className="btn btn-secondary btn-block"
                  onClick={() => setEditing(false)}
                >
                  {zh.cancel}
                </button>
              )}
            </div>
          </form>
        ) : goal ? (
          <>
            <div className="stat-grid">
              <div className="stat">
                <div className="stat-value">{goal.targetWeightKg} 公斤</div>
                <div className="stat-label">{zh.target}</div>
              </div>
              <div className="stat">
                <div className="stat-value">{formatShortDate(goal.targetDate)}</div>
                <div className="stat-label">{zh.by}</div>
              </div>
            </div>
            {daysToTarget !== null && (
              <p className="muted" style={{ marginTop: "0.75rem", marginBottom: 0 }}>
                {daysToTarget >= 0
                  ? zh.daysUntilTarget(daysToTarget)
                  : zh.daysPastTarget(Math.abs(daysToTarget))}
              </p>
            )}
            {goalProgress && goalProgress.direction !== "maintain" && (
              <>
                <div
                  className="progress-track"
                  role="progressbar"
                  aria-valuenow={Math.round(goalProgress.pct)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div className="progress-fill" style={{ width: `${goalProgress.pct}%` }} />
                </div>
                <p className="muted" style={{ marginTop: "0.5rem", marginBottom: 0 }}>
                  {zh.progressToTarget(Math.round(goalProgress.pct))}
                </p>
              </>
            )}
            <button
              type="button"
              className="btn btn-secondary btn-block"
              style={{ marginTop: "1rem" }}
              onClick={() => {
                if (goal) {
                  setTargetWeightInput(
                    normalizeKgInputDisplay(goal.targetWeightKg) || "72",
                  );
                  setTargetDate(goal.targetDate);
                  setStartWeightStr(
                    goal.startWeightKg != null ? normalizeKgInputDisplay(goal.startWeightKg) : "",
                  );
                }
                setEditing(true);
              }}
            >
              {zh.editGoal}
            </button>
          </>
        ) : null}
      </section>

      <section className="card home-weight-card" aria-labelledby="today-weight-heading">
        <h2 id="today-weight-heading" className="card-title">
          {zh.logWeightSection}
        </h2>
        <p className="muted section-subtitle" style={{ marginTop: "-0.25rem", marginBottom: "0.65rem" }}>
          {zh.logWeightHint}
        </p>

        <div className="home-weight-today">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const w = Number(String(logWeightInput).trim());
              if (!Number.isFinite(w) || w <= 0) return;
              onLogWeight(logDate, w);
            }}
          >
            <div className="row goal-form-row home-weight-form-row" style={{ marginBottom: "0.65rem" }}>
              <div className="home-weight-date-field">
                <label htmlFor="log-d">{zh.date}</label>
                <input
                  id="log-d"
                  className="home-weight-date-input"
                  type="date"
                  required
                  max={todayISO()}
                  value={logDate}
                  onChange={(e) => setLogDate(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="log-w">{zh.weightKg}</label>
                <input
                  id="log-w"
                  type="number"
                  step="0.1"
                  min="1"
                  inputMode="decimal"
                  placeholder={zh.weightPlaceholder}
                  value={logWeightInput}
                  onChange={(e) => setLogWeightInput(e.target.value)}
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-block">
              {zh.save}
            </button>
          </form>
        </div>

        <h3 className="section-subtitle">{zh.history}</h3>
        {sorted.length === 0 ? (
          <p className="empty-hint">{zh.noEntries}</p>
        ) : (
          <ul className="entry-list">
            {sorted.map((e) => (
              <li key={e.date}>
                <span>
                  <strong>{e.weightKg} 公斤</strong>
                  <span className="muted" style={{ marginLeft: "0.5rem" }}>
                    {formatShortDate(e.date)}
                  </span>
                </span>
                <button
                  type="button"
                  className="btn btn-danger"
                  style={{ padding: "0.35rem 0.6rem", fontSize: "0.8rem" }}
                  onClick={() => onDeleteEntry(e.date)}
                >
                  {zh.remove}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
