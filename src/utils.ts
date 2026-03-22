/** Today in local timezone as YYYY-MM-DD */
export function todayISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function formatShortDate(isoDate: string): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  if (!y || !m || !d) return isoDate;
  return new Date(y, m - 1, d).toLocaleDateString("zh-CN", {
    month: "numeric",
    day: "numeric",
    year: y !== new Date().getFullYear() ? "numeric" : undefined,
  });
}

export function formatDuration(ms: number): string {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const min = Math.floor((s % 3600) / 60);
  if (h >= 48) {
    const days = Math.floor(h / 24);
    const remH = h % 24;
    return `${days} 天 ${remH} 小时`;
  }
  if (h > 0) return `${h} 小时 ${min} 分钟`;
  return `${min} 分钟`;
}

export function daysBetween(a: string, b: string): number {
  const da = new Date(a + "T12:00:00");
  const db = new Date(b + "T12:00:00");
  return Math.round((db.getTime() - da.getTime()) / (1000 * 60 * 60 * 24));
}

/** 体重在输入框中的展示：统一为数字再转字符串，避免出现 048 等前导零 */
export function normalizeKgInputDisplay(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === "") return "";
  const n = typeof value === "number" ? value : Number(String(value).trim());
  if (!Number.isFinite(n)) return "";
  return String(n);
}
