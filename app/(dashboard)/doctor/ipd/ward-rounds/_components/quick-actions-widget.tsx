import { FileText, History, StickyNote, FileDown } from "lucide-react";
import { QuickActionsCard } from "@/components/patient-detail/quick-actions-card";

const actions = [
  { label: "View All Notes", icon: FileText },
  { label: "View Previous Rounds", icon: History },
  { label: "Add General Note", icon: StickyNote },
  { label: "Download Summary", icon: FileDown },
];

export function QuickActionsWidget({ onAction }: { onAction: (label: string) => void }) {
  return (
    <QuickActionsCard
      actions={actions.map((a) => ({
        label: a.label,
        icon: a.icon,
        onClick: () => onAction(a.label),
      }))}
    />
  );
}
