import { cn } from "@/lib/utils";
import { formatScore } from "@/lib/format";

type Props = {
  value: number | null | undefined;
  className?: string;
};

function bgFor(value: number | null | undefined): string {
  if (value === null || value === undefined)
    return "bg-muted text-muted-foreground border-border";
  if (value >= 80)
    return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30";
  if (value >= 50)
    return "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30";
  return "bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/30";
}

export function ScoreBadge({ value, className }: Props) {
  return (
    <span
      className={cn(
        "inline-flex h-6 min-w-[2.5rem] items-center justify-center rounded-md border px-1.5 text-xs font-semibold tabular-nums",
        bgFor(value),
        className,
      )}
      aria-label={`Score ${formatScore(value)} de 100`}
    >
      {formatScore(value)}
    </span>
  );
}
