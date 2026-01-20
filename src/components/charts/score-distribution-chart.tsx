"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const data = [
  { name: "Viral (80+)", value: 35, color: "#22c55e" },
  { name: "Good (60-79)", value: 40, color: "#c8ff00" },
  { name: "Moderate (40-59)", value: 18, color: "#f59e0b" },
  { name: "Low (<40)", value: 7, color: "#ef4444" },
];

interface ScoreDistributionChartProps {
  className?: string;
}

export function ScoreDistributionChart({ className = "" }: ScoreDistributionChartProps) {
  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <defs>
            {data.map((entry, index) => (
              <linearGradient
                key={`gradient-${index}`}
                id={`pieGradient-${index}`}
                x1="0"
                y1="0"
                x2="1"
                y2="1"
              >
                <stop offset="0%" stopColor={entry.color} stopOpacity={1} />
                <stop offset="100%" stopColor={entry.color} stopOpacity={0.6} />
              </linearGradient>
            ))}
          </defs>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={45}
            outerRadius={75}
            paddingAngle={3}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={`url(#pieGradient-${index})`} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: "rgba(18, 18, 22, 0.95)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: "12px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
            }}
            itemStyle={{ color: "#fff", fontSize: 13 }}
            formatter={(value?: number) => [`${value ?? 0}%`, ""]}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-2 mt-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ background: item.color }}
            />
            <span className="text-xs text-[var(--text-tertiary)]">
              {item.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
