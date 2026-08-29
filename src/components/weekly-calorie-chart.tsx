"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { WeeklyCaloriesDay } from "@/lib/weekly-summary";

// TICKET-034: bar chart, one bar per day. Daily target shown as a
// reference line for comparison — the ticket flags this as a
// nice-to-have, but it's a couple of lines with Recharts already in
// the mix, so it wasn't worth leaving out.
export function WeeklyCalorieChart({
  days,
  dailyTarget,
}: {
  days: WeeklyCaloriesDay[];
  dailyTarget: number;
}) {
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={days}
          margin={{ top: 8, right: 8, bottom: 0, left: -16 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            className="stroke-neutral-200 dark:stroke-neutral-800"
          />
          <XAxis dataKey="label" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip formatter={(value) => [`${value} kcal`, "Consumed"]} />
          {dailyTarget > 0 && (
            <ReferenceLine
              y={dailyTarget}
              stroke="#dc2626"
              strokeDasharray="4 4"
              label={{
                value: "Target",
                position: "right",
                fontSize: 12,
                fill: "#dc2626",
              }}
            />
          )}
          <Bar dataKey="totalCalories" fill="#059669" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
