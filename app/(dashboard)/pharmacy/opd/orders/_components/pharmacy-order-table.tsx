// app/(dashboard)/pharmacy/opd/orders/_components/pharmacy-order-table.tsx
"use client";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OpsActionButton } from "@/components/operations";
import type { PharmacyOPDOrder } from "@/types/pharmacy/opd/pharmacy-opd-types";
import {
  getOrderStockStatus,
  getOrderValue,
} from "@/lib/pharmacy/opd/pharmacy-opd-orders-data";

export function PharmacyOrderTable({
  orders,
  onView,
}: {
  orders: PharmacyOPDOrder[];
  onView: (order: PharmacyOPDOrder) => void;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1100px]">
          <thead className="bg-slate-50 text-left">
            <tr className="text-[10px] uppercase tracking-wide text-slate-500">
              <th className="px-5 py-3">Patient</th>
              <th className="px-5 py-3">Order / Appointment</th>
              <th className="px-5 py-3">Doctor</th>
              <th className="px-5 py-3">Ordered On</th>
              <th className="px-5 py-3">Medicine Qty.</th>
              <th className="px-5 py-3">Total Value</th>
              <th className="px-5 py-3">Stock</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-slate-50/70">
                <td className="px-5 py-4">
                  <p className="font-semibold text-slate-800">
                    {order.patient.name}
                  </p>
                  <p className="text-xs text-slate-400">
                    {order.patient.uhid} · {order.patient.mobile}
                  </p>
                </td>
                <td className="px-5 py-4 text-sm">
                  <p className="font-medium text-slate-700">{order.id}</p>
                  <p className="text-xs text-slate-400">
                    {order.appointmentId}
                  </p>
                </td>
                <td className="px-5 py-4">
                  <p className="text-sm font-medium text-slate-700">
                    {order.doctor.name}
                  </p>
                  <p className="text-xs text-slate-400">
                    {order.doctor.specialty}
                  </p>
                </td>
                <td className="px-5 py-4 text-sm text-slate-600">
                  {order.orderDateTime}
                </td>
                <td className="px-5 py-4 text-sm font-semibold text-slate-700">
                  {order.medicines.reduce(
                    (sum, medicine) => sum + medicine.prescribedQuantity,
                    0,
                  )}{" "}
                  units
                </td>
                <td className="px-5 py-4 text-sm font-bold text-slate-800">
                  ₹{getOrderValue(order).toFixed(2)}
                </td>
                <td className="px-5 py-4">
                  <StockBadge status={getOrderStockStatus(order)} />
                </td>
                <td className="px-5 py-4">
                  <OrderBadge status={order.status} />
                </td>
                <td className="px-5 py-4 text-right">
                  <OpsActionButton label="View Details" icon={Eye} onClick={() => onView(order)} className="border-blue-200 text-blue-700" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {orders.length === 0 && (
        <div className="py-16 text-center text-sm text-slate-400">
          No pharmacy orders match the selected filters.
        </div>
      )}
    </div>
  );
}
export function StockBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    "All Available": "border-emerald-200 bg-emerald-50 text-emerald-700",
    "Partially Available": "border-amber-200 bg-amber-50 text-amber-700",
    "Out of Stock": "border-red-200 bg-red-50 text-red-700",
  };
  return (
    <Badge variant="outline" className={map[status]}>
      {status}
    </Badge>
  );
}
export function OrderBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Pending: "border-amber-200 bg-amber-50 text-amber-700",
    Paid: "border-blue-200 bg-blue-50 text-blue-700",
    Delivered: "border-emerald-200 bg-emerald-50 text-emerald-700",
  };
  return (
    <Badge variant="outline" className={map[status]}>
      {status}
    </Badge>
  );
}
