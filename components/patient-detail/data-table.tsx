"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Search, X } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { SingleSelect, type SelectOption } from "@/components/forms/select";
import { DateField } from "@/components/forms/form-controls";

export type DataColumn<T> = {
  key: string;
  label: ReactNode;
  align?: "left" | "center" | "right";
  icon?: ReactNode;
  color?: string;
  unit?: string;
  /** When true the column header + cells are hidden on small screens. */
  hideOnMobile?: boolean;
  headerClassName?: string;
  cellClassName?: string;
  render?: (row: T, index: number) => ReactNode;
};

export type DataTableFilter<T> =
  | {
      id: string;
      type: "search";
      placeholder?: string;
      /** Values are lower-cased and matched against the query (any match wins). */
      getValue: (row: T) => string | string[];
    }
  | {
      id: string;
      type: "select";
      label: string;
      placeholder?: string;
      options: SelectOption[];
      /** Selected option must equal one of the row's values (empty "" matches all). */
      getValue: (row: T) => string | string[];
    }
  | {
      id: string;
      type: "date";
      label: string;
      /** ISO yyyy-mm-dd (or empty). Row matches when it equals the selected date. */
      getValue: (row: T) => string | undefined;
    }
  | {
      id: string;
      type: "daterange";
      label: string;
      /** ISO yyyy-mm-dd (or empty). Row matches when inside [from, to]. */
      getValue: (row: T) => string | undefined;
    };

export type DataTableProps<T> = {
  rows: T[];
  columns: DataColumn<T>[];
  rowKey: (row: T) => string;
  emptyText?: string;
  className?: string;
  card?: boolean;
  title?: ReactNode;
  titleIcon?: ReactNode;
  countLabel?: string;
  /** Renders a free-text search field filtering against the configured columns. */
  searchable?: boolean;
  searchPlaceholder?: string;
  /** Dynamic, column-driven filters (single-select, date, date-range). */
  filters?: DataTableFilter<T>[];
};

const ALIGN: Record<NonNullable<DataColumn<unknown>["align"]>, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

type FilterState = Record<string, string>;

