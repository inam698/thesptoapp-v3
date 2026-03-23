"use client";

import { useQuery } from "@tanstack/react-query";
import { getActivityLog } from "@/lib/firestore";
import Spinner from "@/components/ui/Spinner";

// ── Icons ────────────────────────────────────────────────────────────────────

function ArticleActionIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  );
}
function HealthTipActionIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
    </svg>
  );
}
function UserActionIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  );
}
function AnnouncementActionIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46" />
    </svg>
  );
}
function DefaultActionIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
function EmptyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
    </svg>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatRelative(val: string): string {
  const d = new Date(val);
  if (isNaN(d.getTime())) return "—";
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

type ActionMeta = {
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
  badgeBg: string;
  badgeColor: string;
  label: string;
};

function getActionMeta(action: string): ActionMeta {
  const a = action.toLowerCase();
  if (a.includes("article")) {
    return {
      icon: ArticleActionIcon,
      iconBg: "#F5EEF8",
      iconColor: "#9B6DAE",
      badgeBg: "#F5EEF8",
      badgeColor: "#9B6DAE",
      label: "Article",
    };
  }
  if (a.includes("health") || a.includes("tip")) {
    return {
      icon: HealthTipActionIcon,
      iconBg: "#FFF4ED",
      iconColor: "#E8879C",
      badgeBg: "#FFF4ED",
      badgeColor: "#E8879C",
      label: "Health Tip",
    };
  }
  if (a.includes("user")) {
    return {
      icon: UserActionIcon,
      iconBg: "#FDFDC9",
      iconColor: "#7B6B00",
      badgeBg: "#FDFDC9",
      badgeColor: "#7B6B00",
      label: "User",
    };
  }
  if (a.includes("announcement") || a.includes("notify") || a.includes("push")) {
    return {
      icon: AnnouncementActionIcon,
      iconBg: "#EFF6FF",
      iconColor: "#3B82F6",
      badgeBg: "#EFF6FF",
      badgeColor: "#3B82F6",
      label: "Announcement",
    };
  }
  return {
    icon: DefaultActionIcon,
    iconBg: "#F5EEF8",
    iconColor: "#C69FD5",
    badgeBg: "#F5EEF8",
    badgeColor: "#C69FD5",
    label: "Action",
  };
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function ActivityLogPage() {
  const { data: logs = [], isLoading, error } = useQuery({
    queryKey: ["activity_log"],
    queryFn: getActivityLog,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "#2E2E2E" }}>
          Activity Log
        </h1>
        <p className="text-sm mt-1" style={{ color: "#B8A9D1" }}>
          Recent actions performed by administrators across the dashboard
        </p>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-28">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <div
          className="rounded-2xl p-8 text-center text-sm"
          style={{
            backgroundColor: "#FFF0F3",
            color: "#E8879C",
            border: "1px solid #F2C4CE",
          }}
        >
          Failed to load activity log. Please refresh the page.
        </div>
      ) : logs.length === 0 ? (
        <div
          className="rounded-2xl p-14 text-center flex flex-col items-center gap-3"
          style={{
            backgroundColor: "#F5EEF8",
            border: "1.5px dashed #C69FD5",
          }}
        >
          <EmptyIcon className="h-10 w-10 text-[#C69FD5]" />
          <div>
            <p className="text-sm font-semibold" style={{ color: "#9B6DAE" }}>
              No activity recorded yet
            </p>
            <p className="text-xs mt-1" style={{ color: "#B8A9D1" }}>
              Admin actions like creating articles or managing users will appear here.
            </p>
          </div>
        </div>
      ) : (
        <div
          className="rounded-2xl overflow-hidden"
          style={{ border: "1.5px solid #E8D5F0", backgroundColor: "#fff" }}
        >
          {/* Table header — desktop */}
          <div
            className="hidden sm:grid gap-4 px-5 py-3 text-xs font-bold uppercase tracking-wider"
            style={{
              gridTemplateColumns: "2.5rem 1fr 2fr 1.5fr 7rem",
              backgroundColor: "#F5EEF8",
              color: "#9B6DAE",
              borderBottom: "1px solid #E8D5F0",
            }}
          >
            <div />
            <div>Action</div>
            <div>Detail</div>
            <div>Admin</div>
            <div>When</div>
          </div>

          <div className="divide-y" style={{ borderColor: "#F5EEF8" }}>
            {logs.map((log) => {
              const meta = getActionMeta(log.action);
              const Icon = meta.icon;
              return (
                <div key={log.id}>
                  {/* Desktop row */}
                  <div
                    className="hidden sm:grid gap-4 px-5 py-3.5 items-center transition-colors"
                    style={{ gridTemplateColumns: "2.5rem 1fr 2fr 1.5fr 7rem" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#FDFDC9")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                  >
                    {/* Icon */}
                    <div
                      className="h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: meta.iconBg }}
                    >
                      <span style={{ color: meta.iconColor }}>
                        <Icon className="h-5 w-5" />
                      </span>
                    </div>

                    {/* Action */}
                    <div>
                      <span
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
                        style={{
                          backgroundColor: meta.badgeBg,
                          color: meta.badgeColor,
                        }}
                      >
                        {log.action}
                      </span>
                    </div>

                    {/* Detail */}
                    <div
                      className="text-sm truncate"
                      style={{ color: "#4A4A4A" }}
                      title={log.detail}
                    >
                      {log.detail}
                    </div>

                    {/* Admin email */}
                    <div
                      className="text-xs truncate"
                      style={{ color: "#B8A9D1" }}
                      title={log.adminEmail}
                    >
                      {log.adminEmail}
                    </div>

                    {/* Time */}
                    <div className="text-xs" style={{ color: "#B8A9D1" }}>
                      {formatRelative(log.createdAt)}
                    </div>
                  </div>

                  {/* Mobile card */}
                  <div
                    className="sm:hidden px-4 py-3.5 flex items-start gap-3"
                    style={{ borderBottom: "1px solid #F5EEF8" }}
                  >
                    <div
                      className="h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ backgroundColor: meta.iconBg }}
                    >
                      <span style={{ color: meta.iconColor }}>
                        <Icon className="h-5 w-5" />
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
                          style={{
                            backgroundColor: meta.badgeBg,
                            color: meta.badgeColor,
                          }}
                        >
                          {log.action}
                        </span>
                        <span className="text-xs flex-shrink-0" style={{ color: "#B8A9D1" }}>
                          {formatRelative(log.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm mt-1 leading-snug" style={{ color: "#4A4A4A" }}>
                        {log.detail}
                      </p>
                      <p className="text-xs mt-1 truncate" style={{ color: "#B8A9D1" }}>
                        {log.adminEmail}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div
            className="px-5 py-3 text-xs"
            style={{
              backgroundColor: "#F5EEF8",
              borderTop: "1px solid #E8D5F0",
              color: "#B8A9D1",
            }}
          >
            Showing {logs.length} most recent {logs.length === 1 ? "entry" : "entries"}
          </div>
        </div>
      )}
    </div>
  );
}
