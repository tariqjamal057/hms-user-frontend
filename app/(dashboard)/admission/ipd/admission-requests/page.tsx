"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  PageShellHeader,
  StatsRow,
  FilterBar,
  OpsTable,
  buildTrend,
} from "@/components/operations";
import type { OpsColumn } from "@/components/operations";
import type { KpiCardProps } from "@/components/dashboard";
import { RequestStatusBadge } from "./_components/request-status-badge";
import { RequestPriorityBadge } from "./_components/request-priority-badge";
import { RequestRowActions } from "./_components/request-row-actions";

import {
  ADMISSION_REQUESTS,
  REQUEST_DEPARTMENTS,
  REQUEST_DOCTORS,
} from "@/lib/admission-request-data";
import type {
  AdmissionRequestDetail,
  AdmissionRequestRecord,
} from "@/types/admission-request-types";
import { RequestDetailsDialog } from "./_components/request-details-dialog";

const previousDay = {
  total: 42,
  pending: 14,
  approved: 16,
  rejected: 5,
};

export default function AdmissionRequestsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [requestStatus, setRequestStatus] = useState("all");
  const [department, setDepartment] = useState("all");
  const [doctor, setDoctor] = useState("all");
  const [refreshing, setRefreshing] = useState(false);

  const [selectedRequest, setSelectedRequest] =
    useState<AdmissionRequestDetail | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  function handleView(r: AdmissionRequestRecord) {
    console.log("View admission request:", r.requestId);
    toast.info(`Opening full request for ${r.requestId}`);
    const detail: AdmissionRequestDetail = {
      ...r,
      mobile: "9875543210",
      email: "ravi.sharma@email.com",
      address: "123, Green Park, Civil Lines, Delhi - 110054",
      requestedFor: "Admission",
      provisionalDiagnosis: "Chest Pain / Angina",
      symptoms: "Chest pain since 2 days, breathlessness on exertion",
      referredFrom: "OPD",
      clinicalRemarks:
        "Patient requires monitoring and further cardiac evaluation.",
      preferredWardType: "General Ward",
      preferredBedType: "General Bed",
      preferredFloor: "3rd Floor",
      specialRequest: "Near Nurse Station",
      documents: [
        {
          fileName: "OPD Prescription.pdf",
          fileSizeLabel: "245 KB",
          fileType: "pdf",
          url: "#",
        },
        {
          fileName: "Investigation Reports.pdf",
          fileSizeLabel: "512 KB",
          fileType: "pdf",
          url: "#",
        },
      ],
    };
    setSelectedRequest(detail);
    setDetailsOpen(true);
  }

  const filtered = useMemo(() => {
    return ADMISSION_REQUESTS.filter((r) => {
      const matchesSearch =
        !searchQuery ||
        r.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.uhid.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        requestStatus === "all" || r.requestStatus === requestStatus;
      const matchesDept = department === "all" || r.department === department;
      const matchesDoctor = doctor === "all" || r.attendingDoctor === doctor;
      return matchesSearch && matchesStatus && matchesDept && matchesDoctor;
    });
  }, [searchQuery, requestStatus, department, doctor]);

  const stats = useMemo(
    () => ({
      total: ADMISSION_REQUESTS.length,
      pending: ADMISSION_REQUESTS.filter(
        (r) => r.requestStatus === "Pending Review",
      ).length,
      approved: ADMISSION_REQUESTS.filter((r) => r.requestStatus === "Approved")
        .length,
      rejected: ADMISSION_REQUESTS.filter((r) => r.requestStatus === "Rejected")
        .length,
    }),
    [],
  );

  function handleApprove(r: AdmissionRequestRecord) {
    console.log("Approve admission request:", r.requestId);
    toast.success(
      `Request ${r.requestId} approved. Proceed to create admission.`,
    );
  }

  function handleReject(r: AdmissionRequestRecord) {
    console.log("Reject admission request:", r.requestId);
    toast.error(`Request ${r.requestId} rejected`);
  }

  function handleRefresh() {
    setRefreshing(true);
    console.log("Refreshing admission requests...");
    setTimeout(() => {
      setRefreshing(false);
      toast.success("Admission requests refreshed");
    }, 800);
  }

  function handleExportExcel() {
    console.log("Exporting", filtered.length, "requests to Excel");
    toast.success("Exporting admission requests to Excel...");
  }

  function handleResetFilters() {
    setSearchQuery("");
    setRequestStatus("all");
    setDepartment("all");
    setDoctor("all");
  }

  const hasActiveFilters =
    searchQuery !== "" ||
    requestStatus !== "all" ||
    department !== "all" ||
    doctor !== "all";

  const infoCards: KpiCardProps[] = [
    {
      label: "Total Requests",
      value: String(stats.total),
      icon: FileText,
      accent: "blue",
      footer: "All Requests",
      trend: buildTrend(stats.total, previousDay.total),
    },
    {
      label: "Pending Review",
      value: String(stats.pending),
      icon: Clock,
      accent: "amber",
      footer: "Awaiting Review",
      trend: buildTrend(stats.pending, previousDay.pending),
    },
    {
      label: "Approved",
      value: String(stats.approved),
      icon: CheckCircle2,
      accent: "emerald",
      footer: "Approved Requests",
      trend: buildTrend(stats.approved, previousDay.approved),
    },
    {
      label: "Rejected",
      value: String(stats.rejected),
      icon: XCircle,
      accent: "rose",
      footer: "Rejected Requests",
      trend: buildTrend(stats.rejected, previousDay.rejected),
    },
  ];

  const columns: OpsColumn<AdmissionRequestRecord>[] = [
    {
      key: "requestId",
      header: "Request ID",
      cell: (r) => (
        <span className="font-medium text-blue-600">{r.requestId}</span>
      ),
    },
    {
      key: "dateTime",
      header: "Request Date & Time",
      cell: (r) => (
        <span className="whitespace-nowrap text-slate-500">
          {r.requestDateTime}
        </span>
      ),
    },
    {
      key: "patient",
      header: "Patient Details",
      cell: (r) => (
        <div>
          <p className="font-medium text-slate-800">{r.patientName}</p>
          <p className="text-xs text-slate-400">{r.uhid}</p>
        </div>
      ),
    },
    {
      key: "ageGender",
      header: "Age / Gender",
      cell: (r) => (
        <span className="text-slate-500">
          {r.age} Y / {r.gender}
        </span>
      ),
    },
    {
      key: "department",
      header: "Department",
      cell: (r) => <span className="text-slate-500">{r.department}</span>,
    },
    {
      key: "doctor",
      header: "Attending Doctor",
      cell: (r) => <span className="text-slate-500">{r.attendingDoctor}</span>,
    },
    {
      key: "requestedBy",
      header: "Requested By",
      cell: (r) => (
        <div>
          <p className="text-slate-700">{r.requestedByLocation}</p>
          <p className="text-xs text-slate-400">{r.requestedByDoctor}</p>
        </div>
      ),
    },
    {
      key: "status",
      header: "Request Status",
      cell: (r) => <RequestStatusBadge status={r.requestStatus} />,
    },
    {
      key: "priority",
      header: "Priority",
      cell: (r) => <RequestPriorityBadge priority={r.priority} />,
    },
    {
      key: "actions",
      header: "Actions",
      headerClassName: "text-right",
      className: "text-right",
      cell: (r) => (
        <RequestRowActions
          record={r}
          onView={handleView}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      ),
    },
  ];

  return (
    <div className="min-h-screen">
      <PageShellHeader
        title="Admission Requests"
        description="Requests received from OPD / Doctors for IPD admission."
        actions={
          <>
            <Button
              variant="outline"
              className="gap-2"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw
                className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
              />{" "}
              Refresh
            </Button>
            <Button
              variant="outline"
              className="gap-2"
              onClick={handleExportExcel}
            >
              <Download className="h-4 w-4" /> Export Excel
            </Button>
          </>
        }
      />

      <main className="py-6">
        <StatsRow items={infoCards} />

        <div className="my-6">
          <FilterBar
            search={searchQuery}
            onSearch={setSearchQuery}
            searchPlaceholder="Search patient name or UHID..."
            canClear={hasActiveFilters}
            onClear={handleResetFilters}
            filters={[
              {
                key: "requestStatus",
                label: "Status",
                placeholder: "All Status",
                selected: requestStatus,
                options: [
                  { value: "all", label: "All Status" },
                  { value: "Pending Review", label: "Pending Review" },
                  { value: "Approved", label: "Approved" },
                  { value: "Rejected", label: "Rejected" },
                ],
              },
              {
                key: "department",
                label: "Department",
                placeholder: "All Departments",
                selected: department,
                options: [
                  { value: "all", label: "All Departments" },
                  ...REQUEST_DEPARTMENTS.map((d) => ({
                    value: d,
                    label: d,
                  })),
                ],
              },
              {
                key: "doctor",
                label: "Doctor",
                placeholder: "All Doctors",
                selected: doctor,
                options: [
                  { value: "all", label: "All Doctors" },
                  ...REQUEST_DOCTORS.map((d) => ({
                    value: d,
                    label: d,
                  })),
                ],
              },
            ]}
            onFilterChange={(key, value) => {
              if (key === "requestStatus") setRequestStatus(value);
              if (key === "department") setDepartment(value);
              if (key === "doctor") setDoctor(value);
            }}
          />
        </div>

        <OpsTable
          data={filtered}
          rowKey={(r) => r.requestId}
          columns={columns}
         
          showColumnToggle
        />
      </main>

      <RequestDetailsDialog
        request={selectedRequest}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />
    </div>
  );
}

