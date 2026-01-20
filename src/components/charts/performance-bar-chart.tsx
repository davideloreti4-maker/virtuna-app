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

const data = [
  { name: "Jan", analyses: 12, viral: 4 },
  { name: "Feb", analyses: 18, viral: 7 },
  { name: "Mar", analyses: 15, viral: 5 },
  { name: "Apr", analyses: 22, viral: 9 },
  { name: "May", analyses: 28, viral: 12 },
  { name: "Jun", analyses: 24, viral: 10 },
];

interface PerformanceBarChartProps {
  className?: string;
}

export function PerformanceBarChart({ className = "" }: PerformanceBarChartProps) {
  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          barGap={4}
        >
          <defs>
            <linearGradient id="barGradient1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(255,255,255,0.25)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.05)" />
            </linearGradient>
            <linearGradient id="barGradient2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7C3AED" />
              <stop offset="100%" stopColor="#6D28D9" />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.06)"
            vertical={false}
          />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
          />
          <Tooltip
            contentStyle={{
              background: "rgba(18, 18, 22, 0.95)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: "12px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
            }}
            labelStyle={{ color: "rgba(255,255,255,0.6)", marginBottom: 4 }}
            itemStyle={{ color: "#fff", fontSize: 13 }}
            cursor={{ fill: "rgba(255,255,255,0.05)" }}
          />
          <Bar
            dataKey="analyses"
            fill="url(#barGradient1)"
            radius={[4, 4, 0, 0]}
            name="Total Analyses"
          />
          <Bar
            dataKey="viral"
            fill="url(#barGradient2)"
            radius={[4, 4, 0, 0]}
            name="Viral Hits"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
