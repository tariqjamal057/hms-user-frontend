"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Bell,
  Siren,
  CircleHelp,
  X,
  Check,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  BookOpen,
  Headset,
  Keyboard,
  User,
  Settings,
  LogOut,
  Mail,
  ShieldCheck,
} from "lucide-react";

import { useAuth } from "@/providers/AuthProvider";
import { useLayout } from "@/providers/LayoutProvider";
import { APP_CONFIG } from "@/config/app";
import { ROLE_META } from "@/config/roleMeta";
import { RoleOptions, UserRole } from "@/config/roles";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { logoutUser } from "@/lib/auth";
import { useRouter } from "next/navigation";

const NOTIFICATION_ICONS: Record<string, typeof Bell> = {
  critical: AlertCircle,
  warning: AlertTriangle,
  info: Info,
  success: CheckCircle2,
};

const NOTIFICATION_COLORS: Record<string, string> = {
  critical: "text-red-500 bg-red-50",
  warning: "text-amber-500 bg-amber-50",
  info: "text-blue-500 bg-blue-50",
  success: "text-emerald-500 bg-emerald-50",
};

function getRoleLabel(role?: UserRole): string {
  if (!role) return "";
  const match = RoleOptions.find((r) => r.value === role);
  return match ? match.label : role;
}

