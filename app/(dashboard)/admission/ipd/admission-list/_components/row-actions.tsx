// app/ipd/admission-list/_components/row-actions.tsx
"use client";

import { Eye, Bed, MoreVertical, Ban, Download, NotebookPen, Edit, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OpsActionMenu } from "@/components/operations";
import { AdmissionRecord } from "@/types/admission-list-types";
import { MdEmail } from "react-icons/md";
import { FaWhatsappSquare } from "react-icons/fa";
import { useRouter } from "next/navigation";


interface RowActionsProps {
  record: AdmissionRecord;
  onView: (r: AdmissionRecord) => void;
  onBedTransfer: (r: AdmissionRecord) => void;
  onPrint: (r: AdmissionRecord) => void;
  onCancel: (r: AdmissionRecord) => void;
}

export function RowActions({ record, onView, onBedTransfer, onPrint, onCancel }: RowActionsProps) {
  const router = useRouter();

  function handleEdit() {
    //console.log("Edit admission:", record.admissionId);
    router.push(`/admission/ipd/admission-list/edit/${record.admissionId}`);
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-blue-600" onClick={() => onView(record)} title="View">
        <Eye className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-blue-600" onClick={() => onBedTransfer(record)} title="Bed / Ward">
        <Bed className="h-4 w-4" />
      </Button>
      <OpsActionMenu
        items={[
          {
            label: "Edit Admission Details",
            icon: Edit,
            onClick: handleEdit,
          },
          {
            label: "Download Admission Summary",
            icon: Download,
            onClick: () => onPrint(record),
          },
          {
            label: "Send Via Email",
            icon: MdEmail as unknown as LucideIcon,
            onClick: () => {},
          },
          {
            label: "Send Via WhatsApp",
            icon: FaWhatsappSquare as unknown as LucideIcon,
            onClick: () => {},
          },
          {
            label: "Notes",
            icon: NotebookPen,
            onClick: () => {},
          },
          {
            label: "Cancel Admission",
            icon: Ban,
            onClick: () => onCancel(record),
            destructive: true,
          },
        ]}
      />
    </div>
  );
}