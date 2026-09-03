
"use client";

import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OpsActionButton } from "@/components/operations";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { AvailabilityStatusBadge, getAvailabilityStatus } from "./availability-status-badge";
import { DEPARTMENT_ICONS } from "@/lib/bed-availability-data";
import type { DepartmentBedAvailability } from "@/types/bed-availability-types";

interface BedAvailabilityTableProps {
  records: DepartmentBedAvailability[];
  onViewDetails: (r: DepartmentBedAvailability) => void;
}

function progressBarColor(pct: number) {
  if (pct >= 20) return "bg-emerald-500";
  if (pct >= 10) return "bg-amber-500";
  return "bg-red-500";
}

export function BedAvailabilityTable({ records, onViewDetails }: BedAvailabilityTableProps) {
  const totals = records.reduce(
    (acc, r) => ({
      totalBeds: acc.totalBeds + r.totalBeds,
      occupied: acc.occupied + r.occupied,
      available: acc.available + r.available,
      blocked: acc.blocked + r.blocked,
    }),
    { totalBeds: 0, occupied: 0, available: 0, blocked: 0 }
  );
  const totalAvailabilityPct = totals.totalBeds ? (totals.available / totals.totalBeds) * 100 : 0;

  return (
    <>
      {/* Desktop table */}
      <div className="hidden overflow-x-auto xl:block">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 hover:bg-slate-50">
              <TableHead>Department</TableHead>
              <TableHead>Ward / Unit</TableHead>
              <TableHead>Floor</TableHead>
              <TableHead>Bed Type</TableHead>
              <TableHead className="text-right">Total Beds</TableHead>
              <TableHead className="text-right">Occupied</TableHead>
              <TableHead className="text-right">Available</TableHead>
              <TableHead className="text-right">Blocked</TableHead>
              <TableHead>Availability %</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((r) => {
              const pct = r.totalBeds ? (r.available / r.totalBeds) * 100 : 0;
              const status = getAvailabilityStatus(pct);
              return (
                <TableRow key={r.department} className="hover:bg-slate-50/60">
                  <TableCell>
                    <span className="flex items-center gap-2 font-medium text-slate-800">
                      <span className="text-base">{DEPARTMENT_ICONS[r.department] ?? "🏨"}</span>
                      {r.department}
                    </span>
                  </TableCell>
                  <TableCell className="text-slate-500">{r.wardUnit}</TableCell>
                  <TableCell className="whitespace-nowrap text-slate-500">{r.floor}</TableCell>
                  <TableCell className="text-slate-500">{r.bedType}</TableCell>
                  <TableCell className="text-right font-medium text-slate-700">{r.totalBeds}</TableCell>
                  <TableCell className="text-right text-slate-700">{r.occupied}</TableCell>
                  <TableCell className="text-right font-semibold text-emerald-600">{r.available}</TableCell>
                  <TableCell className="text-right text-slate-500">{r.blocked}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={pct} className="h-1.5 w-20" indicatorClassName={progressBarColor(pct)} />
                      <span className="w-12 shrink-0 text-xs font-medium text-slate-600">{pct.toFixed(2)}%</span>
                    </div>
                  </TableCell>
                  <TableCell><AvailabilityStatusBadge status={status} /></TableCell>
                  <TableCell className="text-right">
                    <OpsActionButton label="View" icon={Eye} onClick={() => onViewDetails(r)} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
          <TableFooter>
            <TableRow className="bg-slate-50 font-semibold hover:bg-slate-50">
              <TableCell colSpan={4}>Total</TableCell>
              <TableCell className="text-right">{totals.totalBeds}</TableCell>
              <TableCell className="text-right">{totals.occupied}</TableCell>
              <TableCell className="text-right text-emerald-600">{totals.available}</TableCell>
              <TableCell className="text-right">{totals.blocked}</TableCell>
              <TableCell className="text-slate-700">{totalAvailabilityPct.toFixed(2)}%</TableCell>
              <TableCell colSpan={2} />
            </TableRow>
          </TableFooter>
        </Table>
      </div>

      {/* Mobile / tablet cards */}
      <div className="space-y-3 p-4 xl:hidden">
        {records.map((r) => {
          const pct = r.totalBeds ? (r.available / r.totalBeds) * 100 : 0;
          const status = getAvailabilityStatus(pct);
          return (
            <div key={r.department} className="rounded-lg border border-slate-200 p-4">
              <div className="mb-2 flex items-start justify-between">
                <div>
                  <p className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                    <span>{DEPARTMENT_ICONS[r.department] ?? "🏨"}</span> {r.department}
                  </p>
                  <p className="text-xs text-slate-400">{r.wardUnit} · {r.floor}</p>
                </div>
                <AvailabilityStatusBadge status={status} />
              </div>
              <div className="mb-3 grid grid-cols-4 gap-2 text-center text-xs">
                <div><p className="font-bold text-slate-800">{r.totalBeds}</p><p className="text-slate-400">Total</p></div>
                <div><p className="font-bold text-slate-700">{r.occupied}</p><p className="text-slate-400">Occupied</p></div>
                <div><p className="font-bold text-emerald-600">{r.available}</p><p className="text-slate-400">Available</p></div>
                <div><p className="font-bold text-slate-500">{r.blocked}</p><p className="text-slate-400">Blocked</p></div>
              </div>
              <div className="mb-3 flex items-center gap-2">
                <Progress value={pct} className="h-1.5 flex-1" indicatorClassName={progressBarColor(pct)} />
                <span className="text-xs font-medium text-slate-600">{pct.toFixed(2)}%</span>
              </div>
              <div className="flex justify-end border-t border-slate-100 pt-2">
                <OpsActionButton label="View Details" icon={Eye} onClick={() => onViewDetails(r)} />
              </div>
            </div>
          );
        })}

        <div className="rounded-lg bg-slate-50 px-4 py-3 text-sm">
          <div className="grid grid-cols-2 gap-y-1">
            <span className="text-slate-500">Total Beds</span><span className="text-right font-semibold">{totals.totalBeds}</span>
            <span className="text-slate-500">Occupied</span><span className="text-right font-semibold">{totals.occupied}</span>
            <span className="text-slate-500">Available</span><span className="text-right font-semibold text-emerald-600">{totals.available}</span>
            <span className="text-slate-500">Availability %</span><span className="text-right font-semibold">{totalAvailabilityPct.toFixed(2)}%</span>
          </div>
        </div>
      </div>
    </>
  );
}