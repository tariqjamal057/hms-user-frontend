// app/(dashboard)/billing/dashboard/_components/ledger-tab.tsx
"use client";
import { useMemo, useState } from "react";
import { Download, Search } from "lucide-react";
import type { BillingPatient, DepartmentLedgerRow } from "@/types/billing/ipd/billing-types";
import { buildDepartmentLedger } from "@/lib/billing/ipd/billing-analytics";
import { formatCurrency } from "@/lib/billing/ipd/billing-calculations";
import { downloadCsv } from "@/lib/billing/ipd/billing-export";

const STATUS_STYLE: Record<string, string> = {
  Posted: "rounded bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700",
  Paid: "rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700",
  Due: "rounded bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700",
  Dispensed: "rounded bg-cyan-50 px-2 py-0.5 text-[10px] font-bold text-cyan-700",
  "Result Ready": "rounded bg-violet-50 px-2 py-0.5 text-[10px] font-bold text-violet-700",
};

interface Props {
  patients: BillingPatient[];
}

export function LedgerTab({ patients }: Props) {
  const rows = useMemo(() => buildDepartmentLedger(patients), [patients]);
  const departments = useMemo(
    () => ["All", ...Array.from(new Set(rows.map((r) => r.dept))).sort()],
    [rows],
  );
  const [dept, setDept] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter(
      (r) =>
        (dept === "All" || r.dept === dept) &&
        (!q ||
          `${r.service} ${r.patientName} ${r.uhid} ${r.ipdId} ${r.orderedBy}`
            .toLowerCase()
            .includes(q)),
    );
  }, [rows, dept, search]);

  const totals = useMemo(
    () => ({
      gross: filtered.reduce((s, r) => s + r.net, 0),
      count: filtered.length,
    }),
    [filtered],
  );

  function handleExport() {
    downloadCsv(
      "billing-ledger",
      filtered.map((r) => ({
        Date: r.date,
        Department: r.dept,
        Service: r.service,
        "Ordered By": r.orderedBy,
        Qty: r.qty,
        Rate: r.rate,
        Discount: r.discount,
        Tax: r.tax,
        Net: r.net,
        Payer: r.payer,
        Status: r.status,
        Patient: r.patientName,
        IPD: r.ipdId,
      })),
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="flex flex-col gap-3 border-b border-slate-100 p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex gap-2 overflow-x-auto">
          {departments.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDept(d)}
              className={`shrink-0 cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                dept === d ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Service, patient, UHID..."
              className="w-52 rounded-lg border border-slate-200 bg-slate-50 py-2 pl-8 pr-3 text-xs outline-none focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-50"
            />
          </div>
          <button
            type="button"
            onClick={handleExport}
            className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            <Download className="h-3.5 w-3.5" /> Export
          </button>
        </div>
      </div>

      <div className="overflow-auto">
        <table className="w-full min-w-[1040px] text-xs">
          <thead className="border-b border-slate-200 bg-slate-50 text-left text-[10px] uppercase tracking-wide text-slate-500">
            <tr>
              <th className="p-3 font-semibold">Date</th>
              <th className="p-3 font-semibold">Patient</th>
              <th className="p-3 font-semibold">Department</th>
              <th className="p-3 font-semibold">Service</th>
              <th className="p-3 font-semibold">Ordered By</th>
              <th className="p-3 text-right font-semibold">Qty</th>
              <th className="p-3 text-right font-semibold">Rate</th>
              <th className="p-3 text-right font-semibold">Net</th>
              <th className="p-3 font-semibold">Payer</th>
              <th className="p-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((row: DepartmentLedgerRow) => (
              <tr key={row.id} className="transition hover:bg-slate-50">
                <td className="p-3 text-slate-500">{row.date}</td>
                <td className="p-3">
                  <span className="font-semibold text-slate-800">{row.patientName}</span>
                  <span className="block font-mono text-[10px] text-slate-400">{row.ipdId}</span>
                </td>
                <td className="p-3 text-slate-600">{row.dept}</td>
                <td className="max-w-[260px] p-3 font-medium text-slate-700">{row.service}</td>
                <td className="p-3 text-slate-500">{row.orderedBy}</td>
                <td className="p-3 text-right text-slate-600">{row.qty}</td>
                <td className="p-3 text-right text-slate-600">{formatCurrency(row.rate)}</td>
                <td className="p-3 text-right font-bold text-slate-800">{formatCurrency(row.net)}</td>
                <td className="p-3 text-slate-600">{row.payer}</td>
                <td className="p-3">
                  <span className={STATUS_STYLE[row.status] ?? "rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600"}>
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={10} className="px-3 py-10 text-center text-sm text-slate-400">
                  No ledger entries match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-2 border-t border-slate-100 bg-slate-50/70 px-4 py-3 text-xs md:flex-row md:items-center md:justify-between">
        <span className="text-slate-500">
          Showing {filtered.length} of {rows.length} charge events · Auto-captured
          from source departments
        </span>
        <span className="flex gap-5 text-slate-700">
          <span>
            Gross <b>{formatCurrency(totals.gross)}</b>
          </span>
        </span>
      </div>
    </div>
  );
}