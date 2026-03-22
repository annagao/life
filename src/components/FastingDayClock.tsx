import { useMemo } from "react";
import type { FastingSession } from "../types";
import { zh } from "../i18n/zh";
import {
  endOfFastingDay,
  formatFastingClockNowLine,
  minutesIntoFastingZoneDay,
  startOfFastingDay,
} from "../fastingTime";

type Props = {
  sessions: FastingSession[];
  now: Date;
};

const MIN_DAY = 24 * 60;
/** 一圈 = 12 小时（与常见指针式钟表一致，一天转两圈） */
const MIN_PER_ROTATION = 12 * 60;

/** 内层绘图逻辑尺寸（中心 140,140）；viewBox 再外扩，避免数字被裁切 */
const INNER = 280;
const VIEW_PAD = 44;

function mergeDayIntervals(
  intervals: { start: Date; end: Date }[],
): { start: Date; end: Date }[] {
  if (intervals.length === 0) return [];
  const sorted = [...intervals].sort((a, b) => a.start.getTime() - b.start.getTime());
  const out: { start: Date; end: Date }[] = [];
  let cur = { ...sorted[0]! };
  for (let i = 1; i < sorted.length; i++) {
    const n = sorted[i]!;
    if (n.start.getTime() <= cur.end.getTime()) {
      cur.end = new Date(Math.max(cur.end.getTime(), n.end.getTime()));
    } else {
      out.push(cur);
      cur = { ...n };
    }
  }
  out.push(cur);
  return out;
}

function fastingIntervalsForDay(sessions: FastingSession[], day: Date, now: Date): { startMin: number; endMin: number }[] {
  const dayStart = startOfFastingDay(day);
  const dayEnd = endOfFastingDay(day);
  const raw: { start: Date; end: Date }[] = [];

  for (const s of sessions) {
    const fs = new Date(s.startedAt);
    const fe = s.endedAt ? new Date(s.endedAt) : now;
    if (fe.getTime() <= dayStart.getTime() || fs.getTime() >= dayEnd.getTime()) continue;
    const a = Math.max(fs.getTime(), dayStart.getTime());
    const b = Math.min(fe.getTime(), dayEnd.getTime());
    if (a < b) raw.push({ start: new Date(a), end: new Date(b) });
  }

  const merged = mergeDayIntervals(raw);
  const dayEndMs = dayEnd.getTime();
  return merged.map(({ start, end }) => {
    const endMin =
      end.getTime() >= dayEndMs ? MIN_DAY : Math.min(MIN_DAY, minutesIntoFastingZoneDay(end));
    return {
      startMin: minutesIntoFastingZoneDay(start),
      endMin,
    };
  });
}

/** 从 0 点起算的分钟 → 角度：12 在正上方，一圈 12 小时，一天可超过 2π */
function angleForClock12h(minutesFromMidnight: number): number {
  return (minutesFromMidnight / MIN_PER_ROTATION) * 2 * Math.PI - Math.PI / 2;
}

function polar(cx: number, cy: number, r: number, angleRad: number): { x: number; y: number } {
  return { x: cx + r * Math.cos(angleRad), y: cy + r * Math.sin(angleRad) };
}

/** 沿圆环绘制禁食弧；跨度超过 12h 时拆成多段，避免 SVG 单段弧超过 360° */
function arcPath12h(cx: number, cy: number, r: number, startMin: number, endMin: number): string {
  if (endMin <= startMin + 0.02) return "";
  const chunks: string[] = [];
  let s = startMin;
  const pStart = polar(cx, cy, r, angleForClock12h(s));
  chunks.push(`M ${pStart.x} ${pStart.y}`);
  while (s < endMin - 0.02) {
    /** 单段弧不超过约 6 小时，避免 SVG 接近整圈时绘制异常 */
    const e = Math.min(s + Math.min(358, endMin - s), endMin);
    const p1 = polar(cx, cy, r, angleForClock12h(e));
    const sweepMin = e - s;
    const largeArc = sweepMin > 360 ? 1 : 0;
    chunks.push(`A ${r} ${r} 0 ${largeArc} 1 ${p1.x} ${p1.y}`);
    s = e;
  }
  return chunks.join(" ");
}

