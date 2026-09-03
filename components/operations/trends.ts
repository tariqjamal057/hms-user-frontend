import type { TrendInfo } from "@/components/dashboard";

/**
 * Build a dashboard-style KPI trend comparing a current value against a
 * previous-day baseline. Matches how the dashboard KPI cards render their
 * "% vs yesterday" comparison pill.
 *
 * Example: buildTrend(stats.total, previous.total) => { value: 25, display: "12.5%", label: "vs yesterday" }
 */
export function buildTrend(
  current: number,
  previous: number,
  label = "vs yesterday"
): TrendInfo | undefined {
  const baseline = previous || 0;
  if (baseline === 0 && current === 0) {
    return { value: 0, display: "0%", label };
  }
  const delta = current - baseline;
  const percent = baseline === 0 ? 100 : (delta / baseline) * 100;
  const rounded = Math.round(percent * 10) / 10;
  const display = `${rounded > 0 ? "+" : ""}${rounded}%`;
  return {
    value: rounded,
    display,
    label,
    direction: delta > 0 ? "up" : delta < 0 ? "down" : "neutral",
    tone:
      delta > 0
        ? "positive"
        : delta < 0
          ? "negative"
          : "neutral",
  };
}