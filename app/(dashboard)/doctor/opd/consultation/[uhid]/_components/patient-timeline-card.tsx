"use client";

import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays, ChevronRight, Stethoscope, FlaskConical, Activity } from "lucide-react";
import type { PatientFullProfile } from "@/lib/doctor/opd/opd-mock-data";

interface PatientTimelineCardProps {
  patient: PatientFullProfile;
  onViewFullHistory: () => void;
}

const DOT_STYLES: Record<string, { dot: string; icon: typeof Activity; tint: string; label: string }> = {
  consultation: { dot: "bg-blue-500", icon: Stethoscope, tint: "bg-blue-50 text-blue-600", label: "Consultation" },
  lab: { dot: "bg-emerald-500", icon: FlaskConical, tint: "bg-emerald-50 text-emerald-600", label: "Lab Report" },
  vitals: { dot: "bg-amber-500", icon: Activity, tint: "bg-amber-50 text-amber-600", label: "Vitals" },
};

function formatDate(date: string): { day: string; month: string } {
  try {
    const d = new Date(date);
    return { day: String(d.getDate()).padStart(2, "0"), month: d.toLocaleString("en", { month: "short" }) };
  } catch {
    return { day: date, month: "" };
  }
}

export function PatientTimelineCard({ patient, onViewFullHistory }: PatientTimelineCardProps) {
  const timelineEvents = [
    ...(patient.consultationHistory || []).map((c) => ({
      date: c.date,
      event: c.diagnosis,
      subtext: `Dr. ${c.doctor}`,
      type: "consultation" as const,
    })),
    ...(patient.labHistory || []).slice(0, 2).map((l) => ({
      date: l.date,
      event: l.test,
      subtext: `${l.result} (${l.status || "Completed"})`,
      type: "lab" as const,
    })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 4);

  return (
    <Card className="border-slate-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-slate-800 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
              <CalendarDays className="w-4 h-4 text-blue-500" />
            </span>
            Patient Timeline
          </h2>
          <button
            onClick={onViewFullHistory}
            className="text-blue-600 hover:text-blue-700 text-xs font-semibold flex items-center gap-0.5 group"
          >
            <span>Full History</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {timelineEvents.length > 0 ? (
          <ol className="relative space-y-3 border-l-2 border-slate-200 pl-3">
            {timelineEvents.map((item, idx) => {
              const style = DOT_STYLES[item.type] ?? DOT_STYLES.consultation;
              const Icon = style.icon;
              const { day, month } = formatDate(item.date);
              return (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className={`w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0 ${style.dot} ring-2 ring-white`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-700">{item.event}</p>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                      <span className={`inline-flex items-center gap-1 ${style.tint} rounded-md px-1.5 py-0.5 font-semibold`}>
                        <Icon className="w-3 h-3" />
                        {style.label}
                      </span>
                      {item.subtext && <span className="truncate text-slate-400">{item.subtext}</span>}
                    </div>
                  </div>
                  {month && (
                    <span className="text-[10px] font-semibold text-slate-400 leading-none text-right w-8">
                      {day}
                      <span className="block text-[9px] text-slate-400">{month}</span>
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 text-center py-4">
            <Activity className="w-5 h-5 text-slate-400 mx-auto" />
            <p className="text-sm text-slate-400 mt-1.5">No previous clinical events</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}