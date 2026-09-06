// lib/date-utils.ts

const MONTH_INDEX: Record<string, number> = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
  jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
};

/**
 * Parses Indian-style display date/datetime strings used across the app
 * (e.g. "20 May 2024, 11:20 AM", "27 Aug 2026") into an ISO yyyy-mm-dd
 * string so they can feed the DataTable's date filters. Returns "" when
 * the input cannot be parsed.
 */
export function displayDateToIso(input: string): string {
  const m = input.trim().match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/);
  if (!m) return "";
  const month = MONTH_INDEX[m[2].slice(0, 3).toLowerCase()];
  if (!month) return "";
  const day = Number(m[1]);
  const year = Number(m[3]);
  if (day < 1 || day > 31 || year < 1900 || year > 2100) return "";
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** True when ISO date `date` falls inside the inclusive [from, to] range. */
export function isoInRange(date: string, from: string, to: string): boolean {
  if (from && date < from) return false;
  if (to && date > to) return false;
  return true;
}