// app/doctor/ipd/medicine-orders/_components/medicine-detail-drawer.tsx
"use client";

import {
  CalendarDays, CheckCircle2, Pill, PackageCheck, PackageX, UserRound, X, XCircle, PauseCircle,
} from "lucide-react";
import { PillButton } from "@/components/forms/pill-button";
import { MedicineStatusBadge, DeliveryStatusBadge } from "./medicine-status-badge";
import type { DoseGivenStatus, MedicineOrderItem } from "@/types/doctor/ipd/medicine-order-types";

interface MedicineDetailDrawerProps {
  item: MedicineOrderItem | null;
  onClose: () => void;
}

function doseIcon(status: DoseGivenStatus) {
  if (status === "Given") return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />;
  if (status === "Refused") return <XCircle className="h-3.5 w-3.5 text-red-500" />;
  if (status === "Held") return <PauseCircle className="h-3.5 w-3.5 text-amber-500" />;
  return <XCircle className="h-3.5 w-3.5 text-slate-400" />;
}

function doseTextClass(status: DoseGivenStatus) {
  if (status === "Given") return "text-emerald-700";
  if (status === "Refused") return "text-red-600";
  if (status === "Held") return "text-amber-600";
  return "text-slate-400";
}

export function MedicineDetailDrawer({ item, onClose }: MedicineDetailDrawerProps) {
  const open = Boolean(item);

  return (
    <div className={`fixed inset-0 z-50 ${open ? "pointer-events-auto" : "pointer-events-none"}`}>
      <div
        className={`absolute inset-0 bg-slate-950/35 transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
      />
      <aside
        className={`absolute right-0 top-0 h-full w-full max-w-2xl overflow-y-auto bg-white shadow-2xl transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        {item && (
          <>
            <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-200 bg-white px-5 py-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <Pill className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">{item.medicineName}</h2>
                  <p className="text-xs text-slate-500">{item.strengthForm} · {item.route} · {item.frequency}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <MedicineStatusBadge status={item.status} />
                    <span className="text-xs text-slate-400">Ordered by {item.orderedBy} · {item.orderedOn}</span>
                  </div>
                </div>
              </div>
              <PillButton variant="outline" icon={X} onClick={onClose} aria-label="Close">
                {"\u00A0"}
              </PillButton>
            </div>

            <div className="space-y-6 p-5">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <SummaryTile label="Dose" value={item.dose} />
                <SummaryTile label="Duration" value={item.duration} />
                <SummaryTile label="Start Date" value={item.startDate} />
                <SummaryTile label="End Date" value={item.endDate || "—"} />
              </div>

              <div className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2.5 text-xs text-blue-800">
                <span className="font-semibold">Instructions:</span> {item.instructions}
              </div>

              <div>
                <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <CalendarDays className="h-4 w-4 text-blue-600" />
                  Date-wise Delivery & Administration Log
                </p>

                {item.dailyLogs.length === 0 ? (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 py-10 text-center">
                    <p className="text-sm font-medium text-slate-500">No administration log yet</p>
                    <p className="mt-1 text-xs text-slate-400">Log will appear once medicine is sent to pharmacy and dispensed.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {item.dailyLogs.slice().reverse().map((log) => (
                      <div key={log.date} className="rounded-xl border border-slate-200 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="flex items-center gap-2 text-sm font-bold text-slate-800">
                            <CalendarDays className="h-4 w-4 text-slate-400" /> {log.date}
                          </p>
                          <DeliveryStatusBadge status={log.deliveryStatus} />
                        </div>

                        <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                          {log.deliveryStatus === "Not Delivered" ? (
                            <span className="flex items-center gap-1 text-red-600"><PackageX className="h-3.5 w-3.5" /> Pharmacy has not delivered medicine for this date</span>
                          ) : (
                            <span className="flex items-center gap-1 text-emerald-600"><PackageCheck className="h-3.5 w-3.5" /> Delivered by {log.deliveredBy} at {log.deliveredAt}</span>
                          )}
                        </div>

                        <div className="mt-3 space-y-2 border-t border-slate-100 pt-3">
                          {log.doses.map((dose, index) => (
                            <div key={index} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2">
                              <div className="flex items-center gap-2">
                                {doseIcon(dose.status)}
                                <span className="text-xs font-semibold text-slate-700">{dose.time} dose</span>
                                <span className={`text-xs font-medium ${doseTextClass(dose.status)}`}>{dose.status}</span>
                              </div>
                              {dose.nurseName ? (
                                <span className="flex items-center gap-1 text-xs text-slate-500">
                                  <UserRound className="h-3.5 w-3.5" /> {dose.nurseName} · {dose.givenAt}
                                </span>
                              ) : (
                                dose.remarks && <span className="text-xs text-slate-400">{dose.remarks}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}

function SummaryTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-center">
      <p className="text-[10px] text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-bold text-slate-700">{value}</p>
    </div>
  );
}