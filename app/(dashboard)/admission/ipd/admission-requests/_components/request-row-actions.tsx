"use client";

import {
  Eye,
  MoreVertical,
  CheckCircle2,
  XCircle,
  FileText,
  Download,
  Edit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { OpsActionMenu } from "@/components/operations";
import type { AdmissionRequestRecord } from "@/types/admission-request-types";
import { useRouter } from "next/navigation";

interface RequestRowActionsProps {
  record: AdmissionRequestRecord;
  onView: (r: AdmissionRequestRecord) => void;
  onApprove: (r: AdmissionRequestRecord) => void;
  onReject: (r: AdmissionRequestRecord) => void;
}

export function RequestRowActions({
  record,
  onView,
  onApprove,
  onReject,
}: RequestRowActionsProps) {
  const isPending = record.requestStatus === "Pending Review";

  const router = useRouter();

  function handleEdit() {
    //console.log("Edit admission:", record.admissionId);
    router.push(`/admission/ipd/admission-list/edit/${record.requestId}`);
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-slate-500 hover:text-blue-600"
        onClick={() => onView(record)}
        title="View"
      >
        <Eye className="h-4 w-4" />
      </Button>
      <OpsActionMenu
        items={[
          {
            label: "View Full Request",
            icon: FileText,
            onClick: () => onView(record),
          },
          {
            label: "Edit Admission Details",
            icon: Edit,
            onClick: handleEdit,
          },
          {
            label: "Download Admission Summary",
            icon: Download,
            onClick: () => {},
          },
          ...(isPending
            ? [
                {
                  label: "Approve Request",
                  icon: CheckCircle2,
                  onClick: () => onApprove(record),
                  destructive: false,
                } as const,
                {
                  label: "Reject Request",
                  icon: XCircle,
                  onClick: () => onReject(record),
                  destructive: true,
                } as const,
              ]
            : []),
        ]}
      />
    </div>
  );
}
