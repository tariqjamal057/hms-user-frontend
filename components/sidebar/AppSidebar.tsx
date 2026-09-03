"use client";

import { useMemo, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  LogOut,
} from "lucide-react";

import { APP_CONFIG } from "@/config/app";
import { ROLE_META } from "@/config/roleMeta";
import { SIDEBAR_MAP } from "@/config/sidebarMap";
import { useAuth } from "@/providers/AuthProvider";
import { useLayout } from "@/providers/LayoutProvider";
import { logoutUser } from "@/lib/auth";

import type { SidebarItem, SidebarSection } from "@/types/sidebar";

function groupBySection(items: SidebarItem[]): SidebarSection[] {
  const map = new Map<string, SidebarItem[]>();
  for (const item of items) {
    const sec = item.section ?? "";
    if (!map.has(sec)) map.set(sec, []);
    map.get(sec)!.push(item);
  }
  return Array.from(map.entries()).map(([label, sectionItems]) => ({
    label,
    items: sectionItems,
  }));
}

function SidebarNavItemComponent({
  item,
  collapsed,
  expandedMenu,
  onToggle,
}: {
  item: SidebarItem;
  collapsed: boolean;
  expandedMenu: string | null;
  onToggle: (label: string) => void;
}) {
  const pathname = usePathname();
  const Icon = item.icon;

  const isActive =
    pathname === item.href ||
    item.children?.some((c) => pathname === c.href);

  const isOpen = expandedMenu === item.label;

  if (!item.children) {
    return (
      <Link
        href={item.href ?? "#"}
        className={`
          group relative flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium
          transition-all duration-200 ease-out
          ${
            isActive
              ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-200/60"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }
        `}
      >
        {isActive && (
          <motion.div
            layoutId="sidebar-active"
            className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 shadow-lg shadow-blue-200/60"
            transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
          />
        )}
        <span className="relative z-10 flex items-center gap-3">
          {Icon && (
            <Icon
              size={18}
              className={`shrink-0 ${
                isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600"
              }`}
            />
          )}
          {!collapsed && <span className="truncate">{item.label}</span>}
        </span>
      </Link>
    );
  }

  return (
    <div>
      <button
        onClick={() => onToggle(item.label)}
        className={`
          group relative flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium
          transition-all duration-200 ease-out
          ${
            isActive
              ? "bg-blue-50 text-blue-700"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }
        `}
      >
        {Icon && (
          <Icon
            size={18}
            className={`shrink-0 ${
              isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"
            }`}
          />
        )}
        {!collapsed && (
          <>
            <span className="flex-1 truncate">{item.label}</span>
            {item.badge !== undefined && item.badge > 0 && (
              <span className="rounded-full bg-rose-100 px-1.5 py-0.5 text-[10px] font-bold text-rose-700">
                {item.badge}
              </span>
            )}
            <motion.span
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="text-slate-400"
            >
              <ChevronDown size={14} />
            </motion.span>
          </>
        )}
      </button>

      <AnimatePresence initial={false}>
        {isOpen && !collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="relative ml-5 border-l-2 border-slate-200/80 py-1 pl-4">
              {item.children.map((child) => {
                const childActive = pathname === child.href;
                return (
                  <Link
                    key={child.href}
                    href={child.href}
                    className={`
                      group relative flex cursor-pointer items-center rounded-lg px-3 py-2 text-[13px] font-medium
                      transition-all duration-150
                      ${
                        childActive
                          ? "bg-blue-50/80 text-blue-700"
                          : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                      }
                    `}
                  >
                    {childActive && (
                      <motion.span
                        layoutId="sidebar-sub-active"
                        className="absolute -left-[17px] h-full w-[3px] rounded-full bg-blue-600"
                        transition={{
                          type: "spring",
                          bounce: 0.15,
                          duration: 0.35,
                        }}
                      />
                    )}
                    <span
                      className={`
                        absolute -left-[13px] h-2 w-2 rounded-full transition-colors duration-150
                        ${childActive ? "bg-blue-600" : "bg-slate-300 group-hover:bg-blue-400"}
                      `}
                    />
                    <span className="truncate">{child.label}</span>
                    {child.badge !== undefined && child.badge > 0 && (
                      <span className="ml-auto rounded bg-rose-100 px-1 py-0.5 text-[10px] font-bold text-rose-700">
                        {child.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AppSidebar() {
  const { user, setUser } = useAuth();
  const { sidebarCollapsed, toggleSidebar } = useLayout();
  const router = useRouter();
  const pathname = usePathname();

  const collapsed = sidebarCollapsed;

  const meta = user ? ROLE_META[user.role] : null;
  const menuItems = useMemo(
    () => (user ? SIDEBAR_MAP[user.role] ?? [] : []),
    [user]
  );

  const sections = useMemo(() => groupBySection(menuItems), [menuItems]);

  const activeParent = useMemo(() => {
    for (const item of menuItems) {
      if (item.children?.some((c) => c.href === pathname)) return item.label;
      if (item.href === pathname) return item.label;
    }
    return null;
  }, [menuItems, pathname]);

  const [expandedMenu, setExpandedMenu] = useState<string | null>(activeParent);

  const handleToggle = useCallback(
    (label: string) => {
      setExpandedMenu((prev) => (prev === label ? null : label));
    },
    []
  );

  const handleLogout = useCallback(() => {
    logoutUser();
    setUser(null);
    router.push("/login");
  }, [setUser, router]);

  if (!user || !meta) return null;

  const initials = user.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 256 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className="fixed inset-y-0 left-0 z-30 flex flex-col border-r border-slate-200 bg-white"
    >
      {/* Logo / Brand */}
      <div className="flex h-[72px] items-center gap-3 border-b border-slate-100 px-4">
        <div
          className={`
            flex h-9 w-9 shrink-0 items-center justify-center rounded-xl
            bg-gradient-to-br ${meta.gradient} text-white text-sm font-bold
            shadow-lg ${meta.shadow}
            transition-all duration-300
          `}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 2a2 2 0 0 0-2 2v5H4a2 2 0 0 0-2 2v2c0 1.1.9 2 2 2h5v5c0 1.1.9 2 2 2h2a2 2 0 0 0 2-2v-5h5a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2h-5V4a2 2 0 0 0-2-2h-2z" />
          </svg>
        </div>

        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.2 }}
              className="flex-1 overflow-hidden"
            >
              <p className="text-[15px] font-bold text-slate-800 truncate">
                {APP_CONFIG.name}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-blue-600 truncate">
                {meta.subtitle}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={toggleSidebar}
          className="relative grid h-7 w-7 shrink-0 cursor-pointer place-items-center overflow-hidden rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <AnimatePresence mode="wait" initial={false}>
            {collapsed ? (
              <motion.span
                key="expand"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="grid place-items-center"
              >
                <ChevronsRight size={16} />
              </motion.span>
            ) : (
              <motion.span
                key="collapse"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="grid place-items-center"
              >
                <ChevronsLeft size={16} />
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-3">
        {sections.map((section, si) => (
          <div key={section.label || si} className={si > 0 ? "mt-4" : ""}>
            {section.label && !collapsed && (
              <p className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                {section.label}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <SidebarNavItemComponent
                  key={item.label}
                  item={item}
                  collapsed={collapsed}
                  expandedMenu={expandedMenu}
                  onToggle={handleToggle}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* User Profile + Logout */}
      <div className="border-t border-slate-100 p-3">
        <div
          className={`
            flex items-center gap-3 rounded-xl p-2.5
            transition-all duration-200 hover:bg-slate-50
            ${collapsed ? "justify-center" : ""}
          `}
        >
          {user.avatar ? (
            <Image
              src={user.avatar}
              alt={user.name}
              width={36}
              height={36}
              className="h-9 w-9 shrink-0 rounded-full border-2 border-white object-cover shadow-sm"
            />
          ) : (
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-blue-100 text-[11px] font-bold text-blue-700">
              {initials}
            </div>
          )}

          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2 }}
                className="flex-1 overflow-hidden"
              >
                <p className="truncate text-sm font-semibold text-slate-800">
                  {user.name}
                </p>
                <p className="truncate text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  {user.role}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button
          onClick={handleLogout}
          className={`
            mt-2 flex w-full cursor-pointer items-center gap-2.5 rounded-xl py-2.5 text-sm font-medium
            text-slate-500 transition-all duration-200
            hover:bg-red-50 hover:text-red-600
            ${collapsed ? "justify-center px-2" : "px-3"}
          `}
          title="Logout"
        >
          <LogOut size={16} className="shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="truncate"
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );
}
