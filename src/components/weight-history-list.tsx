import { WeightLogRow, type WeightLogItem } from "./weight-log-row";

// TICKET-038: most recent first.
export function WeightHistoryList({ logs }: { logs: WeightLogItem[] }) {
  if (logs.length === 0) {
    return (
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        No weight entries yet.
      </p>
    );
  }

  const sorted = [...logs].sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <ul className="flex flex-col divide-y divide-neutral-100 text-sm dark:divide-neutral-800">
      {sorted.map((log) => (
        <WeightLogRow key={log.id} log={log} />
      ))}
    </ul>
  );
}
