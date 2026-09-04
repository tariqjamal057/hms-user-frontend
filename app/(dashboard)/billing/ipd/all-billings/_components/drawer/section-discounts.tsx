// app/(dashboard)/billing/ipd/_components/drawer/section-discounts.tsx
import {
  BadgePercent,
  CalendarDays,
  TicketPercent,
  TrendingDown,
  User,
} from "lucide-react";
import {
  DataTable,
  type DataColumn,
} from "@/components/patient-detail/data-table";
import { InfoTileCard } from "@/components/patient-detail/info-tile-card";
import { InfoAlertCard } from "@/components/patient-detail/info-alert-card";
import type { DiscountEntry } from "@/types/billing/ipd/billing-types";
import { formatCurrency } from "@/lib/billing/ipd/billing-calculations";

export function SectionDiscounts({ discounts }: { discounts: DiscountEntry[] }) {
  const totalDiscount = discounts.reduce((sum, d) => sum + d.amountDeducted, 0);
  const avgPct = discounts.length
    ? Math.round(
        discounts.reduce((sum, d) => sum + d.percentage, 0) / discounts.length,
      )
    : 0;

  const columns: DataColumn<DiscountEntry>[] = [
    {
      key: "date",
      label: "Date",
      render: (d) => (
        <div className="text-xs">
          <p className="font-semibold text-slate-700">
            {new Date(`${d.date}T12:00:00`).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>
      ),
    },
    {
      key: "percentage",
      label: "Discount %",
      align: "center",
      render: (d) => (
        <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-xs font-bold text-rose-700">
          <BadgePercent className="h-3 w-3" />
          {d.percentage}%
        </span>
      ),
    },
    {
      key: "amountDeducted",
      label: "Amount Deducted",
      align: "right",
      render: (d) => (
        <span className="font-bold text-rose-700">
          - {formatCurrency(d.amountDeducted)}
        </span>
      ),
    },
    {
      key: "givenBy",
      label: "Given By",
      render: (d) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-700">
          <User className="h-3 w-3 text-slate-400" />
          {d.givenBy}
        </div>
      ),
    },
    {
      key: "reason",
      label: "Reason",
      render: (d) =>
        d.reason ? (
          <span className="line-clamp-2 max-w-[320px] text-xs text-slate-600">
            {d.reason}
          </span>
        ) : (
          <span className="text-slate-400">—</span>
        ),
    },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 rounded-2xl border border-rose-200 bg-gradient-to-r from-rose-50 via-white to-pink-50 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 text-white shadow-sm">
            <TicketPercent className="h-5 w-5" />
          </span>
          <div>
            <p className="text-lg font-bold tracking-tight text-slate-800">
              Discounts Applied
            </p>
            <p className="text-xs text-slate-500">
              Percentage-based discounts applied to the total bill, with the
              date and staff member who granted them.
            </p>
          </div>
        </div>
      </div>

      {/* Summary tiles */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <InfoTileCard
          title="Total Discount"
          icon={<TrendingDown className="h-3.5 w-3.5" />}
          tone="rose"
          value={formatCurrency(totalDiscount)}
          subtitle={`${discounts.length} applied`}
        />
        <InfoTileCard
          title="Average %"
          icon={<BadgePercent className="h-3.5 w-3.5" />}
          tone="amber"
          value={`${avgPct}%`}
          subtitle="Across all discounts"
        />
        <InfoTileCard
          title="Last Discount"
          icon={<CalendarDays className="h-3.5 w-3.5" />}
          tone="slate"
          value={
            discounts[0]
              ? new Date(`${discounts[0].date}T12:00:00`).toLocaleDateString(
                  "en-IN",
                  { day: "2-digit", month: "short", year: "numeric" },
                )
              : "—"
          }
          subtitle={discounts[0]?.givenBy ?? "No discounts yet"}
        />
      </div>

      {discounts.length === 0 ? (
        <InfoAlertCard
          tone="slate"
          icon={<TicketPercent className="h-3.5 w-3.5" />}
          title="No discounts applied"
          body="No discounts have been applied to this bill yet."
        />
      ) : (
        <DataTable
          card
          title="Discount History"
          titleIcon={<TicketPercent className="h-4 w-4" />}
          rows={discounts}
          columns={columns}
          rowKey={(d) => d.id}
          countLabel="discounts"
          emptyText="No discounts have been applied to this bill."
        />
      )}
    </div>
  );
}
