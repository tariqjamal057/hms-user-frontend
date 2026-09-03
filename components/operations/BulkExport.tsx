"use client";

import { FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface ExportableRow {
  [key: string]: string | number;
}

export interface BulkExportProps<T = ExportableRow> {
  /** Selected rows to export. */
  selected: T[];
  /** Maps each selected row to a flat key/value object for export. */
  buildRows: (row: T) => ExportableRow;
  /** Base filename (without extension). Defaults to "export". */
  filename?: string;
  /** Button label. Defaults to "Export". */
  label?: string;
  /** Optional export key → human label mapping for CSV headers. */
  headers?: Record<string, string>;
}

function toCsv(payload: ExportableRow[]): string {
  if (payload.length === 0) return "";
  const keys = Object.keys(payload[0]);
  const header = keys.map((k) => k).join(",");
  const lines = payload.map((row) =>
    keys
      .map((k) => {
        const value = row[k];
        const raw = String(value ?? "");
        return `"${raw.replace(/"/g, '""')}"`;
      })
      .join(",")
  );
  return [header, ...lines].join("\n");
}

function download(name: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Reusable bulk-export control with multiple output options (CSV / JSON).
 * Intended to be passed as the `bulkActions` slot of `OpsTable`.
 */
export default function BulkExport<T>({
  selected,
  buildRows,
  filename = "export",
  label = "Export",
  headers,
}: BulkExportProps<T>) {
  const payload = selected.map(buildRows);

  function handleCsv() {
    let csv = toCsv(payload);
    if (headers && payload.length > 0) {
      const keys = Object.keys(payload[0]);
      const headerLine = keys.map((k) => headers[k] ?? k).join(",");
      const rest = csv.split("\n").slice(1).join("\n");
      csv = [headerLine, rest].join("\n");
    }
    download(`${filename}.csv`, "\uFEFF" + csv, "text/csv;charset=utf-8;");
  }

  function handleJson() {
    download(
      `${filename}.json`,
      JSON.stringify(payload, null, 2),
      "application/json"
    );
  }

  function handleClipboard() {
    navigator.clipboard
      .writeText(JSON.stringify(payload, null, 2))
      .catch(() => undefined);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 border-blue-200 bg-white text-blue-700">
          <FileDown className="h-3.5 w-3.5" />
          {label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
          {selected.length} row{selected.length !== 1 ? "s" : ""} selected
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleCsv}>Export as CSV</DropdownMenuItem>
        <DropdownMenuItem onClick={handleJson}>Export as JSON</DropdownMenuItem>
        <DropdownMenuItem onClick={handleClipboard}>Copy to clipboard</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}