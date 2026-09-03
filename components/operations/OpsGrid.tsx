"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface OpsGridProps<T> {
  data: T[];
  rowKey: (row: T) => string | number;
  /** Renders a single card for a row */
  renderCard: (row: T, index: number) => React.ReactNode;
  pageSize?: number;
  /** Optional empty state custom content */
  emptyContent?: React.ReactNode;
  className?: string;
}

/**
 * Unified grid/card view with pagination.
 * Pages provide a `renderCard` that returns the card content for each row.
 */
export default function OpsGrid<T>({
  data,
  rowKey,
  renderCard,
  pageSize = 6,
  emptyContent,
  className,
}: OpsGridProps<T>) {
  const [pageIndex, setPageIndex] = useState(0);
  const pageCount = Math.max(1, Math.ceil(data.length / pageSize));
  const safePage = Math.min(pageIndex, pageCount - 1);
  const pageRows = data.slice(safePage * pageSize, safePage * pageSize + pageSize);

  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white py-16 text-center shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        {emptyContent ?? (
          <>
            <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-slate-100">
              <Inbox className="h-6 w-6 text-slate-400" />
            </div>
            <h3 className="text-sm font-semibold text-slate-700">
              No records found
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Try adjusting your search or filters.
            </p>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div
        className={cn(
          "grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3",
          className
        )}
      >
        {pageRows.map((row, index) => (
          <div key={rowKey(row)}>{renderCard(row, index)}</div>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-xs text-slate-500">
          Page {safePage + 1} of {pageCount} · {data.length} total records
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={safePage === 0}
            onClick={() => setPageIndex(safePage - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={safePage >= pageCount - 1}
            onClick={() => setPageIndex(safePage + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}