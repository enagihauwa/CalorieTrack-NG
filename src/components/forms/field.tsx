export const inputClass =
  "rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900";

export function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm font-medium">
      {label}
      {children}
    </label>
  );
}
