"use client";

import { useState } from "react";
import { CalendarClock, ChevronDown, FileText, Pill, Stethoscope, TestTube } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ConsultationRecord } from "@/lib/doctor/opd/opd-mock-data";

export type ConsultationHistoryTone = "blue" | "purple" | "amber" | "emerald" | "teal";

const TONE_STYLES: Record<
  ConsultationHistoryTone,
  { chip: string; dot: string; rail: string; followUp: string; statusBadge: string; headerBg: string }
> = {
  blue: {
    chip: "bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-sm shadow-blue-200",
    dot: "border-blue-300 bg-blue-100 text-blue-600",
    rail: "bg-gradient-to-b from-blue-100 via-slate-200 to-blue-100",
    followUp: "text-blue-700",
    statusBadge: "bg-emerald-100 text-emerald-700 border-emerald-200",
    headerBg: "bg-gradient-to-r from-blue-50/90 to-cyan-50/70",
  },
  purple: {
    chip: "bg-gradient-to-br from-purple-500 to-violet-500 text-white shadow-sm shadow-purple-200",
    dot: "border-purple-300 bg-purple-100 text-purple-600",
    rail: "bg-gradient-to-b from-purple-100 via-slate-200 to-purple-100",
    followUp: "text-purple-700",
    statusBadge: "bg-emerald-100 text-emerald-700 border-emerald-200",
    headerBg: "bg-gradient-to-r from-purple-50/90 to-violet-50/70",
  },
  amber: {
    chip: "bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-sm shadow-amber-200",
    dot: "border-amber-300 bg-amber-100 text-amber-600",
    rail: "bg-gradient-to-b from-amber-100 via-slate-200 to-amber-100",
    followUp: "text-amber-700",
    statusBadge: "bg-emerald-100 text-emerald-700 border-emerald-200",
    headerBg: "bg-gradient-to-r from-amber-50/90 to-orange-50/70",
  },
  emerald: {
    chip: "bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-sm shadow-emerald-200",
    dot: "border-emerald-300 bg-emerald-100 text-emerald-600",
    rail: "bg-gradient-to-b from-emerald-100 via-slate-200 to-emerald-100",
    followUp: "text-emerald-700",
    statusBadge: "bg-emerald-100 text-emerald-700 border-emerald-200",
    headerBg: "bg-gradient-to-r from-emerald-50/90 to-teal-50/70",
  },
  teal: {
    chip: "bg-gradient-to-br from-teal-500 to-cyan-500 text-white shadow-sm shadow-teal-200",
    dot: "border-teal-300 bg-teal-100 text-teal-600",
    rail: "bg-gradient-to-b from-teal-100 via-slate-200 to-teal-100",
    followUp: "text-teal-700",
    statusBadge: "bg-emerald-100 text-emerald-700 border-emerald-200",
    headerBg: "bg-gradient-to-r from-teal-50/90 to-cyan-50/70",
  },
};

const CHIP_MEDICINE = "border-purple-200 bg-purple-50 text-purple-700";
const CHIP_LAB = "border-amber-200 bg-amber-50 text-amber-700";

type ConsultationHistoryProps = {
  consultations: ConsultationRecord[];
  title?: string;
  tone?: ConsultationHistoryTone;
  showStatus?: boolean;
  defaultOpen?: boolean;
  allExpanded?: boolean;
  emptyText?: string;
  className?: string;
};

const FIELD_ICONS = {
  stethoscope: <Stethoscope className="h-3.5 w-3.5" />,
  notes: <FileText className="h-3.5 w-3.5" />,
  medicines: <Pill className="h-3.5 w-3.5" />,
  labs: <TestTube className="h-3.5 w-3.5" />,
  followUp: <CalendarClock className="h-3.5 w-3.5" />,
};

/**
 * Unified, interactive "Consultation History" timeline. Each entry is a card on
 * a vertical rail whose body is expanded by default and can be collapsed /
 * re-expanded per card via the header chevron to reveal diagnosis, clinical
 * notes, prescribed medicines/labs chips and the follow-up. Supports
 * customization via `tone`, `title`, `showStatus`, `defaultOpen` (open all by
 * default) and `allExpanded` (force all open, disable toggling).
 */