export default function Header() {
  const { user, setUser } = useAuth();
  const router = useRouter();
  const {
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
  } = useLayout();

  const [showAlerts, setShowAlerts] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const alertsRef = useRef<HTMLDivElement>(null);

  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleLogout = useCallback(() => {
    logoutUser();
    setUser(null);
    router.push("/login");
  }, [setUser, router]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (alertsRef.current && !alertsRef.current.contains(e.target as Node)) {
        setShowAlerts(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="flex h-[72px] items-center justify-between px-6">
        {/* Left — Hospital info */}
        <div className="flex items-center gap-3">
          <div>
            <p className="text-sm font-bold text-slate-800">
              {APP_CONFIG.hospitalName}
            </p>
            <p className="text-[10px] font-medium text-slate-500">
              {currentDateTime}
            </p>
          </div>
        </div>

        {/* Right — Search, Alerts, Notifications, Help, User */}
        <div className="flex items-center gap-2.5">
          {/* Global Search */}
          <div className="relative">
            <motion.div
              animate={{ width: searchFocused ? 380 : 300 }}
              transition={{ duration: 0.2 }}
              className="relative"
            >
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                placeholder="Search patient, UHID, mobile, doctor..."
                className={`
                  w-full rounded-xl border bg-slate-50 py-2.5 pl-9 pr-3 text-xs
                  transition-all duration-200
                  ${
                    searchFocused
                      ? "border-blue-300 bg-white ring-4 ring-blue-50 shadow-sm"
                      : "border-slate-200 hover:border-slate-300"
                  }
                `}
              />
              {globalSearch && (
                <button
                  onClick={() => setGlobalSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer rounded p-0.5 text-slate-400 hover:text-slate-600"
                >
                  <X size={14} />
                </button>
              )}
            </motion.div>
          </div>

          {/* Critical Alerts */}
          <div className="relative" ref={alertsRef}>
            <button
              onClick={() => setShowAlerts(!showAlerts)}
              className={`
                relative grid h-9 w-9 cursor-pointer place-items-center rounded-xl border transition-all duration-200
                ${
                  criticalAlertCount > 0
                    ? "border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100"
                    : "border-slate-200 text-slate-500 hover:bg-slate-50"
                }
              `}
              title="Critical alerts"
            >
              <Siren size={16} />
              {criticalAlertCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[9px] font-bold text-white"
                >
                  {criticalAlertCount}
                </motion.span>
              )}
            </button>

            <AnimatePresence>
              {showAlerts && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-12 w-[420px] rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-rose-600">
                        Clinical Safety Alerts
                      </p>
                      <p className="mt-0.5 text-sm font-bold text-slate-800">
                        Critical alerts requiring acknowledgement
                      </p>
                    </div>
                    <button
                      onClick={() => setShowAlerts(false)}
                      className="cursor-pointer rounded-lg p-1 text-slate-400 hover:bg-slate-100"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <div className="max-h-[320px] overflow-y-auto p-3">
                    {criticalAlerts.length === 0 ? (
                      <div className="py-8 text-center text-sm text-slate-400">
                        No active critical alerts
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {criticalAlerts.map((alert) => (
                          <motion.div
                            key={alert.id}
                            layout
                            className={`
                              rounded-xl border p-4 transition-all duration-200
                              ${
                                alert.acknowledged
                                  ? "border-slate-100 bg-slate-50 opacity-60"
                                  : alert.severity === "critical"
                                    ? "border-red-200 bg-red-50"
                                    : "border-amber-200 bg-amber-50"
                              }
                            `}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1">
                                <p
                                  className={`text-xs font-bold ${
                                    alert.severity === "critical"
                                      ? "text-red-900"
                                      : "text-amber-900"
                                  }`}
                                >
                                  {alert.title}
                                </p>
                                <p
                                  className={`mt-1 text-[11px] ${
                                    alert.severity === "critical"
                                      ? "text-red-700"
                                      : "text-amber-700"
                                  }`}
                                >
                                  {alert.detail}
                                </p>
                              </div>
                              {!alert.acknowledged && (
                                <button
                                  onClick={() => acknowledgeAlert(alert.id)}
                                  className={`
                                    shrink-0 cursor-pointer rounded-lg px-3 py-2 text-[11px] font-semibold text-white
                                    ${
                                      alert.severity === "critical"
                                        ? "bg-red-600 hover:bg-red-700"
                                        : "bg-amber-600 hover:bg-amber-700"
                                    }
                                  `}
                                >
                                  Acknowledge
                                </button>
                              )}
                              {alert.acknowledged && (
                                <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                                  <Check size={14} /> Acknowledged
                                </span>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="relative grid h-9 w-9 cursor-pointer place-items-center rounded-xl border border-slate-200 text-slate-500 transition-all duration-200 hover:bg-slate-50">
                <Bell size={16} />
                {unreadCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-blue-600"
                  />
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-[380px] rounded-2xl border border-slate-200 p-0 shadow-xl shadow-slate-200/50"
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                    Notifications
                  </p>
                  <p className="text-sm font-bold text-slate-800">
                    {unreadCount} unread
                  </p>
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="cursor-pointer rounded-lg px-2.5 py-1 text-[11px] font-semibold text-blue-600 hover:bg-blue-50"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-[360px] overflow-y-auto">
                {notifications.map((n) => {
                  const Icon = NOTIFICATION_ICONS[n.type] || Info;
                  const colorClass = NOTIFICATION_COLORS[n.type] || NOTIFICATION_COLORS.info;
                  return (
                    <DropdownMenuItem
                      key={n.id}
                      className={`flex cursor-pointer items-start gap-3 px-4 py-3 ${
                        !n.read ? "bg-blue-50/40" : ""
                      }`}
                      onClick={() => markNotificationRead(n.id)}
                    >
                      <div
                        className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${colorClass}`}
                      >
                        <Icon size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-xs font-semibold ${
                            !n.read ? "text-slate-900" : "text-slate-700"
                          }`}
                        >
                          {n.title}
                        </p>
                        <p className="mt-0.5 truncate text-[11px] text-slate-500">
                          {n.message}
                        </p>
                        <p className="mt-1 text-[10px] text-slate-400">
                          {n.time}
                        </p>
                      </div>
                      {!n.read && (
                        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-600" />
                      )}
                    </DropdownMenuItem>
                  );
                })}
              </div>

              {notifications.length > 0 && (
                <div className="border-t border-slate-100 px-4 py-2.5">
                  <button className="w-full cursor-pointer text-center text-[11px] font-semibold text-blue-600 hover:text-blue-700">
                    View all notifications
                  </button>
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Help */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="grid h-9 w-9 cursor-pointer place-items-center rounded-xl border border-slate-200 text-slate-500 transition-all duration-200 hover:bg-slate-50 hover:text-blue-600"
                title="Help & support"
              >
                <CircleHelp size={16} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-[300px] rounded-2xl border border-slate-200 p-0 shadow-xl shadow-slate-200/50"
            >
              <div className="border-b border-slate-100 px-4 py-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                  Help & Support
                </p>
                <p className="mt-0.5 text-sm font-bold text-slate-800">
                  How can we help you?
                </p>
              </div>

              <div className="p-2">
                <DropdownMenuItem
                  onClick={() => alert("Documentation opened — user guide & reference.")}
                  className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium"
                >
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-blue-50 text-blue-600">
                    <BookOpen size={15} />
                  </span>
                  <span className="flex-1">
                    <span className="block font-semibold">User guide</span>
                    <span className="block text-[11px] text-slate-500">
                      Step-by-step documentation
                    </span>
                  </span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => alert(`Contact support at ${APP_CONFIG.helpEmail} or call ${APP_CONFIG.helpHotline}.`)}
                  className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium"
                >
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-50 text-emerald-600">
                    <Headset size={15} />
                  </span>
                  <span className="flex-1">
                    <span className="block font-semibold">Contact support</span>
                    <span className="block text-[11px] text-slate-500">
                      {APP_CONFIG.helpEmail}
                    </span>
                  </span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => alert("Keyboard shortcuts: Ctrl+B toggles sidebar, Ctrl+K opens search.")}
                  className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium"
                >
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-amber-50 text-amber-600">
                    <Keyboard size={15} />
                  </span>
                  <span className="flex-1">
                    <span className="block font-semibold">Keyboard shortcuts</span>
                    <span className="block text-[11px] text-slate-500">
                      Speed up your workflow
                    </span>
                  </span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => alert("About LTC HMS — Hospital Management System v1.0.0")}
                  className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium"
                >
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-slate-100 text-slate-600">
                    <Info size={15} />
                  </span>
                  <span className="flex-1">
                    <span className="block font-semibold">About {APP_CONFIG.name}</span>
                    <span className="block text-[11px] text-slate-500">
                      Version & system info
                    </span>
                  </span>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="group flex cursor-pointer items-center gap-2.5 rounded-xl border border-slate-200 py-1.5 pl-1.5 pr-3 transition-all duration-200 hover:border-blue-200 hover:bg-blue-50/50">
                {user?.avatar ? (
                  <Image
                    src={user.avatar}
                    alt={user.name ?? "User"}
                    width={32}
                    height={32}
                    className="h-8 w-8 rounded-full border-2 border-white object-cover shadow-sm"
                  />
                ) : (
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 text-[11px] font-bold text-white shadow-sm">
                    {initials}
                  </div>
                )}
                <div className="hidden text-left lg:block">
                  <p className="leading-tight text-xs font-semibold text-slate-800 group-hover:text-blue-700">
                    {user?.name}
                  </p>
                  <p className="text-[10px] font-semibold capitalize text-slate-500">
                    {user?.role}
                  </p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              sideOffset={10}
              className="w-[300px] overflow-hidden rounded-2xl border border-slate-200 p-0 shadow-xl shadow-slate-300/30"
            >
              {/* Profile header */}
              <div
                className={`relative bg-gradient-to-br ${ROLE_META[user?.role as UserRole]?.gradient ?? "from-blue-600 to-cyan-500"} px-5 pb-4 pt-5 text-white`}
              >
                <div className="flex items-center gap-3">
                  {user?.avatar ? (
                    <Image
                      src={user.avatar}
                      alt={user.name ?? "User"}
                      width={52}
                      height={52}
                      className="h-13 w-13 rounded-full border-2 border-white/70 object-cover shadow-md"
                    />
                  ) : (
                    <div className="grid h-13 w-13 shrink-0 place-items-center rounded-full bg-white/20 text-lg font-bold text-white backdrop-blur">
                      {initials}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-[15px] font-bold leading-snug">
                      {user?.name}
                    </p>
                    <div className="mt-0.5 flex items-center gap-1.5">
                      <ShieldCheck size={13} className="shrink-0 text-white/80" />
                      <span className="truncate text-[11px] font-medium capitalize text-white/90">
                        {getRoleLabel(user?.role as UserRole)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-white/15 px-2.5 py-1.5 backdrop-blur">
                  <Mail size={12} className="shrink-0 text-white/80" />
                  <span className="truncate text-[11px] text-white/90">
                    {user?.email}
                  </span>
                </div>
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-2 divide-x divide-slate-100 border-b border-slate-100">
                <div className="px-4 py-3 text-center">
                  <p className="text-lg font-bold text-slate-800">{unreadCount}</p>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    Notifications
                  </p>
                </div>
                <div className="px-4 py-3 text-center">
                  <p
                    className={`text-lg font-bold ${
                      criticalAlertCount > 0 ? "text-rose-600" : "text-slate-800"
                    }`}
                  >
                    {criticalAlertCount}
                  </p>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    Critical Alerts
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="p-2 pt-2.5">
                <DropdownMenuItem
                  onClick={() => router.push("/profile")}
                  className="flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium focus:bg-blue-50 focus:text-blue-700"
                >
                  <span className="grid h-7 w-7 place-items-center rounded-lg bg-blue-50 text-blue-600">
                    <User size={14} />
                  </span>
                  My Profile
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => router.push("/settings")}
                  className="flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium focus:bg-blue-50 focus:text-blue-700"
                >
                  <span className="grid h-7 w-7 place-items-center rounded-lg bg-slate-100 text-slate-600">
                    <Settings size={14} />
                  </span>
                  Settings
                </DropdownMenuItem>
              </div>

              <DropdownMenuSeparator className="bg-slate-100" />

              <div className="p-2">
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-red-600 focus:bg-red-50 focus:text-red-700"
                >
                  <span className="grid h-7 w-7 place-items-center rounded-lg bg-red-50 text-red-600">
                    <LogOut size={14} />
                  </span>
                  Logout
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
