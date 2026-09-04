// app/(dashboard)/billing/ipd/_components/drawer/section-coverage.tsx
import {
  CheckCircle2,
  Clock3,
  HeartHandshake,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { InfoTileCard } from "@/components/patient-detail/info-tile-card";
import { InfoAlertCard } from "@/components/patient-detail/info-alert-card";
import type {
  CoverageDetails,
  CoverageStatus,
} from "@/types/billing/ipd/billing-types";
import { formatCurrency } from "@/lib/billing/ipd/billing-calculations";

const statusStyle: Record<
  CoverageStatus,
  { cls: string; icon: React.ElementType; tone: "emerald" | "amber" | "red" | "blue" | "slate" }
> = {
  Approved: { cls: "border-blue-200 bg-blue-50 text-blue-700", icon: ShieldCheck, tone: "blue" },
  "Partially Received": {
    cls: "border-amber-200 bg-amber-50 text-amber-700",
    icon: Clock3,
    tone: "amber",
  },
  "Fully Received": {
    cls: "border-emerald-200 bg-emerald-50 text-emerald-700",
    icon: CheckCircle2,
    tone: "emerald",
  },
  Pending: { cls: "border-slate-200 bg-slate-50 text-slate-500", icon: Clock3, tone: "slate" },
  Rejected: { cls: "border-red-200 bg-red-50 text-red-700", icon: XCircle, tone: "red" },
};

export function SectionCoverage({
  netPayable,
  coverage,
}: {
  netPayable: number;
  coverage?: CoverageDetails;
}) {
  if (!coverage || coverage.type === "None") {
    return (
      <div className="space-y-4">
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-50 via-white to-blue-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-sm">
              <HeartHandshake className="h-5 w-5" />
            </span>
            <div>
              <p className="text-lg font-bold tracking-tight text-slate-800">
                Ayushman / Insurance
              </p>
              <p className="text-xs text-slate-500">
                Coverage and insurance scheme information for this patient.
              </p>
            </div>
          </div>
        </div>
        <InfoAlertCard
          tone="slate"
          icon={<HeartHandshake className="h-3.5 w-3.5" />}
          title="No coverage linked"
          body="No Ayushman Bharat card or insurance policy is linked to this patient. Full net payable amount is the patient's responsibility."
        />
      </div>
    );
  }

  const remaining = Math.max(0, coverage.approvedAmount - coverage.receivedAmount);
  const { cls, icon: Icon, tone } = statusStyle[coverage.status];
  const patientPortion = Math.max(0, netPayable - coverage.receivedAmount);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 via-white to-cyan-50 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-sm">
            <HeartHandshake className="h-5 w-5" />
          </span>
          <div>
            <p className="text-lg font-bold tracking-tight text-slate-800">
              {coverage.type} Coverage
            </p>
            <p className="text-xs text-slate-500">
              Scheme / insurer: <span className="font-semibold text-slate-700">{coverage.schemeName}</span>
            </p>
          </div>
        </div>
        <Badge variant="outline" className={`gap-1 self-start sm:self-auto ${cls}`}>
          <Icon className="h-3 w-3" />
          {coverage.status}
        </Badge>
      </div>

      {/* Scheme details */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="mb-3 text-sm font-bold text-slate-800">Scheme Details</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <InfoTileCard
            title="Scheme / Insurer"
            tone="blue"
            value={coverage.schemeName}
            subtitle="Coverage provider"
          />
          <InfoTileCard
            title="Policy / Card #"
            tone="purple"
            value={coverage.policyOrCardNumber}
            subtitle="Verification ID"
          />
        </div>
      </div>

      {/* Amounts */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <InfoTileCard
          title="Approved by Scheme"
          tone="blue"
          value={formatCurrency(coverage.approvedAmount)}
          subtitle={`${coverage.type} approval`}
        />
        <InfoTileCard
          title="Received So Far"
          tone="emerald"
          value={formatCurrency(coverage.receivedAmount)}
          subtitle={coverage.receivedDate ? `Last: ${coverage.receivedDate}` : "Pending receipt"}
        />
      </div>

      {coverage.receivedDate && (
        <InfoAlertCard
          tone="slate"
          icon={<Clock3 className="h-3.5 w-3.5" />}
          title="Last Receipt"
          body={`Last amount received on ${coverage.receivedDate}.`}
        />
      )}

      {remaining > 0 && coverage.status !== "Fully Received" && (
        <InfoAlertCard
          tone="amber"
          icon={<Clock3 className="h-3.5 w-3.5" />}
          title={`${formatCurrency(remaining)} pending from ${coverage.type}`}
          body="This amount will be adjusted once received from the government / insurer."
        />
      )}

      {/* Net payable vs coverage breakdown */}
      <div className="rounded-2xl border border-violet-200 bg-violet-50/40 p-5">
        <p className="text-sm font-bold text-violet-800">
          Net Payable vs Coverage
        </p>
        <div className="mt-3 space-y-2 text-sm">
          <Row label="Net Payable (Bill Total)" value={formatCurrency(netPayable)} />
          <Row
            label={`Covered by ${coverage.type}`}
            value={`- ${formatCurrency(coverage.receivedAmount)}`}
            tone="text-blue-600"
          />
          <div className="border-t border-dashed border-violet-200" />
          <Row
            label="Patient Must Pay"
            value={formatCurrency(patientPortion)}
            bold
            tone="text-violet-800"
          />
        </div>
        {coverage.receivedAmount >= netPayable ? (
          <p className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Full bill amount covered by {coverage.type}. No out-of-pocket
            payment needed.
          </p>
        ) : (
          <p className="mt-3 text-xs text-slate-500">
            Patient is responsible for the remaining{" "}
            {formatCurrency(patientPortion)} not covered by {coverage.type}.
          </p>
        )}
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  bold,
  tone,
}: {
  label: string;
  value: string;
  bold?: boolean;
  tone?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-500">{label}</span>
      <span
        className={`${bold ? "font-bold" : "font-medium"} ${tone ?? "text-slate-800"}`}
      >
        {value}
      </span>
    </div>
  );
}
