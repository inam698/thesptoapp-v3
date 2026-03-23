"use client";

import { useQuery } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import Link from "next/link";
import { getDashboardStats, getContentAnalytics } from "@/lib/firestore";
import { useArticles } from "@/hooks/useArticles";
import StatsCard from "@/components/dashboard/StatsCard";
import Spinner from "@/components/ui/Spinner";
import Badge from "@/components/ui/Badge";

const AnalyticsCharts = dynamic(
  () => import("@/components/dashboard/AnalyticsCharts"),
  { ssr: false, loading: () => <div className="h-64 flex items-center justify-center"><Spinner /></div> }
);

// ── Icons ─────────────────────────────────────────────────────────────────
function DocumentIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
function PencilIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
    </svg>
  );
}
function LightbulbIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
    </svg>
  );
}
function UsersIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  );
}
function PlusIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}
function ArrowRightIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  );
}

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: getDashboardStats,
  });

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ["contentAnalytics"],
    queryFn: getContentAnalytics,
  });

  const { data: articles, isLoading: articlesLoading } = useArticles();

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const recentArticles = (articles ?? []).slice(0, 6);

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">

      {/* ── Page Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-400 mt-0.5">{today}</p>
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center gap-3 flex-wrap">
          <Link
            href="/dashboard/articles/new"
            className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors shadow-sm shadow-primary-200"
          >
            <PlusIcon />
            New Article
          </Link>
          <Link
            href="/dashboard/health-tips/new"
            className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 text-sm font-semibold px-4 py-2 rounded-xl border border-gray-200 transition-colors"
          >
            <PlusIcon />
            New Health Tip
          </Link>
        </div>
      </div>

      {/* ── Stats Cards ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatsCard
          title="Total Articles"
          value={stats?.totalArticles ?? 0}
          icon={<DocumentIcon />}
          color="purple"
          subtitle="All content"
        />
        <StatsCard
          title="Published"
          value={stats?.publishedArticles ?? 0}
          icon={<CheckIcon />}
          color="green"
          subtitle="Live on app"
        />
        <StatsCard
          title="Drafts"
          value={stats?.draftArticles ?? 0}
          icon={<PencilIcon />}
          color="yellow"
          subtitle="In progress"
        />
        <StatsCard
          title="Health Tips"
          value={stats?.totalHealthTips ?? 0}
          icon={<LightbulbIcon />}
          color="blue"
          subtitle="11 languages"
        />
        <StatsCard
          title="App Users"
          value={stats?.totalUsers ?? 0}
          icon={<UsersIcon />}
          color="pink"
          subtitle="Registered"
        />
      </div>

      {/* ── Charts ──────────────────────────────────────────────────── */}
      {!analyticsLoading && analytics && (
        <AnalyticsCharts analytics={analytics} />
      )}
      {analyticsLoading && (
        <div className="h-64 flex items-center justify-center bg-white rounded-2xl border border-gray-100">
          <Spinner />
        </div>
      )}

      {/* ── Bottom Row: Recent Articles + Quick Links ────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent Articles */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Recent Articles</h2>
              <p className="text-xs text-gray-400 mt-0.5">Latest content added</p>
            </div>
            <Link
              href="/dashboard/articles"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-600 hover:text-primary-700 transition-colors"
            >
              View all
              <ArrowRightIcon />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {articlesLoading ? (
              <div className="py-10 flex items-center justify-center">
                <Spinner />
              </div>
            ) : recentArticles.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <div className="h-10 w-10 rounded-xl bg-primary-50 flex items-center justify-center mx-auto mb-3">
                  <DocumentIcon />
                </div>
                <p className="text-sm font-medium text-gray-500">No articles yet</p>
                <p className="text-xs text-gray-400 mt-1">Create your first article to get started.</p>
                <Link
                  href="/dashboard/articles/new"
                  className="inline-flex items-center gap-1.5 mt-4 text-xs font-semibold text-primary-600 hover:underline"
                >
                  <PlusIcon />
                  Create Article
                </Link>
              </div>
            ) : (
              recentArticles.map((article) => (
                <Link
                  key={article.id}
                  href={`/dashboard/articles/${article.id}`}
                  className="px-6 py-3.5 flex items-center justify-between hover:bg-gray-50/80 transition-colors group"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-800 truncate group-hover:text-primary-700 transition-colors">
                      {article.title}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {article.author} &middot;{" "}
                      {article.publishedDate
                        ? new Date(article.publishedDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                        : "No date"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                    <Badge variant={article.isPublished ? "success" : "warning"}>
                      {article.isPublished ? "Published" : "Draft"}
                    </Badge>
                    <ArrowRightIcon />
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Quick Links panel */}
        <div className="space-y-4">
          {/* Content Summary */}
          <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl p-6 text-white shadow-lg shadow-primary-200">
            <h3 className="text-sm font-semibold opacity-80 mb-3">Content Summary</h3>
            <div className="space-y-2.5">
              <div className="flex justify-between items-center text-sm">
                <span className="opacity-80">Published rate</span>
                <span className="font-bold">
                  {stats && stats.totalArticles > 0
                    ? `${Math.round((stats.publishedArticles / stats.totalArticles) * 100)}%`
                    : "—"}
                </span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-1.5">
                <div
                  className="bg-white rounded-full h-1.5 transition-all"
                  style={{
                    width: stats && stats.totalArticles > 0
                      ? `${Math.round((stats.publishedArticles / stats.totalArticles) * 100)}%`
                      : "0%",
                  }}
                />
              </div>
              <div className="flex justify-between items-center text-sm mt-3">
                <span className="opacity-80">Total content</span>
                <span className="font-bold">
                  {(stats?.totalArticles ?? 0) + (stats?.totalHealthTips ?? 0)} items
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="opacity-80">Active users</span>
                <span className="font-bold">{stats?.totalUsers ?? 0}</span>
              </div>
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-50">
              <h3 className="text-sm font-semibold text-gray-900">Quick Links</h3>
            </div>
            <div className="divide-y divide-gray-50">
              {[
                { href: "/dashboard/articles/new", label: "Create Article", icon: <PlusIcon />, color: "text-primary-600" },
                { href: "/dashboard/health-tips/new", label: "Add Health Tip", icon: <PlusIcon />, color: "text-blue-600" },
                { href: "/dashboard/articles", label: "Manage Articles", icon: <ArrowRightIcon />, color: "text-gray-500" },
                { href: "/dashboard/health-tips", label: "Manage Tips", icon: <ArrowRightIcon />, color: "text-gray-500" },
                { href: "/dashboard/users", label: "View Users", icon: <ArrowRightIcon />, color: "text-gray-500" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors group"
                >
                  <span className="text-sm text-gray-700 group-hover:text-gray-900 font-medium">
                    {item.label}
                  </span>
                  <span className={item.color}>{item.icon}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
