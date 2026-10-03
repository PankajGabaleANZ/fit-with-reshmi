// Turns the admin's weekly schedule into bookable slots. Times are handled in the clinic's time zone so
// the result is the same whether the server runs in India or in a UTC data centre.
import type { Availability } from "./lib/content.js";

export const minutesToLabel = (m: number) => {
  const h24 = Math.floor(m / 60);
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${String(h12).padStart(2, "0")}:${String(m % 60).padStart(2, "0")} ${h24 < 12 ? "AM" : "PM"}`;
};

export const labelToMinutes = (label: unknown): number | null => {
  const m = /^(\d{1,2}):(\d{2}) (AM|PM)$/.exec(String(label));
  if (!m) return null;
  let h = Number(m[1]);
  if (h < 1 || h > 12 || Number(m[2]) > 59) return null;
  if (h === 12) h = 0;
  if (m[3] === "PM") h += 12;
  return h * 60 + Number(m[2]);
};

export const isDateString = (s: unknown): s is string => typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s));

const parts = (dateStr: string) => dateStr.split("-").map(Number) as [number, number, number];

/** 0 = Sunday. A calendar date has the same weekday everywhere. */
export const dayOfWeek = (dateStr: string) => {
  const [y, m, d] = parts(dateStr);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
};

function tzOffsetMs(utcMs: number, tz: string) {
  const f = new Intl.DateTimeFormat("en-US", {
    timeZone: tz, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
  const p: Record<string, number> = {};
  for (const { type, value } of f.formatToParts(new Date(utcMs))) if (type !== "literal") p[type] = Number(value);
  return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) - Math.floor(utcMs / 1000) * 1000;
}

/** The real moment in time for "this date, this many minutes after midnight" in the given time zone. */
export function zonedToUtc(dateStr: string, minutes: number, tz: string): Date {
  const [y, m, d] = parts(dateStr);
  const guess = Date.UTC(y, m - 1, d, 0, minutes);
  const first = guess - tzOffsetMs(guess, tz);
  return new Date(guess - tzOffsetMs(first, tz));
}

export function todayIn(tz: string, now = new Date()): string {
  const p = new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
  return p; // en-CA gives YYYY-MM-DD
}

const toMinutes = (hhmm: string) => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3));

/** Slot start times (minutes after midnight) the schedule allows on that date, before bookings are considered. */
export function scheduledSlots(av: Availability, dateStr: string, now = new Date()): number[] {
  if (!isDateString(dateStr)) return [];
  if (av.blockedDates.includes(dateStr)) return [];
  const today = todayIn(av.timezone, now);
  if (dateStr < today) return [];
  const horizon = new Date(Date.parse(today) + av.maxDaysAhead * 86400000).toISOString().slice(0, 10);
  if (dateStr > horizon) return [];

  const day = av.week[dayOfWeek(dateStr)];
  if (!day?.enabled) return [];

  const earliest = now.getTime() + av.minNoticeHours * 3600000;
  const step = av.slotMinutes + av.gapMinutes;
  const out: number[] = [];
  for (const w of day.windows) {
    for (let t = toMinutes(w.start); t + av.slotMinutes <= toMinutes(w.end); t += step) {
      if (zonedToUtc(dateStr, t, av.timezone).getTime() >= earliest) out.push(t);
    }
  }
  return out;
}
