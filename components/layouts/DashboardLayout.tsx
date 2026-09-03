"use client";

import { motion } from "framer-motion";

import AppSidebar from "@/components/sidebar/AppSidebar";
import Header from "@/components/navbar/Header";
import { useAuth } from "@/providers/AuthProvider";
import { useLayout } from "@/providers/LayoutProvider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const { sidebarCollapsed } = useLayout();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
          <p className="text-sm font-medium text-slate-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AppSidebar />

      <motion.div
        animate={{ marginLeft: sidebarCollapsed ? 72 : 256 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        className="flex flex-1 flex-col"
      >
        <Header />

        <main className="flex-1 p-6">{children}</main>
      </motion.div>
    </div>
  );
}
