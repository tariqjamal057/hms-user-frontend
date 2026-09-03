"use client";

import { MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CancelStatusBadge, getCancelBorderStyle } from "./cancel-status-badge";
import { cn } from "@/lib/utils";
import type { CancelledAdmissionRecord } from "@/types/cancel-admission-types";

interface CancelListRowProps {
  record: CancelledAdmissionRecord;
  isSelected: boolean;
  onSelect: (r: CancelledAdmissionRecord) => void;
}

export function CancelListRow({
  record,
  isSelected,
  onSelect,
}: CancelListRowProps) {
  return (
    <div
      onClick={() => onSelect(record)}
      className={cn(
        "grid w-full grid-cols-1 gap-2 border-l-4 px-4 py-3.5 text-left transition-colors hover:bg-slate-50 sm:grid-cols-[100px_140px_110px_130px_150px_1fr_100px_28px] sm:items-center sm:gap-3",
        getCancelBorderStyle(record.status),
        isSelected ? "bg-blue-50/70" : "bg-white",
      )}
    >
      <div>
        <p className="text-sm font-semibold text-blue-600">
          {record.requestId}
        </p>
        <p className="text-xs text-slate-400">{record.uhid}</p>
      </div>
      <div>
        <p className="text-sm font-medium text-slate-800">
          {record.patientName}
        </p>
        <p className="text-xs text-slate-400">
          {record.age} Y / {record.gender}
        </p>
        <p className="text-xs text-slate-400">{record.mobile}</p>
      </div>
      <p className="text-sm text-slate-600">{record.department}</p>
      <div>
        <p className="text-sm text-slate-700">
          {record.cancelledOnDateTime.split(",")[0]}
        </p>
        <p className="text-xs text-slate-400">
          {record.cancelledOnDateTime.split(",")[1]}
        </p>
      </div>
      <div>
        <p className="text-sm text-slate-700">{record.cancelledBy}</p>
        <p className="text-xs text-slate-400">{record.cancelledByName}</p>
      </div>
      <p className="text-sm text-slate-600">{record.reason}</p>
      <div>
        <CancelStatusBadge status={record.status} />
      </div>
      <div className="flex justify-end">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-slate-400"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
