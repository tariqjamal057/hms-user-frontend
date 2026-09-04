//app/doctor/ipd/investigation-orders/_components/investigation-view-dialog.tsx
"use client";

import {
  Download,
  FileImage,
  FlaskConical,
  Radio,
  X,
  CheckCircle2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PillButton } from "@/components/forms/pill-button";
import { Separator } from "@/components/ui/separator";
import {
  InvestigationStatusBadge,
  PathologyResultBadge,
} from "./investigation-status-badge";
import type { InvestigationOrderItem } from "@/types/doctor/ipd/investigation-order-types";

interface InvestigationViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: InvestigationOrderItem | null;
}

export function InvestigationViewDialog({
  open,
  onOpenChange,
  item,
}: InvestigationViewDialogProps) {
  const isReady = item?.status === "Report Ready";
  const isPathology = item?.department === "Pathology";

  return (
    <div
      className={`fixed inset-0 z-50 ${
        open ? "pointer-events-auto" : "pointer-events-none"
      }`}
    >
      <div
        className={`absolute inset-0 bg-slate-950/35 transition-opacity ${
          open ? "opacity-100" : "opacity-0"
        }`}
        onClick={() => onOpenChange(false)}
      />

      <aside
        className={`absolute right-0 top-0 h-full w-full max-w-2xl overflow-y-auto bg-white shadow-2xl transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {item && (
          <>
            <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-200 bg-white px-5 py-4">
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                    isPathology
                      ? "bg-blue-50 text-blue-600"
                      : "bg-violet-50 text-violet-600"
                  }`}
                >
                  {isPathology ? (
                    <FlaskConical className="h-5 w-5" />
                  ) : (
                    <Radio className="h-5 w-5" />
                  )}
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-800">
                    {item.investigationName}
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    {item.department} · {item.category} · Ordered by{" "}
                    {item.orderedBy}
                  </p>

                  <div className="mt-2 flex flex-wrap gap-2">
                    <InvestigationStatusBadge status={item.status} />

                    <Badge
                      variant="outline"
                      className={
                        item.priority === "Urgent"
                          ? "border-red-200 bg-red-50 text-red-700"
                          : "border-slate-200 text-slate-600"
                      }
                    >
                      {item.priority}
                    </Badge>
                  </div>
                </div>
              </div>

              <PillButton
                variant="outline"
                onClick={() => onOpenChange(false)}
                icon={X}
              >{""}</PillButton>
            </div>

            <div className="space-y-6 p-5">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Info label="Sample" value={item.sample} />
                <Info label="Order Date" value={item.orderDate} />
                <Info label="Expected Report" value={item.expectedReportTime} />
                <Info label="Status" value={item.status} />
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold text-slate-500">
                  Clinical Indication
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  {item.indication || "No indication documented."}
                </p>

                {item.additionalInstructions && (
                  <>
                    <Separator className="my-3" />
                    <p className="text-xs font-semibold text-slate-500">
                      Additional Instructions
                    </p>
                    <p className="mt-1 text-sm text-slate-700">
                      {item.additionalInstructions}
                    </p>
                  </>
                )}
              </div>

              {!isReady && (
                <div className="rounded-xl border border-blue-100 bg-blue-50 p-5 text-center">
                  <CheckCircle2 className="mx-auto h-8 w-8 text-blue-500" />
                  <p className="mt-3 font-semibold text-blue-900">
                    Report is not ready yet
                  </p>
                  <p className="mt-1 text-sm text-blue-700">
                    Current status: {item.status}. The department will update
                    the report once processing is complete.
                  </p>
                </div>
              )}

              {isReady && isPathology && (
                <PathologyReport item={item} />
              )}

              {isReady && !isPathology && (
                <RadiologyReport item={item} />
              )}
            </div>
          </>
        )}
      </aside>
    </div>
  );
}

function PathologyReport({ item }: { item: InvestigationOrderItem }) {
  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <FlaskConical className="h-5 w-5 text-blue-600" />
        <h3 className="font-bold text-slate-800">Pathology Result</h3>
      </div>

      {item.pathologyResults && item.pathologyResults.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500">
                  Parameter
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500">
                  Result
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500">
                  Reference Range
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500">
                  Status
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {item.pathologyResults.map((result) => (
                <tr key={result.parameter}>
                  <td className="px-3 py-3 font-medium text-slate-700">
                    {result.parameter}
                  </td>
                  <td className="px-3 py-3 text-slate-700">
                    {result.result} {result.unit}
                  </td>
                  <td className="px-3 py-3 text-slate-500">
                    {result.referenceRange}
                  </td>
                  <td className="px-3 py-3">
                    <PathologyResultBadge status={result.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ReportFile item={item} />
    </section>
  );
}

function RadiologyReport({ item }: { item: InvestigationOrderItem }) {
  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <Radio className="h-5 w-5 text-violet-600" />
        <h3 className="font-bold text-slate-800">Radiology Report</h3>
      </div>

      <div className="rounded-xl border border-violet-100 bg-violet-50/60 p-4">
        <p className="text-xs font-semibold text-violet-700">
          Report Summary
        </p>

        <p className="mt-2 text-sm leading-6 text-slate-700">
          {item.reportSummary || "Radiology report uploaded by department."}
        </p>
      </div>

      <ReportFile item={item} />
    </section>
  );
}

function ReportFile({ item }: { item: InvestigationOrderItem }) {
  if (!item.reportFileName) return null;

  return (
    <div className="mt-4 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-red-600">
          <FileImage className="h-5 w-5" />
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-800">
            {item.reportFileName}
          </p>
          <p className="text-xs text-slate-400">
            Uploaded by {item.reportUploadedBy} · {item.reportUploadedOn}
          </p>
        </div>
      </div>

      <PillButton
        variant="outline"
        className="gap-2 border-blue-200 text-blue-600"
        onClick={() => {
          if (item.reportFileUrl && item.reportFileUrl !== "#") {
            window.open(item.reportFileUrl, "_blank", "noopener,noreferrer");
          }
        }}
        icon={Download}
      >
        Download Result
      </PillButton>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <p className="text-[10px] text-slate-400">{label}</p>
      <p className="mt-1 text-xs font-semibold text-slate-700">{value}</p>
    </div>
  );
}