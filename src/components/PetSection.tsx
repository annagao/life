import { useCallback, useEffect, useMemo, useState } from "react";
import type { PetState } from "../types";
import * as store from "../storage";
import { zh } from "../i18n/zh";
import { CuteBingoDog } from "./CuteBingoDog";

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

/** 地板上最多显示几坨 */
const MAX_POOP_VISUAL = 5;

/** 遛狗冷却（与真实遛狗节奏接近） */
const WALK_COOLDOWN_MS = 2.5 * 60 * 60 * 1000;

export function PetSection() {
  const [pet, setPet] = useState<PetState>(() => store.getPet());
  const [toast, setToast] = useState<string | null>(null);
  const [dogFlash, setDogFlash] = useState<"none" | "happy" | "sip" | "nom" | "walk" | "brush">("none");
  const [dogMove, setDogMove] = useState<null | "food" | "water">(null);
  const [petScene, setPetScene] = useState<"room" | "outside">("room");

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2400);
  }, []);

  const persist = useCallback((next: PetState) => {
    store.setPet(next);
    setPet(next);
  }, []);

  const flashDog = useCallback((kind: "happy" | "sip" | "nom" | "walk" | "brush") => {
    setDogFlash(kind);
    const ms = kind === "nom" ? 1000 : kind === "brush" ? 900 : 700;
    window.setTimeout(() => setDogFlash("none"), ms);
  }, []);

  const feed = useCallback(() => {
    setDogMove("food");
    window.setTimeout(() => setDogMove(null), 1100);
    const n: PetState = {
      ...pet,
      fullness: clamp(pet.fullness + 18, 0, 100),
      litterMess: clamp(pet.litterMess + 10, 0, 100),
      mood: clamp(pet.mood + 4, 0, 100),
    };
    persist(n);
    flashDog("nom");
    showToast(zh.petMsgFeed);
  }, [pet, persist, showToast, flashDog]);

  const giveWater = useCallback(() => {
    setDogMove("water");
    window.setTimeout(() => setDogMove(null), 1100);
    const n = { ...pet, hydration: clamp(pet.hydration + 24, 0, 100), mood: clamp(pet.mood + 2, 0, 100) };
    persist(n);
    flashDog("sip");
    showToast(zh.petMsgWater);
  }, [pet, persist, showToast, flashDog]);

  const brushTeeth = useCallback(() => {
    const n = { ...pet, mood: clamp(pet.mood + 5, 0, 100) };
    persist(n);
    flashDog("brush");
    showToast(zh.petMsgBrush);
  }, [pet, persist, showToast, flashDog]);

  const giveTreat = useCallback(() => {
    const n = {
      ...pet,
      mood: clamp(pet.mood + 14, 0, 100),
      fullness: clamp(pet.fullness + 8, 0, 100),
      litterMess: clamp(pet.litterMess + 6, 0, 100),
    };
    persist(n);
    flashDog("happy");
    showToast(zh.petMsgTreat);
  }, [pet, persist, showToast, flashDog]);

  const walk = useCallback(() => {
    const last = pet.lastWalkAt ? new Date(pet.lastWalkAt).getTime() : 0;
    const elapsed = Date.now() - last;
    if (last > 0 && elapsed < WALK_COOLDOWN_MS) {
      const mins = Math.max(1, Math.ceil((WALK_COOLDOWN_MS - elapsed) / 60_000));
      showToast(zh.petMsgWalkCooldown(mins));
      return;
    }
    let skillXp = pet.skillXp + 12;
    let skillLevel = pet.skillLevel;
    let msg: string = zh.petMsgWalk;
    if (skillLevel < 5) {
      while (skillXp >= 100 && skillLevel < 5) {
        skillXp -= 100;
        skillLevel += 1;
        msg = zh.petMsgLevelUp(skillLevel);
      }
    } else {
      skillXp = Math.min(99, skillXp);
    }
    const n: PetState = {
      ...pet,
      mood: clamp(pet.mood + 18, 0, 100),
      fullness: clamp(pet.fullness - 10, 0, 100),
      hydration: clamp(pet.hydration - 12, 0, 100),
      litterMess: clamp(pet.litterMess + 3, 0, 100),
      skillXp,
      skillLevel,
      lastWalkAt: new Date().toISOString(),
    };
    persist(n);
    flashDog("walk");
    showToast(msg);
    setPetScene("outside");
  }, [pet, persist, showToast, flashDog]);

  const goHomeFromWalk = useCallback(() => {
    setPetScene("room");
  }, []);

  const train = useCallback(() => {
    let skillXp = pet.skillXp + 16;
    let skillLevel = pet.skillLevel;
    let msg: string = zh.petMsgTrain;
    if (skillLevel < 5) {
      while (skillXp >= 100 && skillLevel < 5) {
        skillXp -= 100;
        skillLevel += 1;
        msg = zh.petMsgLevelUp(skillLevel);
      }
    } else {
      skillXp = Math.min(99, skillXp);
    }
    const n: PetState = {
      ...pet,
      skillXp,
      skillLevel,
      mood: clamp(pet.mood + 6, 0, 100),
      fullness: clamp(pet.fullness - 5, 0, 100),
    };
    persist(n);
    flashDog("happy");
    showToast(msg);
  }, [pet, persist, showToast, flashDog]);

  const scoopAll = useCallback(() => {
    const n = { ...pet, litterMess: 0, mood: clamp(pet.mood + 10, 0, 100) };
    persist(n);
    showToast(zh.petMsgScoop);
  }, [pet, persist, showToast]);

  const scoopOne = useCallback(() => {
    if (pet.litterMess <= 0) return;
    const next = Math.max(0, pet.litterMess - 22);
    const n = { ...pet, litterMess: next, mood: clamp(pet.mood + 3, 0, 100) };
    persist(n);
    showToast(zh.petClickPoop);
  }, [pet, persist, showToast]);

  const petTheDog = useCallback(() => {
    const n = { ...pet, mood: clamp(pet.mood + 5, 0, 100) };
    persist(n);
    flashDog("happy");
    showToast(zh.petClickPet);
  }, [pet, persist, showToast, flashDog]);

  const onDogName = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const dogName = e.target.value.slice(0, 12).trim() || zh.petDefaultDogName;
      persist({ ...pet, dogName });
    },
    [pet, persist],
  );

  const poopCount = useMemo(
    () => Math.min(MAX_POOP_VISUAL, Math.ceil(pet.litterMess / 18)),
    [pet.litterMess],
  );

  /**
   * 地毯约在底部 8%～50%；饭盆约 6%/94% bottom14%，狗在中央，玩具/零食约 10%/90% bottom38%，遛/刷约 5%/3% bottom52%。
   * 便便只放在左右两侧列，避开中央与食盆区；多坨时上下错开避免互叠。
   */
  const poopSlots = useMemo(
    () =>
      [
        { left: "26%", bottom: "16%" },
        { left: "74%", bottom: "16%" },
        { left: "24%", bottom: "22%" },
        { left: "76%", bottom: "22%" },
        { left: "28%", bottom: "30%" },
      ].slice(0, poopCount),
    [poopCount],
  );

  /** 偶尔自己拉一点（模拟感）：堆积偏高时不再自动加 */
  useEffect(() => {
    const id = window.setInterval(() => {
      setPet((p) => {
        if (p.fullness < 35 || p.litterMess > 75) return p;
        if (Math.random() > 0.35) return p;
        const n = { ...p, litterMess: clamp(p.litterMess + 6, 0, 100) };
        store.setPet(n);
        return n;
      });
    }, 28_000);
    return () => window.clearInterval(id);
  }, []);

  const moodLine = useMemo(() => {
    if (pet.mood >= 75) return zh.petMoodHigh;
    if (pet.mood >= 45) return zh.petMoodMid;
    return zh.petMoodLow;
  }, [pet.mood]);

  return (
    <div className="pet-page">
      <section className="card pet-room-card" aria-labelledby="pet-room-heading">
        <h2 id="pet-room-heading" className="sr-only">
          {zh.petHeroTitle}
        </h2>
        <p className="muted pet-room-tagline">
          {petScene === "outside" ? zh.petOutsideHint : zh.petRoomHint}
        </p>

        {petScene === "room" ? (
          <div className="pet-room" role="application" aria-label={zh.petRoomAria}>
            <div className="pet-room__wall" aria-hidden />
            <div className="pet-room__baseboard" aria-hidden />
            <div className="pet-room__window" aria-hidden>
              <span className="pet-room__window-glass" />
              <span className="pet-room__window-sill" />
              <span className="pet-room__window-plant" />
            </div>
            <div className="pet-room__picture" aria-hidden />
            <div className="pet-room__floor" />
            <div className="pet-room__rug" aria-hidden />

            <button
              type="button"
              className="pet-room__bowl pet-room__bowl--food"
              onClick={feed}
              title={zh.petClickFeed}
            >
              <span className="pet-room__bowl-inner" aria-hidden />
              <span className="pet-room__bowl-label">{zh.petActionFeed}</span>
            </button>
            <button
              type="button"
              className="pet-room__bowl pet-room__bowl--water"
              onClick={giveWater}
              title={zh.petClickWater}
            >
              <span className="pet-room__bowl-inner pet-room__bowl-inner--water" aria-hidden />
              <span className="pet-room__bowl-label">{zh.petActionWater}</span>
            </button>

            <button type="button" className="pet-room__toy" onClick={train} title={zh.petClickTrain}>
              <span aria-hidden>🎾</span>
            </button>
            <button type="button" className="pet-room__bone" onClick={giveTreat} title={zh.petClickTreat}>
              <span aria-hidden>🦴</span>
            </button>
            <button type="button" className="pet-room__walk" onClick={walk} title={zh.petClickWalk}>
              <span aria-hidden>🦮</span>
            </button>
            <button type="button" className="pet-room__brush" onClick={brushTeeth} title={zh.petClickBrush}>
              <span aria-hidden>🪥</span>
            </button>

            {poopSlots.map((pos, i) => (
              <button
                key={i}
                type="button"
                className="pet-room__poop"
                style={{ left: pos.left, bottom: pos.bottom }}
                onClick={scoopOne}
                aria-label={zh.petClickPoop}
              >
                <span aria-hidden>💩</span>
              </button>
            ))}

            <button
              type="button"
              className={[
                "pet-dog-hit",
                dogFlash !== "none" ? `pet-dog-hit--${dogFlash}` : "",
                dogMove === "food" ? "pet-dog-hit--at-food" : "",
                dogMove === "water" ? "pet-dog-hit--at-water" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={petTheDog}
              title={zh.petClickPet}
            >
              <div className="pet-room__dog" aria-hidden>
                <div className="pet-room__dog-shadow" />
                <CuteBingoDog expression={dogFlash === "none" ? "none" : dogFlash} />
              </div>
            </button>

            <div className="pet-room__hud" aria-hidden>
              <span>❤️ {Math.round(pet.mood)}</span>
              <span>🍖 {Math.round(pet.fullness)}</span>
              <span>💧 {Math.round(pet.hydration)}</span>
            </div>
          </div>
        ) : (
          <div className="pet-outside" role="application" aria-label={zh.petOutsideAria}>
            <button type="button" className="pet-outside__home" onClick={goHomeFromWalk}>
              {zh.petBackToRoom}
            </button>
            <div className="pet-outside__sky" aria-hidden />
            <div className="pet-outside__cloud pet-outside__cloud--a" aria-hidden />
            <div className="pet-outside__cloud pet-outside__cloud--b" aria-hidden />
            <div className="pet-outside__sun" aria-hidden />
            <div className="pet-outside__hill pet-outside__hill--far" aria-hidden />
            <div className="pet-outside__hill pet-outside__hill--near" aria-hidden />
            <div className="pet-outside__grass" aria-hidden />
            <div className="pet-outside__path" aria-hidden />
            <div className="pet-outside__tree pet-outside__tree--l" aria-hidden />
            <div className="pet-outside__tree pet-outside__tree--r" aria-hidden />

            <button
              type="button"
              className={[
                "pet-dog-hit",
                dogFlash !== "none" ? `pet-dog-hit--${dogFlash}` : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={petTheDog}
              title={zh.petClickPet}
            >
              <div className="pet-room__dog" aria-hidden>
                <div className="pet-outside__dog-shadow" />
                <CuteBingoDog expression={dogFlash === "none" ? "none" : dogFlash} />
              </div>
            </button>

            <div className="pet-outside__hud" aria-hidden>
              <span>❤️ {Math.round(pet.mood)}</span>
              <span>🍖 {Math.round(pet.fullness)}</span>
              <span>💧 {Math.round(pet.hydration)}</span>
            </div>
          </div>
        )}

        <div className="pet-room__name-row">
          <label htmlFor="dog-name" className="sr-only">
            {zh.petDogNameLabel}
          </label>
          <span className="pet-name-prefix">{zh.petNamePrefix}</span>
          <input
            id="dog-name"
            className="pet-dog-name-input"
            value={pet.dogName}
            onChange={onDogName}
            maxLength={12}
          />
        </div>
        <p className="pet-bubble pet-room__bubble">{moodLine}</p>
        {toast && (
          <div className="pet-toast" role="status">
            {toast}
          </div>
        )}
      </section>

      <section className="card pet-compact-stats" aria-labelledby="pet-stats-title">
        <h2 id="pet-stats-title" className="card-title">
          {zh.petStatsTitle}
        </h2>
        <div className="pet-stat-list">
          <PetBar label={zh.petStatFull} value={pet.fullness} tone="amber" />
          <PetBar label={zh.petStatWater} value={pet.hydration} tone="blue" />
          <PetBar label={zh.petStatMood} value={pet.mood} tone="pink" />
          <div className="pet-skill-row">
            <span className="pet-skill-label">{zh.petStatSkill(pet.skillLevel)}</span>
            <div className="pet-stat-bar pet-stat-bar--skill">
              <div className="pet-stat-bar__fill pet-stat-bar__fill--skill" style={{ width: `${pet.skillXp}%` }} />
            </div>
            <span className="pet-skill-xp">{pet.skillXp}/100 XP</span>
          </div>
          <PetBar label={zh.petStatLitter} value={pet.litterMess} tone="brown" />
        </div>
      </section>

      <section className="card" aria-labelledby="pet-actions-title">
        <h2 id="pet-actions-title" className="card-title">
          {zh.petActionsTitle}
        </h2>
        <p className="muted pet-actions-hint">{zh.petActionsHint}</p>
        <div className="pet-actions-grid">
          <button type="button" className="pet-action pet-action--feed" onClick={feed}>
            <span className="pet-action__icon" aria-hidden>
              🍖
            </span>
            {zh.petActionFeed}
          </button>
          <button type="button" className="pet-action pet-action--water" onClick={giveWater}>
            <span className="pet-action__icon" aria-hidden>
              💧
            </span>
            {zh.petActionWater}
          </button>
          <button type="button" className="pet-action pet-action--treat" onClick={giveTreat}>
            <span className="pet-action__icon" aria-hidden>
              🦴
            </span>
            {zh.petActionTreat}
          </button>
          <button type="button" className="pet-action pet-action--train" onClick={train}>
            <span className="pet-action__icon" aria-hidden>
              🎾
            </span>
            {zh.petActionTrain}
          </button>
          <button type="button" className="pet-action pet-action--walk" onClick={walk}>
            <span className="pet-action__icon" aria-hidden>
              🦮
            </span>
            {zh.petActionWalk}
          </button>
          <button type="button" className="pet-action pet-action--brush" onClick={brushTeeth}>
            <span className="pet-action__icon" aria-hidden>
              🪥
            </span>
            {zh.petActionBrush}
          </button>
          <button type="button" className="pet-action pet-action--scoop" onClick={scoopAll}>
            <span className="pet-action__icon" aria-hidden>
              🧹
            </span>
            {zh.petActionScoop}
          </button>
        </div>
      </section>
    </div>
  );
}

function PetBar({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "amber" | "blue" | "pink" | "brown";
}) {
  return (
    <div className="pet-stat-row">
      <span className="pet-stat-label">{label}</span>
      <div className={`pet-stat-bar pet-stat-bar--${tone}`}>
        <div className="pet-stat-bar__fill" style={{ width: `${value}%` }} />
      </div>
      <span className="pet-stat-num">{Math.round(value)}</span>
    </div>
  );
}
