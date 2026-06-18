import { cn } from "@/lib/utils";

function scoreClasses(score: number): string {
  if (score >= 80) return "bg-score-good text-black";
  if (score >= 50) return "bg-score-risk text-black";
  return "bg-score-critical text-white";
}

/**
 * Badge de score 0-100 con color por umbral (ver 08-branding/colors.md).
 * score = null → "—" (todavía no evaluado).
 */
export function ScoreBadge({
  score,
  className,
}: {
  score: number | null;
  className?: string;
}) {
  if (score === null) {
    return (
      <span
        className={cn(
          "inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground",
          className,
        )}
      >
        —
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        scoreClasses(score),
        className,
      )}
    >
      {Math.round(score)}
    </span>
  );
}
