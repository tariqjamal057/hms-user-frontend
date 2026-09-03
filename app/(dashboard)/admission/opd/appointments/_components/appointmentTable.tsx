// app/admission-desk/opd/appointments/_components/appointmentTable.tsx

import { Card } from "@/components/ui/card";
import { Appointment } from "@/types/admission-desk/opd/appointment-types";
import { StatusBadge } from "./appointment-detail-drawer";
import { getEffectiveStatus } from "@/lib/admission-desk/opd/appointment-data";
import { Button } from "@/components/ui/button";
import { Eye, RefreshCw } from "lucide-react";
import { OpsActionMenu } from "@/components/operations";

export function AppointmentTable({
  appointments,
  onView,
  onReschedule,
}: {
  appointments: Appointment[];
  onView: (a: Appointment) => void;
  onReschedule: (a: Appointment) => void;
}) {
  return (
    <Card className="overflow-hidden border-slate-200 shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1050px]">
          <thead>
            <tr className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="px-5 py-4">Patient</th>
              <th className="px-5 py-4">UHID / Appointment</th>
              <th className="px-5 py-4">Type</th>
              <th className="px-5 py-4">Doctor / Specialty</th>
              <th className="px-5 py-4">Date & Slot</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {appointments.map((a) => (
              <tr key={a.id} className="hover:bg-slate-50/70">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-sm font-bold text-white">
                      {a.patient.firstName[0]}
                      {a.patient.lastName[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">
                        {a.patient.firstName} {a.patient.lastName}
                      </p>
                      <p className="text-xs text-slate-400">
                        {a.patient.age} yrs · {a.patient.gender}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 text-sm">
                  <p className="font-medium text-slate-700">{a.patient.uhid}</p>
                  <p className="text-xs text-slate-400">{a.id}</p>
                </td>
                <td className="px-5 py-4">
                  <span className="text-sm text-slate-600">
                    {a.appointmentType}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <p className="text-sm font-medium text-slate-700">
                    {a.doctor.name}
                  </p>
                  <p className="text-xs text-slate-400">{a.specialty}</p>
                </td>
                <td className="px-5 py-4 text-sm text-slate-600">
                  {a.appointmentDate}
                  <p className="text-xs text-slate-400">
                    {a.slot.period}: {a.slot.startTime}
                  </p>
                </td>
                <td className="px-5 py-4">
                  <StatusBadge status={getEffectiveStatus(a)} />
                </td>
                <td className="px-5 py-4 text-right">
                  <OpsActionMenu
                    items={[
                      {
                        label: "View",
                        icon: Eye,
                        onClick: () => onView(a),
                      },
                      ...(getEffectiveStatus(a) === "Booked" || getEffectiveStatus(a) === "Waiting"
                        ? [
                            {
                              label: "Reschedule",
                              icon: RefreshCw,
                              onClick: () => onReschedule(a),
                            } as const,
                          ]
                        : []),
                    ]}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {appointments.length === 0 && <Empty />}
    </Card>
  );
}


export function Empty() {
  return (
    <div className="col-span-full py-16 text-center text-sm text-slate-400">
      No appointments match the selected filters.
    </div>
  );
}
