"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { appShellService } from "@/lib/services/app-shell-service";
import type {
  NotificationItem,
  CriticalAlert,
} from "@/lib/services/app-shell-service";

export type { NotificationItem, CriticalAlert } from "@/lib/services/app-shell-service";

interface LayoutContextType {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (v: boolean) => void;

  globalSearch: string;
  setGlobalSearch: (v: string) => void;

  notifications: NotificationItem[];
  unreadCount: number;
  markNotificationRead: (id: string) => void;
  markAllRead: () => void;

  criticalAlerts: CriticalAlert[];
  criticalAlertCount: number;
  acknowledgeAlert: (id: string) => void;

  currentDateTime: string;
}

const LayoutContext = createContext<LayoutContextType | null>(null);

function formatDateTime() {
  return (
    new Date().toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }) +
    " · " +
    new Date().toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    })
  );
}

export function LayoutProvider({ children }: { children: ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [criticalAlerts, setCriticalAlerts] = useState<CriticalAlert[]>([]);
  const [currentDateTime, setCurrentDateTime] = useState(() => formatDateTime());

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        const [notes, alerts] = await Promise.all([
          appShellService.getNotifications(),
          appShellService.getCriticalAlerts(),
        ]);
        if (cancelled) return;
        setNotifications(notes);
        setCriticalAlerts(alerts);
      } catch {
        if (!cancelled) {
          setNotifications([]);
          setCriticalAlerts([]);
        }
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setCurrentDateTime(formatDateTime()), 30000);
    return () => clearInterval(interval);
  }, []);

  const toggleSidebar = useCallback(
    () => setSidebarCollapsed((p) => !p),
    []
  );

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const criticalAlertCount = useMemo(
    () => criticalAlerts.filter((a) => !a.acknowledged).length,
    [criticalAlerts]
  );

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const acknowledgeAlert = useCallback((id: string) => {
    setCriticalAlerts((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, acknowledged: true } : a
      )
    );
  }, []);

  const value = useMemo<LayoutContextType>(
    () => ({
      sidebarCollapsed,
      toggleSidebar,
      setSidebarCollapsed,
      globalSearch,
      setGlobalSearch,
      notifications,
      unreadCount,
      markNotificationRead,
      markAllRead,
      criticalAlerts,
      criticalAlertCount,
      acknowledgeAlert,
      currentDateTime,
    }),
    [
      sidebarCollapsed,
      toggleSidebar,
      globalSearch,
      notifications,
      unreadCount,
      markNotificationRead,
      markAllRead,
      criticalAlerts,
      criticalAlertCount,
      acknowledgeAlert,
      currentDateTime,
    ]
  );

  return (
    <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>
  );
}

export function useLayout() {
  const ctx = useContext(LayoutContext);
  if (!ctx) throw new Error("useLayout must be used within LayoutProvider");
  return ctx;
}
