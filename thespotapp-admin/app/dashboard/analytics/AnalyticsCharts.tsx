"use client";

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { ArticleAnalytics } from "@/types";

interface Props {
  viewsData: { date: string; views: number }[];
  stats: ArticleAnalytics[];
}

export default function AnalyticsChartsSection({ viewsData, stats }: Props) {
  const top10 = stats.slice(0, 10);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Views over time */}
      <div
        className="rounded-2xl p-6"
        style={{
          backgroundColor: "#fff",
          border: "1.5px solid #E8D5F0",
        }}
      >
        <h3
          className="text-sm font-bold mb-4"
          style={{ color: "#2E2E2E" }}
        >
          Views — Last 30 Days
        </h3>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={viewsData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F5EEF8" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: "#B8A9D1" }}
              interval="preserveStartEnd"
            />
            <YAxis tick={{ fontSize: 10, fill: "#B8A9D1" }} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="views"
              stroke="#9B6DAE"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Top articles by views */}
      <div
        className="rounded-2xl p-6"
        style={{
          backgroundColor: "#fff",
          border: "1.5px solid #E8D5F0",
        }}
      >
        <h3
          className="text-sm font-bold mb-4"
          style={{ color: "#2E2E2E" }}
        >
          Top 10 Articles by Views
        </h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={top10} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#F5EEF8" />
            <XAxis type="number" tick={{ fontSize: 10, fill: "#B8A9D1" }} />
            <YAxis
              type="category"
              dataKey="title"
              width={120}
              tick={{ fontSize: 9, fill: "#B8A9D1" }}
            />
            <Tooltip />
            <Bar dataKey="viewCount" fill="#C69FD5" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
