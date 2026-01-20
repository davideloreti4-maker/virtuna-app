"use client";

import { AreaChart, Area, ResponsiveContainer } from "recharts";

interface MiniSparklineProps {
  data: number[];
  color?: string;
  height?: number;
  className?: string;
}

export function MiniSparkline({
  data,
  color = "#7C3AED",
  height = 40,
  className = "",
}: MiniSparklineProps) {
  const chartData = data.map((value, index) => ({ value, index }));

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`sparkGradient-${color}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.3} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={1.5}
            fill={`url(#sparkGradient-${color})`}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