export function ConsultationHistory({
  consultations,
  title = "Consultation History",
  tone = "blue",
  showStatus = true,
  defaultOpen = true,
  allExpanded = false,
  emptyText = "No previous consultations recorded for this patient",
  className,
}: ConsultationHistoryProps) {
  const [openSet, setOpenSet] = useState<Set<number>>(
    () => new Set(
      consultations
        .map((_, i) => i)
        .slice(0, allExpanded || defaultOpen ? consultations.length : 0),
    ),
  );
  const style = TONE_STYLES[tone];

  const toggle = (idx: number) =>
    setOpenSet((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });

  if (consultations.length === 0) {
    return (
      <Card className={cn("border-slate-200", className)}>
        <CardContent className="p-8 text-center">
          <FileText className="mx-auto h-6 w-6 text-slate-300" />
          <p className="mt-2 text-sm text-slate-400">{emptyText}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("border-slate-200", className)}>
      <CardContent className="p-4 sm:p-5">
        <div className="mb-4 flex items-center justify-between gap-2">
          <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800 sm:text-base">
            <span className={cn("flex h-7 w-7 items-center justify-center rounded-lg", style.chip)}>
              <FileText className="h-4 w-4" />
            </span>
            {title}
          </h3>
          <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
            {consultations.length} visit{consultations.length > 1 ? "s" : ""}
          </span>
        </div>

        <ol className="relative ml-2 space-y-4 border-l-2 border-slate-100 pl-4 sm:pl-6 sm:space-y-5">
          {consultations.map((consult, idx) => {
            const isOpen = allExpanded || openSet.has(idx);
            return (
              <li key={`${consult.date}-${idx}`} className="relative">
                <span
                  className={cn(
                    "absolute -left-[27px] top-4 flex h-5 w-5 items-center justify-center rounded-full border-2 bg-white text-[10px] font-bold sm:-left-[37px] sm:h-6 sm:w-6 sm:text-xs",
                    style.dot,
                  )}
                >
                  {idx + 1}
                </span>

                <div
                  className={cn(
                    "overflow-hidden rounded-xl border border-slate-200 bg-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
                    isOpen && "ring-1 ring-slate-200 shadow-md",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => !allExpanded && toggle(idx)}
                    disabled={allExpanded}
                    className={cn(
                      "flex w-full items-center justify-between gap-3 px-3 py-3 text-left transition-colors sm:px-4",
                      style.headerBg,
                      allExpanded ? "cursor-default" : "cursor-pointer hover:brightness-[0.98]",
                    )}
                    aria-expanded={isOpen}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white shadow-sm sm:h-10 sm:w-10", style.chip)}>
                        <Stethoscope className="h-4 w-4 sm:h-5 sm:w-5" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-800 sm:text-base">{consult.date}</p>
                        <p className="flex items-center gap-1 truncate text-xs text-slate-500">
                          <span className={cn("inline-block h-1.5 w-1.5 rounded-full", style.dot)} />
                          {consult.doctor}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {showStatus && (
                        <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-semibold", style.statusBadge)}>
                          Completed
                        </span>
                      )}
                      {!allExpanded && (
                        <ChevronDown
                          className={cn("h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200", isOpen && "rotate-180")}
                        />
                      )}
                    </div>
                  </button>

                  <div
                    className={cn(
                      "grid overflow-hidden transition-all duration-300",
                      isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                    )}
                  >
                    <div className="min-h-0">
                      <div className="space-y-4 border-t border-slate-100 px-3 py-3 sm:px-4 sm:py-4">
                        <Field icon={FIELD_ICONS.stethoscope} label="Diagnosis" iconCls="bg-red-50 text-red-600">
                          <p className="text-sm font-semibold text-slate-800">{consult.diagnosis}</p>
                        </Field>

                        <Field icon={FIELD_ICONS.notes} label="Clinical Notes" iconCls="bg-sky-50 text-sky-600">
                          <p className="text-sm leading-relaxed text-slate-600">{consult.notes}</p>
                        </Field>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <Field icon={FIELD_ICONS.medicines} label="Medicines Prescribed" iconCls="bg-purple-50 text-purple-600">
                            <div className="flex flex-wrap gap-1.5">
                              {consult.medicines.map((med, i) => (
                                <span key={i} className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-transform duration-150 hover:-translate-y-0.5", CHIP_MEDICINE)}>
                                  {med}
                                </span>
                              ))}
                            </div>
                          </Field>
                          <Field icon={FIELD_ICONS.labs} label="Lab Orders" iconCls="bg-amber-50 text-amber-600">
                            <div className="flex flex-wrap gap-1.5">
                              {consult.labs.map((lab, i) => (
                                <span key={i} className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-transform duration-150 hover:-translate-y-0.5", CHIP_LAB)}>
                                  {lab}
                                </span>
                              ))}
                            </div>
                          </Field>
                        </div>

                        <div className="flex items-center gap-2 border-t border-slate-100 pt-3">
                          <span className={cn("flex h-6 w-6 items-center justify-center rounded-lg", style.dot)}>
                            {FIELD_ICONS.followUp}
                          </span>
                          <p className="text-xs text-slate-500">Follow-up</p>
                          <p className={cn("ml-auto text-sm font-semibold", style.followUp)}>{consult.followUp}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
}

function Field({
  icon,
  label,
  iconCls,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  iconCls: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        <span className={cn("flex h-5 w-5 items-center justify-center rounded-md", iconCls)}>
          {icon}
        </span>
        {label}
      </p>
      {children}
    </div>
  );
}
