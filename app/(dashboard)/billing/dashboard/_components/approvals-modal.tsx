// app/(dashboard)/billing/dashboard/_components/approvals-modal.tsx
"use client";
import {
  Check,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ApprovalKind, ApprovalRequest } from "@/types/billing/ipd/billing-types";
import { formatCurrency } from "@/lib/billing/ipd/billing-calculations";

const KIND_STYLE: Record<ApprovalKind, string> = {
  Refund: "border-amber-200 bg-amber-50 text-amber-700",
  Discount: "border-violet-200 bg-violet-50 text-violet-700",
  "Write-Off": "border-rose-200 bg-rose-50 text-rose-700",
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requests: ApprovalRequest[];
  onResolve: (id: string, status: "Approved" | "Rejected") => void;
}

export function ApprovalsModal({ open, onOpenChange, requests, onResolve }: Props) {
  const pending = requests.filter((r) => r.status === "Pending");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-amber-600" />
            Approval Workbench
          </DialogTitle>
          <DialogDescription>
            High-value refunds, discounts and write-offs require sign-off before
            they are finalized. {pending.length} pending.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[420px] space-y-2.5 overflow-y-auto pr-1">
          {requests.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-200 py-10 text-center text-sm text-slate-400">
              No approval requests. Everything is settled.
            </div>
          )}
          {requests.map((request) => {
            const resolved = request.status !== "Pending";
            return (
              <div
                key={request.id}
                className={`rounded-xl border p-3.5 ${
                  resolved ? "border-slate-200 bg-slate-50/60" : "border-slate-200 bg-white"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${KIND_STYLE[request.kind]}`}
                      >
                        {request.kind}
                      </span>
                      <span className="text-sm font-bold text-slate-800">
                        {formatCurrency(request.amount)}
                      </span>
                      {resolved && (
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            request.status === "Approved"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-rose-50 text-rose-700"
                          }`}
                        >
                          {request.status === "Approved" ? (
                            <ShieldCheck className="h-3 w-3" />
                          ) : (
                            <ShieldX className="h-3 w-3" />
                          )}
                          {request.status}
                        </span>
                      )}
                    </div>
                    <p className="mt-1.5 text-xs font-semibold text-slate-700">
                      {request.patientName}
                      <span className="ml-1.5 font-mono text-[10px] font-normal text-slate-400">
                        {request.ipdId}
                      </span>
                    </p>
                    <p className="mt-0.5 text-xs leading-5 text-slate-500">
                      {request.reason}
                    </p>
                    <p className="mt-1 text-[10px] text-slate-400">
                      {request.requestedBy} · {request.date}
                    </p>
                  </div>
                </div>

                {!resolved && (
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => onResolve(request.id, "Approved")}
                      className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700"
                    >
                      <Check className="h-3.5 w-3.5" /> Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => onResolve(request.id, "Rejected")}
                      className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
                    >
                      <X className="h-3.5 w-3.5" /> Reject
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <DialogFooter>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="cursor-pointer rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            Close
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}