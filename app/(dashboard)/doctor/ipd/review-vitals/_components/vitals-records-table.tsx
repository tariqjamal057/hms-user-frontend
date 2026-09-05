import { VitalsHistoryTable } from "@/components/patient-detail/vitals-history-table";
import type { VitalRecordEntry } from "@/types/doctor/ipd/vitals-types";

export function VitalsRecordsTable({ records }: { records: VitalRecordEntry[] }) {
  return (
    <VitalsHistoryTable
      showIcuColumns
      title="Vitals Records"
      emptyText="No vitals records available"
      rows={records.map((r) => ({
        dateTime: r.dateTime,
        bp: r.bp,
        pulse: String(r.pulse),
        temp: String(r.temp),
        spo2: String(r.spo2),
        respRate: String(r.respRate),
        pain: String(r.pain),
        recordedBy: r.recordedBy,
      }))}
    />
  );
}