"use client";

import { useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Inbox,
  Columns3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import BulkExport from "./BulkExport";
import type { ExportableRow } from "./BulkExport";

export type HideOnBreakpoint = "sm" | "md" | "lg" | "xl" | "2xl";

export function responsiveHideClass(bp: HideOnBreakpoint): string {
  const map: Record<HideOnBreakpoint, string> = {
    sm: "hidden sm:table-cell",
    md: "hidden md:table-cell",
    lg: "hidden lg:table-cell",
    xl: "hidden xl:table-cell",
    "2xl": "hidden 2xl:table-cell",
  };
  return map[bp];
}

export function responsiveHideThClass(bp: HideOnBreakpoint): string {
  const map: Record<HideOnBreakpoint, string> = {
    sm: "hidden sm:table-cell",
    md: "hidden md:table-cell",
    lg: "hidden lg:table-cell",
    xl: "hidden xl:table-cell",
    "2xl": "hidden 2xl:table-cell",
  };
  return map[bp];
}

/** A single display column. */
export interface OpsColumn<T> {
  key: string;
  header: string;
  className?: string;
  headerClassName?: string;
  /** When false the column is hidden by default */
  enableHiding?: boolean;
  /** Optional responsive width class, e.g. "w-20 md:w-32 lg:w-48" */
  widthClass?: string;
  /** Hide this column below the given breakpoint (e.g. "sm" hides on < 640px) */
  hideOn?: HideOnBreakpoint;
  cell: (row: T, index: number) => React.ReactNode;
}

interface OpsTableProps<T> {
  data: T[];
  columns: OpsColumn<T>[];
  rowKey: (row: T) => string | number;
  pageSize?: number;
  pageSizeOptions?: number[];
  showColumnToggle?: boolean;
  onRowClick?: (row: T) => void;
  emptyContent?: React.ReactNode;
  selection?: boolean;
  selectedKeys?: Set<string | number>;
  onSelectionChange?: (keys: Set<string | number>) => void;
  bulkActions?: (selected: T[], clearSelection: () => void) => React.ReactNode;
  className?: string;
}

export default function OpsTable<T>({
  data,
  columns,
  rowKey,
  pageSize = 10,
  pageSizeOptions = [10, 25, 50, 100],
  showColumnToggle = false,
  onRowClick,
  emptyContent,
  selection = true,
  selectedKeys: controlledSelection,
  onSelectionChange,
  bulkActions,
  className,
}: OpsTableProps<T>) {
  const [pageIndex, setPageIndex] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(pageSize);
  const [hidden, setHidden] = useState<Record<string, boolean>>({});
  const [internalSelection, setInternalSelection] = useState<Set<string | number>>(new Set());

  const selected = controlledSelection ?? internalSelection;

  function commit(next: Set<string | number>) {
    if (controlledSelection === undefined) setInternalSelection(next);
    onSelectionChange?.(next);
  }

  const hideable = columns.filter((c) => c.enableHiding !== false);
  const visibleColumns = useMemo(
    () => columns.filter((c) => !hidden[c.key]),
    [columns, hidden]
  );

  const pageCount = Math.max(1, Math.ceil(data.length / rowsPerPage));
  const safePage = Math.min(pageIndex, pageCount - 1);

  const pageRows = useMemo(() => {
    const start = safePage * rowsPerPage;
    return data.slice(start, start + rowsPerPage);
  }, [data, safePage, rowsPerPage]);

  function toggleColumn(key: string, show: boolean) {
    setHidden((previous) => {
      const next = { ...previous };
      if (show) delete next[key];
      else next[key] = true;
      return next;
    });
  }

  const pageKeys = pageRows.map((row) => rowKey(row));
  const pageSelected = pageKeys.filter((k) => selected.has(k)).length;
  const allPageSelected = pageKeys.length > 0 && pageSelected === pageKeys.length;

  function toggleAll(checked: boolean) {
    const next = new Set(selected);
    pageKeys.forEach((k) => {
      if (checked) next.add(k);
      else next.delete(k);
    });
    commit(next);
  }

  function toggleRow(key: string | number, checked: boolean) {
    const next = new Set(selected);
    if (checked) next.add(key);
    else next.delete(key);
    commit(next);
  }

  const selectedRows = data.filter((row) => selected.has(rowKey(row)));
  const hasColumnToggle = showColumnToggle && hideable.length > 0;
  const hasSelection = selection && selectedRows.length > 0;

  return (
    <div className="w-full max-w-full space-y-3">
      <div className="w-full max-w-full rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        {(hasColumnToggle || hasSelection) && (
          <div className="flex flex-col gap-2 border-b border-slate-100 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:px-4">
            <p className="text-xs font-medium text-slate-500">
              {hasSelection
                ? `${selectedRows.length} of ${data.length} selected`
                : `${data.length} record${data.length !== 1 ? "s" : ""}`}
            </p>
            <div className="flex items-center gap-2">
              {hasSelection &&
                (bulkActions ? (
                  bulkActions(selectedRows, () => commit(new Set()))
                ) : (
                  <BulkExport
                    selected={selectedRows}
                    buildRows={(row) => ({ ...row } as ExportableRow)}
                  />
                ))}
              {hasColumnToggle && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 border-slate-200 text-slate-600"
                    >
                      <Columns3 className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Columns</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="max-h-72 w-56 overflow-y-auto">
                    <DropdownMenuLabel className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                      Show / hide columns
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {hideable.map((column) => (
                      <DropdownMenuCheckboxItem
                        key={column.key}
                        checked={!hidden[column.key]}
                        onCheckedChange={(value) => toggleColumn(column.key, Boolean(value))}
                      >
                        {column.header}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        )}

        <div className="w-full overflow-x-auto">
          <table className={cn("w-full min-w-[680px] table-auto", className)}>
            <thead>
              <tr className="bg-slate-50">
                {selection && (
                  <th className="w-8 min-w-[32px] border-b border-slate-200 px-2 py-3 sm:w-10 sm:px-3">
                    <Checkbox
                      aria-label="Select all rows"
                      checked={allPageSelected}
                      onCheckedChange={(value) =>
                        toggleAll(value === true && !allPageSelected)
                      }
                    />
                  </th>
                )}
                {visibleColumns.map((col) => {
                  const hideCls = col.hideOn ? ` ${responsiveHideThClass(col.hideOn)}` : "";
                  return (
                    <th
                      key={col.key}
                      className={cn(
                        "truncate border-b border-slate-200 px-2 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-500 sm:px-4 sm:text-xs",
                        col.headerClassName,
                        col.widthClass,
                        hideCls,
                      )}
                    >
                      {col.header}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pageRows.map((row, index) => {
                const key = rowKey(row);
                const isSelected = selected.has(key);
                return (
                  <tr
                    key={key}
                    onClick={
                      onRowClick
                        ? () => {
                            if (!isSelected) onRowClick(row);
                          }
                        : undefined
                    }
                    className={cn(
                      "transition-colors",
                      onRowClick && "cursor-pointer hover:bg-slate-50/80",
                      isSelected && "bg-blue-50/50"
                    )}
                  >
                    {selection && (
                      <td className="px-2 py-3 sm:px-3">
                        <Checkbox
                          aria-label="Select row"
                          checked={isSelected}
                          onCheckedChange={(value) =>
                            toggleRow(key, value === true)
                          }
                        />
                      </td>
                    )}
                    {visibleColumns.map((col) => {
                      const hideCls = col.hideOn ? ` ${responsiveHideClass(col.hideOn)}` : "";
                      return (
                        <td
                          key={col.key}
                          className={cn("truncate px-2 py-3 text-xs sm:px-4 sm:text-sm", col.className, col.widthClass, hideCls)}
                        >
                          {col.cell(row, index)}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>

          {pageRows.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-2 py-12 text-center sm:py-16">
              {emptyContent ?? (
                <>
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-slate-100 sm:h-12 sm:w-12">
                    <Inbox className="h-5 w-5 text-slate-400 sm:h-6 sm:w-6" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-700">
                    No records found
                  </h3>
                  <p className="text-xs text-slate-500">
                    Try adjusting your search or filters.
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {data.length > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span>Rows per page</span>
            <Select
              value={String(rowsPerPage)}
              onValueChange={(value) => {
                setRowsPerPage(Number(value));
                setPageIndex(0);
              }}
            >
              <SelectTrigger className="h-8 w-16">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="ml-0 sm:ml-2">
              Page {safePage + 1} of {pageCount} · {data.length} total rows
            </span>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={safePage === 0}
              onClick={() => setPageIndex(0)}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
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
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={safePage >= pageCount - 1}
              onClick={() => setPageIndex(pageCount - 1)}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
