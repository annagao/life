import { useCallback, useEffect, useState } from "react";
import type { TodoDay, TodoItem } from "../types";
import * as store from "../storage";
import { zh } from "../i18n/zh";
import { todayISO } from "../utils";

function newId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function TodoSection() {
  const [dateKey, setDateKey] = useState(todayISO);
  const [state, setState] = useState<TodoDay>(() => store.getTodoDay(todayISO()));
  const [draft, setDraft] = useState("");

  useEffect(() => {
    const id = window.setInterval(() => {
      const d = todayISO();
      setDateKey((prev) => (d !== prev ? d : prev));
    }, 20_000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    setState(store.getTodoDay(dateKey));
  }, [dateKey]);

  const sync = useCallback((updater: (prev: TodoDay) => TodoDay) => {
    setState((prev) => {
      const next = updater(prev);
      store.setTodoDay(todayISO(), next);
      return next;
    });
  }, []);

  const onDailyGoal = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value.slice(0, 500);
      sync((s) => ({ ...s, dailyGoal: v }));
    },
    [sync],
  );

  const addItem = useCallback(
    (text: string) => {
      const t = text.trim();
      if (!t) return;
      sync((s) => ({
        ...s,
        items: [...s.items, { id: newId(), text: t.slice(0, 400), done: false }],
      }));
    },
    [sync],
  );

  const toggle = useCallback(
    (id: string) => {
      sync((s) => ({
        ...s,
        items: s.items.map((it: TodoItem) => (it.id === id ? { ...it, done: !it.done } : it)),
      }));
    },
    [sync],
  );

  const remove = useCallback(
    (id: string) => {
      sync((s) => ({ ...s, items: s.items.filter((it) => it.id !== id) }));
    },
    [sync],
  );

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addItem(draft);
    setDraft("");
  };

  return (
    <div className="todo-page">
      <section className="card todo-page__card" aria-labelledby="todo-heading">
        <div className="todo-page__head">
          <h2 id="todo-heading" className="todo-page__title">
            {zh.todoTitle}
          </h2>
          <p className="todo-page__date">{zh.todoDateLabel(dateKey)}</p>
        </div>

        <label htmlFor="todo-daily-goal" className="todo-label">
          {zh.todoDailyGoal}
        </label>
        <input
          id="todo-daily-goal"
          type="text"
          className="todo-input-goal"
          placeholder={zh.todoDailyGoalPlaceholder}
          value={state.dailyGoal}
          onChange={onDailyGoal}
          maxLength={500}
          autoComplete="off"
        />

        <h3 className="todo-list-heading">{zh.todoListTitle}</h3>
        <form onSubmit={onSubmit} className="todo-add-form">
          <input
            type="text"
            className="todo-input-add"
            placeholder={zh.todoAddPlaceholder}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            maxLength={400}
            autoComplete="off"
            aria-label={zh.todoAddPlaceholder}
          />
          <button type="submit" className="btn btn-primary todo-add-btn">
            {zh.todoAdd}
          </button>
        </form>

        {state.items.length === 0 ? (
          <p className="todo-empty">{zh.todoEmpty}</p>
        ) : (
          <ul className="todo-list">
            {state.items.map((it) => (
              <li key={it.id} className={`todo-item ${it.done ? "todo-item--done" : ""}`}>
                <label className="todo-row">
                  <input
                    type="checkbox"
                    className="todo-check"
                    checked={it.done}
                    onChange={() => toggle(it.id)}
                  />
                  <span className="todo-text">{it.text}</span>
                </label>
                <button type="button" className="todo-remove" onClick={() => remove(it.id)}>
                  {zh.todoRemove}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
