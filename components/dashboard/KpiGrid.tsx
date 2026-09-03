import { cn } from "@/lib/utils";
import KpiCard from "./KpiCard";
import type { KpiCardProps } from "./types";

interface KpiGridProps {
  items: KpiCardProps[];
  columns?: 2 | 3 | 4;
  className?: string;
}

const GRID_COLS: Record<NonNullable<KpiGridProps["columns"]>, string> = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 xl:grid-cols-3",
  4: "sm:grid-cols-2 xl:grid-cols-4",
};

export default function KpiGrid({
  items,
  columns = 4,
  className,
}: KpiGridProps) {
  return (
    <div className={cn("grid grid-cols-1 gap-4", GRID_COLS[columns], className)}>
      {items.map((kpi, i) => (
        <KpiCard key={kpi.id ?? `${kpi.label}-${i}`} {...kpi} />
      ))}
    </div>
  );
}
