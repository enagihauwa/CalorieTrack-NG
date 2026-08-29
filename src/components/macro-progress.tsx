// TICKET-027. Targets come from Profile.proteinTargetG/carbsTargetG/
// fatTargetG (TICKET-013); consumed comes from getDailySummary's totals.
export function MacroProgress({
  consumed,
  targets,
}: {
  consumed: { proteinG: number; carbsG: number; fatG: number };
  targets: { proteinTargetG: number; carbsTargetG: number; fatTargetG: number };
}) {
  return (
    <dl className="grid grid-cols-3 gap-4 text-sm">
      <MacroStat
        label="Protein"
        consumed={consumed.proteinG}
        target={targets.proteinTargetG}
      />
      <MacroStat
        label="Carbohydrates"
        consumed={consumed.carbsG}
        target={targets.carbsTargetG}
      />
      <MacroStat
        label="Fat"
        consumed={consumed.fatG}
        target={targets.fatTargetG}
      />
    </dl>
  );
}

function MacroStat({
  label,
  consumed,
  target,
}: {
  label: string;
  consumed: number;
  target: number;
}) {
  return (
    <div>
      <dt className="font-medium">{label}</dt>
      <dd className="text-neutral-500 dark:text-neutral-400">
        {Math.round(consumed)}g / {Math.round(target)}g
      </dd>
    </div>
  );
}
