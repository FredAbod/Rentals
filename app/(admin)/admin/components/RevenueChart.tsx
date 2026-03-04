"use client";

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function RevenueChart({
  data,
}: {
  data: { date: string; revenue: number; orders: number }[];
}) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-white/40 italic">No revenue data available yet.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#d4af37" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#d4af37" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: "rgba(255,255,255,0.4)" }}
            tickFormatter={(str) => {
              const date = new Date(str);
              return date.toLocaleDateString("en-GB", {
                month: "short",
                day: "numeric",
              });
            }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: "rgba(255,255,255,0.4)" }}
            tickFormatter={(value) => `£${value}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(11, 12, 16, 0.9)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
            }}
            itemStyle={{ color: "#d4af37" }}
            labelFormatter={(label) =>
              new Date(label).toLocaleDateString("en-GB", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })
            }
            formatter={(value: number | undefined) => [
              `£${(value ?? 0).toFixed(2)}`,
              "Revenue",
            ]}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#d4af37"
            fillOpacity={1}
            fill="url(#colorRevenue)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
