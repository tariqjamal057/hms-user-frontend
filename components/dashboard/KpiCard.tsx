"use client";

import Link from "next/link";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { KpiCardProps, KpiAccent, TrendTone } from "./types";

const TONE_TEXT: Record<TrendTone, string> = {
  positive: "text-emerald-700",
  negative: "text-rose-700",
  warning: "text-amber-700",
  neutral: "text-slate-600",
};

const TONE_PILL: Record<TrendTone, string> = {
  positive: "bg-emerald-50",
  negative: "bg-rose-50",
  warning: "bg-amber-50",
  neutral: "bg-slate-100",
};

const ACCENTS: Record<KpiAccent, {
  icon: string;
  top: string;
  label: string;
  bg: string;
}> = {
  blue: {
    icon: "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-sm shadow-blue-500/30",
    top: "[&::before]:from-blue-500 [&::before]:to-sky-400",
    label: "text-blue-600",
    bg: "bg-gradient-to-b from-blue-50 via-white to-white",
  },
  indigo: {
    icon: "bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-sm shadow-indigo-500/30",
    top: "[&::before]:from-indigo-500 [&::before]:to-violet-400",
    label: "text-indigo-600",
    bg: "bg-gradient-to-b from-indigo-50 via-white to-white",
  },
  emerald: {
    icon: "bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm shadow-emerald-500/30",
    top: "[&::before]:from-emerald-500 [&::before]:to-teal-400",
    label: "text-emerald-600",
    bg: "bg-gradient-to-b from-emerald-50 via-white to-white",
  },
  amber: {
    icon: "bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-sm shadow-amber-500/30",
    top: "[&::before]:from-amber-500 [&::before]:to-orange-400",
    label: "text-amber-600",
    bg: "bg-gradient-to-b from-amber-50 via-white to-white",
  },
  rose: {
    icon: "bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-sm shadow-rose-500/30",
    top: "[&::before]:from-rose-500 [&::before]:to-pink-400",
    label: "text-rose-600",
    bg: "bg-gradient-to-b from-rose-50 via-white to-white",
  },
  violet: {
    icon: "bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-sm shadow-violet-500/30",
    top: "[&::before]:from-violet-500 [&::before]:to-purple-400",
    label: "text-violet-600",
    bg: "bg-gradient-to-b from-violet-50 via-white to-white",
  },
  slate: {
    icon: "bg-gradient-to-br from-slate-500 to-slate-600 text-white shadow-sm shadow-slate-500/30",
    top: "[&::before]:from-slate-500 [&::before]:to-slate-400",
    label: "text-slate-600",
    bg: "bg-gradient-to-b from-slate-50 via-white to-white",
  },
};

function resolveTrend(trend: KpiCardProps["trend"]) {
  if (!trend) return null;
  const value = trend.value ?? 0;
  const direction = trend.direction ?? (value > 0 ? "up" : value < 0 ? "down" : "neutral");
  let tone = trend.tone;
  if (!tone) {
    tone =
      direction === "neutral"
        ? "neutral"
        : direction === "up"
          ? "positive"
          : "negative";
  }
  const display =
    trend.display ?? `${Math.abs(value)}%`;
  return { direction, tone, display, label: trend.label };
}

function Sparkline({ data, tone }: { data: number[]; tone: TrendTone }) {
  if (!data || data.length < 2) return null;
  const toneColor: Record<TrendTone, string> = {
    positive: "#10b981",
    negative: "#f43f5e",
    warning: "#f59e0b",
    neutral: "#94a3b8",
  };
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * 52;
      const y = 15 - ((v - min) / range) * 13;
      return `${x},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg
      width="54"
      height="18"
      viewBox="0 0 54 18"
      fill="none"
      aria-hidden="true"
      className="opacity-80 transition-opacity group-hover:opacity-100"
    >
      <polyline
        points={pts}
        stroke={toneColor[tone]}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function KpiCard({
  label,
  value,
  icon: Icon,
  iconClassName,
  accent = "blue",
  trend,
  sparkline,
  footer,
  onClick,
  href,
  className,
}: KpiCardProps) {
  const resolved = resolveTrend(trend);
  const accentStyle = ACCENTS[accent];

  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div
          className={cn(
            "relative grid h-10 w-10 place-items-center rounded-xl",
            ACCENTS.blue.icon,
            accentStyle.icon,
            iconClassName
          )}
        >
          {Icon && <Icon size={18} strokeWidth={2.2} />}
        </div>
        {resolved && (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold",
              TONE_PILL[resolved.tone],
              TONE_TEXT[resolved.tone]
            )}
          >
            {resolved.direction === "up" ? (
              <TrendingUp size={13} strokeWidth={2.6} />
            ) : resolved.direction === "down" ? (
              <TrendingDown size={13} strokeWidth={2.6} />
            ) : (
              <Minus size={13} strokeWidth={2.6} />
            )}
            {resolved.display}
          </span>
        )}
      </div>

      <p className={cn("relative mt-4 text-[10px] font-bold uppercase tracking-wider", accentStyle.label)}>
        {label}
      </p>
      <p className="relative mt-1 text-xl font-extrabold tracking-tight text-slate-900">
        {value}
      </p>

      <div className="relative mt-3 flex items-end justify-between border-t border-slate-100 pt-2.5">
        <span
          className={cn(
            "flex items-center gap-1 text-[11px] font-medium",
            resolved ? TONE_TEXT[resolved.tone] : "text-slate-500"
          )}
        >
          {resolved &&
            (resolved.direction === "up" ? (
              <TrendingUp size={14} strokeWidth={2.4} />
            ) : resolved.direction === "down" ? (
              <TrendingDown size={14} strokeWidth={2.4} />
            ) : (
              <Minus size={14} strokeWidth={2.4} />
            ))}
          {resolved?.label ?? "vs yesterday"}
        </span>
        {sparkline ? <Sparkline data={sparkline} tone={resolved?.tone ?? "neutral"} /> : null}
      </div>

      {footer && (
        <p className="relative mt-2 text-[11px] font-medium text-slate-500">{footer}</p>
      )}
    </>
  );

  const base = cn(
    "group relative flex w-full cursor-pointer flex-col overflow-hidden rounded-xl border border-slate-200 p-4 text-left",
    "shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_10px_30px_rgba(15,23,42,0.10)]",
    "[&::before]:pointer-events-none [&::before]:absolute [&::before]:inset-x-0 [&::before]:top-0 [&::before]:h-0.5"
  );

  const withAccent = cn(base, "bg-gradient-to-br", accentStyle.bg, "[&::before]:bg-gradient-to-r", accentStyle.top);

  if (href) {
    return (
      <Link href={href} className={cn(withAccent, className)}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={cn(withAccent, className)}>
      {content}
    </button>
  );
}