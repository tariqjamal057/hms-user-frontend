"use client";

import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import PageHeader from "./PageHeader";

interface PageShellHeaderProps {
  title: string;
  description?: ReactNode;
  eyebrow?: string;
  meta?: ReactNode;
  actions?: ReactNode;
  variant?: "plain" | "card";
  elevated?: boolean;
  className?: string;
}

export default function PageShellHeader({
  title,
  description,
  eyebrow,
  meta,
  actions,
  variant = "plain",
  elevated = true,
  className,
}: PageShellHeaderProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!elevated) return;
    const onScroll = () => setScrolled(window.scrollY > 2);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [elevated]);

  const isCard = variant === "card";

  return (
    <header
      className={cn(
        "sticky top-0 z-10 transition-all duration-200",
        isCard
          ? "rounded-xl border bg-white/98 backdrop-blur-md"
          : "border-b bg-white/98 backdrop-blur-md",
        scrolled
          ? "border-slate-300/60 shadow-[0_2px_8px_rgba(15,23,42,0.06)]"
          : "border-slate-200/60 shadow-none",
        !isCard && "bg-gradient-to-b from-white/98 via-white/98 to-white/95",
        className
      )}
    >
      <div className="px-6 py-4 sm:py-5 sm:px-6">
        <PageHeader
          eyebrow={eyebrow}
          title={title}
          description={description}
          meta={meta}
          actions={actions}
          variant={variant}
        />
      </div>
    </header>
  );
}
