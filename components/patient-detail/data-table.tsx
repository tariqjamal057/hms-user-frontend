"use client";

import type { ReactNode } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export type DataColumn<T> = {
  key: string;
  label: ReactNode;
  align?: "left" | "center" | "right";
  icon?: ReactNode;
  color?: string;
  unit?: string;
  headerClassName?: string;
  cellClassName?: string;
  render?: (row: T, index: number) => ReactNode;
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
};

const ALIGN: Record<NonNullable<DataColumn<unknown>["align"]>, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

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
}: DataTableProps<T>) {
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
          {rows.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="py-8 text-center text-sm text-slate-400"
              >
                {emptyText}
              </TableCell>
            </TableRow>
          )}
          {rows.map((row, idx) => (
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

  if (!card) return table;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-2 sm:mb-4">
        <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800 sm:text-base">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-sm shadow-blue-200">
            {titleIcon}
          </span>
          {title}
        </h3>
        {rows.length > 0 && (
          <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
            {rows.length} {countLabel}
          </span>
        )}
      </div>
      {table}
    </div>
  );
}
