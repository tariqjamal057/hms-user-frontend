// app/(dashboard)/billing/dashboard/_components/audit-tab.tsx
"use client";
import { useMemo, useState } from "react";
import { Download, Search } from "lucide-react";
import type { AuditEvent } from "@/types/billing/ipd/billing-types";
import { downloadCsv } from "@/lib/billing/ipd/billing-export";

interface Props {
  events: AuditEvent[];
}

export function AuditTab({ events }: Props) {
  const [search, setSearch] = useState("");
  const [action, setAction] = useState("All");

  const actions = useMemo(
    () => ["All", ...Array.from(new Set(events.map((e) => e.action)))],
    [events],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return events.filter(
      (e) =>
        (action === "All" || e.action === action) &&
        (!q ||
          `${e.patientName} ${e.ipdId} ${e.uhid} ${e.user} ${e.action} ${e.reason} ${e.source}`
            .toLowerCase()
            .includes(q)),
    );
  }, [events, search, action]);

  function handleExport() {
    downloadCsv(
      "billing-audit-trail",
      filtered.map((e) => ({
        Timestamp: e.timestamp,
        Patient: e.patientName,
        IPD: e.ipdId,
        User: e.user,
        Role: e.role,
        Action: e.action,
        Previous: e.previous,
        "New Value": e.newValue,
        Reason: e.reason,
        Source: e.source,
      })),
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="flex flex-col gap-3 border-b border-slate-100 p-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="font-semibold text-slate-800">Immutable Audit Timeline</h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Every financial change is attributable to a user, role, reason and
            timestamp.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Patient, user, action..."
              className="w-44 rounded-lg border border-slate-200 bg-slate-50 py-2 pl-8 pr-3 text-xs outline-none focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-50"
            />
          </div>
          <select
            value={action}
            onChange={(e) => setAction(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs outline-none focus:border-blue-400"
          >
            {actions.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleExport}
            className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            <Download className="h-3.5 w-3.5" /> Export Audit
          </button>
        </div>
      </div>

      <div className="overflow-auto">
        <table className="w-full min-w-[900px] text-xs">
          <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500">
            <tr>
              <th className="p-3 text-left font-semibold">Timestamp</th>
              <th className="p-3 text-left font-semibold">User / Role</th>
              <th className="p-3 text-left font-semibold">Action</th>
              <th className="p-3 text-left font-semibold">Previous</th>
              <th className="p-3 text-left font-semibold">New Value</th>
              <th className="p-3 text-left font-semibold">Reason</th>
              <th className="p-3 text-left font-semibold">Source</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((event) => (
              <tr key={event.id} className="transition hover:bg-slate-50">
                <td className="whitespace-nowrap p-3 text-slate-500">{event.timestamp}</td>
                <td className="p-3">
                  <span className="font-semibold text-slate-700">{event.user}</span>
                  <span className="block text-[10px] text-slate-400">{event.role}</span>
                  <span className="block font-mono text-[10px] text-slate-300">{event.ipdId}</span>
                </td>
                <td className="max-w-[180px] p-3 font-medium text-slate-800">{event.action}</td>
                <td className="whitespace-nowrap p-3 text-slate-500">{event.previous}</td>
                <td className="whitespace-nowrap p-3 font-semibold text-slate-800">{event.newValue}</td>
                <td className="max-w-[220px] p-3 text-slate-500">{event.reason}</td>
                <td className="whitespace-nowrap p-3 text-slate-600">{event.source}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-10 text-center text-sm text-slate-400">
                  No audit entries match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}