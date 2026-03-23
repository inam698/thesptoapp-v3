"use client";

import { clsx } from "clsx";

interface TabsProps {
  tabs: { key: string; label: string }[];
  activeTab: string;
  onChange: (key: string) => void;
  className?: string;
}

export default function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
  return (
    <div
      className={clsx(
        "flex flex-wrap gap-1 border-b border-gray-200",
        className
      )}
    >
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onChange(tab.key)}
          className={clsx(
            "px-4 py-2 text-sm font-medium rounded-t-lg transition-colors -mb-px",
            activeTab === tab.key
              ? "border-b-2 border-primary-600 text-primary-600 bg-primary-50"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
