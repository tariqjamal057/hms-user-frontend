// components/patient-detail/patient-detail-shell.tsx
"use client";
import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PatientProfileCard } from "./patient-profile-card";
import type {
  PatientDetailData,
  PatientListItem,
  PatientTab,
  QuickVital,
} from "./patient-detail-types";

// Re-export shared profile types for every module that adapts patients
// into the normalized PatientDetailData shape.
export type { PatientDetailData, PatientListItem, PatientTab, QuickVital } from "./patient-detail-types";

export type PatientDetailShellProps = {
  patient: PatientDetailData;
  patientList: PatientListItem[];
  patientsPath: string;
  status?: string;
  statusOptions?: { label: string; value: string; color: string; dot: string }[];
  onStatusChange?: (status: string) => void;
  tabs: PatientTab[];
  defaultTab?: string;
  /** Controlled active tab value. When provided, the shell renders this tab
   *  instead of managing its own state. */
  activeTab?: string;
  /** Notified when the user clicks a tab trigger. */
  onActiveTabChange?: (value: string) => void;
  // When true and there is exactly one tab, hide the tab bar (content still renders).
  hideSingleTab?: boolean;
  showStatusSelector?: boolean;
  showPatientSwitcher?: boolean;
  onSwitchPatient?: (uhid: string) => void;
  infoFields?: { label: string; value: string; highlight?: boolean }[];
  onBack?: () => void;
  subtitle?: string;
  // Extra custom buttons to render in the profile header's top-right actions row
  headerActions?: React.ReactNode;
  // Extra badges rendered next to the name / status pills (e.g. patient type)
  extraBadges?: React.ReactNode;
  // Override the outer page container class (defaults to "min-h-screen").
  // Use e.g. "min-h-0" when rendering only the header (no tabs) so the wrapper
  // does not stretch to a full viewport and leave empty space below the card.
  containerClassName?: string;
};

export function PatientDetailShell({
  patient,
  patientList,
  patientsPath,
  status,
  statusOptions,
  onStatusChange,
  tabs,
  defaultTab,
  activeTab: controlledActiveTab,
  onActiveTabChange,
  hideSingleTab = false,
  showStatusSelector = false,
  showPatientSwitcher = false,
  onSwitchPatient,
  infoFields,
  onBack,
  subtitle,
  headerActions,
  extraBadges,
  containerClassName,
}: PatientDetailShellProps) {
  const router = useRouter();
  const wrapped = containerClassName ?? "min-h-screen";
  const [internalTab, setInternalTab] = useState(defaultTab ?? tabs[0]?.value ?? "");
  const isControlled = controlledActiveTab !== undefined;
  const tab = isControlled ? controlledActiveTab : internalTab;
  const setTab = (next: string) => {
    if (!isControlled) setInternalTab(next);
    onActiveTabChange?.(next);
  };
  const [direction, setDirection] = useState(1);
  const prevTabRef = useRef(tab);

  const visibleTabs = useMemo(() => tabs.filter((t) => !t.hidden), [tabs]);
  const activeTab = tabs.find((t) => t.value === tab) ?? tabs[0];

  function handleTabChange(next: string) {
    const prevIndex = tabs.findIndex((t) => t.value === prevTabRef.current);
    const nextIndex = tabs.findIndex((t) => t.value === next);
    setDirection(prevIndex < nextIndex ? 1 : -1);
    prevTabRef.current = next;
    setTab(next);
  }

  return (
    <div className={wrapped}>
      <div className="mx-auto max-w-[1600px]">
        {/* ── Patient Profile Header (unified card, separate element) ── */}
        <PatientProfileCard
          patient={patient}
          patientList={patientList}
          patientsPath={patientsPath}
          status={status}
          statusOptions={statusOptions}
          onStatusChange={onStatusChange}
          showStatusSelector={showStatusSelector}
          showPatientSwitcher={showPatientSwitcher}
          onSwitchPatient={onSwitchPatient}
          infoFields={infoFields}
          onBack={onBack}
          subtitle={subtitle}
          headerActions={headerActions}
          extraBadges={extraBadges}
          flush
        />

        {/* ── Tabs (separate, flush under header) ── */}
        {tabs.length > 0 && (
        <Tabs value={tab} onValueChange={handleTabChange}>
          {!(hideSingleTab && visibleTabs.length <= 1) && visibleTabs.length > 0 && (
          <TabsList
            variant="line"
            className="w-full justify-start overflow-x-auto rounded-none border border-slate-200 bg-white p-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {visibleTabs.map((t, idx) => {
              const active = t.value === tab;
              return (
                <TabsTrigger
                  key={t.value}
                  value={t.value}
                  className={`relative cursor-pointer whitespace-nowrap rounded-none! border-none px-5 py-4 text-sm font-medium text-slate-500 transition-colors duration-200 hover:text-blue-700 aria-selected:bg-transparent after:hidden! data-[state=active]:bg-transparent! data-[state=active]:font-semibold data-[state=active]:text-white data-[state=active]:shadow-none ${
                    active ? "" : "bg-slate-50 hover:bg-blue-50"
                  } ${idx > 0 ? "border-l border-slate-100" : ""}`}
                >
                  {active && (
                    <motion.span
                      layoutId="activeTabPill"
                      className="absolute inset-0 z-0 rounded-none bg-blue-600"
                      transition={{ type: "spring", stiffness: 380, damping: 34 }}
                    />
                  )}
                <span className="relative z-10">{t.label}</span>
              </TabsTrigger>
              );
            })}
          </TabsList>
          )}

            <div className={hideSingleTab && visibleTabs.length <= 1 ? "min-h-0" : "min-h-[240px]"}>
              <AnimatePresence mode="wait" custom={direction} initial={false}>
                {activeTab && (
                  <motion.div
                    key={activeTab.value}
                    custom={direction}
                    variants={{
                      enter: (dir: number) => ({ opacity: 0, x: dir * 28 }),
                      center: { opacity: 1, x: 0 },
                      exit: (dir: number) => ({ opacity: 0, x: dir * -28 }),
                    }}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                  >
                    {activeTab.content}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Tabs>
        )}
      </div>
    </div>
  );
}