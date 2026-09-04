// components/consultation/consultation-shell.tsx
"use client";
import type { ReactNode } from "react";
import {
  PatientDetailShell,
  type PatientDetailData,
  type PatientListItem,
} from "@/components/patient-detail/patient-detail-shell";
import {
  ConsultationStepper,
  type ConsultationStep,
} from "@/components/consultation/consultation-stepper";

export type ConsultationShellProps = {
  patient: PatientDetailData;
  patientList?: PatientListItem[];
  patientsPath: string;
  status?: string;
  statusOptions?: { label: string; value: string; color: string; dot: string }[];
  onStatusChange?: (status: string) => void;
  onSwitchPatient?: (uhid: string) => void;
  showStatusSelector?: boolean;
  showPatientSwitcher?: boolean;
  infoFields?: { label: string; value: string; highlight?: boolean }[];
  onBack?: () => void;
  subtitle?: string;
  headerActions?: ReactNode;
  steps: ConsultationStep[];
  currentStep: number;
  onStepClick?: (step: number) => void;
  children: ReactNode;
};

export function ConsultationShell({
  patient,
  patientList = [],
  patientsPath,
  status,
  statusOptions,
  onStatusChange,
  onSwitchPatient,
  showStatusSelector,
  showPatientSwitcher,
  infoFields,
  onBack,
  subtitle,
  headerActions,
  steps,
  currentStep,
  onStepClick,
  children,
}: ConsultationShellProps) {
  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-[1600px]">
        <PatientDetailShell
          patient={patient}
          patientList={patientList}
          patientsPath={patientsPath}
          tabs={[]}
          containerClassName="min-h-0"
          status={status}
          statusOptions={statusOptions}
          onStatusChange={onStatusChange}
          onSwitchPatient={onSwitchPatient}
          showStatusSelector={showStatusSelector}
          showPatientSwitcher={showPatientSwitcher}
          infoFields={infoFields}
          onBack={onBack}
          subtitle={subtitle}
          headerActions={headerActions}
        />

        <div className="mt-2">
          <ConsultationStepper
            steps={steps}
            currentStep={currentStep}
            onStepClick={onStepClick}
          />
          {children}
        </div>
      </div>
    </div>
  );
}