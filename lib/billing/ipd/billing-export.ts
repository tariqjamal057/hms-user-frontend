// lib/billing/ipd/billing-export.ts

export interface ExportRow {
  [key: string]: string | number;
}

function toCsv(rows: ExportRow[]): string {
  if (rows.length === 0) return "";
  const keys = Object.keys(rows[0]);
  const lines = rows.map((row) =>
    keys
      .map((k) => {
        const raw = String(row[k] ?? "");
        return `"${raw.replace(/"/g, '""')}"`;
      })
      .join(","),
  );
  return [keys.join(","), ...lines].join("\n");
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

/** Triggers a client-side CSV download with a UTF-8 BOM header. */
export function downloadCsv(filename: string, rows: ExportRow[]) {
  if (rows.length === 0) return;
  download(`${filename}.csv`, "\uFEFF" + toCsv(rows), "text/csv;charset=utf-8;");
}