import { DateTime } from "luxon";

/** 美国亚利桑那凤凰城时间，全年 MST（无夏令时），与山地标准时一致 */
export const FASTING_CLOCK_ZONE = "America/Phoenix";

export function startOfFastingDay(d: Date): Date {
  return DateTime.fromJSDate(d).setZone(FASTING_CLOCK_ZONE).startOf("day").toJSDate();
}

export function endOfFastingDay(d: Date): Date {
  return DateTime.fromJSDate(d).setZone(FASTING_CLOCK_ZONE).startOf("day").plus({ days: 1 }).toJSDate();
}

/** 从该时区当天 0 点起的分钟数（0–1440），用于圆盘指针与弧段 */
export function minutesIntoFastingZoneDay(d: Date): number {
  const z = DateTime.fromJSDate(d).setZone(FASTING_CLOCK_ZONE);
  return z.hour * 60 + z.minute + z.second / 60 + z.millisecond / 60000;
}

export function formatFastingInstantInZone(isoOrDate: string | Date): string {
  const dt =
    typeof isoOrDate === "string"
      ? DateTime.fromISO(isoOrDate).setZone(FASTING_CLOCK_ZONE)
      : DateTime.fromJSDate(isoOrDate).setZone(FASTING_CLOCK_ZONE);
  return dt.isValid ? dt.toFormat("M月d日 HH:mm") : String(isoOrDate);
}

/** 圆盘旁数字时间（与指针一致，便于对照 24 小时刻度） */
export function formatFastingClockNowLine(d: Date): string {
  const dt = DateTime.fromJSDate(d).setZone(FASTING_CLOCK_ZONE);
  if (!dt.isValid) return "";
  return `${dt.toFormat("M月d日 HH:mm")}（${dt.offsetNameShort}）`;
}
