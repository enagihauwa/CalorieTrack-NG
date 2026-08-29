"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type WeightPoint = { date: string; weightKg: number };

function formatShortDate(dateStr: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(`${dateStr}T00:00:00.000Z`));
}

// TICKET-039: line chart of logged weight over time, with an optional
// reference line for the goal weight — omitted entirely when unset
// (never inferred from the lose/maintain/gain direction, per this
// ticket's acceptance criterion).
export function WeightChart({
  points,
  goalWeightKg,
}: {
  points: WeightPoint[];
  goalWeightKg: number | null;
}) {
  if (points.length === 0) {
    return (
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        No weight entries logged yet.
      </p>
    );
  }

  const data = points.map((point) => ({
    ...point,
    label: formatShortDate(point.date),
  }));

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 8, right: 8, bottom: 0, left: -16 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            className="stroke-neutral-200 dark:stroke-neutral-800"
          />
          <XAxis dataKey="label" tick={{ fontSize: 12 }} />
          <YAxis
            tick={{ fontSize: 12 }}
            domain={["dataMin - 2", "dataMax + 2"]}
          />
          <Tooltip formatter={(value) => [`${value} kg`, "Weight"]} />
          {goalWeightKg != null && (
            <ReferenceLine
              y={goalWeightKg}
              stroke="#059669"
              strokeDasharray="4 4"
              label={{
                value: "Goal",
                position: "right",
                fontSize: 12,
                fill: "#059669",
              }}
            />
          )}
          <Line
            type="monotone"
            dataKey="weightKg"
            stroke="#2563eb"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
