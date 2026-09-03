// app/(dashboard)/lab/radiology/opd-orders/_components/radiology-orders-list.tsx
"use client";
import { Eye, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { OpsActionButton } from "@/components/operations";
import type { RadiologyOPDOrder } from "@/types/lab/radiology/radiology-opd-types";
import {
  getRadiologyAggregateStatus,
  getTotalRadiologyValue,
} from "@/lib/lab/radiology/radiology-opd-orders-data";
import {
  RadiologyPaymentStatusBadge,
  RadiologyTestStatusBadge,
} from "./radiology-status-badges";
export function RadiologyOrdersList({
  orders,
  onView,
}: {
  orders: RadiologyOPDOrder[];
  onView: (order: RadiologyOPDOrder) => void;
}) {
  return (
    <Card className="overflow-hidden border-slate-200 shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1060px]">
          <thead className="bg-slate-50">
            <tr className="text-left text-[10px] uppercase tracking-wide text-slate-500">
              <th className="px-5 py-3">Patient</th>
              <th className="px-5 py-3">Order / Appointment</th>
              <th className="px-5 py-3">Doctor</th>
              <th className="px-5 py-3">Ordered On</th>
              <th className="px-5 py-3">Imaging Tests</th>
              <th className="px-5 py-3">Test Value</th>
              <th className="px-5 py-3">Report Status</th>
              <th className="px-5 py-3">Payment</th>
              <th className="px-5 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-slate-50/60">
                <td className="px-5 py-4">
                  <p className="font-semibold text-slate-800">
                    {order.patient.name}
                  </p>
                  <p className="text-xs text-slate-400">
                    {order.patient.uhid} · {order.patient.mobile}
                  </p>
                </td>
                <td className="px-5 py-4">
                  <p className="text-sm font-medium text-slate-700">
                    {order.id}
                  </p>
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
                  {order.orderedAt}
                </td>
                <td className="px-5 py-4 text-sm font-semibold text-slate-700">
                  {order.tests.length} test{order.tests.length !== 1 ? "s" : ""}
                </td>
                <td className="px-5 py-4 text-sm font-bold text-slate-800">
                  ₹{getTotalRadiologyValue(order)}
                </td>
                <td className="px-5 py-4">
                  <RadiologyTestStatusBadge
                    status={getRadiologyAggregateStatus(order)}
                  />
                </td>
                <td className="px-5 py-4">
                  <RadiologyPaymentStatusBadge status={order.paymentStatus} />
                </td>
                <td className="px-5 py-4 text-right">
                  <OpsActionButton label="View Details" icon={Eye} onClick={() => onView(order)} className="border-sky-200 text-sky-700" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {orders.length === 0 && (
        <CardContent className="py-16 text-center text-sm text-slate-400">
          No radiology OPD orders match the selected filters.
        </CardContent>
      )}
    </Card>
  );
}
export function RadiologyOrdersGrid({
  orders,
  onView,
}: {
  orders: RadiologyOPDOrder[];
  onView: (order: RadiologyOPDOrder) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
      {orders.map((order) => (
        <Card
          key={order.id}
          className="overflow-hidden border-slate-200 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
        >
          <div className="h-1 bg-gradient-to-r from-sky-500 via-cyan-500 to-blue-500" />
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-bold text-slate-800">{order.patient.name}</p>
                <p className="text-xs text-slate-400">{order.patient.uhid}</p>
              </div>
              <RadiologyPaymentStatusBadge status={order.paymentStatus} />
            </div>
            <div className="mt-4 rounded-xl bg-slate-50 p-3">
              <p className="text-sm font-semibold text-slate-700">
                {order.doctor.name}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {order.doctor.specialty} · {order.appointmentId}
              </p>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-slate-100 p-3">
                <p className="text-[10px] uppercase text-slate-400">
                  Imaging Tests
                </p>
                <p className="mt-1 text-sm font-bold text-slate-700">
                  {order.tests.length}
                </p>
              </div>
              <div className="rounded-lg border border-slate-100 p-3">
                <p className="text-[10px] uppercase text-slate-400">
                  Total Value
                </p>
                <p className="mt-1 text-sm font-bold text-slate-700">
                  ₹{getTotalRadiologyValue(order)}
                </p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <RadiologyTestStatusBadge
                status={getRadiologyAggregateStatus(order)}
              />
              <span className="text-xs text-slate-400">{order.orderedAt}</span>
            </div>
            <Button
              className="mt-4 w-full border-sky-200 text-sky-700"
              variant="outline"
              onClick={() => onView(order)}
            >
              <Image className="mr-2 h-4 w-4" />
              Process Imaging
            </Button>
          </CardContent>
        </Card>
      ))}
      {orders.length === 0 && (
        <div className="col-span-full py-16 text-center text-sm text-slate-400">
          No radiology OPD orders match the selected filters.
        </div>
      )}
    </div>
  );
}
