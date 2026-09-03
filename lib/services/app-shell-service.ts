export type NotificationType = "info" | "warning" | "critical" | "success";
export type AlertSeverity = "critical" | "warning";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: NotificationType;
}

export interface CriticalAlert {
  id: string;
  title: string;
  detail: string;
  timestamp: string;
  severity: AlertSeverity;
  acknowledged: boolean;
}

/**
 * App-shell data service.
 *
 * All notifications / alerts consumed by the sidebar & header flow through
 * this single typed interface. To later connect a real backend, replace the
 * implementations below (e.g. with `fetch("/api/notifications")`) WITHOUT
 * changing any component or provider code.
 */
export interface AppShellService {
  getNotifications(): Promise<NotificationItem[]>;
  getCriticalAlerts(): Promise<CriticalAlert[]>;
}

export const appShellService: AppShellService = {
  async getNotifications() {
    await mockLatency();
    return [
      {
        id: "n1",
        title: "Critical Lab Result",
        message: "Potassium 6.8 mmol/L for Ravi Sharma requires immediate review",
        time: "2 min ago",
        read: false,
        type: "critical",
      },
      {
        id: "n2",
        title: "Bed Assignment",
        message: "ICU-06 assigned to Debasish Roy — admission confirmed",
        time: "15 min ago",
        read: false,
        type: "info",
      },
      {
        id: "n3",
        title: "Discharge Ready",
        message: "Rina Ghosh (OT-2026-00112) — discharge summary pending",
        time: "32 min ago",
        read: false,
        type: "warning",
      },
      {
        id: "n4",
        title: "Pharmacy Dispatch",
        message: "Rahul Ghosh — cart packed, awaiting collection",
        time: "45 min ago",
        read: true,
        type: "success",
      },
      {
        id: "n5",
        title: "ICU Transfer Request",
        message: "Anita Roy from Emergency — transfer to ICU pending approval",
        time: "1 hr ago",
        read: true,
        type: "warning",
      },
    ];
  },

  async getCriticalAlerts() {
    await mockLatency();
    return [
      {
        id: "a1",
        title: "Potassium 6.8 mmol/L — Ravi Sharma",
        detail: "Pathology · IPD-2026-00218 · result posted 12:18 PM",
        timestamp: "12:18 PM",
        severity: "critical",
        acknowledged: false,
      },
      {
        id: "a2",
        title: "SpO₂ 89% — Anita Roy",
        detail: "Emergency · ER-2026-004821 · under observation",
        timestamp: "12:20 PM",
        severity: "critical",
        acknowledged: false,
      },
      {
        id: "a3",
        title: "ICU capacity threshold reached",
        detail: "2 beds available; 1 critical ED transfer requested",
        timestamp: "11:52 AM",
        severity: "warning",
        acknowledged: false,
      },
    ];
  },
};

function mockLatency(ms = 60) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
