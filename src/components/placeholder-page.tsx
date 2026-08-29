export function PlaceholderPage({
  title,
  ticket,
}: {
  title: string;
  ticket: string;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-neutral-300 py-24 text-center dark:border-neutral-700">
      <h1 className="text-xl font-semibold">{title}</h1>
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        Not built yet — see <code className="font-mono">{ticket}</code>.
      </p>
    </div>
  );
}
