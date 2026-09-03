"use client";

import { useMemo, useState } from "react";
import {
  Search,
  SlidersHorizontal,
  LayoutGrid,
  List as ListIcon,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import type { SelectFilterField, ViewMode } from "./types";

interface FilterBarProps {
  /** Search keyword value */
  search?: string;
  /** Placeholder for the search box */
  searchPlaceholder?: string;
  /** Called when the search keyword changes */
  onSearch?: (value: string) => void;
  /** Select filters */
  filters?: SelectFilterField[];
  /** Called when a filter value changes (key, value) */
  onFilterChange?: (key: string, value: string) => void;
  /** Allows showing/hiding individual filter fields via a dropdown */
  filterToggle?: boolean;
  /** Enabled when there are active filters or a search query */
  canClear?: boolean;
  /** Clears search + all filters */
  onClear?: () => void;
  /** View toggle support */
  viewSupported?: boolean;
  viewMode?: ViewMode;
  onViewChange?: (mode: ViewMode) => void;
  /** Extra controls rendered on the right of the toggle */
  extra?: React.ReactNode;
  className?: string;
}

/**
 * Unified filter bar: search box + select filters + clear + list/grid toggle.
 * When `filterToggle` is enabled, each filter can be shown/hidden via a
 * "Filters" dropdown. All state is controlled by the parent.
 */
export default function FilterBar({
  search,
  searchPlaceholder = "Search...",
  onSearch,
  filters = [],
  onFilterChange,
  filterToggle = false,
  canClear = false,
  onClear,
  viewSupported = false,
  viewMode,
  onViewChange,
  extra,
  className,
}: FilterBarProps) {
  const [hiddenFilters, setHiddenFilters] = useState<Record<string, boolean>>({});

  const visibleFilters = useMemo(
    () => filters.filter((f) => !hiddenFilters[f.key]),
    [filters, hiddenFilters]
  );

  function toggleFilter(key: string, show: boolean) {
    setHiddenFilters((previous) => {
      const next = { ...previous };
      if (show) delete next[key];
      else next[key] = true;
      return next;
    });
  }

  const hasFilters = filters.length > 0;

  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200 bg-white p-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)]",
        className
      )}
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2 lg:flex lg:flex-1 lg:flex-wrap lg:items-center">
          <div className="relative lg:min-w-[220px] lg:flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => onSearch?.(e.target.value)}
              placeholder={searchPlaceholder}
              className="border-slate-200 pl-9 focus:border-blue-500"
            />
          </div>

          {hasFilters && (
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              {visibleFilters.map((filter) => (
                <Select
                  key={filter.key}
                  value={filter.selected}
                  onValueChange={(v) => onFilterChange?.(filter.key, v)}
                >
                  <SelectTrigger className="w-full border-slate-200 sm:w-auto">
                    <SlidersHorizontal className="h-3.5 w-3.5 text-slate-400" />
                    <SelectValue placeholder={filter.label} />
                  </SelectTrigger>
                  <SelectContent>
                    {filter.options.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {filterToggle && hasFilters && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 border-slate-200 text-slate-600"
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  Filters
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  Show / hide filters
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {filters.map((filter) => (
                  <DropdownMenuCheckboxItem
                    key={filter.key}
                    checked={!hiddenFilters[filter.key]}
                    onCheckedChange={(value) => toggleFilter(filter.key, Boolean(value))}
                  >
                    {filter.label}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {canClear && (
            <button
              type="button"
              onClick={onClear}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              <X className="h-3.5 w-3.5" />
              Clear
            </button>
          )}

          {viewSupported && (
            <div className="flex rounded-lg bg-slate-100 p-0.5">
              <button
                type="button"
                onClick={() => onViewChange?.("list")}
                aria-label="List view"
                className={cn(
                  "flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors",
                  viewMode === "list"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                )}
              >
                <ListIcon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">List</span>
              </button>
              <button
                type="button"
                onClick={() => onViewChange?.("grid")}
                aria-label="Grid view"
                className={cn(
                  "flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors",
                  viewMode === "grid"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                )}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Grid</span>
              </button>
            </div>
          )}

          {extra}
        </div>
      </div>
    </div>
  );
}