import { ReactNode } from "react";

type EmptyStateProps = {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

// Matches DESIGN.md "Empty States": warm illustrative icon, serif headline,
// supportive body copy, optional primary CTA.
function EmptyState({ icon, title, description, action, className = "" }: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-2 py-16 text-center ${className}`}
    >
      {icon && (
        <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-surface-container-high text-3xl text-outline">
          {icon}
        </div>
      )}
      <h3 className="font-display text-xl font-semibold text-ink">{title}</h3>
      {description && (
        <p className="max-w-sm font-body text-sm text-ink-muted">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export default EmptyState;
