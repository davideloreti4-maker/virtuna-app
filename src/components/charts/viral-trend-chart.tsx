"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "Mon", score: 65, views: 12000 },
  { name: "Tue", score: 72, views: 18000 },
  { name: "Wed", score: 68, views: 15000 },
  { name: "Thu", score: 85, views: 32000 },
  { name: "Fri", score: 78, views: 28000 },
  { name: "Sat", score: 92, views: 45000 },
  { name: "Sun", score: 88, views: 38000 },
];

interface ViralTrendChartProps {
  className?: string;
}

export function ViralTrendChart({ className = "" }: ViralTrendChartProps) {
  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7C3AED" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#7C3AED" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FF5757" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#FF5757" stopOpacity={0} />
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
          />
          <Area
            type="monotone"
            dataKey="score"
            stroke="#7C3AED"
            strokeWidth={2}
            fill="url(#scoreGradient)"
            name="Viral Score"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
