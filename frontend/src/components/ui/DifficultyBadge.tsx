import type { Difficulty } from "@/types/recipe";

// Matches DESIGN.md "Chips & Dietary Badges": tinted pill, dot + label,
// difficulty color-mapped (sage=easy, amber=medium, terracotta=hard).
const DIFFICULTY_CLASSES: Record<Difficulty, string> = {
  easy: "bg-tertiary-container/20 text-on-tertiary-container",
  medium: "bg-secondary-container/40 text-on-secondary-container",
  hard: "bg-primary-container/20 text-on-primary-fixed-variant",
};

const DOT_CLASSES: Record<Difficulty, string> = {
  easy: "bg-tertiary",
  medium: "bg-secondary",
  hard: "bg-primary",
};

type DifficultyBadgeProps = {
  difficulty: Difficulty;
  className?: string;
};

function DifficultyBadge({ difficulty, className = "" }: DifficultyBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-body text-xs font-semibold uppercase tracking-wide ${DIFFICULTY_CLASSES[difficulty]} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${DOT_CLASSES[difficulty]}`} aria-hidden="true" />
      {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
    </span>
  );
}

export default DifficultyBadge;
