// app/(dashboard)/billing/dashboard/_components/account-strip.tsx
"use client";
import { useMemo, useState } from "react";
import { ExternalLink, Search, X } from "lucide-react";
import type { BillingPatient } from "@/types/billing/ipd/billing-types";
import { computeBilling, formatCurrency } from "@/lib/billing/ipd/billing-calculations";
import { BillingStatusBadge } from "@/app/(dashboard)/billing/ipd/all-billings/_components/billing-badges";
import { matchesBillingPatientQuery } from "@/lib/billing/ipd/billing-data";

interface Props {
  patients: BillingPatient[];
  selectedUhid: string;
  onSelect: (uhid: string) => void;
  onCollect: () => void;
  onOpenPatient: () => void;
}

export function AccountStrip({
  patients,
  selectedUhid,
  onSelect,
  onCollect,
  onOpenPatient,
}: Props) {
  const [search, setSearch] = useState("");
  const patient = patients.find((p) => p.uhid === selectedUhid) ?? patients[0];

  const results = useMemo(
    () =>
      search.trim().length >= 2
        ? patients.filter((p) => matchesBillingPatientQuery(p, search)).slice(0, 5)
        : [],
    [patients, search],
  );

  if (!patient) return null;
  const computed = computeBilling(patient);
  const coverage = patient.coverage;
  const insured = Boolean(coverage && coverage.type !== "None");

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="flex flex-col gap-3 border-b border-slate-100 p-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="font-semibold text-slate-800">Patient Billing Account</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Search by UHID, encounter, invoice, mobile or claim.
          </p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && results[0]) {
                onSelect(results[0].uhid);
                setSearch("");
              }
            }}
            placeholder="Search patient, UHID, IPD, mobile..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-8 text-sm outline-none transition focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-50"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          {results.length > 0 && (
            <div className="absolute right-0 left-0 top-full z-20 mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
              {results.map((r) => (
                <button
                  key={r.uhid}
                  type="button"
                  onClick={() => {
                    onSelect(r.uhid);
                    setSearch("");
                  }}
                  className="flex w-full cursor-pointer items-center gap-3 px-3 py-2.5 text-left transition hover:bg-indigo-50"
                >
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 text-xs font-bold text-white">
                    {r.patientName.charAt(0)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-slate-800">
                      {r.patientName}
                    </span>
                    <span className="block truncate text-[10px] text-slate-400">
                      {r.uhid} · {r.ipdId} · {r.ward} · {r.bed}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 p-4 xl:grid-cols-12">
        <div className="gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 xl:col-span-5">
          <div className="flex items-start gap-3">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-indigo-100 text-lg font-bold text-indigo-700">
              {patient.patientName.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="truncate font-bold text-slate-800">{patient.patientName}</h3>
                <BillingStatusBadge status={computed.status} />
              </div>
              <div className="mt-0.5 text-xs text-slate-500">
                {patient.uhid} · {patient.ipdId} · {patient.age} / {patient.gender}
              </div>
            </div>
            <button
              type="button"
              onClick={onOpenPatient}
              title="Open full patient view"
              className="cursor-pointer rounded-lg p-2 text-slate-400 transition hover:bg-white hover:text-indigo-600"
            >
              <ExternalLink className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-400">Department</span>
              <div className="mt-1 font-medium text-slate-700">{patient.ward}</div>
            </div>
            <div>
              <span className="text-slate-400">Consultant</span>
              <div className="mt-1 font-medium text-slate-700">{patient.admittingDoctor}</div>
            </div>
            <div>
              <span className="text-slate-400">Ward / Bed</span>
              <div className="mt-1 font-medium text-slate-700">
                {patient.room} / {patient.bed}
              </div>
            </div>
            <div>
              <span className="text-slate-400">Admission</span>
              <div className="mt-1 font-medium text-slate-700">{patient.admissionDateTime}</div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 p-4 xl:col-span-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Payer &amp; Coverage</h3>
            <span className="rounded bg-indigo-50 px-2 py-1 text-[10px] font-bold text-indigo-700">
              {insured ? coverage!.type : "Self Pay"}
            </span>
          </div>
          <div className="mt-4 space-y-3 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Plan / Scheme</span>
              <b className="text-slate-700">
                {insured ? coverage!.schemeName : "—"}
              </b>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Policy / Card</span>
              <b className="font-mono text-slate-700">
                {insured ? coverage!.policyOrCardNumber : "—"}
              </b>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Coverage Approved</span>
              <b className="text-slate-700">
                {insured ? formatCurrency(coverage!.approvedAmount) : "—"}
              </b>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Received</span>
              <b className="text-emerald-700">
                {insured ? formatCurrency(coverage!.receivedAmount) : "—"}
              </b>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Approved Status</span>
              <b className="text-slate-700">{insured ? coverage!.status : "N/A"}</b>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 xl:col-span-3">
          <div className="text-xs text-slate-500">Account Summary</div>
          <div className="mt-1 text-2xl font-bold text-slate-900">
            {formatCurrency(computed.grossTotal)}
          </div>
          <div className="text-xs text-slate-500">Gross charges</div>
          <div className="mt-4 space-y-2 text-xs">
            <div className="flex justify-between">
              <span>Insurance</span>
              <b>{insured ? formatCurrency(coverage!.approvedAmount) : "—"}</b>
            </div>
            <div className="flex justify-between">
              <span>Deposit</span>
              <b>{formatCurrency(computed.totalDeposits)}</b>
            </div>
            <div className="flex justify-between">
              <span>Paid</span>
              <b className="text-emerald-700">{formatCurrency(computed.totalCollected)}</b>
            </div>
            <div className="flex justify-between">
              <span>Patient payable</span>
              <b className={computed.dueAmount > 0 ? "text-rose-600" : "text-emerald-700"}>
                {formatCurrency(computed.dueAmount)}
              </b>
            </div>
          </div>
          <button
            type="button"
            onClick={onCollect}
            className="mt-4 w-full cursor-pointer rounded-lg bg-indigo-600 py-2.5 text-xs font-semibold text-white transition hover:bg-indigo-700"
          >
            Collect Payment
          </button>
        </div>
      </div>
    </section>
  );
}