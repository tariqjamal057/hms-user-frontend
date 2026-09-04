// app/(dashboard)/doctor/ipd/clinical-overview/[uhid]/_components/clinical-overview-tabs.tsx
"use client";

import {
  Activity, Ban, CheckCircle2, ClipboardList, Clock, FileText,
  HeartPulse, PauseCircle, Pill, Stethoscope, TestTube,
  User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { WardRoundPatient } from "@/types/doctor/ipd/ward-round-types";

function getMedicineStatusBadge(status: string) {
  const variants: Record<string, { color: string; icon: React.ReactNode }> = {
    Given: { color: "bg-green-50 text-green-700 border-green-200", icon: <CheckCircle2 className="w-3 h-3 mr-1" /> },
    Pending: { color: "bg-amber-50 text-amber-700 border-amber-200", icon: <Clock className="w-3 h-3 mr-1" /> },
    Held: { color: "bg-orange-50 text-orange-700 border-orange-200", icon: <PauseCircle className="w-3 h-3 mr-1" /> },
    Discontinued: { color: "bg-red-50 text-red-700 border-red-200", icon: <Ban className="w-3 h-3 mr-1" /> },
  };
  return variants[status] || variants.Pending;
}

function getLabStatusBadge(status: string) {
  const variants: Record<string, string> = {
    Ordered: "bg-slate-100 text-slate-700 border-slate-200",
    "Sample Collected": "bg-blue-50 text-blue-700 border-blue-200",
    "In Progress": "bg-amber-50 text-amber-700 border-amber-200",
    "Result Ready": "bg-purple-50 text-purple-700 border-purple-200",
    Reviewed: "bg-green-50 text-green-700 border-green-200",
  };
  return variants[status] || variants.Ordered;
}

function getLogIcon(type: string) {
  const icons: Record<string, React.ReactNode> = {
    Vitals: <HeartPulse className="w-4 h-4 text-red-500" />,
    Medicine: <Pill className="w-4 h-4 text-purple-500" />,
    Lab: <TestTube className="w-4 h-4 text-amber-500" />,
    Note: <FileText className="w-4 h-4 text-blue-500" />,
    Diagnosis: <ClipboardList className="w-4 h-4 text-cyan-500" />,
    Nursing: <User className="w-4 h-4 text-teal-500" />,
    "Doctor Round": <Stethoscope className="w-4 h-4 text-indigo-500" />,
  };
  return icons[type] || <FileText className="w-4 h-4 text-slate-400" />;
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}>
      {children}
    </div>
  );
}

