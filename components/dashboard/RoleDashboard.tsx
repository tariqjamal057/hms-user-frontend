"use client";

import { useAuth } from "@/providers/AuthProvider";
import { getDashboard } from "@/config/dashboard";
import { useLayout } from "@/providers/LayoutProvider";

import DashboardPageHeader from "./DashboardPageHeader";
import KpiGrid from "./KpiGrid";
import ActivityCard from "./ActivityCard";

export default function RoleDashboard() {
  const { user } = useAuth();
  const { currentDateTime } = useLayout();
  const blueprint = user ? getDashboard(user.role) : undefined;

  if (!blueprint) {
    return (
      <p className="text-sm text-slate-500">
        Dashboard configuration not found for this role.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        eyebrow={blueprint.header.eyebrow}
        title={blueprint.header.title}
        description={blueprint.header.description}
        meta={currentDateTime}
      />

      <KpiGrid items={blueprint.kpis} columns={4} />

      <ActivityCard
        title={blueprint.activityTitle}
        description={blueprint.activityDescription}
        items={blueprint.activities}
      />
    </div>
  );
}