export function FastingDayClock({ sessions, now }: Props) {
  const { fastingArcs, hasFastingToday, nowMin } = useMemo(() => {
    const fasting = fastingIntervalsForDay(sessions, now, now);
    return {
      fastingArcs: fasting.filter((a) => a.endMin - a.startMin > 0.05),
      hasFastingToday: fasting.length > 0,
      nowMin: minutesIntoFastingZoneDay(now),
    };
  }, [sessions, now]);

  const cx = INNER / 2;
  const cy = INNER / 2;
  const rTrack = 112;
  const rArc = 102;
  const rTicks = 118;
  const rLabels = rTicks + 22;
  const handLen = 94;

  const vbW = INNER + 2 * VIEW_PAD;
  const viewBox = `${-VIEW_PAD} ${-VIEW_PAD} ${vbW} ${vbW}`;

  /** 传统钟面 12、3、6、9（对应 12 点、3 点、6 点、9 点位置） */
  const clockFaceMarks: { label: string; minute: number }[] = [
    { label: "12", minute: 0 },
    { label: "3", minute: 3 * 60 },
    { label: "6", minute: 6 * 60 },
    { label: "9", minute: 9 * 60 },
  ];

  const hourLabels = clockFaceMarks.map(({ label, minute }) => ({
    label,
    ...polar(cx, cy, rLabels, angleForClock12h(minute)),
  }));

  /** 每小时小刻度（0–23 点），两圈共 24 道，细线 */
  const hourTickMinutes = Array.from({ length: 24 }, (_, h) => h * 60);

  return (
    <div className="fasting-clock-wrap">
      <svg
        className="fasting-clock"
        width="100%"
        height="100%"
        viewBox={viewBox}
        preserveAspectRatio="xMidYMid meet"
        style={{ overflow: "visible" }}
        role="img"
        aria-label={zh.clockAria}
      >
        <defs>
          <filter id="clockFaceShadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="4" stdDeviation="8" floodOpacity="0.08" />
          </filter>
          <filter id="clockLabelShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="1" stdDeviation="1.2" floodOpacity="0.15" />
          </filter>
        </defs>

        <circle
          cx={cx}
          cy={cy}
          r={rTrack}
          fill="var(--clock-face)"
          stroke="var(--clock-border)"
          strokeWidth="1.5"
          filter="url(#clockFaceShadow)"
        />

        <circle
          cx={cx}
          cy={cy}
          r={rArc}
          fill="none"
          stroke="var(--clock-eating)"
          strokeWidth="20"
        />

        {fastingArcs.map((seg, i) => (
          <path
            key={`fast-${i}`}
            d={arcPath12h(cx, cy, rArc, seg.startMin, seg.endMin)}
            fill="none"
            stroke="var(--clock-fasting)"
            strokeWidth="20"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}

        {hourTickMinutes.map((minute) => {
          const major = minute % 180 === 0;
          const outer = polar(cx, cy, rTrack - (major ? 2 : 4), angleForClock12h(minute));
          const inner = polar(cx, cy, rTrack - (major ? 12 : 9), angleForClock12h(minute));
          return (
            <line
              key={minute}
              x1={inner.x}
              y1={inner.y}
              x2={outer.x}
              y2={outer.y}
              stroke="var(--clock-tick)"
              strokeWidth={major ? 2.5 : 1}
              strokeOpacity={major ? 1 : 0.42}
              strokeLinecap="round"
            />
          );
        })}

        {(() => {
          const th = angleForClock12h(nowMin);
          const tip = polar(cx, cy, handLen, th);
          const tail = polar(cx, cy, 10, th + Math.PI);
          return (
            <g filter="url(#clockLabelShadow)">
              <line
                x1={tail.x}
                y1={tail.y}
                x2={tip.x}
                y2={tip.y}
                stroke="var(--clock-hand)"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              <circle cx={cx} cy={cy} r="7" fill="var(--clock-hand)" stroke="var(--clock-face)" strokeWidth="2" />
            </g>
          );
        })()}

        {hourLabels.map(({ label, x, y }) => (
          <text
            key={label}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fasting-clock__num"
            fill="var(--clock-num)"
            stroke="var(--clock-num-stroke)"
            strokeWidth="3"
            paintOrder="stroke fill"
            fontSize="15"
            fontWeight="700"
            fontFamily="inherit"
          >
            {label}
          </text>
        ))}
      </svg>

      <p className="fasting-clock-digital" aria-live="polite">
        {formatFastingClockNowLine(now)}
      </p>

      <div className="fasting-clock-legend">
        <span className="fasting-clock-legend__item">
          <span className="dot eating" /> {zh.legendEating}
        </span>
        <span className="fasting-clock-legend__item">
          <span className="dot fasting" /> {zh.legendFasting}
        </span>
      </div>
      <p className="muted fasting-clock-zone">{zh.clockZoneNote}</p>
      {!hasFastingToday && <p className="muted fasting-clock-hint">{zh.clockIdleHint}</p>}
    </div>
  );
}
