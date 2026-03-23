"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Props {
  signupsOverTime: { month: string; count: number }[];
}

export default function RealtimeCharts({ signupsOverTime }: Props) {
  return (
    <div
      className="rounded-2xl p-6"
      style={{ backgroundColor: "#fff", border: "1.5px solid #E8D5F0" }}
    >
      <h3 className="text-sm font-bold mb-4" style={{ color: "#2E2E2E" }}>
        User Signups — Last 6 Months
      </h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={signupsOverTime}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F5EEF8" />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#B8A9D1" }} />
          <YAxis tick={{ fontSize: 11, fill: "#B8A9D1" }} />
          <Tooltip />
          <Bar dataKey="count" fill="#9B6DAE" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
