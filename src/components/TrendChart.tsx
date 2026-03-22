import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { zh } from "../i18n/zh";
import type { Goal, WeightEntry } from "../types";
import { formatShortDate } from "../utils";

type Props = {
  entries: WeightEntry[];
  goal: Goal | null;
};

type Row = { date: string; label: string; weightKg: number };

const AXIS = "rgba(90, 75, 110, 0.22)";
const TICK = "rgba(90, 75, 110, 0.55)";
const GRID = "rgba(90, 75, 110, 0.09)";

function formatKgTick(v: number): string {
  const r = Math.round(v * 10) / 10;
  return Number.isInteger(r) ? String(r) : r.toFixed(1);
}

export function TrendChart({ entries, goal }: Props) {
  const data: Row[] = entries
    .map((e) => ({
      date: e.date,
      label: formatShortDate(e.date),
      weightKg: e.weightKg,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  if (data.length === 0) {
    return (
      <section className="card" aria-labelledby="trends-heading">
        <h2 id="trends-heading" className="card-title">
          {zh.weightTrend}
        </h2>
        <p className="empty-hint">{zh.trendHint}</p>
      </section>
    );
  }

  const weights = data.map((d) => d.weightKg);
  const minW = Math.min(...weights);
  const maxW = Math.max(...weights);
  const pad = Math.max(0.8, (maxW - minW) * 0.18);
  const yMin = Math.floor((minW - pad) * 10) / 10;
  const yMax = Math.ceil((maxW + pad) * 10) / 10;

  return (
    <section className="card trend-chart-card" aria-labelledby="trends-heading">
      <h2 id="trends-heading" className="card-title">
        {zh.weightTrend}
      </h2>
      <p className="muted trend-chart-card__caption">{zh.trendCaption}</p>
      <div className="chart-wrap">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 18, right: 6, left: 2, bottom: 10 }}>
            <defs>
              <linearGradient id="weightAreaFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8fb9a8" stopOpacity={0.38} />
                <stop offset="55%" stopColor="#8fb9a8" stopOpacity={0.08} />
                <stop offset="100%" stopColor="#8fb9a8" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              stroke={GRID}
              strokeDasharray="4 8"
              vertical={false}
              horizontal
            />
            <XAxis
              dataKey="label"
              interval="preserveStartEnd"
              tick={{ fill: TICK, fontSize: 11, fontWeight: 500 }}
              tickLine={{ stroke: AXIS }}
              axisLine={{ stroke: AXIS }}
              tickMargin={10}
              dy={4}
            />
            <YAxis
              domain={[yMin, yMax]}
              tickFormatter={formatKgTick}
              tick={{ fill: TICK, fontSize: 11, fontWeight: 500 }}
              tickLine={false}
              axisLine={false}
              width={46}
              tickMargin={6}
            />
            <Tooltip
              contentStyle={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                boxShadow: "0 8px 24px rgba(90, 70, 110, 0.1)",
              }}
              labelStyle={{ color: "var(--text-muted)", fontWeight: 600 }}
              formatter={(value: number) => [`${formatKgTick(value)} 公斤`, zh.weight]}
            />
            {goal && (
              <ReferenceLine
                y={goal.targetWeightKg}
                stroke="#c9a07a"
                strokeWidth={1.5}
                strokeDasharray="6 5"
                strokeOpacity={0.95}
              />
            )}
            <Area
              type="monotone"
              dataKey="weightKg"
              stroke="none"
              fill="url(#weightAreaFill)"
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="weightKg"
              stroke="var(--chart-line)"
              strokeWidth={2.75}
              dot={{
                r: 3.5,
                fill: "var(--bg-elevated)",
                stroke: "var(--chart-line)",
                strokeWidth: 2,
              }}
              activeDot={{ r: 6, strokeWidth: 0, fill: "var(--chart-line)" }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      {goal && (
        <p className="muted trend-chart-card__goal-hint">
          {zh.goalLineHint(goal.targetWeightKg)}
        </p>
      )}
    </section>
  );
}
