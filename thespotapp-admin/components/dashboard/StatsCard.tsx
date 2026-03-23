"use client";

import { clsx } from "clsx";

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color?: "purple" | "green" | "blue" | "yellow" | "red" | "pink";
  trend?: { value: number; label: string };
  subtitle?: string;
}

export default function StatsCard({
  title,
  value,
  icon,
  color = "purple",
  trend,
  subtitle,
}: StatsCardProps) {
  const colorMap = {
    purple: {
      icon: "bg-primary-50 text-primary-600",
      border: "border-primary-100",
      trend: "text-primary-600 bg-primary-50",
    },
    green: {
      icon: "bg-emerald-50 text-emerald-600",
      border: "border-emerald-100",
      trend: "text-emerald-600 bg-emerald-50",
    },
    blue: {
      icon: "bg-blue-50 text-blue-600",
      border: "border-blue-100",
      trend: "text-blue-600 bg-blue-50",
    },
    yellow: {
      icon: "bg-amber-50 text-amber-600",
      border: "border-amber-100",
      trend: "text-amber-600 bg-amber-50",
    },
    red: {
      icon: "bg-rose-50 text-rose-600",
      border: "border-rose-100",
      trend: "text-rose-600 bg-rose-50",
    },
    pink: {
      icon: "bg-pink-50 text-pink-600",
      border: "border-pink-100",
      trend: "text-pink-600 bg-pink-50",
    },
  };

  const c = colorMap[color];

  return (
    <div
      className={clsx(
        "bg-white rounded-2xl border shadow-sm p-6 hover:shadow-md transition-all duration-200 animate-fade-in",
        c.border
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider truncate">
            {title}
          </p>
          <p className="text-3xl font-bold text-gray-900 mt-1 tabular-nums">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
          )}
        </div>
        <div
          className={clsx(
            "h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0 ml-3",
            c.icon
          )}
        >
          {icon}
        </div>
      </div>

      {trend !== undefined && (
        <div className="mt-4 flex items-center gap-1.5">
          <span
            className={clsx(
              "inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full",
              trend.value >= 0
                ? "text-emerald-700 bg-emerald-50"
                : "text-red-600 bg-red-50"
            )}
          >
            {trend.value >= 0 ? (
              <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            {Math.abs(trend.value)}%
          </span>
          <span className="text-xs text-gray-400">{trend.label}</span>
        </div>
      )}
    </div>
  );
}
