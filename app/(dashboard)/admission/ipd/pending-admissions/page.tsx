"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Clock,
  AlertCircle,
  Edit2,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { DraftAdmission } from "@/types/admission-desk/ipd/ipd-admission-types";
import { DRAFT_ADMISSIONS } from "@/lib/admission-desk/ipd/ipd-admission-data";
import {
  PageShellHeader,
  StatsRow,
  FilterBar,
  OpsTable,
  OpsGrid,
  OpsGridCard,
  OpsActionMenu,
  buildTrend,
} from "@/components/operations";
import type { OpsColumn } from "@/components/operations";
import type { KpiCardProps } from "@/components/dashboard";

type ViewMode = "list" | "grid";

const previousDay = {
  total: 18,
  patientDetails: 10,
  department: 6,
  package: 3,
};

export default function IPDPendingAdmissionsPage() {
  const router = useRouter();
  const [drafts] = useState<DraftAdmission[]>(DRAFT_ADMISSIONS);
  const [view, setView] = useState<ViewMode>("list");
  const [search, setSearch] = useState("");
  const [filterSection, setFilterSection] = useState<string>("All");

  const filteredDrafts = useMemo(() => {
    return drafts.filter((draft) => {
      const query = search.toLowerCase();
      const matchesSearch =
        !query ||
        `${draft.patient.firstName} ${draft.patient.lastName}`
          .toLowerCase()
          .includes(query) ||
        draft.patient.mobileNumber?.includes(query);
      const matchesSection =
        filterSection === "All" ||
        draft.completedSections.includes(filterSection);
      return matchesSearch && matchesSection;
    });
  }, [drafts, search, filterSection]);

  const stats = useMemo(() => {
    return {
      total: drafts.length,
      patientDetails: drafts.filter((d) =>
        d.completedSections.includes("Patient Details"),
      ).length,
      department: drafts.filter((d) =>
        d.completedSections.includes("Department"),
      ).length,
      package: drafts.filter((d) => d.completedSections.includes("Package"))
        .length,
    };
  }, [drafts]);

  function continueAdmission(draftId: string) {
    router.push(`/admission/ipd/new-registration?draft=${draftId}`);
  }

  function deleteDraft(draftId: string) {
    if (confirm("Are you sure you want to delete this draft?")) {
      console.log("Deleting draft:", draftId);
    }
  }

  function handleResetFilters() {
    setSearch("");
    setFilterSection("All");
  }

  const hasActiveFilters = search !== "" || filterSection !== "All";

  const infoCards: KpiCardProps[] = [
    {
      label: "Total Drafts",
      value: String(stats.total),
      icon: FileText,
      accent: "amber",
      footer: "Pending admissions",
      trend: buildTrend(stats.total, previousDay.total),
    },
    {
      label: "Patient Details",
      value: String(stats.patientDetails),
      icon: Clock,
      accent: "blue",
      footer: "Details filled",
      trend: buildTrend(stats.patientDetails, previousDay.patientDetails),
    },
    {
      label: "Department Selected",
      value: String(stats.department),
      icon: AlertCircle,
      accent: "emerald",
      footer: "Department chosen",
      trend: buildTrend(stats.department, previousDay.department),
    },
    {
      label: "Package Selected",
      value: String(stats.package),
      icon: Edit2,
      accent: "violet",
      footer: "Package chosen",
      trend: buildTrend(stats.package, previousDay.package),
    },
  ];

  const columns: OpsColumn<DraftAdmission>[] = [
    {
      key: "patient",
      header: "Patient",
      cell: (d) => (
        <div>
          <p className="font-semibold text-slate-800">
            {d.patient.firstName} {d.patient.lastName}
          </p>
          <p className="text-xs text-slate-400">
            Age: {d.patient.age} · {d.patient.gender}
          </p>
        </div>
      ),
    },
    {
      key: "mobile",
      header: "Mobile",
      cell: (d) => (
        <span className="text-sm text-slate-600">
          {d.patient.mobileNumber}
        </span>
      ),
    },
    {
      key: "department",
      header: "Department",
      cell: (d) =>
        d.department ? (
          <Badge className="bg-blue-50 text-blue-700">{d.department}</Badge>
        ) : (
          <span className="text-xs text-slate-400">Not selected</span>
        ),
    },
    {
      key: "lastUpdated",
      header: "Last Updated",
      cell: (d) => (
        <span className="text-sm text-slate-600">{d.lastUpdated}</span>
      ),
    },
    {
      key: "progress",
      header: "Progress",
      cell: (d) => (
        <div className="flex items-center gap-1">
          <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full"
              style={{
                width: `${(d.completedSections.length / 6) * 100}%`,
              }}
            />
          </div>
          <span className="text-xs text-slate-500">
            {d.completedSections.length}/6
          </span>
        </div>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      headerClassName: "text-right",
      className: "text-right",
      cell: (d) => (
        <div className="flex justify-end">
          <OpsActionMenu
            items={[
              {
                label: "Continue",
                icon: Edit2,
                onClick: () => continueAdmission(d.id),
              },
              {
                label: "Delete Draft",
                icon: Trash2,
                onClick: () => deleteDraft(d.id),
                destructive: true,
              },
            ]}
          />
        </div>
      ),
    },
  ];

  function renderCard(draft: DraftAdmission) {
    const progress = (draft.completedSections.length / 6) * 100;
    const firstName = draft.patient.firstName ?? "";

    return (
      <OpsGridCard
        accent="from-amber-500 via-orange-500 to-amber-500"
        avatar={firstName[0] || "?"}
        title={`${draft.patient.firstName} ${draft.patient.lastName}`}
        subtitle={draft.patient.mobileNumber}
        badge={
          <Badge variant="outline" className="text-amber-700 border-amber-200 bg-amber-50">
            Draft
          </Badge>
        }
        stats={[
          { label: "Progress", value: `${draft.completedSections.length}/6 sections` },
          { label: "Sections Done", value: `${progress.toFixed(0)}%` },
        ]}
        footerTags={
          <div className="flex flex-wrap gap-1">
            {draft.completedSections.map((section, idx) => (
              <Badge key={idx} variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                {section}
              </Badge>
            ))}
          </div>
        }
      >
        <div className="mt-3 flex gap-2">
          <Button variant="outline" className="flex-1" onClick={() => continueAdmission(draft.id)}>
            <Edit2 className="mr-2 h-4 w-4" /> Continue
          </Button>
          <Button variant="outline" onClick={() => deleteDraft(draft.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </OpsGridCard>
    );
  }

  return (
    <div className="min-h-screen">
      <PageShellHeader
        title="Pending Admissions"
        description="Draft admissions waiting to be completed"
      />

      <main className="py-6">
        <StatsRow items={infoCards} />

        <div className="my-6">
          <FilterBar
            search={search}
            onSearch={setSearch}
            searchPlaceholder="Search by patient name or mobile..."
            canClear={hasActiveFilters}
            onClear={handleResetFilters}
            viewSupported
            viewMode={view}
            onViewChange={setView}
            filters={[
              {
                key: "section",
                label: "Filter by section",
                placeholder: "All Sections",
                selected: filterSection,
                options: [
                  { value: "All", label: "All Sections" },
                  { value: "Patient Details", label: "Patient Details" },
                  { value: "Department", label: "Department" },
                  { value: "Package", label: "Package" },
                  { value: "Payment", label: "Payment" },
                  { value: "Bed Allocation", label: "Bed Allocation" },
                ],
              },
            ]}
            onFilterChange={(key, value) => {
              if (key === "section") setFilterSection(value);
            }}
          />
        </div>

        {view === "list" ? (
          <OpsTable
            data={filteredDrafts}
            rowKey={(d) => d.id}
            columns={columns}
           
            showColumnToggle
          />
        ) : (
          <OpsGrid
            data={filteredDrafts}
            rowKey={(d) => d.id}
            renderCard={renderCard}
            pageSize={6}
          />
        )}
      </main>
    </div>
  );
}

