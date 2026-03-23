"use client";

import { useArticleAnalytics, useViewsOverTime } from "@/hooks/useAnalytics";
import Spinner from "@/components/ui/Spinner";
import dynamic from "next/dynamic";

const AnalyticsChartsSection = dynamic(() => import("./AnalyticsCharts"), {
  ssr: false,
  loading: () => (
    <div className="h-64 flex items-center justify-center">
      <Spinner />
    </div>
  ),
});

export default function AnalyticsPage() {
  const { data: stats, isLoading: statsLoading } = useArticleAnalytics();
  const { data: viewsData, isLoading: viewsLoading } = useViewsOverTime();

  const totalViews = stats?.reduce((sum, s) => sum + s.viewCount, 0) ?? 0;
  const avgReadTime =
    stats && stats.length > 0
      ? Math.round(
          stats.reduce((sum, s) => sum + s.avgReadTime, 0) / stats.length
        )
      : 0;
  const topArticle = stats?.[0];

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "#2E2E2E" }}>
          Content Analytics
        </h1>
        <p className="text-sm mt-1" style={{ color: "#B8A9D1" }}>
          Track how users engage with your health content
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          className="rounded-2xl p-5"
          style={{
            background: "linear-gradient(135deg, #C69FD5, #9B6DAE)",
            boxShadow: "0 2px 12px rgba(155,109,174,0.2)",
          }}
        >
          <p className="text-sm font-medium text-white/70">Total Views</p>
          <p className="text-3xl font-bold text-white mt-1">{totalViews}</p>
        </div>
        <div
          className="rounded-2xl p-5"
          style={{
            background: "linear-gradient(135deg, #E8879C, #C06080)",
            boxShadow: "0 2px 12px rgba(232,135,156,0.2)",
          }}
        >
          <p className="text-sm font-medium text-white/70">Avg Read Time</p>
          <p className="text-3xl font-bold text-white mt-1">
            {avgReadTime > 0
              ? `${Math.floor(avgReadTime / 60)}m ${avgReadTime % 60}s`
              : "—"}
          </p>
        </div>
        <div
          className="rounded-2xl p-5"
          style={{
            backgroundColor: "#fff",
            border: "1.5px solid #E8D5F0",
          }}
        >
          <p className="text-sm font-medium" style={{ color: "#B8A9D1" }}>
            Most Viewed
          </p>
          <p
            className="text-lg font-bold mt-1 truncate"
            style={{ color: "#2E2E2E" }}
          >
            {topArticle?.title || "—"}
          </p>
          {topArticle && (
            <p className="text-xs mt-1" style={{ color: "#9B6DAE" }}>
              {topArticle.viewCount} views
            </p>
          )}
        </div>
      </div>

      {/* Charts */}
      {!viewsLoading && viewsData && stats && (
        <AnalyticsChartsSection viewsData={viewsData} stats={stats} />
      )}

      {/* Table */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ border: "1.5px solid #E8D5F0", backgroundColor: "#fff" }}
      >
        <div
          className="px-5 py-3 text-xs font-bold uppercase tracking-wider grid gap-3"
          style={{
            gridTemplateColumns: "2fr 1fr 1fr 1fr",
            backgroundColor: "#F5EEF8",
            color: "#9B6DAE",
            borderBottom: "1px solid #E8D5F0",
          }}
        >
          <div>Article</div>
          <div>Category</div>
          <div>Views</div>
          <div>Avg Read Time</div>
        </div>
        <div className="divide-y" style={{ borderColor: "#F5EEF8" }}>
          {(stats ?? []).map((article) => (
            <div
              key={article.articleId}
              className="grid gap-3 px-5 py-3 items-center"
              style={{ gridTemplateColumns: "2fr 1fr 1fr 1fr" }}
            >
              <p
                className="text-sm font-medium truncate"
                style={{ color: "#2E2E2E" }}
              >
                {article.title}
              </p>
              <span
                className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold w-fit"
                style={{ backgroundColor: "#F5EEF8", color: "#9B6DAE" }}
              >
                {article.category || "—"}
              </span>
              <p className="text-sm font-semibold" style={{ color: "#2E2E2E" }}>
                {article.viewCount}
              </p>
              <p className="text-sm" style={{ color: "#B8A9D1" }}>
                {article.avgReadTime > 0
                  ? `${Math.floor(article.avgReadTime / 60)}m ${article.avgReadTime % 60}s`
                  : "—"}
              </p>
            </div>
          ))}
          {(!stats || stats.length === 0) && (
            <div className="px-5 py-8 text-center text-sm" style={{ color: "#B8A9D1" }}>
              No analytics data yet. Views will appear here as users read articles.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
