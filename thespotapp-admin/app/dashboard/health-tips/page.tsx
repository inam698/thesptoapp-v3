"use client";

import Link from "next/link";
import HealthTipTable from "@/components/health-tips/HealthTipTable";

function PlusIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}

export default function HealthTipsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#2E2E2E" }}>Health Tips</h1>
          <p className="text-sm mt-1" style={{ color: "#B8A9D1" }}>
            Manage multilingual daily health tips shown in the app
          </p>
        </div>
        <Link href="/dashboard/health-tips/new">
          <button
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #9B6DAE, #C69FD5)" }}
          >
            <PlusIcon />
            New Health Tip
          </button>
        </Link>
      </div>

      <HealthTipTable />
    </div>
  );
}
