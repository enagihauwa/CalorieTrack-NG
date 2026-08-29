"use client";

import { useRouter } from "next/navigation";

function shiftDate(dateStr: string, days: number): string {
  const date = new Date(`${dateStr}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

// TICKET-030: prev/next-day buttons plus a native date picker — either
// alone would satisfy the ticket, both together costs little and covers
// more use cases (quickly stepping back a day vs. jumping to a specific
// one). `max` on the date input plus disabling "Next" on today enforces
// "cannot navigate to a future date"; the History page itself also
// clamps server-side in case that's bypassed (e.g. a hand-edited URL).
export function HistoryDateNav({
  date,
  todayStr,
}: {
  date: string;
  todayStr: string;
}) {
  const router = useRouter();
  const isToday = date === todayStr;

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => router.push(`/history?date=${shiftDate(date, -1)}`)}
        aria-label="Previous day"
        className="rounded-md border border-neutral-300 px-2 py-1.5 text-sm hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
      >
        ←
      </button>
      <input
        type="date"
        value={date}
        max={todayStr}
        onChange={(event) => {
          if (event.target.value) {
            router.push(`/history?date=${event.target.value}`);
          }
        }}
        className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm dark:border-neutral-700 dark:bg-neutral-900"
      />
      <button
        type="button"
        onClick={() => router.push(`/history?date=${shiftDate(date, 1)}`)}
        disabled={isToday}
        aria-label="Next day"
        className="rounded-md border border-neutral-300 px-2 py-1.5 text-sm hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-neutral-700 dark:hover:bg-neutral-800"
      >
        →
      </button>
    </div>
  );
}
