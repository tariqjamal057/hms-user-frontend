import { KpiGrid } from "@/components/dashboard";
import type { KpiCardProps } from "@/components/dashboard";
import { cn } from "@/lib/utils";

interface StatsRowProps {
  /** 3, 4 or 5 KPI cards rendered for the info row. */
  items: KpiCardProps[];
  columns?: 2 | 3 | 4 | 5;
  className?: string;
}

/**
 * Unified info-cards row. Reuses the existing KpiCard/KpiGrid from the
 * dashboard layer so visual styling stays consistent everywhere.
 */
export default function StatsRow({
  items,
  columns,
  className,
}: StatsRowProps) {
  const resolvedColumns = columns ?? (items.length === 5 ? 5 : items.length === 3 ? 3 : 4);
  return (
    <div className={cn(className)}>
      <KpiGrid items={items} columns={resolvedColumns} />
    </div>
  );
}