export function DataTable<T>({
  rows,
  columns,
  rowKey,
  emptyText = "No records found",
  className,
  card = false,
  title,
  titleIcon,
  countLabel = "entries",
  searchable = false,
  searchPlaceholder = "Search…",
  filters = [],
}: DataTableProps<T>) {
  const [query, setQuery] = useState("");
  const [values, setValues] = useState<FilterState>({});

  const hasSearch = searchable || filters.some((f) => f.type === "search");

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((row) => {
      if (q && hasSearch) {
        const searchableFilters = filters.filter((f) => f.type === "search");
        const targets = searchableFilters.flatMap((f) => {
          const value = (f as Extract<DataTableFilter<T>, { type: "search" }>).getValue(row);
          return Array.isArray(value) ? value : [value];
        });
        if (targets.length > 0 && !targets.some((t) => t.toLowerCase().includes(q))) {
          return false;
        }
      }
      return filters.every((filter) => matchesFilter(filter, row, values));
    });
  }, [rows, query, values, filters, hasSearch]);

  const activeFilterCount =
    (query ? 1 : 0) +
    Object.values(values).filter((v) => v !== "").length;

  function setValue(key: string, value: string) {
    setValues((prev) => {
      const next = { ...prev };
      if (value === "") delete next[key];
      else next[key] = value;
      return next;
    });
  }

  function clearAll() {
    setQuery("");
    setValues({});
  }

  const table = (
    <div className={cn("overflow-x-auto", className)}>
      <Table>
        <TableHeader>
          <TableRow className="border-b bg-slate-50/80 hover:bg-slate-50/80">
            {columns.map((col) => (
              <TableHead
                key={col.key}
                className={cn(
                  "h-10 whitespace-nowrap px-3 py-2.5 text-[10px] font-bold uppercase tracking-wide text-slate-500 sm:py-3 sm:text-xs",
                  ALIGN[col.align ?? "left"],
                  col.hideOnMobile && "hidden sm:table-cell",
                  col.headerClassName,
                )}
              >
                <span className="inline-flex items-center gap-1.5">
                  {col.icon && (
                    <span className={cn("inline-flex", col.color)}>
                      {col.icon}
                    </span>
                  )}
                  {col.label}
                </span>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredRows.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="py-8 text-center text-sm text-slate-400"
              >
                {emptyText}
              </TableCell>
            </TableRow>
          )}
          {filteredRows.map((row, idx) => (
            <TableRow
              key={rowKey(row)}
              className={cn(
                "border-b transition-colors last:border-0 hover:bg-blue-50/40",
                idx % 2 === 1 && "bg-slate-50/40",
              )}
            >
              {columns.map((col) => {
                const raw = (row as Record<string, unknown>)[col.key];
                const value: ReactNode =
                  raw === undefined || raw === null ? "—" : String(raw);
                return (
                  <TableCell
                    key={col.key}
                    className={cn(
                      "whitespace-nowrap px-3 py-2.5 text-xs align-middle sm:py-3 sm:text-sm",
                      ALIGN[col.align ?? "left"],
                      col.hideOnMobile && "hidden sm:table-cell",
                      col.cellClassName,
                    )}
                  >
                    {col.render ? (
                      col.render(row, idx)
                    ) : col.unit ? (
                      <span className={cn("font-semibold", col.color)}>
                        {value}
                        <span className="ml-1 text-[10px] font-medium text-slate-400 sm:text-[11px]">
                          {col.unit}
                        </span>
                      </span>
                    ) : (
                      <span className={cn("font-semibold", col.color)}>
                        {value}
                      </span>
                    )}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  const toolbar = hasSearch || filters.length > 0 ? (
    <FilterToolbar
      query={query}
      onQueryChange={setQuery}
      onClear={clearAll}
      activeCount={activeFilterCount}
      searchPlaceholder={searchPlaceholder}
      filters={filters}
      showSearch={hasSearch}
      values={values}
      onValue={setValue}
    />
  ) : null;

  if (!card) {
    return (
      <div className="space-y-3">
        {toolbar}
        {table}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-2 sm:mb-4">
        <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800 sm:text-base">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-sm shadow-blue-200">
            {titleIcon}
          </span>
          {title}
        </h3>
        {filteredRows.length > 0 && (
          <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
            {filteredRows.length} {countLabel}
          </span>
        )}
      </div>
      {toolbar}
      {table}
    </div>
  );
}

function FilterToolbar<T>({
  query,
  onQueryChange,
  onClear,
  activeCount,
  searchPlaceholder,
  filters,
  showSearch,
  values,
  onValue,
}: {
  query: string;
  onQueryChange: (v: string) => void;
  onClear: () => void;
  activeCount: number;
  searchPlaceholder: string;
  filters: DataTableFilter<T>[];
  showSearch: boolean;
  values: FilterState;
  onValue: (key: string, value: string) => void;
}) {
  return (
    <div className="mb-3 flex flex-wrap items-end gap-2.5 rounded-xl border border-slate-200 bg-slate-50/70 p-2.5">
      {showSearch && (
        <div className="relative min-w-[12rem] flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-8 pr-8 text-sm shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
          />
          {query && (
            <button
              type="button"
              onClick={() => onQueryChange("")}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      )}

      {filters.map((filter) => {
        if (filter.type === "search") return null;
        if (filter.type === "select") {
          return (
            <div key={filter.id} className="w-44">
              <SingleSelect
                label={filter.label}
                value={values[filter.id] ?? ""}
                options={[{ value: "", label: filter.placeholder ?? "All" }, ...filter.options]}
                onChange={(v) => onValue(filter.id, v)}
              />
            </div>
          );
        }
        if (filter.type === "date") {
          return (
            <div key={filter.id} className="w-40">
              <DateField
                label={filter.label}
                value={values[filter.id] ?? ""}
                onChange={(v) => onValue(filter.id, v)}
              />
            </div>
          );
        }
        // daterange
        return (
          <div key={filter.id} className="flex items-end gap-2">
            <div className="w-40">
              <DateField
                label={`${filter.label} From`}
                value={values[`${filter.id}:from`] ?? ""}
                onChange={(v) => onValue(`${filter.id}:from`, v)}
              />
            </div>
            <div className="w-40">
              <DateField
                label={`${filter.label} To`}
                value={values[`${filter.id}:to`] ?? ""}
                onChange={(v) => onValue(`${filter.id}:to`, v)}
              />
            </div>
          </div>
        );
      })}

      {activeCount > 0 && (
        <button
          type="button"
          onClick={onClear}
          className="flex h-9 shrink-0 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-500 shadow-sm transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
        >
          <X className="h-3.5 w-3.5" />
          Clear ({activeCount})
        </button>
      )}
    </div>
  );
}

function matchesFilter<T>(
  filter: DataTableFilter<T>,
  row: T,
  values: FilterState,
): boolean {
  switch (filter.type) {
    case "search":
      return true;
    case "select": {
      const selected = values[filter.id];
      if (!selected) return true;
      const rowValues = filter.getValue(row);
      const list = Array.isArray(rowValues) ? rowValues : [rowValues];
      return list.includes(selected);
    }
    case "date": {
      const selected = values[filter.id];
      if (!selected) return true;
      return filter.getValue(row) === selected;
    }
    case "daterange": {
      const from = values[`${filter.id}:from`];
      const to = values[`${filter.id}:to`];
      if (!from && !to) return true;
      const date = filter.getValue(row);
      if (!date) return false;
      if (from && date < from) return false;
      if (to && date > to) return false;
      return true;
    }
  }
}