export function OverviewMedicinesTab({ patient }: { patient: WardRoundPatient }) {
  const given = patient.medicines?.filter((m) => m.status === "Given") || [];
  const pending = patient.medicines?.filter((m) => m.status === "Pending") || [];
  const other = patient.medicines?.filter((m) => m.status === "Held" || m.status === "Discontinued") || [];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <h3 className="font-bold text-slate-800">Given by Nurse</h3>
            <Badge className="bg-green-100 text-green-700 ml-auto">{given.length}</Badge>
          </div>
          {given.length > 0 ? (
            <div className="space-y-2">
              {given.map((med) => (
                <div key={med.id} className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold text-slate-800">{med.name}</p>
                    <Badge className={getMedicineStatusBadge(med.status).color}>
                      {getMedicineStatusBadge(med.status).icon}
                      {med.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500">{med.dosage} • {med.route} • {med.frequency}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Given by {med.givenBy} at {med.givenAt} • Ordered by {med.orderedBy}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400 text-center py-6">No medicines given yet</p>
          )}
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-slate-800">Pending / Not Given</h3>
            <Badge className="bg-amber-100 text-amber-700 ml-auto">{pending.length}</Badge>
          </div>
          {pending.length > 0 ? (
            <div className="space-y-2">
              {pending.map((med) => (
                <div key={med.id} className="p-3 rounded-lg border border-amber-200 bg-amber-50/50">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold text-slate-800">{med.name}</p>
                    <Badge className={getMedicineStatusBadge(med.status).color}>
                      {getMedicineStatusBadge(med.status).icon}
                      {med.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500">{med.dosage} • {med.route} • {med.frequency}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Scheduled: {med.scheduledTime} • Ordered by {med.orderedBy}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400 text-center py-6">No pending medicines</p>
          )}
        </Card>
      </div>

      {other.length > 0 && (
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Ban className="w-5 h-5 text-slate-400" />
            <h3 className="font-bold text-slate-800">Held / Discontinued</h3>
          </div>
          <div className="space-y-2">
            {other.map((med) => (
              <div key={med.id} className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-700">{med.name}</p>
                  <Badge className={getMedicineStatusBadge(med.status).color}>
                    {getMedicineStatusBadge(med.status).icon}
                    {med.status}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 mt-1">{med.dosage} • {med.route} • {med.frequency}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

export function OverviewLabsTab({ patient }: { patient: WardRoundPatient }) {
  const labs = patient.labReports || [];
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 mb-4">
        <TestTube className="w-5 h-5 text-amber-500" />
        <h3 className="font-bold text-slate-800">Lab & Investigation Reports</h3>
      </div>
      {labs.length > 0 ? (
        <div className="space-y-3">
          {labs.map((lab) => (
            <div
              key={lab.id}
              className={`p-4 rounded-xl border ${lab.isAbnormal ? "border-red-200 bg-red-50/40" : "border-slate-200 bg-slate-50"}`}
            >
              <div className="flex items-start justify-between mb-2 flex-wrap gap-2">
                <div>
                  <p className="font-semibold text-slate-800">{lab.testName}</p>
                  <p className="text-xs text-slate-500">{lab.category}</p>
                </div>
                <Badge className={getLabStatusBadge(lab.status)}>{lab.status}</Badge>
              </div>
              {lab.result && (
                <p className={`text-sm font-medium mt-2 ${lab.isAbnormal ? "text-red-700" : "text-slate-700"}`}>
                  Result: {lab.result}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500">
                <span>Ordered: {lab.orderedOn}</span>
                {lab.resultOn && <span>• Result: {lab.resultOn}</span>}
                <span>• By {lab.orderedBy}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-400 text-center py-8">No lab reports recorded for this patient</p>
      )}
    </Card>
  );
}

export function OverviewVitalsTab({ patient }: { patient: WardRoundPatient }) {
  const history = patient.vitalsHistory || [];
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-5 h-5 text-blue-500" />
        <h3 className="font-bold text-slate-800">Vitals Trend History</h3>
      </div>
      {history.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600">Recorded On</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600">BP</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600">Pulse</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600">Temp</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600">RR</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600">SpO₂</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600">Pain</th>
              </tr>
            </thead>
            <tbody>
              {history.map((v, idx) => (
                <tr key={idx} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-3 font-semibold text-slate-700">{v.recordedOn}</td>
                  <td className="px-4 py-3 text-slate-600">{v.bp} mmHg</td>
                  <td className="px-4 py-3 text-slate-600">{v.pulse} /min</td>
                  <td className="px-4 py-3 text-slate-600">{v.temp} °F</td>
                  <td className="px-4 py-3 text-slate-600">{v.rr} /min</td>
                  <td className="px-4 py-3 text-slate-600">{v.spo2}%</td>
                  <td className="px-4 py-3 text-slate-600">{v.pain}/10</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-sm text-slate-400 text-center py-8">No vitals history recorded</p>
      )}
    </Card>
  );
}

export function OverviewLogsTab({ patient }: { patient: WardRoundPatient }) {
  const logs = patient.clinicalLogs || [];
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 mb-4">
        <ClipboardList className="w-5 h-5 text-cyan-500" />
        <h3 className="font-bold text-slate-800">Clinical Activity Log</h3>
      </div>
      {logs.length > 0 ? (
        <div className="space-y-3">
          {logs.map((log) => (
            <div key={log.id} className="flex gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50">
              <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center flex-shrink-0">
                {getLogIcon(log.type)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <p className="text-sm font-semibold text-slate-800">{log.title}</p>
                  <Badge className="bg-slate-100 text-slate-600">{log.type}</Badge>
                </div>
                <p className="text-sm text-slate-600 mt-1">{log.description}</p>
                <p className="text-xs text-slate-400 mt-1.5">{log.timestamp} • {log.recordedBy}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-400 text-center py-8">No clinical logs recorded</p>
      )}
    </Card>
  );
}
