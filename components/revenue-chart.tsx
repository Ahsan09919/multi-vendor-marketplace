"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export default function RevenueChart({
  data,
}: {
  data: { date: string; revenue: number; orders: number }[];
}) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} />
          <YAxis
            tick={{ fontSize: 11 }}
            tickFormatter={(v: number) => `$${v}`}
            width={50}
          />
          <Tooltip
            formatter={(value, name) =>
              name === "revenue"
                ? [`$${Number(value).toFixed(2)}`, "Revenue"]
                : [value, "Orders"]
            }
            contentStyle={{ borderRadius: 8 }}
          />
          <Bar dataKey="revenue" fill="#6366f1" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
