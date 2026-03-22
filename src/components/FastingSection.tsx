import { useEffect, useMemo, useState } from "react";
import type { FastingSession } from "../types";
import { formatFastingInstantInZone } from "../fastingTime";
import { formatDuration } from "../utils";
import { zh } from "../i18n/zh";
import { FastingDayClock } from "./FastingDayClock";

type Props = {
  sessions: FastingSession[];
  onUpdateSessions: (s: FastingSession[]) => void;
};

function newId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function FastingSection({ sessions, onUpdateSessions }: Props) {
  const [now, setNow] = useState(() => new Date());

  const active = useMemo(
    () => sessions.find((s) => s.endedAt === null) ?? null,
    [sessions],
  );

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const activeElapsed = active
    ? Date.now() - new Date(active.startedAt).getTime()
    : 0;

  const completed = useMemo(
    () =>
      sessions
        .filter((s) => s.endedAt !== null)
        .sort((a, b) => new Date(b.endedAt!).getTime() - new Date(a.endedAt!).getTime()),
    [sessions],
  );

  const startFast = () => {
    if (active) return;
    onUpdateSessions([...sessions, { id: newId(), startedAt: new Date().toISOString(), endedAt: null }]);
  };

  const endFast = () => {
    if (!active) return;
    const end = new Date().toISOString();
    onUpdateSessions(
      sessions.map((s) => (s.id === active.id ? { ...s, endedAt: end } : s)),
    );
  };

  return (
    <section className="card fasting-page" aria-labelledby="fast-heading">
      <h2 id="fast-heading" className="card-title">
        {zh.fasting}
      </h2>
      <p className="muted fasting-page__intro">{zh.fastingIntro}</p>

      <div className="fasting-visual">
        <FastingDayClock sessions={sessions} now={now} />
      </div>

      {active ? (
        <div className="fasting-timer-block">
          <div className="fast-timer" aria-live="polite">
            {formatDuration(activeElapsed)}
          </div>
          <p className="muted" style={{ textAlign: "center", marginTop: "0.35rem", marginBottom: 0 }}>
            {zh.startedAt(formatFastingInstantInZone(active.startedAt))}
          </p>
        </div>
      ) : null}

      <div className="fasting-actions">
        {active ? (
          <button type="button" className="btn btn-primary btn-block" onClick={endFast}>
            {zh.endFast}
          </button>
        ) : (
          <button type="button" className="btn btn-primary btn-block" onClick={startFast}>
            {zh.startFast}
          </button>
        )}
      </div>

      <h3 className="section-subtitle fasting-page__history-title">{zh.recentFasts}</h3>
      {completed.length === 0 ? (
        <p className="empty-hint">{zh.noCompletedFasts}</p>
      ) : (
        <ul className="entry-list">
          {completed.slice(0, 12).map((s) => {
            const start = new Date(s.startedAt).getTime();
            const end = new Date(s.endedAt!).getTime();
            const dur = end - start;
            return (
              <li key={s.id}>
                <span>
                  <strong>{formatDuration(dur)}</strong>
                  <span className="muted" style={{ marginLeft: "0.5rem" }}>
                    {new Date(s.startedAt).toLocaleDateString("zh-CN", {
                      month: "numeric",
                      day: "numeric",
                    })}
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
