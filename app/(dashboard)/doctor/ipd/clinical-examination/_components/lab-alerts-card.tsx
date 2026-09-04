// app/doctor/ipd/clinical-examination/_components/lab-alerts-card.tsx
"use client";

import { FlaskConical } from "lucide-react";
import { InfoCard } from "@/components/patient-detail/info-card";
import type { LabAlertMini } from "@/types/doctor/ipd/clinical-examination-types";

interface LabAlertsCardProps {
  alerts: LabAlertMini[];
  onViewAll?: () => void;
}

const STATUS_TONE: Record<LabAlertMini["status"], "red" | "amber"> = {
  High: "red",
  Low: "amber",
  Borderline: "amber",
};

const STATUS_BADGE: Record<LabAlertMini["status"], { label: string; tone: "red" | "amber" }> = {
  High: { label: "High", tone: "red" },
  Low: { label: "Low", tone: "amber" },
  Borderline: { label: "Borderline", tone: "amber" },
};

export function LabAlertsCard({ alerts, onViewAll }: LabAlertsCardProps) {
  return (
    <InfoCard
      title="Lab Alerts"
      icon={<FlaskConical className="h-4 w-4" />}
      tone="amber"
      limit={3}
      emptyText="No abnormal lab results"
      extra={
        onViewAll ? (
          <button
            type="button"
            onClick={onViewAll}
            className="cursor-pointer text-xs font-semibold text-blue-600 hover:underline"
          >
            View All
          </button>
        ) : undefined
      }
      items={alerts.map((alert) => ({
        key: alert.testName,
        title: alert.testName,
        badges: [STATUS_BADGE[alert.status]],
        rows: [
          {
            label: "Result",
            value: `${alert.value} ${alert.unit}`,
            emphasize: true,
            tone: STATUS_TONE[alert.status],
          },
        ],
      }))}
    />
  );
}
