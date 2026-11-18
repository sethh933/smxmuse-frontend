const FIRST_DAY = Date.UTC(2026, 10, 18);
const FIRST_SEASON = 1974;
export const FINAL_OPENER_YEAR = 2026;
export const NEXT_OPENER_DATE = "2027-01-09";
const easternDate = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/New_York",
  year: "numeric",
  month: "2-digit",
  day: "2-digit"
});

export function getSupercrossOpenerYear(now = new Date()) {
  const parts = easternDate.formatToParts(now);
  const year = Number(parts.find((part) => part.type === "year").value);
  const month = Number(parts.find((part) => part.type === "month").value);
  const day = Number(parts.find((part) => part.type === "day").value);
  const offset = (Date.UTC(year, month - 1, day) - FIRST_DAY) / 86_400_000;
  return offset >= 0 ? Math.min(FIRST_SEASON + offset, FINAL_OPENER_YEAR) : null;
}

export function getSeasonOpener(races) {
  return races
    .filter((race) => race.round === 1)
    .sort((a, b) => a.race_date.localeCompare(b.race_date) || a.race_id - b.race_id)[0];
}

export function getOpenerResults({ class450 = [], class250 = [] }) {
  const class250Coasts = new Set(class250.map((row) => row.coastid));
  const selected250 = class250Coasts.size > 1
    ? class250.filter((row) => row.coastid === 3)
    : class250;

  return [
    { classId: 1, limit: class250.length ? 5 : 10, rows: class450 },
    { classId: 2, limit: 5, rows: selected250 }
  ].map((group) => ({ ...group, rows: group.rows.slice(0, group.limit) }))
    .filter((group) => group.rows.length > 0);
}
